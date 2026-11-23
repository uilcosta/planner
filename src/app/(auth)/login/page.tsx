'use client';

import { useRouter } from 'next/navigation';
import { signIn } from '@/app/actions/auth/signIn';
import { AuthForm } from '@/components/auth/AuthForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = async (data: { email: string; password: string }) => {
    return await signIn(data);
  };

  const handleSuccess = () => {
    router.push('/');
    router.refresh();
  };

  return (
    <main
      className="bg-background flex min-h-screen items-center justify-center px-4 py-12"
      id="main-content"
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <header className="animate-fade-in mb-8 text-center">
          <div className="from-primary-500 to-primary-600 shadow-primary-500/30 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl">
            <Wallet className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-card-foreground text-2xl font-bold tracking-tight">
            Meu Planner Financeiro
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie suas finanças com inteligência
          </p>
        </header>

        <Card className="animate-slide-up">
          <CardHeader className="pb-2 text-center">
            <h2 className="text-text text-xl font-semibold tracking-tight">Entrar na sua conta</h2>
            <p className="text-text-muted mt-1 text-sm">
              Preencha seus dados para acessar o painel
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <AuthForm
              mode="signIn"
              action={handleSignIn}
              onSuccess={handleSuccess}
              switchModeText="Não tem conta?"
              switchModeLinkText="Cadastre-se"
              customFields={[
                {
                  name: 'email',
                  label: 'E-mail',
                  type: 'email',
                  icon: Mail,
                  placeholder: 'seu@email.com',
                  autoComplete: 'email',
                },
                {
                  name: 'password',
                  label: 'Senha',
                  type: 'password',
                  icon: Lock,
                  placeholder: '••••••••',
                  autoComplete: 'current-password',
                },
              ]}
            />
            <div className="mt-6">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => router.push('/esqueci-senha')}
              >
                Esqueceu a senha?
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Ao continuar, você concorda com nossos{' '}
          <a href="/termos" className="text-primary-600 hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" className="text-primary-600 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </main>
  );
}
