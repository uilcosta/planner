'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/**
 * Server action for user sign out
 * @returns ApiResponse indicating success or error
 */
export async function signOut(): Promise<ApiResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error('Sign out error:', err);
    return {
      success: false,
      error: 'Erro interno do servidor',
    };
  }
}
