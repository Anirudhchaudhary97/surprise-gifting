'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import api from '@/lib/api';
import { Cart } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setCart, updateItemCount } = useCartStore();

    const { data: cart, isLoading } = useQuery<Cart>({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await api.get('/cart');
            setCart(res.data);
            return res.data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
            const res = await api.put('/cart/update', { cartItemId, quantity });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
            setCart(data);
        },
    });

    const removeMutation = useMutation({
        mutationFn: async (cartItemId: string) => {
            const res = await api.delete(`/cart/remove/${cartItemId}`);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['cart'], data);
            setCart(data);
        },
    });

    const subtotal = cart?.subtotal || 0;
    const tax = subtotal * 0.13; // 13% VAT
    const deliveryCharge = 100;
    const total = subtotal + tax + deliveryCharge;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 bg-gray-50">
                <div className="container-custom">
                    <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                    {!cart || cart.items.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 mb-8">Looks like you haven't added any gifts yet.</p>
                            <Link href="/gifts">
                                <Button size="lg">Start Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items */}
                            <div className="flex-grow space-y-4">
                                {cart.items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={(qty) =>
                                            updateMutation.mutate({ cartItemId: item.id, quantity: qty })
                                        }
                                        onRemove={() => removeMutation.mutate(item.id)}
                                        isUpdating={updateMutation.isPending || removeMutation.isPending}
                                    />
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="w-full lg:w-96 shrink-0">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>VAT (13%)</span>
                                            <span>{formatPrice(tax)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Delivery Charge</span>
                                            <span>{formatPrice(deliveryCharge)}</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                            <span>Total</span>
                                            <span>{formatPrice(total)}</span>
                                        </div>
                                    </div>

                                    <Link href="/checkout">
                                        <Button fullWidth size="lg">
                                            Proceed to Checkout
                                        </Button>
                                    </Link>

                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        Secure checkout powered by Stripe
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
