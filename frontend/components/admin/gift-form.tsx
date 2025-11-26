"use client";

import Image from "next/image";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type Category, type Gift } from "@/types";

export interface GiftFormValues {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    isCustomizable: boolean;
    allowPersonalMsg: boolean;
    allowAddons: boolean;
    allowImageUpload: boolean;
    addonsOptions: string[];
    featured: boolean;
    images: File[];
}

interface GiftFormProps {
    categories: Category[];
    initialGift?: Gift | null;
    loading?: boolean;
    submitLabel: string;
    onSubmit: (values: GiftFormValues) => void;
    onCancel?: () => void;
    onDeleteImage?: (imageId: string) => void;
    deletingImageId?: string | null;
}

function splitAddons(value: string): string[] {
    return value
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

export function GiftForm({
    categories,
    initialGift,
    loading = false,
    submitLabel,
    onSubmit,
    onCancel,
    onDeleteImage,
    deletingImageId = null,
}: GiftFormProps) {
    const [name, setName] = useState(() => initialGift?.name ?? "");
    const [description, setDescription] = useState(() => initialGift?.description ?? "");
    const [priceInput, setPriceInput] = useState(
        () => (initialGift?.price !== undefined ? String(initialGift.price) : "0")
    );
    const [stockInput, setStockInput] = useState(
        () => (initialGift?.stock !== undefined ? String(initialGift.stock) : "0")
    );
    const [categoryId, setCategoryId] = useState(() => initialGift?.categoryId ?? "");
    const [isCustomizable, setIsCustomizable] = useState(() => Boolean(initialGift?.isCustomizable));
    const [allowPersonalMsg, setAllowPersonalMsg] = useState(() => Boolean(initialGift?.allowPersonalMsg));
    const [allowAddons, setAllowAddons] = useState(
        () => Boolean(initialGift?.allowAddons ?? (initialGift?.addonsOptions?.length ?? 0) > 0)
    );
    const [allowImageUpload, setAllowImageUpload] = useState(() => Boolean(initialGift?.allowImageUpload));
    const [featured, setFeatured] = useState(() => Boolean(initialGift?.featured));
    const [addonsText, setAddonsText] = useState(() => (initialGift?.addonsOptions ?? []).join("\n"));
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);

    const existingImages = initialGift?.imageRecords ?? [];

    const resetError = () => {
        if (localError) {
            setLocalError(null);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setSelectedImages(files);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalError(null);

        if (!name.trim()) {
            setLocalError("Gift name is required.");
            return;
        }

        if (!categoryId.trim()) {
            setLocalError("Select a category before saving the gift.");
            return;
        }

        const parsedPrice = Number.parseFloat(priceInput || "0");
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            setLocalError("Enter a valid price value.");
            return;
        }

        const parsedStock = Number.parseInt(stockInput || "0", 10);
        if (!Number.isFinite(parsedStock) || parsedStock < 0) {
            setLocalError("Enter a valid stock quantity.");
            return;
        }

        const addonsOptions = allowAddons ? splitAddons(addonsText) : [];

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            stock: parsedStock,
            categoryId: categoryId.trim(),
            isCustomizable,
            allowPersonalMsg,
            allowAddons,
            allowImageUpload,
            addonsOptions,
            featured,
            images: selectedImages,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="gift-name" className="block text-sm font-medium">
                        Gift name
                    </label>
                    <Input
                        id="gift-name"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            resetError();
                        }}
                        placeholder="Chocolate Hamper"
                        required
                        className="mt-1"
                        disabled={loading}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="gift-description" className="block text-sm font-medium">
                        Description
                    </label>
                    <Textarea
                        id="gift-description"
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                            resetError();
                        }}
                        rows={4}
                        className="mt-1"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="gift-price" className="block text-sm font-medium">
                        Price
                    </label>
                    <Input
                        id="gift-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceInput}
                        onChange={(event) => {
                            setPriceInput(event.target.value);
                            resetError();
                        }}
                        className="mt-1"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="gift-stock" className="block text-sm font-medium">
                        Stock
                    </label>
                    <Input
                        id="gift-stock"
                        type="number"
                        min="0"
                        step="1"
                        value={stockInput}
                        onChange={(event) => {
                            setStockInput(event.target.value);
                            resetError();
                        }}
                        className="mt-1"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="gift-category" className="block text-sm font-medium">
                        Category
                    </label>
                    <select
                        id="gift-category"
                        value={categoryId}
                        onChange={(event) => {
                            setCategoryId(event.target.value);
                            resetError();
                        }}
                        className={cn(
                            "mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        )}
                        disabled={loading || !categories.length}
                        required
                    >
                        {!categories.length && <option value="">Loading categories...</option>}
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {!categories.length && (
                        <p className="mt-1 text-xs text-destructive">
                            Create a category first to publish this gift.
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <span className="text-sm font-medium">Gift options</span>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-input"
                            checked={isCustomizable}
                            onChange={(event) => {
                                setIsCustomizable(event.target.checked);
                                resetError();
                            }}
                            disabled={loading}
                        />
                        Allow customization
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-input"
                            checked={allowPersonalMsg}
                            onChange={(event) => {
                                setAllowPersonalMsg(event.target.checked);
                                resetError();
                            }}
                            disabled={loading}
                        />
                        Allow personal message
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-input"
                            checked={allowImageUpload}
                            onChange={(event) => {
                                setAllowImageUpload(event.target.checked);
                                resetError();
                            }}
                            disabled={loading}
                        />
                        Allow image upload from customer
                    </label>
                </div>

                <div className="space-y-3">
                    <span className="text-sm font-medium">Marketing</span>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-input"
                            checked={featured}
                            onChange={(event) => {
                                setFeatured(event.target.checked);
                                resetError();
                            }}
                            disabled={loading}
                        />
                        Mark as featured
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border border-input"
                            checked={allowAddons}
                            onChange={(event) => {
                                setAllowAddons(event.target.checked);
                                resetError();
                            }}
                            disabled={loading}
                        />
                        Allow add-on selections
                    </label>
                </div>
            </div>

            {allowAddons && (
                <div>
                    <label htmlFor="gift-addons" className="block text-sm font-medium">
                        Add-on options
                    </label>
                    <Textarea
                        id="gift-addons"
                        value={addonsText}
                        onChange={(event) => {
                            setAddonsText(event.target.value);
                            resetError();
                        }}
                        rows={3}
                        className="mt-1"
                        disabled={loading}
                        placeholder="Spa voucher\nPremium chocolates"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Separate each option with a new line or comma.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <label className="block text-sm font-medium">Upload images</label>
                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                        handleFileChange(event);
                        resetError();
                    }}
                    disabled={loading}
                />
                {selectedImages.length > 0 && (
                    <ul className="text-xs text-muted-foreground">
                        {selectedImages.map((file) => (
                            <li key={file.name}>{file.name}</li>
                        ))}
                    </ul>
                )}
            </div>

            {existingImages.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-medium">Current images</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {existingImages.map((image) => {
                            const imageId = image.id;
                            return (
                                <div
                                    key={imageId ?? image.url}
                                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                                >
                                    <div className="overflow-hidden rounded-md border border-border/60">
                                        <Image
                                            src={image.url}
                                            alt="Gift visual"
                                            width={320}
                                            height={320}
                                            className="aspect-square w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{image.isPrimary ? "Primary" : "Secondary"}</span>
                                        {imageId ? <span>#{imageId.slice(0, 6)}</span> : <span>External</span>}
                                    </div>
                                    {imageId && onDeleteImage ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDeleteImage(imageId)}
                                            disabled={loading || deletingImageId === imageId}
                                        >
                                            {deletingImageId === imageId ? "Removing..." : "Remove image"}
                                        </Button>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Image managed outside the dashboard.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {localError && (
                <div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {localError}
                </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
