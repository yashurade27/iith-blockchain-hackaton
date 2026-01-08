import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // rewardId
  name: string;
  cost: number;
  imageUrl?: string;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalCost: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: Math.min(item.quantity + 1, item.maxStock) }
                : item
            ),
            isOpen: true,
          };
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }], isOpen: true };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock) } : item
        ),
      })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalCost: () => get().items.reduce((acc, item) => acc + item.cost * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
