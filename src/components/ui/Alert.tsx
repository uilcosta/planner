'use client';

import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  onClose?: () => void;
  title?: string;
}

export function Alert({ className, variant = 'default', onClose, title, children, ...props }: AlertProps) {
  const variants = {
    default: 'bg-primary-50 border-primary-200 text-primary-900 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-100',
    destructive: 'bg-danger-50 border-danger-200 text-danger-900 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-100',
    success: 'bg-success-50 border-success-200 text-success-900 dark:bg-success-900/20 dark:border-success-800 dark:text-success-100',
    warning: 'bg-warning-50 border-warning-200 text-warning-900 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-100',
    info: 'bg-neutral-50 border-neutral-200 text-neutral-900 dark:bg-neutral-900/20 dark:border-neutral-800 dark:text-neutral-100',
  };

  const iconColors = {
    default: 'text-primary-600 dark:text-primary-400',
    destructive: 'text-danger-600 dark:text-danger-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-neutral-600 dark:text-neutral-400',
  };

  const icons = {
    default: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    destructive: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const closeButtonColors = {
    default: 'text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200',
    destructive: 'text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-200',
    success: 'text-success-600 hover:text-success-800 dark:text-success-400 dark:hover:text-success-200',
    warning: 'text-warning-600 hover:text-warning-800 dark:text-warning-400 dark:hover:text-warning-200',
    info: 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-xl border p-4',
        'flex items-start gap-3',
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColors[variant])} aria-hidden="true">
        {icons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold">{title}</h4>
        )}
        <div className={cn('text-sm', title && 'mt-0.5')}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex-shrink-0 rounded-md p-1 transition-colors',
            closeButtonColors[variant]
          )}
          aria-label="Fechar alerta"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}