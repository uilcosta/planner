'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createTransactionSchema, type CreateTransactionInput } from '@/lib/validators';
import type { ApiResponse, Transaction } from '@/types';

/**
 * Server action to create a new transaction
 * @param input - Transaction data
 * @returns ApiResponse with created transaction
 */
export async function createTransaction(input: CreateTransactionInput): Promise<ApiResponse<Transaction>> {
  try {
    const userId = await getUserId();

    // Validate input
    const validated = createTransactionSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) {
      return { success: false, error: 'Categoria não encontrada' };
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) {
      return { success: false, error: 'Conta não encontrada' };
    }

    // Verify caixinha if provided
    if (data.caixinhaId) {
      const caixinha = await prisma.caixinha.findFirst({
        where: { id: data.caixinhaId, userId },
      });
      if (!caixinha) {
        return { success: false, error: 'Caixinha não encontrada' };
      }
    }

    const month = data.date.getMonth() + 1;
    const year = data.date.getFullYear();

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId,
        month,
        year,
        amount: data.amount,
      },
      include: { category: true, account: { include: { institution: true } } },
    });

    // Update account balance
    const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
    await prisma.account.update({
      where: { id: data.accountId },
      data: { currentBalance: { increment: balanceChange } },
    });

    return {
      success: true,
      data: transaction,
    };
  } catch (err) {
    console.error('Create transaction error:', err);
    return {
      success: false,
      error: 'Erro ao criar transação',
    };
  }
}