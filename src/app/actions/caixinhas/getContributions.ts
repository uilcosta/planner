'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, Contribution } from '@/types';

/**
 * Server action to get contributions for a caixinha
 * @param caixinhaId - Caixinha ID
 * @param month - Optional month filter
 * @param year - Optional year filter
 * @returns ApiResponse with array of contributions
 */
export async function getContributions(
  caixinhaId: string,
  month?: number,
  year?: number
): Promise<ApiResponse<Contribution[]>> {
  try {
    const userId = await getUserId();

    // Verify caixinha belongs to user
    const caixinha = await prisma.caixinha.findFirst({
      where: { id: caixinhaId, userId },
    });
    if (!caixinha) {
      return { success: false, error: 'Caixinha não encontrada' };
    }

    const where: Record<string, unknown> = { caixinhaId };
    if (month && year) {
      where.month = month;
      where.year = year;
    }

    const contributions = await prisma.contribution.findMany({
      where,
      include: { transaction: true },
      orderBy: { date: 'desc' },
    });

    return {
      success: true,
      data: contributions.map((c) => ({
        ...c,
        amount: Number(c.amount),
        transaction: c.transaction
          ? { ...c.transaction, amount: Number(c.transaction.amount) }
          : null,
      })),
    };
  } catch (err) {
    console.error('Get contributions error:', err);
    return {
      success: false,
      error: 'Erro ao buscar aportes',
    };
  }
}