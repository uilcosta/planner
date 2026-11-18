'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useHideValues } from '@/components/providers/HideValuesProvider';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WeekData {
  week: number;
  label: string;
  startDate: Date;
  endDate: Date;
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: WeekData[];
  className?: string;
}

const COLORS = {
  income: 'var(--color-positive)',
  expense: 'var(--color-negative)',
};

const COLORS_LIGHT = {
  income: 'var(--color-positive-bg)',
  expense: 'var(--color-negative-bg)',
};

export function CashFlowChart({ data, className }: CashFlowChartProps) {
  const { hidden } = useHideValues();

  const chartData = useMemo(() => {
    return data.map((week) => ({
      name: week.label,
      week: week.week,
      income: hidden ? 0 : week.income,
      expense: hidden ? 0 : week.expense,
      incomeRaw: week.income,
      expenseRaw: week.expense,
    }));
  }, [data, hidden]);

  const maxValue = useMemo(() => {
    const values = data.flatMap((d) => [d.income, d.expense]);
    return Math.max(...values, 1);
  }, [data]);

  const yDomain = useMemo(() => {
    const max = maxValue * 1.15;
    return [0, max];
  }, [maxValue]);

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; payload: { incomeRaw: number; expenseRaw: number } }>; label?: string }) => {
    if (!active || !payload || !label) return null;

    const incomeItem = payload.find((p) => p.name === 'Entradas');
    const expenseItem = payload.find((p) => p.name === 'Saídas');

    const income = incomeItem?.payload.incomeRaw ?? 0;
    const expense = expenseItem?.payload.expenseRaw ?? 0;

    return (
      <div className="bg-surface border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="font-medium text-text mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.income }} />
            <span className="text-sm text-text">Entradas</span>
            <span className="text-sm font-mono font-medium text-positive ml-auto">
              {hidden ? '••••••' : formatCurrency(income)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.expense }} />
            <span className="text-sm text-text">Saídas</span>
            <span className="text-sm font-mono font-medium text-negative ml-auto">
              {hidden ? '••••••' : formatCurrency(expense)}
            </span>
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-1">
            <span className="text-sm text-text-muted">Saldo</span>
            <span className="text-sm font-mono font-medium ml-auto" style={{ color: income - expense >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
              {hidden ? '••••••' : formatCurrency(income - expense)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className={cn('card p-8 text-center', className)}>
        <svg className="h-12 w-12 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-text-muted">Sem dados de fluxo de caixa para este período</p>
      </div>
    );
  }

  return (
    <div className={cn('card p-5', className)}>
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Fluxo de caixa</h3>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.income }} />
            Entradas
          </span>
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.expense }} />
            Saídas
          </span>
        </div>
      </header>

      <div className="h-64" style={{ width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              type="number"
              domain={yDomain}
              tickFormatter={(value) => hidden ? '••••••' : formatCurrency(value)}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              dy={-10}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text)', fontSize: 12, fontWeight: 500 }}
              width={60}
              dy={-10}
            />
            <Tooltip content={customTooltip} wrapperStyle={{ pointerEvents: 'none' }} />
            <Legend />
            <Bar
              dataKey="income"
              name="Entradas"
              radius={[0, 4, 4, 0]}
              fill={COLORS.income}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell key={`income-${index}`} fill={entry.income > 0 ? COLORS.income : 'transparent'} />
              ))}
            </Bar>
            <Bar
              dataKey="expense"
              name="Saídas"
              radius={[4, 0, 0, 4]}
              fill={COLORS.expense}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell key={`expense-${index}`} fill={entry.expense > 0 ? COLORS.expense : 'transparent'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-4 pt-4 border-t border-border">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          aria-label="Ver dados detalhados do fluxo de caixa"
        >
          Ver dados
        </button>
      </footer>
    </div>
  );
}