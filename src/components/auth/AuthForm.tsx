'use client';

import { useState } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInInput, signUpSchema, type SignUpInput } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

interface AuthFormField {
  name: 'name' | 'email' | 'password';
  label: string;
  type: 'text' | 'email' | 'password';
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

interface AuthFormProps {
  mode: 'signIn' | 'signUp';
  action: (data: SignInInput | SignUpInput) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  onSwitchMode?: () => void;
  switchModeText?: string;
  switchModeLinkText?: string;
  customFields?: AuthFormField[];
}

type FormData = SignInInput | SignUpInput;

function getFieldError(errors: FieldErrors<FormData>, field: 'name' | 'email' | 'password') {
  const fieldErrors = (errors as Record<string, unknown>)[field];
  if (fieldErrors && typeof fieldErrors === 'object' && 'message' in fieldErrors) {
    return (fieldErrors as { message: string }).message;
  }
  return undefined;
}

function hasFieldError(errors: FieldErrors<FormData>, field: 'name' | 'email' | 'password') {
  return !!(errors as Record<string, unknown>)[field];
}

export function AuthForm({
  mode,
  action,
  onSuccess,
  onSwitchMode,
  switchModeText,
  switchModeLinkText,
  customFields = [],
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

  const fieldsToRender = customFields.length > 0
    ? customFields
    : isSignUp
      ? [
          { name: 'name' as const, label: 'Nome', type: 'text' as const, placeholder: 'Seu nome', autoComplete: 'name', required: true },
          { name: 'email' as const, label: 'E-mail', type: 'email' as const, placeholder: 'seu@email.com', autoComplete: 'email', required: true },
          { name: 'password' as const, label: 'Senha', type: 'password' as const, placeholder: '••••••••', autoComplete: 'new-password', required: true },
        ]
      : [
          { name: 'email' as const, label: 'E-mail', type: 'email' as const, placeholder: 'seu@email.com', autoComplete: 'email', required: true },
          { name: 'password' as const, label: 'Senha', type: 'password' as const, placeholder: '••••••••', autoComplete: 'current-password', required: true },
        ];

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {fieldsToRender.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name} required={field.required}>
              {field.label}
            </Label>
            <div className="relative">
              {field.icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <field.icon className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                {...register(field.name)}
                error={hasFieldError(errors, field.name)}
                disabled={isLoading}
                className={field.icon ? 'pl-10' : undefined}
              />
            </div>
            {getFieldError(errors, field.name) && (
              <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-500" role="alert">
                {getFieldError(errors, field.name)}
              </p>
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          {isSignUp ? 'Criar conta' : 'Entrar'}
        </Button>
      </form>

      {onSwitchMode && switchModeText && switchModeLinkText && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {switchModeText}{' '}
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline"
          >
            {switchModeLinkText}
          </button>
        </p>
      )}
    </div>
  );
}