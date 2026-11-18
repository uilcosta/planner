'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import { getAllCategories } from '@/app/actions/categories/getAll';
import { getAllAccounts } from '@/app/actions/accounts/getAll';
import type { ApiResponse, TransactionWithRelations, TransactionFilters } from '@/types';

/**
 * Server action to get transactions for a month with filters
 * Includes variance comparison with planned items
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2026)
 * @param filters - Optional filters
 * @returns ApiResponse with transactions and variance data
 */
export async function getTransactions(
  month: number,
  year: number,
  filters?: TransactionFilters
): Promise<ApiResponse<TransactionWithRelations[]>> {
  try {
    const userId = await getUserId();

    // Validate month/year
    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido' };
    }
    if (year < 2025 || year > 2030) {
      return { success: false, error: 'Ano inválido' };
    }

    const where: Record<string, unknown> = {
      userId,
      month,
      year,
    };

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.accountId) where.accountId = filters.accountId;
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.search) {
      where.description = { contains: filters.search, mode: 'insensitive' };
    }

    const [transactions, plannedItems, categories, accounts] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, account: { include: { institution: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.plannedItem.findMany({
        where: { userId, month, year, isActive: true },
        include: { category: true },
      }),
      getAllCategories(),
      getAllAccounts(),
    ]);

    // Calculate planned amounts by category
    const plannedByCategory = new Map<string, { income: number; expense: number }>();
    for (const item of plannedItems.data ?? []) {
      const key = item.categoryId;
      const existing = plannedByCategory.get(key) || { income: 0, expense: 0 };
      if (item.type === 'INCOME') existing.income += Number(item.amount);
      else existing.expense += Number(item.amount);
      plannedByCategory.set(key, existing);
    }

    // Calculate actual amounts by category
    const actualByCategory = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      if (tx.status === 'CANCELLED') continue;
      const key = tx.categoryId;
      const existing = actualByCategory.get(key) || { income: 0, expense: 0 };
      if (tx.type === 'INCOME') existing.income += Number(tx.amount);
      else existing.expense += Number(tx.amount);
      actualByCategory.set(key, existing);
    }

    // Add variance data to transactions
    const transactionsWithVariance = transactions.map((tx) => {
      const planned = plannedByCategory.get(tx.categoryId) || { income: 0, expense: 0 };
      const actual = actualByCategory.get(tx.categoryId) || { income: 0, expense: 0 };
      const plannedAmount = tx.type === 'INCOME' ? planned.income : planned.expense;
      const actualAmount = tx.type === 'INCOME' ? actual.income : actual.expense;
      const variance = actualAmount - plannedAmount;
      const variancePercentage = plannedAmount === 0 ? (actualAmount > 0 ? 100 : 0) : (variance / Math.abs(plannedAmount)) * 100;

      return {
        ...tx,
        amount: Number(tx.amount),
        variance,
        variancePercentage,
        category: tx.category,
        account: tx.account,
      };
    });

    return {
      success: true,
      data: transactionsWithVariance as TransactionWithRelations[],
    };
  } catch (err) {
    console.error('Get transactions error:', err);
    return {
      success: false,
      error: 'Erro ao buscar transações',
    };
  }
}