'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { getDaysInMonth, adjustDayOfMonth } from '@/lib/utils';
import type { ApiResponse, PlannedItemWithCategory } from '@/types';

interface PlannedItemOccurrence {
  id: string;
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
}

/**
 * Server action to get planned items for a specific month/year
 * Generates occurrences for recurring items
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with array of planned item occurrences
 */
export async function getPlannedItemsByMonth(
  month: number,
  year: number
): Promise<ApiResponse<PlannedItemOccurrence[]>> {
  try {
    const userId = await getUserId();

    // Validate month/year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido' };
    }
    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    // Get all active planned items for user
    const plannedItems = await prisma.plannedItem.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
    });

    const daysInMonth = getDaysInMonth(year, month);
    const occurrences: PlannedItemOccurrence[] = [];

    for (const item of plannedItems) {
      // Check if item applies to this month/year based on recurrence
      const itemApplies = doesItemApplyToMonth(item, month, year);

      if (!itemApplies) continue;

      // Calculate the day of month for this occurrence
      let occurrenceDay: number;

      if (item.dayOfMonth) {
        // Use the item's dayOfMonth, adjusted for month boundaries
        occurrenceDay = adjustDayOfMonth(item.dayOfMonth, year, month);
      } else if (item.recurrence === 'ONE_TIME') {
        // For one-time items without dayOfMonth, use the original month/year
        // This shouldn't happen for ONE_TIME items but handle gracefully
        if (item.month === month && item.year === year) {
          occurrenceDay = 1; // Default to day 1
        } else {
          continue; // One-time item doesn't apply to this month
        }
      } else {
        // For recurring items without dayOfMonth, default to day 1
        occurrenceDay = 1;
      }

      const adjustedDay = adjustDayOfMonth(occurrenceDay, year, month);
      const occurrenceDate = new Date(year, month - 1, adjustedDay);

      occurrences.push({
        id: `${item.id}-${year}-${month}`,
        plannedItemId: item.id,
        description: item.description,
        amount: Number(item.amount),
        type: item.type as 'INCOME' | 'EXPENSE',
        categoryId: item.categoryId,
        categoryName: item.category.name,
        categoryColor: item.category.color,
        categoryIcon: item.category.icon,
        dayOfMonth: occurrenceDay,
        adjustedDayOfMonth: adjustedDay,
        recurrence: item.recurrence,
        isRecurring: item.recurrence !== 'ONE_TIME',
        date: occurrenceDate,
      });
    }

    // Sort by date, then by type (income first), then by description
    occurrences.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.type !== b.type) return a.type === 'INCOME' ? -1 : 1;
      return a.description.localeCompare(b.description, 'pt-BR');
    });

    return {
      success: true,
      data: occurrences,
    };
  } catch (err) {
    console.error('Get planned items by month error:', err);
    return {
      success: false,
      error: 'Erro ao buscar itens planejados do mês',
    };
  }
}

/**
 * Check if a planned item applies to a given month/year
 */
function doesItemApplyToMonth(
  item: {
    month: number;
    year: number;
    recurrence: string;
    recurrenceEndDate: Date | null;
    dayOfMonth: number | null;
  },
  targetMonth: number,
  targetYear: number
): boolean {
  const itemStartDate = new Date(item.year, item.month - 1, 1);
  const targetDate = new Date(targetYear, targetMonth - 1, 1);

  // Item hasn't started yet
  if (targetDate < itemStartDate) return false;

  // Check recurrence end date
  if (item.recurrenceEndDate && targetDate > item.recurrenceEndDate) return false;

  switch (item.recurrence) {
    case 'ONE_TIME':
      return item.month === targetMonth && item.year === targetYear;

    case 'MONTHLY':
      return true; // Applies to all months after start

    case 'YEARLY':
      return item.month === targetMonth; // Same month every year

    case 'CUSTOM':
      // For CUSTOM, we'd need more complex logic based on recurrenceEndDate
      // For now, treat as monthly until end date
      return true;

    default:
      return false;
  }
}

/**
 * Server action to get planned items grouped by month for a year
 * @param year - Year (e.g., 2026)
 * @returns ApiResponse with planned items grouped by month
 */
export async function getPlannedItemsForYear(
  year: number
): Promise<
  ApiResponse<
    Array<{
      month: number;
      monthName: string;
      items: PlannedItemOccurrence[];
      totalIncome: number;
      totalExpense: number;
    }>
  >
> {
  try {
    const userId = await getUserId();

    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    const monthsData = await Promise.all(
      Array.from({ length: 12 }, (_, i) => i + 1).map(async (month) => {
        const result = await getPlannedItemsByMonth(month, year);
        const items = result.success ? result.data ?? [] : [];

        const totalIncome = items
          .filter((i) => i.type === 'INCOME')
          .reduce((sum, i) => sum + i.amount, 0);
        const totalExpense = items
          .filter((i) => i.type === 'EXPENSE')
          .reduce((sum, i) => sum + i.amount, 0);

        return {
          month,
          monthName: getMonthName(month),
          items,
          totalIncome,
          totalExpense,
        };
      })
    );

    return {
      success: true,
      data: monthsData,
    };
  } catch (err) {
    console.error('Get planned items for year error:', err);
    return {
      success: false,
      error: 'Erro ao buscar itens planejados do ano',
    };
  }
}

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[month - 1] || '';
}
