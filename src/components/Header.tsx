import Link from 'next/link';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">쓱싹</span>
          </Link>

          {/* Desktop Navigation - 클라이언트 컴포넌트 */}
          <DesktopNav />

          {/* Mobile Navigation - 클라이언트 컴포넌트 */}
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
