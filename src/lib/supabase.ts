import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// 환경 변수 (빌드 시점에 없으면 빈 문자열로 대체)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 브라우저용 Supabase 클라이언트
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// 싱글톤 클라이언트 (클라이언트 컴포넌트용)
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
