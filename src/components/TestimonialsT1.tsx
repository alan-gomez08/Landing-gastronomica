import { motion } from 'framer-motion';
import { configT1 } from '../config/dataT1';
import type { ClientData } from '../types';

interface Props {
  data?: ClientData;
  paleta?: any;
}

export default function TestimonialsT1({ data, paleta }: Props) {
  const title = data?.testimonials?.title || configT1.testimonials.title;
  const rawReviews = data?.testimonials?.items?.length
    ? data.testimonials.items
    : configT1.testimonials.items;

  // Duplicate items to ensure enough width for seamless 50% loop on ultra-wide screens
  const reviews = rawReviews.length < 6 ? [...rawReviews, ...rawReviews] : rawReviews;

  const accentColor = paleta?.colorPrimario || '#F59E0B';

  return (
    <section
      id="resenas"
      className="relative w-full py-20 lg:py-32 overflow-hidden border-t border-white/[0.08] bg-[#0A0A0A]"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* ── Top Header (Aligned with standard page container) ───────── */}
      <motion.div
        className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 text-left"
        initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, bounce: 0.2 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-px" style={{ backgroundColor: accentColor }} />
          <span
            className="text-[11px] uppercase tracking-[0.28em] font-semibold"
            style={{ color: accentColor, fontFamily: "'Inter', sans-serif" }}
          >
            Reseñas
          </span>
        </div>
        <h2
          className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h2>
      </motion.div>

      {/* ── Infinite Marquee Ticker (Bleeds edge-to-edge) ──────────── */}
      <div className="w-full overflow-hidden mt-12 lg:mt-20 select-none relative">
        {/* Soft edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 lg:w-36 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 lg:w-36 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />

        <div
          className="flex w-max animate-marquee-slow"
          style={{ willChange: 'transform' }}
        >
          {/* Primary Set */}
          <div className="flex shrink-0 gap-8 lg:gap-16 pr-8 lg:pr-16 pl-6">
            {reviews.map((review: any, idx: number) => {
              const ratingCount = Math.max(1, Math.min(5, review.rating || 5));
              const starsText = Array(ratingCount).fill('✦').join(' ');

              return (
                <article
                  key={`primary-${review.id}-${idx}`}
                  className="w-[85vw] md:w-[400px] lg:w-[500px] flex-shrink-0 flex flex-col justify-between items-start text-left"
                >
                  {/* Scaled-down elegant review text */}
                  <p
                    className="text-xl lg:text-2xl leading-relaxed text-neutral-400 cursor-default"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {review.text}
                  </p>

                  {/* Author Block */}
                  <div className="w-full border-t border-white/[0.1] pt-6 mt-8 flex items-center gap-4 text-left">
                    {review.imagePath && (
                      <img
                        src={review.imagePath}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500 shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-1 text-left">
                      <h4
                        className="text-white font-medium text-base tracking-tight"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {review.name}
                      </h4>
                      <span className="text-white/60 text-xs tracking-[0.2em]">
                        {starsText}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Duplicated Clone Set for Seamless Loop */}
          <div className="flex shrink-0 gap-8 lg:gap-16 pr-8 lg:pr-16 pl-6" aria-hidden="true">
            {reviews.map((review: any, idx: number) => {
              const ratingCount = Math.max(1, Math.min(5, review.rating || 5));
              const starsText = Array(ratingCount).fill('✦').join(' ');

              return (
                <article
                  key={`clone-${review.id}-${idx}`}
                  className="w-[85vw] md:w-[400px] lg:w-[500px] flex-shrink-0 flex flex-col justify-between items-start text-left"
                >
                  {/* Scaled-down elegant review text */}
                  <p
                    className="text-xl lg:text-2xl leading-relaxed text-neutral-400 cursor-default"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {review.text}
                  </p>

                  {/* Author Block */}
                  <div className="w-full border-t border-white/[0.1] pt-6 mt-8 flex items-center gap-4 text-left">
                    {review.imagePath && (
                      <img
                        src={review.imagePath}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500 shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-1 text-left">
                      <h4
                        className="text-white font-medium text-base tracking-tight"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {review.name}
                      </h4>
                      <span className="text-white/60 text-xs tracking-[0.2em]">
                        {starsText}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}