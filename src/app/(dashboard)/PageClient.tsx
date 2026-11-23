'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KPICard } from '@/components/ui/KPICard';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { BudgetProgress } from '@/components/charts/BudgetProgress';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/Button';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { HideValuesToggle } from '@/components/ui/HideValuesToggle';
import { Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDashboardData } from '@/app/actions/dashboard';
import type { DashboardKPIs, WeekData, BudgetData, DashboardTransaction } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [cashFlowData, setCashFlowData] = useState<WeekData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setIsMounted(true);
    const savedMonth = localStorage.getItem('selectedMonth');
    const savedYear = localStorage.getItem('selectedYear');
    if (savedMonth && savedYear) {
      setCurrentMonth(parseInt(savedMonth, 10));
      setCurrentYear(parseInt(savedYear, 10));
    } else {
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
    }
  }, []);

  // Load dashboard data
  useEffect(() => {
    if (!isMounted) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const month = currentMonth + 1; // Convert 0-indexed to 1-12
        const year = currentYear;

        const response = await getDashboardData(month, year);

        if (!response.success) {
          throw new Error(response.error || 'Erro ao carregar dashboard');
        }

        const data = response.data!;
        setKpis(data.kpis);
        setCashFlowData(data.cashFlow);
        setBudgetData(data.budget);
        setRecentTransactions(data.recentTransactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentMonth, currentYear, isMounted]);

  const handleNewLaunch = () => {
    router.push(`/lancamentos?new=true&month=${currentMonth + 1}&year=${currentYear}`);
  };

  const handleViewAllTransactions = () => {
    router.push(`/lancamentos?month=${currentMonth + 1}&year=${currentYear}`);
  };

  const handleViewTransactionDetails = (tx: DashboardTransaction) => {
    // TODO: Open side panel / modal with details
    console.log('View details:', tx);
  };

  const handleViewPlanning = () => {
    router.push(`/planejamento?month=${currentMonth + 1}&year=${currentYear}`);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  // Calculate trends
  const incomeTrend = kpis && kpis.prevMonthIncome > 0
    ? ((kpis.monthIncome - kpis.prevMonthIncome) / kpis.prevMonthIncome) * 100
    : 0;
  const expenseTrend = kpis && kpis.prevMonthExpense > 0
    ? ((kpis.monthExpense - kpis.prevMonthExpense) / kpis.prevMonthExpense) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Dashboard</h1>
            <p className="text-text-muted mt-1">Visão geral das suas finanças</p>
          </div>
          <Button onClick={handleNewLaunch}>
            <Plus className="h-4 w-4 mr-2" />
            Novo lançamento
          </Button>
        </header>

        {/* Skeleton KPIs */}
        <div className="kpi-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 skeleton" style={{ height: '140px' }} />
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="dashboard-grid">
          <div className="card p-5 skeleton" style={{ height: '320px' }} />
          <div className="card p-5 skeleton" style={{ height: '320px' }} />
        </div>

        <div className="card p-8 skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Dashboard</h1>
            <p className="text-text-muted mt-1">
              {monthNames[currentMonth]} {currentYear} — Resumo financeiro
            </p>
          </div>
          <Button onClick={handleNewLaunch} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo lançamento
          </Button>
        </header>
        <div className="card p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-negative mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">Erro ao carregar</h2>
          <p className="text-text-muted mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header per DESIGN.md §3.1 */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div>
            <h1 className="text-2xl font-bold text-text">Dashboard</h1>
            <p className="text-text-muted mt-1">
              {monthNames[currentMonth]} {currentYear} — Resumo financeiro
            </p>
          </div>
          <MonthPicker
            month={currentMonth}
            year={currentYear}
            onChange={(month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
            }}
            onGoToCurrent={() => {
              const now = new Date();
              setCurrentMonth(now.getMonth());
              setCurrentYear(now.getFullYear());
            }}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <HideValuesToggle />
          <Button onClick={handleNewLaunch} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo lançamento
          </Button>
        </div>
      </header>

      {/* KPIs Grid - Responsive per DESIGN.md §3.2 */}
      <div className="kpi-grid" role="region" aria-label="Indicadores financeiros">
        <KPICard
          title="Disponível"
          value={kpis?.available ?? 0}
          variant="available"
          description="Saldo menos reservas"
          action={{ label: 'Ver contas', onClick: () => router.push('/contas') }}
        />

        <KPICard
          title="Em caixinhas"
          value={kpis?.inCaixinhas ?? 0}
          variant="caixinhas"
          description="Total reservado"
          action={{ label: 'Ver caixinhas', onClick: () => router.push('/caixinhas') }}
        />

        <KPICard
          title="Entradas do mês"
          value={kpis?.monthIncome ?? 0}
          variant="income"
          description={kpis?.hasComparison ? `Mês anterior: ${formatCurrency(kpis.prevMonthIncome)}` : 'Sem base de comparação'}
          trend={kpis?.hasComparison ? { value: incomeTrend, label: 'vs mês anterior' } : null}
          action={{ label: 'Ver entradas', onClick: () => router.push(`/lancamentos?type=income&month=${currentMonth + 1}&year=${currentYear}`) }}
        />

        <KPICard
          title="Saídas do mês"
          value={kpis?.monthExpense ?? 0}
          variant="expense"
          description={kpis?.hasComparison ? `Mês anterior: ${formatCurrency(kpis.prevMonthExpense)}` : 'Sem base de comparação'}
          trend={kpis?.hasComparison ? { value: expenseTrend, label: 'vs mês anterior' } : null}
          action={{ label: 'Ver saídas', onClick: () => router.push(`/lancamentos?type=expense&month=${currentMonth + 1}&year=${currentYear}`) }}
        />
      </div>

      {/* Main Content Grid - Fluxo de Caixa (2/3) + Planejamento (1/3) at ≥1200px per DESIGN.md §3.3 */}
      <div className="dashboard-grid">
        {/* Fluxo de Caixa - 2/3 width */}
        <section aria-labelledby="cashflow-title">
          <CashFlowChart
            data={cashFlowData}
            className="h-[380px]"
          />
        </section>

        {/* Planejamento - 1/3 width */}
        <section aria-labelledby="budget-title">
          <BudgetProgress
            budget={budgetData?.budget ?? 0}
            spent={budgetData?.spent ?? 0}
            status={budgetData?.status ?? 'none'}
            topCategories={budgetData?.topCategories}
            onViewPlanning={handleViewPlanning}
          />
        </section>
      </div>

      {/* Atividade Recente - Full width at ≥1200px per DESIGN.md §3.4 */}
      <section aria-labelledby="activity-title" className="w-full">
        <RecentActivity
          transactions={recentTransactions}
          onViewAll={handleViewAllTransactions}
          onViewDetails={handleViewTransactionDetails}
        />
      </section>
    </div>
  );
}