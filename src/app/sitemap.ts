import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories, getAllTags, getTotalPages } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sseuksak.com';

  // Static pages
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
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic post pages
  const posts = getAllPosts();
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Category pages
  const categories = getAllCategories();
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Tag pages
  const tags = getAllTags();
  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Pagination pages for posts list
  const totalPages = getTotalPages();
  const paginationPages = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/posts/page/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: i === 0 ? 0.7 : 0.5,
  }));

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
    ...tagPages,
    ...paginationPages,
    ...calendarPages,
    ...toolsPages,
    ...testsPages,
  ];
}
