import Link from 'next/link';
import MobileNav from './MobileNav';

const categories = [
  { name: '금융/투자', slug: 'finance' },
  { name: '보험/법률', slug: 'insurance' },
  { name: '건강/의료', slug: 'health' },
  { name: 'IT/테크', slug: 'tech' },
  { name: '교육/자격증', slug: 'education' },
  { name: '생활정보', slug: 'lifestyle' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">쓱싹</span>
          </Link>

          {/* Desktop Navigation - 서버 렌더링 */}
          <div className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/calendar"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              일정
            </Link>
            <Link
              href="/tools"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              도구
            </Link>
          </div>

          {/* Mobile Navigation - 클라이언트 컴포넌트 */}
          <MobileNav categories={categories} />
        </div>
      </nav>
    </header>
  );
}
