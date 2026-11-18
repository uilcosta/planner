'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ApiResponse } from '@/types';

/**
 * Schema for reorder input
 */
const reorderCategorySchema = z.object({
  categoryId: z.string().cuid('ID de categoria inválido'),
  newParentId: z.string().cuid().nullable().optional(),
  newIndex: z.number().int().min(0),
});

export type ReorderCategoryInput = z.infer<typeof reorderCategorySchema>;

/**
 * Server action to reorder a category (move to new parent and/or position)
 * @param input - Reorder data (categoryId, newParentId, newIndex)
 * @returns ApiResponse with success or error
 */
export async function reorderCategory(
  input: ReorderCategoryInput
): Promise<ApiResponse<void>> {
  // Validate input
  const validation = reorderCategorySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { categoryId, newParentId, newIndex } = validation.data;

  try {
    const userId = await getUserId();

    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Validate new parent if provided
    if (newParentId !== undefined && newParentId !== null) {
      // Cannot be own parent
      if (newParentId === categoryId) {
        return {
          success: false,
          error: 'Uma categoria não pode ser pai de si mesma',
        };
      }

      // Verify parent exists and belongs to user
      const parentCategory = await prisma.category.findFirst({
        where: { id: newParentId, userId },
      });

      if (!parentCategory) {
        return {
          success: false,
          error: 'Categoria pai não encontrada',
        };
      }

      // Check for circular reference
      let currentId: string | null = newParentId;
      while (currentId) {
        if (currentId === categoryId) {
          return {
            success: false,
            error: 'Não é permitido criar referência circular na hierarquia',
          };
        }

        const parent: { parentId: string | null } | null = await prisma.category.findFirst({
          where: { id: currentId, userId },
          select: { parentId: true },
        });

        if (!parent) {
          currentId = null;
        } else {
          currentId = parent.parentId;
        }
      }
    }

    // For now, we'll just update the parentId since we don't have an explicit order field
    // In a real implementation, you might want to add an `order` field to the Category model
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        parentId: newParentId ?? null,
      },
    });

    return {
      success: true,
      message: 'Categoria reordenada com sucesso',
    };
  } catch (err) {
    console.error('Reorder category error:', err);
    return {
      success: false,
      error: 'Erro ao reordenar categoria',
    };
  }
}