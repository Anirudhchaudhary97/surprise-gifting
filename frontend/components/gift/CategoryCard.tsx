import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types';
import Card from '../ui/Card';

interface CategoryCardProps {
    category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/gifts?categoryId=${category.id}`}>
            <Card className="group h-full p-0 overflow-hidden relative aspect-[4/3]" hover>
                {/* Image */}
                <Image
                    src={category.imageUrl || '/placeholder.png'}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                        {category.name}
                    </h3>
                    <p className="text-neutral-200 text-sm line-clamp-2">
                        {category.description}
                    </p>
                </div>
            </Card>
        </Link>
    );
}
