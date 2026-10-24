import React from 'react';
import { useMenuData } from '../hooks/useMenuData';

/**
 * Componente de ejemplo que demuestra el uso del hook useMenuData
 * para renderizar las 4 entidades sincronizadas desde Airtable:
 * Configuración, Productos, Zonas de Envío y Cupones.
 */
export const AirtableExample: React.FC = () => {
  const { data, loading, error, refetch } = useMenuData();

  if (loading) {
    return (
      <div className="p-8 text-center text-white">
        <p className="text-lg animate-pulse text-amber-400">
          Cargando configuración, catálogo, zonas y cupones desde Airtable...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-4 bg-red-950/80 border border-red-500 rounded-lg text-red-200">
        <h3 className="font-bold text-lg mb-2">Error al sincronizar con Airtable</h3>
        <p>{error}</p>
        <div className="mt-4 flex gap-4 items-center">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded text-sm font-semibold transition"
          >
            Reintentar
          </button>
          <span className="text-xs text-red-400">
            Verifica tus credenciales en el archivo <code>.env</code>.
          </span>
        </div>
      </div>
    );
  }

  const { configuracion, productos, zonasEnvio, cupones } = data || {
    configuracion: null,
    productos: [],
    zonasEnvio: [],
    cupones: [],
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white space-y-10">
      <header className="border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-extrabold text-amber-400">
          {configuracion?.['Nombre del Local'] || 'Menú Digital (Headless CMS)'}
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Sincronizado en tiempo real mediante el custom hook <code className="text-amber-300">useMenuData</code>.
        </p>

        {configuracion && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div>
              <span className="text-neutral-500 block">WhatsApp Pedidos</span>
              <span className="font-semibold text-neutral-200">
                {configuracion['WhatsApp Pedidos'] || 'No especificado'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Estado del Local</span>
              <span className={`font-semibold ${configuracion['Local Abierto'] ? 'text-emerald-400' : 'text-red-400'}`}>
                {configuracion['Local Abierto'] ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Solo Takeaway</span>
              <span className="font-semibold text-neutral-200">
                {configuracion['Solo Takeaway (Modo Lluvia)'] ? 'Sí (Modo Lluvia)' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block">Banner</span>
              <span className="font-semibold text-amber-300">
                {configuracion['Banner Promocional'] || 'Ninguno'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Sección Cupones Activos */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
          <span>Cupones de Descuento Activos</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            {cupones.length} activos
          </span>
        </h2>
        {cupones.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay cupones activos actualmente en Airtable.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cupones.map((c) => (
              <div
                key={c.id}
                className="bg-neutral-900 border border-indigo-500/30 p-3.5 rounded-xl flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="font-mono text-base font-bold text-indigo-400 tracking-wider">
                    {c.Codigo}
                  </span>
                  <span className="block text-xs text-neutral-400">Cupón Activo</span>
                </div>
                <span className="text-emerald-400 text-lg font-extrabold">
                  {c['Descuento Porcentaje']}% OFF
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección de Productos Disponibles */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
          <span>Productos Disponibles</span>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
            {productos.length} productos
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productos.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4 items-start shadow-md hover:border-amber-500/40 transition-colors"
            >
              {item.Foto && (
                <img
                  src={item.Foto}
                  alt={item['Nombre del Producto']}
                  className="w-20 h-20 rounded-lg object-cover bg-neutral-800 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-neutral-100">{item['Nombre del Producto']}</h3>
                  <span className="font-bold text-amber-400">
                    ${item.Precio.toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-xs text-amber-500/80 uppercase font-semibold mt-0.5">
                  {item.Categoría}
                </p>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{item.Descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Zonas de Envío Disponibles */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
          <span>Zonas de Envío Disponibles</span>
          <span className="text-xs bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full border border-neutral-700">
            {zonasEnvio.length} zonas
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {zonasEnvio.map((zone) => (
            <div
              key={zone.id}
              className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg flex justify-between items-center"
            >
              <span className="font-medium text-neutral-200">{zone['Nombre de la Zona']}</span>
              <span className="text-emerald-400 font-semibold">
                {zone.Costo === 0 ? 'Gratis' : `$${zone.Costo.toLocaleString('es-AR')}`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AirtableExample;
