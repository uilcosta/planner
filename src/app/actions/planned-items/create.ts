'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createPlannedItemSchema, type CreatePlannedItemInput } from '@/lib/validators';
import { getDaysInMonth, adjustDayOfMonth } from '@/lib/utils';
import type { ApiResponse } from '@/types';

/**
 * Server action to create a new planned item
 * @param input - Planned item data
 * @returns ApiResponse with created planned item or error
 */
export async function createPlannedItem(
  input: CreatePlannedItemInput
): Promise<ApiResponse<{ id: string; description: string; amount: number; type: string }>> {
  // Validate input
  const validation = createPlannedItemSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { description, amount, type, categoryId, month, year, recurrence, recurrenceEndDate, dayOfMonth, isActive } = validation.data;

  try {
    const userId = await getUserId();

    // Verify category belongs to user and matches type
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, isActive: true },
    });

    if (!category) {
      return {
        success: false,
        error: 'Categoria não encontrada ou inativa',
      };
    }

    // Category type must match planned item type (INCOME/EXPENSE)
    // TRANSFER categories are not allowed for planned items
    if (category.type === 'TRANSFER') {
      return {
        success: false,
        error: 'Categoria de transferência não é válida para itens planejados',
      };
    }

    if (category.type !== type) {
      return {
        success: false,
        error: `Categoria deve ser do tipo ${type === 'INCOME' ? 'Receita' : 'Despesa'}`,
      };
    }

    // Validate dayOfMonth for recurring items
    if (recurrence !== 'ONE_TIME' && dayOfMonth) {
      const maxDay = getDaysInMonth(year, month);
      if (dayOfMonth > maxDay) {
        // Adjust to last day of month
        // This is just a validation warning, we'll auto-adjust in getByMonth
      }
    }

    // For ONE_TIME items, dayOfMonth is optional
    // For recurring items, dayOfMonth is required
    if (recurrence !== 'ONE_TIME' && !dayOfMonth) {
      return {
        success: false,
        error: 'Dia do mês é obrigatório para itens recorrentes',
      };
    }

    // Validate recurrenceEndDate for CUSTOM recurrence
    if (recurrence === 'CUSTOM' && !recurrenceEndDate) {
      return {
        success: false,
        error: 'Data de fim da recorrência é obrigatória para recorrência personalizada',
      };
    }

    // Check for duplicate (same user, month, year, description, categoryId, dayOfMonth)
    const existingItem = await prisma.plannedItem.findFirst({
      where: {
        userId,
        month,
        year,
        description,
        categoryId,
        dayOfMonth: dayOfMonth ?? null,
      },
    });

    if (existingItem) {
      return {
        success: false,
        error: 'Já existe um item planejado com estes dados para este mês',
      };
    }

    const plannedItem = await prisma.plannedItem.create({
      data: {
        description,
        amount,
        type,
        categoryId,
        userId,
        month,
        year,
        recurrence: recurrence ?? 'ONE_TIME',
        recurrenceEndDate: recurrenceEndDate ?? null,
        dayOfMonth: dayOfMonth ?? null,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
      },
    });

    return {
      success: true,
      data: {
        ...plannedItem,
        amount: Number(plannedItem.amount),
      },
      message: 'Item planejado criado com sucesso',
    };
  } catch (err) {
    console.error('Create planned item error:', err);
    return {
      success: false,
      error: 'Erro ao criar item planejado',
    };
  }
}
