import { z } from 'zod';
import { getDaysInMonth, adjustDayOfMonth } from './utils';

/**
 * Base schemas for common fields
 */
const currencySchema = z
  .union([z.string(), z.number()])
  .transform((val) =>
    typeof val === 'string' ? parseFloat(val.replace(/[^\d,-]/g, '').replace(',', '.')) : val
  )
  .refine((val) => !isNaN(val) && val >= 0, { message: 'Valor deve ser um número positivo' });

const monthSchema = z.number().int().min(1).max(12, { message: 'Mês deve estar entre 1 e 12' });
const yearSchema = z
  .number()
  .int()
  .min(2025)
  .max(2030, { message: 'Ano deve estar entre 2025 e 2030' });
const dayOfMonthSchema = z.number().int().min(1).max(31).nullable().optional();

/**
 * Category schemas
 */
const categoryBaseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido')
    .optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  parentId: z.string().cuid().nullable().optional(),
});

export const createCategorySchema = categoryBaseSchema;
export const updateCategorySchema = categoryBaseSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/**
 * Institution schemas
 */
const institutionBaseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.enum(['BANK', 'CREDIT_CARD', 'INVESTMENT', 'OTHER']),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido')
    .optional(),
  logoUrl: z
    .string()
    .regex(/^https?:\/\/.+/, 'URL do logo deve usar protocolo http ou https')
    .or(z.literal(''))
    .nullable()
    .optional(),
});

export const createInstitutionSchema = institutionBaseSchema;
export const updateInstitutionSchema = institutionBaseSchema.partial();

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;

/**
 * Account schemas
 */
const accountBaseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH']),
  institutionId: z.string().cuid('Instituição inválida'),
  initialBalance: currencySchema.default(0),
  creditLimit: currencySchema.nullable().optional(),
  closingDay: z.number().int().min(1).max(31).nullable().optional(),
  dueDay: z.number().int().min(1).max(31).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const createAccountSchema = accountBaseSchema
  .refine((data) => {
    if (data.type === 'CREDIT_CARD') {
      if (data.creditLimit !== undefined && data.creditLimit !== null && data.creditLimit <= 0) {
        return false;
      }
      if (data.closingDay !== undefined && data.closingDay !== null && (data.closingDay < 1 || data.closingDay > 31)) {
        return false;
      }
      if (data.dueDay !== undefined && data.dueDay !== null && (data.dueDay < 1 || data.dueDay > 31)) {
        return false;
      }
    }
    return true;
  }, {
    message: 'Para cartões de crédito: limite deve ser > 0, dia de fechamento e vencimento entre 1-31',
    path: ['creditLimit'],
  });

export const updateAccountSchema = accountBaseSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

/**
 * PlannedItem schemas
 */
const basePlannedItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  amount: currencySchema,
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().cuid('Categoria inválida'),
  month: monthSchema,
  year: yearSchema,
  recurrence: z.enum(['ONE_TIME', 'MONTHLY', 'YEARLY', 'CUSTOM']).default('ONE_TIME'),
  recurrenceEndDate: z.coerce.date().nullable().optional(),
  dayOfMonth: dayOfMonthSchema,
  isActive: z.boolean().default(true),
});

const plannedItemCreateSchema = basePlannedItemSchema
  .refine((data) => {
    if (data.recurrence !== 'ONE_TIME' && !data.dayOfMonth) {
      return false;
    }
    return true;
  }, {
    message: 'Dia do mês é obrigatório para itens recorrentes',
    path: ['dayOfMonth'],
  })
  .refine((data) => {
    if (data.recurrence === 'CUSTOM' && !data.recurrenceEndDate) {
      return false;
    }
    return true;
  }, {
    message: 'Data de fim da recorrência é obrigatória para recorrência personalizada',
    path: ['recurrenceEndDate'],
  });

const plannedItemUpdateSchema = basePlannedItemSchema.partial()
  .refine((data) => {
    if (data.recurrence && data.recurrence !== 'ONE_TIME' && !data.dayOfMonth) {
      return false;
    }
    return true;
  }, {
    message: 'Dia do mês é obrigatório para itens recorrentes',
    path: ['dayOfMonth'],
  })
  .refine((data) => {
    if (data.recurrence === 'CUSTOM' && !data.recurrenceEndDate) {
      return false;
    }
    return true;
  }, {
    message: 'Data de fim da recorrência é obrigatória para recorrência personalizada',
    path: ['recurrenceEndDate'],
  });

export const createPlannedItemSchema = plannedItemCreateSchema;
export const updatePlannedItemSchema = plannedItemUpdateSchema;

export type CreatePlannedItemInput = z.infer<typeof createPlannedItemSchema>;
export type UpdatePlannedItemInput = z.infer<typeof updatePlannedItemSchema>;

/**
 * Transaction schemas
 */
const transactionBaseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  amount: currencySchema,
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().cuid('Categoria inválida'),
  accountId: z.string().cuid('Conta inválida'),
  date: z.coerce.date(),
  month: monthSchema,
  year: yearSchema,
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  isRecurring: z.boolean().default(false),
  recurringGroupId: z.string().cuid().nullable().optional(),
  caixinhaId: z.string().cuid().nullable().optional(),
  notes: z.string().max(500).optional(),
});

export const createTransactionSchema = transactionBaseSchema;
export const updateTransactionSchema = transactionBaseSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

/**
 * Caixinha schemas
 */
const caixinhaBaseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um hex válido')
    .optional(),
  targetAmount: currencySchema,
  targetDate: z.coerce.date().nullable().optional(),
  monthlyContribution: currencySchema.default(0),
  accountId: z.string().cuid().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const createCaixinhaSchema = caixinhaBaseSchema;
export const updateCaixinhaSchema = caixinhaBaseSchema.partial();

export type CreateCaixinhaInput = z.infer<typeof createCaixinhaSchema>;
export type UpdateCaixinhaInput = z.infer<typeof updateCaixinhaSchema>;

/**
 * Contribution schemas
 */
export const createContributionSchema = z.object({
  caixinhaId: z.string().cuid('Caixinha inválida'),
  amount: currencySchema,
  date: z.coerce.date(),
  month: monthSchema,
  year: yearSchema,
  notes: z.string().max(500).optional(),
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>;

/**
 * Month/Year navigation schema
 */
export const monthYearSchema = z.object({
  month: monthSchema,
  year: yearSchema,
});

export type MonthYearInput = z.infer<typeof monthYearSchema>;

/**
 * Auth schemas
 */
export const signUpSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Validation helper functions
 */

export function validateAndAdjustDayOfMonth(
  dayOfMonth: number | null | undefined,
  year: number,
  month: number
): { adjustedDay: number | null; wasAdjusted: boolean; maxDay: number } {
  if (!dayOfMonth) return { adjustedDay: null, wasAdjusted: false, maxDay: getDaysInMonth(year, month) };

  const maxDay = getDaysInMonth(year, month);
  const adjustedDay = adjustDayOfMonth(dayOfMonth, year, month);
  return {
    adjustedDay,
    wasAdjusted: adjustedDay !== dayOfMonth,
    maxDay,
  };
}

export function generateDayOfMonthPreview(
  dayOfMonth: number,
  year: number
): Array<{ month: number; monthName: string; adjustedDay: number; wasAdjusted: boolean }> {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const maxDay = getDaysInMonth(year, month);
    const adjustedDay = adjustDayOfMonth(dayOfMonth, year, month);
    return {
      month,
      monthName: months[i],
      adjustedDay,
      wasAdjusted: adjustedDay !== dayOfMonth,
    };
  });
}