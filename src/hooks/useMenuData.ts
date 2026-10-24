import { useState, useEffect, useCallback } from 'react';
import type {
  MenuData,
  ConfigData,
  ProductData,
  DeliveryZoneData,
  CouponData,
  UseMenuDataReturn,
  AirtableRecord,
  AirtableResponse,
} from '../types/airtable';
import { parsePrice } from '../utils/formatters';

const DEFAULT_BASE_ID = 'appSto9x58z542Pgb';

/**
 * Normaliza y verifica si un valor indica disponibilidad o estado activo.
 */
function checkAvailability(val: any): boolean {
  if (val === true || val === 1) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === 'si' || s === 'sí' || s === '1' || s === 'activo' || s === 'disponible';
  }
  return false;
}

/**
 * Extrae la URL de la primera imagen (attachment de Airtable o texto URL).
 */
function parseFirstPhotoUrl(photoField: any, imageField?: any): { url: string; attachments: any[] } {
  const source = photoField || imageField;
  if (!source) return { url: '', attachments: [] };

  if (Array.isArray(source) && source.length > 0) {
    const validItems = source.filter((item) => item && typeof item.url === 'string');
    return {
      url: validItems[0]?.url || '',
      attachments: validItems,
    };
  }

  if (typeof source === 'string' && source.trim().length > 0) {
    return {
      url: source.trim(),
      attachments: [{ url: source.trim() }],
    };
  }

  return { url: '', attachments: [] };
}

/**
 * Petición GET genérica con fetch nativo y manejo de paginación de Airtable.
 */
