'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  // 사용자 이름 가져오기
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';

  return (
    <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">쓱</span>
          </div>
          <span className="text-xl font-bold text-[#FF6B35]">쓱싹</span>
        </Link>

        {/* 검색창 */}
        <div className="flex-1 mx-4">
          <button className="w-full bg-gray-100 rounded-full px-4 py-2 text-left text-gray-500 text-sm flex items-center gap-2 tap-feedback">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span>어떤 서비스를 찾으세요?</span>
          </button>
        </div>

        {/* 로그인 상태에 따른 UI */}
        {loading ? (
          // 로딩 중
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          // 로그인된 상태
          <div className="relative flex items-center gap-2" ref={dropdownRef}>
            {/* 알림 버튼 */}
            <button className="relative p-2 tap-feedback">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 프로필 버튼 */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 tap-feedback"
            >
              <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>

            {/* 드롭다운 메뉴 */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/mypage"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  마이페이지
                </Link>
                <Link
                  href="/mypage/favorites"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  찜한 서비스
                </Link>
                <Link
                  href="/mypage/chat"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  채팅 내역
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          // 로그아웃된 상태
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#FF6B35] transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#FF6B35] rounded-lg hover:bg-[#e55a2b] transition-colors"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
