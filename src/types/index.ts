/**
 * Type definitions for the Financial Planner application
 * Re-exports Prisma types and defines custom application types
 */

import type {
  User,
  Category,
  Institution,
  Account,
  PlannedItem,
  Transaction,
  Caixinha,
  Contribution,
  CategoryType,
  InstitutionType,
  AccountType,
  TransactionType,
  TransactionStatus,
  RecurrenceType,
} from '@prisma/client';

// Re-export Prisma enums
export type {
  CategoryType,
  InstitutionType,
  AccountType,
  TransactionType,
  TransactionStatus,
  RecurrenceType,
};

// Re-export Prisma models
export type {
  User,
  Category,
  Institution,
  Account,
  PlannedItem,
  Transaction,
  Caixinha,
  Contribution,
};

/**
 * Extended types with computed fields
 */
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export interface PlannedItemWithCategory extends PlannedItem {
  category: Category;
}

export interface TransactionWithRelations extends Transaction {
  category: Category;
  account: Account;
  caixinha?: Caixinha | null;
}

export interface CaixinhaWithProgress extends Caixinha {
  progress: number; // 0-100
  contributions: Contribution[];
  account?: Account | null;
}

export interface AccountWithInstitution extends Account {
  institution: Institution;
}

/**
 * Dashboard types
 */
export interface DashboardSummary {
  plannedIncome: number;
  actualIncome: number;
  plannedExpense: number;
  actualExpense: number;
  balance: number;
  variancePercentage: number;
}

export interface MonthlyComparison {
  month: number;
  year: number;
  plannedIncome: number;
  actualIncome: number;
  plannedExpense: number;
  actualExpense: number;
  categories: CategoryComparison[];
}

export interface CategoryComparison {
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

export interface UpcomingBill {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  accountName: string;
  accountType: AccountType;
  daysUntilDue: number;
}

/**
 * Form types
 */
export interface MonthYearSelection {
  month: number;
  year: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Chart data types
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ComparisonChartData {
  categories: string[];
  planned: number[];
  actual: number[];
}

/**
 * PWA types
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Utility types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
