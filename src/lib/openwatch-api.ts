/**
 * OpenWatch API 연동 서비스
 *
 * 국회의원 자산정보 및 정치후원금 데이터를 가져옵니다.
 * 다중 소스 크로스체크를 위한 민간 데이터 활용
 *
 * API 문서: https://docs.openwatch.kr/api
 */

// =====================================
// 자산정보 API
// https://openwatch.kr/api/national-assembly/assets
// =====================================

// 자산정보 API 응답 타입
interface AssetsApiResponse {
  pagination: {
    totalCount: number;
  };
  rows: AssetRaw[];
}

// 자산정보 원본 데이터
export interface AssetRaw {
  id: number;
  type: string;               // 자산 유형 (건물, 토지, 증권, 예금 등)
  relation: string;           // 관계인 (본인, 배우자, 부, 모 등)
  detail: string;             // 위치/상세 정보
  originValuation: number;    // 종전가액 (천원)
  increasedAmount: number;    // 증감액 (천원)
  currentValuation: number;   // 현재가액 (천원)
  kind: string;               // 상세 종류 (아파트, 대지 등)
  reason: string;             // 변동 사유
  // Note: API에서 date, memberName 등 추가 필드가 있을 수 있음
}

// 정제된 자산 데이터
export interface AssetData {
  openwatchId: number;
  assetType: string;
  relation: string;
  kind: string | null;
  detail: string;
  originValuation: number;
  increasedAmount: number;
  currentValuation: number;
  changeReason: string | null;
  reportDate: string;         // YYYYMM 형식
}

/**
 * OpenWatch 자산정보 API 클라이언트
 */
