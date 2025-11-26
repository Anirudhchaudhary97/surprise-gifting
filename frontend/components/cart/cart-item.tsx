"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { type CartItem as CartItemType } from "@/types";

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    return (
        <div className="flex items-center gap-6 rounded-xl border border-border p-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h4 className="text-base font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">₹{item.price}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-lg border border-border">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase quantity</span>
                        </Button>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        Subtotal: ₹{item.price * item.quantity}
                    </span>
                </div>
            </div>
        </div>
    );
}
