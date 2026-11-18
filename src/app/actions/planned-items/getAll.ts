'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, PlannedItemWithCategory } from '@/types';

/**
 * Server action to get all planned items for the current user
 * @returns ApiResponse with array of planned items (with category)
 */
export async function getAllPlannedItems(): Promise<ApiResponse<PlannedItemWithCategory[]>> {
  try {
    const userId = await getUserId();

    const plannedItems = await prisma.plannedItem.findMany({
      where: { userId, isActive: true },
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { dayOfMonth: 'asc' }, { description: 'asc' }],
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

    return {
      success: true,
      data: plannedItems as PlannedItemWithCategory[],
    };
  } catch (err) {
    console.error('Get all planned items error:', err);
    return {
      success: false,
      error: 'Erro ao buscar itens planejados',
    };
  }
}

/**
 * Server action to get planned items flat list (for selectors)
 * @param type - Optional filter by type (INCOME/EXPENSE)
 * @returns ApiResponse with flat array of planned items
 */
export async function getPlannedItemsFlat(
  type?: 'INCOME' | 'EXPENSE'
): Promise<
  ApiResponse<
    Array<{
      id: string;
      description: string;
      amount: number;
      type: string;
      categoryId: string;
      categoryName: string;
      dayOfMonth: number | null;
      recurrence: string;
    }>
  >
> {
  try {
    const userId = await getUserId();

    const plannedItems = await prisma.plannedItem.findMany({
      where: {
        userId,
        isActive: true,
        ...(type ? { type } : {}),
      },
      orderBy: [{ description: 'asc' }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: plannedItems.map((item) => ({
        id: item.id,
        description: item.description,
        amount: Number(item.amount),
        type: item.type,
        categoryId: item.categoryId,
        categoryName: item.category.name,
        dayOfMonth: item.dayOfMonth,
        recurrence: item.recurrence,
      })),
    };
  } catch (err) {
    console.error('Get planned items flat error:', err);
    return {
      success: false,
      error: 'Erro ao buscar itens planejados',
    };
  }
}
