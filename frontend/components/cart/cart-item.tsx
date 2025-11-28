"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { type CartItem as CartItemType } from "@/types";

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const subtotal = item.price * item.quantity;

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h4 className="text-base font-semibold">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                            Base price: {formatCurrency(item.basePrice)} | Unit total: {formatCurrency(item.price)}
                        </p>
                        {item.addons?.length ? (
                            <div className="text-xs text-muted-foreground">
                                <p className="font-medium text-foreground">Add-ons</p>
                                <ul className="mt-1 space-y-1">
                                    {item.addons.map((addon) => (
                                        <li key={addon.id} className="flex items-center justify-between gap-4">
                                            <span>{addon.name}</span>
                                            <span>{formatCurrency(addon.price)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {item.personalization?.message ? (
                            <p className="text-xs text-muted-foreground">
                                Personal note: "{item.personalization.message}"
                            </p>
                        ) : null}
                        {item.personalization?.giftWrap?.enabled ? (
                            <p className="text-xs text-muted-foreground">
                                Gift wrap added ({formatCurrency(item.personalization.giftWrap.price)})
                            </p>
                        ) : null}
                        {item.personalization?.artwork?.previewUrl ? (
                            <div className="text-xs text-muted-foreground">
                                <p className="font-medium text-foreground">Custom artwork</p>
                                <div className="mt-1 flex items-center gap-3">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                                        <Image
                                            src={item.personalization.artwork.previewUrl}
                                            alt={item.personalization.artwork.fileName ?? "Uploaded artwork"}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                            unoptimized
                                        />
                                    </div>
                                    <span>{item.personalization.artwork.fileName ?? "artwork.png"}</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center rounded-lg border border-border">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase quantity</span>
                        </Button>
                    </div>
                    <span className="text-sm font-semibold text-foreground sm:text-right">
                        Subtotal: {formatCurrency(subtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
