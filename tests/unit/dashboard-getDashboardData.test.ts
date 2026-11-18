import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    plannedItem: {
      findMany: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
    account: {
      findMany: vi.fn(),
    },
    caixinha: {
      findMany: vi.fn(),
    },
  },
}));

// Mock Supabase server
vi.mock('@/lib/supabase/server', () => ({
  getUserId: vi.fn(() => Promise.resolve('test-user-id')),
}));

import { getDashboardData } from '@/app/actions/dashboard/getDashboardData';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';

describe('getDashboardData', () => {
  const mockUserId = 'test-user-id';
  const testMonth = 6;
  const testYear = 2026;
  const prevMonth = 5;
  const prevYear = 2026;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue(mockUserId);
    vi.mocked(prisma.plannedItem.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findMany).mockResolvedValue([]);
    vi.mocked(prisma.caixinha.findMany).mockResolvedValue([]);
  });

  it('should return error for invalid month', async () => {
    const result = await getDashboardData(0, testYear);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Mês inválido');
  });

  it('should return error for month > 12', async () => {
    const result = await getDashboardData(13, testYear);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Mês inválido');
  });

  it('should return error for invalid year', async () => {
    const result = await getDashboardData(testMonth, 2020);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Ano inválido');
  });

  it('should return error for year > 2030', async () => {
    const result = await getDashboardData(testMonth, 2031);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Ano inválido');
  });

  it('should return empty dashboard data when no data exists', async () => {
    const result = await getDashboardData(testMonth, testYear);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.kpis).toEqual({
      available: 0,
      inCaixinhas: 0,
      monthIncome: 0,
      monthExpense: 0,
      prevMonthIncome: 0,
      prevMonthExpense: 0,
      hasComparison: false,
    });
    // Cash flow returns weeks for the month even with no transactions
    expect(result.data?.cashFlow).toHaveLength(5); // June has 5 weeks
    expect(result.data?.cashFlow.every((w) => w.income === 0 && w.expense === 0)).toBe(true);
    expect(result.data?.budget).toEqual({
      budget: 0,
      spent: 0,
      status: 'none',
      topCategories: [],
    });
    expect(result.data?.recentTransactions).toEqual([]);
  });

  it('should calculate KPIs correctly with income and expense', async () => {
    vi.mocked(prisma.plannedItem.findMany)
      .mockResolvedValueOnce([
        { id: '1', amount: '5000', type: 'INCOME', month: testMonth, year: testYear, userId: mockUserId, isActive: true, description: 'Salário', categoryId: 'cat1', recurrence: 'ONE_TIME', dayOfMonth: null, recurrenceEndDate: null, createdAt: new Date(), updatedAt: new Date() } as any,
        { id: '2', amount: '3000', type: 'EXPENSE', month: testMonth, year: testYear, userId: mockUserId, isActive: true, description: 'Aluguel', categoryId: 'cat2', recurrence: 'ONE_TIME', dayOfMonth: null, recurrenceEndDate: null, createdAt: new Date(), updatedAt: new Date() } as any,
      ])
      .mockResolvedValueOnce([]); // prev month planned items

    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([
        { id: 't1', amount: '5000', type: 'INCOME', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: new Date(), description: 'Salário', categoryId: 'cat1', accountId: 'acc1', category: { name: 'Trabalho', icon: null, color: null }, account: { name: 'Nubank' } } as any,
        { id: 't2', amount: '2500', type: 'EXPENSE', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: new Date(), description: 'Supermercado', categoryId: 'cat2', accountId: 'acc1', category: { name: 'Alimentação', icon: null, color: '#EF4444' }, account: { name: 'Nubank' } } as any,
      ])
      .mockResolvedValueOnce([
        { id: 't3', amount: '4500', type: 'INCOME', month: prevMonth, year: prevYear, userId: mockUserId, status: 'COMPLETED', date: new Date(), description: 'Salário anterior', categoryId: 'cat1', accountId: 'acc1', category: null, account: null } as any,
        { id: 't4', amount: '3000', type: 'EXPENSE', month: prevMonth, year: prevYear, userId: mockUserId, status: 'COMPLETED', date: new Date(), description: 'Aluguel anterior', categoryId: 'cat2', accountId: 'acc1', category: null, account: null } as any,
      ]);

    vi.mocked(prisma.account.findMany).mockResolvedValue([
      { id: 'acc1', name: 'Nubank', currentBalance: '8000', type: 'CHECKING', userId: mockUserId, isActive: true, institutionId: 'inst1', initialBalance: '0', creditLimit: null, closingDay: null, dueDay: null, createdAt: new Date(), updatedAt: new Date() } as any,
    ]);

    vi.mocked(prisma.caixinha.findMany).mockResolvedValue([
      { id: 'cx1', name: 'Reserva', currentAmount: '2000', targetAmount: '10000', userId: mockUserId, isActive: true, icon: null, color: null, description: null, targetDate: null, monthlyContribution: '0', accountId: null, createdAt: new Date(), updatedAt: new Date() } as any,
    ]);

    const result = await getDashboardData(testMonth, testYear);

    expect(result.success).toBe(true);
    expect(result.data?.kpis).toEqual({
      available: 6000, // 8000 - 2000
      inCaixinhas: 2000,
      monthIncome: 5000,
      monthExpense: 2500,
      prevMonthIncome: 4500,
      prevMonthExpense: 3000,
      hasComparison: true,
    });
  });

  it('should calculate weekly cash flow correctly', async () => {
    const testDate = new Date(testYear, testMonth - 1, 5); // June 5
    const testDate2 = new Date(testYear, testMonth - 1, 15); // June 15

    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([
        { id: 't1', amount: '1000', type: 'INCOME', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: testDate, description: 'Freelance', categoryId: 'cat1', accountId: 'acc1', category: { name: 'Projetos', icon: null, color: null }, account: { name: 'Nubank' } } as any,
        { id: 't2', amount: '500', type: 'EXPENSE', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: testDate2, description: 'Contas', categoryId: 'cat2', accountId: 'acc1', category: { name: 'Moradia', icon: null, color: '#8B5CF6' }, account: { name: 'Nubank' } } as any,
      ])
      .mockResolvedValueOnce([]); // prev month

    vi.mocked(prisma.plannedItem.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findMany).mockResolvedValue([]);
    vi.mocked(prisma.caixinha.findMany).mockResolvedValue([]);

    const result = await getDashboardData(testMonth, testYear);

    expect(result.success).toBe(true);
    expect(result.data?.cashFlow.length).toBeGreaterThan(0);
    // Week 1 (1-7) should have the income
    const week1 = result.data?.cashFlow.find((w) => w.week === 1);
    expect(week1?.income).toBe(1000);
    // Week 3 (15-21) should have the expense
    const week3 = result.data?.cashFlow.find((w) => w.week === 3);
    expect(week3?.expense).toBe(500);
  });

  it('should calculate budget status correctly', async () => {
    vi.mocked(prisma.plannedItem.findMany)
      .mockResolvedValueOnce([
        { id: '1', amount: '4000', type: 'EXPENSE', month: testMonth, year: testYear, userId: mockUserId, isActive: true, description: 'Planejado', categoryId: 'cat1', recurrence: 'ONE_TIME', dayOfMonth: null, recurrenceEndDate: null, createdAt: new Date(), updatedAt: new Date() } as any,
      ])
      .mockResolvedValueOnce([]);

    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([
        { id: 't1', amount: '3000', type: 'EXPENSE', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: new Date(), description: 'Real', categoryId: 'cat1', accountId: 'acc1', category: { name: 'Alimentação', icon: null, color: '#EF4444' }, account: { name: 'Nubank' } } as any,
      ])
      .mockResolvedValueOnce([]);

    vi.mocked(prisma.account.findMany).mockResolvedValue([]);
    vi.mocked(prisma.caixinha.findMany).mockResolvedValue([]);

    const result = await getDashboardData(testMonth, testYear);

    expect(result.success).toBe(true);
    expect(result.data?.budget.budget).toBe(4000);
    expect(result.data?.budget.spent).toBe(3000);
    expect(result.data?.budget.status).toBe('warning'); // 75% = warning
    expect(result.data?.budget.topCategories).toHaveLength(1);
    expect(result.data?.budget.topCategories[0].name).toBe('Alimentação');
  });

  it('should return recent transactions with relations', async () => {
    const testDate = new Date();
    vi.mocked(prisma.transaction.findMany)
      .mockResolvedValueOnce([
        { id: 't1', amount: '5000', type: 'INCOME', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: testDate, description: 'Salário', categoryId: 'cat1', accountId: 'acc1', category: { name: 'Trabalho', icon: 'briefcase', color: '#22C55E' }, account: { name: 'Nubank' } } as any,
        { id: 't2', amount: '350', type: 'EXPENSE', month: testMonth, year: testYear, userId: mockUserId, status: 'COMPLETED', date: new Date(testDate.getTime() - 86400000), description: 'Supermercado', categoryId: 'cat2', accountId: 'acc1', category: { name: 'Alimentação', icon: 'shopping-cart', color: '#EF4444' }, account: { name: 'Inter' } } as any,
      ])
      .mockResolvedValueOnce([]);

    vi.mocked(prisma.plannedItem.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findMany).mockResolvedValue([]);
    vi.mocked(prisma.caixinha.findMany).mockResolvedValue([]);

    const result = await getDashboardData(testMonth, testYear);

    expect(result.success).toBe(true);
    expect(result.data?.recentTransactions).toHaveLength(2);
    expect(result.data?.recentTransactions[0]).toEqual({
      id: 't1',
      description: 'Salário',
      amount: 5000,
      type: 'INCOME',
      category: { name: 'Trabalho', icon: 'briefcase' },
      account: { name: 'Nubank' },
      date: testDate,
      status: 'COMPLETED',
    });
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(prisma.plannedItem.findMany).mockRejectedValue(new Error('Database error'));

    const result = await getDashboardData(testMonth, testYear);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao buscar dados do dashboard');
  });
});