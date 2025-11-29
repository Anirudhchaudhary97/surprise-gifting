"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { AddToCartButton } from "@/components/gifts/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import {
    type CartPersonalization,
    type Gift,
    type GiftAddonOption,
} from "@/types";

const MAX_MESSAGE_LENGTH = 240;
const GIFT_WRAP_PERCENTAGE = 0.08;
const GIFT_WRAP_MIN_PRICE = 49;

function slugify(value: string, fallback: string) {
    const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    return slug.length ? slug : fallback;
}

function deserializeAddonString(value: string, index: number): GiftAddonOption | null {
    const trimmed = value.trim();
    if (!trimmed.length) {
        return null;
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
            const parsed = JSON.parse(trimmed) as Record<string, unknown>;
            const nameCandidate =
                (parsed.name as string | undefined) ??
                (parsed.label as string | undefined) ??
                (parsed.title as string | undefined);
            const priceCandidate =
                (parsed.price as number | string | undefined) ??
                (parsed.amount as number | string | undefined);

            if (!nameCandidate) {
                return null;
            }

            const priceValue = Number.parseFloat(String(priceCandidate ?? "0"));
            return {
                id: (parsed.id as string | undefined) ?? slugify(nameCandidate, `addon-${index}`),
                name: nameCandidate,
                price: Number.isFinite(priceValue) ? priceValue : 0,
                description: (parsed.description as string | undefined) ?? undefined,
            };
        } catch (error) {
            console.warn("Failed to parse addon JSON", error);
        }
    }

    const [name, rawPrice, description] = trimmed.split("|").map((segment) => segment.trim());
    if (!name) {
        return null;
    }

    const priceValue = Number.parseFloat(rawPrice ?? "0");
    return {
        id: slugify(name, `addon-${index}`),
        name,
        price: Number.isFinite(priceValue) ? priceValue : 0,
        description: description?.length ? description : undefined,
    };
}

function resolveAddons(gift: Gift): GiftAddonOption[] {
    if (Array.isArray(gift.addons) && gift.addons.length) {
        return gift.addons;
    }

    if (!Array.isArray(gift.addonsOptions)) {
        return [];
    }

    return gift.addonsOptions
        .map((entry, index) => deserializeAddonString(entry, index))
        .filter((entry): entry is GiftAddonOption => Boolean(entry));
}

function computeGiftWrapPrice(basePrice: number) {
    const computed = Math.round(basePrice * GIFT_WRAP_PERCENTAGE);
    return Math.max(GIFT_WRAP_MIN_PRICE, computed);
}

interface GiftOrderPanelProps {
    gift: Gift;
}

