"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOrderQuery } from "@/hooks/use-gift-queries";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    preparing: "bg-sky-100 text-sky-700",
    dispatched: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
};

export default function OrderDetailPage() {
    const params = useParams<{ id: string | string[] }>();
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const orderId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
    const { data: order, isLoading } = useOrderQuery(orderId, token);

    if (!token) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Order details</h1>
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                    <h2 className="text-xl font-semibold">Please sign in to view this order</h2>
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

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
                Loading order...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Order not found</h1>
                        <p className="text-muted-foreground">We could not find that order in your account.</p>
                    </div>
                    <Button onClick={() => router.push("/orders")} variant="outline">
                        Back to orders
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order {order.id}</h1>
                    <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/orders">Back to orders</Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-6 rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
                                statusStyles[order.status] ?? "bg-muted text-muted-foreground",
                            )}
                        >
                            {order.status}
                        </span>
                    </div>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.giftId} className="flex items-center justify-between rounded-xl border border-border p-4">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Quantity {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-4 rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold">Shipping address</h2>
                    <div className="text-sm text-muted-foreground">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                        <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                        <p>
                            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                    </div>
                    <div className="border-t border-border pt-4 text-sm">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>Delivery</span>
                            <span>Free</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-base font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
