import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, GarmentSize } from '@/types';

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (garmentId: string, size: GarmentSize) => void;
  updateQuantity: (garmentId: string, size: GarmentSize, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.garment_id === item.garment_id && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.garment_id === item.garment_id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (garmentId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.garment_id === garmentId && i.size === size)
          ),
        })),

      updateQuantity: (garmentId, size, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.garment_id === garmentId && i.size === size)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.garment_id === garmentId && i.size === size
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.unit_price_myr * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'olvon-cart-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
