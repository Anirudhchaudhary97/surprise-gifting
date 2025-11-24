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
                <Image
                    src={category.imageUrl || '/placeholder.png'}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {category.name}
                    </h3>
                    <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                        {category.description}
                    </p>
                </div>
            </Card>
        </Link>
    );
}
