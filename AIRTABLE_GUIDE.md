# Guía de Conexión y Gestión del Menú con Airtable (Headless CMS)

Esta aplicación se conecta directamente a la API REST de **Airtable** mediante el Custom Hook `useMenuData` con `fetch` nativo para gestionar la configuración del negocio, el catálogo del menú digital, las tarifas de envío y los cupones de descuento.

---

## 🔑 1. Configuración de Credenciales

En la raíz del proyecto, en tu archivo `.env`:

```env
VITE_AIRTABLE_TOKEN=pat_tu_token_aqui
VITE_AIRTABLE_BASE_ID=appSto9x58z542Pgb
```

> **¿Cómo generar el Token (PAT)?**
> 1. Ve a [Airtable Create Token](https://airtable.com/create/tokens).
> 2. Haz clic en **Create new token**.
> 3. En **Scopes**, agrega: `data.records:read`.
> 4. En **Access**, selecciona tu base (`appSto9x58z542Pgb`) o *All current and future bases*.
> 5. Copia el token generado y pégalo en `VITE_AIRTABLE_TOKEN`.

---

## 🗄️ 2. Estructura de las 4 Tablas en Airtable

### Tabla 1: `Configuración` (Fila 1)
Trae el primer registro de la tabla para definir parámetros generales del comercio:
- **Nombre del Local** (Single line text / String)
- **WhatsApp Pedidos** (Single line text / Phone / String)
- **Local Abierto** (Checkbox / Booleano)
- **Solo Takeaway (Modo Lluvia)** (Checkbox / Booleano)
- **Banner Promocional** (Single line text / String)
- **Alias Bancario** (Single line text / String)
- **Titular Cuenta** (Single line text / String)

### Tabla 2: `Productos`
- **Nombre del Producto** (Single line text / String)
- **Descripcion** (Long text / String)
- **Precio** (Number)
- **Categoría** (Single line text / Single select)
- **Foto** (Attachment / Imagen) -> Mapeado a la URL directa de la primera imagen.
- **Disponible** (Checkbox / Booleano) -> Solo registros con `Disponible === true`.
- Genera el array `categoriasUnicas`.

### Tabla 3: `Zonas de Envio`
- **Nombre de la Zona** (Single line text / String)
- **Costo** (Number)
- **Disponible** (Checkbox / Booleano) -> Solo registros con `Disponible === true`.

### Tabla 4: `Cupones` (NUEVA)
- **Codigo** (Single line text / String)
- **Descuento Porcentaje** (Number)
- **Activo** (Checkbox / Booleano) -> Filtro estricto donde `Activo === true`.

---

## ⚡ 3. Uso del Custom Hook `useMenuData`

El hook realiza las 4 peticiones en paralelo con `Promise.all`:

```tsx
import { useMenuData } from './hooks/useMenuData';

function MiComponente() {
  const { data, loading, error, refetch } = useMenuData();

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

  const { configuracion, productos, zonasEnvio, cupones, categoriasUnicas } = data!;

  return (
    <div>
      <h1>{configuracion?.['Nombre del Local']}</h1>
      <p>Cupones disponibles: {cupones.length}</p>
      {/* ... */}
    </div>
  );
}
```
