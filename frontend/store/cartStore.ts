'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '@/types';

interface CartStore {
    cart: Cart | null;
    setCart: (cart: Cart | null) => void;
    clearCart: () => void;
    itemCount: number;
    updateItemCount: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cart: null,
            itemCount: 0,
            setCart: (cart) => {
                set({ cart });
                get().updateItemCount();
            },
            clearCart: () => {
                set({ cart: null, itemCount: 0 });
            },
            updateItemCount: () => {
                const cart = get().cart;
                const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                set({ itemCount: count });
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
