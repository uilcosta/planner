'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type {
  ApiResponse,
  DashboardData,
  DashboardKPIs,
  WeekData,
  BudgetData,
  DashboardTransaction,
} from '@/types';

/**
 * Server action to get all dashboard data for a month
 * Returns KPIs, cash flow, budget, and recent transactions
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with complete dashboard data
 */
export async function getDashboardData(
  month: number,
  year: number
): Promise<ApiResponse<DashboardData>> {
  try {
    const userId = await getUserId();

    // Validate month/year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido' };
    }
    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    // Determine month status: future, current, or closed
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    let monthStatus: 'future' | 'current' | 'closed';
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      monthStatus = 'future';
    } else if (year === currentYear && month === currentMonth) {
      monthStatus = 'current';
    } else {
      monthStatus = 'closed';
    }

    // Calculate previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    // Fetch all data in parallel
    const [currentPlannedItems, currentTransactions, prevTransactions, accounts, caixinhas] =
      await Promise.all([
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

    // For current month: calculate up to current day
    let currentMonthIncomeToDate = actualIncome;
    let currentMonthExpenseToDate = actualExpense;
    let prevMonthIncomeToDate = prevMonthIncome;
    let prevMonthExpenseToDate = prevMonthExpense;

    if (monthStatus === 'current') {
      currentMonthIncomeToDate = currentTransactions
        .filter((t) => t.type === 'INCOME' && new Date(t.date).getDate() <= currentDay)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      currentMonthExpenseToDate = currentTransactions
        .filter((t) => t.type === 'EXPENSE' && new Date(t.date).getDate() <= currentDay)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Previous month up to same day (capped at last day of prev month)
      const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
      const compareDay = Math.min(currentDay, daysInPrevMonth);
      prevMonthIncomeToDate = prevTransactions
        .filter((t) => t.type === 'INCOME' && new Date(t.date).getDate() <= compareDay)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      prevMonthExpenseToDate = prevTransactions
        .filter((t) => t.type === 'EXPENSE' && new Date(t.date).getDate() <= compareDay)
        .reduce((sum, t) => sum + Number(t.amount), 0);
    }

    const totalAccountsBalance = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const totalCaixinhas = caixinhas.reduce((sum, c) => sum + Number(c.currentAmount), 0);
    const available = totalAccountsBalance - totalCaixinhas;

    // Determine comparison values based on month status
    let compareIncome: number;
    let compareExpense: number;
    let hasComparison: boolean;

    if (monthStatus === 'future') {
      compareIncome = 0;
      compareExpense = 0;
      hasComparison = false;
    } else if (monthStatus === 'current') {
      compareIncome = currentMonthIncomeToDate;
      compareExpense = currentMonthExpenseToDate;
      hasComparison = prevMonthIncomeToDate > 0 || prevMonthExpenseToDate > 0;
    } else {
      // closed
      compareIncome = actualIncome;
      compareExpense = actualExpense;
      hasComparison = prevMonthIncome > 0 || prevMonthExpense > 0;
    }

    const kpis: DashboardKPIs = {
      available,
      inCaixinhas: totalCaixinhas,
      monthIncome: actualIncome,
      monthExpense: actualExpense,
      prevMonthIncome: compareIncome,
      prevMonthExpense: compareExpense,
      hasComparison,
    };

    // Calculate cash flow (weekly breakdown)
    const cashFlow = calculateWeeklyCashFlow(currentTransactions, month, year);

    // Calculate budget data
    const budget = calculateBudgetData(plannedExpense, actualExpense, currentTransactions);

    // Get recent transactions (last 10)
    const recentTransactions: DashboardTransaction[] = currentTransactions
      .slice(0, 10)
      .map((t) => ({
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
 * Calculate weekly cash flow for the month (Mon-Sun civil weeks)
 */
function calculateWeeklyCashFlow(
  transactions: Array<{
    type: string;
    amount: { toString: () => string };
    date: Date;
    category?: { name: string; color?: string | null } | null;
  }>,
  month: number,
  year: number
): WeekData[] {
  const weeks: WeekData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Calculate the start of the first week (Monday)
  // If month starts on Monday (1), first week starts on day 1
  // If month starts on Tuesday (2), first week starts on day 1 (Mon is before month)
  // If month starts on Sunday (0), first week starts on day 1 (Monday is day 2)
  let firstMonday = 1;
  if (firstDayWeekday !== 1) {
    // Not Monday
    if (firstDayWeekday === 0) {
      // Sunday
      firstMonday = 2; // Monday is day 2
    } else {
      // Tuesday=2 -> Monday was day 1 (previous week)
      // Wednesday=3 -> Monday was day 1
      // etc.
      firstMonday = 1;
    }
  }

  // Build weeks as Mon-Sun
  let weekNumber = 1;
  let weekStartDay = firstMonday;

  while (weekStartDay <= daysInMonth) {
    const weekEndDay = Math.min(weekStartDay + 6, daysInMonth);

    const weekStart = new Date(year, month - 1, weekStartDay);
    const weekEnd = new Date(year, month - 1, weekEndDay);

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
      week: weekNumber,
      label: `Sem ${weekNumber} (${weekStartDay}-${weekEndDay})`,
      startDate: weekStart,
      endDate: weekEnd,
      income,
      expense,
    });

    weekNumber++;
    weekStartDay = weekEndDay + 1;
  }

  return weeks;
}

/**
 * Calculate budget data from planned vs actual expenses
 */
function calculateBudgetData(
  plannedExpense: number,
  actualExpense: number,
  transactions: Array<{
    type: string;
    amount: { toString: () => string };
    category?: { name: string; color?: string | null } | null;
  }>
): BudgetData {
  const budget = plannedExpense > 0 ? plannedExpense : 0; // no fallback budget per spec
  const spent = actualExpense;

  let status: BudgetData['status'] = 'none';
  if (budget > 0) {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) status = 'over';
    else if (percentage === 100) status = 'limit';
    else if (percentage >= 80) status = 'warning';
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
