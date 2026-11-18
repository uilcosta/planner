'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'default', isLoading, disabled, children, ...props },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg';

    const variants = {
      default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
      destructive: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm hover:shadow-md',
      outline: 'border border-border bg-card hover:bg-muted/50 hover:border-border/80',
      secondary: 'bg-muted text-card-foreground hover:bg-muted/80',
      ghost: 'text-foreground hover:bg-muted/50',
      link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
      success: 'bg-success-600 text-white hover:bg-success-700 shadow-sm hover:shadow-md',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm gap-2',
      sm: 'h-9 rounded-md px-3 text-sm gap-1.5',
      lg: 'h-11 rounded-lg px-6 text-base gap-2',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';