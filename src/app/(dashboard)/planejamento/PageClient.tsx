'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { Calendar, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getAllPlannedItems } from '@/app/actions/planned-items/getAll';
import { createPlannedItem } from '@/app/actions/planned-items/create';
import { updatePlannedItem } from '@/app/actions/planned-items/update';
import { deletePlannedItem } from '@/app/actions/planned-items/delete';
import { getAllCategories } from '@/app/actions/categories/getAll';
import type { PlannedItemWithCategory, Category } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

export default function PlanejamentoPage() {
  const [plannedItems, setPlannedItems] = useState<PlannedItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannedItemWithCategory | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    dayOfMonth: '',
    recurrence: 'MONTHLY' as 'ONE_TIME' | 'MONTHLY' | 'YEARLY' | 'CUSTOM',
    month: 1,
    year: 2026,
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
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
      const [itemsResult, categoriesResult] = await Promise.all([
        getAllPlannedItems(),
        getAllCategories(),
      ]);

      if (itemsResult.success) {
        setPlannedItems(itemsResult.data ?? []);
      } else {
        throw new Error(itemsResult.error ?? 'Erro ao carregar itens planejados');
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data ?? []);
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

  const filteredItems = plannedItems.filter(
    (item) => item.month === currentMonth + 1 && item.year === currentYear
  );

  const incomeItems = filteredItems.filter((item) => item.type === 'INCOME');
  const expenseItems = filteredItems.filter((item) => item.type === 'EXPENSE');

  const totalPlannedIncome = incomeItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalPlannedExpense = expenseItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = totalPlannedIncome - totalPlannedExpense;

  const openForm = (item?: PlannedItemWithCategory) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        description: item.description,
        amount: String(item.amount),
        type: item.type as 'INCOME' | 'EXPENSE',
        categoryId: item.categoryId,
        dayOfMonth: String(item.dayOfMonth ?? ''),
        recurrence: item.recurrence as 'ONE_TIME' | 'MONTHLY' | 'YEARLY' | 'CUSTOM',
        month: item.month,
        year: item.year,
        isActive: item.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        description: '',
        amount: '',
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        categoryId: '',
        dayOfMonth: '',
        recurrence: 'MONTHLY' as 'ONE_TIME' | 'MONTHLY' | 'YEARLY' | 'CUSTOM',
        month: currentMonth + 1,
        year: currentYear,
        isActive: true,
      });
    }
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const data = {
      description: formData.description,
      amount: Number(formData.amount),
      type: formData.type,
      categoryId: formData.categoryId,
      dayOfMonth: formData.dayOfMonth ? Number(formData.dayOfMonth) : null,
      recurrence: formData.recurrence,
      month: formData.month,
      year: formData.year,
      isActive: formData.isActive ?? true,
    };

    try {
      let result;
      if (editingItem) {
        result = await updatePlannedItem(editingItem.id, data);
      } else {
        result = await createPlannedItem(data);
      }

      if (!result.success) {
        throw new Error(result.error ?? 'Erro ao salvar');
      }

      closeForm();
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const result = await deletePlannedItem(id);
      if (!result.success) {
        throw new Error(result.error ?? 'Erro ao excluir');
      }
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header with Month Picker per DESIGN.md §4 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text text-2xl font-bold">Planejamento</h1>
          <p className="text-text-muted mt-1">Controle mensal de receitas e despesas planejadas</p>
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
          <Button onClick={() => openForm()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Definir orçamento
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-text-muted text-sm font-medium">
              Receitas Planejadas
            </CardTitle>
            <div className="bg-positive-bg flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingUp className="text-positive h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-positive text-2xl font-bold">
              {formatCurrency(totalPlannedIncome)}
            </div>
            <p className="text-text-muted mt-1 text-xs">
              {incomeItems.length} item{incomeItems.length !== 1 ? 'ns' : ''}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-text-muted text-sm font-medium">
              Despesas Planejadas
            </CardTitle>
            <div className="bg-negative-bg flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingDown className="text-negative h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-negative text-2xl font-bold">
              {formatCurrency(totalPlannedExpense)}
            </div>
            <p className="text-text-muted mt-1 text-xs">
              {expenseItems.length} item{expenseItems.length !== 1 ? 'ns' : ''}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-text-muted text-sm font-medium">Saldo Previsto</CardTitle>
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Calendar className="text-primary h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn('text-2xl font-bold', balance >= 0 ? 'text-positive' : 'text-negative')}
            >
              {formatCurrency(balance)}
            </div>
            <p className="text-text-muted mt-1 text-xs">Receitas menos despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Itens do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-3 border-t-transparent" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-text-muted py-8 text-center">
              <Calendar className="text-text-muted/30 mx-auto mb-4 h-12 w-12" />
              <p className="text-text font-medium">Nenhum item planejado para este mês</p>
              <p className="mt-1 text-sm">Adicione receitas e despesas previstas</p>
              <Button onClick={() => openForm()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {incomeItems.length > 0 && (
                <div>
                  <h4 className="text-positive mb-2 flex items-center gap-1 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Receitas
                  </h4>
                  <div className="space-y-2">
                    {incomeItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-positive/5 border-positive-border flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.category.icon && (
                            <span className="text-lg" role="img" aria-label={item.category.name}>
                              {item.category.icon}
                            </span>
                          )}
                          <div>
                            <p className="text-text font-medium">{item.description}</p>
                            <p className="text-text-muted text-xs">
                              {item.category.name} •{' '}
                              {item.recurrence === 'MONTHLY' ? 'Mensal' : item.recurrence}
                              {item.dayOfMonth && ` • Dia ${item.dayOfMonth}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-positive font-mono font-medium">
                            +{formatCurrency(Number(item.amount))}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openForm(item)}
                            className="h-8 w-8"
                            aria-label="Editar item"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-negative hover:bg-negative/5 h-8 w-8"
                            aria-label="Excluir item"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expenseItems.length > 0 && (
                <div className={cn(incomeItems.length > 0 ? 'mt-6' : '')}>
                  <h4 className="text-negative mb-2 flex items-center gap-1 text-sm font-medium">
                    <TrendingDown className="h-4 w-4" />
                    Despesas
                  </h4>
                  <div className="space-y-2">
                    {expenseItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-negative/5 border-negative-border flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.category.icon && (
                            <span className="text-lg" role="img" aria-label={item.category.name}>
                              {item.category.icon}
                            </span>
                          )}
                          <div>
                            <p className="text-text font-medium">{item.description}</p>
                            <p className="text-text-muted text-xs">
                              {item.category.name} •{' '}
                              {item.recurrence === 'MONTHLY' ? 'Mensal' : item.recurrence}
                              {item.dayOfMonth && ` • Dia ${item.dayOfMonth}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-negative font-mono font-medium">
                            -{formatCurrency(Number(item.amount))}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openForm(item)}
                            className="h-8 w-8"
                            aria-label="Editar item"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-negative hover:bg-negative/5 h-8 w-8"
                            aria-label="Excluir item"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal per DESIGN.md §6 - max-width 560px desktop, full-screen mobile */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingItem ? 'Editar Item' : 'Novo Item Planejado'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <Alert variant="destructive" onClose={() => setFormError(null)} className="mb-2">
                    {formError}
                  </Alert>
                )}

                <div>
                  <label htmlFor="description" className="text-text mb-1 block text-sm font-medium">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="border-border bg-surface text-text placeholder:text-text-muted w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--color-focus)] focus:outline-none"
                    placeholder="Ex: Salário, Aluguel, Supermercado"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="amount" className="text-text mb-1 block text-sm font-medium">
                      Valor *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0.01"
                      className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--color-focus)] focus:outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="text-text mb-1 block text-sm font-medium">
                      Tipo *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--color-focus)] focus:outline-none"
                    >
                      <option value="INCOME">Receita</option>
                      <option value="EXPENSE">Despesa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="categoryId" className="text-text mb-1 block text-sm font-medium">
                    Categoria *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--color-focus)] focus:outline-none"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories
                      .filter((c) => c.type === formData.type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon ? `${cat.icon} ` : ''}
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="dayOfMonth"
                      className="text-text mb-1 block text-sm font-medium"
                    >
                      Dia do Mês
                    </label>
                    <input
                      type="number"
                      id="dayOfMonth"
                      name="dayOfMonth"
                      value={formData.dayOfMonth}
                      onChange={handleChange}
                      min="1"
                      max="31"
                      className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--color-focus)] focus:outline-none"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="recurrence"
                      className="text-text mb-1 block text-sm font-medium"
                    >
                      Recorrência
                    </label>
                    <select
                      id="recurrence"
                      name="recurrence"
                      value={formData.recurrence}
                      onChange={handleChange}
                      className="border-border bg-surface text-text w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--color-focus)] focus:outline-none"
                    >
                      <option value="MONTHLY">Mensal</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="YEARLY">Anual</option>
                      <option value="ONE_TIME">Única vez</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
