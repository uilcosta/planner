'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { getPlannedItemsByMonth } from './getByMonth';
import type { ApiResponse } from '@/types';

interface PlannedVsActualItem {
  plannedItemId: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
  dayOfMonth: number;
  adjustedDayOfMonth: number;
  recurrence: string;
  isRecurring: boolean;
  date: Date;
  // Actual transaction data
  actualAmount: number;
  actualCount: number;
  variance: number;
  variancePercentage: number;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'OVER';
}

interface MonthlySummary {
  plannedIncome: number;
  actualIncome: number;
  plannedExpense: number;
  actualExpense: number;
  balance: number;
  variancePercentage: number;
}

/**
 * Server action to get planned items vs actual transactions for a month
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with planned vs actual comparison
 */
export async function getPlannedVsActualForMonth(
  month: number,
  year: number
): Promise<
  ApiResponse<{
    items: PlannedVsActualItem[];
    summary: MonthlySummary;
  }>
> {
  try {
    const userId = await getUserId();

    // Validate month/year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido' };
    }
    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    // Get planned items for the month
    const plannedResult = await getPlannedItemsByMonth(month, year);
    if (!plannedResult.success) {
      return { success: false, error: plannedResult.error };
    }

    const plannedItems = plannedResult.data ?? [];

    // Get actual transactions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
        categoryId: true,
        date: true,
        status: true,
      },
    });

    // Group transactions by planned item (match by category, type, and date proximity)
    // For now, we'll match by categoryId and type, summing all transactions in the month
    const actualByCategory = new Map<
      string,
      { amount: number; count: number; categoryId: string; type: string }
    >();

    for (const tx of transactions) {
      const key = `${tx.categoryId}-${tx.type}`;
      const existing = actualByCategory.get(key) || { amount: 0, count: 0, categoryId: tx.categoryId, type: tx.type };
      existing.amount += Number(tx.amount);
      existing.count += 1;
      actualByCategory.set(key, existing);
    }

    // Merge planned items with actual data
    const items: PlannedVsActualItem[] = plannedItems.map((planned) => {
      const actualKey = `${planned.categoryId}-${planned.type}`;
      const actual = actualByCategory.get(actualKey) || { amount: 0, count: 0 };

      const variance = actual.amount - planned.amount;
      const variancePercentage = planned.amount === 0
        ? actual.amount > 0
          ? 100
          : 0
        : (variance / Math.abs(planned.amount)) * 100;

      let status: PlannedVsActualItem['status'] = 'PENDING';
      if (planned.type === 'INCOME') {
        if (actual.amount === 0) status = 'PENDING';
        else if (actual.amount < planned.amount) status = 'PARTIAL';
        else if (actual.amount === planned.amount) status = 'COMPLETED';
        else status = 'OVER';
      } else {
        // EXPENSE
        if (actual.amount === 0) status = 'PENDING';
        else if (actual.amount < planned.amount) status = 'PARTIAL';
        else if (actual.amount === planned.amount) status = 'COMPLETED';
        else status = 'OVER';
      }

      return {
        ...planned,
        actualAmount: actual.amount,
        actualCount: actual.count,
        variance,
        variancePercentage,
        status,
      };
    });

    // Calculate summary
    const plannedIncome = items.filter((i) => i.type === 'INCOME').reduce((sum, i) => sum + i.amount, 0);
    const actualIncome = items.filter((i) => i.type === 'INCOME').reduce((sum, i) => sum + i.actualAmount, 0);
    const plannedExpense = items.filter((i) => i.type === 'EXPENSE').reduce((sum, i) => sum + i.amount, 0);
    const actualExpense = items.filter((i) => i.type === 'EXPENSE').reduce((sum, i) => sum + i.actualAmount, 0);

    const summary: MonthlySummary = {
      plannedIncome,
      actualIncome,
      plannedExpense,
      actualExpense,
      balance: actualIncome - actualExpense,
      variancePercentage:
        plannedIncome + plannedExpense === 0
          ? 0
          : ((actualIncome - actualExpense - (plannedIncome - plannedExpense)) /
              Math.abs(plannedIncome - plannedExpense)) *
            100,
    };

    return {
      success: true,
      data: { items, summary },
    };
  } catch (err) {
    console.error('Get planned vs actual for month error:', err);
    return {
      success: false,
      error: 'Erro ao buscar comparação planejado vs realizado',
    };
  }
}
