import { Suspense } from "react";
import { FilterSidebar } from "@/components/storefront/filter-sidebar";
import { GiftCard } from "@/components/gifts/gift-card";
import { MobileFilterButton } from "@/components/storefront/mobile-filter-button";
import { ActiveFilters } from "@/components/storefront/active-filters";
import { Pagination } from "@/components/storefront/pagination";
import { GiftGridSkeleton } from "@/components/storefront/gift-skeleton";
import { getGifts } from "@/lib/api";

interface GiftsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GiftsPage({ searchParams }: GiftsPageProps) {
    const resolvedParams = await searchParams;

    const categoryId = typeof resolvedParams.categoryId === "string" ? resolvedParams.categoryId : undefined;
    const minPrice = typeof resolvedParams.minPrice === "string" ? Number(resolvedParams.minPrice) : undefined;
    const maxPrice = typeof resolvedParams.maxPrice === "string" ? Number(resolvedParams.maxPrice) : undefined;
    const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
    const sortBy = typeof resolvedParams.sortBy === "string" ? (resolvedParams.sortBy as "newest" | "price_asc" | "price_desc") : undefined;
    const page = typeof resolvedParams.page === "string" ? Number(resolvedParams.page) : 1;

    const { gifts, pagination } = await getGifts({
        categoryId,
        minPrice,
        maxPrice,
        search,
        sortBy,
        page,
        limit: 12,
    });

    return (
        <div className="space-y-8">
            <header className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Discover curated gifts</h1>
                <p className="max-w-2xl text-muted-foreground">
                    Browse limited edition curations, experiences, and gift boxes designed to impress. Filter by occasion or search
                    for something specific.
                </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <aside className="hidden lg:block">
                    <FilterSidebar />
                </aside>

                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <MobileFilterButton />
                        <p className="text-sm text-muted-foreground">
                            {pagination.total} {pagination.total === 1 ? "gift" : "gifts"} found
                        </p>
                    </div>

                    <ActiveFilters />

                    <Suspense fallback={<GiftGridSkeleton count={12} />}>
                        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {gifts.map((gift) => (
                                <GiftCard key={gift.id} gift={gift} />
                            ))}
                        </section>
                    </Suspense>

                    {gifts.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                            <h2 className="text-xl font-semibold">No gifts found</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try adjusting your filters or explore another category.
                            </p>
                        </div>
                    )}

                    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />
                </div>
            </div>
        </div>
    );
}
