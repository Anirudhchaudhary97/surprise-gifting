import Image from 'next/image';
import Link from 'next/link';
import { Gift } from '@/types';
import { formatPrice } from '@/lib/utils';
import Card from '../ui/Card';
import RatingStar from '../ui/RatingStar';

interface GiftCardProps {
    gift: Gift;
}

export default function GiftCard({ gift }: GiftCardProps) {
    const primaryImage = gift.images.find((img) => img.isPrimary) || gift.images[0];

    return (
        <Link href={`/gifts/${gift.id}`}>
            <Card className="group h-full flex flex-col p-0 overflow-hidden" hover>
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-neutral-50">
                    <Image
                        src={primaryImage?.url || '/placeholder.png'}
                        alt={gift.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {gift.featured && (
                        <span className="absolute top-3 right-3 bg-neutral-900 text-white text-xs font-medium px-2 py-1 rounded">
                            Featured
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            {gift.category?.name}
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 mb-2 line-clamp-2">
                        {gift.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                        <RatingStar rating={gift.averageRating || 0} size="sm" />
                        <span className="text-xs text-neutral-500">
                            ({gift._count?.reviews || 0})
                        </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="text-lg font-bold text-neutral-900">
                            {formatPrice(gift.price)}
                        </span>
                        {gift.stock <= 0 ? (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                                Out of Stock
                            </span>
                        ) : gift.stock < 10 ? (
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                {gift.stock} left
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                In Stock
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
