'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORY_NAMES: Record<string, string> = {
  finance: '금융/투자',
  insurance: '보험/법률',
  health: '건강/의료',
  tech: 'IT/테크',
  education: '교육/자격증',
  lifestyle: '생활정보',
};

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allPosts, setAllPosts] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  // 클라이언트 측 검색 함수
  const performSearch = useCallback((searchQuery: string, posts: SearchResult[]) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const queryLower = searchQuery.toLowerCase();
    const filtered = posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(queryLower);
      const descMatch = post.description.toLowerCase().includes(queryLower);
      const tagMatch = post.tags.some((tag) => tag.toLowerCase().includes(queryLower));
      return titleMatch || descMatch || tagMatch;
    });

    setResults(filtered);
    setIsLoading(false);
  }, []);

  // 검색 인덱스 로드 (최초 1회)
  useEffect(() => {
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data) => setAllPosts(data))
      .catch(() => setAllPosts([]));
  }, []);

  // URL 쿼리 파라미터 변경 감지
  useEffect(() => {
    const q = searchParams.get('q') || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(q);
    if (q && allPosts.length > 0) {
      performSearch(q, allPosts);
    }
  }, [searchParams, allPosts, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* 검색 입력 */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요 (예: 실업급여, 연말정산, 청년)"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="검색"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* 검색 결과 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        results.length > 0 ? (
          <div>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold text-blue-600">&quot;{searchParams.get('q')}&quot;</span>에 대한 검색 결과 {results.length}개
            </p>
            <div className="space-y-4">
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {CATEGORY_NAMES[post.category] || post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.readingTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어로 다시 시도해 보세요.</p>
          </div>
        )
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p>검색어를 입력하면 관련 글을 찾아드립니다.</p>
        </div>
      )}
    </div>
  );
}
