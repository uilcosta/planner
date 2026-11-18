'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, Institution } from '@/types';

/**
 * Server action to get a single institution by ID
 * @param id - Institution ID
 * @returns ApiResponse with institution data or error
 */
export async function getInstitutionById(id: string): Promise<ApiResponse<Institution>> {
  // Basic validation
  if (!id || id.length !== 25) {
    return {
      success: false,
      error: 'ID de instituição inválido',
    };
  }

  try {
    const userId = await getUserId();

    const institution = await prisma.institution.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        logoUrl: true,
        userId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!institution) {
      return {
        success: false,
        error: 'Instituição não encontrada',
      };
    }

    return {
      success: true,
      data: institution,
    };
  } catch (err) {
    console.error('Get institution by ID error:', err);
    return {
      success: false,
      error: 'Erro ao buscar instituição',
    };
  }
}