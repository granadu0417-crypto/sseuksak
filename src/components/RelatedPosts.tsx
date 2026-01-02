import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';

interface RelatedPostsProps {
  posts: PostMeta[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">관련 게시글</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
