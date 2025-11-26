import Image from "next/image";
import Link from "next/link";
import { type Category } from "@/types";

interface CategoryCardProps {
    category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link
            href={`/gifts?category=${category.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1"
        >
            <div className="relative h-40 w-full overflow-hidden">
                <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 768px) 240px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
        </Link>
    );
}
