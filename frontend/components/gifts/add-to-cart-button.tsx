"use client";

import { useMemo } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import {
    type CartAddonSelection,
    type CartPersonalization,
    type Gift,
    type GiftAddonOption,
} from "@/types";

interface AddToCartButtonProps extends ButtonProps {
    gift: Gift;
    quantity?: number;
    addons?: GiftAddonOption[];
    personalization?: CartPersonalization;
    onAdded?: () => void;
}

function buildHashKey(input: string) {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

export function AddToCartButton({
    gift,
    quantity = 1,
    addons = [],
    personalization,
    onAdded,
    className,
    children = "Add to cart",
    ...props
}: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem);

    const selectionSignature = useMemo(() => {
        const payload = {
            addons: addons.map((addon) => addon.id).sort(),
            message: personalization?.message?.trim() ?? "",
            giftWrap: personalization?.giftWrap?.enabled
                ? personalization.giftWrap.price ?? 0
                : 0,
            artwork: personalization?.artwork?.previewUrl ?? "",
        };

        return JSON.stringify(payload);
    }, [addons, personalization]);

    const cartItemId = useMemo(
        () => `cart-${gift.id}-${buildHashKey(selectionSignature)}`,
        [gift.id, selectionSignature]
    );

    const addonSelections: CartAddonSelection[] = addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
    }));

    const addonsTotal = addonSelections.reduce(
        (total, addon) => total + addon.price,
        0
    );

    const giftWrapPrice = personalization?.giftWrap?.enabled
        ? personalization.giftWrap.price ?? 0
        : 0;

    const unitPrice = gift.price + addonsTotal + giftWrapPrice;

    const normalizedPersonalization = useMemo(() => {
        const message = personalization?.message?.trim();
        const giftWrap = personalization?.giftWrap?.enabled
            ? {
                enabled: true,
                price: personalization.giftWrap?.price ?? 0,
            }
            : undefined;
        const artwork = personalization?.artwork?.previewUrl
            ? {
                previewUrl: personalization.artwork.previewUrl,
                fileName: personalization.artwork.fileName,
            }
            : undefined;

        if (!message && !giftWrap && !artwork) {
            return undefined;
        }

        return {
            message,
            giftWrap,
            artwork,
        } satisfies CartPersonalization;
    }, [personalization]);

    const handleClick = () => {
        addItem({
            id: cartItemId,
            giftId: gift.id,
            name: gift.name,
            image: gift.images[0] ?? "/images/gifts/placeholder.jpg",
            basePrice: gift.price,
            price: unitPrice,
            quantity,
            addons: addonSelections.length ? addonSelections : undefined,
            personalization: normalizedPersonalization,
        });

        onAdded?.();
    };

    return (
        <Button className={className} onClick={handleClick} {...props}>
            {children}
        </Button>
    );
}
