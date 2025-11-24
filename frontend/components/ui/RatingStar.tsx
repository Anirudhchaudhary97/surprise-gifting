import { cn } from '@/lib/utils';

interface RatingStarProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

export default function RatingStar({
    rating,
    maxRating = 5,
    size = 'md',
    readonly = true,
    onChange,
    className,
}: RatingStarProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= rating;
                const isHalf = !isFilled && starValue - 0.5 <= rating;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange && onChange(starValue)}
                        className={cn(
                            'transition-colors focus:outline-none',
                            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        )}
                    >
                        <svg
                            className={cn(
                                sizes[size],
                                isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
                            )}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
