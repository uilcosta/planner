'use client';

import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useHideValues } from '@/components/providers/HideValuesProvider';
import { Button } from '@/components/ui/Button';
import { ChevronRight, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category?: { name: string; icon?: string } | null;
  account?: { name: string } | null;
  date: string | Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

interface RecentActivityProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onViewDetails: (transaction: Transaction) => void;
  className?: string;
}

const typeIcons = {
  INCOME: TrendingUp,
  EXPENSE: TrendingDown,
  TRANSFER: ArrowRightLeft,
};

const typeColors = {
  INCOME: 'text-positive',
  EXPENSE: 'text-negative',
  TRANSFER: 'text-primary',
};

const typeBgColors = {
  INCOME: 'bg-positive-bg',
  EXPENSE: 'bg-negative-bg',
  TRANSFER: 'bg-primary/10',
};

const typeBorderColors = {
  INCOME: 'border-positive-border',
  EXPENSE: 'border-negative-border',
  TRANSFER: 'border-primary/20',
};

export function RecentActivity({ transactions, onViewAll, onViewDetails, className }: RecentActivityProps) {
  const { hidden } = useHideValues();

  if (transactions.length === 0) {
    return (
      <article className={cn('card p-8 text-center', className)}>
        <svg className="h-12 w-12 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-text-muted">Nenhuma movimentação neste mês</p>
        <Button variant="secondary" onClick={onViewAll} className="mt-4">
          Ver todos os lançamentos
        </Button>
      </article>
    );
  }

  return (
    <article className={cn('card', className)}>
      <header className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-text">Atividade recente</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          Ver todos os lançamentos
        </Button>
      </header>

      <div className="divide-y divide-border">
        {transactions.slice(0, 5).map((tx) => {
          const Icon = typeIcons[tx.type];
          const displayAmount = hidden ? '••••••' : formatCurrency(tx.amount);
          const formattedDate = formatDate(tx.date, 'dd/MM');

          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => onViewDetails(tx)}
              className={cn(
                'w-full p-4 flex items-center gap-4 hover:bg-background transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
              aria-label={`${tx.description}, ${formattedDate}, ${tx.type === 'INCOME' ? 'entrada' : tx.type === 'EXPENSE' ? 'saída' : 'transferência'}, ${displayAmount}`}
            >
              <div className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center',
                typeBgColors[tx.type],
                typeColors[tx.type],
                typeBorderColors[tx.type]
              )}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{tx.description || 'Sem descrição'}</p>
                <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                  <span>{formattedDate}</span>
                  {tx.category && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{tx.category.name}</span>
                    </>
                  )}
                  {tx.account && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{tx.account.name}</span>
                    </>
                  )}
                  {tx.status === 'PENDING' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-warning">Pendente</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn('font-mono font-semibold tabular-nums', typeColors[tx.type])}>
                  {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}{displayAmount}
                </span>
                <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
              </div>
            </button>
          );
        })}
      </div>

      <footer className="p-4 border-t border-border">
        <Button variant="secondary" className="w-full" onClick={onViewAll}>
          Ver todos os lançamentos
        </Button>
      </footer>
    </article>
  );
}