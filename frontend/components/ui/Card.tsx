import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    glass?: boolean;
    variant?: 'rose' | 'lavender' | 'cream' | 'default';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = false, glass = false, variant = 'default', children, ...props }, ref) => {
        const variantStyles = {
            rose: 'border-rose-200 bg-rose-50/50',
            lavender: 'border-purple-200 bg-purple-50/50',
            cream: 'border-amber-200 bg-amber-50/50',
            default: 'border-neutral-200 bg-white'
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl p-6 transition-shadow duration-200',
                    glass
                        ? 'bg-white/40 backdrop-blur-md border border-white/60'
                        : variantStyles[variant],
                    hover ? 'hover:shadow-md cursor-pointer' : 'shadow-sm',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
