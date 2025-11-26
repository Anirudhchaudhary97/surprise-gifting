import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/categories/category-card";
import { GiftCard } from "@/components/gifts/gift-card";
import { Button } from "@/components/ui/button";
import { getCategories, getFeaturedGifts } from "@/lib/api";

export default async function HomePage() {
    const [categories, featuredGifts] = await Promise.all([getCategories(), getFeaturedGifts()]);

    return (
        <div className="space-y-16">
            <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="grid gap-10 p-10 sm:grid-cols-2 sm:p-16">
                    <div className="space-y-6">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
                            Surprise them effortlessly
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Luxury gifting experiences curated for every milestone.
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Choose from handcrafted gift boxes, bespoke experiences, and premium add-ons to delight the people you
                            care about most.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href="/gifts">
                                    Browse gifts
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/orders">Track orders</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative hidden min-h-80 rounded-2xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent sm:block">
                        <div className="absolute inset-8 rounded-2xl border border-dashed border-primary/40" />
                        <div className="absolute bottom-8 left-1/2 flex w-[260px] -translate-x-1/2 flex-col gap-4 rounded-2xl bg-background/90 p-6 shadow-xl backdrop-blur">
                            <p className="text-sm text-muted-foreground">Featured this week</p>
                            <div>
                                <p className="text-lg font-semibold">Sunrise Breakfast Basket</p>
                                <p className="text-sm text-muted-foreground">Deliver a cheerful morning surprise with artisanal treats.</p>
                            </div>
                            <Link href="/gifts" className="text-sm font-medium text-primary hover:underline">
                                Discover more gifts
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Shop by category</h2>
                        <p className="text-sm text-muted-foreground">Handpicked ideas tailored for every celebration.</p>
                    </div>
                    <Button asChild variant="ghost">
                        <Link href="/gifts">View all gifts</Link>
                    </Button>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold">Featured surprises</h2>
                    <p className="text-sm text-muted-foreground">Premium experiences guests rave about.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredGifts.map((gift) => (
                        <GiftCard key={gift.id} gift={gift} />
                    ))}
                </div>
            </section>
        </div>
    );
}
