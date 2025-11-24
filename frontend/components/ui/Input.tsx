import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, fullWidth = true, ...props }, ref) => {
        return (
            <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : '')}>
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50',
                        error ? 'border-error focus:border-error focus:ring-error/20' : '',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-error animate-slide-in">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
