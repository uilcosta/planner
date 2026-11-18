'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, DollarSign, CreditCard, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { createTransactionSchema, type CreateTransactionInput } from '@/lib/validators';
import { getCategoriesFlat } from '@/app/actions/categories/getAll';
import { getAllAccounts } from '@/app/actions/accounts/getAll';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  initialData?: Partial<CreateTransactionInput> | null;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string; icon?: string | null; type: string }>;
  accounts?: Array<{ id: string; name: string; type: string; institution?: { name: string } | null }>;
}

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  categories = [],
  accounts = [],
}: TransactionFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      status: 'PENDING',
      isRecurring: false,
      ...initialData,
    },
  });

  const selectedType = watch('type');

  // Filter categories by type
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'EXPENSE',
        status: 'PENDING',
        isRecurring: false,
        ...initialData,
      });
      setFormError(null);
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: CreateTransactionInput) => {
    setFormError(null);
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar transação');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{initialData ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit(handleFormSubmit)} className="space-y-4">
            {formError && (
              <Alert variant="destructive" onClose={() => setFormError(null)} className="mb-2">
                {formError}
              </Alert>
            )}

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Ex: Salário, Supermercado, Aluguel"
                error={errors.description?.message}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    className="pl-9"
                    {...register('amount', { valueAsNumber: true })}
                    error={errors.amount?.message}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                  <option value="TRANSFER">Transferência</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="categoryId">Categoria *</Label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={filteredCategories.length === 0}
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
                {filteredCategories.length === 0 && (
                  <option value="" disabled>
                    Nenhuma categoria de {selectedType === 'INCOME' ? 'receita' : 'despesa'} cadastrada
                  </option>
                )}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-danger-500 mt-1">{errors.categoryId.message}</p>
              )}
              {filteredCategories.length === 0 && (
                <p className="text-sm text-warning-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Crie uma categoria de {selectedType === 'INCOME' ? 'receita' : 'despesa'} primeiro
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="accountId">Conta *</Label>
              <select
                id="accountId"
                {...register('accountId')}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma conta</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.institution?.name ? `${acc.institution.name} ` : ''}{acc.name} ({acc.type})
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="text-sm text-danger-500 mt-1">{errors.accountId.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="date">Data *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-9"
                    {...register('date', { valueAsDate: true })}
                    error={errors.date?.message}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PENDING">Pendente</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Observações opcionais..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Salvando...' : initialData ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* Mobile-optimized form */
export function TransactionFormMobile({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  categories = [],
  accounts = [],
}: TransactionFormProps) {
  return <TransactionForm {...arguments[0]} />;
}