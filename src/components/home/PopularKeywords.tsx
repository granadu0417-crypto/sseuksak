'use client';

import Link from 'next/link';

const keywords = [
  '인테리어',
  '이사청소',
  '피아노레슨',
  '영어과외',
  '웹디자인',
  '사진촬영',
  '결혼식사회',
  '헬스PT',
];

export default function PopularKeywords() {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <Link
          key={keyword}
          href={`/search?q=${encodeURIComponent(keyword)}`}
          className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 tap-feedback hover:bg-gray-200"
        >
          <span className="text-[#FF6B35] font-medium mr-1">{index + 1}</span>
          {keyword}
        </Link>
      ))}
    </div>
  );
}
