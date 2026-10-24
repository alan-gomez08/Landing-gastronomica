/**
 * Tipos estrictos para la integración con Airtable API (Headless CMS)
 */

export interface AirtablePhotoItem {
  id?: string;
  url: string;
  filename?: string;
  size?: number;
  type?: string;
  thumbnails?: {
    small?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    full?: { url: string; width: number; height: number };
  };
  [key: string]: any;
}

/**
 * Tabla "Configuración" (Fila 1)
 */
export interface ConfigData {
  'Nombre del Local': string;
  'WhatsApp Pedidos': string;
  'Local Abierto': boolean;
  'Solo Takeaway (Modo Lluvia)': boolean;
  'Banner Promocional': string;
  'Alias Bancario': string;
  'Titular Cuenta': string;
  'Horarios de Atención'?: string;

  // Propiedades camelCase para ergonomía de desarrollo
  nombreLocal: string;
  whatsappPedidos: string;
  localAbierto: boolean;
  soloTakeaway: boolean;
  bannerPromocional: string;
  aliasBancario: string;
  titularCuenta: string;
  horariosAtencion?: string;
}

/**
 * Tabla "Productos"
 */
export interface ProductData {
  id: string;
  'Nombre del Producto': string;
  Descripcion: string;
  Precio: number;
  Categoría: string;
  Foto: string; // URL de la primera imagen
  Disponible: boolean;
  Badge?: string;

  // Aliases ergonómicos y retrocompatibilidad
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  foto: string;
  badge?: string;
  fotos?: AirtablePhotoItem[];
}

/**
 * Tabla "Zonas de Envio"
 */
export interface DeliveryZoneData {
  id: string;
  'Nombre de la Zona': string;
  Costo: number;
  Disponible: boolean;

  // Aliases ergonómicos
  nombre: string;
  costo: number;
}

/**
 * Tabla "Cupones"
 */
export interface CouponData {
  id: string;
  Codigo: string;
  'Descuento Porcentaje': number;
  Activo: boolean;

  // Aliases ergonómicos
  codigo: string;
  descuentoPorcentaje: number;
  activo: boolean;
}

/**
 * Estructura combinada que agrupa las 4 entidades sincronizadas desde Airtable
 */
export interface MenuData {
  configuracion: ConfigData | null;
  productos: ProductData[];
  zonasEnvio: DeliveryZoneData[];
  cupones: CouponData[];
  categoriasUnicas: string[];

  // Aliases en inglés para retrocompatibilidad y flexibilidad
  config: ConfigData | null;
  products: ProductData[];
  deliveryZones: DeliveryZoneData[];
  coupons: CouponData[];
  categories: string[];
}

/**
 * Estado y métodos expuestos por el hook useMenuData
 */
export interface UseMenuDataReturn {
  data: MenuData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  // Atajos directos a las 4 entidades
  configuracion: ConfigData | null;
  productos: ProductData[];
  zonasEnvio: DeliveryZoneData[];
  cupones: CouponData[];
  categoriasUnicas: string[];

  // Aliases en inglés
  config: ConfigData | null;
  products: ProductData[];
  deliveryZones: DeliveryZoneData[];
  coupons: CouponData[];
  categories: string[];
  isLoading: boolean;
}

// Aliases para retrocompatibilidad con código existente
export type Product = ProductData;
export type DeliveryZone = DeliveryZoneData;

// Estructura de respuesta sin procesar de Airtable
export interface AirtableRecord<T = Record<string, any>> {
  id: string;
  createdTime?: string;
  fields: T;
}

export interface AirtableResponse<T = Record<string, any>> {
  records: AirtableRecord<T>[];
  offset?: string;
}
