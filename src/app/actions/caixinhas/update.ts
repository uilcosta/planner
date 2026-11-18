'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { updateCaixinhaSchema, type UpdateCaixinhaInput } from '@/lib/validators';
import type { ApiResponse, Caixinha } from '@/types';

/**
 * Server action to update a caixinha
 * @param id - Caixinha ID
 * @param input - Caixinha data to update
 * @returns ApiResponse with updated caixinha
 */
export async function updateCaixinha(id: string, input: UpdateCaixinhaInput): Promise<ApiResponse<Caixinha>> {
  try {
    const userId = await getUserId();

    // Validate input
    const validated = updateCaixinhaSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // Verify caixinha belongs to user
    const existing = await prisma.caixinha.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return { success: false, error: 'Caixinha não encontrada' };
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

    const caixinha = await prisma.caixinha.update({
      where: { id, userId },
      data: {
        ...data,
        targetAmount: data.targetAmount,
        monthlyContribution: data.monthlyContribution,
      },
      include: { account: { include: { institution: true } } },
    });

    return {
      success: true,
      data: caixinha,
    };
  } catch (err) {
    console.error('Update caixinha error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar caixinha',
    };
  }
}