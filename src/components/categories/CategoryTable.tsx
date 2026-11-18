'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CategoryForm } from './CategoryForm';
import { MoreVertical, Trash2, Edit2, GripVertical, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import type { CategoryWithChildren } from '@/types';

interface CategoryTableProps {
  categories: CategoryWithChildren[];
  onCreate: (data: { name: string; type: string; parentId: string | null; color: string | null; icon: string | null }) => Promise<void>;
  onUpdate: (id: string, data: { name?: string; type?: string; parentId?: string | null; color?: string | null; icon?: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

interface FlattenedCategory {
  category: CategoryWithChildren;
  level: number;
  parentId: string | null;
  index: number;
  path: string[];
}

export function CategoryTable({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  isLoading = false,
}: CategoryTableProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryWithChildren | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<{
    draggedId: string | null;
    dragOverId: string | null;
    dragOverPosition: 'before' | 'after' | 'inside' | null;
  }>({ draggedId: null, dragOverId: null, dragOverPosition: null });

  // Flatten categories for rendering
  const flattenCategories = useCallback((cats: CategoryWithChildren[], level = 0, parentId: string | null = null, path: string[] = []): FlattenedCategory[] => {
    return cats.flatMap((cat, index) => [
      { category: cat, level, parentId, index, path: [...path, cat.id] },
      ...(expandedIds.has(cat.id) && cat.children.length > 0
        ? flattenCategories(cat.children, level + 1, cat.id, [...path, cat.id])
        : []),
    ]);
  }, [expandedIds]);

  const flattenedCategories = flattenCategories(categories);

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    setFormError(null);
    try {
      if (editingCategory) {
        await onUpdate(editingCategory.id, data);
      } else {
        await onCreate(data);
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir categoria');
    } finally {
      setDeletingId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDragState({ draggedId: id, dragOverId: null, dragOverPosition: null });
  };

  const handleDragOver = (e: React.DragEvent, id: string, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState((prev) => ({ ...prev, dragOverId: id, dragOverPosition: position }));
  };

  const handleDragLeave = () => {
    setDragState((prev) => ({ ...prev, dragOverId: null, dragOverPosition: null }));
  };

  const handleDrop = async (e: React.DragEvent, targetId: string, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');

    if (!draggedId || draggedId === targetId) {
      setDragState({ draggedId: null, dragOverId: null, dragOverPosition: null });
      return;
    }

    // Prevent dropping inside own descendants
    const draggedCategory = categories.find((c) => c.id === draggedId);
    const targetCategory = categories.find((c) => c.id === targetId);

    // Simple check - in real app you'd traverse the tree
    if (position === 'inside') {
      // Check if target is a descendant of dragged
      const isDescendant = (cat: CategoryWithChildren, targetId: string): boolean => {
        return cat.children.some((child) => child.id === targetId || isDescendant(child, targetId));
      };

      if (draggedCategory && isDescendant(draggedCategory, targetId)) {
        alert('Não é possível mover uma categoria para dentro de sua própria subcategoria');
        setDragState({ draggedId: null, dragOverId: null, dragOverPosition: null });
        return;
      }
    }

    // For now, we just update parentId - in a full implementation you'd also handle ordering
    try {
      if (position === 'inside') {
        await onUpdate(draggedId, { parentId: targetId });
      } else {
        // For before/after, we'd need to find the target's parent and insert accordingly
        // This is a simplified version - just move to target's parent
        await onUpdate(draggedId, { parentId: targetCategory?.parentId ?? null });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reordenar categoria');
    }

    setDragState({ draggedId: null, dragOverId: null, dragOverPosition: null });
  };

  const handleDragEnd = () => {
    setDragState({ draggedId: null, dragOverId: null, dragOverPosition: null });
  };

  const hasChildren = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat && cat.children.length > 0;
  };

  // Count total categories (including nested)
  const countCategories = (cats: CategoryWithChildren[]): number => {
    return cats.reduce((acc, cat) => acc + 1 + countCategories(cat.children), 0);
  };

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        {/* Empty state */}
        <div className="text-center py-12">
          <Plus className="h-12 w-12 mx-auto text-gray-300" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma categoria</h3>
          <p className="mt-2 text-gray-500">Crie sua primeira categoria para começar a organizar suas finanças</p>
          <Button
            onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
            className="mt-4"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Criar Categoria
          </Button>
        </div>

        {/* Form Modal - always rendered */}
        <CategoryForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingCategory(null); setFormError(null); }}
          onSubmit={handleFormSubmit}
          initialData={editingCategory}
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
          <h3 className="text-lg font-semibold text-gray-900">Categorias</h3>
          <p className="text-sm text-gray-500">
            {countCategories(categories)} categoria{countCategories(categories) !== 1 ? 's' : ''} cadastrada{countCategories(categories) !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
          size="lg"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Nova Categoria
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                <span className="sr-only">Ações</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Cor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Ícone
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flattenedCategories.map((item, rowIndex) => {
              const { category, level } = item;
              const isDragged = dragState.draggedId === category.id;
              const isDragOver = dragState.dragOverId === category.id;
              const isDeleting = deletingId === category.id;

              return (
                <tr
                  key={category.id}
                  className={cn(
                    'transition-colors',
                    isDragged && 'opacity-50 bg-primary-50',
                    isDeleting && 'opacity-50 bg-red-50'
                  )}
                  draggable={!isLoading}
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDragOver={(e) => handleDragOver(e, category.id, 'inside')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category.id, 'inside')}
                  onDragEnd={handleDragEnd}
                >
                  {/* Drag handle / Expand */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {hasChildren(category.id) ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(category.id); }}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label={expandedIds.has(category.id) ? 'Colapsar' : 'Expandir'}
                          aria-expanded={expandedIds.has(category.id)}
                        >
                          {expandedIds.has(category.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-6" aria-hidden="true" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                        aria-label="Arrastrar para reordenar"
                        draggable={true}
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                  {/* Name with indentation */}
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${level * 24}px` }}
                    >
                      {dragState.dragOverId === category.id && dragState.dragOverPosition === 'before' && (
                        <div className="absolute left-0 right-0 h-0.5 bg-primary-600 -top-0.5" aria-hidden="true" />
                      )}
                      <span className="font-medium text-gray-900">{category.name}</span>
                      {category.parentId && (
                        <span className="text-xs text-gray-400">(subcategoria)</span>
                      )}
                    </div>
                    {dragState.dragOverId === category.id && dragState.dragOverPosition === 'after' && (
                      <div className="absolute left-0 right-0 h-0.5 bg-primary-600 bottom-0" aria-hidden="true" />
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', TYPE_COLORS[category.type])}>
                      {TYPE_LABELS[category.type]}
                    </span>
                  </td>

                  {/* Color */}
                  <td className="px-4 py-3">
                    {category.color && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border border-gray-300"
                          style={{ backgroundColor: category.color }}
                          aria-label={`Cor: ${category.color}`}
                        />
                        <span className="text-sm font-mono text-gray-500">{category.color}</span>
                      </div>
                    )}
                  </td>

                  {/* Icon */}
                  <td className="px-4 py-3">
                    {category.icon && (
                      <span className="text-gray-400" aria-hidden="true">
                        {category.icon}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingCategory(category); setIsFormOpen(true); }}
                        disabled={isLoading || isDeleting}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label={`Editar ${category.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        disabled={isLoading || isDeleting || category.children.length > 0}
                        className={cn(
                          'p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50',
                          isDeleting && 'text-red-600'
                        )}
                        aria-label={`Excluir ${category.name}`}
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
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCategory(null); setFormError(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
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