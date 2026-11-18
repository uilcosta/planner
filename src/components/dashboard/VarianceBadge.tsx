'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface VarianceBadgeProps {
  variance: number; // percentage
  planned: number;
  actual: number;
  type: 'INCOME' | 'EXPENSE';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showAmount?: boolean;
  className?: string;
}

export function VarianceBadge({
  variance,
  planned,
  actual,
  type,
  size = 'md',
  showIcon = true,
  showAmount = false,
  className,
}: VarianceBadgeProps) {
  // For income: positive variance = good (green), negative = bad (red)
  // For expense: negative variance = good (green), positive = bad (red)
  const isIncome = type === 'INCOME';
  const isGood = isIncome ? variance >= 0 : variance <= 0;
  const isNeutral = variance === 0;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const absVariance = Math.abs(variance);
  const formattedVariance = `${absVariance.toFixed(1)}%`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isNeutral) {
    return (
      <span
        className={cn(
          'inline-flex items-center font-medium rounded-full border',
          'bg-muted text-muted-foreground border-border',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <Minus className={cn(iconSize[size], 'text-muted-foreground')} />}
        <span>No planejado</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        isGood
          ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800'
          : 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        isGood ? (
          <TrendingUp className={cn(iconSize[size])} />
        ) : (
          <TrendingDown className={cn(iconSize[size])} />
        )
      )}
      <span>
        {isIncome
          ? isGood
            ? `+${formattedVariance} acima`
            : `${formattedVariance} abaixo`
          : isGood
            ? `${formattedVariance} economizado`
            : `${formattedVariance} acima`}
      </span>
      {showAmount && (
        <>
          <span className="text-muted-foreground/70 mx-1">•</span>
          <span className="font-mono">
            {isGood ? '+' : '-'}{formatCurrency(Math.abs(actual - planned))}
          </span>
        </>
      )}
    </span>
  );
}

/* Detailed Variance Card for transaction rows */
interface VarianceDetailProps {
  variance: number;
  planned: number;
  actual: number;
  type: 'INCOME' | 'EXPENSE';
  className?: string;
}

export function VarianceDetail({ variance, planned, actual, type, className }: VarianceDetailProps) {
  const isIncome = type === 'INCOME';
  const isGood = isIncome ? variance >= 0 : variance <= 0;
  const isNeutral = variance === 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isNeutral) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Minus className="h-4 w-4" />
        <span className="text-sm">No planejado</span>
        <span className="font-mono text-xs">{formatCurrency(planned)}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          isGood
            ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300'
            : 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300'
        )}
      >
        {isGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(variance).toFixed(1)}%</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          {isIncome
            ? isGood
              ? 'Acima do planejado'
              : 'Abaixo do planejado'
            : isGood
              ? 'Economizado'
              : 'Acima do orçado'}
        </span>
        <span className="font-mono text-xs text-card-foreground">
          Previsto: {formatCurrency(planned)} • Real: {formatCurrency(actual)}
        </span>
      </div>
    </div>
  );
}

/* Status badge for transactions */
interface TransactionStatusBadgeProps {
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  size?: 'sm' | 'md';
  className?: string;
}

export function TransactionStatusBadge({ status, size = 'md', className }: TransactionStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const configs = {
    PENDING: {
      icon: AlertTriangle,
      className: 'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800',
      label: 'Pendente',
    },
    COMPLETED: {
      icon: CheckCircle,
      className: 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800',
      label: 'Concluído',
    },
    CANCELLED: {
      icon: AlertCircle,
      className: 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800',
      label: 'Cancelado',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1 font-medium rounded-full border', sizeClasses[size], config.className, className)}>
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      <span>{config.label}</span>
    </span>
  );
}