/**
 * 검증된 예산 항목 매칭 시스템
 *
 * 원칙: "거짓 없이 팩트로만"
 * - 법적 근거와 조사를 통해 검증된 매핑만 사용
 * - 불확실한 경우 매핑하지 않음
 * - 다른 사업을 같은 것으로 오인하는 것 방지
 */

import verifiedMappings from '@/data/verified-mappings.json';

export interface VerifiedMatch {
  isMatch: boolean;
  confidence: number;
  canonicalName: string;
  legalBasis: string;
  source: string;
  matchType: 'exact' | 'verified_alias' | 'pattern' | 'none';
  warning?: string;
}

export interface RejectionReason {
  isRejected: boolean;
  reason: string;
  explanation: Record<string, string>;
}

/**
 * 두 예산 항목이 동일한 사업인지 검증
 *
 * @param item1 첫 번째 항목명
 * @param item2 두 번째 항목명
 * @returns 매칭 결과 (검증 수준 포함)
 */
export function verifyBudgetItemMatch(item1: string, item2: string): VerifiedMatch {
  // 1. 정확히 같은 이름
  if (item1 === item2) {
    return {
      isMatch: true,
      confidence: 100,
      canonicalName: item1,
      legalBasis: '',
      source: '',
      matchType: 'exact'
    };
  }

  // 2. 거부된 매핑 체크 (절대 매핑하면 안 되는 항목들)
  const rejection = checkRejectedMapping(item1, item2);
  if (rejection.isRejected) {
    return {
      isMatch: false,
      confidence: 100, // 매칭이 아님이 확실
      canonicalName: '',
      legalBasis: '',
      source: '',
      matchType: 'none',
      warning: `⚠️ 매칭 불가: ${rejection.reason}`
    };
  }

  // 3. 검증된 매핑에서 찾기
  for (const mapping of verifiedMappings.verifiedMappings) {
    const aliases = mapping.aliases.map(a => a.name);

    // 둘 다 같은 매핑의 alias인가?
    const item1InAliases = aliases.some(alias =>
      normalizeItemName(item1) === normalizeItemName(alias)
    );
    const item2InAliases = aliases.some(alias =>
      normalizeItemName(item2) === normalizeItemName(alias)
    );

    if (item1InAliases && item2InAliases) {
      return {
        isMatch: true,
        confidence: mapping.confidence,
        canonicalName: mapping.canonicalName,
        legalBasis: mapping.legalBasis,
        source: mapping.source,
        matchType: 'verified_alias'
      };
    }
  }

  // 4. 명명 패턴 체크 (분담비율, 보조 표기 등)
  const patternMatch = checkNamingPattern(item1, item2);
  if (patternMatch.isMatch) {
    return patternMatch;
  }

  // 5. 매칭되지 않음
  return {
    isMatch: false,
    confidence: 0,
    canonicalName: '',
    legalBasis: '',
    source: '',
    matchType: 'none'
  };
}

/**
 * 항목명 정규화 (비교를 위해)
 */
function normalizeItemName(name: string): string {
  return name
    // 분담비율 제거: (80:10:10) 등
    .replace(/\(\d+(\.\d+)?:\d+(\.\d+)?:\d+(\.\d+)?\)/g, '')
    // (보조) 제거
    .replace(/\(보조\)/g, '')
    // 공백 정리
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 거부된 매핑 체크
 */
function checkRejectedMapping(item1: string, item2: string): RejectionReason {
  for (const rejection of verifiedMappings.rejectedMappings) {
    const items = [rejection.item1, rejection.item2];

    // 두 항목이 거부된 쌍에 해당하는지
    if (
      (item1.includes(items[0]) && item2.includes(items[1])) ||
      (item1.includes(items[1]) && item2.includes(items[0]))
    ) {
      return {
        isRejected: true,
        reason: rejection.reason,
        explanation: rejection.explanation
      };
    }
  }

  return { isRejected: false, reason: '', explanation: {} };
}

/**
 * 명명 패턴 체크 (자동 매칭 가능한 패턴)
 */
function checkNamingPattern(item1: string, item2: string): VerifiedMatch {
  const normalized1 = normalizeItemName(item1);
  const normalized2 = normalizeItemName(item2);

  // 정규화 후 같으면 패턴 차이만 있는 것
  if (normalized1 === normalized2) {
    // 어떤 패턴 차이인지 확인
    for (const pattern of verifiedMappings.namingPatterns) {
      if (pattern.autoMatch) {
        return {
          isMatch: true,
          confidence: pattern.confidence,
          canonicalName: normalized1,
          legalBasis: `명명 패턴: ${pattern.meaning}`,
          source: '',
          matchType: 'pattern'
        };
      }
    }
  }

  return {
    isMatch: false,
    confidence: 0,
    canonicalName: '',
    legalBasis: '',
    source: '',
    matchType: 'none'
  };
}

/**
 * 표준 이름(canonical name)으로 항목 찾기
 */
export function findByCanonicalName(canonicalName: string) {
  return verifiedMappings.verifiedMappings.find(
    m => m.canonicalName === canonicalName
  );
}

/**
 * 검증 대기 중인 항목인지 확인
 */
export function isPendingVerification(item1: string, item2: string): boolean {
  return verifiedMappings.pendingVerification.some(
    p =>
      (item1.includes(p.item1) && item2.includes(p.item2)) ||
      (item1.includes(p.item2) && item2.includes(p.item1))
  );
}

/**
 * 모든 검증된 매핑 가져오기
 */
export function getAllVerifiedMappings() {
  return verifiedMappings.verifiedMappings;
}

/**
 * 모든 거부된 매핑 가져오기
 */
export function getAllRejectedMappings() {
  return verifiedMappings.rejectedMappings;
}

/**
 * 항목에 대한 정보 조회
 */
export function getBudgetItemInfo(itemName: string) {
  const normalized = normalizeItemName(itemName);

  for (const mapping of verifiedMappings.verifiedMappings) {
    const matchingAlias = mapping.aliases.find(
      a => normalizeItemName(a.name) === normalized
    );

    if (matchingAlias) {
      return {
        canonicalName: mapping.canonicalName,
        definition: mapping.definition,
        legalBasis: mapping.legalBasis,
        sectionCode: mapping.sectionCode,
        sectionName: mapping.sectionName,
        source: mapping.source,
        verifiedDate: mapping.verifiedDate
      };
    }
  }

  return null;
}
