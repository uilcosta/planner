import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from '@/app/actions/categories';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
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

describe('Categories Server Actions', () => {
  const mockUserId = 'clx1234567890abcdef123456';
  const mockCategoryId = 'clx7890123456abcdef789012';
  const mockParentId = 'clxparent0000000000000001';
  const mockChildId = 'clxchild0000000000000002';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue(mockUserId);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Supermercado',
        type: 'EXPENSE',
      };

      vi.mocked(prisma.category.findFirst).mockResolvedValue(null); // No duplicate
      vi.mocked(prisma.category.create).mockResolvedValue(mockCategory);

      const result = await createCategory({
        name: 'Supermercado',
        type: 'EXPENSE',
        parentId: null,
        color: '#EF4444',
        icon: 'shopping-cart',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Supermercado',
          type: 'EXPENSE',
          parentId: null,
          color: '#EF4444',
          icon: 'shopping-cart',
          userId: mockUserId,
        },
        select: { id: true, name: true, type: true },
      });
    });

    it('should reject duplicate category name under same parent', async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'existing-id' });

      const result = await createCategory({
        name: 'Supermercado',
        type: 'EXPENSE',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Já existe uma categoria com este nome neste nível');
    });

    it('should reject invalid parentId', async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(null); // Parent not found

      const result = await createCategory({
        name: 'Subcategoria',
        type: 'EXPENSE',
        parentId: mockParentId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Categoria pai não encontrada');
    });

    it('should return validation error for invalid input', async () => {
      const result = await createCategory({
        name: '',
        type: 'INVALID',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Nome é obrigatório');
    });
  });

  describe('getAllCategories', () => {
    it('should return hierarchical categories', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Alimentação',
          type: 'EXPENSE',
          parentId: null,
          icon: 'utensils',
          color: '#EF4444',
          userId: mockUserId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          name: 'Supermercado',
          type: 'EXPENSE',
          parentId: 'cat-1',
          icon: 'shopping-cart',
          color: '#EF4444',
          userId: mockUserId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-3',
          name: 'Salário',
          type: 'INCOME',
          parentId: null,
          icon: 'briefcase',
          color: '#22C55E',
          userId: mockUserId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      const result = await getAllCategories();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Two root categories
      expect(result.data[0].name).toBe('Alimentação');
      expect(result.data[0].children).toHaveLength(1);
      expect(result.data[0].children[0].name).toBe('Supermercado');
      expect(result.data[1].name).toBe('Salário');
    });

    it('should sort categories by type and name', async () => {
      const mockCategories = [
        { id: '1', name: 'Z Category', type: 'EXPENSE', parentId: null, icon: null, color: null, userId: mockUserId, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'A Category', type: 'INCOME', parentId: null, icon: null, color: null, userId: mockUserId, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      const result = await getAllCategories();

      expect(result.success).toBe(true);
      // INCOME should come before EXPENSE
      expect(result.data[0].name).toBe('A Category');
      expect(result.data[1].name).toBe('Z Category');
    });
  });

  describe('getCategoryById', () => {
    it('should return category when found', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Supermercado',
        type: 'EXPENSE',
        parentId: null,
        icon: 'shopping-cart',
        color: '#EF4444',
        userId: mockUserId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory);

      const result = await getCategoryById(mockCategoryId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
    });

    it('should return error when category not found', async () => {
      vi.mocked(prisma.category.findFirst).mockResolvedValue(null);

      const result = await getCategoryById(mockParentId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Categoria não encontrada');
    });

    it('should return error for invalid ID format', async () => {
      const result = await getCategoryById('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toContain('ID de categoria inválido');
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const existingCategory = {
        id: mockCategoryId,
        name: 'Supermercado',
        type: 'EXPENSE',
        parentId: null,
        userId: mockUserId,
      };

      const updatedCategory = {
        id: mockCategoryId,
        name: 'Mercado',
        type: 'EXPENSE',
      };

      vi.mocked(prisma.category.findFirst)
        .mockResolvedValueOnce(existingCategory) // Check existing
        .mockResolvedValueOnce(null); // No duplicate

      vi.mocked(prisma.category.update).mockResolvedValue(updatedCategory);

      const result = await updateCategory(mockCategoryId, { name: 'Mercado' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedCategory);
    });

    it('should reject duplicate name', async () => {
      const existingCategory = {
        id: mockCategoryId,
        name: 'Supermercado',
        type: 'EXPENSE',
        parentId: null,
        userId: mockUserId,
      };

      vi.mocked(prisma.category.findFirst)
        .mockResolvedValueOnce(existingCategory) // Check existing
        .mockResolvedValueOnce({ id: 'other-id' }); // Duplicate found

      const result = await updateCategory(mockCategoryId, { name: 'Outra Categoria' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Já existe uma categoria com este nome neste nível');
    });

    it('should reject circular reference', async () => {
      const existingCategory = {
        id: mockCategoryId,
        name: 'Parent',
        type: 'EXPENSE',
        parentId: null,
        userId: mockUserId,
      };

      const childCategory = {
        id: mockChildId,
        name: 'Child',
        type: 'EXPENSE',
        parentId: mockCategoryId,
        userId: mockUserId,
      };

      // Sequence of findFirst calls:
      // 1. Check existing category (line 74)
      // 2. Duplicate check (line 92) - should return null
      // 3. Parent exists check (line 121) - returns childCategory
      // 4. Circular check 1st iteration (line 28) - returns { parentId: mockCategoryId }
      // 5. Circular check 2nd iteration (line 28) - returns null (parent has no parent)
      vi.mocked(prisma.category.findFirst)
        .mockResolvedValueOnce(existingCategory)  // 1. Existing category
        .mockResolvedValueOnce(null)              // 2. Duplicate check
        .mockResolvedValueOnce(childCategory)     // 3. Parent exists
        .mockResolvedValueOnce({ parentId: mockCategoryId }) // 4. Child's parent
        .mockResolvedValueOnce(null);             // 5. Parent's parent (null)

      const result = await updateCategory(mockCategoryId, { parentId: mockChildId });

      expect(result.success).toBe(false);
      expect(result.error).toContain('referência circular');
    });

    it('should reject self-parenting', async () => {
      const existingCategory = {
        id: mockCategoryId,
        name: 'Category',
        type: 'EXPENSE',
        parentId: null,
        userId: mockUserId,
      };

      // First call: check existing category
      // Second call: duplicate check (should return null - no duplicate)
      // Third call: parent exists check (should return existingCategory as parent)
      vi.mocked(prisma.category.findFirst)
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingCategory);

      const result = await updateCategory(mockCategoryId, { parentId: mockCategoryId });

      expect(result.success).toBe(false);
      expect(result.error).toContain('não pode ser pai de si mesma');
    });
  });

  describe('deleteCategory', () => {
    it('should soft delete category successfully', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Category',
        children: [],
        transactions: [],
        plannedItems: [],
      };

      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory);
      vi.mocked(prisma.category.update).mockResolvedValue({});

      const result = await deleteCategory(mockCategoryId);

      expect(result.success).toBe(true);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
        data: { isActive: false },
      });
    });

    it('should reject deletion when category has children', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Category',
        children: [{ id: 'child-id' }],
        transactions: [],
        plannedItems: [],
      };

      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory);

      const result = await deleteCategory(mockCategoryId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('subcategorias');
    });

    it('should reject deletion when category has transactions', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Category',
        children: [],
        transactions: [{ id: 'txn-id' }],
        plannedItems: [],
      };

      vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory);

      const result = await deleteCategory(mockCategoryId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('transações associadas');
    });
  });
});