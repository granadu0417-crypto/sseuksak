import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostsByTag, getAllTags } from '@/lib/posts';
import { generateMetadata as genMeta } from '@/lib/metadata';
import PostCard from '@/components/PostCard';
import Breadcrumb from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((slug) => ({ slug }));
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
