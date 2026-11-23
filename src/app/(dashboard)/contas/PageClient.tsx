'use client';

import { useEffect, useState } from 'react';
import { AccountTable } from '@/components/accounts/AccountTable';
import { getAllAccounts } from '@/app/actions/accounts/getAll';
import { createAccount } from '@/app/actions/accounts/create';
import { updateAccount } from '@/app/actions/accounts/update';
import { deleteAccount } from '@/app/actions/accounts/delete';
import { getAllInstitutions } from '@/app/actions/institutions/getAll';
import { Alert } from '@/components/ui/Alert';
import type { AccountWithInstitution, Institution } from '@/types';

export default function ContasPage() {
  const [accounts, setAccounts] = useState<AccountWithInstitution[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [accountsResult, institutionsResult] = await Promise.all([
        getAllAccounts(),
        getAllInstitutions(),
      ]);

      if (accountsResult.success) {
        setAccounts(accountsResult.data ?? []);
      } else {
        throw new Error(accountsResult.error ?? 'Erro ao carregar contas');
      }

      if (institutionsResult.success) {
        setInstitutions(institutionsResult.data ?? []);
      } else {
        throw new Error(institutionsResult.error ?? 'Erro ao carregar instituições');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    const result = await createAccount(data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao criar conta');
    }
    await loadData();
  };

  const handleUpdate = async (id: string, data: any) => {
    const result = await updateAccount(id, data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao atualizar conta');
    }
    await loadData();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAccount(id);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao excluir conta');
    }
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Contas</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas contas bancárias, cartões de crédito, investimentos e carteiras.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Account Table */}
      <AccountTable
        accounts={accounts}
        institutions={institutions}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}