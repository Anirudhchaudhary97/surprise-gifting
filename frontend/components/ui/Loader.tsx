import { cn } from '@/lib/utils';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    fullScreen?: boolean;
}

export default function Loader({
    size = 'md',
    className,
    fullScreen = false,
}: LoaderProps) {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    const spinner = (
        <div
            className={cn(
                'animate-spin rounded-full border-primary border-t-transparent',
                sizes[size],
                className
            )}
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}
