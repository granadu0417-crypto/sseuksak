import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';

interface PostNavigationProps {
  prev: PostMeta | null;
  next: PostMeta | null;
}

export default function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="border-t border-gray-200 pt-8 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="group flex flex-col p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <span className="text-sm text-gray-500 mb-1">이전 글</span>
            <span className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="group flex flex-col p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-right"
          >
            <span className="text-sm text-gray-500 mb-1">다음 글</span>
            <span className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
