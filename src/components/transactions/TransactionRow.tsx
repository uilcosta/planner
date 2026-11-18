'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MoreVertical, Edit, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VarianceBadge, TransactionStatusBadge } from '@/components/dashboard/VarianceBadge';
import { formatCurrency } from '@/lib/utils';

interface TransactionRowProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    category: {
      id: string;
      name: string;
      icon?: string | null;
      color?: string | null;
    };
    account: {
      id: string;
      name: string;
      type: string;
      institution?: { name: string } | null;
    };
    date: Date | string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    variance?: number | null;
    variancePercentage?: number | null;
    caixinhaId?: string | null;
    notes?: string | null;
  };
  onEdit: (transaction: TransactionRowProps['transaction']) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => void;
  showVariance?: boolean;
  compact?: boolean;
}

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  onToggleStatus,
  showVariance = true,
  compact = false,
}: TransactionRowProps) {
  const [showActions, setShowActions] = useState(false);
  const isExpense = transaction.type === 'EXPENSE';
  const isIncome = transaction.type === 'INCOME';
  const amountColor = isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400';
  const amountPrefix = isIncome ? '+' : '-';

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleToggleStatus = () => {
    const newStatus = transaction.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    onToggleStatus(transaction.id, newStatus);
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors group',
          transaction.status === 'CANCELLED' && 'opacity-50 line-through'
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {transaction.category.icon && (
            <span className="text-lg flex-shrink-0" role="img" aria-label={transaction.category.name}>
              {transaction.category.icon}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-card-foreground truncate">{transaction.description}</p>
            <p className="text-xs text-muted-foreground truncate">
              {transaction.category.name} • {transaction.account.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('font-mono font-medium', amountColor)}>
            {amountPrefix}{formatCurrency(transaction.amount)}
          </span>
          {showVariance && transaction.variancePercentage !== null && transaction.variancePercentage !== undefined && (
            <VarianceBadge
              variance={transaction.variancePercentage}
              planned={0}
              actual={0}
              type={transaction.type}
              size="sm"
              showIcon
            />
          )}
          <TransactionStatusBadge status={transaction.status} size="sm" />
          <div
            className={cn(
              'flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
              showActions && 'opacity-100'
            )}
          >
            <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} className="h-7 w-7" aria-label="Editar">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)} className="h-7 w-7 text-danger-600" aria-label="Excluir">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      variant="glass"
      className={cn(
        'card-hover relative overflow-hidden group',
        transaction.status === 'CANCELLED' && 'opacity-50'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Status indicator bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          backgroundColor:
            transaction.status === 'COMPLETED' ? '#22c55e' :
            transaction.status === 'PENDING' ? '#f59e0b' :
            '#ef4444',
        }}
      />

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Main info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted/50 border border-border/50">
              {transaction.category.icon ? (
                <span className="text-lg" role="img" aria-label={transaction.category.name}>
                  {transaction.category.icon}
                </span>
              ) : (
                <span className="text-lg" role="img" aria-label={transaction.type}>
                  {isIncome ? '📈' : isExpense ? '📉' : '🔄'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-card-foreground truncate">{transaction.description}</p>
                {transaction.caixinhaId && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    Caixinha
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="truncate">{transaction.category.name}</span>
                <span>•</span>
                <span>{transaction.account.institution?.name ?? ''} {transaction.account.name}</span>
                <span>•</span>
                <span>{formatDate(transaction.date)}</span>
                {transaction.notes && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{transaction.notes}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Amount & Variance */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={cn('font-mono font-medium text-lg', amountColor)}>
              {amountPrefix}{formatCurrency(transaction.amount)}
            </span>

            {showVariance && transaction.variancePercentage !== null && transaction.variancePercentage !== undefined && (
              <VarianceDetail
                variance={transaction.variancePercentage}
                planned={0}
                actual={0}
                type={transaction.type}
              />
            )}

            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>

        {/* Actions */}
        <div
          className={cn(
            'flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
            showActions && 'opacity-100'
          )}
        >
          <Button variant="outline" size="sm" onClick={() => handleToggleStatus()}>
            {transaction.status === 'COMPLETED' ? (
              <>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Marcar Pendente
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Marcar Pago
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} className="h-8 w-8" aria-label="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)} className="h-8 w-8 text-danger-600 hover:bg-danger-50" aria-label="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* Compact list version for mobile */
export function TransactionRowMobile({
  transaction,
  onEdit,
  onDelete,
  onToggleStatus,
  showVariance = true,
}: TransactionRowProps) {
  const [showActions, setShowActions] = useState(false);
  const isExpense = transaction.type === 'EXPENSE';
  const isIncome = transaction.type === 'INCOME';
  const amountColor = isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400';
  const amountPrefix = isIncome ? '+' : '-';

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleToggleStatus = () => {
    const newStatus = transaction.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    onToggleStatus(transaction.id, newStatus);
  };

  return (
    <Card variant="glass" className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted/50 border border-border/50">
              {transaction.category.icon ? (
                <span className="text-lg" role="img" aria-label={transaction.category.name}>
                  {transaction.category.icon}
                </span>
              ) : (
                <span className="text-lg">{isIncome ? '📈' : '📉'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-card-foreground truncate">{transaction.description}</p>
              <p className="text-xs text-muted-foreground truncate">
                {transaction.category.name} • {formatDate(transaction.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn('font-mono font-medium', amountColor)}>
              {amountPrefix}{formatCurrency(transaction.amount)}
            </span>
            <TransactionStatusBadge status={transaction.status} size="sm" />
          </div>
        </div>

        {showVariance && transaction.variancePercentage !== null && transaction.variancePercentage !== undefined && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <VarianceBadge
              variance={transaction.variancePercentage}
              planned={0}
              actual={0}
              type={transaction.type}
              size="sm"
              showIcon
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={handleToggleStatus} className="flex-1">
            {transaction.status === 'COMPLETED' ? 'Marcar Pendente' : 'Marcar Pago'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} className="h-8 w-8" aria-label="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)} className="h-8 w-8 text-danger-600" aria-label="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}