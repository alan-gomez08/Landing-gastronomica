import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ClientData, CartItem } from '../types';
import { parsePrice, formatPrice } from '../utils/formatters';

interface Props {
  data: ClientData;
  paleta: any;
  cart?: CartItem[];
  onOpenCart?: () => void;
  bannerActive?: boolean;
}

export default function NavbarT1({ data, paleta, cart = [], onOpenCart, bannerActive = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [isCartHovered, setIsCartHovered] = useState(false);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (parsePrice(item.price) * item.quantity), 0);
  }, [cart]);

  const links = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Menú', href: '#menu' },
    { name: 'Reseñas', href: '#resenas' },
    { name: 'Ubicación', href: '#ubicacion' },
  ];

  // Scroll spy minimalista para detectar la sección activa
  useEffect(() => {
    const sectionIds = ['inicio', 'nosotros', 'menu', 'resenas', 'ubicacion'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      // Si el usuario llega al final de la página, activa la última sección
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection('ubicacion');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection('inicio');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed left-0 w-full z-50 backdrop-blur-xl transition-all ${bannerActive ? 'top-10' : 'top-0'}`}
      style={{ 
        backgroundColor: 'rgba(10,10,10,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.07)' 
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        
        {/* Brand Name */}
        <a 
          href="#inicio" 
          className="text-2xl font-bold tracking-tight text-white hover:opacity-90 active:scale-95 transition-all"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {data.businessName}
        </a>

        {/* Desktop Links (Limpio, espaciado y con línea activa sutil) */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a 
                key={link.name} 
                href={link.href}
                className="relative py-1 text-sm font-medium transition-colors hover:text-white"
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                }}
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: paleta.colorPrimario }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right Side: Carrito con efecto de carga líquido en hover */}
        <div className="hidden md:flex items-center">
          {onOpenCart && (
            <motion.button
              type="button"
              onClick={onOpenCart}
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
              className="relative group inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold text-black overflow-hidden active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.12)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.45)] border border-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              aria-label={`Ver carrito: ${totalItems} productos`}
            >
              {/* Base white surface */}
              <span className="absolute inset-0 bg-white z-0" />

              {/* Radiant Yellow Loading Fill Animation (Sweep from left to right) */}
              <motion.span
                className="absolute inset-0 z-0 origin-left"
                style={{
                  background: `linear-gradient(90deg, ${paleta.colorPrimario} 0%, #FBBF24 50%, ${paleta.colorPrimario} 100%)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isCartHovered ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Specular light sheen passing over */}
              <motion.span
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: isCartHovered ? '120%' : '-100%' }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
              />

              {/* Label, Cart Icon and Badge */}
              <span className="relative z-10 flex items-center gap-2 text-black font-bold">
                <svg
                  className="w-4 h-4 text-black transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>

                <span className="tracking-wide">
                  {totalItems > 0 && subtotal > 0 ? formatPrice(subtotal) : 'Mi Pedido'}
                </span>

                {totalItems > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] bg-black text-white">
                    {totalItems}
                  </span>
                )}
              </span>
            </motion.button>
          )}
        </div>

        {/* Mobile Right: Ícono de Carrito con Badge Numérico Amarillo + Hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full border border-white/15 bg-white/[0.06] text-white active:scale-95 transition-all shadow-sm cursor-pointer"
              aria-label={`Ver carrito: ${totalItems} productos`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>

              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center font-black text-[10px] text-black shadow-md"
                  style={{ backgroundColor: paleta.colorPrimario }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 active:scale-90 transition-transform cursor-pointer"
            style={{ color: paleta.textoPrimario }}
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full transition-all duration-300 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}
        style={{ 
          backgroundColor: paleta.fondoSecundario,
          borderBottom: `1px solid ${paleta.textoSecundario}33`
        }}
      >
        <div className="flex flex-col p-6 gap-5">
          {links.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-base font-medium transition-colors py-1"
                style={{ 
                  color: isActive ? paleta.colorPrimario : 'rgba(255,255,255,0.7)', 
                  fontFamily: "'Space Grotesk', sans-serif" 
                }}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: paleta.colorPrimario }}
                  />
                )}
              </a>
            );
          })}

          {onOpenCart && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCart();
              }}
              className="w-full mt-2 py-3 rounded-full font-bold text-sm text-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
              style={{ backgroundColor: paleta.colorPrimario }}
            >
              <span>{totalItems > 0 ? `Ver Pedido (${totalItems})` : 'Ver Pedido'}</span>
              {totalItems > 0 && subtotal > 0 && <span>· {formatPrice(subtotal)}</span>}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}