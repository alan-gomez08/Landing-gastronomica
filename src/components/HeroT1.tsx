import { useState } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { configT1 } from '../config/dataT1';
import type { ClientData } from '../types';

interface Props {
  data: ClientData;
  paleta: any;
  bannerActive?: boolean;
}

export default function HeroT1({ data, paleta, bannerActive = false }: Props) {
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const heroData = data?.hero || configT1.hero;
  const rawTitle = heroData?.title || configT1.hero.title;
  // Drop generic greeting to focus directly on value proposition
  const cleanTitle = rawTitle.replace(/^Bienvenidos!?\s*\n?/i, '').trim();

  // Formato de 2 líneas para tablet (md: 768px - 1023px) para optimizar el alto y reposar sobre la zona oscura
  const rawTitleTablet = heroData?.titleTablet || configT1.hero.titleTablet;
  const tabletTitle = (
    rawTitleTablet
      ? rawTitleTablet
      : cleanTitle.includes('\n')
        ? (() => {
            const words = cleanTitle.replace(/\n+/g, ' ').trim().split(/\s+/);
            if (words.length >= 4) {
              const splitIdx = Math.ceil(words.length * 0.6);
              return `${words.slice(0, splitIdx).join(' ')}\n${words.slice(splitIdx).join(' ')}`;
            }
            return cleanTitle;
          })()
        : cleanTitle
  ).replace(/^Bienvenidos!?\s*\n?/i, '').trim();

  const subtitle = heroData?.subtitle || configT1.hero.subtitle;
  const buttonText = heroData?.buttonText || configT1.hero.buttonText;
  const desktopImage = heroData?.images?.desktop || '/assets-t1/hero-desktop.webp';
  const tabletImage = heroData?.images?.tablet || '/assets-t1/hero-tablet.webp';
  const mobileImage = heroData?.images?.mobile || '/assets-t1/hero-mobile.webp';
  const whatsapp = data?.contact?.whatsapp || configT1.contact.whatsapp;
  const accentColor = paleta?.colorPrimario || '#F59E0B';

  // Subtle parallax effect linked to scroll
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 160]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="inicio"
      className="relative w-full h-[100svh] min-h-[640px] flex flex-col justify-center overflow-hidden bg-[#0A0A0A]"
    >
      {/* ── Background Image with Parallax & Gentle Scale ── */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <motion.div style={{ y: parallaxY }} className="w-full h-full">
          <picture className="w-full h-full block">
            {/* Mobile View (< 768px): hero-mobile.webp */}
            <source media="(max-width: 767px)" srcSet={mobileImage} />
            {/* Tablet View (768px - 1023px): hero-tablet.webp */}
            <source media="(max-width: 1023px)" srcSet={tabletImage} />
            {/* Desktop View (>= 1024px): hero-desktop.webp */}
            <motion.img
              src={desktopImage}
              alt="Atmósfera gastronómica"
              className="w-full h-full object-cover object-center md:object-[center_bottom] lg:object-center"
              initial={{ scale: 1.05 }}
              animate={{
                scale: [1.05, 1, 1.05],
              }}
              transition={{
                duration: 20,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          </picture>
        </motion.div>

        {/* ── Dynamic Gradient: Safe dark zone on bottom/left (Gradiente suave hacia abajo en mobile para resaltar texto sin tapar la imagen) ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] from-5% via-[#0A0A0A]/50 via-45% to-transparent to-75% md:bg-gradient-to-r md:from-[#0A0A0A]/90 md:via-[#0A0A0A]/50 md:to-transparent w-full md:w-[85%] lg:w-[75%]" />

        {/* Subtle ambient film tint (solo visible en desktop para no oscurecer mobile) */}
        <div className="hidden md:block absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      {/* ── Editorial Content Block (Anchored Bottom on Mobile, Raised on Tablet, Centered on Desktop) ── */}
      <div
        className={`relative z-10 w-full max-w-[1250px] mx-auto px-6 sm:px-12 lg:px-16 h-full flex flex-col justify-end pb-12 pt-32 md:justify-start ${
          bannerActive ? 'md:pt-44' : 'md:pt-36'
        } md:pb-0 lg:justify-center lg:pt-0`}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col items-start max-w-3xl w-full"
        >
          {/* Eyebrow: oculto en mobile y tablet, visible solo en desktop */}
          <motion.div variants={itemVariants} className="hidden lg:flex items-center gap-3 mb-4 lg:mb-5">
            <span
              className="w-8 md:w-10 h-px"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="text-[10px] md:text-xs font-semibold tracking-[0.28em] uppercase text-white/90"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Experiencia Gastronómica
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight md:leading-[1.08] tracking-tighter text-white mb-4 md:mb-5 lg:mb-6 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {/* Mobile (< 768px) y Desktop (>= 1024px): formato de 3 líneas */}
            <span className="block md:hidden lg:block whitespace-pre-line text-balance">
              {cleanTitle}
            </span>
            {/* Tablet (768px - 1023px): formato de 2 líneas */}
            <span className="hidden md:block lg:hidden whitespace-pre-line">
              {tabletTitle}
            </span>
          </motion.h1>

          {/* Subtitle / Description */}
          <motion.p
            variants={itemVariants}
            className="text-neutral-300 md:text-neutral-400 text-base md:text-lg lg:text-xl font-normal leading-relaxed max-w-lg mb-8 md:mb-6 lg:mb-10 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {subtitle}
          </motion.p>

          {/* Action Area: Unified Primary & Secondary CTA Architecture */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center gap-4 md:gap-5 w-full md:w-auto"
          >
            {/* Primary CTA: Crisp White Base with Super-Premium Liquid Yellow Load on Hover */}
            <motion.a
              href={`https://wa.me/${whatsapp}?text=Hola! Quisiera hacer un pedido.`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setIsCtaHovered(true)}
              onMouseLeave={() => setIsCtaHovered(false)}
              className="relative group inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full text-base font-bold text-black overflow-hidden active:scale-95 transition-all duration-300 w-full md:w-auto text-center cursor-pointer shadow-[0_8px_25px_rgba(255,255,255,0.12)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] border border-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {/* Base white surface */}
              <span className="absolute inset-0 bg-white z-0" />

              {/* Radiant Yellow Loading Fill Animation (Sweep from left to right) */}
              <motion.span
                className="absolute inset-0 z-0 origin-left"
                style={{
                  background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isCtaHovered ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Specular light sheen passing over */}
              <motion.span
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: isCtaHovered ? '120%' : '-100%' }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
              />

              {/* Label & Dynamic Arrow Icon */}
              <span className="relative z-10 flex items-center gap-3 text-black">
                <span>{buttonText}</span>
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

            {/* Secondary CTA: Frosted Glass with Liquid Silver Sweep on Hover (without changing color) */}
            <motion.a
              href="#menu"
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
              className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-semibold text-white overflow-hidden backdrop-blur-xl border border-white/20 hover:border-white/50 active:scale-95 transition-all duration-300 w-full md:w-auto text-center cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_25px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_35px_rgba(255,255,255,0.15)]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {/* Liquid Frosted Silver Loading Sweep from left to right */}
              <motion.span
                className="absolute inset-0 z-0 origin-left"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.18) 100%)',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isMenuHovered ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Specular sheen pass */}
              <motion.span
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: isMenuHovered ? '120%' : '-100%' }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
              />

              <span className="relative z-10 text-white tracking-wide">Ver Menú</span>
              <motion.svg
                className="relative z-10 w-4 h-4 text-white/90 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ y: isMenuHovered ? 2.5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}