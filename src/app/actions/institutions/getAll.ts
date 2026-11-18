'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, Institution } from '@/types';

/**
 * Server action to get all institutions for the current user
 * @returns ApiResponse with array of institutions
 */
export async function getAllInstitutions(): Promise<ApiResponse<Institution[]>> {
  try {
    const userId = await getUserId();

    const institutions = await prisma.institution.findMany({
      where: { userId, isActive: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
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

    return {
      success: true,
      data: institutions,
    };
  } catch (err) {
    console.error('Get all institutions error:', err);
    return {
      success: false,
      error: 'Erro ao buscar instituições',
    };
  }
}

/**
 * Server action to get institutions flat list (for selectors)
 * @param type - Optional filter by institution type
 * @returns ApiResponse with flat array of institutions
 */
export async function getInstitutionsFlat(
  type?: 'BANK' | 'CREDIT_CARD' | 'INVESTMENT' | 'OTHER'
): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      type: string;
      color: string | null;
      logoUrl: string | null;
    }>
  >
> {
  try {
    const userId = await getUserId();

    const institutions = await prisma.institution.findMany({
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
        color: true,
        logoUrl: true,
      },
    });

    return {
      success: true,
      data: institutions,
    };
  } catch (err) {
    console.error('Get institutions flat error:', err);
    return {
      success: false,
      error: 'Erro ao buscar instituições',
    };
  }
}