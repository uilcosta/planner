// tests/auth/signIn.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signIn } from '@/app/actions/auth/signIn';
import { signUp } from '@/app/actions/auth/signUp';
import { signOut } from '@/app/actions/auth/signOut';

describe('Auth Server Actions', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>
    );
  });

  describe('signIn', () => {
    it('signIn com credenciais válidas retorna user', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.data?.user.id).toBe('user-123');
      expect(result.data?.user.email).toBe('test@example.com');
    });

    it('signIn com credenciais inválidas lança erro', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await signIn({ email: 'test@example.com', password: 'wrongpassword' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email ou senha incorretos');
    });

    it('signIn com email inválido retorna erro de validação', async () => {
      const result = await signIn({ email: 'invalid-email', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('E-mail inválido');
    });

    it('signIn com senha vazia retorna erro de validação', async () => {
      const result = await signIn({ email: 'test@example.com', password: '' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Senha é obrigatória');
    });
  });

  describe('signUp', () => {
    it('signUp com dados válidos retorna user', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-456', email: 'new@example.com' } },
        error: null,
      });

      const result = await signUp({
        email: 'new@example.com',
        password: 'password123',
        name: 'Novo Usuário',
      });

      expect(result.success).toBe(true);
      expect(result.data?.user.id).toBe('user-456');
      expect(result.data?.user.email).toBe('new@example.com');
    });

    it('signUp com email já cadastrado retorna erro', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      const result = await signUp({ email: 'existing@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Este email já está cadastrado');
    });

    it('signUp com email inválido retorna erro de validação', async () => {
      const result = await signUp({ email: 'invalid', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('E-mail inválido');
    });

    it('signUp com senha curta retorna erro de validação', async () => {
      const result = await signUp({ email: 'test@example.com', password: '123' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('pelo menos 8 caracteres');
    });
  });

  describe('signOut', () => {
    it('signOut bem-sucedido retorna sucesso', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(result.success).toBe(true);
    });

    it('signOut com erro retorna erro', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: 'Sign out failed' } });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });
  });
});
