'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useHideValues } from '@/components/providers/HideValuesProvider';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  variant: 'available' | 'caixinhas' | 'income' | 'expense';
  description?: string;
  trend?: { value: number; label: string } | null;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const variantStyles = {
  available: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    borderColor: 'border-primary/20',
    titleColor: 'text-text-muted',
    valueColor: 'text-text',
    accentBar: 'bg-primary',
  },
  caixinhas: {
    iconBg: 'bg-positive-bg',
    iconColor: 'text-positive',
    borderColor: 'border-positive-border',
    titleColor: 'text-text-muted',
    valueColor: 'text-positive',
    accentBar: 'bg-positive',
  },
  income: {
    iconBg: 'bg-positive-bg',
    iconColor: 'text-positive',
    borderColor: 'border-positive-border',
    titleColor: 'text-text-muted',
    valueColor: 'text-positive',
    accentBar: 'bg-positive',
  },
  expense: {
    iconBg: 'bg-negative-bg',
    iconColor: 'text-negative',
    borderColor: 'border-negative-border',
    titleColor: 'text-text-muted',
    valueColor: 'text-negative',
    accentBar: 'bg-negative',
  },
};

const variantIcons = {
  available: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  caixinhas: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M4.165 18.819A12.061 12.061 0 0112 15a12.061 12.061 0 017.835 3.819M10 6h4M7 9h10M9 12h6m-6 0a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  ),
  income: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M17 11l-5 5-5-5m10-9v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2M5 8h14" />
    </svg>
  ),
  expense: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M17 11l-5 5-5-5m10-9v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2M5 8h14" />
    </svg>
  ),
};

export function KPICard({ title, value, variant, description, trend, action, className }: KPICardProps) {
  const { hidden } = useHideValues();
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];

  const displayValue = hidden ? '••••••' : formatCurrency(value);

  return (
    <article
      className={cn(
        'card p-5 relative overflow-hidden',
        styles.borderColor,
        'transition-all duration-200',
        className
      )}
      style={{ borderTopWidth: '4px' }}
    >
      {/* Accent bar top */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', styles.accentBar)} />

      <header className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', styles.iconBg, styles.iconColor)}>
            {Icon}
          </div>
          <div>
            <h3 className={cn('text-sm font-medium', styles.titleColor)}>{title}</h3>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
        </div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}
      </header>

      <div className="text-3xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
        <span className={cn(styles.valueColor, 'font-mono')}>
          {displayValue}
        </span>
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend.value > 0 ? (
            <TrendingUp className="h-4 w-4 text-positive" aria-hidden="true" />
          ) : trend.value < 0 ? (
            <TrendingDown className="h-4 w-4 text-negative" aria-hidden="true" />
          ) : (
            <Minus className="h-4 w-4 text-text-muted" aria-hidden="true" />
          )}
          <span className={cn(
            'text-xs font-medium',
            trend.value > 0 ? 'text-positive' : trend.value < 0 ? 'text-negative' : 'text-text-muted'
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
          <span className="text-xs text-text-muted">{trend.label}</span>
        </div>
      )}
    </article>
  );
}