'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useHideValues } from '@/components/providers/HideValuesProvider';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

type BudgetStatus = 'normal' | 'warning' | 'limit' | 'over' | 'none';

interface BudgetProgressProps {
  budget: number;
  spent: number;
  status: BudgetStatus;
  topCategories?: Array<{ name: string; percentage: number; color: string }>;
  className?: string;
  onViewPlanning?: () => void;
}

const statusConfig = {
  normal: {
    label: 'Dentro do orçamento',
    color: 'var(--color-positive)',
    bgColor: 'var(--color-positive-bg)',
    borderColor: 'var(--color-positive-border)',
    icon: CheckCircle,
    progressColor: 'var(--color-positive)',
  },
  warning: {
    label: 'Próximo do limite',
    color: 'var(--color-warning)',
    bgColor: 'var(--color-warning-bg)',
    borderColor: 'var(--color-warning-border)',
    icon: AlertTriangle,
    progressColor: 'var(--color-warning)',
  },
  limit: {
    label: 'Limite atingido',
    color: 'var(--color-warning)',
    bgColor: 'var(--color-warning-bg)',
    borderColor: 'var(--color-warning-border)',
    icon: AlertTriangle,
    progressColor: 'var(--color-warning)',
  },
  over: {
    label: 'Acima do limite',
    color: 'var(--color-negative)',
    bgColor: 'var(--color-negative-bg)',
    borderColor: 'var(--color-negative-border)',
    icon: AlertCircle,
    progressColor: 'var(--color-negative)',
  },
  none: {
    label: 'Sem orçamento definido',
    color: 'var(--color-text-muted)',
    bgColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    icon: AlertCircle,
    progressColor: 'var(--color-border)',
  },
};

export function BudgetProgress({
  budget,
  spent,
  status,
  topCategories,
  className,
  onViewPlanning,
}: BudgetProgressProps) {
  const { hidden } = useHideValues();
  const config = statusConfig[status];
  const Icon = config.icon;

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const realPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOver = status === 'over';

  const displayBudget = hidden ? '••••••' : formatCurrency(budget);
  const displaySpent = hidden ? '••••••' : formatCurrency(spent);
  const displayRemaining = hidden ? '••••••' : formatCurrency(Math.abs(remaining));

  return (
    <article className={cn('card p-5', className)}>
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text">Planejamento</h3>
          <p className="text-sm text-text-muted mt-0.5">Acompanhamento do orçamento mensal</p>
        </div>
        {onViewPlanning && (
          <button
            type="button"
            onClick={onViewPlanning}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
          >
            Ver planejamento
          </button>
        )}
      </header>

      {status === 'none' ? (
        <div className="text-center py-6">
          <div className={cn('h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3', config.bgColor, config.color)}>
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-text-muted mb-2">{config.label}</p>
          {onViewPlanning && (
            <button
              type="button"
              onClick={onViewPlanning}
              className="btn-primary px-4 py-2 text-sm"
            >
              Definir orçamento
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Main progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-muted">Usado de</span>
              <span className="font-medium text-text">{displayBudget}</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: config.progressColor,
                }}
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${Math.round(realPercentage)}% do orçamento usado`}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={cn('font-medium', config.color)}>
                {config.icon && <Icon className="h-3.5 w-3.5 inline-block mr-1" aria-hidden="true" />}
                {config.label}
              </span>
              <span className="font-mono font-medium" style={{ color: isOver ? 'var(--color-negative)' : 'var(--color-positive)' }}>
                {isOver ? `+${Math.round(realPercentage - 100)}%` : `${Math.round(realPercentage)}%`}
              </span>
            </div>
          </div>

          {/* Amount details */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-background rounded-xl">
            <div>
              <p className="text-xs text-text-muted mb-1">Gasto</p>
              <p className="text-lg font-semibold tabular-nums font-mono text-negative">{displaySpent}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">
                {isOver ? 'Excedente' : 'Disponível'}
              </p>
              <p className="text-lg font-semibold tabular-nums font-mono" style={{ color: isOver ? 'var(--color-negative)' : 'var(--color-positive)' }}>
                {displayRemaining}
              </p>
            </div>
          </div>

          {/* Top categories */}
          {topCategories && topCategories.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-text-muted mb-3">Maiores categorias</p>
              <div className="space-y-2">
                {topCategories.slice(0, 3).map((cat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-text truncate flex-1">{cat.name}</span>
                    <span className="text-sm font-mono font-medium text-text-muted whitespace-nowrap">
                      {hidden ? '••••••' : `${cat.percentage.toFixed(0)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </article>
  );
}