'use client';

import { useRouter } from 'next/navigation';
import { signIn } from '@/app/actions/auth/signIn';
import { AuthForm } from '@/components/auth/AuthForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Lock, Mail, AlertCircle } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl shadow-primary-500/30 mb-5">
            <Wallet className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground tracking-tight">Meu Planner Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie suas finanças com inteligência</p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
            <CardDescription>Preencha seus dados para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <AuthForm
              mode="signIn"
              action={handleSignIn}
              onSuccess={handleSuccess}
              switchModeText="Não tem conta?"
              switchModeLinkText="Cadastre-se"
              customFields={[
                { name: 'email', label: 'E-mail', type: 'email', icon: Mail, placeholder: 'seu@email.com', autoComplete: 'email' },
                { name: 'password', label: 'Senha', type: 'password', icon: Lock, placeholder: '••••••••', autoComplete: 'current-password' },
              ]}
            />
            <div className="mt-6">
              <Button variant="ghost" className="w-full text-sm" onClick={() => router.push('/esqueci-senha')}>
                Esqueceu a senha?
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos <a href="/termos" className="text-primary-600 hover:underline">Termos de Uso</a> e{' '}
          <a href="/privacidade" className="text-primary-600 hover:underline">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}