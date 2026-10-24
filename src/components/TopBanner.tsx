import React from 'react';

export interface TopBannerProps {
  /**
   * Texto promocional leído desde la variable "Banner Promocional" de Airtable
   */
  bannerText?: string | null;
  /**
   * Callback opcional para abrir el carrito y ver la promoción aplicada
   */
  onOpenCart?: () => void;
  /**
   * Callback opcional para cerrar/descartar el banner
   */
  onClose?: () => void;
}

/**
 * TopBanner Promocional:
 * Diseño minimalista, limpio y de alta gama ("quiet luxury").
 * Sin animaciones estridentes ni colores invasivos. Tipografía refinada,
 * contraste equilibrado y microinteracciones suaves.
 * 100% libre de emojis.
 */
export const TopBanner: React.FC<TopBannerProps> = ({ bannerText, onOpenCart, onClose }) => {
  if (!bannerText || !bannerText.trim()) {
    return null;
  }

  const cleanText = bannerText.trim();

  return (
    <aside
      role="banner"
      aria-label="Promoción destacada"
      className="fixed top-0 left-0 right-0 z-[60] h-10 px-4 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.08] shadow-sm flex items-center justify-between select-none"
    >
      <div className="flex-1 flex items-center justify-center gap-2.5 text-center truncate max-w-[1200px] mx-auto">
        {/* Marcador refinado de acento */}
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 shrink-0" aria-hidden="true" />

        {/* Texto de la promoción */}
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-neutral-400 text-xs font-normal tracking-wide hidden sm:inline">
            Promoción activa:
          </span>
          <span className="text-neutral-100 font-medium text-xs sm:text-[13px] tracking-wide truncate">
            {cleanText}
          </span>
        </div>

        {/* Botón CTA minimalista y elegante */}
        {onOpenCart && (
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full border border-white/15 hover:border-amber-400/50 text-neutral-300 hover:text-white text-[11px] font-medium tracking-wider uppercase transition-colors cursor-pointer shrink-0"
          >
            <span>Ver detalle</span>
            <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Botón de cierre discreto */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
          aria-label="Cerrar aviso promocional"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </aside>
  );
};

export default TopBanner;
