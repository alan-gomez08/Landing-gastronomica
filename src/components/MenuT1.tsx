import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion';
import { normalizeImageUrl } from '../utils/formatters';

// --- Types -------------------------------------------------------------------
interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  imagePath?: string;
  badge?: string;
  isSoldOut?: boolean;
}

interface MenuT1Props {
  data: any;
  paleta: any;
  cart: any[];
  addToCart: (item: any) => void;
  updateQuantity: (id: string, amount: number) => void;
  showToast?: (msg: string) => void;
}

// --- Animation Variants ------------------------------------------------------
const GRID_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
  exit: {},
};

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.96,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// --- Compact Menu Item for Mobile (Reduced Scroll Friction) ------------------
function CompactMenuItem({
  item,
  isEcommerce,
  mostrarPrecios,
  cart,
  addToCart,
  updateQuantity,
  accentColor,
  whatsapp,
  showToast,
}: {
  item: MenuItem;
  isEcommerce: boolean;
  mostrarPrecios: boolean;
  cart: any[];
  addToCart: (item: any) => void;
  updateQuantity: (id: string, amount: number) => void;
  accentColor: string;
  whatsapp: string;
  showToast?: (msg: string) => void;
}) {
  const quantity = cart?.find((i: any) => i.id === item.id)?.quantity ?? 0;

  return (
    <article
      className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#161616] border border-white/[0.08] hover:border-white/15 transition-all shadow-md"
    >
      {/* Square Image Left */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#0D0D0E] shrink-0 overflow-hidden flex items-center justify-center p-1.5 border border-white/[0.05]">
        {item.imagePath ? (
          <img
            src={normalizeImageUrl(item.imagePath)}
            alt={item.title}
            className={`w-full h-full object-cover rounded-lg ${
              item.isSoldOut ? 'grayscale opacity-60' : ''
            }`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-neutral-500">Sin foto</span>
          </div>
        )}
      </div>

      {/* Right Column: Title, Description, Price, Small Add Button */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          <h3
            className="text-[15px] font-bold text-white line-clamp-1 leading-snug"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {item.title}
          </h3>
          {item.description && (
            <p
              className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/[0.05]">
          {isEcommerce && mostrarPrecios && item.price ? (
            <span
              className="text-[17px] font-black tracking-tight"
              style={{ color: accentColor, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {item.price}
            </span>
          ) : (
            <span />
          )}

          {/* Action button on mobile */}
          {isEcommerce ? (
            item.isSoldOut ? (
              <span className="text-[11px] font-medium text-neutral-500 py-1 px-2.5 rounded-full bg-neutral-900 border border-neutral-800">
                Agotado
              </span>
            ) : quantity === 0 ? (
              <motion.button
                type="button"
                onClick={() => addToCart(item)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-black flex items-center gap-1 shadow-sm active:scale-90 transition-transform cursor-pointer"
                style={{
                  backgroundColor: accentColor,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                whileTap={{ scale: 0.92 }}
                aria-label={`Agregar ${item.title}`}
              >
                <span className="text-sm font-black leading-none">+</span>
                <span>Agregar</span>
              </motion.button>
            ) : (
              <div
                className="flex items-center gap-1.5 rounded-full px-2 py-0.5 border"
                style={{
                  borderColor: `${accentColor}80`,
                  backgroundColor: '#0D0D0E',
                }}
              >
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-5 h-5 flex items-center justify-center text-white text-sm font-bold active:scale-90 cursor-pointer"
                  aria-label="Restar una unidad"
                >
                  -
                </button>
                <span className="font-bold text-xs text-white px-1">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    updateQuantity(item.id, 1);
                    if (showToast) showToast(`+1 ${item.title}`);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-black font-black text-xs active:scale-90 cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                  aria-label="Sumar una unidad"
                >
                  +
                </button>
              </div>
            )
          ) : (
            <a
              href={`https://wa.me/${whatsapp}?text=Hola! Quisiera consultar sobre: ${encodeURIComponent(item.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-black"
              style={{ backgroundColor: accentColor }}
            >
              Consultar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// --- Single Menu Card --------------------------------------------------------
function MenuCard({
  item,
  isEcommerce,
  mostrarPrecios,
  cart,
  addToCart,
  updateQuantity,
  accentColor,
  whatsapp,
}: {
  item: MenuItem;
  isEcommerce: boolean;
  mostrarPrecios: boolean;
  cart: any[];
  addToCart: (item: any) => void;
  updateQuantity: (id: string, amount: number) => void;
  accentColor: string;
  whatsapp: string;
}) {
  const [hovered, setHovered] = useState(false);
  const quantity = cart?.find((i: any) => i.id === item.id)?.quantity ?? 0;

  return (
    <motion.article
      variants={CARD_VARIANTS}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ willChange: 'transform' }}
      className="group relative w-full h-full flex flex-col justify-between rounded-3xl bg-[#1A1A1A] border border-white/[0.08] hover:border-amber-500/40 p-4 sm:p-5 transition-all duration-300 shadow-xl shadow-black/50 hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.15)]"
    >
      {/* Diffuse ambient glow on hover */}
      <motion.div
        aria-hidden
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
          filter: 'blur(32px)',
        }}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.2 : 0.8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />

      {/* Top Section: Image Stage + Badges + Text */}
      <div className="flex flex-col w-full">
        {/* Image Stage Container */}
        <div className="relative w-full h-[190px] sm:h-[210px] shrink-0 rounded-2xl bg-[#121212] flex items-center justify-center p-3 overflow-visible border border-white/[0.04]">
          {/* Food Image or Placeholder */}
          {item.imagePath ? (
            <motion.img
              src={normalizeImageUrl(item.imagePath)}
              alt={item.title}
              className={`w-full h-full max-h-[165px] sm:max-h-[185px] object-contain relative z-10 ${
                item.isSoldOut ? 'grayscale opacity-60' : ''
              }`}
              style={{
                filter: item.isSoldOut
                  ? 'grayscale(1) opacity(0.6)'
                  : 'drop-shadow(0 18px 26px rgba(0,0,0,0.75)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
              }}
              animate={{
                scale: hovered ? 1.07 : 1,
                rotate: hovered ? 1.5 : 0,
                y: hovered ? -5 : 0,
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as any }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-600 z-10">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-600">
                Sin foto
              </span>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-1.5 mt-4 px-1">
          <h3
            className="text-[18px] sm:text-[19px] lg:text-[20px] font-bold leading-snug tracking-tight text-white line-clamp-2 min-h-[3rem] flex items-start"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {item.title}
          </h3>
          <p
            className="text-[13px] sm:text-[13.5px] leading-relaxed text-neutral-400 line-clamp-2 min-h-[2.6rem]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {item.description || ''}
          </p>
        </div>
      </div>

      {/* Bottom Section: Price + Solid Yellow CTA */}
      <div className="mt-4 pt-3 flex flex-col gap-3 px-1 border-t border-white/[0.06] shrink-0">
        <div className="flex items-baseline justify-between min-h-[28px]">
          {isEcommerce && mostrarPrecios && item.price ? (
            <span
              className="text-[22px] sm:text-[24px] font-black tracking-tight"
              style={{ color: accentColor, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {item.price}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Action Button - Filled Solid Yellow with High Contrast */}
        <div className="w-full h-[48px]">
          {isEcommerce ? (
            item.isSoldOut ? (
              <div
                className="w-full h-[48px] rounded-full text-[13px] font-semibold tracking-wide border flex items-center justify-center gap-2 bg-neutral-900/90 border-neutral-700/60 text-neutral-400 select-none cursor-not-allowed"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span>⛔ Agotado por hoy</span>
              </div>
            ) : quantity === 0 ? (
              <motion.button
                type="button"
                onClick={() => addToCart(item)}
                className="w-full h-[48px] rounded-full text-[14px] sm:text-[15px] font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_4px_18px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.55)] hover:brightness-105"
                style={{
                  backgroundColor: accentColor,
                  color: '#000000',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Agregar ${item.title} al pedido`}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Agregar al Pedido</span>
              </motion.button>
            ) : (
              <div
                className="w-full h-[48px] rounded-full flex items-center justify-between px-2.5 border"
                style={{
                  borderColor: `${accentColor}80`,
                  backgroundColor: '#0D0D0E',
                  boxShadow: `0 0 16px ${accentColor}25`,
                }}
              >
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-2xl font-light text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                  aria-label="Restar una unidad"
                >
                  -
                </button>
                <span
                  className="font-bold text-[15px] sm:text-[16px] text-white px-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full font-bold text-xl active:scale-90 transition-all cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: accentColor, color: '#000000' }}
                  aria-label="Agregar otra unidad"
                >
                  +
                </button>
              </div>
            )
          ) : (
            <a
              href={`https://wa.me/${whatsapp}?text=Hola! Quisiera consultar sobre: ${encodeURIComponent(item.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-[48px] rounded-full text-[14px] font-bold tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 cursor-pointer shadow-[0_4px_18px_rgba(245,158,11,0.35)] hover:brightness-105"
              style={{
                backgroundColor: accentColor,
                color: '#000000',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <span>Consultar por WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// --- Main Component ----------------------------------------------------------
export default function MenuT1({ data, paleta, cart, addToCart, updateQuantity, showToast }: MenuT1Props) {
  const categories: string[] = useMemo(() => data?.menu?.categories || [], [data?.menu?.categories]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const activeCategory = selectedCategory && categories.includes(selectedCategory)
    ? selectedCategory
    : (categories[0] || 'Destacados');

  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, amount: 0.05 });

  const filteredItems: MenuItem[] = useMemo(() => {
    return (data?.menu?.items || []).filter(
      (item: MenuItem) => item.category === activeCategory
    );
  }, [data?.menu?.items, activeCategory]);

  const isEcommerce: boolean = data?.config?.ecommerceMode ?? false;
  const mostrarPrecios: boolean = data?.config?.mostrarPrecios !== false;
  const accentColor: string = paleta.colorPrimario || '#F59E0B';
  const whatsapp: string = data?.contact?.whatsapp || '';

  return (
    <section
      id="menu"
      className="relative w-full py-20 lg:py-28 flex justify-center overflow-hidden bg-transparent"
    >
      {/* ── Studio Spotlight Effect ────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft, oversized radial spotlight centered behind food items */}
        <div
          className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] max-w-[1500px] h-[900px] lg:h-[1200px]"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 50% 50%, #1A1A1A 0%, rgba(26,26,26,0.45) 45%, rgba(10,10,10,0) 80%)',
          }}
        />
        {/* Subtle ambient warmth glow */}
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accentColor}18 0%, transparent 65%)`,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center"
        initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, bounce: 0.2 }}
        viewport={{ once: true, margin: '-100px' }}
      >

        {/* Section Header */}
        <div className="text-center px-6 mb-14 lg:mb-16">
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: accentColor }}>
            Lo Mejor de Nuestra Cocina
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {data?.menu?.title || 'Nuestro Menu'}
          </h2>
        </div>

        {/* Category Segmented Control - Sticky on Mobile right below navbar */}
        <div
          className="sticky top-20 z-30 w-full mb-6 md:mb-12 lg:mb-16 py-3 px-4 md:px-6 bg-[#0A0A0A]/95 backdrop-blur-xl border-y border-white/[0.08] md:border-none md:bg-transparent md:static flex justify-start md:justify-center overflow-hidden"
        >
          <div
            className="flex flex-row items-center gap-2 p-1 rounded-full overflow-x-auto scrollbar-none snap-x snap-mandatory bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-md w-full md:w-auto"
            style={{ maxWidth: '100%' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className="relative shrink-0 snap-start px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-[13.5px] font-semibold z-10 outline-none active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: activeCategory === cat ? '#000000' : 'rgba(255,255,255,0.7)' }}
              >
                {activeCategory === cat && (
                  <motion.span
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full z-[-1] shadow-md"
                    style={{ backgroundColor: '#FFFFFF' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile sticky-nav spacer */}
        <div className="md:hidden w-full h-2" />

        {/* Menu Grid - Responsive Grid with Clean Spacing */}
        <div ref={gridRef} className="w-full px-4 md:px-6 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="w-full"
              variants={GRID_VARIANTS}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              exit="exit"
            >
              {/* Mobile Compact List (allows seeing 3-4 options at once with zero friction) */}
              <div className="flex flex-col gap-3 md:hidden">
                {filteredItems.map((item) => (
                  <CompactMenuItem
                    key={`mobile-${item.id}`}
                    item={item}
                    isEcommerce={isEcommerce}
                    mostrarPrecios={mostrarPrecios}
                    cart={cart}
                    addToCart={addToCart}
                    updateQuantity={updateQuantity}
                    accentColor={accentColor}
                    whatsapp={whatsapp}
                    showToast={showToast}
                  />
                ))}
              </div>

              {/* Desktop Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={`desktop-${item.id}`}
                    item={item}
                    isEcommerce={isEcommerce}
                    mostrarPrecios={mostrarPrecios}
                    cart={cart}
                    addToCart={addToCart}
                    updateQuantity={updateQuantity}
                    accentColor={accentColor}
                    whatsapp={whatsapp}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg className="w-14 h-14 mb-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-neutral-600 text-sm tracking-wide">Sin items en esta categoria</p>
            </motion.div>
          )}
        </div>

      </motion.div>
    </section>
  );
}
