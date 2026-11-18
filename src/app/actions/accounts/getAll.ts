'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, AccountWithInstitution } from '@/types';

/**
 * Server action to get all accounts for the current user
 * @returns ApiResponse with array of accounts (with institution)
 */
export async function getAllAccounts(): Promise<ApiResponse<AccountWithInstitution[]>> {
  try {
    const userId = await getUserId();

    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
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

    return {
      success: true,
      data: accounts as AccountWithInstitution[],
    };
  } catch (err) {
    console.error('Get all accounts error:', err);
    return {
      success: false,
      error: 'Erro ao buscar contas',
    };
  }
}

/**
 * Server action to get accounts flat list (for selectors)
 * @param type - Optional filter by account type
 * @returns ApiResponse with flat array of accounts
 */
export async function getAccountsFlat(
  type?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH'
): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      type: string;
      institutionId: string;
      institutionName: string;
      currentBalance: number;
    }>
  >
> {
  try {
    const userId = await getUserId();

    const accounts = await prisma.account.findMany({
      where: {
        userId,
        isActive: true,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: accounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        institutionId: acc.institutionId,
        institutionName: acc.institution.name,
        currentBalance: Number(acc.currentBalance),
      })),
    };
  } catch (err) {
    console.error('Get accounts flat error:', err);
    return {
      success: false,
      error: 'Erro ao buscar contas',
    };
  }
}
