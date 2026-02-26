import { getAllPosts, getAllCategories } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

// Cloudflare Workers에서 런타임 fs 접근 불가로 인해 정적 생성 강제
// 새 게시글 반영을 위해서는 재배포 필요
export const dynamic = 'force-static';

const categoryLabels: Record<string, string> = {
  finance: '금융/투자',
  insurance: '보험/법률',
};

const LATEST_POSTS_COUNT = 6;

// 모바일 퀵링크 데이터
const quickLinks = [
  {
    name: '정보',
    href: '/posts',
    icon: '📰',
    iconText: '글',
    color: 'bg-blue-500',
    description: '최신 글'
  },
  {
    name: '일정',
    href: '/calendar',
    icon: '📅',
    iconText: '달',
    color: 'bg-orange-500',
    description: '2026 캘린더'
  },
  {
    name: '도구',
    href: '/tools',
    icon: '🧮',
    iconText: '툴',
    color: 'bg-emerald-500',
    description: '계산기'
  },
  {
    name: '테스트',
    href: '/tests',
    icon: '🎯',
    iconText: '?',
    color: 'bg-purple-500',
    description: '금융테스트'
  },
];

export default function Home() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, LATEST_POSTS_COUNT);
  const hasMorePosts = allPosts.length > LATEST_POSTS_COUNT;
  const categories = getAllCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section - 모바일에서 더 컴팩트하게 */}
      <section className="text-center py-8 md:py-12 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
          생활 금융 계산기 & 가이드
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          연봉 실수령액, 대출이자, 적금 금리 비교부터 보험·투자·세금 가이드까지. 공식 자료 기반으로 쉽게 정리해드립니다.
        </p>
      </section>

      {/* 모바일 전용: 가로 스크롤 퀵링크 */}
      <section className="md:hidden mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-4 ${link.color} rounded-xl shadow-sm hover:shadow-md hover:opacity-90 transition-all min-w-[85px]`}
            >
              <span className="text-base font-bold text-white">{link.name}</span>
              <span className="text-xs text-white/80 mt-1">{link.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 모바일 전용: 카테고리 가로 스크롤 */}
      <section className="md:hidden mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">카테고리</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-blue-100 rounded-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {categoryLabels[category] || category}
            </Link>
          ))}
        </div>
      </section>

      {/* 데스크톱 전용: 섹션 1 - 정보 (기존 레이아웃 유지) */}
      <section className="hidden md:block mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
            정보
          </div>
          <h2 className="text-2xl font-bold text-gray-900">정보</h2>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="flex items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-center"
            >
              <span className="font-medium text-gray-700 hover:text-blue-600">
                {categoryLabels[category] || category}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 최신 글 섹션 - 모바일/데스크톱 공통 */}
      <section className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">최신 글</h3>
          {hasMorePosts && (
            <Link
              href="/posts"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              전체 글 보기 →
            </Link>
          )}
        </div>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {posts.map((post, index) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">아직 게시글이 없습니다.</p>
          </div>
        )}
      </section>

      {/* 데스크톱 전용: 섹션 2 - 일정 */}
      <section className="hidden md:block mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
            일정
          </div>
          <h2 className="text-2xl font-bold text-gray-900">일정</h2>
        </div>

        <Link
          href="/calendar"
          className="block p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 hover:border-orange-300 rounded-xl transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                2026년 주요 일정 캘린더
              </h3>
              <p className="text-gray-600 mt-1">
                세금 납부, 자격증 시험, 공휴일 등 놓치면 안 되는 일정을 확인하세요
              </p>
            </div>
            <div className="text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </section>

      {/* 데스크톱 전용: 섹션 3 - 도구 */}
      <section className="hidden md:block mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
            도구
          </div>
          <h2 className="text-2xl font-bold text-gray-900">도구</h2>
        </div>

        <Link
          href="/tools"
          className="block p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-300 rounded-xl transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                유용한 계산기 모음
              </h3>
              <p className="text-gray-600 mt-1">
                연봉 계산기, 대출 이자 계산기, 증여세 계산기 등 금융 계산 도구
              </p>
            </div>
            <div className="text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </section>

      {/* 데스크톱 전용: 섹션 4 - 테스트 */}
      <section className="hidden md:block mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
            테스트
          </div>
          <h2 className="text-2xl font-bold text-gray-900">테스트</h2>
        </div>

        <Link
          href="/tests"
          className="block p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 rounded-xl transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                금융 성향 테스트
              </h3>
              <p className="text-gray-600 mt-1">
                소비유형, 재테크 성향 등 나의 금융 습관을 알아보세요
              </p>
            </div>
            <div className="text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
