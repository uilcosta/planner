'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { updateTransactionSchema, type UpdateTransactionInput } from '@/lib/validators';
import type { ApiResponse, Transaction } from '@/types';

/**
 * Server action to update a transaction
 * @param id - Transaction ID
 * @param input - Transaction data to update
 * @returns ApiResponse with updated transaction
 */
export async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<ApiResponse<Transaction>> {
  try {
    const userId = await getUserId();

    // Validate input
    const validated = updateTransactionSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // Get existing transaction to calculate balance difference
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return { success: false, error: 'Transação não encontrada' };
    }

    // Verify category if provided
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId },
      });
      if (!category) {
        return { success: false, error: 'Categoria não encontrada' };
      }
    }

    // Verify account if provided
    if (data.accountId) {
      const account = await prisma.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) {
        return { success: false, error: 'Conta não encontrada' };
      }
    }

    // Calculate balance change if amount or type changed
    const oldAmount = Number(existing.amount);
    const oldType = existing.type;
    const newAmount = data.amount !== undefined ? Number(data.amount) : oldAmount;
    const newType = data.type ?? oldType;

    const oldBalanceChange = oldType === 'INCOME' ? oldAmount : -oldAmount;
    const newBalanceChange = newType === 'INCOME' ? newAmount : -newAmount;
    const balanceDiff = newBalanceChange - oldBalanceChange;

    const transaction = await prisma.$transaction(async (tx) => {
      // Update transaction
      const updated = await tx.transaction.update({
        where: { id, userId },
        data: {
          ...data,
          amount: data.amount !== undefined ? data.amount : undefined,
          month: data.date ? data.date.getMonth() + 1 : undefined,
          year: data.date ? data.date.getFullYear() : undefined,
        },
        include: { category: true, account: { include: { institution: true } } },
      });

      // Update account balance if changed
      if (balanceDiff !== 0 && data.accountId) {
        await tx.account.update({
          where: { id: data.accountId },
          data: { currentBalance: { increment: balanceDiff } },
        });
      } else if (balanceDiff !== 0 && !data.accountId) {
        // Account didn't change, update the existing account
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: balanceDiff } },
        });
      }

      return updated;
    });

    return {
      success: true,
      data: transaction,
    };
  } catch (err) {
    console.error('Update transaction error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar transação',
    };
  }
}