'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { updateAccountSchema, type UpdateAccountInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action to update an account
 * @param id - Account ID
 * @param input - Account data to update
 * @returns ApiResponse with updated account or error
 */
export async function updateAccount(
  id: string,
  input: UpdateAccountInput
): Promise<ApiResponse<{ id: string; name: string; type: string; currentBalance: number }>> {
  // Validate input
  const validation = updateAccountSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { name, type, institutionId, initialBalance, creditLimit, closingDay, dueDay, isActive } = validation.data;

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

    // If institutionId is being changed, verify it belongs to user
    if (institutionId && institutionId !== existingAccount.institutionId) {
      const institution = await prisma.institution.findFirst({
        where: { id: institutionId, userId, isActive: true },
      });

      if (!institution) {
        return {
          success: false,
          error: 'Instituição não encontrada ou inativa',
        };
      }
    }

    // Check for duplicate name under same institution (if name or institutionId changed)
    if ((name && name !== existingAccount.name) || (institutionId && institutionId !== existingAccount.institutionId)) {
      const targetInstitutionId = institutionId ?? existingAccount.institutionId;
      const targetName = name ?? existingAccount.name;

      const duplicateAccount = await prisma.account.findFirst({
        where: {
          name: targetName,
          institutionId: targetInstitutionId,
          userId,
          id: { not: id },
        },
      });

      if (duplicateAccount) {
        return {
          success: false,
          error: 'Já existe uma conta com este nome nesta instituição',
        };
      }
    }

    // Validate creditLimit for credit card accounts
    const targetType = type ?? existingAccount.type;
    if (targetType === 'CREDIT_CARD' && creditLimit !== undefined && creditLimit !== null && creditLimit <= 0) {
      return {
        success: false,
        error: 'Limite de crédito deve ser maior que zero para cartões de crédito',
      };
    }

    // Validate closingDay and dueDay for credit card accounts
    if (targetType === 'CREDIT_CARD') {
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

    // If initialBalance is being changed, we need to adjust currentBalance accordingly
    let currentBalanceUpdate: { currentBalance: number } | undefined;
    if (initialBalance !== undefined && initialBalance !== Number(existingAccount.initialBalance)) {
      const balanceDiff = initialBalance - Number(existingAccount.initialBalance);
      currentBalanceUpdate = {
        currentBalance: Number(existingAccount.currentBalance) + balanceDiff,
      };
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(institutionId && { institutionId }),
        ...(initialBalance !== undefined && { initialBalance }),
        ...(creditLimit !== undefined && { creditLimit: creditLimit ?? null }),
        ...(closingDay !== undefined && { closingDay: closingDay ?? null }),
        ...(dueDay !== undefined && { dueDay: dueDay ?? null }),
        ...(isActive !== undefined && { isActive }),
        ...currentBalanceUpdate,
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
      message: 'Conta atualizada com sucesso',
    };
  } catch (err) {
    console.error('Update account error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar conta',
    };
  }
}
