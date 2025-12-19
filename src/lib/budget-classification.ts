/**
 * 지방재정 기능별 분류체계 (지방재정법 제60조)
 *
 * 구조: 14개 분야 → 54개 부문 → 세항
 * 모든 지자체가 동일한 코드 체계를 사용하므로,
 * 코드 기반 매칭으로 명칭이 달라도 정확한 비교 가능
 */

// 분야 코드 (Field Code) - 14개 분야
export const FIELD_CODES = {
  '010': '일반공공행정',
  '020': '공공질서및안전',
  '050': '교육',
  '060': '문화및관광',
  '070': '환경',
  '080': '사회복지',
  '090': '보건',
  '100': '농림해양수산',
  '110': '산업·중소기업및에너지',
  '120': '수송및교통',
  '130': '국토및지역개발',
  '140': '과학기술',
  '150': '예비비',
  '160': '기타',
} as const;

// 부문 코드 (Section Code) - 54개 부문
export const SECTION_CODES = {
  // 010 일반공공행정
  '011': { name: '입법및선거관리', field: '010' },
  '012': { name: '지방행정·재정지원', field: '010' },
  '013': { name: '재정·금융', field: '010' },
  '014': { name: '일반행정', field: '010' },

  // 020 공공질서및안전
  '021': { name: '경찰', field: '020' },
  '022': { name: '재난방재·민방위', field: '020' },
  '023': { name: '소방', field: '020' },

  // 050 교육
  '051': { name: '유아및초중등교육', field: '050' },
  '052': { name: '고등교육', field: '050' },
  '053': { name: '평생·직업교육', field: '050' },

  // 060 문화및관광
  '061': { name: '문화예술', field: '060' },
  '062': { name: '관광', field: '060' },
  '063': { name: '체육', field: '060' },
  '064': { name: '문화재', field: '060' },
  '065': { name: '문화및관광일반', field: '060' },

  // 070 환경
  '071': { name: '상하수도·수질', field: '070' },
  '072': { name: '폐기물', field: '070' },
  '073': { name: '대기', field: '070' },
  '074': { name: '자연', field: '070' },
  '075': { name: '환경일반', field: '070' },

  // 080 사회복지
  '081': { name: '기초생활보장', field: '080' },
  '082': { name: '취약계층지원', field: '080' },
  '083': { name: '보육·가족및여성', field: '080' },
  '084': { name: '노인·청소년', field: '080' },
  '085': { name: '노동', field: '080' },
  '086': { name: '보훈', field: '080' },
  '087': { name: '주택', field: '080' },
  '088': { name: '사회복지일반', field: '080' },

  // 090 보건
  '091': { name: '보건의료', field: '090' },
  '092': { name: '식품의약안전', field: '090' },

  // 100 농림해양수산
  '101': { name: '농업·농촌', field: '100' },
  '102': { name: '임업·산촌', field: '100' },
  '103': { name: '해양수산·어촌', field: '100' },

  // 110 산업·중소기업및에너지
  '111': { name: '산업금융지원', field: '110' },
  '112': { name: '산업기술지원', field: '110' },
  '113': { name: '무역및투자유치', field: '110' },
  '114': { name: '산업진흥·고도화', field: '110' },
  '115': { name: '에너지및자원개발', field: '110' },
  '116': { name: '산업·중소기업일반', field: '110' },

  // 120 수송및교통
  '121': { name: '도로', field: '120' },
  '122': { name: '도시철도', field: '120' },
  '123': { name: '해운·항만', field: '120' },
  '124': { name: '항공·공항', field: '120' },
  '125': { name: '대중교통·물류등기타', field: '120' },

  // 130 국토및지역개발
  '131': { name: '수자원', field: '130' },
  '132': { name: '지역및도시', field: '130' },
  '133': { name: '산업단지', field: '130' },

  // 140 과학기술
  '141': { name: '기술개발', field: '140' },
  '142': { name: '과학기술일반', field: '140' },

  // 150 예비비
  '151': { name: '예비비', field: '150' },

  // 160 기타
  '161': { name: '기타', field: '160' },
} as const;

// 분야코드 타입
export type FieldCode = keyof typeof FIELD_CODES;
export type SectionCode = keyof typeof SECTION_CODES;

/**
 * 키워드 → 부문코드 매핑 테이블
 * 예산 항목명에서 키워드를 추출하여 부문코드를 추정
 */
export const KEYWORD_TO_SECTION: Record<string, SectionCode[]> = {
  // 080 사회복지
  '기초연금': ['084'],
  '노인': ['084'],
  '청소년': ['084'],
  '생계급여': ['081'],
  '주거급여': ['081', '087'],
  '보육': ['083'],
  '영유아': ['083'],
  '누리과정': ['083'],
  '아동수당': ['083'],
  '부모급여': ['083'],
  '영아수당': ['083'],
  '장애인': ['082'],
  '취약계층': ['082'],
  '자활': ['081', '085'],
  '사회복지': ['088'],
  '복지관': ['088'],
  '돌봄': ['083', '084'],

  // 090 보건
  '보건소': ['091'],
  '의료': ['091'],
  '병원': ['091'],
  '건강': ['091'],
  '예방접종': ['091'],
  '감염병': ['091'],
  '정신건강': ['091'],
  '식품': ['092'],
  '위생': ['092'],

  // 050 교육
  '교육': ['051', '053'],
  '학교': ['051'],
  '유아': ['051'],
  '평생교육': ['053'],
  '직업교육': ['053'],

  // 060 문화및관광
  '문화': ['061', '065'],
  '예술': ['061'],
  '공연': ['061'],
  '도서관': ['061'],
  '관광': ['062'],
  '체육': ['063'],
  '스포츠': ['063'],
  '문화재': ['064'],

  // 070 환경
  '상수도': ['071'],
  '하수도': ['071'],
  '수질': ['071'],
  '폐기물': ['072'],
  '쓰레기': ['072'],
  '청소': ['072'],
  '재활용': ['072'],
  '대기': ['073'],
  '환경': ['075'],
  '공원': ['074'],
  '녹지': ['074'],

  // 010 일반공공행정
  '인력운영': ['014'],
  '인건비': ['014'],
  '행정': ['014'],
  '청사': ['014'],
  '시설관리': ['014'],

  // 120 수송및교통
  '도로': ['121'],
  '교통': ['125'],
  '버스': ['125'],
  '지하철': ['122'],
  '주차': ['125'],

  // 130 국토및지역개발
  '도시': ['132'],
  '개발': ['132'],
  '정비': ['132'],
  '재개발': ['132'],
  '재건축': ['132'],

  // 020 공공질서및안전
  '방재': ['022'],
  '재난': ['022'],
  '안전': ['022'],
  '소방': ['023'],
  '민방위': ['022'],
};

