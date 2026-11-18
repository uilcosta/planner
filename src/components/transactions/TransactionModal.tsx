'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { useHideValues } from '@/components/providers/HideValuesProvider';

interface Account {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
}

type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

interface TransactionFormData {
  type: TransactionType;
  amount: string;
  date: string;
  description: string;
  accountId: string;
  destinationAccountId: string;
  categoryId: string;
}

const today = new Date().toISOString().split('T')[0];

const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
  amount: z.string().min(1, 'Informe um valor').refine((val) => parseCurrency(val) > 0, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Informe uma data').refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
  description: z.string().optional(),
  accountId: z.string().min(1, 'Selecione uma conta'),
  destinationAccountId: z.string().optional(),
  categoryId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'TRANSFER') {
    return data.accountId !== data.destinationAccountId;
  }
  return true;
}, {
  message: 'Origem e destino devem ser diferentes',
  path: ['destinationAccountId'],
}).refine((data) => {
  if (data.type !== 'TRANSFER') {
    return data.categoryId.length > 0;
  }
  return true;
}, {
  message: 'Selecione uma categoria',
  path: ['categoryId'],
});

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<TransactionFormData> | null;
  isLoading?: boolean;
  title?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  categories,
  initialData,
  isLoading,
  title,
}: TransactionModalProps) {
  const { hidden } = useHideValues();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [showDestinationAccount, setShowDestinationAccount] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === 'INCOME' || c.type === 'EXPENSE');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const activeAccounts = accounts.filter((a) => a.type !== 'CREDIT_CARD' || true); // All active accounts

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      amount: '',
      date: today,
      description: '',
      accountId: '',
      destinationAccountId: '',
      categoryId: '',
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedType = watch('type');
  const watchedAccountId = watch('accountId');

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // Focus first input after render
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input, select, button') as HTMLElement;
        firstInput?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset form when opening/closing or type changes
  useEffect(() => {
    if (isOpen) {
      reset({
        type: initialData?.type ?? 'EXPENSE',
        amount: initialData?.amount ?? '',
        date: initialData?.date ?? today,
        description: initialData?.description ?? '',
        accountId: initialData?.accountId ?? '',
        destinationAccountId: initialData?.destinationAccountId ?? '',
        categoryId: initialData?.categoryId ?? '',
      });
      setShowDestinationAccount(initialData?.type === 'TRANSFER');
    }
  }, [isOpen, initialData, reset]);

  // Handle type change
  useEffect(() => {
    setShowDestinationAccount(watchedType === 'TRANSFER');
    if (watchedType === 'TRANSFER') {
      setValue('categoryId', '');
    } else {
      setValue('destinationAccountId', '');
    }
    // Clear category when type changes between INCOME/EXPENSE
    setValue('categoryId', '');
  }, [watchedType, setValue]);

  const handleClose = () => {
    if (isSubmitting) return;
    // Check if form is dirty
    const isDirty = watch('amount') || watch('description') || watch('accountId') || watch('categoryId') || watch('destinationAccountId');
    if (isDirty && !initialData) {
      if (confirm('Descartar alterações?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const formatAmountInput = (value: string) => {
    // Allow only numbers, comma, and dot
    const cleaned = value.replace(/[^0-9.,]/g, '');
    // Replace comma with dot for parsing
    return cleaned.replace(',', '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountInput(e.target.value);
    e.target.value = formatted;
    register('amount').onChange({ target: { value: formatted } } as any);
  };

  if (!isOpen) return null;

  const categoriesForType = watchedType === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-overlay-bg backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Mobile: fullscreen sheet */}
      <div
        ref={modalRef}
        className={cn(
          'bg-surface border border-modal-border rounded-2xl shadow-xl max-h-[90vh] w-full max-w-lg',
          'md:max-w-lg'
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface/95 backdrop-blur z-10 rounded-t-2xl">
          <h2 id="modal-title" className="text-lg font-semibold text-text">
            {title ?? (initialData ? 'Editar lançamento' : 'Novo lançamento')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-background transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Type Selector */}
          <fieldset>
            <legend className="text-sm font-medium text-text-muted mb-3">Tipo</legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Tipo de lançamento">
              {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('type', type)}
                  className={cn(
                    'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border-2',
                    watchedType === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-muted hover:border-control-border hover:text-text'
                  )}
                  aria-pressed={watchedType === type}
                  role="radio"
                >
                  {type === 'EXPENSE' && 'Despesa'}
                  {type === 'INCOME' && 'Receita'}
                  {type === 'TRANSFER' && 'Transferência'}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text mb-1">
              Valor <span className="text-negative" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">R$</span>
              <input
                {...register('amount')}
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                className={cn(
                  'input-modern pl-8 pr-3',
                  errors.amount && 'border-negative focus:border-negative focus:ring-negative/20'
                )}
                onChange={handleAmountChange}
                value={watch('amount')}
                disabled={isLoading || isSubmitting}
                autoComplete="off"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="mt-1.5 text-sm text-negative" role="alert">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-text mb-1">
              Data <span className="text-negative" aria-hidden="true">*</span>
            </label>
            <input
              {...register('date')}
              id="date"
              type="date"
              className={cn(
                'input-modern',
                errors.date && 'border-negative focus:border-negative focus:ring-negative/20'
              )}
              max={today}
              disabled={isLoading || isSubmitting}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date && (
              <p id="date-error" className="mt-1.5 text-sm text-negative" role="alert">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text mb-1">
              Descrição (opcional)
            </label>
            <input
              {...register('description')}
              id="description"
              type="text"
              placeholder="Ex: Supermercado, Salário, Transferência..."
              className="input-modern"
              disabled={isLoading || isSubmitting}
            />
          </div>

          {/* Account / Source Account */}
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-text mb-1">
              {watchedType === 'TRANSFER' ? 'Conta de origem' : 'Conta'} <span className="text-negative" aria-hidden="true">*</span>
            </label>
            <select
              {...register('accountId')}
              id="accountId"
              className={cn(
                'input-modern appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2364748B%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E")] bg-right-3 bg-no-repeat pr-10',
                errors.accountId && 'border-negative focus:border-negative focus:ring-negative/20'
              )}
              disabled={isLoading || isSubmitting}
              aria-invalid={!!errors.accountId}
              aria-describedby={errors.accountId ? 'account-error' : undefined}
            >
              <option value="">Selecione uma conta</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type}) — {hidden ? '••••••' : formatCurrency(acc.currentBalance)}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p id="account-error" className="mt-1.5 text-sm text-negative" role="alert">
                {errors.accountId.message}
              </p>
            )}
          </div>

          {/* Destination Account (Transfer only) */}
          {showDestinationAccount && (
            <div>
              <label htmlFor="destinationAccountId" className="block text-sm font-medium text-text mb-1">
                Conta de destino <span className="text-negative" aria-hidden="true">*</span>
              </label>
              <select
                {...register('destinationAccountId')}
                id="destinationAccountId"
                className={cn(
                  'input-modern appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2364748B%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E")] bg-right-3 bg-no-repeat pr-10',
                  errors.destinationAccountId && 'border-negative focus:border-negative focus:ring-negative/20'
                )}
                disabled={isLoading || isSubmitting}
                aria-invalid={!!errors.destinationAccountId}
                aria-describedby={errors.destinationAccountId ? 'dest-account-error' : undefined}
              >
                <option value="">Selecione a conta de destino</option>
                {activeAccounts
                  .filter((acc) => acc.id !== watchedAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type}) — {hidden ? '••••••' : formatCurrency(acc.currentBalance)}
                    </option>
                  ))}
              </select>
              {errors.destinationAccountId && (
                <p id="dest-account-error" className="mt-1.5 text-sm text-negative" role="alert">
                  {errors.destinationAccountId.message}
                </p>
              )}
            </div>
          )}

          {/* Category (not for Transfer) */}
          {!showDestinationAccount && (
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-text mb-1">
                Categoria <span className="text-negative" aria-hidden="true">*</span>
              </label>
              <select
                {...register('categoryId')}
                id="categoryId"
                className={cn(
                  'input-modern appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2364748B%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E")] bg-right-3 bg-no-repeat pr-10',
                  errors.categoryId && 'border-negative focus:border-negative focus:ring-negative/20'
                )}
                disabled={isLoading || isSubmitting}
                aria-invalid={!!errors.categoryId}
                aria-describedby={errors.categoryId ? 'category-error' : undefined}
              >
                <option value="">Selecione uma categoria</option>
                {categoriesForType.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p id="category-error" className="mt-1.5 text-sm text-negative" role="alert">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isLoading || isSubmitting}
            >
              {initialData ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}