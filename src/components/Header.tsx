import Link from 'next/link';
import dynamic from 'next/dynamic';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';

// SearchButton은 초기 렌더링에 불필요 → 동적 import로 JS 번들 축소
const SearchButton = dynamic(() => import('./SearchButton'), {
  loading: () => (
    <button className="p-2 text-gray-600 rounded-full" aria-label="검색">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
