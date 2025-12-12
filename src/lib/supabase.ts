import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

// 싱글톤 클라이언트 (클라이언트 컴포넌트용)
let client: SupabaseClient<Database> | null = null;

// 서버 사이드용 더미 Supabase 객체 (빌드 시 호출되어도 오류 없음)
// 실제 데이터베이스 호출은 하지 않고, 빈 결과를 반환
const dummySupabase = {
  from: () => ({
    select: () => ({ eq: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }), neq: () => ({ eq: () => ({ data: [], error: null }) }), single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }), single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }),
    insert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ data: null, error: null, neq: () => ({ eq: () => ({ data: null, error: null }) }) }) }),
    delete: () => ({ eq: () => ({ eq: () => ({ data: null, error: null }) }) }),
    upsert: () => ({ data: null, error: null }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    subscribe: () => ({ unsubscribe: () => {} }),
  }),
  removeChannel: () => {},
  storage: {
    from: () => ({
      upload: () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => ({ data: null, error: null }),
    }),
  },
  auth: {
    getSession: () => ({ data: { session: null }, error: null }),
    signUp: () => ({ data: null, error: null }),
    signInWithPassword: () => ({ data: null, error: null }),
    signOut: () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
} as unknown as SupabaseClient<Database>;

// 브라우저용 Supabase 클라이언트 생성
function createBrowserSupabaseClient(): SupabaseClient<Database> {
  // 동적 import로 빌드 시점에 평가되지 않도록 함
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBrowserClient } = require('@supabase/ssr') as {
    createBrowserClient: (url: string, key: string) => SupabaseClient<Database>;
  };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Supabase 클라이언트 반환
// 서버 사이드(SSG/SSR 프리렌더링)에서는 더미 객체 반환
// 클라이언트 사이드에서는 실제 Supabase 클라이언트 반환
export function getSupabaseClient(): SupabaseClient<Database> {
  // 서버 사이드에서는 더미 객체 반환 (SSG/프리렌더링 시)
  if (typeof window === 'undefined') {
    return dummySupabase;
  }

  // 클라이언트 사이드에서만 실제 클라이언트 초기화
  if (!client) {
    client = createBrowserSupabaseClient();
  }
  return client;
}
