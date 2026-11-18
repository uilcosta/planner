'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to delete an institution (soft delete by setting isActive to false)
 * @param id - Institution ID
 * @returns ApiResponse with success or error
 */
export async function deleteInstitution(id: string): Promise<ApiResponse<void>> {
  // Basic ID validation
  if (!id || id.length !== 25) {
    return {
      success: false,
      error: 'ID de instituição inválido',
    };
  }

  try {
    const userId = await getUserId();

    // Verify institution exists and belongs to user
    const institution = await prisma.institution.findFirst({
      where: { id, userId },
      include: {
        accounts: { take: 1 },
      },
    });

    if (!institution) {
      return {
        success: false,
        error: 'Instituição não encontrada',
      };
    }

    // Check if institution has accounts
    if (institution.accounts.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir instituição com contas associadas. Mova ou exclua as contas primeiro.',
      };
    }

    // Soft delete - set isActive to false
    await prisma.institution.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Instituição excluída com sucesso',
    };
  } catch (err) {
    console.error('Delete institution error:', err);
    return {
      success: false,
      error: 'Erro ao excluir instituição',
    };
  }
}

/**
 * Server action to permanently delete an institution (hard delete)
 * Only for institutions with no dependencies
 * @param id - Institution ID
 * @returns ApiResponse with success or error
 */
export async function hardDeleteInstitution(id: string): Promise<ApiResponse<void>> {
  // Basic ID validation
  if (!id || id.length !== 25) {
    return {
      success: false,
      error: 'ID de instituição inválido',
    };
  }

  try {
    const userId = await getUserId();

    // Verify institution exists and belongs to user
    const institution = await prisma.institution.findFirst({
      where: { id, userId },
      include: {
        accounts: { take: 1 },
      },
    });

    if (!institution) {
      return {
        success: false,
        error: 'Instituição não encontrada',
      };
    }

    // Check dependencies
    if (institution.accounts.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir instituição com contas associadas',
      };
    }

    // Hard delete
    await prisma.institution.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Instituição excluída permanentemente',
    };
  } catch (err) {
    console.error('Hard delete institution error:', err);
    return {
      success: false,
      error: 'Erro ao excluir instituição permanentemente',
    };
  }
}