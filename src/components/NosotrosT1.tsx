import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ClientData } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  data: ClientData;
  paleta: any;
}

// ─── Infinite Marquee — duplicated content for seamless loop ─────────────────
function Marquee({
  text,
  speed = 55,
  reverse = false,
  opacity = 0.025,
}: {
  text: string;
  speed?: number;
  reverse?: boolean;
  opacity?: number;
}) {
  // Duplicate enough times to fill any screen width
  const repeated = Array(6).fill(text).join(' • ');

  return (
    <div className="flex overflow-hidden whitespace-nowrap w-full pointer-events-none select-none">
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
        style={{
          opacity,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          letterSpacing: '-0.03em',
          color: 'white',
        }}
      >
        {/* Doubled so the seam is always off-screen */}
        <span>{repeated}&nbsp;&nbsp;</span>
        <span>{repeated}&nbsp;&nbsp;</span>
      </motion.div>
    </div>
  );
}

// ─── Animated crosshair detail ────────────────────────────────────────────────
function Crosshair({ color }: { color: string }) {
  return (
    <div className="relative w-16 h-16">
      {/* Outer circle — slow spin */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 64 64"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.75"
          strokeDasharray="4 8"
        />
        {/* Cardinal tick marks */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="32" y1="4"
            x2="32" y2="10"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </motion.svg>

      {/* Static inner cross */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64" fill="none">
        <line x1="32" y1="22" x2="32" y2="42" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />
        <line x1="22" y1="32" x2="42" y2="32" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />
      </svg>

      {/* Pulsing center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NosotrosT1({ data, paleta }: Props) {
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef  = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, amount: 0.4 });
  const descInView  = useInView(descRef,  { once: true, amount: 0.15 });

  const accentColor: string = paleta?.colorPrimario ?? '#F59E0B';

  const titleText: string = data?.about?.title    ?? '';
  const subText:   string = data?.about?.subtitle ?? '';

  // Marquee texture — built from data, never hardcoded
  const marqueeText = titleText || subText.split(' ').slice(0, 4).join(' ');

  return (
    <section
      id="nosotros"
      className="relative w-full overflow-hidden bg-[#0A0A0A]"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* ── Top border rule ── */}
      <div className="w-full h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* ══════════════════════════════════════════════════════════════════════
          KINETIC MARQUEE BACKGROUND
          Two rows — opposite directions, different speeds for parallax depth.
          Absolutely positioned, z-0, fully non-interactive.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 flex flex-col justify-between py-12 overflow-hidden pointer-events-none select-none">
        <Marquee text={marqueeText} speed={70}  reverse={false} opacity={0.022} />
        <Marquee text={marqueeText} speed={95}  reverse={true}  opacity={0.015} />
        <Marquee text={marqueeText} speed={80}  reverse={false} opacity={0.018} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY EDITORIAL LAYOUT
          Mobile:  flex-col stacked (sticky disabled)
          Desktop: 12-col asymmetric grid — sticky left title, scrolling right
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-16 lg:py-24"
        initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, bounce: 0.2 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-16 xl:gap-24">

          {/* ── Left column — STICKY TITLE (cols 1–5) ─────────────────────
              Mobile: normal flow
              Desktop: sticky just below navbar, anchored to top-left
          ─────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 w-full">
            <div className="lg:sticky lg:top-28 flex flex-col justify-start items-start w-full">
              <motion.div
                ref={titleRef}
                initial={{ opacity: 0, y: 20 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col justify-start items-start gap-6 mb-10 lg:mb-0 w-full"
              >
                {/* Eyebrow */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-px"
                    style={{ backgroundColor: accentColor }}
                  />
                  <p
                    className="text-[11px] uppercase tracking-[0.28em] font-semibold"
                    style={{ color: accentColor, fontFamily: "'Inter', sans-serif" }}
                  >
                    Nosotros
                  </p>
                </div>

                {/* Massive title - Standardized to H2 tokens */}
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {titleText}
                </h2>
                {/* Crosshair animated detail */}
                <Crosshair color={accentColor} />
              </motion.div>
            </div>
          </div>

          {/* ── Right column — SCROLLING DESCRIPTION (cols 6–12) ──────────
              Editorial format: starts immediately at the top
          ─────────────────────────────────────────────────────────────── */}
          <div
            ref={descRef}
            className="lg:col-span-7 flex flex-col space-y-6 pt-0"
          >
            {/* Thin rule — draws in from left on scroll enter */}
            <motion.div
              className="w-full h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              animate={descInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Lead sentence — white, medium weight */}
            {/* Lead sentence — editorial, clean */}
            <motion.p
              className="text-base md:text-lg leading-relaxed text-neutral-300 font-normal"
              style={{ fontFamily: "'Inter', sans-serif" }}
              initial={{ opacity: 0, y: 18 }}
              animate={descInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {subText || 'Nuestra pasión por la gastronomía se refleja en cada detalle para brindarte una experiencia memorable.'}
            </motion.p>

            {/* 3 Viñetas Limpias y Minimalistas (Sin cajas pesadas ni fondos oscuros) */}
            <div className="flex flex-col divide-y divide-white/[0.08] pt-1">
              {/* Viñeta 1 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={descInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="py-3.5 flex items-start gap-3.5"
              >
                <div className="mt-0.5 shrink-0" style={{ color: accentColor }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Ingredientes Frescos
                  </h3>
                  <p className="text-sm text-neutral-400 mt-0.5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Selección diaria de productores locales y vegetales de estación para máxima calidad.
                  </p>
                </div>
              </motion.div>

              {/* Viñeta 2 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={descInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.28 }}
                className="py-3.5 flex items-start gap-3.5"
              >
                <div className="mt-0.5 shrink-0" style={{ color: accentColor }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343a7.975 7.975 0 012.344 5.657c0 2.122-.843 4.157-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Sabor Único
                  </h3>
                  <p className="text-sm text-neutral-400 mt-0.5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Recetas de autor y técnicas artesanales que despiertan todos tus sentidos.
                  </p>
                </div>
              </motion.div>

              {/* Viñeta 3 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={descInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.36 }}
                className="py-3.5 flex items-start gap-3.5"
              >
                <div className="mt-0.5 shrink-0" style={{ color: accentColor }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Entrega Rápida
                  </h3>
                  <p className="text-sm text-neutral-400 mt-0.5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Empaque térmico de alta calidad para que tu pedido llegue caliente y crujiente.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom accent bar */}
            <motion.div
              className="w-12 h-[2px] mt-2"
              style={{ backgroundColor: accentColor }}
              initial={{ scaleX: 0 }}
              animate={descInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

        </div>
      </motion.div>

      {/* ── Bottom border rule ── */}
      <div className="w-full h-px relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
    </section>
  );
}
