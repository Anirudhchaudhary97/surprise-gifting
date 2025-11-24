'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import api from '@/lib/api';
import { Cart, Address } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutForm {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

function CheckoutFormContent({ cart }: { cart: Cart }) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { clearCart } = useCartStore();
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();

    const subtotal = cart.subtotal;
    const tax = subtotal * 0.13;
    const deliveryCharge = 100;
    const total = subtotal + tax + deliveryCharge;

    const onSubmit = async (data: CheckoutForm) => {
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError('');

        try {
            // 1. Create Order
            const orderRes = await api.post('/orders', {
                address: data,
            });
            const { order, clientSecret } = orderRes.data;

            // 2. Confirm Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        name: data.fullName,
                        email: order.user?.email,
                        address: {
                            line1: data.addressLine,
                            city: data.city,
                            state: data.state,
                            postal_code: data.zipCode,
                            country: 'NP', // Defaulting to Nepal for now
                        },
                    },
                },
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
                setIsProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    clearCart();
                    queryClient.invalidateQueries({ queryKey: ['cart'] });
                    router.push(`/orders/${order.id}`);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Details */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Full Name"
                            {...register('fullName', { required: 'Full name is required' })}
                            error={errors.fullName?.message}
                        />
                        <Input
                            label="Phone Number"
                            {...register('phone', { required: 'Phone number is required' })}
                            error={errors.phone?.message}
                        />
                        <Input
                            label="Address Line"
                            {...register('addressLine', { required: 'Address is required' })}
                            error={errors.addressLine?.message}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="City"
                                {...register('city', { required: 'City is required' })}
                                error={errors.city?.message}
                            />
                            <Input
                                label="State/Province"
                                {...register('state', { required: 'State is required' })}
                                error={errors.state?.message}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="ZIP Code"
                                {...register('zipCode', { required: 'ZIP code is required' })}
                                error={errors.zipCode?.message}
                            />
                            <Input
                                label="Country"
                                defaultValue="Nepal"
                                {...register('country', { required: 'Country is required' })}
                                error={errors.country?.message}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6">Payment Details</h2>
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }}
                        />
                    </div>
                    {error && (
                        <div className="mt-4 text-sm text-error bg-error/10 p-3 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                    {/* We can add image here if needed, but keeping it simple for summary */}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm font-medium line-clamp-1">{item.gift.name}</h4>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <span className="text-sm font-semibold">
                                    {formatPrice(item.gift.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
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

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isProcessing}
                        disabled={!stripe || isProcessing}
                    >
                        Pay {formatPrice(total)}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        Your payment is secured by Stripe. We do not store your card details.
                    </p>
                </div>
            </div>
        </form>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: cart, isLoading } = useQuery<Cart>({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await api.get('/cart');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        router.push('/cart');
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 bg-gray-50">
                <div className="container-custom">
                    <h1 className="text-3xl font-bold mb-8">Checkout</h1>
                    <Elements stripe={stripePromise}>
                        <CheckoutFormContent cart={cart} />
                    </Elements>
                </div>
            </main>
            <Footer />
        </div>
    );
}
