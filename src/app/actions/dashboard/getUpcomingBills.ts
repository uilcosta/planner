'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/supabase/server';
import type { ApiResponse, UpcomingBill } from '@/types';

/**
 * Server action to get upcoming bills (credit card due dates, pending transactions)
 * @returns ApiResponse with upcoming bills
 */
export async function getUpcomingBills(): Promise<ApiResponse<UpcomingBill[]>> {
  try {
    const userId = await getUserId();

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    // Get credit cards with due dates
    const creditCards = await prisma.account.findMany({
      where: {
        userId,
        type: 'CREDIT_CARD',
        isActive: true,
        dueDay: { not: null },
      },
      include: { institution: true },
    });

    // Get pending transactions for current and next month
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'PENDING',
        OR: [
          { month: currentMonth, year: currentYear },
          { month: nextMonth, year: nextMonthYear },
        ],
      },
      include: { category: true, account: { include: { institution: true } } },
      orderBy: { date: 'asc' },
      take: 20,
    });

    const bills: UpcomingBill[] = [];

    // Add credit card bills
    for (const card of creditCards) {
      const dueDay = card.dueDay!;
      const dueDate = new Date(currentYear, currentMonth - 1, dueDay);
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      bills.push({
        id: `card-${card.id}`,
        description: `Fatura ${card.institution.name} ${card.name}`,
        amount: Number(card.currentBalance),
        dueDate,
        accountName: `${card.institution.name} ${card.name}`,
        accountType: card.type,
        daysUntilDue,
      });
    }

    // Add pending transactions
    for (const tx of pendingTransactions) {
      const daysUntilDue = Math.ceil((tx.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      bills.push({
        id: tx.id,
        description: tx.description,
        amount: Number(tx.amount),
        dueDate: tx.date,
        accountName: tx.account?.name ?? 'Conta desconhecida',
        accountType: tx.account?.type ?? 'CASH',
        daysUntilDue,
      });
    }

    // Sort by due date
    bills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return {
      success: true,
      data: bills.slice(0, 10),
    };
  } catch (err) {
    console.error('Get upcoming bills error:', err);
    return {
      success: false,
      error: 'Erro ao buscar contas a vencer',
    };
  }
}