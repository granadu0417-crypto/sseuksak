import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// 브라우저용 Supabase 클라이언트
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 싱글톤 클라이언트 (클라이언트 컴포넌트용)
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
