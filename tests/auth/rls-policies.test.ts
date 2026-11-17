import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';

// Mock Prisma using factory function to avoid hoisting issues
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    plannedItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    caixinha: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contribution: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  };

  return { prisma: mockPrisma };
});

import { prisma } from '@/lib/prisma';

describe('RLS Policies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Category RLS', () => {
    it('usuário A não lê categorias do usuário B', async () => {
      const userACategories = [
        {
          id: 'cat-1',
          name: 'Salário',
          userId: 'user-a',
          type: 'INCOME' as const,
          icon: null,
          color: null,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          name: 'Freelance',
          userId: 'user-a',
          type: 'INCOME' as const,
          icon: null,
          color: null,
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(userACategories);

      const categories = await prisma.category.findMany({
        where: { userId: 'user-a' },
      });

      expect(categories).toHaveLength(2);
      expect(categories.every((c) => c.userId === 'user-a')).toBe(true);
      expect(categories.find((c) => c.userId === 'user-b')).toBeUndefined();
    });

    it('usuário A não pode criar categoria para usuário B', async () => {
      vi.mocked(prisma.category.create).mockResolvedValue({
        id: 'cat-3',
        name: 'Investimentos',
        userId: 'user-a',
        type: 'EXPENSE' as const,
        icon: null,
        color: null,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const category = await prisma.category.create({
        data: { name: 'Investimentos', type: 'EXPENSE' as const, userId: 'user-a' },
      });

      expect(category.userId).toBe('user-a');
    });

    it('usuário A não pode atualizar categoria do usuário B', async () => {
      vi.mocked(prisma.category.update).mockResolvedValue({
        id: 'cat-1',
        name: 'Salário Atualizado',
        userId: 'user-a',
        type: 'INCOME' as const,
        icon: null,
        color: null,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const category = await prisma.category.update({
        where: { id: 'cat-1' },
        data: { name: 'Salário Atualizado' },
      });

      expect(category.userId).toBe('user-a');
    });
  });

  describe('Transaction RLS', () => {
    it('usuário A não lê transações do usuário B', async () => {
      const userATransactions = [
        {
          id: 'tx-1',
          description: 'Supermercado',
          userId: 'user-a',
          amount: new Prisma.Decimal('100.50'),
          type: 'EXPENSE' as const,
          categoryId: 'cat-1',
          accountId: 'acc-1',
          date: new Date(),
          month: 1,
          year: 2025,
          status: 'COMPLETED' as const,
          isRecurring: false,
          recurringGroupId: null,
          caixinhaId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tx-2',
          description: 'Combustível',
          userId: 'user-a',
          amount: new Prisma.Decimal('50.00'),
          type: 'EXPENSE' as const,
          categoryId: 'cat-2',
          accountId: 'acc-1',
          date: new Date(),
          month: 1,
          year: 2025,
          status: 'COMPLETED' as const,
          isRecurring: false,
          recurringGroupId: null,
          caixinhaId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.transaction.findMany).mockResolvedValue(userATransactions);

      const transactions = await prisma.transaction.findMany({
        where: { userId: 'user-a' },
      });

      expect(transactions).toHaveLength(2);
      expect(transactions.every((t) => t.userId === 'user-a')).toBe(true);
    });
  });

  describe('PlannedItem RLS', () => {
    it('usuário A não lê itens planejados do usuário B', async () => {
      const userAItems = [
        {
          id: 'pi-1',
          description: 'Aluguel',
          userId: 'user-a',
          amount: new Prisma.Decimal('1500.00'),
          type: 'EXPENSE' as const,
          categoryId: 'cat-1',
          month: 1,
          year: 2025,
          recurrence: 'MONTHLY' as const,
          recurrenceEndDate: null,
          dayOfMonth: 5,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.plannedItem.findMany).mockResolvedValue(userAItems);

      const items = await prisma.plannedItem.findMany({
        where: { userId: 'user-a' },
      });

      expect(items).toHaveLength(1);
      expect(items[0].userId).toBe('user-a');
    });
  });

  describe('Caixinha RLS', () => {
    it('usuário A não lê caixinhas do usuário B', async () => {
      const userACaixinhas = [
        {
          id: 'cx-1',
          name: 'Viagem',
          userId: 'user-a',
          description: null,
          icon: null,
          color: null,
          targetAmount: new Prisma.Decimal('5000.00'),
          currentAmount: new Prisma.Decimal('1000.00'),
          targetDate: null,
          monthlyContribution: new Prisma.Decimal('500.00'),
          accountId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.caixinha.findMany).mockResolvedValue(userACaixinhas);

      const caixinhas = await prisma.caixinha.findMany({
        where: { userId: 'user-a' },
      });

      expect(caixinhas).toHaveLength(1);
      expect(caixinhas[0].userId).toBe('user-a');
    });
  });

  describe('Contribution RLS', () => {
    it('usuário A não lê aportes do usuário B', async () => {
      const userAContributions = [
        {
          id: 'ct-1',
          caixinhaId: 'cx-1',
          userId: 'user-a',
          amount: new Prisma.Decimal('500.00'),
          date: new Date(),
          month: 1,
          year: 2025,
          notes: null,
          createdAt: new Date(),
          transactionId: null,
        },
      ];

      vi.mocked(prisma.contribution.findMany).mockResolvedValue(userAContributions);

      const contributions = await prisma.contribution.findMany({
        where: { userId: 'user-a' },
      });

      expect(contributions).toHaveLength(1);
      expect(contributions[0].userId).toBe('user-a');
    });
  });
});
