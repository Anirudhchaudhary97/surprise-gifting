"use client";

import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total());
    const clear = useCartStore((state) => state.clear);

    return (
        <div className="space-y-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
                <p className="text-muted-foreground">Review items and surprise someone special.</p>
            </header>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                    <h2 className="text-xl font-semibold">Your cart is waiting</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Browse our curated gifts and add them here.</p>
                    <Button asChild className="mt-6">
                        <Link href="/gifts">Find gifts</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        {items.map((item) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>
                    <aside className="space-y-4 rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">Order summary</h2>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Delivery</span>
                                <span>Free</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="space-y-3">
                            <Button asChild size="lg" className="w-full">
                                <Link href="/checkout">Proceed to checkout</Link>
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={clear}>
                                Clear cart
                            </Button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
