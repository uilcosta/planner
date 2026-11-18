'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to delete an account
 * @param id - Account ID
 * @returns ApiResponse with success or error
 * Note: Soft delete by setting isActive to false to preserve transaction history
 */
export async function deleteAccount(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const userId = await getUserId();

    // Verify account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { transactions: true, caixinhas: true },
        },
      },
    });

    if (!existingAccount) {
      return {
        success: false,
        error: 'Conta não encontrada',
      };
    }

    // Check if account has related data
    if (existingAccount._count.transactions > 0 || existingAccount._count.caixinhas > 0) {
      // Soft delete - just mark as inactive
      await prisma.account.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        success: true,
        data: { id },
        message: 'Conta desativada com sucesso (possui histórico de transações ou caixinhas vinculadas)',
      };
    }

    // Hard delete if no related data
    await prisma.account.delete({
      where: { id },
    });

    return {
      success: true,
      data: { id },
      message: 'Conta excluída com sucesso',
    };
  } catch (err) {
    console.error('Delete account error:', err);
    return {
      success: false,
      error: 'Erro ao excluir conta',
    };
  }
}
