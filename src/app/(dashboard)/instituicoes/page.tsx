'use client';

import { useEffect, useState } from 'react';
import { InstitutionTable } from '@/components/institutions/InstitutionTable';
import { getAllInstitutions } from '@/app/actions/institutions/getAll';
import { createInstitution } from '@/app/actions/institutions/create';
import { updateInstitution } from '@/app/actions/institutions/update';
import { deleteInstitution } from '@/app/actions/institutions/delete';
import { Alert } from '@/components/ui/Alert';
import type { Institution } from '@/types';

export default function InstituicoesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInstitutions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllInstitutions();
      if (result.success) {
        setInstitutions(result.data ?? []);
      } else {
        setError(result.error ?? 'Erro ao carregar instituições');
      }
    } catch {
      setError('Erro inesperado ao carregar instituições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleCreate = async (data: any) => {
    const result = await createInstitution(data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao criar instituição');
    }
    await loadInstitutions();
  };

  const handleUpdate = async (id: string, data: any) => {
    const result = await updateInstitution(id, data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao atualizar instituição');
    }
    await loadInstitutions();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteInstitution(id);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao excluir instituição');
    }
    await loadInstitutions();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Instituições</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas instituições financeiras: bancos, cartões de crédito, corretoras e outras.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Institution Table */}
      <InstitutionTable
        institutions={institutions}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}