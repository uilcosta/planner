import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase browser client for use in Client Components
 * This client is safe to use in the browser and handles auth state automatically
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Singleton instance of the browser client
 * Use this in Client Components to avoid creating multiple instances
 */
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}
