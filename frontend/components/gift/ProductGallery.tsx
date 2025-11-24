'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GiftImage } from '@/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: GiftImage[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(
        images.find((img) => img.isPrimary) || images[0]
    );

    if (!images.length) {
        return (
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                <Image
                    src={selectedImage.url}
                    alt={name}
                    fill
                    className="object-contain p-4 transition-all duration-500 hover:scale-105"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((image) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImage(image)}
                            className={cn(
                                'relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200',
                                selectedImage.id === image.id
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-transparent hover:border-gray-300'
                            )}
                        >
                            <Image
                                src={image.url}
                                alt={`${name} thumbnail`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