export function GiftOrderPanel({ gift }: GiftOrderPanelProps) {
    const addons = useMemo(() => resolveAddons(gift), [gift]);
    const allowGiftWrap = gift.allowAddons !== false;
    const [quantity, setQuantity] = useState(1);
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
    const [personalMessage, setPersonalMessage] = useState("");
    const [giftWrapEnabled, setGiftWrapEnabled] = useState(false);
    const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
    const [artworkFileName, setArtworkFileName] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<"idle" | "added">("idle");

    useEffect(() => {
        if (status !== "added") {
            return;
        }

        const timer = window.setTimeout(() => setStatus("idle"), 2400);
        return () => window.clearTimeout(timer);
    }, [status]);

    useEffect(() => {
        if (!allowGiftWrap && giftWrapEnabled) {
            setGiftWrapEnabled(false);
        }
    }, [allowGiftWrap, giftWrapEnabled]);

    const availableAddons = addons;
    const selectedAddons = useMemo(
        () =>
            availableAddons.filter((addon) =>
                selectedAddonIds.includes(addon.id)
            ),
        [availableAddons, selectedAddonIds]
    );

    const addonsTotal = useMemo(
        () => selectedAddons.reduce((total, addon) => total + addon.price, 0),
        [selectedAddons]
    );

    const wrapPrice = useMemo(() => computeGiftWrapPrice(gift.price), [gift.price]);
    const allowAddons = (gift.allowAddons ?? availableAddons.length > 0) && availableAddons.length > 0;
    const allowPersonalMessage = Boolean(gift.allowPersonalMsg ?? gift.isCustomizable);
    const allowArtworkUpload = Boolean(gift.allowImageUpload);

    const unitPrice = useMemo(
        () =>
            gift.price + addonsTotal + (allowGiftWrap && giftWrapEnabled ? wrapPrice : 0),
        [gift.price, addonsTotal, allowGiftWrap, giftWrapEnabled, wrapPrice]
    );
    const estimatedTotal = unitPrice * quantity;
    const addToCartLabel = `Add to cart • ${formatCurrency(estimatedTotal)}`;

    const personalization = useMemo<CartPersonalization | undefined>(() => {
        const message = allowPersonalMessage && personalMessage.trim().length
            ? personalMessage.trim()
            : undefined;
        const giftWrap = allowGiftWrap && giftWrapEnabled
            ? {
                enabled: true,
                price: wrapPrice,
            }
            : undefined;
        const artwork = allowArtworkUpload && artworkPreview
            ? {
                previewUrl: artworkPreview,
                fileName: artworkFileName,
            }
            : undefined;

        if (!message && !giftWrap && !artwork) {
            return undefined;
        }

        return {
            message,
            giftWrap,
            artwork,
        };
    }, [
        allowPersonalMessage,
        personalMessage,
        giftWrapEnabled,
        wrapPrice,
        allowArtworkUpload,
        artworkPreview,
        artworkFileName,
    ]);

    const handleAddonToggle = (addonId: string) => {
        setSelectedAddonIds((current) =>
            current.includes(addonId)
                ? current.filter((id) => id !== addonId)
                : [...current, addonId]
        );
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity((current) => Math.max(1, current + delta));
    };

    const handleArtworkChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setArtworkPreview(null);
            setArtworkFileName(undefined);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : null;
            setArtworkPreview(result);
            setArtworkFileName(file.name);
        };
        reader.readAsDataURL(file);
    };

    const resetArtwork = () => {
        setArtworkPreview(null);
        setArtworkFileName(undefined);
    };

    return (
        <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-6">
            <div>
                <p className="text-3xl font-semibold">{formatCurrency(unitPrice)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Unit total with your selections.</p>
            </div>

            {allowAddons ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Enhance the surprise</h3>
                    <div className="space-y-2">
                        {availableAddons.map((addon) => {
                            const checked = selectedAddonIds.includes(addon.id);
                            return (
                                <label
                                    key={addon.id}
                                    className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border/70 bg-background/60 p-3 hover:border-border"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{addon.name}</p>
                                        {addon.description ? (
                                            <p className="text-xs text-muted-foreground">{addon.description}</p>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-foreground">{formatCurrency(addon.price)}</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={checked}
                                            onChange={() => handleAddonToggle(addon.id)}
                                        />
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {allowPersonalMessage ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Personal message</h3>
                        <span className="text-xs text-muted-foreground">
                            {personalMessage.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                    </div>
                    <Textarea
                        value={personalMessage}
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder="Add a heartfelt note to be printed inside the package."
                        onChange={(event) => setPersonalMessage(event.target.value)}
                        rows={4}
                    />
                </div>
            ) : null}

            {allowArtworkUpload ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Custom artwork</h3>
                    <p className="text-xs text-muted-foreground">
                        Upload a logo, sketch, or photo to include with the gift. We&apos;ll generate a preview for final approval.
                    </p>
                    <Input type="file" accept="image/*" onChange={handleArtworkChange} />
                    {artworkPreview ? (
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
                                <ImagePreview src={artworkPreview} alt={artworkFileName ?? "Uploaded artwork preview"} />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{artworkFileName ?? "artwork.png"}</span>
                                <Button variant="ghost" size="icon" onClick={resetArtwork}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove artwork</span>
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {allowGiftWrap ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Gift wrap</h3>
                            <p className="text-xs text-muted-foreground">Hand-wrapped with satin ribbon and a wax seal.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">{formatCurrency(wrapPrice)}</span>
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={giftWrapEnabled}
                                onChange={(event) => setGiftWrapEnabled(event.target.checked)}
                            />
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="space-y-4 rounded-xl border border-border bg-background/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center rounded-lg border border-border">
                        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)}>
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)}>
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase quantity</span>
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Estimated total: <span className="font-semibold text-foreground">{formatCurrency(estimatedTotal)}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AddToCartButton
                        gift={gift}
                        quantity={quantity}
                        addons={selectedAddons}
                        personalization={personalization}
                        className="flex-1 sm:w-48"
                        size="lg"
                        onAdded={() => setStatus("added")}
                    >
                        {addToCartLabel}
                    </AddToCartButton>
                    <Button variant="outline" size="lg" className="flex-1 sm:w-48" type="button">
                        Schedule delivery
                    </Button>
                </div>
                {status === "added" ? (
                    <p className="text-sm font-medium text-emerald-600">Added to cart! You can keep customizing or head to checkout.</p>
                ) : null}
            </div>
        </div>
    );
}

interface ImagePreviewProps {
    src: string;
    alt: string;
}

function ImagePreview({ src, alt }: ImagePreviewProps) {
    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
        />
    );
}
