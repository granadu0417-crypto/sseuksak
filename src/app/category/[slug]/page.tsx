import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import { generateMetadata as genMeta } from '@/lib/metadata';
import PostCard from '@/components/PostCard';
import Breadcrumb from '@/components/Breadcrumb';

// ISR: 24시간마다 재생성
export const revalidate = 86400;

const categoryLabels: Record<string, string> = {
  finance: '금융/투자',
  insurance: '보험/법률',
  health: '건강/의료',
  tech: 'IT/테크',
  education: '교육/자격증',
  lifestyle: '생활정보',
};

// 현재 활성 카테고리 (금융 니치)
const activeCategories = ['finance', 'insurance'];

const categoryDescriptions: Record<string, string> = {
  finance: '적금 금리 비교, 신용카드 추천, 청년 저축, ETF 투자, 재테크 전략 등 실용적인 금융 정보를 제공합니다.',
  insurance: '실비보험, 자동차보험, 상속·증여, 전입신고 등 보험과 법률 관련 핵심 정보를 정리했습니다.',
  health: '건강검진 가이드, 수면 관리, 눈 건강, 다이어트 등 일상에서 바로 실천할 수 있는 건강 정보입니다.',
  tech: 'AI 활용법, 스마트폰 팁, 디지털 보안, 최신 IT 트렌드까지 기술 관련 실용 정보를 다룹니다.',
  education: '자격증 취득 가이드, 공무원 시험, 학습 전략 등 교육과 커리어 성장에 도움되는 정보입니다.',
  lifestyle: '넷플릭스 추천, 절약 팁, 연휴 계획, 생활 꿀팁 등 일상을 더 편리하게 만드는 정보를 모았습니다.',
};

const relatedCategories: Record<string, { slug: string; label: string }[]> = {
  finance: [
    { slug: 'insurance', label: '보험/법률' },
    { slug: 'lifestyle', label: '생활정보' },
  ],
  insurance: [
    { slug: 'finance', label: '금융/투자' },
    { slug: 'health', label: '건강/의료' },
  ],
  health: [
    { slug: 'lifestyle', label: '생활정보' },
    { slug: 'insurance', label: '보험/법률' },
  ],
  tech: [
    { slug: 'education', label: '교육/자격증' },
    { slug: 'lifestyle', label: '생활정보' },
  ],
  education: [
    { slug: 'tech', label: 'IT/테크' },
    { slug: 'finance', label: '금융/투자' },
  ],
  lifestyle: [
    { slug: 'health', label: '건강/의료' },
    { slug: 'finance', label: '금융/투자' },
  ],
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
  const isActive = activeCategories.includes(slug);

  const meta = genMeta({
    title: `${categoryName} 관련 글`,
    description: categoryDescriptions[slug] || `${categoryName} 카테고리의 모든 게시글을 확인하세요.`,
    url: `/category/${slug}`,
  });

  // 비활성 카테고리(health, tech, education, lifestyle)는 noindex 처리
  if (!isActive) {
    meta.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  return meta;
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
        <p className="text-gray-600 mb-4">
          {categoryDescriptions[slug] || `${categoryName} 카테고리의 게시글 ${posts.length}개`}
        </p>
        <p className="text-sm text-gray-500">총 {posts.length}개의 글</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {relatedCategories[slug] && (
        <nav className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">다른 카테고리 둘러보기</h2>
          <div className="flex flex-wrap gap-3">
            {relatedCategories[slug].map((cat) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
