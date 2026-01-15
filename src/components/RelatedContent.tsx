import Link from 'next/link';
import type { Tool, Test } from '@/lib/related-content';

interface RelatedContentProps {
  tools: Tool[];
  tests: Test[];
}

export default function RelatedContent({ tools, tests }: RelatedContentProps) {
  if (tools.length === 0 && tests.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      {/* 관련 도구 */}
      {tools.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">관련 도구</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {tool.description}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 관련 테스트 */}
      {tests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">관련 테스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <Link
                key={test.slug}
                href={`/tests/${test.slug}`}
                className="group flex items-start gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${test.gradient} rounded-lg flex items-center justify-center`}>
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {test.description}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
