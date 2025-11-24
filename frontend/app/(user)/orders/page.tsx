'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await api.get('/orders/my-orders');
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

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 bg-gray-50">
                <div className="container-custom">
                    <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                    {!orders || orders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                            <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
                            <Link href="/gifts">
                                <Button size="lg">Start Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Order ID</p>
                                            <p className="font-mono font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                            <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Link href={`/orders/${order.id}`}>
                                                <Button variant="outline" size="sm">View Details</Button>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex flex-wrap gap-4">
                                            {order.items.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg pr-4">
                                                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden shrink-0">
                                                        {/* Image placeholder */}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.gift.name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {order._count?.items && order._count.items > 3 && (
                                                <div className="flex items-center justify-center bg-gray-50 px-4 rounded-lg text-sm text-gray-500">
                                                    +{order._count.items - 3} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