/**
 * 예산 항목명에서 부문코드 추정
 * @param itemName 예산 항목명
 * @returns 추정된 부문코드와 신뢰도
 */
export function inferSectionCode(itemName: string): {
  code: SectionCode | null;
  confidence: number;
  matchedKeywords: string[];
} {
  const matchedKeywords: string[] = [];
  const codeScores: Record<string, number> = {};

  // 키워드 매칭
  for (const [keyword, codes] of Object.entries(KEYWORD_TO_SECTION)) {
    if (itemName.includes(keyword)) {
      matchedKeywords.push(keyword);
      for (const code of codes) {
        codeScores[code] = (codeScores[code] || 0) + keyword.length; // 긴 키워드에 가중치
      }
    }
  }

  if (Object.keys(codeScores).length === 0) {
    return { code: null, confidence: 0, matchedKeywords: [] };
  }

  // 가장 높은 점수의 코드 선택
  const sortedCodes = Object.entries(codeScores)
    .sort((a, b) => b[1] - a[1]);

  const bestCode = sortedCodes[0][0] as SectionCode;
  const bestScore = sortedCodes[0][1];
  const totalScore = sortedCodes.reduce((sum, [, score]) => sum + score, 0);

  // 신뢰도 계산 (0-1)
  const confidence = Math.min(bestScore / 10, 1) * (bestScore / totalScore);

  return {
    code: bestCode,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords
  };
}

/**
 * 두 예산 항목이 같은 부문인지 확인
 * @param item1 첫 번째 항목명
 * @param item2 두 번째 항목명
 * @returns 매칭 결과
 */
export function matchBudgetItems(item1: string, item2: string): {
  isMatch: boolean;
  confidence: number;
  section1: { code: SectionCode | null; name: string };
  section2: { code: SectionCode | null; name: string };
} {
  const result1 = inferSectionCode(item1);
  const result2 = inferSectionCode(item2);

  const section1 = {
    code: result1.code,
    name: result1.code ? SECTION_CODES[result1.code].name : '미분류'
  };

  const section2 = {
    code: result2.code,
    name: result2.code ? SECTION_CODES[result2.code].name : '미분류'
  };

  // 같은 부문코드면 매칭
  const isMatch = result1.code !== null && result1.code === result2.code;

  // 매칭 신뢰도 (두 항목의 신뢰도 평균)
  const confidence = isMatch
    ? (result1.confidence + result2.confidence) / 2
    : 0;

  return { isMatch, confidence, section1, section2 };
}

/**
 * 카테고리명을 분야코드로 변환
 */
export const CATEGORY_TO_FIELD: Record<string, FieldCode> = {
  'WELFARE': '080',
  'HEALTH': '090',
  'EDUCATION': '050',
  'CULTURE': '060',
  'ENVIRONMENT': '070',
  'ADMIN': '010',
  'TRANSPORT': '120',
  'SAFETY': '020',
  'ECONOMY': '110',
  'URBAN': '130',
};

/**
 * 분야코드를 카테고리명으로 변환
 */
export const FIELD_TO_CATEGORY: Record<string, string> = {
  '080': 'WELFARE',
  '090': 'HEALTH',
  '050': 'EDUCATION',
  '060': 'CULTURE',
  '070': 'ENVIRONMENT',
  '010': 'ADMIN',
  '120': 'TRANSPORT',
  '020': 'SAFETY',
  '110': 'ECONOMY',
  '130': 'URBAN',
};

/**
 * 유사 항목 찾기 (같은 부문 내에서)
 * @param targetItem 찾을 항목명
 * @param candidates 후보 항목 목록
 * @returns 유사 항목 목록 (신뢰도 순)
 */
export function findSimilarItems(
  targetItem: string,
  candidates: string[]
): { item: string; confidence: number; sectionCode: SectionCode | null }[] {
  const targetResult = inferSectionCode(targetItem);

  if (!targetResult.code) {
    return [];
  }

  const matches: { item: string; confidence: number; sectionCode: SectionCode | null }[] = [];

  for (const candidate of candidates) {
    const candidateResult = inferSectionCode(candidate);

    if (candidateResult.code === targetResult.code) {
      // 같은 부문 내 항목
      const avgConfidence = (targetResult.confidence + candidateResult.confidence) / 2;
      matches.push({
        item: candidate,
        confidence: avgConfidence,
        sectionCode: candidateResult.code
      });
    }
  }

  // 신뢰도 순 정렬
  return matches.sort((a, b) => b.confidence - a.confidence);
}
