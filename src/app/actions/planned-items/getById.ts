'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, PlannedItemWithCategory } from '@/types';

/**
 * Server action to get a planned item by ID
 * @param id - PlannedItem ID
 * @returns ApiResponse with planned item (with category) or error
 */
export async function getPlannedItemById(id: string): Promise<ApiResponse<PlannedItemWithCategory>> {
  try {
    const userId = await getUserId();

    const plannedItem = await prisma.plannedItem.findFirst({
      where: { id, userId },
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

    if (!plannedItem) {
      return {
        success: false,
        error: 'Item planejado não encontrado',
      };
    }

    return {
      success: true,
      data: plannedItem as PlannedItemWithCategory,
    };
  } catch (err) {
    console.error('Get planned item by ID error:', err);
    return {
      success: false,
      error: 'Erro ao buscar item planejado',
    };
  }
}
