'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createCaixinhaSchema, type CreateCaixinhaInput } from '@/lib/validators';
import type { ApiResponse, Caixinha } from '@/types';

/**
 * Server action to create a new caixinha
 * @param input - Caixinha data
 * @returns ApiResponse with created caixinha
 */
export async function createCaixinha(input: CreateCaixinhaInput): Promise<ApiResponse<Caixinha>> {
  try {
    const userId = await getUserId();

    // Validate input
    const validated = createCaixinhaSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const data = validated.data;

    // Verify account if provided
    if (data.accountId) {
      const account = await prisma.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) {
        return { success: false, error: 'Conta não encontrada' };
      }
    }

    const caixinha = await prisma.caixinha.create({
      data: {
        ...data,
        userId,
        targetAmount: data.targetAmount,
        monthlyContribution: data.monthlyContribution ?? 0,
        currentAmount: 0,
      },
      include: { account: { include: { institution: true } } },
    });

    return {
      success: true,
      data: caixinha,
    };
  } catch (err) {
    console.error('Create caixinha error:', err);
    return {
      success: false,
      error: 'Erro ao criar caixinha',
    };
  }
}