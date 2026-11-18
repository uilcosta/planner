'use client';

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ComparisonChartProps {
  data: Array<{
    name: string;
    planned: number;
    actual: number;
  }>;
  className?: string;
  title?: string;
  showLegend?: boolean;
}

const COLORS = {
  planned: '#f97316', // primary-500
  actual: '#22c55e',  // success-500
};

export function ComparisonChart({ data, className, title = 'Planejado vs Realizado', showLegend = true }: ComparisonChartProps) {
  if (!data.length) {
    return (
      <Card variant="glass" className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p className="font-medium">Sem dados para exibir</p>
            <p className="text-sm mt-1">Adicione itens planejados e transações para ver a comparação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: showLegend ? 20 : 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value).replace('R$ ', '')}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'planned' ? 'Planejado' : 'Realizado',
                ]}
                labelFormatter={(label) => label}
              />
              {showLegend && (
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => (value === 'planned' ? 'Planejado' : 'Realizado')}
                />
              )}
              <Bar
                dataKey="planned"
                name="Planejado"
                fill={COLORS.planned}
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              >
                {data.map((_, index) => (
                  <Cell key={`planned-${index}`} fill={COLORS.planned} />
                ))}
              </Bar>
              <Bar
                dataKey="actual"
                name="Realizado"
                fill={COLORS.actual}
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              >
                {data.map((_, index) => (
                  <Cell key={`actual-${index}`} fill={COLORS.actual} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/* Line Chart for trends over time */
interface TrendChartProps {
  data: Array<{
    month: string;
    planned: number;
    actual: number;
  }>;
  className?: string;
  title?: string;
}

export function TrendChart({ data, className, title = 'Tendência Mensal' }: TrendChartProps) {
  if (!data.length) {
    return (
      <Card variant="glass" className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p className="font-medium">Sem dados para exibir</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value).replace('R$ ', '')}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'planned' ? 'Planejado' : 'Realizado',
                ]}
                labelFormatter={(label) => label}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="planned"
                name="Planejado"
                stroke={COLORS.planned}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Realizado"
                stroke={COLORS.actual}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}