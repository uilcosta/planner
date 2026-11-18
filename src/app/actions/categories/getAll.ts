'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, CategoryWithChildren } from '@/types';

/**
 * Server action to get all categories for the current user
 * Returns hierarchical structure with children nested
 * @returns ApiResponse with array of categories (with nested children)
 */
export async function getAllCategories(): Promise<ApiResponse<CategoryWithChildren[]>> {
  try {
    const userId = await getUserId();

    // Fetch all categories for user
    const categories = await prisma.category.findMany({
      where: { userId, isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
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

    // Build hierarchical tree
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create all nodes
    for (const cat of categories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Second pass: build hierarchy
    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Orphaned category (parent deleted or not owned by user) - treat as root
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    }

    // Sort children by name
    const sortChildren = (cats: CategoryWithChildren[]) => {
      cats.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      cats.forEach((cat) => sortChildren(cat.children));
    };
    sortChildren(rootCategories);

    return {
      success: true,
      data: rootCategories,
    };
  } catch (err) {
    console.error('Get all categories error:', err);
    return {
      success: false,
      error: 'Erro ao buscar categorias',
    };
  }
}

/**
 * Server action to get flat list of categories (for selectors)
 * @param type - Optional filter by category type
 * @returns ApiResponse with flat array of categories
 */
export async function getCategoriesFlat(
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      type: string;
      parentId: string | null;
      color: string | null;
      icon: string | null;
    }>
  >
> {
  try {
    const userId = await getUserId();

    const categories = await prisma.category.findMany({
      where: {
        userId,
        isActive: true,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        parentId: true,
        color: true,
        icon: true,
      },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (err) {
    console.error('Get categories flat error:', err);
    return {
      success: false,
      error: 'Erro ao buscar categorias',
    };
  }
}