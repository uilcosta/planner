'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Calendar, Plus, TrendingUp, TrendingDown, Minus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllPlannedItems } from '@/app/actions/planned-items/getAll';
import { createPlannedItem } from '@/app/actions/planned-items/create';
import { updatePlannedItem } from '@/app/actions/planned-items/update';
import { deletePlannedItem } from '@/app/actions/planned-items/delete';
import { getAllCategories } from '@/app/actions/categories/getAll';
import type { PlannedItemWithCategory, Category } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
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
    loadData();
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Planejamento</h1>
          <p className="text-muted-foreground mt-1">Controle mensal de receitas e despesas planejadas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Mês anterior">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-card-foreground w-40 text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Próximo mês">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas Planejadas</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {formatCurrency(totalPlannedIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{incomeItems.length} item{incomeItems.length !== 1 ? 'ns' : ''}</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Planejadas</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-danger-600 dark:text-danger-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">
              {formatCurrency(totalPlannedExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{expenseItems.length} item{expenseItems.length !== 1 ? 'ns' : ''}</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Previsto</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', balance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400')}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Receitas menos despesas</p>
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
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-medium text-card-foreground">Nenhum item planejado para este mês</p>
              <p className="text-sm mt-1">Adicione receitas e despesas previstas</p>
              <Button onClick={() => openForm()} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {incomeItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-success-600 dark:text-success-400 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Receitas
                  </h4>
                  <div className="space-y-2">
                    {incomeItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-900/30"
                      >
                        <div className="flex items-center gap-3">
                          {item.category.icon && (
                            <span className="text-lg" role="img" aria-label={item.category.name}>
                              {item.category.icon}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-card-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.category.name} • {item.recurrence === 'MONTHLY' ? 'Mensal' : item.recurrence}
                              {item.dayOfMonth && ` • Dia ${item.dayOfMonth}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-success-600 dark:text-success-400">
                            +{formatCurrency(Number(item.amount))}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => openForm(item)} className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-danger-600 hover:bg-danger-50">
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
                  <h4 className="text-sm font-medium text-danger-600 dark:text-danger-400 mb-2 flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    Despesas
                  </h4>
                  <div className="space-y-2">
                    {expenseItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-100 dark:border-danger-900/30"
                      >
                        <div className="flex items-center gap-3">
                          {item.category.icon && (
                            <span className="text-lg" role="img" aria-label={item.category.name}>
                              {item.category.icon}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-card-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.category.name} • {item.recurrence === 'MONTHLY' ? 'Mensal' : item.recurrence}
                              {item.dayOfMonth && ` • Dia ${item.dayOfMonth}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-danger-600 dark:text-danger-400">
                            -{formatCurrency(Number(item.amount))}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => openForm(item)} className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-danger-600 hover:bg-danger-50">
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Salário, Aluguel, Supermercado"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-card-foreground mb-1">
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
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-card-foreground mb-1">
                      Tipo *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="INCOME">Receita</option>
                      <option value="EXPENSE">Despesa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-card-foreground mb-1">
                    Categoria *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories
                      .filter((c) => c.type === formData.type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="dayOfMonth" className="block text-sm font-medium text-card-foreground mb-1">
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
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label htmlFor="recurrence" className="block text-sm font-medium text-card-foreground mb-1">
                      Recorrência
                    </label>
                    <select
                      id="recurrence"
                      name="recurrence"
                      value={formData.recurrence}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
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