'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { Plus, PiggyBank, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaixinhasPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);

  // Initialize from localStorage (shared with dashboard)
  useEffect(() => {
    const savedMonth = localStorage.getItem('selectedMonth');
    const savedYear = localStorage.getItem('selectedYear');
    if (savedMonth && savedYear) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentMonth(parseInt(savedMonth, 10));

      setCurrentYear(parseInt(savedYear, 10));
    } else {
      setCurrentMonth(new Date().getMonth());

      setCurrentYear(new Date().getFullYear());
    }
  }, []);

  const handleNewCaixinha = () => {
    router.push('/caixinhas/nova');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header per DESIGN.md §4 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text text-2xl font-bold">Caixinhas</h1>
          <p className="text-text-muted mt-1">Metas e reservas financeiras para seus objetivos</p>
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
          <Button onClick={handleNewCaixinha} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova caixinha
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
              <PiggyBank className="text-primary h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-text text-lg font-semibold">Funcionalidade em desenvolvimento</h3>
              <p className="text-text-muted mt-1">
                As caixinhas permitem criar metas de economia (reserva de emergência, viagem, compra
                planejada, etc.) e acompanhar o progresso automaticamente através de contribuições
                manuais ou automáticas.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-positive-bg text-positive border-positive-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  <Target className="h-3 w-3" />
                  Metas de economia
                </span>
                <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  Acompanhamento de progresso
                </span>
                <span className="bg-warning-bg text-warning border-warning-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Contribuições automáticas
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          variant="elevated"
          className="cursor-pointer p-6 text-center transition-shadow hover:shadow-lg"
          onClick={handleNewCaixinha}
        >
          <PiggyBank className="text-primary mx-auto mb-3 h-10 w-10" />
          <h3 className="text-text font-semibold">Criar Caixinha</h3>
          <p className="text-text-muted mt-1 text-sm">Defina uma meta e valor alvo</p>
        </Card>

        <Card
          variant="elevated"
          className="cursor-pointer p-6 text-center transition-shadow hover:shadow-lg"
        >
          <Target className="text-positive mx-auto mb-3 h-10 w-10" />
          <h3 className="text-text font-semibold">Ver Progresso</h3>
          <p className="text-text-muted mt-1 text-sm">Acompanhe suas metas</p>
        </Card>

        <Card
          variant="elevated"
          className="cursor-pointer p-6 text-center transition-shadow hover:shadow-lg"
        >
          <TrendingUp className="text-primary mx-auto mb-3 h-10 w-10" />
          <h3 className="text-text font-semibold">Histórico</h3>
          <p className="text-text-muted mt-1 text-sm">Veja contribuições passadas</p>
        </Card>
      </div>

      {/* Empty State */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Suas Caixinhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <PiggyBank className="text-text-muted/30 mx-auto mb-4 h-16 w-16" />
            <p className="text-text font-medium">Nenhuma caixinha criada</p>
            <p className="text-text-muted mt-1 text-sm">
              Comece criando sua primeira meta de economia
            </p>
            <Button onClick={handleNewCaixinha} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Caixinha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
