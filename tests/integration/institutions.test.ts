import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution,
} from '@/app/actions/institutions';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    institution: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock Supabase server
vi.mock('@/lib/supabase/server', () => ({
  getUserId: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';

describe('Institutions Server Actions', () => {
  const mockUserId = 'clx1234567890abcdef123456';
  const mockInstitutionId = 'clx7890123456abcdef789012';
  const mockNotFoundId = 'clxnotfound00000000000001';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue(mockUserId);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createInstitution', () => {
    it('should create an institution successfully', async () => {
      const mockInstitution = {
        id: mockInstitutionId,
        name: 'Nubank',
        type: 'BANK',
      };

      vi.mocked(prisma.institution.findFirst).mockResolvedValue(null); // No duplicate
      vi.mocked(prisma.institution.create).mockResolvedValue(mockInstitution);

      const result = await createInstitution({
        name: 'Nubank',
        type: 'BANK',
        color: '#8B5CF6',
        logoUrl: 'https://example.com/logo.png',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInstitution);
      expect(prisma.institution.create).toHaveBeenCalledWith({
        data: {
          name: 'Nubank',
          type: 'BANK',
          color: '#8B5CF6',
          logoUrl: 'https://example.com/logo.png',
          userId: mockUserId,
        },
        select: { id: true, name: true, type: true },
      });
    });

    it('should reject duplicate institution name', async () => {
      vi.mocked(prisma.institution.findFirst).mockResolvedValue({ id: 'existing-id' });

      const result = await createInstitution({
        name: 'Nubank',
        type: 'BANK',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Já existe uma instituição com este nome');
    });

    it('should return validation error for invalid input', async () => {
      const result = await createInstitution({
        name: '',
        type: 'INVALID',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Nome é obrigatório');
    });
  });

  describe('getAllInstitutions', () => {
    it('should return all institutions sorted by type and name', async () => {
      // Pre-sorted mock data (as the action would return after Prisma sorts)
      const mockInstitutions = [
        {
          id: 'inst-3',
          name: 'Itaú',
          type: 'BANK',
          color: '#EF4444',
          logoUrl: null,
          userId: mockUserId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'inst-2',
          name: 'Nubank',
          type: 'BANK',
          color: '#8B5CF6',
          logoUrl: 'https://example.com/nubank.png',
          userId: mockUserId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'inst-1',
          name: 'XP Investimentos',
          type: 'INVESTMENT',
          color: '#22C55E',
          logoUrl: null,
          userId: mockUserId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.institution.findMany).mockResolvedValue(mockInstitutions);

      const result = await getAllInstitutions();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      // BANK comes before INVESTMENT alphabetically
      expect(result.data[0].name).toBe('Itaú');
      expect(result.data[1].name).toBe('Nubank');
      expect(result.data[2].name).toBe('XP Investimentos');
    });
  });

  describe('getInstitutionById', () => {
    it('should return institution when found', async () => {
      const mockInstitution = {
        id: mockInstitutionId,
        name: 'Nubank',
        type: 'BANK',
        color: '#8B5CF6',
        logoUrl: 'https://example.com/logo.png',
        userId: mockUserId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.institution.findFirst).mockResolvedValue(mockInstitution);

      const result = await getInstitutionById(mockInstitutionId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInstitution);
    });

    it('should return error when institution not found', async () => {
      vi.mocked(prisma.institution.findFirst).mockResolvedValue(null);

      const result = await getInstitutionById(mockNotFoundId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Instituição não encontrada');
    });
  });

  describe('updateInstitution', () => {
    it('should update institution successfully', async () => {
      const existingInstitution = {
        id: mockInstitutionId,
        name: 'Nubank',
        type: 'BANK',
        userId: mockUserId,
      };

      const updatedInstitution = {
        id: mockInstitutionId,
        name: 'Nubank S.A.',
        type: 'BANK',
      };

      vi.mocked(prisma.institution.findFirst)
        .mockResolvedValueOnce(existingInstitution) // Check existing
        .mockResolvedValueOnce(null); // No duplicate

      vi.mocked(prisma.institution.update).mockResolvedValue(updatedInstitution);

      const result = await updateInstitution(mockInstitutionId, { name: 'Nubank S.A.' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedInstitution);
    });

    it('should reject duplicate name', async () => {
      const existingInstitution = {
        id: mockInstitutionId,
        name: 'Nubank',
        type: 'BANK',
        userId: mockUserId,
      };

      vi.mocked(prisma.institution.findFirst)
        .mockResolvedValueOnce(existingInstitution) // Check existing
        .mockResolvedValueOnce({ id: 'other-id' }); // Duplicate found

      const result = await updateInstitution(mockInstitutionId, { name: 'Itaú' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Já existe uma instituição com este nome');
    });
  });

  describe('deleteInstitution', () => {
    it('should soft delete institution successfully', async () => {
      const mockInstitution = {
        id: mockInstitutionId,
        name: 'Nubank',
        accounts: [],
      };

      vi.mocked(prisma.institution.findFirst).mockResolvedValue(mockInstitution);
      vi.mocked(prisma.institution.update).mockResolvedValue({});

      const result = await deleteInstitution(mockInstitutionId);

      expect(result.success).toBe(true);
      expect(prisma.institution.update).toHaveBeenCalledWith({
        where: { id: mockInstitutionId },
        data: { isActive: false },
      });
    });

    it('should reject deletion when institution has accounts', async () => {
      const mockInstitution = {
        id: mockInstitutionId,
        name: 'Nubank',
        accounts: [{ id: 'account-id' }],
      };

      vi.mocked(prisma.institution.findFirst).mockResolvedValue(mockInstitution);

      const result = await deleteInstitution(mockInstitutionId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('contas associadas');
    });
  });
});