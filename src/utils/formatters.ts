/**
 * Utilidades para formateo de precios e imágenes del catálogo.
 */

/**
 * Normaliza cualquier URL de imagen, soportando enlaces directos,
 * CDN de Airtable, Google Drive o nombres de archivos locales del template.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Detección de enlaces de Google Drive
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    let fileId = '';
    const matchPath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchPath && matchPath[1]) {
      fileId = matchPath[1];
    } else {
      const matchParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchParam && matchParam[1]) {
        fileId = matchParam[1];
      }
    }

    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Si es un nombre de archivo local sin ruta (ej: "burger-completa.webp")
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:')
  ) {
    if (/\.(webp|png|jpe?g|svg|gif|avif)$/i.test(trimmed)) {
      return `/assets-t1/${trimmed}`;
    }
  }

  return trimmed;
}

/**
 * Parsea precios en múltiples formatos numéricos o de texto (ej: "$7.900", "7900", "7.900,00")
 * devolviendo el valor numérico entero limpio.
 */
export function parsePrice(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  const str = String(val).trim();
  if (!str) return 0;

  let clean = str.replace(/[^\d.,]/g, '');
  if (!clean) return 0;

  if (clean.includes('.') && clean.includes(',')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.split(',')[0].replace(/\./g, '');
    } else {
      clean = clean.split('.')[0].replace(/,/g, '');
    }
  } else if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length > 2 || parts[parts.length - 1].length === 3) {
      clean = clean.replace(/\./g, '');
    } else if (parts[parts.length - 1].length <= 2 && parts[0].length <= 3 && Number(parts[0]) < 100) {
      clean = parts[0];
    } else {
      clean = clean.replace(/\./g, '');
    }
  } else if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts.length > 2 || parts[parts.length - 1].length === 3) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = parts[0];
    }
  }

  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Formatea un número como precio en formato argentino (ej: 7900 -> "$7.900").
 */
export function formatPrice(num: number): string {
  if (num <= 0) return '$0';
  return `$${num.toLocaleString('es-AR')}`;
}
