'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { updateCategorySchema, type UpdateCategoryInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Checks if setting parentId would create a circular reference
 * @param categoryId - The category being updated
 * @param newParentId - The proposed new parent ID
 * @param userId - Current user ID
 * @returns true if circular reference would be created
 */
async function wouldCreateCircularReference(
  categoryId: string,
  newParentId: string,
  userId: string
): Promise<boolean> {
  // Traverse up the hierarchy from newParentId
  let currentId: string | null = newParentId;

  while (currentId) {
    if (currentId === categoryId) {
      return true; // Circular reference detected
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

  return false;
}

/**
 * Server action to update a category
 * @param id - Category ID
 * @param input - Category data to update
 * @returns ApiResponse with updated category or error
 */
export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<ApiResponse<{ id: string; name: string; type: string }>> {
  // Validate input
  const validation = updateCategorySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

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
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    const { name, type, parentId, color, icon } = validation.data;

    // Check for duplicate name under same parent (if name or parentId is changing)
    if (name !== undefined || parentId !== undefined) {
      const newName = name ?? existingCategory.name;
      const newParentId = parentId !== undefined ? parentId : existingCategory.parentId;

      const duplicate = await prisma.category.findFirst({
        where: {
          name: newName,
          userId,
          parentId: newParentId ?? null,
          NOT: { id },
        },
      });

      if (duplicate) {
        return {
          success: false,
          error: 'Já existe uma categoria com este nome neste nível',
        };
      }
    }

    // Validate parentId if provided
    if (parentId !== undefined) {
      if (parentId !== null) {
        // Cannot be own parent
        if (parentId === id) {
          return {
            success: false,
            error: 'Uma categoria não pode ser pai de si mesma',
          };
        }

        // Verify parent exists and belongs to user
        const parentCategory = await prisma.category.findFirst({
          where: { id: parentId, userId },
        });

        if (!parentCategory) {
          return {
            success: false,
            error: 'Categoria pai não encontrada',
          };
        }

        // Check for circular reference
        const hasCircularRef = await wouldCreateCircularReference(id, parentId, userId);
        if (hasCircularRef) {
          return {
            success: false,
            error: 'Não é permitido criar referência circular na hierarquia',
          };
        }

        // Prevent changing type if category has children with different type
        if (type !== undefined && type !== existingCategory.type) {
          const childrenWithDifferentType = await prisma.category.findFirst({
            where: {
              parentId: id,
              userId,
              type: { not: type },
            },
          });

          if (childrenWithDifferentType) {
            return {
              success: false,
              error: 'Não é possível alterar o tipo: existem subcategorias com tipo diferente',
            };
          }
        }
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return {
      success: true,
      data: category,
      message: 'Categoria atualizada com sucesso',
    };
  } catch (err) {
    console.error('Update category error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar categoria',
    };
  }
}