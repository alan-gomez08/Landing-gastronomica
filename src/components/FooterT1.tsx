import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClientData, DeliveryZone } from '../types';
import { formatPrice } from '../utils/formatters';

interface Props {
  data: ClientData;
  paleta?: any;
}

type ModalType = 'terms' | 'privacy' | 'zones' | null;

export default function FooterT1({ data, paleta }: Props) {
  const currentYear = new Date().getFullYear();
  const accentColor = paleta?.colorPrimario || '#F59E0B';
  const whatsapp = data?.contact?.whatsapp || '';
  const businessName = data?.businessName || 'Tu Local';
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Bloqueo de scroll cuando el modal está abierto
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeModal]);

  // Normalización de zonas de entrega
  const zones: DeliveryZone[] = (data?.config?.deliveryZones || []).map((z: any) => {
    if (typeof z === 'string') return { name: z, price: 0 };
    return { name: z.name, price: Number(z.price) || 0 };
  });

  return (
    <footer className="w-full flex justify-center bg-[#070708] border-t border-white/[0.08] text-neutral-300 relative z-20">
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-14 lg:py-18 flex flex-col gap-12">

        {/* ── Grid Principal del Footer Gastronómico (4 Columnas) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-left">

          {/* Columna 1: Marca & Redes */}
          <div className="flex flex-col items-start gap-4">
            <a
              href="#inicio"
              className="text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {businessName}
            </a>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
              Gastronomía de autor con materias primas de productores locales y elaboración artesanal al momento.
            </p>

            {/* Redes Sociales - Siluetas limpias sin círculos */}
            <div className="flex items-center gap-4 pt-1 text-neutral-400">
              {data?.contact?.instagram && (
                <a
                  href={`https://instagram.com/${data.contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.20 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
              {data?.contact?.facebook && (
                <a
                  href={data.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Columna 2: Contacto y Operación */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-neutral-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Contacto &amp; Operación
            </span>
            <div className="flex flex-col gap-2.5 text-xs text-neutral-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              {/* Dirección Física */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName} ${data?.location?.description || ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-white transition-colors group cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Av. de Mayo 1234, Buenos Aires <span className="text-[11px] text-neutral-400 block group-hover:text-amber-400 transition-colors">Ver en Google Maps</span></span>
              </a>

              {/* WhatsApp */}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors group cursor-pointer"
                >
                  <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="font-medium text-neutral-300 group-hover:text-white transition-colors">+{whatsapp}</span>
                </a>
              )}

              {/* Horarios Operativos - Separados limpiamente con espaciado */}
              <div className="mt-3 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider font-medium text-neutral-400">
                  Horarios de Atención
                </span>
                <span className="text-neutral-300 font-medium">Martes a Domingo: 19:30 a 00:00 hs</span>
                <span className="text-neutral-500">Lunes: Cerrado</span>
                <p className="text-[11px] text-neutral-500 mt-0.5 italic leading-tight">
                  * Fuera de este horario los pedidos se procesan en la siguiente apertura.
                </p>
              </div>
            </div>
          </div>

          {/* Columna 3: Enlaces Útiles */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-neutral-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Enlaces Útiles
            </span>
            <div className="flex flex-col gap-2.5 text-xs text-neutral-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              <a href="#menu" className="hover:text-white transition-colors">Menú Digital</a>
              <button
                type="button"
                onClick={() => setActiveModal('zones')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Zonas y Costos de Envío
              </button>
              <a href="#nosotros" className="hover:text-white transition-colors">Nuestra Cocina</a>
              <a href="#ubicacion" className="hover:text-white transition-colors">¿Dónde Encontrarnos?</a>
              <a href="#resenas" className="hover:text-white transition-colors">Opiniones de Clientes</a>
            </div>
          </div>

          {/* Columna 4: Legales & Protección al Consumidor */}
          <div className="flex flex-col items-start gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-neutral-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Legales &amp; Consumidor
            </span>
            <div className="flex flex-col gap-2.5 text-xs text-neutral-300 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Términos y Condiciones de Venta
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Políticas de Privacidad
              </button>

              {/* Enlace Oficial a Defensa del Consumidor de Argentina */}
              <a
                href="https://www.argentina.gob.ar/defensadelconsumidor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors pt-2 group cursor-pointer"
                title="Sitio oficial de Defensa de las y los Consumidores (Ley 24.240)"
              >
                <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-[11px] leading-tight font-medium">
                  Defensa del Consumidor Argentina (Ley 24.240)
                </span>
              </a>
            </div>
          </div>

        </div>

        {/* ── Aviso Legal de Alérgenos (Discreto, texto 12px en tono apagado) ── */}
        <div className="pt-2">
          <p className="text-[12px] leading-relaxed text-neutral-500 text-left" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="text-neutral-400 font-medium">Información sobre alérgenos:</span> Nuestros alimentos se preparan en cocinas que manipulan gluten, lácteos, frutos secos, huevos y otros alérgenos. No podemos garantizar la ausencia total de contaminación cruzada. Si tenés una alergia severa o condición celíaca, consultanos antes de confirmar tu pedido.
          </p>
        </div>

        {/* ── Barra Inferior de Derechos & Créditos ── */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <div>
            © {currentYear} <span className="text-neutral-300 font-semibold">{businessName}</span>. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Desarrollado por</span>
            <span className="text-white font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Menú Inteligente
            </span>
          </div>
        </div>

      </div>

      {/* ── MODALES LEGALES Y TARIFARIO ── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop con Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Contenedor del Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#111113] border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header del Modal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#161619]">
                <h3 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {activeModal === 'terms' && 'Términos y Condiciones de Venta'}
                  {activeModal === 'privacy' && 'Políticas de Privacidad'}
                  {activeModal === 'zones' && 'Zonas y Costos de Envío'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>

              {/* Contenido Scrolleable */}
              <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                
                {/* ── CONTENIDO: TÉRMINOS Y CONDICIONES ── */}
                {activeModal === 'terms' && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        1. Bienes Perecederos y Derecho de Revocación
                      </h4>
                      <p className="text-neutral-400">
                        De conformidad con el artículo 1116 del Código Civil y Comercial de la Nación y la Ley N° 24.240 de Defensa del Consumidor, los productos alimenticios elaborados al momento constituyen bienes perecederos y personalizados. En consecuencia, <strong>una vez que el pedido ingresa a cocina o es despachado para entrega, no existe derecho de cancelación, revocación ni reembolso</strong>. Esta disposición anula la aplicación del &quot;botón de arrepentimiento&quot; estándar del comercio electrónico.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        2. Tiempos de Demora y Fuerza Mayor
                      </h4>
                      <p className="text-neutral-400">
                        Los tiempos informados (por ejemplo, &quot;45 a 60 minutos&quot;) revisten carácter estrictamente estimativo y están sujetos al volumen de demanda, condiciones climáticas y disponibilidad operativa del personal de cadetería. El establecimiento no se responsabiliza por retrasos derivados de caso fortuito o fuerza mayor ajenos a su control.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        3. Confirmación de Precios y Perfeccionamiento del Contrato
                      </h4>
                      <p className="text-neutral-400">
                        La exhibición de productos y precios en el presente catálogo web constituye una propuesta informativa. El contrato de compraventa y el compromiso de entrega se perfeccionan únicamente cuando el local valida y confirma el pedido, la disponibilidad de stock y el costo final total a través de WhatsApp.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        4. Disclaimer de Alérgenos
                      </h4>
                      <p className="text-neutral-400">
                        Nuestros alimentos se preparan en cocinas que manipulan gluten, lácteos, frutos secos, soja y otros alérgenos. No podemos garantizar la ausencia de contaminación cruzada. Si tenés una alergia severa o condición celíaca, consultanos previamente antes de confirmar tu pedido.
                      </p>
                    </div>
                  </>
                )}

                {/* ── CONTENIDO: POLÍTICAS DE PRIVACIDAD ── */}
                {activeModal === 'privacy' && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        1. Uso Estricto de Datos Personales
                      </h4>
                      <p className="text-neutral-400">
                        Los datos ingresados voluntariamente por el usuario (nombre, número telefónico y domicilio) se utilizan única y exclusivamente para la logística del envío, la correcta facturación y la comunicación directa sobre el estado del pedido. En ningún caso serán vendidos, cedidos ni compartidos con terceros con fines comerciales ni publicitarios.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        2. Comunicación Segura vía WhatsApp
                      </h4>
                      <p className="text-neutral-400">
                        La confirmación de pedidos, el envío de comprobantes y la coordinación de la entrega se canalizan a través de WhatsApp (Meta Platforms Inc.), quedando amparadas bajo los protocolos de encriptación de extremo a extremo y las políticas de privacidad y seguridad de dicha plataforma.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        3. Derechos del Titular (Ley N° 25.326)
                      </h4>
                      <p className="text-neutral-400">
                        En cumplimiento de la Ley de Protección de los Datos Personales de la República Argentina, el titular de los datos tiene derecho a solicitar el acceso, rectificación o eliminación de su información de nuestra base operativa contactándose por nuestros canales oficiales.
                      </p>
                    </div>
                  </>
                )}

                {/* ── CONTENIDO: ZONAS Y COSTOS DE ENVÍO ── */}
                {activeModal === 'zones' && (
                  <div className="space-y-4">
                    <p className="text-neutral-400 text-xs sm:text-sm">
                      Tarifas vigentes de entrega a domicilio según tu localidad o radio de reparto:
                    </p>
                    <div className="flex flex-col divide-y divide-white/[0.08] border border-white/[0.08] rounded-2xl bg-white/[0.02] overflow-hidden">
                      {zones.length > 0 ? (
                        zones.map((z, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 text-sm">
                            <span className="font-semibold text-white">{z.name}</span>
                            <span className="font-bold text-amber-400">
                              {z.price > 0 ? formatPrice(z.price) : 'Envío Gratis'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-neutral-500">
                          Consultar radios y costos de envío por WhatsApp.
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 italic">
                      * El costo de entrega se revalida al coordinar el pedido por WhatsApp de acuerdo a la dirección exacta ingresada.
                    </p>
                  </div>
                )}

              </div>

              {/* Footer del Modal */}
              <div className="px-6 py-4 border-t border-white/[0.08] bg-[#161619] flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-full font-bold text-xs text-black cursor-pointer active:scale-95 transition-transform"
                  style={{ backgroundColor: accentColor, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}