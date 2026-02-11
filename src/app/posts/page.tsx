import { Metadata } from 'next';
import Link from 'next/link';
import { getPaginatedPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

// ISR: 6시간마다 재생성
export const revalidate = 21600;

export const metadata: Metadata = {
  title: '전체 글 - 쓱싹',
  description: '쓱싹 블로그의 모든 글을 확인하세요. 금융, 건강, IT 등 유용한 정보를 제공합니다.',
  alternates: {
    canonical: 'https://sseuksak.com/posts',
  },
  openGraph: {
    title: '전체 글 - 쓱싹',
    description: '쓱싹 블로그의 모든 글을 확인하세요. 금융, 건강, IT 등 유용한 정보를 제공합니다.',
    type: 'website',
    url: 'https://sseuksak.com/posts',
  },
};

export default function PostsPage() {
  const { posts, currentPage, totalPages, totalPosts, hasNextPage } =
    getPaginatedPosts(1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="브레드크럼">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              홈
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">전체 글</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          전체 글
        </h1>
        <p className="text-gray-600">
          총 {totalPosts}개의 글 중 1-{Math.min(9, totalPosts)}번째 글
        </p>
      </header>

      {/* SEO: next link */}
      {hasNextPage && (
        <link rel="next" href="/posts/page/2" />
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} priority={index === 0} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">게시글이 없습니다.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/posts/page"
      />
    </div>
  );
}
