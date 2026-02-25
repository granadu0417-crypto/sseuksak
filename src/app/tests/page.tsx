import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '금융 성향 테스트',
  description: '나의 소비유형과 재테크 성향을 알아보세요. 소비 습관 분석, 투자 스타일 진단으로 나에게 맞는 금융 전략을 찾아보세요.',
  keywords: ['소비유형테스트', '재테크성향테스트', '투자성향', '소비습관', '금융테스트'],
};

// 금융 관련 테스트만 표시
const TESTS = [
  {
    slug: 'spending-type',
    title: '소비유형 테스트',
    description: '나는 어떤 소비 스타일일까?',
    icon: '소비',
    duration: '2분',
    questions: 12,
    plays: '8,500',
    tags: ['인기', '재테크'],
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
  {
    slug: 'investment-style',
    title: '재테크 성향 테스트',
    description: '나는 어떤 투자 스타일일까?',
    icon: '투자',
    duration: '2분',
    questions: 12,
    plays: '5,200',
    tags: ['인기', '재테크'],
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-50 to-blue-50',
  },
];

// 준비 중인 테스트
const COMING_SOON = [
  {
    title: '절약 습관 진단 테스트',
    icon: '절약',
    tags: ['재테크'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: '보험 IQ 테스트',
    icon: '보험',
    tags: ['보험'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: '노후 준비도 테스트',
    icon: '연금',
    tags: ['재테크'],
    color: 'from-teal-500 to-green-500',
  },
];

export default function TestsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '테스트' }]} />
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">금융 성향 테스트</h1>
        <p className="text-gray-600">나의 소비 습관과 투자 성향을 알아보세요</p>
      </div>

      {/* 활성 테스트 목록 */}
      <div className="grid gap-4 mb-12">
        {TESTS.map((test) => (
          <Link
            key={test.slug}
            href={`/tests/${test.slug}`}
            className="block group"
          >
            <div className={`bg-gradient-to-r ${test.bgGradient} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]`}>
              <div className="flex items-start gap-4">
                {/* 아이콘 */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${test.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  {test.icon}
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {test.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${test.gradient} text-white`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                    {test.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">{test.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{test.duration}</span>
                    <span className="text-gray-300">|</span>
                    <span>{test.questions}문항</span>
                    <span className="text-gray-300">|</span>
                    <span>{test.plays}명 참여</span>
                  </div>
                </div>

                {/* 화살표 */}
                <div className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 준비 중인 테스트 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">준비 중인 테스트</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COMING_SOON.map((test, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-70"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${test.color} flex items-center justify-center text-white font-bold text-xs mb-3 opacity-80`}>
                {test.icon}
              </div>
              <h3 className="font-medium text-gray-700 mb-2">{test.title}</h3>
              <div className="flex gap-1">
                {test.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">준비중</p>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 border border-blue-100">
        <p className="font-medium">안내</p>
        <p className="text-blue-600 mt-1">테스트 결과는 참고용입니다. 실제 투자 결정은 전문가 상담을 권장합니다.</p>
      </div>
    </div>
  );
}
