import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostsByTag } from '@/lib/posts';
import { generateMetadata as genMeta } from '@/lib/metadata';
import PostCard from '@/components/PostCard';
import Breadcrumb from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ slug: string }>;
}

// SSR: 태그 페이지는 빌드 시 생성하지 않고 요청 시 동적 렌더링
// 빌드 시간 최적화 (191+ 페이지 → 0페이지)
export const dynamicParams = true;

export function generateStaticParams() {
  // 빌드 시 생성할 태그 없음 (모두 SSR)
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return genMeta({
    title: `#${decodedSlug} 태그`,
    description: `#${decodedSlug} 태그가 포함된 모든 게시글을 확인하세요.`,
    url: `/tag/${slug}`,
  });
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const posts = getPostsByTag(decodedSlug);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ name: `#${decodedSlug}` }]} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">#{decodedSlug}</h1>
        <p className="text-gray-600">
          #{decodedSlug} 태그의 게시글 {posts.length}개
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} priority={index === 0} />
        ))}
      </div>
    </div>
  );
}
