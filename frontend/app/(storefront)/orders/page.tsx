"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrdersQuery } from "@/hooks/use-gift-queries";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatCurrency } from "@/lib/utils";

const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    preparing: "bg-sky-100 text-sky-700",
    dispatched: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
};

export default function OrdersPage() {
    const token = useAuthStore((state) => state.token);
    const { data: orders = [], isLoading } = useOrdersQuery(token);

    if (!token) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                    <h2 className="text-xl font-semibold">Sign in to track your orders</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your order history will appear once you are logged in.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button asChild>
                            <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/register">Create account</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">Track the surprises you have already scheduled.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/gifts">Keep shopping</Link>
                </Button>
            </header>

            {isLoading ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
                    Loading your orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                    <h2 className="text-xl font-semibold">No orders yet</h2>
                    <p className="mt-2 text-sm text-muted-foreground">We will show your delivery timeline here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order ID</p>
                                    <p className="text-lg font-semibold">{order.id}</p>
                                </div>
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                                        statusStyles[order.status] ?? "bg-muted text-muted-foreground",
                                    )}
                                >
                                    {order.status}
                                </span>
                                <div className="text-sm text-muted-foreground">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                                <Button asChild>
                                    <Link href={`/orders/${order.id}`}>View details</Link>
                                </Button>
                            </div>
                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {order.items.map((item) => (
                                    <div key={item.giftId} className="rounded-xl border border-border p-4">
                                        <p className="text-sm font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty {item.quantity} • {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
