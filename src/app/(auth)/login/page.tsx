'use client';

import { useRouter } from 'next/navigation';
import { signIn } from '@/app/actions/auth/signIn';
import { AuthForm } from '@/components/auth/AuthForm';
import { Card } from '@/components/ui/Card';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <AuthForm
          mode="signIn"
          action={handleSignIn}
          onSuccess={handleSuccess}
          switchModeText="Não tem conta?"
          switchModeLinkText="Cadastre-se"
        />
      </Card>
    </div>
  );
}
