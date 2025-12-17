/**
 * 정당 지도부 스크래퍼
 *
 * 나무위키 및 공식 사이트에서 정당 당직자 정보를 수집
 *
 * 지원 정당:
 * - 더불어민주당 (theminjoo.kr)
 * - 국민의힘 (peoplepowerparty.kr)
 * - 조국혁신당 (rebuildingkoreaparty.kr)
 * - 개혁신당 (reformparty.kr)
 */

// 정당 코드 매핑
export const PARTY_CODES = {
  DEMOCRATIC: 'party_democratic',      // 더불어민주당
  PPP: 'party_ppp',                    // 국민의힘
  REBUILDING: 'party_rebuilding',      // 조국혁신당
  REFORM: 'party_reform',              // 개혁신당
} as const;

export type PartyCode = typeof PARTY_CODES[keyof typeof PARTY_CODES];

// 당직 유형
export const POSITION_TYPES = {
  PARTY_LEADER: 'pos_party_leader',           // 당대표
  FLOOR_LEADER: 'pos_floor_leader',           // 원내대표
  SUPREME_MEMBER: 'pos_supreme_member',       // 최고위원
  SENIOR_SUPREME: 'pos_senior_supreme',       // 수석최고위원
  SECRETARY_GENERAL: 'pos_secretary_general', // 사무총장
  DEPUTY_SECRETARY: 'pos_deputy_secretary',   // 사무부총장
  POLICY_CHAIR: 'pos_policy_chair',           // 정책위의장
  SPOKESPERSON: 'pos_spokesperson',           // 대변인
  CHIEF_SPOKESPERSON: 'pos_chief_spokesperson', // 수석대변인
  FLOOR_DEPUTY: 'pos_floor_deputy',           // 원내수석부대표
  FLOOR_SPOKESPERSON: 'pos_floor_spokesperson', // 원내대변인
  REGIONAL_CHAIR: 'pos_regional_chair',       // 시도당위원장
  EMERGENCY_CHAIR: 'pos_emergency_chair',     // 비상대책위원장
  EMERGENCY_MEMBER: 'pos_emergency_member',   // 비상대책위원
} as const;

export type PositionType = typeof POSITION_TYPES[keyof typeof POSITION_TYPES];

// 당직자 정보
export interface PartyPosition {
  partyId: string;
  positionTypeId: PositionType;
  positionName: string;
  politicianName: string;
  politicianId?: string;        // DB 매칭 후 채워짐
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  appointmentType: 'elected' | 'appointed' | 'interim';
  termNumber?: number;
  region?: string;              // 시도당위원장의 경우
  dataSource: string;
  sourceUrl?: string;
}

// 나무위키 URL 매핑
const NAMUWIKI_URLS: Record<PartyCode, string> = {
  [PARTY_CODES.DEMOCRATIC]: 'https://namu.wiki/w/더불어민주당/지도부',
  [PARTY_CODES.PPP]: 'https://namu.wiki/w/국민의힘/지도부',
  [PARTY_CODES.REBUILDING]: 'https://namu.wiki/w/조국혁신당/지도부',
  [PARTY_CODES.REFORM]: 'https://namu.wiki/w/개혁신당/지도부',
};

/**
 * 수동 입력용 현재 지도부 데이터 (2025년 12월 기준)
 *
 * 나무위키 스크래핑이 기술적으로 어려우므로
 * 수동 데이터 입력 후 주기적 업데이트 방식 사용
 */
