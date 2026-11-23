'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountTable } from '@/components/accounts/AccountTable';
import { getAllAccounts } from '@/app/actions/accounts/getAll';
import { createAccount } from '@/app/actions/accounts/create';
import { updateAccount } from '@/app/actions/accounts/update';
import { deleteAccount } from '@/app/actions/accounts/delete';
import { getAllInstitutions } from '@/app/actions/institutions/getAll';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { Plus } from 'lucide-react';
import type {
  AccountWithInstitution,
  Institution,
  AccountCreateInput,
  AccountUpdateInput,
} from '@/types';

export default function ContasPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountWithInstitution[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage (shared with dashboard)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedMonth = localStorage.getItem('selectedMonth');
    const savedYear = localStorage.getItem('selectedYear');
    if (savedMonth && savedYear) {
      setCurrentMonth(parseInt(savedMonth, 10));
      setCurrentYear(parseInt(savedYear, 10));
    } else {
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
    }
  }, []);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isMounted) loadData();
  }, [isMounted]);

  const handleCreate = async (data: AccountCreateInput) => {
    const result = await createAccount(data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao criar conta');
    }
    await loadData();
  };

  const handleUpdate = async (id: string, data: AccountUpdateInput) => {
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

  const handleNewAccount = () => {
    router.push('/contas/nova');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header per DESIGN.md §4 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text text-2xl font-bold">Contas</h1>
          <p className="text-text-muted mt-1">
            Gerencie suas contas bancárias, cartões de crédito, investimentos e carteiras.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
          <MonthPicker
            month={currentMonth}
            year={currentYear}
            onChange={(month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
              localStorage.setItem('selectedMonth', String(month));
              localStorage.setItem('selectedYear', String(year));
            }}
            onGoToCurrent={() => {
              const now = new Date();
              setCurrentMonth(now.getMonth());
              setCurrentYear(now.getFullYear());
              localStorage.setItem('selectedMonth', String(now.getMonth()));
              localStorage.setItem('selectedYear', String(now.getFullYear()));
            }}
          />
          <Button onClick={handleNewAccount} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova conta
          </Button>
        </div>
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
