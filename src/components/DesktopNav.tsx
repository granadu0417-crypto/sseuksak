'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const categories = [
  { name: '금융/투자', slug: 'finance' },
  { name: '보험/법률', slug: 'insurance' },
  { name: '건강/의료', slug: 'health' },
  { name: 'IT/테크', slug: 'tech' },
  { name: '교육/자격증', slug: 'education' },
  { name: '생활정보', slug: 'lifestyle' },
];

export default function DesktopNav() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="hidden md:flex items-center space-x-8">
      {/* 정보 드롭다운 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          정보
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${isInfoOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 드롭다운 메뉴 */}
        {isInfoOpen && (
          <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsInfoOpen(false)}
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
        className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        일정
      </Link>

      {/* 도구 */}
      <Link
        href="/tools"
        className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        도구
      </Link>

      {/* 테스트 */}
      <Link
        href="/tests"
        className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        테스트
      </Link>
    </div>
  );
}
