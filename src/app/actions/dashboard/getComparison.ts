'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, CategoryComparison, ComparisonChartData } from '@/types';

/**
 * Server action to get monthly comparison data for charts
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with comparison data for charts
 */
export async function getMonthlyComparison(month: number, year: number): Promise<
  ApiResponse<{ categories: CategoryComparison[]; chartData: ComparisonChartData }>
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

    const [categories, plannedItems, transactions] = await Promise.all([
      prisma.category.findMany({
        where: { userId, isActive: true },
        orderBy: { name: 'asc' },
      }),
      prisma.plannedItem.findMany({
        where: { userId, month, year, isActive: true },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId, month, year, status: 'COMPLETED' },
        include: { category: true },
      }),
    ]);

    const categoryComparisons: CategoryComparison[] = categories.map((cat) => {
      const plannedCat = plannedItems.filter((p) => p.categoryId === cat.id).reduce((sum, p) => sum + Number(p.amount), 0);
      const actualCat = transactions.filter((t) => t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0);
      const variance = actualCat - plannedCat;
      const variancePercentage = plannedCat === 0 ? (actualCat > 0 ? 100 : 0) : (variance / Math.abs(plannedCat)) * 100;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryType: cat.type,
        plannedAmount: plannedCat,
        actualAmount: actualCat,
        variance,
        variancePercentage,
      };
    });

    // Filter only categories that have data
    const categoriesWithData = categoryComparisons.filter((c) => c.plannedAmount > 0 || c.actualAmount > 0);

    // Prepare chart data
    const chartData: ComparisonChartData = {
      categories: categoriesWithData.map((c) => c.categoryName),
      planned: categoriesWithData.map((c) => c.plannedAmount),
      actual: categoriesWithData.map((c) => c.actualAmount),
    };

    return {
      success: true,
      data: { categories: categoryComparisons, chartData },
    };
  } catch (err) {
    console.error('Get monthly comparison error:', err);
    return {
      success: false,
      error: 'Erro ao buscar dados de comparação',
    };
  }
}