"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { getCategories, getGifts, getOrders } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { type Gift, type Order, type Category } from "@/types";

export default function AdminOverviewPage() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getGifts(), getOrders(), getCategories()]).then(([giftsData, ordersData, categoriesData]) => {
            setGifts(giftsData);
            setOrders(ordersData);
            setCategories(categoriesData);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="space-y-10">
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Active gifts</p>
                    <p className="mt-3 text-3xl font-semibold">{gifts.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="mt-3 text-3xl font-semibold">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="mt-3 text-3xl font-semibold">{categories.length}</p>
                </div>
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Recent orders</h2>
                    <p className="text-sm text-muted-foreground">Monitor customer surprises currently in progress.</p>
                </div>
                <AdminTable
                    data={orders.slice(0, 5)}
                    columns={[
                        { key: "id", header: "Order ID" },
                        {
                            key: "status",
                            header: "Status",
                            render: (order) => <span className="capitalize">{order.status}</span>,
                        },
                        {
                            key: "createdAt",
                            header: "Placed",
                            render: (order) => new Date(order.createdAt).toLocaleDateString(),
                        },
                        {
                            key: "total",
                            header: "Total",
                            render: (order) => formatCurrency(order.total),
                        },
                    ]}
                    emptyState="No recent orders yet."
                />
            </section>
        </div>
    );
}
