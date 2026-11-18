'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, AccountWithInstitution } from '@/types';

/**
 * Server action to get an account by ID
 * @param id - Account ID
 * @returns ApiResponse with account (with institution) or error
 */
export async function getAccountById(id: string): Promise<ApiResponse<AccountWithInstitution>> {
  try {
    const userId = await getUserId();

    const account = await prisma.account.findFirst({
      where: { id, userId },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!account) {
      return {
        success: false,
        error: 'Conta não encontrada',
      };
    }

    return {
      success: true,
      data: account as AccountWithInstitution,
    };
  } catch (err) {
    console.error('Get account by ID error:', err);
    return {
      success: false,
      error: 'Erro ao buscar conta',
    };
  }
}
