'use client';

import { useEffect, useState } from 'react';
import { CategoryTable } from '@/components/categories/CategoryTable';
import { getAllCategories } from '@/app/actions/categories/getAll';
import { createCategory } from '@/app/actions/categories/create';
import { updateCategory } from '@/app/actions/categories/update';
import { deleteCategory } from '@/app/actions/categories/delete';
import { Alert } from '@/components/ui/Alert';
import type { CategoryWithChildren } from '@/types';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllCategories();
      if (result.success) {
        setCategories(result.data ?? []);
      } else {
        setError(result.error ?? 'Erro ao carregar categorias');
      }
    } catch {
      setError('Erro inesperado ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (data: any) => {
    const result = await createCategory(data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao criar categoria');
    }
    await loadCategories();
  };

  const handleUpdate = async (id: string, data: any) => {
    const result = await updateCategory(id, data);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao atualizar categoria');
    }
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (!result.success) {
      throw new Error(result.error ?? 'Erro ao excluir categoria');
    }
    await loadCategories();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Categorias</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas categorias de receitas, despesas e transferências. Organize em hierarquias para melhor controle.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Category Table */}
      <CategoryTable
        categories={categories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}