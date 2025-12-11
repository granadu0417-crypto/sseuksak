'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MyPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  // 사용자 이름 가져오기
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="pt-4 px-4">
        <h1 className="text-2xl font-bold mb-4">마이페이지</h1>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 px-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">마이페이지</h1>

      {/* 프로필 섹션 - 로그인 상태에 따라 다르게 표시 */}
      {user ? (
        // 로그인된 상태
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100">
          <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Link
            href="/mypage/profile"
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      ) : (
        // 로그아웃된 상태
        <>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="text-lg font-semibold">로그인이 필요합니다</p>
              <p className="text-sm text-gray-500">로그인하고 쓱싹을 시작하세요</p>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <div className="flex gap-3 mt-4">
            <Link
              href="/auth/login"
              className="flex-1 py-3 bg-white border border-[#FF6B35] text-[#FF6B35] font-semibold rounded-xl text-center tap-feedback"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="flex-1 py-3 bg-[#FF6B35] text-white font-semibold rounded-xl text-center tap-feedback"
            >
              회원가입
            </Link>
          </div>
        </>
      )}

      {/* 메뉴 목록 */}
      <div className="mt-6 divide-y divide-gray-100">
        {[
          { icon: '🛠️', label: '내 서비스', href: '/mypage/services', requireAuth: true, highlight: true },
          { icon: '📋', label: '내 요청서', href: '/mypage/requests', requireAuth: true },
          { icon: '❤️', label: '찜한 서비스', href: '/mypage/favorites', requireAuth: true },
          { icon: '💬', label: '채팅 내역', href: '/mypage/chat', requireAuth: true },
          { icon: '⭐', label: '내 리뷰', href: '/mypage/reviews', requireAuth: true },
          { icon: '🔔', label: '알림 설정', href: '/mypage/notifications', requireAuth: false },
          { icon: '❓', label: '고객센터', href: '/help', requireAuth: false },
          { icon: '⚙️', label: '설정', href: '/settings', requireAuth: false },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.requireAuth && !user ? '/auth/login' : item.href}
            className="w-full flex items-center gap-3 py-4 tap-feedback"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.requireAuth && !user && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                로그인 필요
              </span>
            )}
            <svg
              className="ml-auto text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* 전문가 모드 */}
      <div className="mt-6 p-4 bg-orange-50 rounded-2xl">
        <p className="font-semibold text-[#FF6B35]">전문가로 활동하고 싶으신가요?</p>
        <p className="text-sm text-gray-600 mt-1">
          쓱싹에서 고객을 만나보세요. 무료로 시작할 수 있습니다.
        </p>
        <Link
          href={user ? '/pro/register' : '/auth/login'}
          className="inline-block mt-3 px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg tap-feedback"
        >
          전문가 등록하기
        </Link>
      </div>

      {/* 로그아웃 버튼 - 로그인된 경우에만 표시 */}
      {user && (
        <button
          onClick={handleSignOut}
          className="w-full mt-6 py-3 text-gray-500 text-sm hover:text-red-500 transition-colors"
        >
          로그아웃
        </button>
      )}
    </div>
  );
}
