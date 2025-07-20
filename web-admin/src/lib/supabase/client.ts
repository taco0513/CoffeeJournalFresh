import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { config } from '@/lib/env';

export function createClient() {
  return createBrowserClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Name': 'coffee-journal-admin',
          'X-Client-Version': '1.0.0',
        },
      },
    }
  );
}

export const supabase = createClient();