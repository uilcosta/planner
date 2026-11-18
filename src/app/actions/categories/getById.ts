'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, Category } from '@/types';

/**
 * Server action to get a single category by ID
 * @param id - Category ID
 * @returns ApiResponse with category data or error
 */
export async function getCategoryById(id: string): Promise<ApiResponse<Category>> {
  // Basic validation
  if (!id || id.length !== 25) {
    return {
      success: false,
      error: 'ID de categoria inválido',
    };
  }

  try {
    const userId = await getUserId();

    const category = await prisma.category.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        type: true,
        parentId: true,
        userId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    return {
      success: true,
      data: category,
    };
  } catch (err) {
    console.error('Get category by ID error:', err);
    return {
      success: false,
      error: 'Erro ao buscar categoria',
    };
  }
}