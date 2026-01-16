import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sseuksak.com';

  // Static pages - 핵심 페이지만 포함
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic post pages - 최고 우선순위 (핵심 콘텐츠)
  const posts = getAllPosts();
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // 게시글 우선순위 상향
  }));

  // Category pages - 중요 네비게이션
  const categories = getAllCategories();
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 태그 페이지 제외 - 크롤 예산 절약 (191개 → 0개)
  // 태그 페이지는 noindex 처리하여 검색엔진 색인에서 제외

  // Pagination pages - 첫 페이지만 포함
  const paginationPages = [
    {
      url: `${baseUrl}/posts/page/1`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
  ];

  // Calendar page
  const calendarPages = [
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Tools pages
  const toolsList = [
    'salary-calculator',
    'tax-refund-calculator',
    'fire-calculator',
    'sleep-calculator',
    'alcohol-calculator',
    'life-in-weeks',
    'true-hourly-wage',
    'subscription-audit',
  ];
  const toolsPages = [
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...toolsList.map((tool) => ({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  // Tests pages
  const testsList = [
    'mental-age',
    'spending-type',
    'burnout-risk',
    'investment-style',
    'love-style',
    'office-animal',
    'fortune-2026',
    'sleep-type',
    'caffeine-dependency',
    'sns-fatigue',
  ];
  const testsPages = [
    {
      url: `${baseUrl}/tests`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...testsList.map((test) => ({
      url: `${baseUrl}/tests/${test}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticPages,
    ...postPages,
    ...categoryPages,
    // tagPages 제외 - noindex 처리됨
    ...paginationPages,
    ...calendarPages,
    ...toolsPages,
    ...testsPages,
  ];
}
