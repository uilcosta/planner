'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { updatePlannedItemSchema, type UpdatePlannedItemInput } from '@/lib/validators';
import { getDaysInMonth } from '@/lib/utils';
import type { ApiResponse } from '@/types';

/**
 * Server action to update a planned item
 * @param id - PlannedItem ID
 * @param input - Planned item data to update
 * @returns ApiResponse with updated planned item or error
 */
export async function updatePlannedItem(
  id: string,
  input: UpdatePlannedItemInput
): Promise<ApiResponse<{ id: string; description: string; amount: number; type: string }>> {
  // Validate input
  const validation = updatePlannedItemSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { description, amount, type, categoryId, month, year, recurrence, recurrenceEndDate, dayOfMonth, isActive } = validation.data;

  try {
    const userId = await getUserId();

    // Verify planned item exists and belongs to user
    const existingItem = await prisma.plannedItem.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!existingItem) {
      return {
        success: false,
        error: 'Item planejado não encontrado',
      };
    }

    // If categoryId is being changed, verify it belongs to user and matches type
    if (categoryId && categoryId !== existingItem.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId, isActive: true },
      });

      if (!category) {
        return {
          success: false,
          error: 'Categoria não encontrada ou inativa',
        };
      }

      if (category.type === 'TRANSFER') {
        return {
          success: false,
          error: 'Categoria de transferência não é válida para itens planejados',
        };
      }

      const targetType = type ?? existingItem.type;
      if (category.type !== targetType) {
        return {
          success: false,
          error: `Categoria deve ser do tipo ${targetType === 'INCOME' ? 'Receita' : 'Despesa'}`,
        };
      }
    }

    // If type is being changed, verify it matches category
    if (type && type !== existingItem.type) {
      const targetCategoryId = categoryId ?? existingItem.categoryId;
      const category = await prisma.category.findFirst({
        where: { id: targetCategoryId, userId, isActive: true },
      });

      if (category && category.type !== type) {
        return {
          success: false,
          error: `Categoria deve ser do tipo ${type === 'INCOME' ? 'Receita' : 'Despesa'}`,
        };
      }
    }

    // Validate dayOfMonth for recurring items
    const targetRecurrence = recurrence ?? existingItem.recurrence;
    const targetMonth = month ?? existingItem.month;
    const targetYear = year ?? existingItem.year;
    const targetDayOfMonth = dayOfMonth !== undefined ? dayOfMonth : existingItem.dayOfMonth;

    if (targetRecurrence !== 'ONE_TIME' && targetDayOfMonth) {
      const maxDay = getDaysInMonth(targetYear, targetMonth);
      if (targetDayOfMonth > maxDay) {
        // Just a validation note - we'll auto-adjust in getByMonth
      }
    }

    // For recurring items, dayOfMonth is required
    if (targetRecurrence !== 'ONE_TIME' && !targetDayOfMonth) {
      return {
        success: false,
        error: 'Dia do mês é obrigatório para itens recorrentes',
      };
    }

    // Validate recurrenceEndDate for CUSTOM recurrence
    if (targetRecurrence === 'CUSTOM' && !recurrenceEndDate && !existingItem.recurrenceEndDate) {
      return {
        success: false,
        error: 'Data de fim da recorrência é obrigatória para recorrência personalizada',
      };
    }

    // Check for duplicate (if key fields changed)
    if (
      (description && description !== existingItem.description) ||
      (categoryId && categoryId !== existingItem.categoryId) ||
      (month && month !== existingItem.month) ||
      (year && year !== existingItem.year) ||
      (dayOfMonth !== undefined && dayOfMonth !== existingItem.dayOfMonth)
    ) {
      const targetDescription = description ?? existingItem.description;
      const targetCategoryId = categoryId ?? existingItem.categoryId;
      const targetMonth = month ?? existingItem.month;
      const targetYear = year ?? existingItem.year;
      const targetDayOfMonth = dayOfMonth !== undefined ? dayOfMonth : existingItem.dayOfMonth;

      const duplicateItem = await prisma.plannedItem.findFirst({
        where: {
          userId,
          month: targetMonth,
          year: targetYear,
          description: targetDescription,
          categoryId: targetCategoryId,
          dayOfMonth: targetDayOfMonth ?? null,
          id: { not: id },
        },
      });

      if (duplicateItem) {
        return {
          success: false,
          error: 'Já existe um item planejado com estes dados para este mês',
        };
      }
    }

    const plannedItem = await prisma.plannedItem.update({
      where: { id },
      data: {
        ...(description && { description }),
        ...(amount !== undefined && { amount }),
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(month && { month }),
        ...(year && { year }),
        ...(recurrence && { recurrence }),
        ...(recurrenceEndDate !== undefined && { recurrenceEndDate: recurrenceEndDate ?? null }),
        ...(dayOfMonth !== undefined && { dayOfMonth: dayOfMonth ?? null }),
        ...(isActive !== undefined && { isActive }),
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
      message: 'Item planejado atualizado com sucesso',
    };
  } catch (err) {
    console.error('Update planned item error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar item planejado',
    };
  }
}
