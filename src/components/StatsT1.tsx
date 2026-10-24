import { useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatItem {
  value: string;
  label: string;
}

interface StatsT1Props {
  data: {
    stats?: { title?: string; items?: StatItem[] };
    events?: { title?: string; description?: string; buttonText?: string };
    contact?: { whatsapp?: string };
  };
  paleta: {
    fondoPrincipal?: string;
    colorPrimario?: string;
  };
}

// ─── Animated Counter — spring-driven, runs once on viewport enter ────────────
function parseStatValue(raw: string): { num: number; suffix: string } {
  const m = raw.match(/^([\d.]+)(.*)/);
  return { num: m ? parseFloat(m[1]) : 0, suffix: m ? m[2].trim() : '' };
}

function AnimatedNumber({ raw, inView }: { raw: string; inView: boolean }) {
  const { num, suffix } = parseStatValue(raw);
  const spring = useSpring(0, { stiffness: 55, damping: 22, mass: 0.9 });
  const display = useTransform(spring, (v) =>
    `${Number.isInteger(num) ? Math.round(v) : v.toFixed(1)}${suffix}`
  );
  useEffect(() => { if (inView) spring.set(num); }, [inView, num, spring]);
  return <motion.span>{display}</motion.span>;
}

// ─── Animated grid line — draws itself in on viewport enter ──────────────────
function GridLine({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <motion.div
      ref={ref}
      className="w-full h-px"
      style={{ backgroundColor: 'rgba(255,255,255,0.07)', transformOrigin: 'left center' }}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

// ─── Premium Pill CTA Button (Unified Design System) ─────────────────────────
function PillCTA({
  href,
  label,
}: {
  href: string;
  label: string;
  accentColor?: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-medium bg-white text-black hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl w-full sm:w-auto justify-center"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* WhatsApp icon */}
      <svg
        className="w-4 h-4 shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>

      <span>{label}</span>

      {/* Arrow */}
      <svg
        className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </motion.a>
  );
}

// ─── Stat Cell — hooks must live in a named component, not inside .map() ──────
function StatCell({
  stat,
  index,
  accentColor,
}: {
  stat: StatItem;
  index: number;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className={`relative flex flex-col justify-between px-5 sm:px-6 lg:px-7 py-8 lg:py-12 ${
        index % 2 !== 0 ? 'border-l border-white/[0.07]' : ''
      } ${
        index >= 2 ? 'border-t border-white/[0.07] lg:border-t-0' : ''
      }`}
    >
      {/* Animated vertical divider (desktop — all 4 cols) */}
      {index > 0 && (
        <motion.div
          className="hidden lg:block absolute left-0 top-0 bottom-0 w-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', transformOrigin: 'top center' }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.0, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Accent top strip — draws left to right */}
      <motion.div
        className="absolute top-0 left-5 sm:left-6 lg:left-7 h-[2px]"
        style={{
          backgroundColor: accentColor,
          transformOrigin: 'left center',
          width: '38%',
        }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.65, delay: 0.12 + 0.07 * index, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Massive number — overflow:hidden slide-up mask */}
      <div className="overflow-hidden mt-4 pr-1">
        <motion.div
          className="font-bold leading-none tracking-tight whitespace-nowrap"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.4rem, 4.2vw, 4.5rem)',
            background: 'linear-gradient(150deg, #ffffff 25%, #555555 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ y: '108%' }}
          animate={inView ? { y: 0 } : {}}
          transition={{
            duration: 0.78,
            delay: 0.08 + 0.07 * index,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <AnimatedNumber raw={stat.value} inView={inView} />
        </motion.div>
      </div>

      {/* High-contrast, impactful explanatory label */}
      <motion.p
        className="text-base font-bold text-white tracking-normal mt-3.5 leading-snug"
        style={{ fontFamily: "'Inter', sans-serif" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 + 0.07 * index }}
      >
        {stat.label}
      </motion.p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StatsT1({ data, paleta }: StatsT1Props) {
  // All content sourced from props — zero hardcoded strings
  const stats: StatItem[] = data?.stats?.items ?? [];
  const statsTitle: string = data?.stats?.title ?? '';
  const eventsTitle: string = data?.events?.title ?? '';
  const eventsDescription: string = data?.events?.description ?? '';
  const eventsBtnText: string = data?.events?.buttonText ?? '';
  const whatsapp: string = data?.contact?.whatsapp ?? '';
  const accentColor: string = paleta?.colorPrimario ?? '#F59E0B';
  const waHref = `https://wa.me/${whatsapp}?text=Hola! Quisiera consultar por el servicio para Eventos.`;
  const eventsRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="stats"
      className="w-full relative overflow-hidden bg-[#0A0A0A]"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Top rule */}
      <GridLine delay={0} />

      {/* ═══════════════════════════════════════════════════════════════════
          EVENTS — Editorial typography block, full-width
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        ref={eventsRef}
        className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-14 lg:py-24"
        initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, bounce: 0.2 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Single unified text block — label, heading, description, CTA in reading order */}
        <div className="flex flex-col items-start gap-6 max-w-3xl">

          {/* Eyebrow */}
          <p
            className="text-[10px] uppercase tracking-[0.28em] text-neutral-500"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Eventos &amp; Catering
          </p>

          {/* Oversized title — standardized to H2 scale */}
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {eventsTitle}
          </h2>

          {/* Description — standardized to text-lg text-neutral-400 */}
          <p
            className="text-lg leading-relaxed text-neutral-400"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {eventsDescription}
          </p>

          {/* CTA — flows immediately after the paragraph */}
          <div className="pt-2">
            <PillCTA
              href={waHref}
              label={eventsBtnText || 'Consultar por Eventos'}
            />
          </div>
        </div>
      </motion.div>

      {/* Mid rule */}
      <GridLine delay={0.15} />

      {/* ═══════════════════════════════════════════════════════════════════
          STATS — Brutalist wireframe grid
          Massive numbers / microscopic labels / pure 1px borders
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="w-full max-w-[1200px] mx-auto"
        initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, bounce: 0.2 }}
        viewport={{ once: true, margin: '-100px' }}
      >

        {/* Stats eyebrow */}
        <p
          className="text-xs uppercase tracking-[0.28em] font-semibold text-neutral-400 px-6 lg:px-12 pt-12 pb-8"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {statsTitle}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCell
              key={i}
              stat={stat}
              index={i}
              accentColor={accentColor}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom rule */}
      <GridLine delay={0.25} />

    </section>
  );
}
