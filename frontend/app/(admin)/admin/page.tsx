"use client";

import { useEffect, useState, useMemo } from "react";
import { DollarSign, Package, ShoppingCart, Tags, TrendingUp } from "lucide-react";
import { AdminTable } from "@/components/admin/admin-table";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { getCategories, getGifts, getOrders } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { type Gift, type Order, type Category } from "@/types";

export default function AdminOverviewPage() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getGifts(), getOrders(), getCategories()]).then(([giftsResponse, ordersData, categoriesData]) => {
            setGifts(giftsResponse.gifts);
            setOrders(ordersData);
            setCategories(categoriesData);
            setLoading(false);
        });
    }, []);

    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
        const pendingOrders = orders.filter((o) => o.status === "pending").length;
        const lowStockGifts = gifts.filter((g) => (g.stock ?? 0) < 5).length;

        return [
            {
                label: "Total Revenue",
                value: formatCurrency(totalRevenue),
                icon: DollarSign,
                desc: "Lifetime earnings",
            },
            {
                label: "Orders",
                value: orders.length.toString(),
                icon: ShoppingCart,
                desc: `${pendingOrders} pending processing`,
            },
            {
                label: "Active Gifts",
                value: gifts.length.toString(),
                icon: Package,
                desc: `${lowStockGifts} low on stock`,
            },
            {
                label: "Categories",
                value: categories.length.toString(),
                icon: Tags,
                desc: "Active product lines",
            },
        ];
    }, [orders, gifts, categories]);

    if (loading) {
        return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <RevenueChart orders={orders} />
                </div>
                <div className="lg:col-span-3 space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Recent orders</h2>
                        <p className="text-sm text-muted-foreground">Latest transactions from the storefront.</p>
                    </div>
                    <AdminTable
                        data={orders.slice(0, 5)}
                        columns={[
                            { key: "id", header: "Order ID", render: (o) => <span className="font-mono text-xs">{o.id.slice(-6)}</span> },
                            {
                                key: "status",
                                header: "Status",
                                render: (order) => (
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                                            "bg-gray-100 text-gray-800"
                                        }`}>
                                        {order.status}
                                    </span>
                                ),
                            },
                            {
                                key: "total",
                                header: "Amount",
                                className: "text-right",
                                render: (order) => formatCurrency(order.total),
                            },
                        ]}
                        emptyState="No orders placed yet."
                    />
                </div>
            </div>
        </div>
    );
}
