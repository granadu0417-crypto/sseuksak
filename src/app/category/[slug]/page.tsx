import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import { generateMetadata as genMeta } from '@/lib/metadata';
import PostCard from '@/components/PostCard';
import Breadcrumb from '@/components/Breadcrumb';

const categoryLabels: Record<string, string> = {
  finance: '금융/투자',
  insurance: '보험/법률',
  health: '건강/의료',
  tech: 'IT/테크',
  education: '교육/자격증',
  lifestyle: '생활정보',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = categoryLabels[slug] || slug;

  return genMeta({
    title: `${categoryName} 관련 글`,
    description: `${categoryName} 카테고리의 모든 게시글을 확인하세요.`,
    url: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const posts = getPostsByCategory(slug);
  const categoryName = categoryLabels[slug] || slug;

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ name: categoryName }]} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-gray-600">
          {categoryName} 카테고리의 게시글 {posts.length}개
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
