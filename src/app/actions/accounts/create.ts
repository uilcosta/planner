'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createAccountSchema, type CreateAccountInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action to create a new account
 * @param input - Account data
 * @returns ApiResponse with created account or error
 */
export async function createAccount(
  input: CreateAccountInput
): Promise<ApiResponse<{ id: string; name: string; type: string; currentBalance: number }>> {
  // Validate input
  const validation = createAccountSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { name, type, institutionId, initialBalance, creditLimit, closingDay, dueDay, isActive } = validation.data;

  try {
    const userId = await getUserId();

    // Verify institution belongs to user
    const institution = await prisma.institution.findFirst({
      where: { id: institutionId, userId, isActive: true },
    });

    if (!institution) {
      return {
        success: false,
        error: 'Instituição não encontrada ou inativa',
      };
    }

    // Check for duplicate name under same institution
    const existingAccount = await prisma.account.findFirst({
      where: {
        name,
        institutionId,
        userId,
      },
    });

    if (existingAccount) {
      return {
        success: false,
        error: 'Já existe uma conta com este nome nesta instituição',
      };
    }

    // Validate creditLimit for credit card accounts
    if (type === 'CREDIT_CARD' && creditLimit !== undefined && creditLimit !== null && creditLimit <= 0) {
      return {
        success: false,
        error: 'Limite de crédito deve ser maior que zero para cartões de crédito',
      };
    }

    // Validate closingDay and dueDay for credit card accounts
    if (type === 'CREDIT_CARD') {
      if (closingDay !== undefined && closingDay !== null && (closingDay < 1 || closingDay > 31)) {
        return {
          success: false,
          error: 'Dia de fechamento deve estar entre 1 e 31',
        };
      }
      if (dueDay !== undefined && dueDay !== null && (dueDay < 1 || dueDay > 31)) {
        return {
          success: false,
          error: 'Dia de vencimento deve estar entre 1 e 31',
        };
      }
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        institutionId,
        userId,
        initialBalance: initialBalance ?? 0,
        currentBalance: initialBalance ?? 0,
        creditLimit: creditLimit ?? null,
        closingDay: closingDay ?? null,
        dueDay: dueDay ?? null,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        currentBalance: true,
      },
    });

    return {
      success: true,
      data: {
        ...account,
        currentBalance: Number(account.currentBalance),
      },
      message: 'Conta criada com sucesso',
    };
  } catch (err) {
    console.error('Create account error:', err);
    return {
      success: false,
      error: 'Erro ao criar conta',
    };
  }
}
