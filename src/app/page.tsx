import { getAllPosts, getAllCategories } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

const categoryLabels: Record<string, string> = {
  finance: '금융/투자',
  insurance: '보험/법률',
  health: '건강/의료',
  tech: 'IT/테크',
  education: '교육/자격증',
  lifestyle: '생활정보',
};

const LATEST_POSTS_COUNT = 3;

export default function Home() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, LATEST_POSTS_COUNT);
  const hasMorePosts = allPosts.length > LATEST_POSTS_COUNT;
  const categories = getAllCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          유용한 정보, 쓱싹
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          금융, 건강, IT 등 다양한 주제의 유용한 정보를 쉽게 알려드립니다.
        </p>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">카테고리</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
          {/* 일정 - 주황색으로 강조 */}
          <Link
            href="/calendar"
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 border border-orange-300 hover:border-orange-400 rounded-lg transition-colors text-center"
          >
            <span className="font-medium text-orange-700 hover:text-orange-800">
              일정
            </span>
          </Link>
          {/* 도구 - 녹색으로 강조 */}
          <Link
            href="/tools"
            className="flex items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 hover:border-emerald-400 rounded-lg transition-colors text-center"
          >
            <span className="font-medium text-emerald-700 hover:text-emerald-800">
              도구
            </span>
          </Link>
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">최신 글</h2>
          {hasMorePosts && (
            <Link
              href="/posts/page/1"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              전체 글 보기 →
            </Link>
          )}
        </div>
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <PostCard key={post.slug} post={post} priority={index === 0} />
              ))}
            </div>
            {hasMorePosts && (
              <div className="text-center mt-10">
                <Link
                  href="/posts/page/1"
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  전체 글 보기
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">아직 게시글이 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">
              곧 유용한 정보로 찾아뵙겠습니다!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
