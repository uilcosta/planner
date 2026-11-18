'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { createInstitutionSchema, type CreateInstitutionInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action to create a new institution
 * @param input - Institution data (name, type, color, logoUrl)
 * @returns ApiResponse with created institution or error
 */
export async function createInstitution(
  input: CreateInstitutionInput
): Promise<ApiResponse<{ id: string; name: string; type: string }>> {
  // Validate input
  const validation = createInstitutionSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { name, type, color, logoUrl } = validation.data;

  try {
    const userId = await getUserId();

    // Check for duplicate name
    const existingInstitution = await prisma.institution.findFirst({
      where: { name, userId },
    });

    if (existingInstitution) {
      return {
        success: false,
        error: 'Já existe uma instituição com este nome',
      };
    }

    const institution = await prisma.institution.create({
      data: {
        name,
        type,
        color,
        logoUrl,
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
      data: institution,
      message: 'Instituição criada com sucesso',
    };
  } catch (err) {
    console.error('Create institution error:', err);
    return {
      success: false,
      error: 'Erro ao criar instituição',
    };
  }
}