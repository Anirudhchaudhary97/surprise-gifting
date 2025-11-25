import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, fullWidth = true, type = 'text', ...props }, ref) => {
        return (
            <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : '')}>
                {label && (
                    <label className="text-sm font-medium text-neutral-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        'px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-neutral-50',
                        error ? 'border-red-500 focus:ring-red-500' : '',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-sm text-red-500">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
