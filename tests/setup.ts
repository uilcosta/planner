import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies() {
    return {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    };
  },
  headers() {
    return new Headers();
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  })),
  getSupabaseServerUser: vi.fn(() => Promise.resolve(null)),
  getSupabaseServerSession: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  })),
  getSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  })),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    institution: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    plannedItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    caixinha: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contribution: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((cb) =>
      cb({
        caixinha: {
          findFirst: vi.fn(),
          update: vi.fn(),
        },
        contribution: {
          create: vi.fn(),
        },
        transaction: {
          create: vi.fn(),
        },
      })
    ),
  },
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