export const CURRENT_LEADERSHIP: PartyPosition[] = [
  // ============================================
  // 더불어민주당
  // ============================================
  {
    partyId: PARTY_CODES.DEMOCRATIC,
    positionTypeId: POSITION_TYPES.PARTY_LEADER,
    positionName: '제8대 당대표',
    politicianName: '정청래',
    isCurrent: true,
    appointmentType: 'elected',
    termNumber: 8,
    startDate: '2025-08-02',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.DEMOCRATIC],
  },
  {
    partyId: PARTY_CODES.DEMOCRATIC,
    positionTypeId: POSITION_TYPES.FLOOR_LEADER,
    positionName: '제12대 원내대표',
    politicianName: '김병기',
    isCurrent: true,
    appointmentType: 'elected',
    termNumber: 12,
    startDate: '2025-06-13',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.DEMOCRATIC],
  },

  // 시도당위원장
  {
    partyId: PARTY_CODES.DEMOCRATIC,
    positionTypeId: POSITION_TYPES.REGIONAL_CHAIR,
    positionName: '서울시당위원장',
    politicianName: '장경태',
    isCurrent: true,
    appointmentType: 'elected',
    region: '서울',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.DEMOCRATIC],
  },
  {
    partyId: PARTY_CODES.DEMOCRATIC,
    positionTypeId: POSITION_TYPES.REGIONAL_CHAIR,
    positionName: '경기도당위원장',
    politicianName: '김승원',
    isCurrent: true,
    appointmentType: 'elected',
    region: '경기',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.DEMOCRATIC],
  },

  // ============================================
  // 국민의힘
  // ============================================
  {
    partyId: PARTY_CODES.PPP,
    positionTypeId: POSITION_TYPES.PARTY_LEADER,
    positionName: '제4대 당대표',
    politicianName: '장동혁',
    isCurrent: true,
    appointmentType: 'elected',
    termNumber: 4,
    startDate: '2025-08-26',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.PPP],
  },
  {
    partyId: PARTY_CODES.PPP,
    positionTypeId: POSITION_TYPES.FLOOR_LEADER,
    positionName: '제8대 원내대표',
    politicianName: '송언석',
    isCurrent: true,
    appointmentType: 'elected',
    termNumber: 8,
    startDate: '2025-06-16',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.PPP],
  },
  {
    partyId: PARTY_CODES.PPP,
    positionTypeId: POSITION_TYPES.SECRETARY_GENERAL,
    positionName: '사무총장',
    politicianName: '정점식',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.PPP],
  },
  {
    partyId: PARTY_CODES.PPP,
    positionTypeId: POSITION_TYPES.POLICY_CHAIR,
    positionName: '정책위의장',
    politicianName: '김정재',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.PPP],
  },
  {
    partyId: PARTY_CODES.PPP,
    positionTypeId: POSITION_TYPES.CHIEF_SPOKESPERSON,
    positionName: '수석대변인',
    politicianName: '곽규택',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.PPP],
  },

  // ============================================
  // 조국혁신당
  // ============================================
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.PARTY_LEADER,
    positionName: '당대표',
    politicianName: '조국',
    isCurrent: true,
    appointmentType: 'elected',
    startDate: '2024-03-03',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.FLOOR_LEADER,
    positionName: '원내대표',
    politicianName: '서왕진',
    isCurrent: true,
    appointmentType: 'elected',
    startDate: '2025-11-23',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.SENIOR_SUPREME,
    positionName: '수석최고위원',
    politicianName: '신장식',
    isCurrent: true,
    appointmentType: 'elected',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.SUPREME_MEMBER,
    positionName: '최고위원',
    politicianName: '정춘생',
    isCurrent: true,
    appointmentType: 'elected',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.SECRETARY_GENERAL,
    positionName: '사무총장',
    politicianName: '이해민',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.POLICY_CHAIR,
    positionName: '정책위의장',
    politicianName: '김준형',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },
  {
    partyId: PARTY_CODES.REBUILDING,
    positionTypeId: POSITION_TYPES.SPOKESPERSON,
    positionName: '대변인',
    politicianName: '안지훈',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REBUILDING],
  },

  // ============================================
  // 개혁신당
  // ============================================
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.PARTY_LEADER,
    positionName: '당대표',
    politicianName: '이준석',
    isCurrent: true,
    appointmentType: 'elected',
    startDate: '2024-02-02',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.FLOOR_LEADER,
    positionName: '원내대표',
    politicianName: '천하람',
    isCurrent: true,
    appointmentType: 'elected',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.SENIOR_SUPREME,
    positionName: '수석최고위원',
    politicianName: '김성열',
    isCurrent: true,
    appointmentType: 'elected',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.SUPREME_MEMBER,
    positionName: '최고위원',
    politicianName: '주이삭',
    isCurrent: true,
    appointmentType: 'elected',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.SUPREME_MEMBER,
    positionName: '최고위원',
    politicianName: '김정철',
    isCurrent: true,
    appointmentType: 'elected',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.SECRETARY_GENERAL,
    positionName: '사무총장',
    politicianName: '이기인',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.POLICY_CHAIR,
    positionName: '정책위의장',
    politicianName: '이주영',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
  {
    partyId: PARTY_CODES.REFORM,
    positionTypeId: POSITION_TYPES.CHIEF_SPOKESPERSON,
    positionName: '수석대변인',
    politicianName: '이동훈',
    isCurrent: true,
    appointmentType: 'appointed',
    dataSource: 'wiki',
    sourceUrl: NAMUWIKI_URLS[PARTY_CODES.REFORM],
  },
];

/**
 * 당직 ID 생성
 */
export function generatePartyPositionId(): string {
  return `ppos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 정당 코드로 정당 ID 조회 (DB용)
 */
export function getPartyDbId(partyCode: PartyCode): string {
  const mapping: Record<PartyCode, string> = {
    [PARTY_CODES.DEMOCRATIC]: 'party_democratic',
    [PARTY_CODES.PPP]: 'party_ppp',
    [PARTY_CODES.REBUILDING]: 'party_rebuilding',
    [PARTY_CODES.REFORM]: 'party_reform',
  };
  return mapping[partyCode] || partyCode;
}

/**
 * 정당별 현재 지도부 조회
 */
export function getCurrentLeadership(partyCode?: PartyCode): PartyPosition[] {
  if (partyCode) {
    return CURRENT_LEADERSHIP.filter(p => p.partyId === partyCode && p.isCurrent);
  }
  return CURRENT_LEADERSHIP.filter(p => p.isCurrent);
}

/**
 * 직책별 당직자 조회
 */
export function getPositionsByType(positionType: PositionType): PartyPosition[] {
  return CURRENT_LEADERSHIP.filter(p => p.positionTypeId === positionType && p.isCurrent);
}

/**
 * 특정 정치인의 당직 조회
 */
export function getPositionsByPolitician(politicianName: string): PartyPosition[] {
  return CURRENT_LEADERSHIP.filter(
    p => p.politicianName === politicianName && p.isCurrent
  );
}

/**
 * 모든 당대표 목록
 */
export function getAllPartyLeaders(): PartyPosition[] {
  return getPositionsByType(POSITION_TYPES.PARTY_LEADER);
}

/**
 * 모든 원내대표 목록
 */
export function getAllFloorLeaders(): PartyPosition[] {
  return getPositionsByType(POSITION_TYPES.FLOOR_LEADER);
}
