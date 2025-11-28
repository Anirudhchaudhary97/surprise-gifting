"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createDirectOrder, type CheckoutOrderPayload } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export default function CheckoutPage() {
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total());
    const clear = useCartStore((state) => state.clear);
    const removeItem = useCartStore((state) => state.removeItem);
    const token = useAuthStore((state) => state.token);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
    const hasItems = items.length > 0;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!hasItems) {
            setErrorMessage("Your cart is empty. Add gifts before checking out.");
            return;
        }

        if (!token) {
            setErrorMessage("Please sign in to place your order.");
            return;
        }

        const formElement = event.currentTarget;
        const formData = new FormData(formElement);

        const shipping = {
            fullName: String(formData.get("fullName") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            addressLine1: String(formData.get("addressLine1") ?? "").trim(),
            addressLine2: String(formData.get("addressLine2") ?? "").trim() || undefined,
            city: String(formData.get("city") ?? "").trim(),
            state: String(formData.get("state") ?? "").trim(),
            postalCode: String(formData.get("postalCode") ?? "").trim(),
            country: String(formData.get("country") ?? "Nepal").trim() || "Nepal",
        } satisfies CheckoutOrderPayload["shipping"];

        const noteValue = String(formData.get("note") ?? "").trim();

        const payload: CheckoutOrderPayload = {
            shipping,
            items: items.map((item) => ({
                giftId: item.giftId ?? item.id,
                giftName: item.name,
                image: item.image,
                quantity: item.quantity,
                unitPrice: item.price,
                basePrice: item.basePrice ?? item.price,
                addons: item.addons?.map((addon) => ({
                    id: addon.id,
                    name: addon.name,
                    price: addon.price,
                })),
                personalMessage: item.personalization?.message,
                giftWrapPrice: item.personalization?.giftWrap?.enabled
                    ? item.personalization.giftWrap.price ?? 0
                    : undefined,
                artworkUrl: item.personalization?.artwork?.previewUrl,
            })),
            totals: {
                subtotal: items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                ),
                tax: 0,
                deliveryCharge: 0,
                total,
            },
            note: noteValue.length ? noteValue : undefined,
            paymentMethod,
        };

        setIsSubmitting(true);

        createDirectOrder(payload, token)
            .then((order) => {
                clear();
                formElement.reset();
                setPaymentMethod("cod");
                router.push(`/orders/${order.id}`);
            })
            .catch((error: unknown) => {
                let message = "Failed to place order. Please try again.";

                if (error instanceof Error) {
                    const rawMessage = error.message.trim();

                    if (/^insufficient stock for/i.test(rawMessage)) {
                        const soldOutName = rawMessage.replace(/insufficient stock for/i, "").trim();

                        if (soldOutName.length) {
                            const matchingItem = items.find(
                                (item) => item.name.toLowerCase() === soldOutName.toLowerCase()
                            );

                            if (matchingItem) {
                                items
                                    .filter((item) => item.giftId === matchingItem.giftId)
                                    .forEach((item) => removeItem(item.id));
                            }

                            message = `"${soldOutName}" just sold out. We removed it from your cart so you can continue checking out.`;
                        } else {
                            message = "One of the gifts in your cart just sold out. Please review the cart before trying again.";
                        }
                    } else {
                        message = rawMessage;
                    }
                }

                setErrorMessage(message);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div className="space-y-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                <p className="text-muted-foreground">Share delivery details and we will handle the rest.</p>
            </header>

            {errorMessage ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}

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
                                <p className="text-sm text-muted-foreground">Choose how you would like to pay.</p>
                            </div>
                            <Select
                                value={paymentMethod}
                                onValueChange={(value) => setPaymentMethod(value as "cod" | "stripe")}
                            >
                                <SelectTrigger aria-label="Payment method">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cod">Cash on delivery</SelectItem>
                                    <SelectItem value="stripe">Pay with card (Stripe)</SelectItem>
                                </SelectContent>
                            </Select>
                            {paymentMethod === "stripe" ? (
                                <div className="space-y-4">
                                    <Input name="cardNumber" placeholder="Card number" required />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Input name="expiry" placeholder="MM/YY" required />
                                        <Input name="cvc" placeholder="CVC" required />
                                    </div>
                                </div>
                            ) : (
                                <p className="rounded-md border border-dashed border-border/80 bg-muted/30 p-3 text-sm text-muted-foreground">
                                    We will collect payment in cash when the gift is delivered.
                                </p>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-4 rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">Order summary</h2>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            {items.map((item) => {
                                const basePrice = item.basePrice ?? item.price;
                                const addons = item.addons ?? [];
                                const personalization = item.personalization;
                                const lineTotal = item.price * item.quantity;

                                return (
                                    <div key={item.id} className="space-y-1 rounded-lg border border-border/60 p-3">
                                        <div className="flex items-center justify-between text-foreground">
                                            <span className="font-medium">
                                                {item.name} × {item.quantity}
                                            </span>
                                            <span className="font-semibold">{formatCurrency(lineTotal)}</span>
                                        </div>
                                        <p className="text-xs">
                                            Base unit: {formatCurrency(basePrice)} • Unit total: {formatCurrency(item.price)}
                                        </p>
                                        {addons.length ? (
                                            <div className="text-xs">
                                                <p className="font-medium text-foreground">Add-ons</p>
                                                <ul className="mt-1 space-y-1">
                                                    {addons.map((addon) => (
                                                        <li key={addon.id} className="flex items-center justify-between gap-4">
                                                            <span>{addon.name}</span>
                                                            <span>{formatCurrency(addon.price)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}
                                        {personalization?.giftWrap?.enabled ? (
                                            <p className="text-xs text-foreground">
                                                Gift wrap included ({formatCurrency(personalization.giftWrap.price)})
                                            </p>
                                        ) : null}
                                        {personalization?.message ? (
                                            <p className="text-xs italic">Personal message: "{personalization.message}"</p>
                                        ) : null}
                                        {personalization?.artwork?.fileName ? (
                                            <p className="text-xs">Artwork: {personalization.artwork.fileName}</p>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
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
