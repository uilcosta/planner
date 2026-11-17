'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signInSchema, type SignInInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action for user sign in
 * @param input - Email and password credentials
 * @returns ApiResponse with user data or error
 */
export async function signIn(
  input: SignInInput
): Promise<ApiResponse<{ user: { id: string; email: string } }>> {
  // Validate input
  const validation = signInSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { email, password } = validation.data;

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map Supabase error messages to Portuguese
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Email not confirmed')
      ) {
        return {
          success: false,
          error: 'Email ou senha incorretos',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Email ou senha incorretos',
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
        },
      },
    };
  } catch (err) {
    console.error('Sign in error:', err);
    return {
      success: false,
      error: 'Erro interno do servidor',
    };
  }
}
