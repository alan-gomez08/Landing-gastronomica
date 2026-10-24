import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ClientData } from '../types';

interface Props {
  data: ClientData;
  paleta: any;
}

export default function LocationT1({ data, paleta }: Props) {
  const accentColor = paleta?.colorPrimario || '#F59E0B';
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);

  // URL para abrir direcciones directamente en Google Maps
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${data.businessName} ${data.location.description || ''}`
  )}`;

  return (
    <section
      id="ubicacion"
      className="w-full py-20 lg:py-28 flex justify-center overflow-hidden bg-[#0A0A0A] border-t border-white/[0.08]"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, bounce: 0.2 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-12 lg:gap-14"
        >
          {/* Columna de Información y Acciones */}
          <div className="flex flex-col justify-center items-start gap-8 w-full lg:max-w-[480px]">
            <div className="flex flex-col gap-4 text-left">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-px" style={{ backgroundColor: accentColor }} />
                <span
                  className="text-[11px] uppercase tracking-[0.28em] font-semibold"
                  style={{ color: accentColor, fontFamily: "'Inter', sans-serif" }}
                >
                  Visitanos
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white whitespace-pre-line"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {data.location.title}
              </h2>

              {/* Body Text / Description */}
              <p
                className="text-base md:text-lg leading-relaxed text-neutral-300 font-normal mt-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {data.location.description}
              </p>
            </div>

            {/* CTAs con el mismo efecto premium que el Hero */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full pt-2">
              {/* Primary CTA: Base blanca con carga líquida en amarillo */}
              <motion.a
                href={`https://wa.me/${data.contact.whatsapp}?text=Hola! Quisiera hacer un pedido para retirar por el local.`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsCtaHovered(true)}
                onMouseLeave={() => setIsCtaHovered(false)}
                className="relative group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-bold text-black overflow-hidden active:scale-95 transition-all duration-300 text-center cursor-pointer shadow-[0_8px_25px_rgba(255,255,255,0.12)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] border border-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {/* Superficie base blanca */}
                <span className="absolute inset-0 bg-white z-0" />

                {/* Carga líquida en amarillo */}
                <motion.span
                  className="absolute inset-0 z-0 origin-left pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCtaHovered ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Destello de luz especular */}
                <motion.span
                  className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                  initial={{ x: '-100%' }}
                  animate={{ x: isCtaHovered ? '120%' : '-100%' }}
                  transition={{ duration: 0.65, ease: 'easeInOut' }}
                />

                <span className="relative z-10 flex items-center gap-3 text-black">
                  <span>{data.location.buttonText}</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </motion.a>

              {/* Secondary CTA: Vidrio esmerilado con barrido plateado */}
              <motion.a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsNavHovered(true)}
                onMouseLeave={() => setIsNavHovered(false)}
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold text-white overflow-hidden backdrop-blur-xl border border-white/20 hover:border-white/50 active:scale-95 transition-all duration-300 text-center cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_25px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_35px_rgba(255,255,255,0.15)]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <motion.span
                  className="absolute inset-0 z-0 origin-left pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.18) 100%)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isNavHovered ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.span
                  className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  initial={{ x: '-100%' }}
                  animate={{ x: isNavHovered ? '120%' : '-100%' }}
                  transition={{ duration: 0.65, ease: 'easeInOut' }}
                />

                <svg className="relative z-10 w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="relative z-10 text-white tracking-wide">Cómo llegar</span>
              </motion.a>
            </div>
          </div>

          {/* Interactive Google Maps Container (Limpio y con Pin Animado "TU LOGO") */}
          <div className="w-full lg:flex-1 h-[380px] md:h-[460px] lg:h-[490px] relative rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 bg-[#121214] group">
            
            {/* Native Dark Mode Google Maps Iframe */}
            <iframe
              src={data.location.mapEmbedUrl}
              className="absolute inset-0 w-full h-full border-0 transition-all duration-300"
              style={{
                filter: 'invert(90%) hue-rotate(180deg) contrast(100%) brightness(88%) saturate(120%)',
              }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de ${data.businessName} en Google Maps`}
            />

            {/* Subtle Vignette & Frame Highlight */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/15 rounded-3xl" />

            {/* Pin Animado Personalizado del Local del Cliente ("TU LOGO") */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[85%] z-20 flex flex-col items-center group cursor-pointer pointer-events-auto"
              title={`Ver ubicación de ${data.businessName} en Google Maps`}
            >
              {/* Cuerpo del Pin con Animación Flotante */}
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
                className="flex flex-col items-center"
              >
                {/* Cápsula de Marca con Logo y Nombre */}
                <div
                  className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.4)] border border-amber-400/60 backdrop-blur-xl transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400"
                  style={{ backgroundColor: '#0D0D10' }}
                >
                  {/* Círculo Emblema para el Logo del Cliente */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] text-black shadow-md shrink-0"
                    style={{
                      backgroundColor: accentColor,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <span>LOGO</span>
                  </div>

                  {/* Texto del Logo y Nombre del Negocio */}
                  <div className="flex flex-col text-left pr-1">
                    <span
                      className="text-xs font-black text-white tracking-wider uppercase leading-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      TU LOGO
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400 leading-tight mt-0.5">
                      {data.businessName}
                    </span>
                  </div>
                </div>

                {/* Flecha puntero inferior */}
                <div
                  className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] -mt-[1px]"
                  style={{ borderTopColor: '#0D0D10' }}
                />
              </motion.div>

              {/* Punto de anclaje con ondas de radar pulsantes */}
              <div className="relative flex items-center justify-center -mt-1 pointer-events-none">
                <span
                  className="absolute w-10 h-10 rounded-full animate-ping opacity-60"
                  style={{ backgroundColor: accentColor }}
                />
                <span
                  className="absolute w-6 h-6 rounded-full opacity-40 animate-pulse"
                  style={{ backgroundColor: accentColor }}
                />
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-black shadow-md z-10"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </a>

          </div>
        </motion.div>
      </div>
    </section>
  );
}