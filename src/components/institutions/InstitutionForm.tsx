'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInstitutionSchema, type CreateInstitutionInput, updateInstitutionSchema, type UpdateInstitutionInput } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { X, Building, CreditCard, TrendingUp, Briefcase } from 'lucide-react';

interface InstitutionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInstitutionInput | UpdateInstitutionInput) => Promise<void>;
  initialData?: {
    id: string;
    name: string;
    type: 'BANK' | 'CREDIT_CARD' | 'INVESTMENT' | 'OTHER';
    color: string | null;
    logoUrl: string | null;
  } | null;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  BANK: 'Banco',
  CREDIT_CARD: 'Cartão de Crédito',
  INVESTMENT: 'Investimento',
  OTHER: 'Outro',
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BANK: Building,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
  OTHER: Briefcase,
};

const TYPE_COLORS: Record<string, string> = {
  BANK: 'bg-blue-100 text-blue-800',
  CREDIT_CARD: 'bg-purple-100 text-purple-800',
  INVESTMENT: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export function InstitutionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: InstitutionFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateInstitutionSchema : createInstitutionSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateInstitutionInput | UpdateInstitutionInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      type: 'BANK' as const,
      color: '#3B82F6',
      logoUrl: '',
    },
  });

  const selectedType = watch('type') ?? 'BANK';

  // Reset form when opening/closing or when initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          type: initialData.type,
          color: initialData.color ?? '#3B82F6',
          logoUrl: initialData.logoUrl ?? '',
        });
      } else {
        reset({
          name: '',
          type: 'BANK' as const,
          color: '#3B82F6',
          logoUrl: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const getErrorMessage = (field: keyof CreateInstitutionInput) => {
    const fieldErrors = errors[field];
    if (fieldErrors && typeof fieldErrors === 'object' && 'message' in fieldErrors) {
      return (fieldErrors as { message: string }).message;
    }
    return undefined;
  };

  const hasError = (field: keyof CreateInstitutionInput) => {
    return !!errors[field];
  };

  const handleFormSubmit = async (data: CreateInstitutionInput | UpdateInstitutionInput) => {
    await onSubmit(data);
  };

  if (!isOpen) return null;

  const TypeIcon = TYPE_ICONS[selectedType] || Building;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="institution-form-title">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="institution-form-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Instituição' : 'Nova Instituição'}
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
              placeholder="Ex: Nubank, Itaú, XP Investimentos"
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
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de instituição">
              {(['BANK', 'CREDIT_CARD', 'INVESTMENT', 'OTHER'] as const).map((type) => {
                const Icon = TYPE_ICONS[type];
                return (
                  <label
                    key={type}
                    className={cn(
                      'flex flex-col items-center gap-2 px-3 py-3 rounded-lg border-2 transition-all cursor-pointer',
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
                    <Icon className={cn('h-5 w-5', selectedType === type ? 'text-current' : 'text-gray-400')} aria-hidden="true" />
                    <span className="text-sm font-medium">{TYPE_LABELS[type]}</span>
                  </label>
                );
              })}
            </div>
            {getErrorMessage('type') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('type')}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <Label htmlFor="color">
              Cor
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                {...register('color')}
                className="h-10 w-12 rounded-lg border border-gray-300 cursor-pointer"
                disabled={isLoading}
                aria-label="Selecionar cor"
              />
              <Input
                id="color-hex"
                type="text"
                placeholder="#3B82F6"
                value={watch('color')}
                onChange={(e) => setValue('color', e.target.value.toUpperCase())}
                className="flex-1 font-mono text-sm"
                disabled={isLoading}
              />
            </div>
            {getErrorMessage('color') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('color')}</p>
            )}
          </div>

          {/* Logo URL */}
          <div>
            <Label htmlFor="logoUrl">
              URL do Logo (opcional)
            </Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://exemplo.com/logo.png"
              {...register('logoUrl')}
              className={cn(hasError('logoUrl') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Link direto para a imagem do logo (PNG, SVG, JPG)
            </p>
            {getErrorMessage('logoUrl') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('logoUrl')}</p>
            )}
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Pré-visualização</p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden" style={{ backgroundColor: watch('color') }}>
                {watch('logoUrl') ? (
                  <img
                    src={watch('logoUrl') as string}
                    alt=""
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <TypeIcon className="h-6 w-6 text-white" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{watch('name') || 'Nome da instituição'}</p>
                <p className="text-sm text-gray-500 capitalize">{TYPE_LABELS[watch('type') ?? 'BANK']?.toLowerCase() || 'banco'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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