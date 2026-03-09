'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// 인터랙티브 컴포넌트는 LCP 이후 hydration → 모바일 LCP 개선
const SearchButton = dynamic(() => import('./SearchButton'), {
  ssr: false,
  loading: () => (
    <button className="p-2 text-gray-600 rounded-full" aria-label="검색">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  ),
});

const DesktopNav = dynamic(() => import('./DesktopNav'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-8">
      <span className="text-gray-600 text-sm font-medium">정보</span>
      <span className="text-gray-600 text-sm font-medium">일정</span>
      <span className="text-gray-600 text-sm font-medium">도구</span>
      <span className="text-gray-600 text-sm font-medium">테스트</span>
    </div>
  ),
});

const MobileNav = dynamic(() => import('./MobileNav'), {
  ssr: false,
  loading: () => (
    <button className="md:hidden p-2 rounded-md text-gray-600" aria-label="메뉴 열기">
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  ),
});

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">쓱싹</span>
          </Link>

          {/* Desktop Navigation + Search */}
          <div className="hidden md:flex items-center space-x-4">
            <DesktopNav />
            <SearchButton />
          </div>

          {/* Mobile Navigation + Search */}
          <div className="flex md:hidden items-center space-x-2">
            <SearchButton />
            <MobileNav />
          </div>
        </div>
      </nav>
    </header>
  );
}
