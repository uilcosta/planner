'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { updateInstitutionSchema, type UpdateInstitutionInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action to update an institution
 * @param id - Institution ID
 * @param input - Institution data to update
 * @returns ApiResponse with updated institution or error
 */
export async function updateInstitution(
  id: string,
  input: UpdateInstitutionInput
): Promise<ApiResponse<{ id: string; name: string; type: string }>> {
  // Validate input
  const validation = updateInstitutionSchema.safeParse(input);
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
      error: 'ID de instituição inválido',
    };
  }

  try {
    const userId = await getUserId();

    // Verify institution exists and belongs to user
    const existingInstitution = await prisma.institution.findFirst({
      where: { id, userId },
    });

    if (!existingInstitution) {
      return {
        success: false,
        error: 'Instituição não encontrada',
      };
    }

    const { name, type, color, logoUrl } = validation.data;

    // Check for duplicate name (if name is changing)
    if (name !== undefined && name !== existingInstitution.name) {
      const duplicate = await prisma.institution.findFirst({
        where: {
          name,
          userId,
          NOT: { id },
        },
      });

      if (duplicate) {
        return {
          success: false,
          error: 'Já existe uma instituição com este nome',
        };
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (color !== undefined) updateData.color = color;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    const institution = await prisma.institution.update({
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
      data: institution,
      message: 'Instituição atualizada com sucesso',
    };
  } catch (err) {
    console.error('Update institution error:', err);
    return {
      success: false,
      error: 'Erro ao atualizar instituição',
    };
  }
}