export class OpenWatchAssetClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://openwatch.kr/api/national-assembly';
  }

  /**
   * 자산정보 목록 조회
   * @param date 신고 기준일 (YYYYMM 형식, 예: 202303)
   * @param type 자산 유형 (건물, 토지, 증권, 예금 등)
   * @param relation 관계인 (본인, 배우자 등)
   * @param page 페이지 번호
   * @param pageSize 페이지당 건수
   */
  async getAssets(
    date?: string,
    type?: string,
    relation?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<{ assets: AssetRaw[]; totalCount: number }> {
    const url = new URL(`${this.baseUrl}/assets`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(Math.min(pageSize, 100)));

    if (date) url.searchParams.set('date', date);
    if (type) url.searchParams.set('type', type);
    if (relation) url.searchParams.set('relation', relation);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenWatch 자산 API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as AssetsApiResponse;
      return {
        assets: data.rows || [],
        totalCount: data.pagination?.totalCount || 0,
      };
    } catch (error) {
      console.error('OpenWatch 자산 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 전체 자산정보 조회 (페이지네이션 자동 처리)
   */
  async getAllAssets(date?: string): Promise<AssetRaw[]> {
    const allAssets: AssetRaw[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      console.log(`OpenWatch 자산정보 ${page}페이지 조회 중...`);
      const { assets, totalCount } = await this.getAssets(date, undefined, undefined, page, pageSize);

      if (assets.length === 0) break;

      allAssets.push(...assets);

      if (allAssets.length >= totalCount || assets.length < pageSize) break;

      page++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

      // 안전장치 (최대 100페이지)
      if (page > 100) {
        console.warn('자산정보 최대 페이지 수 초과, 중단');
        break;
      }
    }

    console.log(`총 ${allAssets.length}개 자산정보 조회 완료`);
    return allAssets;
  }
}

// =====================================
// 정치후원금 API
// https://openwatch.kr/api/political-contributions
// =====================================

// 정치후원금 총액 API 응답 타입
interface ContributionTotalsResponse {
  pagination: {
    totalCount: number;
  };
  rows: ContributionTotalRaw[];
}

// 정치후원금 총액 원본 데이터
export interface ContributionTotalRaw {
  id: number;
  type: string;                // LOCAL_ASSEMBLY, NATIONAL_ASSEMBLY, PRESIDENT
  sido: string | null;         // 시도
  sigungu: string | null;      // 시군구
  year: number;                // 연도
  electoralDisctrict: string;  // 선거구 (API 오타: electoralDisctrict)
  candidate: string;           // 후보자명
  candidateType: string;       // 후보자 유형
  partyName: string;           // 정당명
  amount: number;              // 총 모금액 (원)
}

// 정치후원금 고액후원자 API 응답 타입
interface ContributionDonorsResponse {
  pagination: {
    totalCount: number;
  };
  rows: ContributionDonorRaw[];
}

// 고액후원자 원본 데이터
export interface ContributionDonorRaw {
  id: number;
  year: string;                // 연도 (문자열)
  type: string;                // 유형
  sido: string;                // 시도
  sigungu: string;             // 시군구
  candidate: string;           // 후보자명
  candidateType: string;       // 후보자 유형
  electionTitle: string;       // 선거명
  electoralDistrict: string;   // 선거구
  amount: number;              // 후원금액 (원)
  contributorName: string;     // 후원자명
  address: string;             // 주소
  contributorBirthdate: string; // 생년월일
  job: string;                 // 직업
  contributionDate: string;    // 후원일
  partyName: string;           // 정당명
}

// 정제된 후원금 총액 데이터
export interface ContributionTotalData {
  openwatchId: number;
  type: string;
  sido: string | null;
  sigungu: string | null;
  year: number;
  electoralDistrict: string;
  candidateName: string;
  candidateType: string;
  partyName: string;
  totalAmount: number;
}

// 정제된 고액후원자 데이터
export interface ContributionDonorData {
  openwatchId: number;
  year: number;
  type: string;
  candidateName: string;
  donorName: string;
  amount: number;
  contributionDate: string | null;
  address: string | null;
  job: string | null;
  donorBirthdate: string | null;
  partyName: string;
}

/**
 * OpenWatch 정치후원금 API 클라이언트
 */
export class OpenWatchContributionClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://openwatch.kr/api/political-contributions';
  }

  /**
   * 정치후원금 총액 조회
   * @param type 유형 (NATIONAL_ASSEMBLY, LOCAL_ASSEMBLY, PRESIDENT)
   * @param candidate 후보자명
   * @param partyName 정당명
   * @param page 페이지 번호
   * @param pageSize 페이지당 건수
   */
  async getTotals(
    type: string = 'NATIONAL_ASSEMBLY',
    candidate?: string,
    partyName?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<{ totals: ContributionTotalRaw[]; totalCount: number }> {
    const url = new URL(`${this.baseUrl}/totals`);
    url.searchParams.set('type', type);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(Math.min(pageSize, 100)));

    if (candidate) url.searchParams.set('candidate', candidate);
    if (partyName) url.searchParams.set('partyName', partyName);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenWatch 후원금 총액 API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as ContributionTotalsResponse;
      return {
        totals: data.rows || [],
        totalCount: data.pagination?.totalCount || 0,
      };
    } catch (error) {
      console.error('OpenWatch 후원금 총액 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 국회의원 전체 후원금 총액 조회
   */
  async getAllNationalAssemblyTotals(): Promise<ContributionTotalRaw[]> {
    const allTotals: ContributionTotalRaw[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      console.log(`OpenWatch 후원금 총액 ${page}페이지 조회 중...`);
      const { totals, totalCount } = await this.getTotals('NATIONAL_ASSEMBLY', undefined, undefined, page, pageSize);

      if (totals.length === 0) break;

      allTotals.push(...totals);

      if (allTotals.length >= totalCount || totals.length < pageSize) break;

      page++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

      // 안전장치
      if (page > 100) {
        console.warn('후원금 총액 최대 페이지 수 초과, 중단');
        break;
      }
    }

    console.log(`총 ${allTotals.length}개 후원금 총액 조회 완료`);
    return allTotals;
  }

  /**
   * 고액후원자 목록 조회
   * @param type 유형
   * @param candidate 후보자명
   * @param page 페이지 번호
   * @param pageSize 페이지당 건수
   */
  async getDonors(
    type: string = 'NATIONAL_ASSEMBLY',
    candidate?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<{ donors: ContributionDonorRaw[]; totalCount: number }> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('type', type);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(Math.min(pageSize, 100)));

    if (candidate) url.searchParams.set('candidate', candidate);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenWatch 고액후원자 API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as ContributionDonorsResponse;
      return {
        donors: data.rows || [],
        totalCount: data.pagination?.totalCount || 0,
      };
    } catch (error) {
      console.error('OpenWatch 고액후원자 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 후보자의 고액후원자 조회
   */
  async getDonorsForCandidate(candidateName: string): Promise<ContributionDonorRaw[]> {
    const allDonors: ContributionDonorRaw[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      const { donors, totalCount } = await this.getDonors('NATIONAL_ASSEMBLY', candidateName, page, pageSize);

      if (donors.length === 0) break;

      allDonors.push(...donors);

      if (allDonors.length >= totalCount || donors.length < pageSize) break;

      page++;
      await new Promise(resolve => setTimeout(resolve, 300));

      if (page > 20) break;
    }

    return allDonors;
  }
}

// =====================================
// 데이터 변환 유틸리티
// =====================================

/**
 * 자산 원본 데이터를 정제된 형태로 변환
 */
export function transformAssetData(raw: AssetRaw, reportDate: string): AssetData {
  return {
    openwatchId: raw.id,
    assetType: raw.type?.trim() || '기타',
    relation: raw.relation?.trim() || '본인',
    kind: raw.kind?.trim() || null,
    detail: raw.detail?.trim() || '',
    originValuation: raw.originValuation || 0,
    increasedAmount: raw.increasedAmount || 0,
    currentValuation: raw.currentValuation || 0,
    changeReason: raw.reason?.trim() || null,
    reportDate,
  };
}

/**
 * 후원금 총액 원본 데이터를 정제된 형태로 변환
 */
export function transformContributionTotalData(raw: ContributionTotalRaw): ContributionTotalData {
  return {
    openwatchId: raw.id,
    type: raw.type,
    sido: raw.sido || null,
    sigungu: raw.sigungu || null,
    year: raw.year,
    electoralDistrict: raw.electoralDisctrict?.trim() || '', // API 오타 처리
    candidateName: raw.candidate?.trim() || '',
    candidateType: raw.candidateType?.trim() || '',
    partyName: raw.partyName?.trim() || '',
    totalAmount: raw.amount || 0,
  };
}

/**
 * 고액후원자 원본 데이터를 정제된 형태로 변환
 */
export function transformDonorData(raw: ContributionDonorRaw): ContributionDonorData {
  return {
    openwatchId: raw.id,
    year: parseInt(raw.year) || 0,
    type: raw.type,
    candidateName: raw.candidate?.trim() || '',
    donorName: raw.contributorName?.trim() || '',
    amount: raw.amount || 0,
    contributionDate: raw.contributionDate || null,
    address: raw.address?.trim() || null,
    job: raw.job?.trim() || null,
    donorBirthdate: raw.contributorBirthdate || null,
    partyName: raw.partyName?.trim() || '',
  };
}

// =====================================
// ID 생성 유틸리티
// =====================================

export function generateAssetId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAssetSummaryId(): string {
  return `assum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateContributionId(): string {
  return `contr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateDonorId(): string {
  return `donor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateContributionSummaryId(): string {
  return `csum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================
// 자산 유형 분류
// =====================================

export const ASSET_TYPES = {
  REAL_ESTATE: ['건물', '토지', '부동산'],
  SECURITIES: ['증권', '주식', '채권', '펀드'],
  DEPOSITS: ['예금', '적금', '보험'],
  VEHICLES: ['자동차', '차량'],
  DEBTS: ['채무', '부채'],
  OTHER: ['기타', '골프회원권', '회원권'],
} as const;

/**
 * 자산 유형 분류
 */
export function categorizeAssetType(type: string): 'real_estate' | 'securities' | 'deposits' | 'vehicles' | 'debts' | 'other' {
  const normalizedType = type.trim();

  if (ASSET_TYPES.REAL_ESTATE.some(t => normalizedType.includes(t))) return 'real_estate';
  if (ASSET_TYPES.SECURITIES.some(t => normalizedType.includes(t))) return 'securities';
  if (ASSET_TYPES.DEPOSITS.some(t => normalizedType.includes(t))) return 'deposits';
  if (ASSET_TYPES.VEHICLES.some(t => normalizedType.includes(t))) return 'vehicles';
  if (ASSET_TYPES.DEBTS.some(t => normalizedType.includes(t))) return 'debts';

  return 'other';
}
