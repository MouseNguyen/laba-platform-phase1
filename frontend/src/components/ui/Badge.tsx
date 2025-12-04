import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80',
            secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80',
            outline: 'text-slate-950',
            success: 'border-transparent bg-green-100 text-green-800',
            warning: 'border-transparent bg-yellow-100 text-yellow-800',
            danger: 'border-transparent bg-red-100 text-red-800',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = 'Badge';

export { Badge };
