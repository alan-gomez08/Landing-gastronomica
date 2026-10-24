import React, { useState, useEffect, useMemo } from 'react';
import type { DeliveryZoneData, ConfigData, CouponData } from '../types/airtable';
import type { CartItem, Palette, ClientData } from '../types';
import { parsePrice, formatPrice, normalizeImageUrl } from '../utils/formatters';

export interface CartDrawerProps {
  cart: CartItem[];
  data?: ClientData;
  configuracion?: ConfigData | null;
  zonasEnvio?: DeliveryZoneData[];
  cupones?: CouponData[];
  bannerText?: string | null;
  paleta?: Palette;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem?: (id: string) => void;
}

/**
 * Carrito Offcanvas Lateral con Lógica de Negocio y Conexión al Headless CMS.
 * Diseño minimalista, elegante y 100% libre de emojis (íconos SVG vectoriales).
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart = [],
  data,
  configuracion: propConfig,
  zonasEnvio: propZonas,
  cupones: propCupones,
  bannerText: propBannerText,
  paleta: propPaleta,
  isOpen,
  onClose,
  updateQuantity,
  removeItem,
}) => {
  // Paleta con valores seguros por defecto
  const paleta: Palette = propPaleta || {
    fondoPrincipal: '#0A0A0A',
    fondoSecundario: '#111111',
    fondoCajas: '#161616',
    colorPrimario: data?.identidad?.colorPrincipal || '#F59E0B',
    fondoBoton: '#FFFFFF',
    textoBoton: '#000000',
    textoPrimario: '#FFFFFF',
    textoSecundario: '#A3A3A3',
  };

  // Configuración global proveniente de Airtable o fallback
  const configuracion: ConfigData | null =
    propConfig || (data as any)?.configuracion || null;

  // Variables clave de Configuración
  const localAbierto = configuracion
    ? Boolean(configuracion['Local Abierto'] ?? configuracion.localAbierto)
    : true;

  const soloTakeaway = Boolean(
    configuracion?.['Solo Takeaway (Modo Lluvia)'] ??
    configuracion?.soloTakeaway ??
    (data as any)?.config?.soloTakeaway ??
    false
  );

  const aliasBancario = String(
    configuracion?.['Alias Bancario'] ||
    configuracion?.aliasBancario ||
    'SU.BURGER.MP'
  ).trim();

  const titularCuenta = String(
    configuracion?.['Titular Cuenta'] ||
    configuracion?.titularCuenta ||
    'Juan Pérez'
  ).trim();

  const horariosAtencion = String(
    configuracion?.['Horarios de Atención'] ||
    configuracion?.horariosAtencion ||
    'Martes a Domingo: 19:30 a 00:00 hs'
  ).trim();

  const whatsapp = String(
    configuracion?.['WhatsApp Pedidos'] ||
    configuracion?.whatsappPedidos ||
    data?.contact?.whatsapp ||
    '5491123456789'
  ).trim();

  // Zonas de envío normalizadas
  const zonasEnvio: DeliveryZoneData[] = useMemo(() => {
    const list = propZonas && propZonas.length > 0
      ? propZonas
      : (data as any)?.zonasEnvio || (data?.config?.deliveryZones as any[]) || [];

    return list.map((z: any) => ({
      id: z.id || z.name || z['Nombre de la Zona'] || String(Math.random()),
      'Nombre de la Zona': z['Nombre de la Zona'] || z.name || '',
      Costo: Number(z.Costo ?? z.price ?? z.costo ?? 0),
      Disponible: z.Disponible !== false,
      nombre: z['Nombre de la Zona'] || z.name || '',
      costo: Number(z.Costo ?? z.price ?? z.costo ?? 0),
    })).filter((z: DeliveryZoneData) => z.Disponible === true);
  }, [propZonas, (data as any)?.zonasEnvio, data?.config?.deliveryZones]);

  // Cupones activos normalizados
  const cuponesActivos: CouponData[] = useMemo(() => {
    const list = propCupones && propCupones.length > 0
      ? propCupones
      : (data as any)?.cupones || [];

    return list.filter((c: any) => c.Activo === true || c.activo === true);
  }, [propCupones, (data as any)?.cupones]);

  // Banner Promocional y detección automática del beneficio
  const effectiveBannerText = String(
    propBannerText ||
    configuracion?.['Banner Promocional'] ||
    configuracion?.bannerPromocional ||
    ''
  ).trim();

  const bannerPromo = useMemo(() => {
    if (!effectiveBannerText) return null;
    const clean = effectiveBannerText.trim();
    const text = clean.toLowerCase();

    // Detección de Envío Gratis
    const isFreeShipping =
      text.includes('envio gratis') ||
      text.includes('envío gratis') ||
      text.includes('delivery gratis') ||
      text.includes('envio sin cargo') ||
      text.includes('envío sin cargo') ||
      text.includes('sin costo de envio') ||
      text.includes('sin costo de envío') ||
      text.includes('free delivery') ||
      text.includes('free shipping');

    // Detección de NxM (ej: "3x2 en Doble Cheddar & Bacon", "2x1 en Coca-Cola", "3x2 en 'Burger Completa'")
    const nxmMatch = clean.match(/(\d+)\s*x\s*(\d+)(?:\s+en|\s+de)?\s+["'«“]?([^"'»”]+?)["'»”]?$/i);
    let nxm = null;
    if (nxmMatch) {
      const buyQty = parseInt(nxmMatch[1], 10);
      const payQty = parseInt(nxmMatch[2], 10);
      const targetQuery = nxmMatch[3].trim();
      if (buyQty > payQty && payQty > 0 && targetQuery) {
        nxm = { buyQty, payQty, freePerGroup: buyQty - payQty, targetQuery };
      }
    }

    // Detección de Regalo (ej: "Bebida de regalo", "Papas de regalo", "Postre de regalo", "Regalo de Bebida")
    let gift = null;
    if (!isFreeShipping) {
      const giftMatch =
        clean.match(/(.+?)\s+de\s+regalo/i) ||
        clean.match(/regalo(?:\s+de)?\s+(.+)/i) ||
        clean.match(/(.+?)\s+gratis/i);
      if (giftMatch) {
        const targetQuery = giftMatch[1].trim();
        gift = { targetQuery };
      }
    }

    // Detección de porcentaje de descuento (ej: "15% OFF", "20% de descuento")
    const percentMatch = clean.match(/(\d+)\s*%/);
    const discountPercent = percentMatch ? parseInt(percentMatch[1], 10) : 0;

    return {
      raw: clean,
      isFreeShipping,
      nxm,
      gift,
      discountPercent,
    };
  }, [effectiveBannerText]);

  // Normalizador para comparaciones insensibles a acentos y mayúsculas
  const normStr = (s: string) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Verifica si un ítem coincide con un objetivo (categoría o nombre de producto)
  const matchItemTarget = (item: CartItem, target: string): boolean => {
    const nTarget = normStr(target);
    const nCat = normStr(item.category || '');
    const nTitle = normStr(item.title || '');

    // Coincidencia con categoría (soporta singular y plural)
    if (
      nCat === nTarget ||
      nCat.replace(/s$/, '') === nTarget.replace(/s$/, '') ||
      nCat.includes(nTarget) ||
      nTarget.includes(nCat)
    ) {
      return true;
    }

    // Detección especial de sinónimos de bebidas
    if (nTarget.includes('bebid') || nTarget.includes('trago') || nTarget.includes('gaseosa')) {
      if (nCat.includes('bebid')) return true;
      if (nTitle.match(/coca|pepsi|sprite|fanta|agua|cerveza|gaseosa|jugo|heineken|crystal|corona/i)) {
        return true;
      }
    }

    // Coincidencia con título del producto
    if (nTitle.includes(nTarget) || nTarget.includes(nTitle)) {
      return true;
    }

    return false;
  };

  // Divide una lista de objetivos separados por comas, " y ", " e ", "&"
  const parseTargetList = (str: string): string[] => {
    return str
      .split(/,|\s+y\s+|\s+e\s+|\s+o\s+|&/i)
      .map((s) => s.trim().replace(/^["'«“]|["'»”]$/g, ''))
      .filter(Boolean);
  };

  // Motor de Promociones de Producto (NxM multi-categoría, 50% en 2da unidad, Combo regalo y Regalo simple)
  const productPromo = useMemo(() => {
    if (!bannerPromo || cart.length === 0) return null;
    const clean = bannerPromo.raw;

    // CASO 1: Combo regalo (ej: "Llevando 2 Hamburguesas x una bebida a eleccion de regalo")
    const comboGiftMatch =
      clean.match(/llevando\s+(\d+)\s+(.+?)(?:\s+x|\s*,|\s+con|\s*[-–])\s+(?:una\s+|1\s+)?(.+?)\s+(?:a\s+elecci[oó]n\s+)?(?:de\s+regalo|gratis)/i) ||
      clean.match(/con\s+(?:la\s+compra\s+de\s+)?(\d+)\s+(.+?)(?:\s*,|\s+te\s+llev[aá]s|\s+llevate|\s+con|\s*[-–])\s+(?:una\s+|1\s+)?(.+?)\s+(?:a\s+elecci[oó]n\s+)?(?:de\s+regalo|gratis)/i);

    if (comboGiftMatch) {
      const requiredQty = parseInt(comboGiftMatch[1], 10);
      const sourceTarget = comboGiftMatch[2].trim();
      const giftTarget = comboGiftMatch[3].trim();

      const sourceCount = cart
        .filter((i) => matchItemTarget(i, sourceTarget))
        .reduce((sum, i) => sum + i.quantity, 0);

      const giftItem = cart.find((i) => matchItemTarget(i, giftTarget));

      if (sourceCount >= requiredQty) {
        if (giftItem) {
          const discountAmount = parsePrice(giftItem.price);
          return {
            type: 'combo_gift' as const,
            discountAmount,
            discountedItem: giftItem,
            fullProductName: giftItem.title,
            description: `Bebida de regalo (${giftItem.title})`,
            badgeText: `1u de regalo por promo combo`,
            statusText: `Bebida de regalo aplicada a ${giftItem.title} (-${formatPrice(discountAmount)})`,
            isFullyApplied: true,
          };
        } else {
          return {
            type: 'combo_gift' as const,
            discountAmount: 0,
            discountedItem: null,
            fullProductName: '',
            description: `${giftTarget} de regalo`,
            badgeText: '',
            statusText: `¡Tenés una ${giftTarget} a elección de regalo! Agregá cualquier ${giftTarget.toLowerCase()} a tu pedido para recibirla gratis.`,
            isFullyApplied: false,
          };
        }
      } else {
        const missing = requiredQty - sourceCount;
        return {
          type: 'combo_gift' as const,
          discountAmount: 0,
          discountedItem: null,
          fullProductName: '',
          description: `Llevando ${requiredQty} ${sourceTarget}`,
          badgeText: '',
          statusText: `Agregá ${missing} ${missing === 1 ? 'producto más' : 'productos más'} de ${sourceTarget} para llevarte una ${giftTarget} de regalo.`,
          isFullyApplied: false,
        };
      }
    }

    // CASO 2: Segunda unidad % (ej: "50% en la segunda unidad de Veggie", "50% en la 2da unidad de Hamburguesas")
    const secondUnitMatch = clean.match(
      /(\d+)\s*%\s+en\s+la\s+(?:segunda|2da|2°|2da\.)\s+unidad\s+de\s+(.+)/i
    );
    if (secondUnitMatch) {
      const discountPct = parseInt(secondUnitMatch[1], 10);
      const targetsStr = secondUnitMatch[2].trim();
      const targets = parseTargetList(targetsStr);

      const eligibleUnits: { item: CartItem; price: number }[] = [];
      cart.forEach((item) => {
        if (targets.some((t) => matchItemTarget(item, t))) {
          const price = parsePrice(item.price);
          for (let i = 0; i < item.quantity; i++) {
            eligibleUnits.push({ item, price });
          }
        }
      });

      if (eligibleUnits.length >= 2) {
        const pairs = Math.floor(eligibleUnits.length / 2);
        // Ordenar por precio ascendente (el más barato de cada par recibe el descuento)
        eligibleUnits.sort((a, b) => a.price - b.price);
        const discountedUnits = eligibleUnits.slice(0, pairs);
        const discountAmount = discountedUnits.reduce(
          (acc, u) => acc + Math.round((u.price * discountPct) / 100),
          0
        );
        const fullProductName = Array.from(new Set(discountedUnits.map((u) => u.item.title))).join(', ');
        return {
          type: 'second_unit' as const,
          discountAmount,
          discountedItem: discountedUnits[0].item,
          fullProductName,
          description: `${discountPct}% 2da unidad (${fullProductName})`,
          badgeText: `${discountPct}% OFF en 2da unidad`,
          statusText: `${discountPct}% en 2da unidad aplicado a ${fullProductName} (-${formatPrice(discountAmount)})`,
          isFullyApplied: true,
        };
      } else {
        return {
          type: 'second_unit' as const,
          discountAmount: 0,
          discountedItem: null,
          fullProductName: '',
          description: `${discountPct}% en 2da unidad de ${targetsStr}`,
          badgeText: '',
          statusText: `Agregá 1 unidad más de ${targetsStr} para obtener el ${discountPct}% en la 2da unidad.`,
          isFullyApplied: false,
        };
      }
    }

    // CASO 3: NxM Multi-categoría o Multi-producto (ej: "3x2 en Hamburguesas, Veggie Y Tacos")
    const nxmMatch = clean.match(/(\d+)\s*x\s*(\d+)(?:\s+en|\s+de)?\s+(.+)/i);
    if (nxmMatch) {
      const buyQty = parseInt(nxmMatch[1], 10);
      const payQty = parseInt(nxmMatch[2], 10);
      const targetsStr = nxmMatch[3].trim();
      const targets = parseTargetList(targetsStr);

      const eligibleUnits: { item: CartItem; price: number }[] = [];
      cart.forEach((item) => {
        if (targets.some((t) => matchItemTarget(item, t))) {
          const price = parsePrice(item.price);
          for (let i = 0; i < item.quantity; i++) {
            eligibleUnits.push({ item, price });
          }
        }
      });

      if (eligibleUnits.length >= buyQty) {
        const groups = Math.floor(eligibleUnits.length / buyQty);
        const freeCount = groups * (buyQty - payQty);
        // CRUCIAL: El descuento se aplica SIEMPRE sobre el producto de menor valor (ascendente)
        eligibleUnits.sort((a, b) => a.price - b.price);
        const discountedUnits = eligibleUnits.slice(0, freeCount);
        const discountAmount = discountedUnits.reduce((acc, u) => acc + u.price, 0);
        const fullProductName = Array.from(new Set(discountedUnits.map((u) => u.item.title))).join(', ');
        return {
          type: 'nxm' as const,
          discountAmount,
          discountedItem: discountedUnits[0].item,
          fullProductName,
          description: `Promoción ${buyQty}x${payQty} (${fullProductName})`,
          badgeText: `1u bonificada por promo ${buyQty}x${payQty}`,
          statusText: `Promo ${buyQty}x${payQty} aplicada a ${fullProductName} (-${formatPrice(discountAmount)})`,
          isFullyApplied: true,
        };
      } else {
        const missing = buyQty - eligibleUnits.length;
        return {
          type: 'nxm' as const,
          discountAmount: 0,
          discountedItem: null,
          fullProductName: '',
          description: `Promoción ${buyQty}x${payQty} en ${targetsStr}`,
          badgeText: '',
          statusText: `Agregá ${missing} ${missing === 1 ? 'producto más' : 'productos más'} de ${targetsStr} para activar la promo ${buyQty}x${payQty}.`,
          isFullyApplied: false,
        };
      }
    }

    // CASO 4: Regalo simple (ej: "Bebida de regalo")
    if (bannerPromo.gift) {
      const query = bannerPromo.gift.targetQuery;
      const eligibleItem = cart.find((i) => matchItemTarget(i, query));

      if (eligibleItem) {
        const unitPrice = parsePrice(eligibleItem.price);
        const fullProductName = eligibleItem.title;
        return {
          type: 'simple_gift' as const,
          discountAmount: unitPrice,
          discountedItem: eligibleItem,
          fullProductName,
          description: `Bebida de regalo (${fullProductName})`,
          badgeText: `1u de regalo (${fullProductName})`,
          statusText: `Bebida de regalo aplicada: ${fullProductName} (-${formatPrice(unitPrice)})`,
          isFullyApplied: true,
        };
      } else {
        return {
          type: 'simple_gift' as const,
          discountAmount: 0,
          discountedItem: null,
          fullProductName: '',
          description: `${query} de regalo`,
          badgeText: '',
          statusText: `¡Tenés una ${query} de regalo! Agregá cualquier ${query.toLowerCase()} a tu pedido para recibirla gratis.`,
          isFullyApplied: false,
        };
      }
    }

    return null;
  }, [bannerPromo, cart]);

  // ESTADOS DEL CHECKOUT
  const [deliveryType, setDeliveryType] = useState<'takeaway' | 'delivery'>('takeaway');
  const [zone, setZone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');

  // Estado del Motor de Cupones
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
  } | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Estado de Copia de Alias
  const [copiedAlias, setCopiedAlias] = useState<boolean>(false);

  // Preseleccionar Delivery si el banner ofrece Envío Gratis (salvo que Modo Lluvia esté activo)
  useEffect(() => {
    if (bannerPromo?.isFreeShipping && !soloTakeaway) {
      setDeliveryType('delivery');
    }
  }, [bannerPromo?.isFreeShipping, soloTakeaway]);

  // Si el texto del banner menciona un código de cupón activo de Airtable, autoaplicarlo
  useEffect(() => {
    if (!appliedCoupon && cuponesActivos.length > 0 && effectiveBannerText) {
      const upperText = effectiveBannerText.toUpperCase();
      const matchedCoupon = cuponesActivos.find((c) => {
        const code = (c.Codigo || c.codigo || '').trim().toUpperCase();
        return code.length >= 3 && upperText.includes(code);
      });
      if (matchedCoupon) {
        const discountPercentage = Number(
          matchedCoupon['Descuento Porcentaje'] ?? matchedCoupon.descuentoPorcentaje ?? 0
        );
        setAppliedCoupon({
          code: matchedCoupon.Codigo || matchedCoupon.codigo,
          discountPercentage,
        });
        setCouponFeedback({
          type: 'success',
          message: `Cupón ${matchedCoupon.Codigo || matchedCoupon.codigo} del banner aplicado automáticamente: ${discountPercentage}% de descuento.`,
        });
      }
    }
  }, [effectiveBannerText, cuponesActivos, appliedCoupon]);

  // Forzar Takeaway si se activa el Modo Lluvia
  useEffect(() => {
    if (soloTakeaway && deliveryType === 'delivery') {
      setDeliveryType('takeaway');
    }
  }, [soloTakeaway, deliveryType]);

  // Bloqueo de scroll en body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Función para eliminar un ítem completamente
  const handleRemoveProduct = (item: CartItem) => {
    if (removeItem) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, -item.quantity);
    }
  };

  // Motor de Cupones: Buscar coincidencia en cupones activos
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = couponInput.trim().toUpperCase();

    if (!cleanInput) {
      setCouponFeedback({
        type: 'error',
        message: 'Por favor, ingresá un código de cupón.',
      });
      return;
    }

    const match = cuponesActivos.find(
      (c) => (c.Codigo || c.codigo || '').trim().toUpperCase() === cleanInput
    );

    if (match) {
      const discountPercentage = Number(
        match['Descuento Porcentaje'] ?? match.descuentoPorcentaje ?? 0
      );
      setAppliedCoupon({
        code: match.Codigo || match.codigo,
        discountPercentage,
      });
      setCouponFeedback({
        type: 'success',
        message: `Cupón ${match.Codigo || match.codigo} aplicado: ${discountPercentage}% de descuento.`,
      });
    } else {
      setCouponFeedback({
        type: 'error',
        message: 'El cupón no es válido o se encuentra inactivo.',
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);
  };

  // Copia al portapapeles del Alias Bancario
  const handleCopyAlias = async () => {
    if (!aliasBancario) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(aliasBancario);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = aliasBancario;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2400);
    } catch (err) {
      console.error('Error al copiar el alias al portapapeles:', err);
    }
  };

  // CÁLCULOS FINALES
  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + parsePrice(item.price) * item.quantity, 0);
  }, [cart]);

  const selectedZoneObj = useMemo(() => {
    return zonasEnvio.find((z) => z['Nombre de la Zona'] === zone);
  }, [zonasEnvio, zone]);

  // Si la promoción del banner es Envío Gratis, se bonifica el 100% del costo de entrega
  const isFreeShippingActive = Boolean(deliveryType === 'delivery' && bannerPromo?.isFreeShipping);
  const rawDeliveryFee = deliveryType === 'delivery' && selectedZoneObj ? selectedZoneObj.Costo : 0;
  const deliveryFee = isFreeShippingActive ? 0 : rawDeliveryFee;

  // Descuento de Producto por Banner (Bebida de regalo o 3x2) con nombre completo
  const productDiscountAmount = productPromo?.discountAmount || 0;

  // Descuento de Porcentaje (Cupón manual o porcentaje en banner)
  const promoPercent = bannerPromo?.discountPercent || 0;
  const couponPercent = appliedCoupon?.discountPercentage || 0;
  const effectiveDiscountPercentage = Math.max(couponPercent, promoPercent);

  const percentDiscountAmount = useMemo(() => {
    if (effectiveDiscountPercentage <= 0) return 0;
    const baseSubtotal = Math.max(0, subtotal - productDiscountAmount);
    return Math.round((baseSubtotal * effectiveDiscountPercentage) / 100);
  }, [subtotal, productDiscountAmount, effectiveDiscountPercentage]);

  const totalDiscountAmount = productDiscountAmount + percentDiscountAmount;

  const total = Math.max(0, subtotal - totalDiscountAmount) + deliveryFee;

  // Validación para el botón de pedido
  const isOrderValid = () => {
    if (!localAbierto) return false;
    if (cart.length === 0) return false;
    if (deliveryType === 'delivery') {
      if (!zone || zone.trim() === '' || !address.trim()) return false;
    }
    return true;
  };

  // GENERADOR DE WHATSAPP CON TEMPLATE LITERAL (Formato ejecutivo limpio sin emojis)
  const sendOrderToWhatsApp = () => {
    if (!isOrderValid()) return;

    let message = `*NUEVO PEDIDO*\n`;
    message += `--------------------------------\n`;
    message += `*Detalle del pedido:*\n`;

    cart.forEach((item) => {
      const priceNum = parsePrice(item.price);
      const itemSub = priceNum * item.quantity;
      message += `- ${item.quantity}x ${item.title} (${formatPrice(itemSub)})\n`;
    });

    message += `--------------------------------\n`;
    message += `*Subtotal:* ${formatPrice(subtotal)}\n`;

    // Descuento de producto (Bebida de regalo o 3x2) detallando el nombre completo del producto
    if (productPromo && productDiscountAmount > 0) {
      message += `*Descuento Promoción (${productPromo.description}):* -${formatPrice(productDiscountAmount)}\n`;
    }

    if (appliedCoupon && percentDiscountAmount > 0) {
      message += `*Descuento Cupón (${appliedCoupon.code} - ${appliedCoupon.discountPercentage}%):* -${formatPrice(percentDiscountAmount)}\n`;
    } else if (promoPercent > 0 && percentDiscountAmount > 0) {
      message += `*Descuento Promoción ("${bannerPromo?.raw}" - ${promoPercent}%):* -${formatPrice(percentDiscountAmount)}\n`;
    }

    if (deliveryType === 'delivery') {
      message += `*Tipo de entrega:* Delivery\n`;
      if (isFreeShippingActive && selectedZoneObj) {
        message += `*Zona de entrega:* ${zone} (Envío Gratis - Promoción "${bannerPromo?.raw}" aplicada: Bonificado $0)\n`;
      } else {
        message += `*Zona de entrega:* ${zone} (${deliveryFee > 0 ? formatPrice(deliveryFee) : 'Envío sin cargo'})\n`;
      }
      message += `*Dirección:* ${address.trim()}\n`;
    } else {
      message += `*Tipo de entrega:* Retiro por local (Takeaway)\n`;
    }

    message += `--------------------------------\n`;
    message += `*TOTAL A PAGAR:* *${formatPrice(total)}*\n`;
    message += `*Método de pago:* ${paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'}\n`;
    message += `--------------------------------\n`;

    if (paymentMethod === 'transferencia') {
      message += `*A continuación te envío el comprobante de transferencia.*`;
    } else {
      message += `Aguardamos confirmación del pedido.`;
    }

    const cleanNumber = whatsapp.replace(/\D/g, '');
    const urlWaMe = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(urlWaMe, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop con desenfoque suave */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity cursor-pointer animate-fade-in"
        onClick={onClose}
        aria-label="Cerrar carrito"
      />

      {/* Panel Lateral Drawer (Offcanvas) */}
      <aside
        className="relative w-full max-w-lg h-[100dvh] shadow-2xl flex flex-col overflow-hidden rounded-l-[28px] md:rounded-l-[36px] border-l border-white/10 z-10 transition-transform duration-300"
        style={{ backgroundColor: paleta.fondoSecundario }}
      >
        {/* HEADER DEL CARRITO */}
        <header className="p-5 md:p-6 flex justify-between items-center border-b border-white/10 bg-black/30 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-black"
              style={{ backgroundColor: paleta.colorPrimario }}
            >
              <svg className="w-5 h-5 text-neutral-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Tu Carrito
              </h2>
              <span className="text-xs text-neutral-400 font-medium">
                {totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* CONTENIDO DESPLAZABLE (FLUJO DE ARRIBA HACIA ABAJO) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 overscroll-contain">
          {/* BANNER INFORMATIVO DE BENEFICIO ACTIVO EN EL PEDIDO */}
          {bannerPromo && cart.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between text-xs animate-fade-in shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  {bannerPromo.isFreeShipping ? (
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.215-9.135m-1.75 10.259v-3.75a1.5 1.5 0 00-1.5-1.5h-2.25m-6.75 5.25V6.75a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v4.5" />
                    </svg>
                  ) : productPromo ? (
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {productPromo && !productPromo.isFullyApplied ? 'Promoción Disponible' : 'Beneficio del Banner Aplicado'}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${productPromo && !productPromo.isFullyApplied ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                  </div>
                  <p className="text-xs text-neutral-200 font-semibold truncate">
                    {bannerPromo.isFreeShipping
                      ? selectedZoneObj && selectedZoneObj.Costo > 0
                        ? `Envío Gratis aplicado (Ahorrás ${formatPrice(selectedZoneObj.Costo)})`
                        : 'Envío 100% bonificado en tu pedido'
                      : productPromo
                      ? productPromo.statusText
                      : `${bannerPromo.raw} aplicado`}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 border ${
                productPromo && !productPromo.isFullyApplied
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {bannerPromo.isFreeShipping ? 'Envío $0' : productPromo && !productPromo.isFullyApplied ? 'Pendiente' : 'Aplicado'}
              </span>
            </div>
          )}

          {/* 1. LISTA DE PRODUCTOS */}
          <section aria-label="Lista de Productos">
            <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-neutral-400 block mb-3">
              Productos en el Pedido
            </span>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-white/5 border border-white/10">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-1">El carrito está vacío</h3>
                <p className="text-xs text-neutral-400 max-w-xs mb-5 leading-relaxed">
                  Seleccioná tus platos desde la carta para conformar tu pedido.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-950 transition-all hover:opacity-90 active:scale-95 shadow cursor-pointer"
                  style={{ backgroundColor: paleta.colorPrimario }}
                >
                  Explorar Menú
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const priceNum = parsePrice(item.price);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 bg-white/[0.03] p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Imagen con fallback limpio */}
                      {item.imagePath ? (
                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                          <img
                            src={normalizeImageUrl(item.imagePath)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
                          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v1.5m-7.5 9h15m-16.5 3h18m-16.5-3a7.5 7.5 0 0115 0" />
                          </svg>
                        </div>
                      )}

                      {/* Título y Precio Unitario */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-sm text-neutral-100 truncate">{item.title}</span>
                        <span className="text-xs text-neutral-400 mt-0.5">
                          Unitario: <strong className="text-amber-400 font-semibold">{formatPrice(priceNum)}</strong>
                        </span>
                        <span className="text-xs font-bold text-neutral-300 mt-0.5">
                          Subtotal: {formatPrice(priceNum * item.quantity)}
                        </span>

                        {/* Badge dinámico de regalo o NxM si este producto tiene el descuento activo */}
                        {productPromo && productDiscountAmount > 0 && productPromo.discountedItem?.id === item.id && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold w-fit mt-1.5">
                            <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>{productPromo.badgeText}</span>
                          </div>
                        )}
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="flex items-center gap-2 bg-black/50 rounded-lg px-2 py-1 border border-white/10 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition cursor-pointer"
                          aria-label="Restar una unidad"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs text-white w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition cursor-pointer"
                          aria-label="Sumar una unidad"
                        >
                          +
                        </button>
                      </div>

                      {/* Botón para Eliminar Producto */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                        title="Eliminar producto"
                        aria-label={`Eliminar ${item.title}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Secciones siguientes (solo si hay ítems en el carrito) */}
          {cart.length > 0 && (
            <>
              {/* 2. LOGÍSTICA (DELIVERY VS TAKEAWAY) */}
              <section aria-label="Logística de Entrega" className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                    Forma de Entrega
                  </span>

                  {soloTakeaway && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold tracking-wider uppercase">
                      Modo Lluvia Activo
                    </span>
                  )}
                </div>

                {/* Aviso informativo si Solo Takeaway está activo */}
                {soloTakeaway && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/25 text-blue-200 text-xs flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <p className="leading-tight text-neutral-300">
                      Por condiciones climáticas, momentáneamente solo se encuentra disponible el <strong>Retiro por local</strong>.
                    </p>
                  </div>
                )}

                {/* Selector tipo Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('takeaway')}
                    className={`py-2.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      deliveryType === 'takeaway'
                        ? 'bg-amber-500 text-neutral-950 shadow-sm font-black'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25a.75.75 0 01-.75-.75V8.25a.75.75 0 01.375-.65l9-5.25a.75.75 0 01.75 0l9 5.25a.75.75 0 01.375.65v12a.75.75 0 01-.75.75h-7.5" />
                    </svg>
                    <span>Retiro por Local</span>
                  </button>

                  {!soloTakeaway ? (
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`py-2.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        deliveryType === 'delivery'
                          ? 'bg-amber-500 text-neutral-950 shadow-sm font-black'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.215-9.135m-1.75 10.259v-3.75a1.5 1.5 0 00-1.5-1.5h-2.25m-6.75 5.25V6.75a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v4.5" />
                      </svg>
                      <span>Delivery</span>
                      {isFreeShippingActive && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-neutral-950 px-1.5 py-0.5 rounded shadow-xs ml-0.5">
                          Gratis
                        </span>
                      )}
                    </button>
                  ) : null}
                </div>

                {/* Si elige Delivery: desplegamos select de zonas e input de dirección */}
                {deliveryType === 'delivery' && !soloTakeaway && (
                  <div className="space-y-2.5 pt-1 animate-fade-in">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                        Zona de Entrega
                      </label>
                      <div className="relative">
                        <select
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                          className="w-full py-3 pl-3.5 pr-10 rounded-xl bg-neutral-900 border border-white/10 text-white font-medium text-xs outline-none focus:border-amber-500 transition-colors cursor-pointer appearance-none"
                        >
                          <option value="" className="bg-neutral-900 text-neutral-400">
                            {isFreeShippingActive ? 'Seleccioná tu zona (¡Envío 100% bonificado!)...' : 'Seleccioná una zona de entrega...'}
                          </option>
                          {zonasEnvio.map((z) => (
                            <option key={z.id} value={z['Nombre de la Zona']} className="bg-neutral-900 text-white">
                              {z['Nombre de la Zona']} — {isFreeShippingActive ? `Gratis (Ahorrás ${formatPrice(z.Costo)})` : z.Costo > 0 ? `+${formatPrice(z.Costo)}` : 'Sin cargo'}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                        Dirección de entrega
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Calle, número, piso o referencias..."
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs outline-none focus:border-amber-500 placeholder:text-neutral-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* 3. MOTOR DE CUPONES */}
              <section aria-label="Motor de Cupones" className="space-y-2.5 pt-3 border-t border-white/5">
                <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-neutral-400 block">
                  Cupón de Descuento
                </span>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={Boolean(appliedCoupon)}
                      placeholder="Código promocional..."
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs uppercase font-mono tracking-wider outline-none focus:border-amber-500 placeholder:normal-case placeholder:font-sans placeholder:text-neutral-500 disabled:opacity-50 transition-colors"
                    />
                  </div>

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Quitar
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95"
                    >
                      Aplicar
                    </button>
                  )}
                </form>

                {couponFeedback && (
                  <p
                    className={`text-xs font-medium flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      couponFeedback.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-950/30 border-red-500/30 text-red-300'
                    }`}
                  >
                    {couponFeedback.type === 'success' ? (
                      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                    <span>{couponFeedback.message}</span>
                  </p>
                )}
              </section>

              {/* 4. MÉTODO DE PAGO & CAJA DE ALIAS CONDICIONAL */}
              <section aria-label="Método de Pago" className="space-y-3 pt-3 border-t border-white/5">
                <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-neutral-400 block">
                  Método de Pago
                </span>

                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`py-2.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'bg-amber-500 text-neutral-950 shadow-sm font-black'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <rect width="20" height="12" x="2" y="6" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                      <path strokeLinecap="round" d="M6 12h.01M18 12h.01" />
                    </svg>
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`py-2.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === 'transferencia'
                        ? 'bg-amber-500 text-neutral-950 shadow-sm font-black'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    <span>Transferencia</span>
                  </button>
                </div>

                {/* Caja de Alias (Condicional a Transferencia) */}
                {paymentMethod === 'transferencia' && (
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                        Datos para Transferencia
                      </span>
                      <span className="text-[10px] bg-white/5 text-neutral-300 px-2 py-0.5 rounded font-mono font-medium border border-white/10">
                        CBU / CVU
                      </span>
                    </div>

                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase text-neutral-400 block font-semibold">
                            Alias Bancario
                          </span>
                          <span className="font-mono font-bold text-amber-400 text-sm sm:text-base select-all truncate block">
                            {aliasBancario}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyAlias}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer active:scale-95 shrink-0"
                          title="Copiar alias al portapapeles"
                        >
                          {copiedAlias ? (
                            <>
                              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="border-t border-white/5 pt-2">
                        <span className="text-[10px] uppercase text-neutral-400 block font-semibold">
                          Titular Cuenta
                        </span>
                        <span className="text-xs font-semibold text-neutral-200">
                          {titularCuenta}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 font-medium flex items-center gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 leading-tight">
                      <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="16" y2="12" />
                        <line x1="12" x2="12.01" y1="8" y2="8" />
                      </svg>
                      <span>Copiá el Alias, transferí el Total y prepará la captura</span>
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* FOOTER DEL CARRITO (CÁLCULOS, BOTÓN DINÁMICO Y WHATSAPP) */}
        {cart.length > 0 && (
          <footer className="p-5 md:p-6 bg-neutral-900 border-t border-white/10 shrink-0 space-y-4">
            {/* Desglose de Cálculo Final */}
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Subtotal productos:</span>
                <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
              </div>

              {/* Descuento por Producto del Banner (Bebida de regalo o 3x2) con el NOMBRE COMPLETO */}
              {productPromo && productDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-medium">
                  <span>Descuento {productPromo.description}:</span>
                  <span>-{formatPrice(productDiscountAmount)}</span>
                </div>
              )}

              {appliedCoupon && percentDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-medium">
                  <span>Descuento cupón ({appliedCoupon.code} - {appliedCoupon.discountPercentage}%):</span>
                  <span>-{formatPrice(percentDiscountAmount)}</span>
                </div>
              )}

              {!appliedCoupon && promoPercent > 0 && percentDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-medium">
                  <span>Descuento promoción ({bannerPromo?.raw} - {promoPercent}%):</span>
                  <span>-{formatPrice(percentDiscountAmount)}</span>
                </div>
              )}

              {deliveryType === 'delivery' && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">
                    Costo de envío {selectedZoneObj ? `(${selectedZoneObj['Nombre de la Zona']})` : ''}:
                  </span>
                  <span className="font-semibold text-white">
                    {isFreeShippingActive ? (
                      <span className="flex items-center gap-2">
                        {selectedZoneObj && selectedZoneObj.Costo > 0 && (
                          <span className="line-through text-neutral-500 text-xs font-normal">
                            +{formatPrice(selectedZoneObj.Costo)}
                          </span>
                        )}
                        <span className="text-emerald-400 font-bold">
                          Gratis (Promoción {bannerPromo?.raw})
                        </span>
                      </span>
                    ) : selectedZoneObj ? (
                      deliveryFee > 0 ? (
                        `+${formatPrice(deliveryFee)}`
                      ) : (
                        'Sin cargo'
                      )
                    ) : (
                      <span className="text-neutral-400 font-normal">A seleccionar zona</span>
                    )}
                  </span>
                </div>
              )}

              {deliveryType === 'takeaway' && (
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Retiro por local:</span>
                    <span className="text-neutral-300">Sin cargo adicional</span>
                  </div>
                  {bannerPromo?.isFreeShipping && !soloTakeaway && (
                    <p className="text-[11px] text-amber-400 font-medium">
                      Tip: Tenés la promoción de Envío Gratis activa si preferís recibirlo por Delivery.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-base">
                <span className="font-bold uppercase tracking-wider text-neutral-200">Total:</span>
                <span className="text-2xl font-black text-amber-400">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Botón Dinámico de Pedido */}
            <div>
              {!localAbierto ? (
                // CASO 1: Local Cerrado
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                  >
                    <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Local Cerrado Momentáneamente</span>
                  </button>
                  <p className="text-xs text-neutral-400 text-center font-medium">
                    Horarios de Atención: <span className="text-neutral-200">{horariosAtencion}</span>
                  </p>
                </div>
              ) : (
                // CASO 2 & 3: Local Abierto (Efectivo / Transferencia)
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={sendOrderToWhatsApp}
                    disabled={!isOrderValid()}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95 ${
                      !isOrderValid()
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                        : 'bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_4px_20px_rgba(37,211,102,0.3)] cursor-pointer'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>
                      {paymentMethod === 'transferencia' ? 'Enviar Pedido y Comprobante' : 'Enviar Pedido'}
                    </span>
                  </button>

                  {deliveryType === 'delivery' && (!zone || !address.trim()) && (
                    <p className="text-[11px] text-amber-400/90 text-center font-medium">
                      Por favor, seleccioná una zona y completá tu dirección para continuar.
                    </p>
                  )}
                </div>
              )}
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;