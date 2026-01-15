import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '심리테스트 - 재미있는 테스트 모음 | 쓱삭',
  description: 'SNS 피로도 테스트, 카페인 의존도 테스트, 수면 유형 테스트, 번아웃 위험도 테스트 등 다양한 심리테스트를 즐겨보세요. 친구들과 결과를 공유하고 비교해보세요!',
  keywords: ['심리테스트', '성격테스트', 'SNS피로도', '디지털디톡스', '카페인의존도', '수면유형', '정신연령', '번아웃테스트', '재미있는 테스트'],
};

// 테스트 목록
const TESTS = [
  {
    slug: 'sleep-type',
    title: '수면 유형 테스트',
    description: '나는 사자형? 곰형? 늑대형? 돌고래형?',
    icon: '수면',
    duration: '2분',
    questions: 12,
    plays: '850',
    tags: ['신규', '건강'],
    gradient: 'from-indigo-500 to-cyan-500',
    bgGradient: 'from-indigo-50 to-cyan-50',
  },
  {
    slug: 'caffeine-dependency',
    title: '카페인 의존도 테스트',
    description: '나는 자유인? 애호가? 의존자? 중독 위험?',
    icon: '커피',
    duration: '2분',
    questions: 12,
    plays: '620',
    tags: ['신규', '건강'],
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
  },
  {
    slug: 'sns-fatigue',
    title: 'SNS 피로도 테스트',
    description: '나는 디지털 균형파? SNS 피로 상태?',
    icon: 'SNS',
    duration: '2분',
    questions: 12,
    plays: '480',
    tags: ['신규', '멘탈'],
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
  },
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
    tags: ['재테크'],
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
    tags: ['재테크'],
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-50 to-blue-50',
  },
  {
    slug: 'love-style',
    title: '연애스타일 테스트',
    description: '나는 어떤 연애 유형일까?',
    icon: '연애',
    duration: '2분',
    questions: 12,
    plays: '3,800',
    tags: ['연애'],
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
  },
  {
    slug: 'office-animal',
    title: '회사에서 나는 무슨 동물?',
    description: '직장에서 나의 동물 유형은?',
    icon: '동물',
    duration: '2분',
    questions: 12,
    plays: '2,100',
    tags: ['신규', '직장인'],
    gradient: 'from-orange-500 to-yellow-500',
    bgGradient: 'from-orange-50 to-yellow-50',
  },
  {
    slug: 'fortune-2026',
    title: '2026 나의 운세 키워드',
    description: '올해 나를 이끌어줄 키워드는?',
    icon: '운세',
    duration: '2분',
    questions: 12,
    plays: '1,500',
    tags: ['신규', '신년'],
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-50 to-purple-50',
  },
  {
    slug: 'burnout-risk',
    title: '번아웃 위험도 테스트',
    description: '나의 에너지 레벨은 안전할까?',
    icon: '번아웃',
    duration: '2분',
    questions: 12,
    plays: '4,200',
    tags: ['신규', '멘탈'],
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-50 to-orange-50',
  },
];

// 준비 중인 테스트
const COMING_SOON = [
  {
    title: 'MBTI 궁합 테스트',
    icon: 'MBTI',
    tags: ['성격'],
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: '나의 전생 직업은?',
    icon: '전생',
    tags: ['운세'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    title: '스트레스 해소법 추천',
    icon: '힐링',
    tags: ['멘탈'],
    color: 'from-teal-500 to-green-500',
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
