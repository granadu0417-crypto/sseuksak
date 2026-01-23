import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchResults from './SearchResults';

export const metadata: Metadata = {
  title: '검색',
  description: '쓱싹에서 원하는 정보를 검색하세요.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">검색</h1>
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
