import Image from 'next/image';
import Link from 'next/link';
import { Gift } from '@/types';
import { formatPrice } from '@/lib/utils';
import Card from '../ui/Card';
import RatingStar from '../ui/RatingStar';
import Button from '../ui/Button';

interface GiftCardProps {
    gift: Gift;
}

export default function GiftCard({ gift }: GiftCardProps) {
    const primaryImage = gift.images.find((img) => img.isPrimary) || gift.images[0];

    return (
        <Card className="group h-full flex flex-col p-0 overflow-hidden" hover>
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                    src={primaryImage?.url || '/placeholder.png'}
                    alt={gift.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {gift.featured && (
                    <span className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        Featured
                    </span>
                )}
                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link href={`/gifts/${gift.id}`}>
                        <Button variant="primary" size="sm" className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Details
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        {gift.category?.name}
                    </span>
                </div>
                <Link href={`/gifts/${gift.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-primary transition-colors">
                        {gift.name}
                    </h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                    <RatingStar rating={gift.averageRating || 0} size="sm" />
                    <span className="text-xs text-gray-500">
                        ({gift._count?.reviews || 0})
                    </span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                        {formatPrice(gift.price)}
                    </span>
                    {gift.stock <= 0 ? (
                        <span className="text-xs font-medium text-error bg-error/10 px-2 py-1 rounded-full">
                            Out of Stock
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                            In Stock
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
