'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, Transaction } from '@/types';

/**
 * Server action to toggle transaction status (PENDING <-> COMPLETED)
 * @param id - Transaction ID
 * @param status - New status
 * @returns ApiResponse with updated transaction
 */
export async function markTransactionPaid(
  id: string,
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
): Promise<ApiResponse<Transaction>> {
  try {
    const userId = await getUserId();

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return { success: false, error: 'Transação não encontrada' };
    }

    // If status is the same, return early
    if (existing.status === status) {
      return { success: true, data: existing };
    }

    const transaction = await prisma.transaction.update({
      where: { id, userId },
      data: { status },
      include: { category: true, account: { include: { institution: true } } },
    });

    return {
      success: true,
      data: transaction,
    };
  } catch (err) {
    console.error('Mark transaction paid error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar status da transação',
    };
  }
}