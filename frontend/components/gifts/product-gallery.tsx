"use client";

import Image from "next/image";
import { useState } from "react";
import { type Gift } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    gift: Gift;
}

export function ProductGallery({ gift }: ProductGalleryProps) {
    const fallbackImage = "/file.svg";
    const images = gift.images.length ? gift.images : [fallbackImage];
    const [activeImage, setActiveImage] = useState(images[0]);

    return (
        <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border">
                <Image
                    src={activeImage}
                    alt={gift.name}
                    fill
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="object-cover"
                />
            </div>
            <div className="grid grid-cols-4 gap-3">
                {images.map((image) => (
                    <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={cn(
                            "relative aspect-square overflow-hidden rounded-lg border transition",
                            activeImage === image ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/40",
                        )}
                    >
                        <Image src={image} alt={`${gift.name} preview`} fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
