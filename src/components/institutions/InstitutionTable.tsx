'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { InstitutionForm } from './InstitutionForm';
import { Building, CreditCard, TrendingUp, Briefcase, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import type { Institution } from '@/types';

interface InstitutionTableProps {
  institutions: Institution[];
  onCreate: (data: { name: string; type: string; color: string | null; logoUrl: string | null }) => Promise<void>;
  onUpdate: (id: string, data: { name?: string; type?: string; color?: string | null; logoUrl?: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

export function InstitutionTable({
  institutions,
  onCreate,
  onUpdate,
  onDelete,
  isLoading = false,
}: InstitutionTableProps) {
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFormSubmit = async (data: any) => {
    setFormError(null);
    try {
      if (editingInstitution) {
        await onUpdate(editingInstitution.id, data);
      } else {
        await onCreate(data);
      }
      setIsFormOpen(false);
      setEditingInstitution(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar instituição');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instituição?')) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir instituição');
    } finally {
      setDeletingId(null);
    }
  };

  if (institutions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Empty state */}
        <div className="text-center py-12">
          <Plus className="h-12 w-12 mx-auto text-gray-300" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma instituição</h3>
          <p className="mt-2 text-gray-500">Cadastre sua primeira instituição financeira</p>
          <Button
            onClick={() => { setEditingInstitution(null); setIsFormOpen(true); }}
            className="mt-4"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Criar Instituição
          </Button>
        </div>

        {/* Form Modal - always rendered */}
        <InstitutionForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingInstitution(null); setFormError(null); }}
          onSubmit={handleFormSubmit}
          initialData={editingInstitution}
          isLoading={isLoading}
        />

        {formError && (
          <Alert variant="destructive" onClose={() => setFormError(null)} className="mt-4">
            {formError}
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Instituições</h3>
          <p className="text-sm text-gray-500">
            {institutions.length} instituição{institutions.length !== 1 ? 's' : ''} cadastrada{institutions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => { setEditingInstitution(null); setIsFormOpen(true); }}
          size="lg"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Nova Instituição
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Instituição
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Cor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Logo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {institutions.map((institution) => {
              const TypeIcon = TYPE_ICONS[institution.type] || Building;
              const isDeleting = deletingId === institution.id;

              return (
                <tr
                  key={institution.id}
                  className={cn('transition-colors', isDeleting && 'opacity-50 bg-red-50')}
                >
                  {/* Name & Icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden"
                        style={{ backgroundColor: institution.color ?? undefined }}
                      >
                        {institution.logoUrl ? (
                          <img
                            src={institution.logoUrl}
                            alt=""
                            className="h-full w-full object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <TypeIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{institution.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', TYPE_COLORS[institution.type])}>
                      <TypeIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                      {TYPE_LABELS[institution.type]}
                    </span>
                  </td>

                  {/* Color */}
                  <td className="px-4 py-3">
                    {institution.color && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border border-gray-300"
                          style={{ backgroundColor: institution.color }}
                          aria-label={`Cor: ${institution.color}`}
                        />
                        <span className="text-sm font-mono text-gray-500">{institution.color}</span>
                      </div>
                    )}
                  </td>

                  {/* Logo */}
                  <td className="px-4 py-3">
                    {institution.logoUrl ? (
                      <a
                        href={institution.logoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500 text-sm font-mono truncate max-w-[150px] block"
                      >
                        {institution.logoUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingInstitution(institution); setIsFormOpen(true); }}
                        disabled={isLoading || isDeleting}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label={`Editar ${institution.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(institution.id)}
                        disabled={isLoading || isDeleting}
                        className={cn(
                          'p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50',
                          isDeleting && 'text-red-600'
                        )}
                        aria-label={`Excluir ${institution.name}`}
                      >
                        {isDeleting ? (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <InstitutionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingInstitution(null); setFormError(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingInstitution}
        isLoading={isLoading}
      />

      {formError && (
        <Alert variant="destructive" onClose={() => setFormError(null)} className="mt-4">
          {formError}
        </Alert>
      )}
    </div>
  );
}