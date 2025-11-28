import { Skeleton } from "@/components/ui/skeleton";

export function GiftCardSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
            </div>
        </div>
    );
}

export function GiftGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <GiftCardSkeleton key={i} />
            ))}
        </div>
    );
}
