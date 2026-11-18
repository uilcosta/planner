'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AccountForm } from './AccountForm';
import { Building, CreditCard, TrendingUp, Wallet, Landmark, PiggyBank, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import type { AccountWithInstitution } from '@/types';

interface AccountTableProps {
  accounts: AccountWithInstitution[];
  onCreate: (data: { name: string; type: string; institutionId: string; initialBalance: number; creditLimit: number | null; closingDay: number | null; dueDay: number | null; isActive: boolean }) => Promise<void>;
  onUpdate: (id: string, data: { name?: string; type?: string; institutionId?: string; initialBalance?: number; creditLimit?: number | null; closingDay?: number | null; dueDay?: number | null; isActive?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

export function AccountTable({
  accounts,
  onCreate,
  onUpdate,
  onDelete,
  institutions,
  isLoading = false,
}: AccountTableProps) {
  const [editingAccount, setEditingAccount] = useState<AccountWithInstitution | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFormSubmit = async (data: any) => {
    setFormError(null);
    try {
      if (editingAccount) {
        await onUpdate(editingAccount.id, data);
      } else {
        await onCreate(data);
      }
      setIsFormOpen(false);
      setEditingAccount(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar conta');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir conta');
    } finally {
      setDeletingId(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        {/* Empty state */}
        <div className="text-center py-12">
          <Plus className="h-12 w-12 mx-auto text-gray-300" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma conta</h3>
          <p className="mt-2 text-gray-500">Cadastre sua primeira conta bancária ou carteira</p>
          <Button
            onClick={() => { setEditingAccount(null); setIsFormOpen(true); }}
            className="mt-4"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Criar Conta
          </Button>
        </div>

        {/* Form Modal - always rendered */}
        <AccountForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingAccount(null); setFormError(null); }}
          onSubmit={handleFormSubmit}
          initialData={editingAccount ? {
            id: editingAccount.id,
            name: editingAccount.name,
            type: editingAccount.type,
            institutionId: editingAccount.institutionId,
            initialBalance: Number(editingAccount.initialBalance),
            creditLimit: editingAccount.creditLimit ? Number(editingAccount.creditLimit) : null,
            closingDay: editingAccount.closingDay,
            dueDay: editingAccount.dueDay,
            isActive: editingAccount.isActive,
          } : null}
          institutions={institutions}
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
          <h3 className="text-lg font-semibold text-gray-900">Contas</h3>
          <p className="text-sm text-gray-500">
            {accounts.length} conta{accounts.length !== 1 ? 's' : ''} cadastrada{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => { setEditingAccount(null); setIsFormOpen(true); }}
          size="lg"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Nova Conta
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Conta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                Instituição
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                Saldo Atual
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account) => {
              const TypeIcon = TYPE_ICONS[account.type] || Landmark;
              const isDeleting = deletingId === account.id;
              const currentBalance = typeof account.currentBalance === 'number' ? account.currentBalance : Number(account.currentBalance);
              const isNegative = currentBalance < 0;

              return (
                <tr
                  key={account.id}
                  className={cn('transition-colors', isDeleting && 'opacity-50 bg-red-50')}
                >
                  {/* Name & Icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-100">
                        <TypeIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        {account.creditLimit && account.type === 'CREDIT_CARD' && (
                          <p className="text-xs text-gray-500">
                            Limite: {formatCurrency(Number(account.creditLimit))}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', TYPE_COLORS[account.type])}>
                      <TypeIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                      {TYPE_LABELS[account.type]}
                    </span>
                  </td>

                  {/* Institution */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {account.institution.logoUrl ? (
                        <img
                          src={account.institution.logoUrl}
                          alt=""
                          className="h-5 w-5 rounded object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: account.institution.color ?? '#6B7280' }}
                        >
                          <Building className="h-3 w-3 text-white" aria-hidden="true" />
                        </div>
                      )}
                      <span className="text-sm text-gray-900">{account.institution.name}</span>
                    </div>
                  </td>

                  {/* Current Balance */}
                  <td className="px-4 py-3 text-right">
                    <span className={cn('font-mono font-medium', isNegative ? 'text-red-600' : 'text-gray-900')}>
                      {formatCurrency(currentBalance)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    )}>
                      {account.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingAccount(account); setIsFormOpen(true); }}
                        disabled={isLoading || isDeleting}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label={`Editar ${account.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id)}
                        disabled={isLoading || isDeleting}
                        className={cn(
                          'p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50',
                          isDeleting && 'text-red-600'
                        )}
                        aria-label={`Excluir ${account.name}`}
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
      <AccountForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingAccount(null); setFormError(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingAccount ? {
          id: editingAccount.id,
          name: editingAccount.name,
          type: editingAccount.type,
          institutionId: editingAccount.institutionId,
          initialBalance: Number(editingAccount.initialBalance),
          creditLimit: editingAccount.creditLimit ? Number(editingAccount.creditLimit) : null,
          closingDay: editingAccount.closingDay,
          dueDay: editingAccount.dueDay,
          isActive: editingAccount.isActive,
        } : null}
        institutions={institutions}
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