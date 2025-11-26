import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(
          (cartItem) => cartItem.id === item.id
        );
        if (existing) {
          set({
            items: get().items.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
          ),
        }),
      clear: () => set({ items: [] }),
      total: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      count: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);

type CartStoreWithPersist = typeof useCartStore & {
  persist: {
    rehydrate: () => Promise<void>;
    hasHydrated: () => boolean;
  };
};

export const cartStorePersist = (useCartStore as CartStoreWithPersist).persist;
