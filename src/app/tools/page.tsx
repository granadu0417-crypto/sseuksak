import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '유용한 도구 모음 | 쓱싹',
  description: '수면 사이클 계산기, FIRE 은퇴 계산기, 진짜 시급 계산기 등 생활에 유용한 도구들을 무료로 이용하세요.',
};

const tools = [
  {
    slug: 'sleep-calculator',
    title: '수면 사이클 계산기',
    description: '몇 시에 자면 몇 시에 일어나야 개운한지 알려드려요',
    category: '건강',
  },
  {
    slug: 'fire-calculator',
    title: 'FIRE 조기은퇴 계산기',
    description: '저축률과 투자수익률로 몇 살에 은퇴 가능한지 계산해요',
    category: '금융',
  },
  {
    slug: 'life-in-weeks',
    title: 'Life in Weeks',
    description: '당신의 인생을 주 단위로 시각화해요',
    category: '라이프',
  },
  {
    slug: 'true-hourly-wage',
    title: '진짜 시급 계산기',
    description: '출퇴근, 야근 포함한 실제 시급을 계산해요',
    category: '금융',
  },
  {
    slug: 'subscription-audit',
    title: '구독 서비스 총액 계산기',
    description: '내가 쓰는 구독 서비스 총액이 얼마인지 확인해요',
    category: '금융',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">유용한 도구 모음</h1>
        <p className="text-gray-600">생활에 도움이 되는 계산기와 도구들을 무료로 이용하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div>
              <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mb-2">
                {tool.category}
              </span>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{tool.title}</h2>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
