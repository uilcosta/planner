'use client';

import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  onClose?: () => void;
}

export function Alert({ className, variant = 'default', onClose, children, ...props }: AlertProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-800 border-blue-200',
    destructive: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        'flex items-start gap-3',
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-1 text-sm">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'rounded-md p-1 transition-colors',
            'hover:bg-black/10',
            variant === 'destructive' && 'text-red-500 hover:text-red-700',
            variant === 'default' && 'text-blue-500 hover:text-blue-700',
            variant === 'success' && 'text-green-500 hover:text-green-700',
            variant === 'warning' && 'text-yellow-500 hover:text-yellow-700'
          )}
          aria-label="Fechar alerta"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
