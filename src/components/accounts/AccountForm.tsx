'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccountSchema, type CreateAccountInput, updateAccountSchema, type UpdateAccountInput } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { X, Building, CreditCard, TrendingUp, Wallet, Landmark, PiggyBank } from 'lucide-react';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountInput | UpdateAccountInput) => Promise<void>;
  initialData?: {
    id: string;
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH';
    institutionId: string;
    initialBalance: number;
    creditLimit: number | null;
    closingDay: number | null;
    dueDay: number | null;
    isActive: boolean;
  } | null;
  institutions: Array<{ id: string; name: string; type: string; color: string | null; logoUrl: string | null }>;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão de Crédito',
  INVESTMENT: 'Investimento',
  CASH: 'Dinheiro',
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CHECKING: Landmark,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
  CASH: Wallet,
};

const TYPE_COLORS: Record<string, string> = {
  CHECKING: 'bg-blue-100 text-blue-800',
  SAVINGS: 'bg-green-100 text-green-800',
  CREDIT_CARD: 'bg-purple-100 text-purple-800',
  INVESTMENT: 'bg-amber-100 text-amber-800',
  CASH: 'bg-gray-100 text-gray-800',
};

export function AccountForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  institutions,
  isLoading = false,
}: AccountFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateAccountSchema : createAccountSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateAccountInput | UpdateAccountInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      type: 'CHECKING' as const,
      institutionId: '',
      initialBalance: 0,
      creditLimit: null,
      closingDay: null,
      dueDay: null,
      isActive: true,
    },
  });

  const selectedType = watch('type') ?? 'CHECKING';
  const selectedInstitutionId = watch('institutionId') ?? '';
  const selectedInstitution = institutions.find(inst => inst.id === selectedInstitutionId);

  // Reset form when opening/closing or when initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          type: initialData.type,
          institutionId: initialData.institutionId,
          initialBalance: initialData.initialBalance,
          creditLimit: initialData.creditLimit,
          closingDay: initialData.closingDay,
          dueDay: initialData.dueDay,
          isActive: initialData.isActive,
        });
      } else {
        reset({
          name: '',
          type: 'CHECKING',
          institutionId: institutions[0]?.id ?? '',
          initialBalance: 0,
          creditLimit: null,
          closingDay: null,
          dueDay: null,
          isActive: true,
        });
      }
    }
  }, [isOpen, initialData, institutions, reset]);

  const getErrorMessage = (field: keyof CreateAccountInput) => {
    const fieldErrors = errors[field];
    if (fieldErrors && typeof fieldErrors === 'object' && 'message' in fieldErrors) {
      return (fieldErrors as { message: string }).message;
    }
    return undefined;
  };

  const hasError = (field: keyof CreateAccountInput) => {
    return !!errors[field];
  };

  const handleFormSubmit = async (data: CreateAccountInput | UpdateAccountInput) => {
    await onSubmit(data);
  };

  if (!isOpen) return null;

  const TypeIcon = TYPE_ICONS[selectedType] || Landmark;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="account-form-title">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 id="account-form-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fechar formulário"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4" noValidate>
          {/* Name */}
          <div>
            <Label htmlFor="name" required>
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Conta Corrente Nubank"
              {...register('name')}
              className={cn(hasError('name') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
              disabled={isLoading}
              autoFocus
            />
            {getErrorMessage('name') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('name')}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type" required>
              Tipo
            </Label>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de conta">
              {(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH'] as const).map((type) => {
                const Icon = TYPE_ICONS[type];
                return (
                  <label
                    key={type}
                    className={cn(
                      'flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border-2 transition-all cursor-pointer',
                      selectedType === type
                        ? `${TYPE_COLORS[type]} border-transparent`
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register('type')}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <Icon className={cn('h-4 w-4', selectedType === type ? 'text-current' : 'text-gray-400')} aria-hidden="true" />
                    <span className="text-xs font-medium">{TYPE_LABELS[type]}</span>
                  </label>
                );
              })}
            </div>
            {getErrorMessage('type') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('type')}</p>
            )}
          </div>

          {/* Institution */}
          <div>
            <Label htmlFor="institutionId" required>
              Instituição
            </Label>
            <select
              id="institutionId"
              {...register('institutionId')}
              className={cn(
                'w-full h-10 rounded-lg border px-3 py-2 bg-white',
                'focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                hasError('institutionId') && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
            >
              <option value="">Selecione uma instituição</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.type === 'BANK' ? 'Banco' : inst.type === 'CREDIT_CARD' ? 'Cartão' : inst.type === 'INVESTMENT' ? 'Investimento' : 'Outro'})
                </option>
              ))}
            </select>
            {getErrorMessage('institutionId') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('institutionId')}</p>
            )}
          </div>

          {/* Initial Balance */}
          <div>
            <Label htmlFor="initialBalance" required>
              Saldo Inicial
            </Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register('initialBalance', { valueAsNumber: true })}
              className={cn(hasError('initialBalance') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
              disabled={isLoading}
            />
            {getErrorMessage('initialBalance') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('initialBalance')}</p>
            )}
          </div>

          {/* Credit Card Specific Fields */}
          {selectedType === 'CREDIT_CARD' && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm font-medium text-purple-800">Configurações do Cartão de Crédito</p>

              <div>
                <Label htmlFor="creditLimit">
                  Limite de Crédito
                </Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 5000,00"
                  {...register('creditLimit', { valueAsNumber: true })}
                  className={cn(hasError('creditLimit') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  disabled={isLoading}
                />
                {getErrorMessage('creditLimit') && (
                  <p className="mt-1 text-sm text-red-500">{getErrorMessage('creditLimit')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="closingDay">
                    Dia de Fechamento
                  </Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1-31"
                    {...register('closingDay', { valueAsNumber: true })}
                    className={cn(hasError('closingDay') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                    disabled={isLoading}
                  />
                  {getErrorMessage('closingDay') && (
                    <p className="mt-1 text-sm text-red-500">{getErrorMessage('closingDay')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dueDay">
                    Dia de Vencimento
                  </Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1-31"
                    {...register('dueDay', { valueAsNumber: true })}
                    className={cn(hasError('dueDay') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                    disabled={isLoading}
                  />
                  {getErrorMessage('dueDay') && (
                    <p className="mt-1 text-sm text-red-500">{getErrorMessage('dueDay')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer font-medium text-gray-900">
              Conta ativa
            </Label>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Pré-visualização</p>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100"
                style={{
                  backgroundColor:
                    selectedInstitution?.color ?? TYPE_COLORS[selectedType]?.replace('bg-', '').replace(' text-', '') ?? '#3B82F6',
                }}
              >
                <TypeIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{watch('name') || 'Nome da conta'}</p>
                <p className="text-sm text-gray-500 capitalize">{TYPE_LABELS[watch('type') ?? 'CHECKING']?.toLowerCase() || 'conta corrente'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}