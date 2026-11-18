'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, CaixinhaWithProgress } from '@/types';

/**
 * Server action to get all caixinhas for the current user
 * @returns ApiResponse with array of caixinhas with progress
 */
export async function getAllCaixinhas(): Promise<ApiResponse<CaixinhaWithProgress[]>> {
  try {
    const userId = await getUserId();

    const caixinhas = await prisma.caixinha.findMany({
      where: { userId, isActive: true },
      include: {
        account: { include: { institution: true } },
        contributions: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { transaction: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const caixinhasWithProgress = caixinhas.map((c) => ({
      ...c,
      targetAmount: Number(c.targetAmount),
      currentAmount: Number(c.currentAmount),
      monthlyContribution: Number(c.monthlyContribution),
      progress: c.targetAmount > 0 ? (Number(c.currentAmount) / Number(c.targetAmount)) * 100 : 0,
    }));

    return {
      success: true,
      data: caixinhasWithProgress,
    };
  } catch (err) {
    console.error('Get all caixinhas error:', err);
    return {
      success: false,
      error: 'Erro ao buscar caixinhas',
    };
  }
}