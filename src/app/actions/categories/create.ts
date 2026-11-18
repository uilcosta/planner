'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createCategorySchema, type CreateCategoryInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action to create a new category
 * @param input - Category data (name, type, parentId, color, icon)
 * @returns ApiResponse with created category or error
 */
export async function createCategory(
  input: CreateCategoryInput
): Promise<ApiResponse<{ id: string; name: string; type: string }>> {
  // Validate input
  const validation = createCategorySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { name, type, parentId, color, icon } = validation.data;

  try {
    const userId = await getUserId();

    // If parentId provided, verify it belongs to user and check for circular reference
    if (parentId) {
      const parentCategory = await prisma.category.findFirst({
        where: { id: parentId, userId },
      });

      if (!parentCategory) {
        return {
          success: false,
          error: 'Categoria pai não encontrada',
        };
      }

      // Check for circular reference (parent cannot be a descendant of this category)
      // Since this is a new category, we only need to check if parentId equals the new category's id
      // which is impossible, but we'll add a more robust check in updateCategory
    }

    // Check for duplicate name under same parent
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId,
        parentId: parentId ?? null,
      },
    });

    if (existingCategory) {
      return {
        success: false,
        error: 'Já existe uma categoria com este nome neste nível',
      };
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        parentId: parentId ?? null,
        color,
        icon,
        userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return {
      success: true,
      data: category,
      message: 'Categoria criada com sucesso',
    };
  } catch (err) {
    console.error('Create category error:', err);
    return {
      success: false,
      error: 'Erro ao criar categoria',
    };
  }
}