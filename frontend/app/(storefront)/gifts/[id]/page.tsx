import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftCard } from "@/components/gifts/gift-card";
import { GiftOrderPanel } from "@/components/gifts/gift-order-panel";
import { ProductGallery } from "@/components/gifts/product-gallery";
import { RatingStar } from "@/components/common/rating-star";
import { Button } from "@/components/ui/button";
import { getGiftById, getGiftReviews, getGifts } from "@/lib/api";

interface GiftDetailPageProps {
    params: { id: string };
}

// Enable dynamic params for runtime generation
export const dynamicParams = true;

// Optional: Pre-generate static pages for better performance
export async function generateStaticParams() {
    try {
        const gifts = await getGifts();
        return gifts.map((gift) => ({
            id: gift.slug ?? gift.id,
        }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export default async function GiftDetailPage({ params }: GiftDetailPageProps) {
    const { id } = await params;
    const gift = await getGiftById(id);

    if (!gift) {
        notFound();
    }

    const [reviews, gifts] = await Promise.all([getGiftReviews(gift.id), getGifts()]);
    const relatedGifts = gifts.filter((item) => item.id !== gift.id && item.categoryId === gift.categoryId).slice(0, 3);

    return (
        <div className="space-y-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <ProductGallery gift={gift} />
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm uppercase tracking-wide text-muted-foreground">{gift.categoryName}</p>
                        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{gift.name}</h1>
                        <RatingStar value={gift.rating} reviewsCount={gift.reviewsCount} />
                    </div>
                    <p className="text-lg text-muted-foreground">{gift.shortDescription}</p>
                    <GiftOrderPanel gift={gift} />
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold">What&apos;s inside</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">{gift.description}</p>
                        {gift.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {gift.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold">Guest reviews</h2>
                    <p className="text-sm text-muted-foreground">Real stories from people who already surprised their loved ones.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl border border-border bg-card p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-semibold">{review.user.name}</p>
                                <RatingStar value={review.rating} outOf={5} />
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                            <p className="mt-4 text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {relatedGifts.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">You may also like</h2>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/gifts">View all gifts</Link>
                        </Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {relatedGifts.map((item) => (
                            <GiftCard key={item.id} gift={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
