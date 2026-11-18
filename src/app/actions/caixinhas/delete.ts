'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to delete a caixinha (soft delete - sets isActive to false)
 * @param id - Caixinha ID
 * @returns ApiResponse with success status
 */
export async function deleteCaixinha(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const userId = await getUserId();

    const existing = await prisma.caixinha.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return { success: false, error: 'Caixinha não encontrada' };
    }

    // Soft delete - set isActive to false
    await prisma.caixinha.update({
      where: { id, userId },
      data: { isActive: false },
    });

    return {
      success: true,
      data: { id },
    };
  } catch (err) {
    console.error('Delete caixinha error:', err);
    return {
      success: false,
      error: 'Erro ao excluir caixinha',
    };
  }
}