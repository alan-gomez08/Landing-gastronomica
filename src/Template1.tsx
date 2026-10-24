import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import NavbarT1 from './components/NavbarT1';
import HeroT1 from './components/HeroT1';
import NosotrosT1 from './components/NosotrosT1';
import MenuT1 from './components/MenuT1';
import StatsT1 from './components/StatsT1';
import TestimonialsT1 from './components/TestimonialsT1';
import LocationT1 from './components/LocationT1';
import FooterT1 from './components/FooterT1';
import CartDrawer from './components/CartDrawer'; 
import TopBanner from './components/TopBanner';

import { configT1 } from './config/dataT1'; 
import { useAirtableMenu } from './hooks/useAirtableMenu';
import { formatPrice, parsePrice } from './utils/formatters';
import type { CartItem, MenuItem, Palette, ClientData, DeliveryZone as LocalDeliveryZone } from './types';

export default function Template1() {
  // Sincronización en vivo con Airtable (con fallback automático a configT1)
  const { products, deliveryZones, configuracion, cupones } = useAirtableMenu();

  const liveData: ClientData = useMemo(() => {
    // Si aún no hay datos de Airtable o hubo error, usamos la configuración local por defecto
    if (!products.length && !deliveryZones.length && !configuracion) {
      return configT1;
    }

    const categories = products.length > 0
      ? Array.from(new Set(products.map(p => p.Categoría).filter(Boolean)))
      : configT1.menu.categories;

    const mappedItems: MenuItem[] = products.map((p, idx) => ({
      id: p.id || `airtable-${idx}`,
      title: p['Nombre del Producto'],
      description: p.Descripcion,
      category: p.Categoría,
      price: formatPrice(p.Precio),
      imagePath: typeof p.Foto === 'string' ? p.Foto : (p.Foto as any)?.[0]?.url || p.foto || '',
      badge: p.Badge,
      isSoldOut: Boolean(p.Badge?.toLowerCase().includes('agotado')),
    }));

    const mappedZones: LocalDeliveryZone[] = deliveryZones.map(z => ({
      name: z['Nombre de la Zona'],
      price: z.Costo,
    }));

    return {
      ...configT1,
      businessName: configuracion?.['Nombre del Local'] || configT1.businessName,
      contact: {
        ...configT1.contact,
        whatsapp: configuracion?.['WhatsApp Pedidos'] || configT1.contact.whatsapp,
      },
      menu: {
        ...configT1.menu,
        categories: categories.length > 0 ? categories : configT1.menu.categories,
        items: mappedItems.length > 0 ? mappedItems : configT1.menu.items,
      },
      config: {
        ...configT1.config,
        deliveryZones: mappedZones.length > 0 ? mappedZones : configT1.config?.deliveryZones,
      },
    };
  }, [products, deliveryZones, configuracion]);
  
  // ESTADO GLOBAL DEL CARRITO Y DRAWER
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toast feedback breve para no interrumpir la navegación
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Función para sumar productos con feedback toast
  const addToCart = (product: MenuItem) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleAddToCartWithToast = (product: MenuItem) => {
    addToCart(product);
    showToast(`Agregado al carrito: ${product.title}`);
  };

  // Función para sumar o restar cantidades desde el menú o el drawer
  const updateQuantity = (id: string, amount: number) => {
    setCart(prevCart => {
      return prevCart.flatMap(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? [{ ...item, quantity: newQuantity }] : [];
        }
        return [item];
      });
    });
  };

  // Carrito con los precios e imágenes más recientes siempre sincronizados desde liveData
  const activeCart = useMemo(() => {
    return cart.map(cartItem => {
      const updated = liveData?.menu?.items?.find(
        i => i.id === cartItem.id || i.title.trim().toLowerCase() === cartItem.title.trim().toLowerCase()
      );
      if (updated && (updated.price !== cartItem.price || (updated.imagePath && updated.imagePath !== cartItem.imagePath))) {
        return {
          ...cartItem,
          price: updated.price,
          imagePath: updated.imagePath || cartItem.imagePath,
        };
      }
      return cartItem;
    });
  }, [cart, liveData?.menu?.items]);

  const totalItems = useMemo(() => {
    return activeCart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  }, [activeCart]);

  const subtotal = useMemo(() => {
    return activeCart.reduce((acc, item) => acc + (parsePrice(item.price) * item.quantity), 0);
  }, [activeCart]);

  const paleta: Palette = {
    fondoPrincipal: "#0A0A0A",
    fondoSecundario: "#111111",
    fondoCajas: "#111111",
    colorPrimario: liveData?.identidad?.colorPrincipal || "#F59E0B",
    fondoBoton: "#FFFFFF",
    textoBoton: "#000000",
    textoPrimario: "#FFFFFF",
    textoSecundario: "#A3A3A3",
  };

  const bannerText = configuracion?.['Banner Promocional'] || '';
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const hasBanner = Boolean(bannerText && bannerText.trim().length > 0 && !isBannerDismissed);

  return (
    <main 
      className="w-full max-w-[100vw] min-h-screen font-sans overflow-x-hidden relative"
      style={{ backgroundColor: paleta.fondoPrincipal }}
    >
      {/* 1. Top Banner (Promocional) */}
      {hasBanner && (
        <TopBanner 
          bannerText={bannerText} 
          onOpenCart={() => setIsCartOpen(true)} 
          onClose={() => setIsBannerDismissed(true)}
        />
      )}

      <NavbarT1 
        data={liveData} 
        paleta={paleta} 
        cart={activeCart} 
        onOpenCart={() => setIsCartOpen(true)} 
        bannerActive={hasBanner}
      />
      <HeroT1 data={liveData} paleta={paleta} />
      <NosotrosT1 data={liveData} paleta={paleta} />
      
      {/* Le pasamos el catálogo sincronizado y las funciones de control al Menú */}
      <MenuT1 
        data={liveData} 
        paleta={paleta} 
        cart={activeCart} 
        addToCart={handleAddToCartWithToast} 
        updateQuantity={updateQuantity}
        showToast={showToast}
      />
      
      <StatsT1 data={liveData} paleta={paleta} />
      <TestimonialsT1 data={liveData} paleta={paleta} />
      <LocationT1 data={liveData} paleta={paleta} />
      <FooterT1 data={liveData} paleta={paleta} />

      {/* 2 & 3. Carrito Offcanvas con lógica de negocio, cupones, transferencia y WhatsApp */}
      <CartDrawer 
        data={liveData} 
        configuracion={configuracion}
        zonasEnvio={deliveryZones}
        cupones={cupones}
        bannerText={bannerText}
        paleta={paleta} 
        cart={activeCart} 
        updateQuantity={updateQuantity}
        isOpen={isCartOpen}
        onOpen={() => setIsCartOpen(true)}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Barra Flotante Inferior Elegante (Floating Dock / Sticky Bar) para Mobile */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="md:hidden fixed bottom-[max(0.85rem,env(safe-area-inset-bottom))] left-3 right-3 z-40 max-w-md mx-auto"
          >
            <div
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#111113]/92 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(245,158,11,0.12)] cursor-pointer active:scale-[0.985] transition-all overflow-hidden"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Inter', sans-serif",
              }}
            >
              {/* Reflejo de luz superior refinado (specular sheen) */}
              <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              {/* Resplandor ambiental de acento en el fondo */}
              <div
                className="absolute -left-6 -top-6 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
                style={{ backgroundColor: paleta.colorPrimario }}
              />

              {/* Lado izquierdo: Ícono refinado con badge + info de subtotal */}
              <div className="relative z-10 flex items-center gap-3 min-w-0 pl-1">
                {/* Contenedor del ícono con Badge flotante */}
                <div className="relative w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-white/90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                    />
                  </svg>
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center font-black text-[10px] text-black shadow-md"
                    style={{ backgroundColor: paleta.colorPrimario }}
                  >
                    {totalItems}
                  </span>
                </div>

                {/* Subtotal y detalle de ítems con tipografía nativa SF Pro / Space Grotesk */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 truncate">
                    {totalItems === 1 ? '1 producto seleccionado' : `${totalItems} productos seleccionados`}
                  </span>
                  <span
                    className="text-[17px] font-black text-white tracking-tight leading-tight"
                    style={{
                      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                    }}
                  >
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Lado derecho: Botón CTA magnético con flecha */}
              <div className="relative z-10 flex items-center shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCartOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs sm:text-[13px] text-black shadow-[0_4px_18px_rgba(245,158,11,0.35)] active:scale-95 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: paleta.colorPrimario,
                    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  }}
                  aria-label="Abrir carrito y confirmar pedido"
                >
                  <span>Ver Carrito</span>
                  <svg
                    className="w-3.5 h-3.5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación Visual Toast al Agregar Ítems */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed ${totalItems > 0 ? 'bottom-24 md:bottom-8' : 'bottom-8'} left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[92vw]`}
          >
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#161616]/95 border border-amber-400/50 text-white shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-xl">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs text-black shrink-0 shadow-sm"
                style={{ backgroundColor: paleta.colorPrimario }}
              >
                ✓
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {toastMessage}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}