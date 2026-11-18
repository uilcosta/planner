'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, DashboardData, DashboardKPIs, WeekData, BudgetData, DashboardTransaction } from '@/types';

/**
 * Server action to get all dashboard data for a month
 * Returns KPIs, cash flow, budget, and recent transactions
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with complete dashboard data
 */
export async function getDashboardData(month: number, year: number): Promise<ApiResponse<DashboardData>> {
  try {
    const userId = await getUserId();

    // Validate month/year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido' };
    }
    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    // Calculate previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    // Fetch all data in parallel
    const [
      currentPlannedItems,
      currentTransactions,
      prevTransactions,
      accounts,
      caixinhas,
    ] = await Promise.all([
      prisma.plannedItem.findMany({
        where: { userId, month, year, isActive: true },
      }),
      prisma.transaction.findMany({
        where: { userId, month, year, status: 'COMPLETED' },
        include: { category: true, account: true },
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.findMany({
        where: { userId, month: prevMonth, year: prevYear, status: 'COMPLETED' },
      }),
      prisma.account.findMany({
        where: { userId, isActive: true },
      }),
      prisma.caixinha.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    // Calculate KPIs
    const plannedExpense = currentPlannedItems
      .filter((p) => p.type === 'EXPENSE')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const actualIncome = currentTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const actualExpense = currentTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevMonthIncome = prevTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const prevMonthExpense = prevTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalAccountsBalance = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const totalCaixinhas = caixinhas.reduce((sum, c) => sum + Number(c.currentAmount), 0);
    const available = totalAccountsBalance - totalCaixinhas;

    const kpis: DashboardKPIs = {
      available,
      inCaixinhas: totalCaixinhas,
      monthIncome: actualIncome,
      monthExpense: actualExpense,
      prevMonthIncome,
      prevMonthExpense,
      hasComparison: prevMonthIncome > 0 || prevMonthExpense > 0,
    };

    // Calculate cash flow (weekly breakdown)
    const cashFlow = calculateWeeklyCashFlow(currentTransactions, month, year);

    // Calculate budget data
    const budget = calculateBudgetData(plannedExpense, actualExpense, currentTransactions);

    // Get recent transactions (last 10)
    const recentTransactions: DashboardTransaction[] = currentTransactions.slice(0, 10).map((t) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category ? { name: t.category.name, icon: t.category.icon ?? undefined } : null,
      account: t.account ? { name: t.account.name } : null,
      date: t.date,
      status: t.status,
    }));

    return {
      success: true,
      data: {
        kpis,
        cashFlow,
        budget,
        recentTransactions,
      },
    };
  } catch (err) {
    console.error('Get dashboard data error:', err);
    return {
      success: false,
      error: 'Erro ao buscar dados do dashboard',
    };
  }
}

/**
 * Calculate weekly cash flow for the month
 */
function calculateWeeklyCashFlow(
  transactions: Array<{ type: string; amount: { toString: () => string }; date: Date; category?: { name: string; color?: string | null } | null }>,
  month: number,
  year: number
): WeekData[] {
  const weeks: WeekData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  // Define weeks (1-7, 8-14, 15-21, 22-28, 29-end)
  const weekRanges = [
    { start: 1, end: 7 },
    { start: 8, end: 14 },
    { start: 15, end: 21 },
    { start: 22, end: 28 },
    { start: 29, end: daysInMonth },
  ];

  for (let i = 0; i < weekRanges.length; i++) {
    const { start, end } = weekRanges[i];
    if (start > daysInMonth) break;

    const weekStart = new Date(year, month - 1, start);
    const weekEnd = new Date(year, month - 1, end);

    const weekTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= weekStart && txDate <= weekEnd;
    });

    const income = weekTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = weekTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    weeks.push({
      week: i + 1,
      label: `Sem ${i + 1} (${start}-${end})`,
      startDate: weekStart,
      endDate: weekEnd,
      income,
      expense,
    });
  }

  return weeks;
}

/**
 * Calculate budget data from planned vs actual expenses
 */
function calculateBudgetData(
  plannedExpense: number,
  actualExpense: number,
  transactions: Array<{ type: string; amount: { toString: () => string }; category?: { name: string; color?: string | null } | null }>
): BudgetData {
  const budget = plannedExpense > 0 ? plannedExpense : actualExpense * 1.2; // fallback: 20% buffer
  const spent = actualExpense;

  let status: BudgetData['status'] = 'none';
  if (budget > 0) {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) status = 'over';
    else if (percentage >= 90) status = 'limit';
    else if (percentage >= 75) status = 'warning';
    else status = 'normal';
  }

  // Top expense categories by percentage
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const categoryTotals = new Map<string, { total: number; color: string }>();

  for (const t of expenseTransactions) {
    const catName = t.category?.name ?? 'Outros';
    const catColor = t.category?.color ?? '#6B7280';
    const current = categoryTotals.get(catName) ?? { total: 0, color: catColor };
    current.total += Number(t.amount);
    categoryTotals.set(catName, current);
  }

  const topCategories = Array.from(categoryTotals.entries())
    .map(([name, { total, color }]) => ({
      name,
      percentage: spent > 0 ? (total / spent) * 100 : 0,
      color,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  return {
    budget,
    spent,
    status,
    topCategories,
  };
}