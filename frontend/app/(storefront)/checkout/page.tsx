"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/stores/cart-store";

export default function CheckoutPage() {
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total());
    const clear = useCartStore((state) => state.clear);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasItems = items.length > 0;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!hasItems) return;

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            clear();
            alert("Thank you! Your surprise is on its way.");
        }, 1000);
    };

    return (
        <div className="space-y-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                <p className="text-muted-foreground">Share delivery details and we will handle the rest.</p>
            </header>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                    <h2 className="text-xl font-semibold">Your cart is empty</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Add gifts to proceed with checkout.</p>
                    <Button asChild className="mt-6">
                        <Link href="/gifts">Browse gifts</Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
                            <div>
                                <h2 className="text-lg font-semibold">Recipient details</h2>
                                <p className="text-sm text-muted-foreground">Who are we surprising?</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input name="fullName" placeholder="Full name" required />
                                <Input name="phone" placeholder="Contact number" required />
                                <Input name="email" placeholder="Email address" type="email" className="sm:col-span-2" />
                            </div>
                        </section>

                        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
                            <div>
                                <h2 className="text-lg font-semibold">Delivery address</h2>
                                <p className="text-sm text-muted-foreground">We deliver across major metros within 48 hours.</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input name="addressLine1" placeholder="Address line 1" required className="sm:col-span-2" />
                                <Input name="addressLine2" placeholder="Address line 2" className="sm:col-span-2" />
                                <Input name="city" placeholder="City" required />
                                <Input name="state" placeholder="State" required />
                                <Input name="postalCode" placeholder="Postal code" required />
                                <Input name="country" placeholder="Country" required />
                            </div>
                            <Textarea name="note" placeholder="Add a personal note (optional)" />
                        </section>

                        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
                            <div>
                                <h2 className="text-lg font-semibold">Payment</h2>
                                <p className="text-sm text-muted-foreground">Secure checkout via Stripe.</p>
                            </div>
                            <Input name="cardNumber" placeholder="Card number" required />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input name="expiry" placeholder="MM/YY" required />
                                <Input name="cvc" placeholder="CVC" required />
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4 rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">Order summary</h2>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <span>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Confirm order"}
                        </Button>
                        <Button asChild variant="ghost" className="w-full">
                            <Link href="/cart">Back to cart</Link>
                        </Button>
                    </aside>
                </form>
            )}
        </div>
    );
}
