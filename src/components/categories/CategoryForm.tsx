'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema, type CreateCategoryInput, updateCategorySchema, type UpdateCategoryInput } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { CategorySelector } from './CategorySelector';
import { X, Palette } from 'lucide-react';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  initialData?: {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    parentId: string | null;
    color: string | null;
    icon: string | null;
  } | null;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
};

const TYPE_COLORS: Record<string, string> = {
  INCOME: 'bg-green-100 text-green-800',
  EXPENSE: 'bg-red-100 text-red-800',
  TRANSFER: 'bg-blue-100 text-blue-800',
};

const COMMON_ICONS = [
  'home', 'shopping-cart', 'car', 'bus', 'plane', 'utensils', 'coffee',
  'heart', 'dumbbell', 'book', 'gamepad-2', 'music', 'film', 'camera',
  'smartphone', 'laptop', 'tv', 'headphones', 'watch', 'shirt', 'shopping-bag',
  'gift', 'credit-card', 'wallet', 'piggy-bank', 'banknote', 'coins',
  'briefcase', 'graduation-cap', 'stethoscope', 'pill', 'syringe', 'dna',
  'leaf', 'tree', 'flower', 'sun', 'cloud', 'droplet', 'flame', 'wind',
  'zap', 'battery', 'plug', 'wifi', 'signal', 'bluetooth', 'usb',
  'hard-drive', 'database', 'server', 'cpu', 'memory-stick', 'monitor',
  'keyboard', 'mouse', 'printer', 'mic', 'speaker',
  'bell', 'alert-triangle', 'check-circle', 'x-circle', 'info', 'help-circle',
  'plus-circle', 'minus-circle', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'menu', 'x', 'check', 'star', 'flag', 'bookmark', 'tag',
  'folder', 'file', 'image', 'video', 'code', 'terminal', 'git-branch',
];

export function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: CategoryFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateCategorySchema : createCategorySchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      parentId: null,
      color: '#3B82F6',
      icon: '',
    },
  });

  const selectedType = watch('type') ?? 'EXPENSE';
  const selectedParentId = watch('parentId') ?? null;

  // Reset form when opening/closing or when initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          type: initialData.type,
          parentId: initialData.parentId,
          color: initialData.color ?? '#3B82F6',
          icon: initialData.icon ?? '',
        });
      } else {
        reset({
          name: '',
          type: 'EXPENSE',
          parentId: null,
          color: '#3B82F6',
          icon: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const getErrorMessage = (field: keyof CreateCategoryInput) => {
    const fieldErrors = errors[field];
    if (fieldErrors && typeof fieldErrors === 'object' && 'message' in fieldErrors) {
      return (fieldErrors as { message: string }).message;
    }
    return undefined;
  };

  const hasError = (field: keyof CreateCategoryInput) => {
    return !!errors[field];
  };

  const handleFormSubmit = async (data: CreateCategoryInput | UpdateCategoryInput) => {
    await onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="category-form-title">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="category-form-title" className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
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
              placeholder="Ex: Supermercado"
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
            <div className="flex gap-2" role="radiogroup" aria-label="Tipo de categoria">
              {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((type) => (
                <label
                  key={type}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer',
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
                  <span className="font-medium">{TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
            {getErrorMessage('type') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('type')}</p>
            )}
          </div>

          {/* Parent Category */}
          <div>
            <Label htmlFor="parentId">
              Categoria Pai (opcional)
            </Label>
            <CategorySelector
              value={selectedParentId}
              onChange={(value) => setValue('parentId', value)}
              excludeId={initialData?.id ?? ''}
              filterType={selectedType}
              placeholder="Selecione uma categoria pai"
              disabled={isLoading}
              error={hasError('parentId')}
            />
            {getErrorMessage('parentId') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('parentId')}</p>
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

          {/* Icon */}
          <div>
            <Label htmlFor="icon">
              Ícone (opcional)
            </Label>
            <div className="relative">
              <Input
                id="icon"
                type="text"
                placeholder="Nome do ícone Lucide (ex: shopping-cart)"
                {...register('icon')}
                className={cn(hasError('icon') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setValue('icon', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
                aria-label="Limpar ícone"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use nomes de ícones do <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Lucide</a>
            </p>
            {getErrorMessage('icon') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('icon')}</p>
            )}

            {/* Icon Picker Grid */}
            <div className="mt-2 flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {COMMON_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setValue('icon', iconName)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'flex items-center justify-center',
                    watch('icon') === iconName
                      ? 'bg-primary-100 text-primary-600 border border-primary-300'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  )}
                  disabled={isLoading}
                  aria-label={`Ícone ${iconName}`}
                  aria-pressed={watch('icon') === iconName}
                >
                  <LucideIcon name={iconName} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Pré-visualização</p>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: watch('color') }}
              >
                {watch('icon') ? (
                  <LucideIcon name={watch('icon') as string} className="h-5 w-5 text-white" />
                ) : null}
              </div>
              <div>
                <p className="font-medium text-gray-900">{watch('name') || 'Nome da categoria'}</p>
                <p className="text-sm text-gray-500 capitalize">{TYPE_LABELS[watch('type') ?? 'EXPENSE']?.toLowerCase() || 'despesa'}</p>
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