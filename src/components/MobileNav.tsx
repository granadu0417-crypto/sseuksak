'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = [
  { name: '금융/투자', slug: 'finance' },
  { name: '보험/법률', slug: 'insurance' },
  { name: '건강/의료', slug: 'health' },
  { name: 'IT/테크', slug: 'tech' },
  { name: '교육/자격증', slug: 'education' },
  { name: '생활정보', slug: 'lifestyle' },
];

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsInfoOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label="메뉴 열기"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 md:hidden shadow-lg">
          <div className="flex flex-col py-4 px-4 space-y-1">
            {/* 정보 - 아코디언 */}
            <div>
              <button
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>정보</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isInfoOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 서브 카테고리 */}
              {isInfoOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="block px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 일정 */}
            <Link
              href="/calendar"
              className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              일정
            </Link>

            {/* 도구 */}
            <Link
              href="/tools"
              className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              도구
            </Link>

            {/* 테스트 */}
            <Link
              href="/tests"
              className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              테스트
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
