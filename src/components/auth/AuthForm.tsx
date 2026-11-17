'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInInput, signUpSchema, type SignUpInput } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

interface AuthFormProps {
  mode: 'signIn' | 'signUp';
  action: (data: SignInInput | SignUpInput) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  onSwitchMode?: () => void;
  switchModeText?: string;
  switchModeLinkText?: string;
}

type FormData = SignInInput | SignUpInput;

export function AuthForm({
  mode,
  action,
  onSuccess,
  onSwitchMode,
  switchModeText,
  switchModeLinkText,
}: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = mode === 'signUp';
  const schema = isSignUp ? signUpSchema : signInSchema;
  const defaultValues = isSignUp
    ? { email: '', password: '', name: '' }
    : { email: '', password: '' };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await action(data);

      if (result.success) {
        reset();
        onSuccess?.();
      } else {
        setError(result.error ?? 'Erro desconhecido');
      }
    } catch {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (field: 'email' | 'password' | 'name') => {
    const fieldErrors = errors[field as keyof typeof errors];
    if (fieldErrors && typeof fieldErrors === 'object' && 'message' in fieldErrors) {
      return (fieldErrors as { message: string }).message;
    }
    return undefined;
  };

  const hasError = (field: 'email' | 'password' | 'name') => {
    return !!errors[field as keyof typeof errors];
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{isSignUp ? 'Criar conta' : 'Entrar'}</h1>
        <p className="mt-2 text-gray-600">
          {isSignUp
            ? 'Preencha os dados para criar sua conta'
            : 'Digite suas credenciais para acessar'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {isSignUp && (
          <div>
            <Label htmlFor="name" required>
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              autoComplete="name"
              {...register('name')}
              className={cn(
                hasError('name') && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
            />
            {getErrorMessage('name') && (
              <p className="mt-1 text-sm text-red-500">{getErrorMessage('name')}</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="email" required>
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            className={cn(
              hasError('email') && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
          />
          {getErrorMessage('email') && (
            <p className="mt-1 text-sm text-red-500">{getErrorMessage('email')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" required>
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            {...register('password')}
            className={cn(
              hasError('password') && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
          />
          {getErrorMessage('password') && (
            <p className="mt-1 text-sm text-red-500">{getErrorMessage('password')}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          {isSignUp ? 'Criar conta' : 'Entrar'}
        </Button>
      </form>

      {onSwitchMode && switchModeText && switchModeLinkText && (
        <p className="mt-6 text-center text-gray-600">
          {switchModeText}{' '}
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-primary-600 hover:text-primary-500 font-medium underline"
          >
            {switchModeLinkText}
          </button>
        </p>
      )}
    </div>
  );
}
