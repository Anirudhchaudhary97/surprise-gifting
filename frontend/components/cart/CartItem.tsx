'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '../ui/Button';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
    isUpdating?: boolean;
}

export default function CartItem({
    item,
    onUpdateQuantity,
    onRemove,
    isUpdating = false,
}: CartItemProps) {
    const primaryImage =
        item.gift.images.find((img) => img.isPrimary) || item.gift.images[0];

    return (
        <div className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Image */}
            <div className="relative w-full sm:w-32 aspect-square shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <Image
                    src={primaryImage?.url || '/placeholder.png'}
                    alt={item.gift.name}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <Link
                            href={`/gifts/${item.gift.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                        >
                            {item.gift.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                            {item.gift.category?.name}
                        </p>

                        {/* Customization Details */}
                        <div className="mt-3 space-y-1">
                            {item.personalMessage && (
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Message:</span> "{item.personalMessage}"
                                </p>
                            )}
                            {item.deliveryDate && (
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Delivery:</span> {formatDate(item.deliveryDate)}
                                </p>
                            )}
                            {item.selectedAddons.length > 0 && (
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Add-ons:</span> {item.selectedAddons.join(', ')}
                                </p>
                            )}
                            {item.customImageUrl && (
                                <a
                                    href={item.customImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    View Custom Image
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.gift.price * item.quantity)}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <button
                            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            -
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.quantity + 1)}
                            disabled={item.quantity >= item.gift.stock || isUpdating}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            +
                        </button>
                    </div>

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        disabled={isUpdating}
                        className="text-error hover:bg-error/10 hover:text-error"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    );
}
