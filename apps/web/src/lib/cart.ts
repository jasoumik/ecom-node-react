import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  variantId?: string; // Added variantId
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        // Check if item with same product ID AND variant ID exists
        const existingItem = currentItems.find((i) => i.id === item.id && i.variantId === item.variantId);
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id && i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (id, variantId) => {
        set({ items: get().items.filter((i) => !(i.id === id && i.variantId === variantId)) });
      },
      updateQuantity: (id, quantity, variantId) => {
        if (quantity <= 0) {
            get().removeItem(id, variantId);
            return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id && i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
