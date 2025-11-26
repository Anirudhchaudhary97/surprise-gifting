"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { type Gift } from "@/types";

interface AddToCartButtonProps extends ButtonProps {
    gift: Gift;
    quantity?: number;
}

export function AddToCartButton({ gift, quantity = 1, className, ...props }: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleClick = () => {
        addItem({
            id: gift.id,
            name: gift.name,
            price: gift.price,
            image: gift.images[0] ?? "/images/gifts/placeholder.jpg",
            quantity,
        });
    };

    return (
        <Button className={className} onClick={handleClick} {...props}>
            Add to cart
        </Button>
    );
}
