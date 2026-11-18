'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to delete a planned item
 * @param id - PlannedItem ID
 * @returns ApiResponse with success or error
 * Note: Soft delete by setting isActive to false
 */
export async function deletePlannedItem(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const userId = await getUserId();

    // Verify planned item exists and belongs to user
    const existingItem = await prisma.plannedItem.findFirst({
      where: { id, userId },
    });

    if (!existingItem) {
      return {
        success: false,
        error: 'Item planejado não encontrado',
      };
    }

    // Soft delete - mark as inactive
    await prisma.plannedItem.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      data: { id },
      message: 'Item planejado excluído com sucesso',
    };
  } catch (err) {
    console.error('Delete planned item error:', err);
    return {
      success: false,
      error: 'Erro ao excluir item planejado',
    };
  }
}
