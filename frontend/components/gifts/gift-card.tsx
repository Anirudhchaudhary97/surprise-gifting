"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/gifts/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { type Gift } from "@/types";

interface GiftCardProps {
    gift: Gift;
}

export function GiftCard({ gift }: GiftCardProps) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5">
            <div className="relative h-56 w-full">
                <Image
                    src={gift.images[0] ?? "/file.svg"}
                    alt={gift.name}
                    fill
                    sizes="(min-width: 768px) 300px, 100vw"
                    className="object-cover"
                />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{gift.categoryName}</p>
                        <h3 className="text-lg font-semibold leading-tight">{gift.name}</h3>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {formatCurrency(gift.price)}
                    </span>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{gift.shortDescription}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        {gift.rating.toFixed(1)} ({gift.reviewsCount})
                    </span>
                    <Link href={`/gifts/${gift.slug ?? gift.id}`} className="text-sm font-medium text-primary hover:underline">
                        View details
                    </Link>
                </div>
                <Button asChild className="w-full">
                    <Link href={`/gifts/${gift.slug ?? gift.id}`}>View details</Link>
                </Button>
                <AddToCartButton gift={gift} variant="outline" className="w-full" />
            </div>
        </div>
    );
}
