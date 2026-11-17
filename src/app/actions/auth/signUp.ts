'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signUpSchema, type SignUpInput } from '@/lib/validators';
import type { ApiResponse } from '@/types';

/**
 * Server action for user sign up
 * @param input - Email, password, and optional name
 * @returns ApiResponse with user data or error
 */
export async function signUp(
  input: SignUpInput
): Promise<ApiResponse<{ user: { id: string; email: string } }>> {
  // Validate input
  const validation = signUpSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((e) => e.message).join(', '),
    };
  }

  const { email, password, name } = validation.data;

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name ?? '',
        },
      },
    });

    if (error) {
      // Map Supabase error messages to Portuguese
      if (
        error.message.includes('User already registered') ||
        error.message.includes('already registered')
      ) {
        return {
          success: false,
          error: 'Este email já está cadastrado',
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
        error: 'Falha ao criar usuário',
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
    console.error('Sign up error:', err);
    return {
      success: false,
      error: 'Erro interno do servidor',
    };
  }
}
