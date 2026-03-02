import { create } from 'zustand';
import type { Store, GarmentCategory } from '@/types';

export type DressingRoomView = 'stores' | 'categories' | 'garments';

interface DressingRoomState {
  currentView: DressingRoomView;
  selectedStore: Store | null; // null = Favourites mode
  selectedCategory: GarmentCategory | null;

  // Actions
  goToStores: () => void;
  selectStore: (store: Store | null) => void;
  selectCategory: (category: GarmentCategory) => void;
  goBack: () => void;
  reset: () => void;
}

export const useDressingRoomStore = create<DressingRoomState>((set, get) => ({
  currentView: 'stores',
  selectedStore: null,
  selectedCategory: null,

  goToStores: () =>
    set({
      currentView: 'stores',
      selectedStore: null,
      selectedCategory: null,
    }),

  selectStore: (store) => {
    if (store === null) {
      // Favourites mode: skip categories, go directly to garments
      set({
        selectedStore: null,
        selectedCategory: null,
        currentView: 'garments',
      });
    } else {
      // Normal store: show categories
      set({
        selectedStore: store,
        selectedCategory: null,
        currentView: 'categories',
      });
    }
  },

  selectCategory: (category) =>
    set({
      selectedCategory: category,
      currentView: 'garments',
    }),

  goBack: () => {
    const { currentView, selectedStore } = get();

    switch (currentView) {
      case 'garments':
        if (selectedStore === null) {
          // Coming from Favourites, go back to stores
          set({ currentView: 'stores', selectedCategory: null });
        } else {
          // Coming from a category, go back to categories
          set({ currentView: 'categories', selectedCategory: null });
        }
        break;
      case 'categories':
        set({
          currentView: 'stores',
          selectedStore: null,
          selectedCategory: null,
        });
        break;
      default:
        break;
    }
  },

  reset: () =>
    set({
      currentView: 'stores',
      selectedStore: null,
      selectedCategory: null,
    }),
}));
