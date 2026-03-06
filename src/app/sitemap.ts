import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sseuksak.com';

  // Static pages - 핵심 페이지만 포함
  // lastModified: 실제 마지막 수정일 기준 (new Date()는 매번 변경되어 크롤러에 비효율적)
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date('2026-02-10'),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'yearly' as const,
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

  // Category pages - 카테고리별 최신 게시글 날짜 기준
  const categories = getAllCategories();
  const categoryPages = categories.map((category) => {
    const categoryPosts = posts.filter((p) => p.category === category);
    const latestDate = categoryPosts.length > 0
      ? new Date(categoryPosts[0].date)
      : new Date('2026-02-01');
    return {
      url: `${baseUrl}/category/${category}`,
      lastModified: latestDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  // 태그 페이지 제외 - 크롤 예산 절약 (191개 → 0개)
  // 태그 페이지는 noindex 처리하여 검색엔진 색인에서 제외

  // Pagination pages - 최신 게시글 날짜 기준
  const latestPostDate = posts.length > 0 ? new Date(posts[0].date) : new Date('2026-02-01');
  const paginationPages = [
    {
      url: `${baseUrl}/posts`,
      lastModified: latestPostDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
  ];

  // Calendar page
  const calendarPages = [
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date('2026-01-20'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Tools pages - 전체 목록
  const toolsList = [
    'salary-calculator',
    'tax-refund-calculator',
    'fire-calculator',
    'sleep-calculator',
    'alcohol-calculator',
    'life-in-weeks',
    'true-hourly-wage',
    'subscription-audit',
    'bmi-calculator',
    'loan-calculator',
    'hourly-wage-calculator',
    'severance-calculator',
    'weekly-holiday-pay-calculator',
    'livelihood-benefit-calculator',
    'gift-tax-calculator',
    'pyeong-calculator',
    'age-calculator',
    'vat-calculator',
    'savings-interest-calculator',
    'unemployment-benefit-calculator',
    'health-insurance-calculator',
    'pension-calculator',
    'rent-conversion-calculator',
    'income-tax-calculator',
    'annual-leave-calculator',
    'housing-cost-simulator',
    'loan-repayment-simulator',
    'car-cost-simulator',
    'savings-goal-simulator',
  ];
  const toolsPages = [
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date('2026-03-05'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...toolsList.map((tool) => ({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: new Date('2026-03-05'),
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
      lastModified: new Date('2026-02-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...testsList.map((test) => ({
      url: `${baseUrl}/tests/${test}`,
      lastModified: new Date('2026-02-01'),
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