async function fetchAirtableRecords(
  tableName: string,
  baseId: string,
  token: string,
  maxRecords?: number
): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined = undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
    url.searchParams.append('pageSize', '100');
    if (maxRecords) {
      url.searchParams.append('maxRecords', String(maxRecords));
    }
    if (offset) {
      url.searchParams.append('offset', offset);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      throw new Error(`Tabla "${tableName}" no encontrada (404)`);
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Error de autenticación (${response.status}): El token VITE_AIRTABLE_TOKEN es inválido o no tiene permisos 'data.records:read' en la Base ${baseId}.`
      );
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(
        errorJson?.error?.message ||
        `Error HTTP ${response.status} (${response.statusText}) al consultar tabla "${tableName}".`
      );
    }

    const data: AirtableResponse = await response.json();
    if (Array.isArray(data.records)) {
      allRecords.push(...data.records);
    }

    if (maxRecords && allRecords.length >= maxRecords) {
      return allRecords.slice(0, maxRecords);
    }

    offset = data.offset;
  } while (offset);

  return allRecords;
}

/**
 * Intenta consultar una tabla probando nombres alternativos (ej: acentos o variantes comunes).
 */
async function fetchTableWithAlternatives(
  tableNames: string[],
  baseId: string,
  token: string,
  maxRecords?: number
): Promise<AirtableRecord[]> {
  let lastError: Error | null = null;

  for (const name of tableNames) {
    try {
      return await fetchAirtableRecords(name, baseId, token, maxRecords);
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('autenticación')) {
        throw err;
      }
    }
  }

  throw lastError || new Error(`No se pudo encontrar ninguna de las tablas: ${tableNames.join(', ')}`);
}

/**
 * 1. Tabla "Configuración": Traer el primer registro (fila 1).
 * Mapear: Nombre del Local, WhatsApp Pedidos, Local Abierto (Booleano),
 * Solo Takeaway (Modo Lluvia) (Booleano), Banner Promocional (String),
 * Alias Bancario (String) y Titular Cuenta (String).
 */
async function fetchConfiguracion(baseId: string, token: string): Promise<ConfigData | null> {
  const records = await fetchTableWithAlternatives(
    ['Configuración', 'Configuracion', 'Config'],
    baseId,
    token,
    1
  );

  if (!records || records.length === 0) return null;

  const fields = records[0].fields || {};

  const nombreLocal = String(
    fields['Nombre del Local'] ||
    fields.Nombre ||
    fields.Local ||
    fields.nombreLocal ||
    ''
  ).trim();

  const whatsappPedidos = String(
    fields['WhatsApp Pedidos'] ||
    fields['Whatsapp Pedidos'] ||
    fields.WhatsApp ||
    fields.whatsapp ||
    ''
  ).trim();

  const localAbierto = checkAvailability(
    fields['Local Abierto'] ?? fields.Abierto ?? fields.localAbierto ?? true
  );

  const soloTakeaway = checkAvailability(
    fields['Solo Takeaway (Modo Lluvia)'] ??
    fields['Solo Takeaway'] ??
    fields['Modo Lluvia'] ??
    fields.soloTakeaway ??
    false
  );

  const bannerPromocional = String(
    fields['Banner Promocional'] ||
    fields.Banner ||
    fields.bannerPromocional ||
    ''
  ).trim();

  const aliasBancario = String(
    fields['Alias Bancario'] ||
    fields['Alias Bancario / CBU'] ||
    fields.Alias ||
    fields.CBU ||
    fields.aliasBancario ||
    ''
  ).trim();

  const titularCuenta = String(
    fields['Titular Cuenta'] ||
    fields['Titular de la Cuenta'] ||
    fields.Titular ||
    fields.titularCuenta ||
    ''
  ).trim();

  const horariosAtencion = String(
    fields['Horarios de Atención'] ||
    fields['Horario de Atención'] ||
    fields['Horarios'] ||
    fields.horarios ||
    'Martes a Domingo: 19:30 a 00:00 hs'
  ).trim();

  return {
    'Nombre del Local': nombreLocal,
    'WhatsApp Pedidos': whatsappPedidos,
    'Local Abierto': localAbierto,
    'Solo Takeaway (Modo Lluvia)': soloTakeaway,
    'Banner Promocional': bannerPromocional,
    'Alias Bancario': aliasBancario,
    'Titular Cuenta': titularCuenta,
    'Horarios de Atención': horariosAtencion,
    // Aliases ergonómicos
    nombreLocal,
    whatsappPedidos,
    localAbierto,
    soloTakeaway,
    bannerPromocional,
    aliasBancario,
    titularCuenta,
    horariosAtencion,
  };
}

/**
 * 2. Tabla "Productos": Traer todos los registros.
 * Mapear: Nombre del Producto, Descripcion, Precio, Categoría (String).
 * Mapear Foto (URL de la primera imagen).
 * Filtrar donde Disponible sea true.
 * Generar array de categoriasUnicas.
 */
async function fetchProductos(
  baseId: string,
  token: string
): Promise<{ productos: ProductData[]; categoriasUnicas: string[] }> {
  const records = await fetchTableWithAlternatives(
    ['Productos', 'productos', 'Menu', 'Menú', 'Carta'],
    baseId,
    token
  );

  const mapped: ProductData[] = records.map((record) => {
    const fields = record.fields || {};

    const nombre = String(
      fields['Nombre del Producto'] ||
      fields.Nombre ||
      fields.Titulo ||
      fields.Producto ||
      ''
    ).trim();

    const descripcion = String(
      fields.Descripcion ||
      fields['Descripción'] ||
      fields.Detalle ||
      fields.Description ||
      ''
    ).trim();

    const categoria = String(
      fields['Categoría'] ||
      fields.Categoria ||
      fields.Category ||
      fields.Rubro ||
      'General'
    ).trim();

    const priceRaw = fields.Precio ?? fields.Price ?? fields.Valor ?? 0;
    const precio = typeof priceRaw === 'number' ? priceRaw : parsePrice(priceRaw);

    const { url: fotoUrl, attachments } = parseFirstPhotoUrl(fields.Foto, fields.Imagen || fields.Image);

    const disponible = checkAvailability(fields.Disponible ?? fields.Activo ?? fields.disponible);

    let badge: string | undefined = undefined;
    if (typeof fields.Badge === 'string' && fields.Badge.trim()) {
      badge = fields.Badge.trim();
    } else if (typeof fields.Etiqueta === 'string' && fields.Etiqueta.trim()) {
      badge = fields.Etiqueta.trim();
    } else if (fields['Más Vendido'] === true || fields['Mas Vendido'] === true) {
      badge = 'Más Vendido';
    } else if (fields.Picante === true) {
      badge = 'Picante';
    } else if (fields.Agotado === true) {
      badge = 'Agotado';
    } else if (fields.Nuevo === true) {
      badge = 'Nuevo';
    }

    return {
      id: record.id,
      'Nombre del Producto': nombre,
      Descripcion: descripcion,
      Precio: precio,
      Categoría: categoria,
      Foto: fotoUrl, // URL de la primera imagen
      Disponible: disponible,
      Badge: badge,
      // Aliases
      nombre,
      descripcion,
      precio,
      categoria,
      foto: fotoUrl,
      badge,
      fotos: attachments,
    };
  });

  // Filtrar estrictamente donde Disponible sea true
  const productosDisponibles = mapped.filter((p) => p.Disponible === true);

  // Generar array de categoriasUnicas
  const categoriasUnicas = Array.from(
    new Set(productosDisponibles.map((p) => p['Categoría']).filter(Boolean))
  );

  return {
    productos: productosDisponibles,
    categoriasUnicas,
  };
}

/**
 * 3. Tabla "Zonas de Envio": Traer registros con Disponible en true.
 * Mapear Nombre de la Zona y Costo.
 */
async function fetchZonasEnvio(baseId: string, token: string): Promise<DeliveryZoneData[]> {
  const records = await fetchTableWithAlternatives(
    ['Zonas de Envio', 'Zonas de Envío', 'Zonas de envio', 'Zonas', 'Delivery', 'Envios'],
    baseId,
    token
  );

  const mapped: DeliveryZoneData[] = records.map((record) => {
    const fields = record.fields || {};

    const nombre = String(
      fields['Nombre de la Zona'] ||
      fields.Nombre ||
      fields.Zona ||
      fields.name ||
      ''
    ).trim();

    const costRaw = fields.Costo ?? fields.Precio ?? fields.Price ?? fields.Valor ?? 0;
    const costo = typeof costRaw === 'number' ? costRaw : parsePrice(costRaw);

    const disponible = checkAvailability(fields.Disponible ?? fields.Activo ?? fields.disponible);

    return {
      id: record.id,
      'Nombre de la Zona': nombre,
      Costo: costo,
      Disponible: disponible,
      // Aliases
      nombre,
      costo,
    };
  });

  // Traer registros con Disponible en true
  return mapped.filter((zone) => zone.Disponible === true);
}

/**
 * 4. Tabla "Cupones" (NUEVA): Traer todos los registros.
 * Filtrar estrictamente los que tengan el campo Activo en true.
 * Mapear los campos: Codigo (String) y Descuento Porcentaje (Number).
 */
async function fetchCupones(baseId: string, token: string): Promise<CouponData[]> {
  const records = await fetchTableWithAlternatives(
    ['Cupones', 'cupones', 'Coupons', 'Descuentos'],
    baseId,
    token
  );

  // Filtrar estrictamente los que tengan el campo Activo en true
  const activeRecords = records.filter((record) => {
    const fields = record.fields || {};
    return checkAvailability(fields.Activo);
  });

  // Mapear los campos: Codigo (String) y Descuento Porcentaje (Number)
  return activeRecords.map((record) => {
    const fields = record.fields || {};

    const codigo = String(
      fields.Codigo ||
      fields['Código'] ||
      fields.Code ||
      fields.codigo ||
      ''
    ).trim();

    const descRaw =
      fields['Descuento Porcentaje'] ??
      fields['Descuento'] ??
      fields.Porcentaje ??
      fields.DescuentoPorcentaje ??
      0;
    const descuentoPorcentaje =
      typeof descRaw === 'number' ? descRaw : parseFloat(descRaw) || 0;

    return {
      id: record.id,
      Codigo: codigo,
      'Descuento Porcentaje': descuentoPorcentaje,
      Activo: true,
      // Aliases
      codigo,
      descuentoPorcentaje,
      activo: true,
    };
  });
}

/**
 * Custom Hook useMenuData:
 * Consume la API REST de Airtable mediante fetch nativo, leyendo credenciales de import.meta.env.
 * Ejecuta las 4 peticiones en paralelo con Promise.all.
 * Expone los estados: data (con las 4 entidades estructuradas), loading y error.
 */
export function useMenuData(): UseMenuDataReturn {
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = import.meta.env.VITE_AIRTABLE_TOKEN;
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || DEFAULT_BASE_ID;

    if (!token || token.trim() === '' || token.includes('tu_token_aqui')) {
      setError(
        'Falta configurar tu token VITE_AIRTABLE_TOKEN en el archivo .env. Después de agregarlo, recuerda reiniciar el servidor (Ctrl+C y npm run dev).'
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ejecución de las 4 peticiones en paralelo mediante Promise.all
      const [configuracion, productosResult, zonasEnvio, cupones] = await Promise.all([
        fetchConfiguracion(baseId, token),
        fetchProductos(baseId, token),
        fetchZonasEnvio(baseId, token),
        fetchCupones(baseId, token),
      ]);

      const structuredData: MenuData = {
        configuracion,
        productos: productosResult.productos,
        zonasEnvio,
        cupones,
        categoriasUnicas: productosResult.categoriasUnicas,

        // Aliases en inglés para ergonomía y compatibilidad
        config: configuracion,
        products: productosResult.productos,
        deliveryZones: zonasEnvio,
        coupons: cupones,
        categories: productosResult.categoriasUnicas,
      };

      setData(structuredData);
    } catch (err: any) {
      console.error('[useMenuData] Error al sincronizar con Airtable:', err);
      setError(err?.message || 'Error desconocido al consultar los datos desde Airtable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,

    // Atajos directos a las 4 entidades estructuradas
    configuracion: data?.configuracion ?? null,
    productos: data?.productos ?? [],
    zonasEnvio: data?.zonasEnvio ?? [],
    cupones: data?.cupones ?? [],
    categoriasUnicas: data?.categoriasUnicas ?? [],

    // Aliases
    config: data?.configuracion ?? null,
    products: data?.productos ?? [],
    deliveryZones: data?.zonasEnvio ?? [],
    coupons: data?.cupones ?? [],
    categories: data?.categoriasUnicas ?? [],
    isLoading: loading,
  };
}

export default useMenuData;
