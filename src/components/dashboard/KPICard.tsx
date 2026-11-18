'use client';

import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary' | 'accent';
  className?: string;
}

const variantColors: Record<KPICardProps['variant'], { bg: string; text: string; iconBg: string }> = {
  default: {
    bg: 'bg-muted/50',
    text: 'text-card-foreground',
    iconBg: 'bg-muted',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    iconBg: 'bg-success-100 dark:bg-success-900/30',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-900/20',
    text: 'text-danger-600 dark:text-danger-400',
    iconBg: 'bg-danger-100 dark:bg-danger-900/30',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    iconBg: 'bg-warning-100 dark:bg-warning-900/30',
  },
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    iconBg: 'bg-accent-100 dark:bg-accent-900/30',
  },
};

export function KPICard({
  title,
  value,
  icon,
  trend,
  trendUp,
  description,
  variant = 'default',
  className,
}: KPICardProps) {
  const colors = variantColors[variant];

  return (
    <Card variant="glass" className={cn('card-hover', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colors.iconBg)}>
          <span className={cn('h-5 w-5', colors.text)}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', colors.text)}>{value}</div>
        {(trend || description) && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              <span className={cn(
                'text-xs font-medium flex items-center gap-0.5',
                trendUp ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
              )}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : trendUp === false ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {trend}
              </span>
            )}
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* Progress KPI Card - for caixinhas, goals, etc. */
interface ProgressKPICardProps {
  title: string;
  value: string;
  progress: number; // 0-100
  icon: React.ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary' | 'accent';
  className?: string;
}

const progressVariantColors: Record<ProgressKPICardProps['variant'], { bg: string; text: string; iconBg: string; progressBg: string }> = {
  default: {
    bg: 'bg-muted/50',
    text: 'text-card-foreground',
    iconBg: 'bg-muted',
    progressBg: 'bg-primary-500',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    iconBg: 'bg-success-100 dark:bg-success-900/30',
    progressBg: 'bg-success-500',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-900/20',
    text: 'text-danger-600 dark:text-danger-400',
    iconBg: 'bg-danger-100 dark:bg-danger-900/30',
    progressBg: 'bg-danger-500',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    iconBg: 'bg-warning-100 dark:bg-warning-900/30',
    progressBg: 'bg-warning-500',
  },
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
    progressBg: 'bg-primary-500',
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    iconBg: 'bg-accent-100 dark:bg-accent-900/30',
    progressBg: 'bg-accent-500',
  },
};

export function ProgressKPICard({
  title,
  value,
  progress,
  icon,
  description,
  variant = 'default',
  className,
}: ProgressKPICardProps) {
  const colors = progressVariantColors[variant];
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <Card variant="glass" className={cn('card-hover', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colors.iconBg)}>
          <span className={cn('h-5 w-5', colors.text)}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', colors.text)}>{value}</div>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.progressBg)}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}