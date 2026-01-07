import Link from 'next/link';
import Image from 'next/image';
import type { PostMeta } from '@/lib/posts';
import { getPhotoForCategory, getOptimizedImageUrl, getAttribution } from '@/lib/unsplash';

interface PostCardProps {
  post: PostMeta;
}

const categoryLabels: Record<string, string> = {
  finance: '금융/투자',
  insurance: '보험/법률',
  health: '건강/의료',
  tech: 'IT/테크',
  education: '교육/자격증',
  lifestyle: '생활정보',
};

export default async function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch Unsplash image if no thumbnail provided
  let imageUrl: string | null = null;
  let attribution: { text: string; photographerUrl: string; unsplashUrl: string } | null = null;

  if (post.thumbnail) {
    // Use provided thumbnail (could be local or external URL)
    imageUrl = post.thumbnail;
  } else {
    // Fetch from Unsplash based on category and slug (slug ensures consistent image)
    const photo = await getPhotoForCategory(post.category, post.slug);
    if (photo) {
      imageUrl = getOptimizedImageUrl(photo, { width: 600, quality: 80 });
      attribution = getAttribution(photo);
    }
  }

  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {imageUrl && (
        <Link href={`/posts/${post.slug}`}>
          <div className="relative h-48 bg-gray-100">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            {attribution && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1 text-[10px] text-white/70">
                <a
                  href={attribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {attribution.text}
                </a>
              </div>
            )}
          </div>
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/category/${post.category}`}
            className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded"
          >
            {categoryLabels[post.category] || post.category}
          </Link>
          <span className="text-xs text-gray-400">{post.readingTime}</span>
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.description}
        </p>

        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-400" dateTime={post.date}>
            {formattedDate}
          </time>
          {post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="text-xs text-gray-500 hover:text-blue-600"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
