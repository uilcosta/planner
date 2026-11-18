'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Target, TrendingUp, AlertCircle, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressKPICard } from '@/components/dashboard/KPICard';
import { formatCurrency } from '@/lib/utils';

interface CaixinhaCardProps {
  caixinha: {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    targetDate?: Date | null;
    progress: number;
    account?: {
      id: string;
      name: string;
      type: string;
      institution?: { name: string } | null;
    } | null;
  };
  onContribute: (caixinhaId: string) => void;
  onEdit: (caixinhaId: string) => void;
  onDelete: (caixinhaId: string) => void;
  onClick?: (caixinhaId: string) => void;
}

export function CaixinhaCard({
  caixinha,
  onContribute,
  onEdit,
  onDelete,
  onClick,
}: CaixinhaCardProps) {
  const [showActions, setShowActions] = useState(false);
  const progress = Math.min(100, Math.max(0, caixinha.progress));
  const isComplete = progress >= 100;

  const getIconColor = () => {
    if (caixinha.color) return caixinha.color;
    if (isComplete) return '#22c55e';
    if (progress >= 75) return '#f59e0b';
    if (progress >= 50) return '#f97316';
    return '#6366f1';
  };

  const iconColor = getIconColor();

  return (
    <Card
      variant="glass"
      className={cn(
        'card-hover relative overflow-hidden group',
        'transition-all duration-300',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick ? () => onClick(caixinha.id) : undefined}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: iconColor }}
      />

      {/* Completion overlay */}
      {isComplete && (
        <div className="absolute inset-0 bg-success-500/10 flex items-center justify-center pointer-events-none">
          <CheckCircle className="h-12 w-12 text-success-500/30" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              {caixinha.icon ? (
                <span className="text-xl" role="img" aria-label={caixinha.name}>
                  {caixinha.icon}
                </span>
              ) : (
                <Target className="h-6 w-6" style={{ color: iconColor }} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-card-foreground truncate">{caixinha.name}</h3>
              {caixinha.description && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">{caixinha.description}</p>
              )}
            </div>
          </div>
          {/* Actions menu */}
          <div
            className={cn(
              'flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
              showActions && 'opacity-100'
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onEdit(caixinha.id); }}
              className="h-8 w-8 rounded-lg"
              aria-label="Editar caixinha"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDelete(caixinha.id); }}
              className="h-8 w-8 rounded-lg text-danger-600 hover:bg-danger-50"
              aria-label="Excluir caixinha"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Ring / Bar */}
        <ProgressKPICard
          title=""
          value={`${progress.toFixed(1)}%`}
          progress={progress}
          icon={<Target className="h-5 w-5" />}
          variant="primary"
          description={isComplete ? 'Meta atingida! 🎉' : `Meta: ${formatCurrency(caixinha.targetAmount)}`}
          className="mb-4"
        />

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className="font-mono font-medium text-card-foreground">{formatCurrency(caixinha.currentAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mensal sugerido</p>
            <p className="font-mono font-medium text-accent-600 dark:text-accent-400">
              {formatCurrency(caixinha.monthlyContribution)}
            </p>
          </div>
        </div>

        {/* Account info */}
        {caixinha.account && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50 mb-4">
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">
              {caixinha.account.institution?.name ?? ''} {caixinha.account.name}
            </span>
          </div>
        )}

        {/* Target date */}
        {caixinha.targetDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>Prazo: {new Date(caixinha.targetDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {/* Contribute button */}
        <Button
          onClick={(e) => { e.stopPropagation(); onContribute(caixinha.id); }}
          className={cn('w-full', isComplete ? 'bg-success-500 hover:bg-success-600' : '')}
          disabled={isComplete}
        >
          {isComplete ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Meta Atingida
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Aportar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/* Compact version for lists */
export function CaixinhaCardCompact({
  caixinha,
  onContribute,
  onClick,
}: CaixinhaCardProps) {
  const progress = Math.min(100, Math.max(0, caixinha.progress));
  const isComplete = progress >= 100;

  const getIconColor = () => {
    if (caixinha.color) return caixinha.color;
    if (isComplete) return '#22c55e';
    if (progress >= 75) return '#f59e0b';
    if (progress >= 50) return '#f97316';
    return '#6366f1';
  };

  return (
    <Card variant="glass" className={cn('card-hover', onClick && 'cursor-pointer')} onClick={onClick ? () => onClick(caixinha.id) : undefined}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${getIconColor()}20` }}
          >
            {caixinha.icon ? (
              <span className="text-lg" role="img" aria-label={caixinha.name}>{caixinha.icon}</span>
            ) : (
              <Target className="h-5 w-5" style={{ color: getIconColor() }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-card-foreground truncate">{caixinha.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-mono font-medium text-card-foreground w-16 text-right">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-medium text-card-foreground">{formatCurrency(caixinha.currentAmount)}</p>
            <p className="text-xs text-muted-foreground">de {formatCurrency(caixinha.targetAmount)}</p>
          </div>
        </div>
        {!isComplete && (
          <Button
            onClick={(e) => { e.stopPropagation(); onContribute(caixinha.id); }}
            className="w-full mt-3"
            variant="outline"
            size="sm"
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Aportar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}