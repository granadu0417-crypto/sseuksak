import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '유용한 도구 모음 | 쓱싹',
  description: '연말정산 환급액 계산기, 연봉 실수령액 계산기, 수면 사이클 계산기, FIRE 은퇴 계산기 등 생활에 유용한 도구들을 무료로 이용하세요.',
};

const financeTools = [
  {
    slug: 'tax-refund-calculator',
    title: '연말정산 환급액 계산기',
    description: '2025년 귀속 연말정산 예상 환급액을 계산해요',
  },
  {
    slug: 'salary-calculator',
    title: '연봉 실수령액 계산기',
    description: '4대보험, 소득세 공제 후 실제 받는 월급을 계산해요',
  },
  {
    slug: 'true-hourly-wage',
    title: '진짜 시급 계산기',
    description: '출퇴근, 야근 포함한 실제 시급을 계산해요',
  },
  {
    slug: 'subscription-audit',
    title: '구독 서비스 총액 계산기',
    description: '내가 쓰는 구독 서비스 총액이 얼마인지 확인해요',
  },
  {
    slug: 'fire-calculator',
    title: 'FIRE 조기은퇴 계산기',
    description: '저축률과 투자수익률로 몇 살에 은퇴 가능한지 계산해요',
  },
];

const lifeTools = [
  {
    slug: 'alcohol-calculator',
    title: '알코올 분해 시간 계산기',
    description: '음주 후 운전 가능 시간을 계산해요',
  },
  {
    slug: 'sleep-calculator',
    title: '수면 사이클 계산기',
    description: '몇 시에 자면 몇 시에 일어나야 개운한지 알려드려요',
  },
  {
    slug: 'life-in-weeks',
    title: 'Life in Weeks',
    description: '당신의 인생을 주 단위로 시각화해요',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">유용한 도구 모음</h1>
        <p className="text-gray-600">생활에 도움이 되는 계산기와 도구들을 무료로 이용하세요.</p>
      </div>

      {/* 금융 계산기 */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">금융 계산기</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {financeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 라이프 도구 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">라이프 도구</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {lifeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
