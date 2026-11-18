'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to update account balance (used by transactions)
 * @param id - Account ID
 * @param amount - Amount to add/subtract from current balance
 * @returns ApiResponse with updated balance or error
 */
export async function updateAccountBalance(
  id: string,
  amount: number
): Promise<ApiResponse<{ id: string; currentBalance: number }>> {
  try {
    const userId = await getUserId();

    // Verify account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existingAccount) {
      return {
        success: false,
        error: 'Conta não encontrada',
      };
    }

    const newBalance = Number(existingAccount.currentBalance) + amount;

    const account = await prisma.account.update({
      where: { id },
      data: { currentBalance: newBalance },
      select: { id: true, currentBalance: true },
    });

    return {
      success: true,
      data: {
        id: account.id,
        currentBalance: Number(account.currentBalance),
      },
    };
  } catch (err) {
    console.error('Update account balance error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar saldo da conta',
    };
  }
}

/**
 * Server action to set account balance to a specific value
 * @param id - Account ID
 * @param balance - New balance value
 * @returns ApiResponse with updated balance or error
 */
export async function setAccountBalance(
  id: string,
  balance: number
): Promise<ApiResponse<{ id: string; currentBalance: number }>> {
  try {
    const userId = await getUserId();

    // Verify account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existingAccount) {
      return {
        success: false,
        error: 'Conta não encontrada',
      };
    }

    const account = await prisma.account.update({
      where: { id },
      data: { currentBalance: balance },
      select: { id: true, currentBalance: true },
    });

    return {
      success: true,
      data: {
        id: account.id,
        currentBalance: Number(account.currentBalance),
      },
    };
  } catch (err) {
    console.error('Set account balance error:', err);
    return {
      success: false,
      error: 'Erro ao definir saldo da conta',
    };
  }
}
