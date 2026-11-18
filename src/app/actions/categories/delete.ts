'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action to delete a category (soft delete by setting isActive to false)
 * @param id - Category ID
 * @returns ApiResponse with success or error
 */
export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  // Basic ID validation
  if (!id || id.length !== 25) {
    return {
      success: false,
      error: 'ID de categoria inválido',
    };
  }

  try {
    const userId = await getUserId();

    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        children: true,
        transactions: { take: 1 },
        plannedItems: { take: 1 },
      },
    });

    if (!category) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Check if category has children
    if (category.children.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com subcategorias. Mova ou exclua as subcategorias primeiro.',
      };
    }

    // Check if category has transactions
    if (category.transactions.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com transações associadas. Considere desativá-la.',
      };
    }

    // Check if category has planned items
    if (category.plannedItems.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com itens planejados associados. Considere desativá-la.',
      };
    }

    // Soft delete - set isActive to false
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Categoria excluída com sucesso',
    };
  } catch (err) {
    console.error('Delete category error:', err);
    return {
      success: false,
      error: 'Erro ao excluir categoria',
    };
  }
}

/**
 * Server action to permanently delete a category (hard delete)
 * Only for categories with no dependencies
 * @param id - Category ID
 * @returns ApiResponse with success or error
 */
export async function hardDeleteCategory(id: string): Promise<ApiResponse<void>> {
  // Basic ID validation
  if (!id || id.length !== 25) {
    return {
      success: false,
      error: 'ID de categoria inválido',
    };
  }

  try {
    const userId = await getUserId();

    // Verify category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        children: true,
        transactions: { take: 1 },
        plannedItems: { take: 1 },
      },
    });

    if (!category) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Check dependencies
    if (category.children.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com subcategorias',
      };
    }

    if (category.transactions.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com transações associadas',
      };
    }

    if (category.plannedItems.length > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com itens planejados associados',
      };
    }

    // Hard delete
    await prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Categoria excluída permanentemente',
    };
  } catch (err) {
    console.error('Hard delete category error:', err);
    return {
      success: false,
      error: 'Erro ao excluir categoria permanentemente',
    };
  }
}