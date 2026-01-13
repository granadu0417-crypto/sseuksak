import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '심리테스트 - 재미있는 테스트 모음 | 쓱삭',
  description: '정신연령 테스트, 소비유형 테스트 등 다양한 심리테스트를 즐겨보세요. 친구들과 결과를 공유하고 비교해보세요!',
  keywords: ['심리테스트', '성격테스트', '정신연령', '소비유형', '재테크성향', '재미있는 테스트'],
};

// 테스트 목록
const TESTS = [
  {
    slug: 'mental-age',
    title: '정신연령 테스트',
    description: '실제 나이와 다른 나의 정신연령은?',
    icon: '정신',
    duration: '2분',
    questions: 12,
    plays: '1.2만',
    tags: ['인기', '성격'],
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
  },
  {
    slug: 'spending-type',
    title: '소비유형 테스트',
    description: '나는 어떤 소비 스타일일까?',
    icon: '소비',
    duration: '2분',
    questions: 12,
    plays: '8,500',
    tags: ['신규', '재테크'],
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
  },
];

// 준비 중인 테스트
const COMING_SOON = [
  {
    title: '회사에서 나는 무슨 동물?',
    icon: '동물',
    tags: ['직장인'],
    color: 'from-orange-500 to-yellow-500',
  },
  {
    title: '2026 나의 운세 키워드',
    icon: '운세',
    tags: ['신년'],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: '번아웃 위험도 테스트',
    icon: '번아웃',
    tags: ['멘탈'],
    color: 'from-red-500 to-orange-500',
  },
];

export default function TestsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">심리테스트</h1>
        <p className="text-gray-600">재미로 즐기는 다양한 테스트</p>
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
        <p className="text-blue-600 mt-1">테스트 결과는 재미로만 봐주세요! 실제 성격이나 능력과 무관합니다.</p>
      </div>
    </div>
  );
}
