// 도구 및 테스트 데이터 (내부 링크 연결용)

export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: 'finance' | 'lifestyle';
  keywords: string[]; // 관련 키워드
}

export interface Test {
  slug: string;
  title: string;
  description: string;
  keywords: string[]; // 관련 키워드
  gradient: string;
}

export const TOOLS: Tool[] = [
  {
    slug: 'tax-refund-calculator',
    title: '연말정산 환급액 계산기',
    description: '2025년 귀속 연말정산 예상 환급액을 계산해요',
    category: 'finance',
    keywords: ['연말정산', '환급', '세금', '소득공제', '세액공제'],
  },
  {
    slug: 'salary-calculator',
    title: '연봉 실수령액 계산기',
    description: '4대보험, 소득세 공제 후 실제 받는 월급을 계산해요',
    category: 'finance',
    keywords: ['연봉', '월급', '실수령', '4대보험', '소득세'],
  },
  {
    slug: 'true-hourly-wage',
    title: '진짜 시급 계산기',
    description: '출퇴근, 야근 포함한 실제 시급을 계산해요',
    category: 'finance',
    keywords: ['시급', '야근', '출퇴근', '월급'],
  },
  {
    slug: 'subscription-audit',
    title: '구독 서비스 총액 계산기',
    description: '내가 쓰는 구독 서비스 총액이 얼마인지 확인해요',
    category: 'finance',
    keywords: ['구독', '넷플릭스', '유튜브', '지출'],
  },
  {
    slug: 'fire-calculator',
    title: 'FIRE 조기은퇴 계산기',
    description: '저축률과 투자수익률로 몇 살에 은퇴 가능한지 계산해요',
    category: 'finance',
    keywords: ['파이어', '은퇴', '재테크', '투자', '저축'],
  },
  {
    slug: 'alcohol-calculator',
    title: '알코올 분해 시간 계산기',
    description: '음주 후 운전 가능 시간을 계산해요',
    category: 'lifestyle',
    keywords: ['술', '음주', '알코올', '운전', '숙취'],
  },
  {
    slug: 'sleep-calculator',
    title: '수면 사이클 계산기',
    description: '몇 시에 자면 몇 시에 일어나야 개운한지 알려드려요',
    category: 'lifestyle',
    keywords: ['수면', '잠', '기상', '건강', '숙면'],
  },
  {
    slug: 'life-in-weeks',
    title: 'Life in Weeks',
    description: '당신의 인생을 주 단위로 시각화해요',
    category: 'lifestyle',
    keywords: ['인생', '시간', '나이', '생활'],
  },
];

export const TESTS: Test[] = [
  {
    slug: 'mental-age',
    title: '정신연령 테스트',
    description: '실제 나이와 다른 나의 정신연령은?',
    keywords: ['정신연령', '나이', '성격', '심리'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    slug: 'spending-type',
    title: '소비유형 테스트',
    description: '나는 어떤 소비 스타일일까?',
    keywords: ['소비', '지출', '돈', '재테크', '쇼핑'],
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    slug: 'investment-style',
    title: '재테크 성향 테스트',
    description: '나는 어떤 투자 스타일일까?',
    keywords: ['투자', '재테크', '주식', '저축', '자산'],
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    slug: 'love-style',
    title: '연애스타일 테스트',
    description: '나는 어떤 연애 유형일까?',
    keywords: ['연애', '사랑', '데이트', '관계'],
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    slug: 'office-animal',
    title: '회사에서 나는 무슨 동물?',
    description: '직장에서 나의 동물 유형은?',
    keywords: ['직장', '회사', '업무', '동료', '사무실'],
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    slug: 'fortune-2026',
    title: '2026 나의 운세 키워드',
    description: '올해 나를 이끌어줄 키워드는?',
    keywords: ['운세', '신년', '2026', '새해'],
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    slug: 'burnout-risk',
    title: '번아웃 위험도 테스트',
    description: '나의 에너지 레벨은 안전할까?',
    keywords: ['번아웃', '스트레스', '피로', '직장', '멘탈'],
    gradient: 'from-red-500 to-orange-500',
  },
];

// 카테고리별 관련 도구 매핑
const CATEGORY_TOOL_MAP: Record<string, string[]> = {
  finance: ['tax-refund-calculator', 'salary-calculator', 'fire-calculator', 'true-hourly-wage', 'subscription-audit'],
  health: ['sleep-calculator', 'alcohol-calculator'],
  lifestyle: ['life-in-weeks', 'sleep-calculator'],
  insurance: ['salary-calculator'],
  education: [],
  tech: [],
};

// 카테고리별 관련 테스트 매핑
const CATEGORY_TEST_MAP: Record<string, string[]> = {
  finance: ['spending-type', 'investment-style'],
  health: ['burnout-risk'],
  lifestyle: ['mental-age', 'love-style'],
  insurance: [],
  education: [],
  tech: [],
};

// 게시글 태그/제목 기반으로 관련 도구 찾기
export function getRelatedTools(category: string, tags: string[], title: string, maxCount = 2): Tool[] {
  const categoryTools = CATEGORY_TOOL_MAP[category] || [];
  const relatedSlugs = new Set<string>(categoryTools);

  // 태그 및 제목 키워드 매칭
  const searchTerms = [...tags, ...title.split(' ')].map((t) => t.toLowerCase());

  for (const tool of TOOLS) {
    for (const keyword of tool.keywords) {
      if (searchTerms.some((term) => term.includes(keyword) || keyword.includes(term))) {
        relatedSlugs.add(tool.slug);
      }
    }
  }

  // 관련된 도구만 필터링
  const related = TOOLS.filter((tool) => relatedSlugs.has(tool.slug));

  // 최대 개수 제한
  return related.slice(0, maxCount);
}

// 게시글 태그/제목 기반으로 관련 테스트 찾기
export function getRelatedTests(category: string, tags: string[], title: string, maxCount = 2): Test[] {
  const categoryTests = CATEGORY_TEST_MAP[category] || [];
  const relatedSlugs = new Set<string>(categoryTests);

  // 태그 및 제목 키워드 매칭
  const searchTerms = [...tags, ...title.split(' ')].map((t) => t.toLowerCase());

  for (const test of TESTS) {
    for (const keyword of test.keywords) {
      if (searchTerms.some((term) => term.includes(keyword) || keyword.includes(term))) {
        relatedSlugs.add(test.slug);
      }
    }
  }

  // 관련된 테스트만 필터링
  const related = TESTS.filter((test) => relatedSlugs.has(test.slug));

  // 최대 개수 제한
  return related.slice(0, maxCount);
}
