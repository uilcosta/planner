'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, PiggyBank, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaixinhasPage() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Caixinhas</h1>
          <p className="text-muted-foreground mt-1">Metas e reservas financeiras para seus objetivos</p>
        </div>
        <Button onClick={() => navigate('/caixinhas/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Caixinha
        </Button>
      </div>

      {/* Info Card */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <PiggyBank className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground">Funcionalidade em desenvolvimento</h3>
              <p className="text-muted-foreground mt-1">
                As caixinhas permitem criar metas de economia (reserva de emergência, viagem, compra planejada, etc.)
                e acompanhar o progresso automaticamente através de contribuições manuais ou automáticas.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">
                  <Target className="h-3 w-3" />
                  Metas de economia
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300">
                  <TrendingUp className="h-3 w-3" />
                  Acompanhamento de progresso
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300">
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
          className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/caixinhas/nova')}
        >
          <PiggyBank className="h-10 w-10 mx-auto text-primary-600 dark:text-primary-400 mb-3" />
          <h3 className="font-semibold text-card-foreground">Criar Caixinha</h3>
          <p className="text-sm text-muted-foreground mt-1">Defina uma meta e valor alvo</p>
        </Card>

        <Card
          variant="elevated"
          className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
        >
          <Target className="h-10 w-10 mx-auto text-accent-600 dark:text-accent-400 mb-3" />
          <h3 className="font-semibold text-card-foreground">Ver Progresso</h3>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe suas metas</p>
        </Card>

        <Card
          variant="elevated"
          className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
        >
          <TrendingUp className="h-10 w-10 mx-auto text-secondary-600 dark:text-secondary-400 mb-3" />
          <h3 className="font-semibold text-card-foreground">Histórico</h3>
          <p className="text-sm text-muted-foreground mt-1">Veja contribuições passadas</p>
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
          <div className="text-center py-12">
            <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-medium text-card-foreground">Nenhuma caixinha criada</p>
            <p className="text-sm text-muted-foreground mt-1">Comece criando sua primeira meta de economia</p>
            <Button onClick={() => navigate('/caixinhas/nova')} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Caixinha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}