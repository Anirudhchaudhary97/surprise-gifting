import Link from "next/link";
import { Search } from "lucide-react";
import { GiftCard } from "@/components/gifts/gift-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategories, getGifts } from "@/lib/api";

interface GiftsPageProps {
    searchParams?: Record<string, string | string[] | undefined>;
}

export default async function GiftsPage({ searchParams }: GiftsPageProps) {
    const [gifts, categories] = await Promise.all([getGifts(), getCategories()]);

    const selectedCategory = typeof searchParams?.category === "string" ? searchParams?.category : undefined;
    const searchTerm = typeof searchParams?.search === "string" ? searchParams?.search : undefined;

    const activeCategory = selectedCategory
        ? categories.find(
            (category) =>
                category.slug === selectedCategory ||
                category.id === selectedCategory ||
                category.name.toLowerCase().replace(/\s+/g, "-") === selectedCategory,
        )
        : undefined;

    const filteredGifts = gifts.filter((gift) => {
        const matchesCategory = selectedCategory
            ? gift.categoryId === activeCategory?.id ||
            gift.slug === selectedCategory ||
            gift.categoryName.toLowerCase().includes(selectedCategory.toLowerCase())
            : true;
        const matchesSearch = searchTerm
            ? gift.name.toLowerCase().includes(searchTerm.toLowerCase()) || gift.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        return matchesCategory && matchesSearch;
    });

    const activeCategories = categories.map((category) => ({
        id: category.id,
        label: category.name,
        slug: category.slug,
    }));

    return (
        <div className="space-y-12">
            <header className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Discover curated gifts</h1>
                <p className="max-w-2xl text-muted-foreground">
                    Browse limited edition curations, experiences, and gift boxes designed to impress. Filter by occasion or search
                    for something specific.
                </p>
            </header>

            <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
                <form className="flex flex-col gap-4 md:flex-row" role="search">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            defaultValue={searchTerm}
                            placeholder="Search by name, keyword, or experience"
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit">Apply filters</Button>
                </form>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/gifts"
                        className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium",
                            !selectedCategory
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:text-foreground",
                        )}
                    >
                        All
                    </Link>
                    {activeCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/gifts?category=${category.slug}`}
                            className={cn(
                                "rounded-full border px-4 py-2 text-sm font-medium",
                                selectedCategory === category.slug
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {category.label}
                        </Link>
                    ))}
                </div>
            </div>

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredGifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} />
                ))}
            </section>

            {filteredGifts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                    <h2 className="text-xl font-semibold">No gifts found</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your filters or explore another category.
                    </p>
                </div>
            )}
        </div>
    );
}
