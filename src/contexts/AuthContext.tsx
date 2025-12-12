'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { User, Session, AuthError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null);

  // 클라이언트 사이드에서만 Supabase 클라이언트 초기화
  const getSupabase = () => {
    if (!supabaseRef.current && typeof window !== 'undefined') {
      const { getSupabaseClient } = require('@/lib/supabase');
      supabaseRef.current = getSupabaseClient();
    }
    return supabaseRef.current;
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('세션 초기화 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // 로그인 시 프로필 자동 생성 (trigger가 실패했을 경우 대비)
        if (event === 'SIGNED_IN' && currentSession?.user) {
          await ensureProfile(currentSession.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 프로필 존재 확인 및 생성
  const ensureProfile = async (authUser: User) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (!existingProfile) {
      // 프로필이 없으면 생성
      const profileData = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
      };
      await supabase.from('profiles').insert(profileData as never);
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string, name: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } as AuthError };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // user_metadata에 이름 저장
        },
      },
    });
    return { error };
  };

  // 로그인
  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } as AuthError };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // 로그아웃
  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  // 프로필 업데이트
  const updateProfile = async (data: { name?: string; phone?: string; avatar_url?: string }) => {
    if (!user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase not initialized') };
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', user.id);

    return { error: error ? new Error(error.message) : null };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다.');
  }
  return context;
}
