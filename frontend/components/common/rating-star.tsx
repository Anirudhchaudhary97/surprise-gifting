import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarProps {
    value: number;
    outOf?: number;
    reviewsCount?: number;
    className?: string;
}

export function RatingStar({ value, outOf = 5, reviewsCount, className }: RatingStarProps) {
    const rating = Math.min(Math.max(value, 0), outOf);

    return (
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
            <span className="inline-flex items-center gap-1 text-primary">
                <Star className="h-4 w-4 fill-current" />
                {rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">/ {outOf}</span>
            {typeof reviewsCount === "number" && <span>({reviewsCount} reviews)</span>}
        </div>
    );
}
