'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to delete a transaction
 * @param id - Transaction ID
 * @returns ApiResponse with success status
 */
export async function deleteTransaction(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const userId = await getUserId();

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return { success: false, error: 'Transação não encontrada' };
    }

    // Calculate balance change to revert
    const amount = Number(existing.amount);
    const balanceChange = existing.type === 'INCOME' ? -amount : amount;

    await prisma.$transaction(async (tx) => {
      // Delete transaction
      await tx.transaction.delete({ where: { id, userId } });

      // Update account balance
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: balanceChange } },
      });
    });

    return {
      success: true,
      data: { id },
    };
  } catch (err) {
    console.error('Delete transaction error:', err);
    return {
      success: false,
      error: 'Erro ao excluir transação',
    };
  }
}