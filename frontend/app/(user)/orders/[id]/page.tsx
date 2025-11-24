'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: order, isLoading } = useQuery<Order>({
        queryKey: ['order', id],
        queryFn: async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                return res.data;
            } catch (error) {
                router.push('/orders');
                throw error;
            }
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 bg-gray-50">
                <div className="container-custom">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">Order Details</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-gray-500">Order #{order.id}</p>
                        </div>
                        <Link href="/orders">
                            <Button variant="outline">Back to Orders</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6">Items</h2>
                                <div className="space-y-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                                {/* Image placeholder - ideally we'd have the image URL here */}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{item.gift.name}</h3>
                                                        <p className="text-sm text-gray-500">{item.gift.category?.name}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                                </div>

                                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                    <p>Quantity: {item.quantity}</p>
                                                    {item.personalMessage && (
                                                        <p>Message: "{item.personalMessage}"</p>
                                                    )}
                                                    {item.selectedAddons.length > 0 && (
                                                        <p>Add-ons: {item.selectedAddons.join(', ')}</p>
                                                    )}
                                                    {item.deliveryDate && (
                                                        <p>Delivery: {formatDate(item.deliveryDate)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary & Shipping */}
                        <div className="space-y-6">
                            {/* Shipping Info */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                                    <p>{order.address.addressLine}</p>
                                    <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                                    <p>{order.address.country}</p>
                                    <p className="pt-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {order.address.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>VAT (13%)</span>
                                        <span>{formatPrice(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Charge</span>
                                        <span>{formatPrice(order.deliveryCharge)}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total Paid</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium text-center">
                                    Payment Successful via Card
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
