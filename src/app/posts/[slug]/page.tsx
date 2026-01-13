import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import {
  getPostBySlug,
  getAllPosts,
  getAdjacentPosts,
  getRelatedPosts,
} from '@/lib/posts';
import { generateMetadata as genMeta, generateArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/metadata';
import { getPhotoForCategory, getOptimizedImageUrl, getAttribution } from '@/lib/unsplash';
import Breadcrumb from '@/components/Breadcrumb';
import PostNavigation from '@/components/PostNavigation';
import RelatedPosts from '@/components/RelatedPosts';
import TableOfContents from '@/components/TableOfContents';

// ISR: 24시간마다 재생성
export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  // Get OG image - use thumbnail if exists, otherwise fetch from Unsplash
  let ogImage: string | undefined = post.thumbnail;

  if (!ogImage || !ogImage.startsWith('http')) {
    // Use category and slug for consistent Unsplash image
    const photo = await getPhotoForCategory(post.category || 'lifestyle', slug);
    if (photo) {
      ogImage = getOptimizedImageUrl(photo, { width: 1200, quality: 85 });
    }
  }

  return genMeta({
    title: post.title,
    description: post.description,
    keywords: post.tags,
    image: ogImage,
    url: `/posts/${slug}`,
    type: 'article',
    publishedTime: post.date,
    section: post.category,
    tags: post.tags,
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(slug);
  const relatedPosts = getRelatedPosts(slug, 3);

  // Fetch hero image from Unsplash (using slug for consistent image)
  let heroImageUrl: string | null = null;
  let heroAttribution: { text: string; photographerUrl: string; unsplashUrl: string } | null = null;

  if (post.thumbnail && post.thumbnail.startsWith('http')) {
    heroImageUrl = post.thumbnail;
  } else {
    // Use category and slug for consistent Unsplash image
    const photo = await getPhotoForCategory(post.category || 'lifestyle', slug);
    if (photo) {
      heroImageUrl = getOptimizedImageUrl(photo, { width: 1200, quality: 85 });
      heroAttribution = getAttribution(photo);
    }
  }

  const articleJsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.description,
    url: `/posts/${slug}`,
    image: heroImageUrl || post.thumbnail,
    publishedTime: post.date,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: post.category, url: `/category/${post.category}` },
    { name: post.title, url: `/posts/${slug}` },
  ]);

  const formattedDate = new Date(post.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { name: post.category, href: `/category/${post.category}` },
            { name: post.title },
          ]}
        />

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <time dateTime={post.date}>{formattedDate}</time>
            <span>{post.readingTime}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/tag/${tag}`}
                  className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}
        </header>

        {heroImageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={heroImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority
            />
            {heroAttribution && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2 text-xs text-white/80">
                <a
                  href={heroAttribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {heroAttribution.text}
                </a>
              </div>
            )}
          </div>
        )}

        <TableOfContents content={post.content} />

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <PostNavigation prev={prev} next={next} />
        <RelatedPosts posts={relatedPosts} />
      </article>
    </>
  );
}
