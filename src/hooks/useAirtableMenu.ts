import { useMenuData } from './useMenuData';
import type { ProductData, DeliveryZoneData } from '../types/airtable';

export interface UseAirtableMenuReturn {
  products: ProductData[];
  deliveryZones: DeliveryZoneData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  [key: string]: any;
}

/**
 * Hook retrocompatible que delega en useMenuData y expone tanto la interfaz anterior
 * (products, deliveryZones, isLoading) como las nuevas entidades (data, configuracion, cupones).
 */
export function useAirtableMenu(): UseAirtableMenuReturn {
  const result = useMenuData();

  return {
    products: result.productos,
    deliveryZones: result.zonasEnvio,
    isLoading: result.loading,
    error: result.error,
    refetch: result.refetch,
    data: result.data,
    configuracion: result.configuracion,
    cupones: result.cupones,
    categoriasUnicas: result.categoriasUnicas,
  };
}

export { useMenuData };
