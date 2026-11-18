'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createContributionSchema, type CreateContributionInput } from '@/lib/validators';
import { getCategoriesFlat } from '@/app/actions/categories/getAll';
import type { ApiResponse, Contribution, Transaction } from '@/types';

/**
 * Server action to add a contribution to a caixinha
 * Automatically creates an EXPENSE transaction in the current month (Control)
 * @param input - Contribution data
 * @returns ApiResponse with created contribution and transaction
 */
export async function addContribution(input: CreateContributionInput): Promise<
  ApiResponse<{ contribution: Contribution; transaction: Transaction }>
> {
  try {
    const userId = await getUserId();

    // Validate input
    const validated = createContributionSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // Get caixinha
    const caixinha = await prisma.caixinha.findFirst({
      where: { id: data.caixinhaId, userId },
    });
    if (!caixinha) {
      return { success: false, error: 'Caixinha não encontrada' };
    }

    // Verify account
    if (!caixinha.accountId) {
      return { success: false, error: 'Caixinha não tem conta associada' };
    }
    const account = await prisma.account.findFirst({
      where: { id: caixinha.accountId, userId },
    });
    if (!account) {
      return { success: false, error: 'Conta da caixinha não encontrada' };
    }

    // Get a default expense category for caixinhas, or use the first expense category
    const categoriesResult = await getCategoriesFlat('EXPENSE');
    if (!categoriesResult.success || !categoriesResult.data?.length) {
      return { success: false, error: 'Nenhuma categoria de despesa encontrada. Crie uma categoria primeiro.' };
    }
    const defaultCategoryId = categoriesResult.data[0].id;

    const month = data.date.getMonth() + 1;
    const year = data.date.getFullYear();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Contribution
      const contribution = await tx.contribution.create({
        data: {
          caixinhaId: data.caixinhaId,
          amount: data.amount,
          date: data.date,
          month,
          year,
          notes: data.notes,
        },
      });

      // 2. Create EXPENSE transaction (saída no controle)
      const transaction = await tx.transaction.create({
        data: {
          description: `Aporte: ${caixinha.name}`,
          amount: data.amount,
          type: 'EXPENSE',
          categoryId: defaultCategoryId,
          accountId: caixinha.accountId!,
          userId,
          date: data.date,
          month,
          year,
          status: 'COMPLETED',
          caixinhaId: data.caixinhaId,
          notes: data.notes,
        },
      });

      // 3. Update caixinha currentAmount
      await tx.caixinha.update({
        where: { id: data.caixinhaId },
        data: { currentAmount: { increment: data.amount } },
      });

      // 4. Update account balance (expense reduces balance)
      await tx.account.update({
        where: { id: caixinha.accountId! },
        data: { currentBalance: { decrement: data.amount } },
      });

      return { contribution, transaction };
    });

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    console.error('Add contribution error:', err);
    return {
      success: false,
      error: 'Erro ao adicionar aporte',
    };
  }
}