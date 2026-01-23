import Link from 'next/link';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';
import SearchButton from './SearchButton';

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
