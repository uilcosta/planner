'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, DashboardSummary } from '@/types';

/**
 * Server action to get dashboard summary for a month
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with dashboard summary
 */
export async function getDashboardSummary(month: number, year: number): Promise<ApiResponse<DashboardSummary>> {
  try {
    const userId = await getUserId();

    // Validate month/year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido' };
    }
    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    const [plannedItems, transactions, accounts, caixinhas] = await Promise.all([
      prisma.plannedItem.findMany({
        where: { userId, month, year, isActive: true },
      }),
      prisma.transaction.findMany({
        where: { userId, month, year, status: 'COMPLETED' },
      }),
      prisma.account.findMany({
        where: { userId, isActive: true },
      }),
      prisma.caixinha.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    const plannedIncome = plannedItems
      .filter((p) => p.type === 'INCOME')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const plannedExpense = plannedItems
      .filter((p) => p.type === 'EXPENSE')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const actualIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const actualExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const varianceIncome = plannedIncome === 0 ? 0 : ((actualIncome - plannedIncome) / plannedIncome) * 100;
    const varianceExpense = plannedExpense === 0 ? 0 : ((actualExpense - plannedExpense) / plannedExpense) * 100;

    const totalCaixinhas = caixinhas.reduce((sum, c) => sum + Number(c.currentAmount), 0);
    const totalCaixinhasTarget = caixinhas.reduce((sum, c) => sum + Number(c.targetAmount), 0);

    return {
      success: true,
      data: {
        planned: {
          income: plannedIncome,
          expense: plannedExpense,
          balance: plannedIncome - plannedExpense,
        },
        actual: {
          income: actualIncome,
          expense: actualExpense,
          balance: actualIncome - actualExpense,
        },
        variance: {
          income: varianceIncome,
          expense: varianceExpense,
        },
        accounts: accounts.map((a) => ({
          id: a.id,
          name: a.name,
          balance: Number(a.currentBalance),
          type: a.type,
        })),
        caixinhas: {
          total: totalCaixinhas,
          target: totalCaixinhasTarget,
          progress: totalCaixinhasTarget > 0 ? (totalCaixinhas / totalCaixinhasTarget) * 100 : 0,
          count: caixinhas.length,
        },
      },
    };
  } catch (err) {
    console.error('Get dashboard summary error:', err);
    return {
      success: false,
      error: 'Erro ao buscar resumo do dashboard',
    };
  }
}