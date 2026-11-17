'use client';

import { useRouter } from 'next/navigation';
import { signUp } from '@/app/actions/auth/signUp';
import { AuthForm } from '@/components/auth/AuthForm';
import { Card } from '@/components/ui/Card';
import type { SignUpInput } from '@/lib/validators';

export default function RegisterPage() {
  const router = useRouter();

  const handleSignUp = async (data: SignUpInput) => {
    return await signUp(data);
  };

  const handleSuccess = () => {
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <AuthForm
          mode="signUp"
          action={handleSignUp}
          onSuccess={handleSuccess}
          switchModeText="Já tem conta?"
          switchModeLinkText="Entre"
        />
      </Card>
    </div>
  );
}
