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

      {/* Barra Inferior Fija (Sticky Bottom Bar) para Mobile en Tiempo Real */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
              <div className="flex flex-col pl-1">
                <span className="text-[10.5px] uppercase tracking-wider text-neutral-400 font-semibold">
                  Subtotal ({totalItems} {totalItems === 1 ? 'ítem' : 'ítems'})
                </span>
                <span className="text-lg font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: paleta.colorPrimario, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Ver Carrito</span>
              </button>
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