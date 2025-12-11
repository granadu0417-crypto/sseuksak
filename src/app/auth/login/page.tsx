'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading: authLoading } = useAuth();

  // redirect 파라미터 가져오기
  const redirectTo = searchParams.get('redirect') || '/';

  // 이미 로그인되어 있으면 리다이렉트
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. 메일함을 확인해주세요.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      // 로그인 성공 시 redirect 파라미터로 이동 (없으면 홈)
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="flex-1 text-center font-semibold text-lg">로그인</h1>
          <div className="w-8" />
        </div>
      </header>

      {/* 폼 */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* 로고 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#FF6B35]">쓱싹</h2>
            <p className="text-gray-500 mt-2">다시 만나서 반가워요!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* 비밀번호 찾기 */}
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-[#FF6B35]">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#e55a2b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-[#FF6B35] font-semibold hover:underline">
                회원가입
              </Link>
            </p>
          </div>

          {/* 소셜 로그인 */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">Google로 계속하기</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 bg-[#FEE500] rounded-xl hover:bg-[#e6cf00] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 3c-5.52 0-10 3.59-10 8 0 2.82 1.87 5.29 4.69 6.69-.13.48-.79 2.86-.82 3.07 0 0-.02.11.05.16.07.04.15.02.15.02.21-.03 2.41-1.58 3.42-2.24.82.12 1.66.18 2.51.18 5.52 0 10-3.59 10-8s-4.48-8-10-8z"/>
                </svg>
                <span className="text-gray-900 font-medium">카카오로 계속하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
