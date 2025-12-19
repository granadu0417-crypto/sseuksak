/**
 * 국회 열린데이터 API 연동 서비스
 *
 * 국회의원 정보를 국회 API에서 가져와 DB와 동기화합니다.
 *
 * API 문서: https://open.assembly.go.kr/portal/openapi/main.do
 * 공공데이터포털: https://www.data.go.kr/data/15012647/openapi.do
 *
 * ⚠️ 중요: 현직 의원 필터링 문제 해결 (2025-12-18)
 * - ALLNAMEMBER: 역대 모든 국회의원 포함 (사퇴자도 포함됨)
 * - nwvrqwxyaytdsfvhu: 현직 국회의원만 제공 (권장)
 *
 * 문제 사례: 강유정 의원이 2025.6.4 사퇴했지만 ALLNAMEMBER에서는
 * "제22대" 당선 이력이 있어 현역으로 표시되는 문제 발생
 */

// 현직 국회의원 API 응답 타입 (nwvrqwxyaytdsfvhu)
// 이 API는 현재 활동 중인 의원만 반환합니다 (사퇴자 제외)
interface CurrentMemberApiResponse {
  nwvrqwxyaytdsfvhu: Array<{
    head?: Array<{
      list_total_count?: number;
      RESULT?: {
        CODE: string;
        MESSAGE: string;
      };
    }>;
    row?: AssemblyMemberRaw[];
  }>;
}

// 국회 API 응답 타입 (ALLNAMEMBER API - 역대 의원, 폴백용)
interface AssemblyApiResponse {
  ALLNAMEMBER: Array<{
    head?: Array<{
      list_total_count?: number;
      RESULT?: {
        CODE: string;
        MESSAGE: string;
      };
    }>;
    row?: AssemblyMemberRaw[];
  }>;
}

// 국회 API에서 받는 의원 원본 데이터 (ALLNAMEMBER API 필드)
export interface AssemblyMemberRaw {
  NAAS_CD: string;          // 국회의원코드
  NAAS_NM: string;          // 국회의원명
  NAAS_CH_NM: string;       // 국회의원한자명
  NAAS_EN_NM: string;       // 국회의원영문명
  BIRDY_DT: string;         // 생일일자
  DTY_NM: string;           // 직책명
  PLPT_NM: string;          // 정당명
  ELECD_NM: string;         // 선거구명
  ELECD_DIV_NM: string;     // 선거구구분명 (지역구/비례대표)
  CMIT_NM: string;          // 위원회명
  BLNG_CMIT_NM: string;     // 소속위원회명
  RLCT_DIV_NM: string;      // 재선구분명
  GTELT_ERACO: string;      // 당선대수
  NTR_DIV: string;          // 성별
  NAAS_TEL_NO: string;      // 전화번호
  NAAS_EMAIL_ADDR: string;  // 이메일주소
  NAAS_HP_URL: string;      // 홈페이지URL
  AIDE_NM: string;          // 보좌관
  CHF_SCRT_NM: string;      // 비서관
  SCRT_NM: string;          // 비서
  BRF_HST: string;          // 약력
  OFFM_RNUM_NO: string;     // 사무실호실
  NAAS_PIC: string;         // 국회의원사진
}

// 정제된 의원 데이터
export interface PoliticianSyncData {
  assemblyId: string;       // MONA_CD
  name: string;             // HG_NM
  hjNm: string;             // 한자이름
  engNm: string;            // 영문이름
  birthDate: string;        // 생년월일
  partyName: string;        // 정당명
  region: string;           // 선거구
  electGbnNm: string;       // 당선구분
  reeleGbnNm: string;       // 당선횟수
  position: string;         // 직함
  contactEmail: string;     // 이메일
  contactPhone: string;     // 전화번호
  websiteUrl: string;       // 홈페이지
  avatarUrl: string;        // 프로필 사진 URL
  uniqueKey: string;        // 고유키 (이름+선거구)
  syncHash: string;         // 데이터 해시
}

// 동기화 결과
export interface SyncResult {
  success: boolean;
  totalRecords: number;
  newRecords: number;
  updatedRecords: number;
  errors: string[];
  syncLogId: string;
}

/**
 * 국회 API 클라이언트
 *
 * 현직 국회의원 조회 우선순위:
 * 1. nwvrqwxyaytdsfvhu API (현직 의원만 제공, 권장)
 * 2. ALLNAMEMBER API (역대 모든 의원, 폴백)
 */
export class AssemblyApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://open.assembly.go.kr/portal/openapi';
  }

  /**
   * 현직 국회의원 목록 조회 (nwvrqwxyaytdsfvhu API)
   * ⭐ 권장: 사퇴자가 자동으로 제외됨
   */
  async getCurrentMemberList(pageNo: number = 1, numOfRows: number = 300): Promise<AssemblyMemberRaw[]> {
    const url = new URL(`${this.baseUrl}/nwvrqwxyaytdsfvhu`);
    url.searchParams.set('KEY', this.apiKey);
    url.searchParams.set('Type', 'json');
    url.searchParams.set('pIndex', String(pageNo));
    url.searchParams.set('pSize', String(numOfRows));

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`현직 API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as CurrentMemberApiResponse;

      // nwvrqwxyaytdsfvhu API 응답 구조 파싱
      const apiData = data.nwvrqwxyaytdsfvhu;
      if (!apiData || apiData.length === 0) {
        return [];
      }

      // head에서 에러 체크
      const headItem = apiData.find(item => item.head);
      if (headItem?.head) {
        const result = headItem.head.find(h => h.RESULT)?.RESULT;
        if (result && result.CODE !== 'INFO-000') {
          throw new Error(`현직 API 오류: ${result.MESSAGE}`);
        }
      }

      // row 데이터 추출
      const rowItem = apiData.find(item => item.row);
      return rowItem?.row || [];
    } catch (error) {
      console.error('현직 국회의원 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 역대 국회의원 목록 조회 (ALLNAMEMBER API - 폴백용)
   * ⚠️ 주의: 사퇴자도 포함됨, getCurrentMemberList 사용 권장
   */
  async getMemberList(pageNo: number = 1, numOfRows: number = 300): Promise<AssemblyMemberRaw[]> {
    const url = new URL(`${this.baseUrl}/ALLNAMEMBER`);
    url.searchParams.set('KEY', this.apiKey);
    url.searchParams.set('Type', 'json');
    url.searchParams.set('pIndex', String(pageNo));
    url.searchParams.set('pSize', String(numOfRows));

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as AssemblyApiResponse;

      // ALLNAMEMBER API 응답 구조 파싱
      const apiData = data.ALLNAMEMBER;
      if (!apiData || apiData.length === 0) {
        return [];
      }

      // head에서 에러 체크
      const headItem = apiData.find(item => item.head);
      if (headItem?.head) {
        const result = headItem.head.find(h => h.RESULT)?.RESULT;
        if (result && result.CODE !== 'INFO-000') {
          throw new Error(`API 오류: ${result.MESSAGE}`);
        }
      }

      // row 데이터 추출
      const rowItem = apiData.find(item => item.row);
      return rowItem?.row || [];
    } catch (error) {
      console.error('국회 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 현직 국회의원 전체 가져오기
   *
   * 우선순위:
   * 1. nwvrqwxyaytdsfvhu API 사용 (현직만 제공, 사퇴자 자동 제외)
   * 2. 실패 시 ALLNAMEMBER + 제22대 필터링 (폴백)
   */
  async getAllMembers(): Promise<AssemblyMemberRaw[]> {
    // 1. 먼저 현직 의원 API 시도
    try {
      console.log('현직 국회의원 API (nwvrqwxyaytdsfvhu) 호출 중...');
      const currentMembers = await this.getCurrentMemberList(1, 300);

      if (currentMembers.length > 0) {
        console.log(`✅ 현직 API 성공: ${currentMembers.length}명 조회`);
        return currentMembers;
      }
    } catch (error) {
      console.warn('⚠️ 현직 API 실패, ALLNAMEMBER로 폴백:', error);
    }

    // 2. 폴백: ALLNAMEMBER API + 제22대 필터링
    console.log('ALLNAMEMBER API (폴백) 호출 중...');
    const allMembers: AssemblyMemberRaw[] = [];
    let pageNo = 1;
    const pageSize = 300;

    while (true) {
      const members = await this.getMemberList(pageNo, pageSize);

      if (members.length === 0) break;

      allMembers.push(...members);

      // 마지막 페이지인지 확인
      if (members.length < pageSize) break;

      pageNo++;

      // Rate limiting (안전을 위해)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 현역 국회의원만 필터링 (제22대)
    // ⚠️ 주의: 이 방식은 사퇴자도 포함될 수 있음 (폴백용)
    const currentMembers = allMembers.filter(member => {
      const eraco = member.GTELT_ERACO || '';
      return eraco.includes('제22대');
    });

    console.log(`⚠️ 폴백 사용: 총 ${allMembers.length}명 중 제22대 ${currentMembers.length}명 필터링 (사퇴자 포함 가능)`);
    return currentMembers;
  }
}

/**
 * 슬래시로 구분된 값에서 마지막(최신) 값 추출
 * API가 역대 정보를 "값1/값2/값3" 형태로 반환
 */
function getLatestValue(value: string | null | undefined): string {
  if (!value) return '';
  const parts = value.split('/');
  return parts[parts.length - 1].trim();
}

/**
 * 원본 데이터를 정제된 형태로 변환 (ALLNAMEMBER API)
 */
export function transformMemberData(raw: AssemblyMemberRaw): PoliticianSyncData {
  const name = raw.NAAS_NM?.trim() || '';
  // API가 역대 정보를 "충남 아산시을/충남 아산시을/충남 아산시을" 형태로 반환
  const region = getLatestValue(raw.ELECD_NM);

  // 고유키 생성: 이름 + 선거구 (동명이인 구분)
  const uniqueKey = generateUniqueKey(name, region);

  // 해시 생성: 주요 필드 조합 (변경 감지용)
  const syncHash = generateSyncHash(raw);

  // 이미지 URL 처리 (국회 API가 상대 경로 또는 전체 URL 반환)
  let avatarUrl = raw.NAAS_PIC?.trim() || '';
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    // 상대 경로인 경우 국회 사이트 기본 URL 추가
    avatarUrl = avatarUrl.startsWith('/')
      ? `https://www.assembly.go.kr${avatarUrl}`
      : `https://www.assembly.go.kr/photo/9770000/${avatarUrl}`;
  }

  return {
    assemblyId: raw.NAAS_CD?.trim() || '',
    name,
    hjNm: raw.NAAS_CH_NM?.trim() || '',
    engNm: raw.NAAS_EN_NM?.trim() || '',
    birthDate: raw.BIRDY_DT?.trim() || '',
    // API가 "더불어민주당/더불어민주당/더불어민주당" 형태로 반환
    partyName: getLatestValue(raw.PLPT_NM),
    region,
    // API가 "지역구/지역구/지역구" 형태로 반환
    electGbnNm: getLatestValue(raw.ELECD_DIV_NM),
    reeleGbnNm: raw.RLCT_DIV_NM?.trim() || '',
    position: raw.DTY_NM?.trim() || '국회의원',
    contactEmail: raw.NAAS_EMAIL_ADDR?.trim() || '',
    contactPhone: raw.NAAS_TEL_NO?.trim() || '',
    websiteUrl: raw.NAAS_HP_URL?.trim() || '',
    avatarUrl,
    uniqueKey,
    syncHash,
  };
}

/**
 * 고유키 생성 (이름 + 선거구)
 */
export function generateUniqueKey(name: string, region: string): string {
  // 이름과 선거구를 조합하여 고유키 생성
  // 공백, 특수문자 제거 후 소문자로 정규화
  const normalizedName = name.replace(/\s+/g, '').toLowerCase();
  const normalizedRegion = region.replace(/\s+/g, '').toLowerCase();
  return `${normalizedName}_${normalizedRegion}`;
}

/**
 * 동기화 해시 생성 (변경 감지용) - ALLNAMEMBER API
 */
export function generateSyncHash(raw: AssemblyMemberRaw): string {
  // 주요 필드들을 조합하여 해시 생성
  const fields = [
    raw.NAAS_NM,
    raw.PLPT_NM,
    raw.ELECD_NM,
    raw.ELECD_DIV_NM,
    raw.RLCT_DIV_NM,
    raw.DTY_NM,
    raw.NAAS_EMAIL_ADDR,
    raw.NAAS_TEL_NO,
  ];

  const combined = fields.map(f => f?.trim() || '').join('|');

  // 간단한 해시 (실제 환경에서는 crypto 사용)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 정당명을 party_id로 매핑
 */
export function mapPartyNameToId(partyName: string): string | null {
  const partyMap: Record<string, string> = {
    '더불어민주당': 'party_democratic',
    '국민의힘': 'party_ppp',
    '조국혁신당': 'party_rebuild',
    '개혁신당': 'party_reform',
    '정의당': 'party_justice',
    '진보당': 'party_progressive',
    '기본소득당': 'party_basicincome',
    '사회민주당': 'party_socialdemocrat',
    '무소속': 'party_independent',
  };

  return partyMap[partyName] || null;
}

/**
 * DB 동기화 유틸리티
 */
export function generatePoliticianId(): string {
  return `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSyncLogId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================
// 발의법률안 API (nzmimeepazxkubdpn)
// =====================================

// 발의법률안 API 응답 타입
interface BillApiResponse {
  nzmimeepazxkubdpn: Array<{
    head?: Array<{
      list_total_count?: number;
      RESULT?: {
        CODE: string;
        MESSAGE: string;
      };
    }>;
    row?: BillRaw[];
  }>;
}

// 발의법률안 원본 데이터
export interface BillRaw {
  BILL_ID: string;          // 의안ID
  BILL_NO: string;          // 의안번호
  BILL_NAME: string;        // 법률안명
  COMMITTEE: string;        // 소관위원회
  COMMITTEE_ID: string;     // 소관위원회ID
  PROC_RESULT: string;      // 처리상태
  PROPOSER: string;         // 제안자 (전체)
  RST_PROPOSER: string;     // 대표발의자
  PUBL_PROPOSER: string;    // 공동발의자
  MEMBER_LIST: string;      // 제안자목록링크
  AGE: string;              // 대수
  PROPOSE_DT: string;       // 제안일
  DETAIL_LINK: string;      // 상세페이지
}

// 정제된 법안 데이터
export interface BillSponsorshipData {
  billId: string;
  billNo: string;
  billName: string;
  committee: string;
  committeeId: string;
  procResult: string;
  sponsorType: '대표발의' | '공동발의';
  sponsorName: string;      // 발의자 이름
  proposeDate: string;
  assemblyAge: number;
  detailLink: string;
}

/**
 * 발의법률안 API 클라이언트 확장
 */
export class BillApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://open.assembly.go.kr/portal/openapi';
  }

  /**
   * 발의법률안 목록 조회
   * @param age 국회 대수 (22 = 제22대)
   * @param pageNo 페이지 번호
   * @param pageSize 페이지당 건수
   */
  async getBillList(age: number = 22, pageNo: number = 1, pageSize: number = 100): Promise<BillRaw[]> {
    const url = new URL(`${this.baseUrl}/nzmimeepazxkubdpn`);
    url.searchParams.set('KEY', this.apiKey);
    url.searchParams.set('Type', 'json');
    url.searchParams.set('pIndex', String(pageNo));
    url.searchParams.set('pSize', String(pageSize));
    url.searchParams.set('AGE', String(age));

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as BillApiResponse;
      const apiData = data.nzmimeepazxkubdpn;

      if (!apiData || apiData.length === 0) {
        return [];
      }

      // 에러 체크
      const headItem = apiData.find(item => item.head);
      if (headItem?.head) {
        const result = headItem.head.find(h => h.RESULT)?.RESULT;
        if (result && result.CODE !== 'INFO-000') {
          throw new Error(`API 오류: ${result.MESSAGE}`);
        }
      }

      const rowItem = apiData.find(item => item.row);
      return rowItem?.row || [];
    } catch (error) {
      console.error('발의법률안 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 제22대 전체 발의법률안 가져오기
   */
  async getAllBills(age: number = 22): Promise<BillRaw[]> {
    const allBills: BillRaw[] = [];
    let pageNo = 1;
    const pageSize = 100;

    while (true) {
      console.log(`발의법률안 ${pageNo}페이지 조회 중...`);
      const bills = await this.getBillList(age, pageNo, pageSize);

      if (bills.length === 0) break;

      allBills.push(...bills);

      if (bills.length < pageSize) break;

      pageNo++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // 안전장치: 최대 200페이지 (20,000건)
      if (pageNo > 200) {
        console.warn('최대 페이지 수 초과, 중단');
        break;
      }
    }

    console.log(`총 ${allBills.length}개 법안 조회 완료`);
    return allBills;
  }
}

/**
 * 법안 데이터에서 발의자별 데이터로 변환
 * 한 법안에 대표발의자 1명 + 공동발의자 N명이 있음
 */
export function transformBillToSponsorships(bill: BillRaw): BillSponsorshipData[] {
  const sponsorships: BillSponsorshipData[] = [];
  const assemblyAge = parseInt(bill.AGE) || 22;

  // 대표발의자 추가
  if (bill.RST_PROPOSER) {
    const leadSponsors = bill.RST_PROPOSER.split(',').map(s => s.trim()).filter(Boolean);
    for (const sponsor of leadSponsors) {
      sponsorships.push({
        billId: bill.BILL_ID,
        billNo: bill.BILL_NO,
        billName: bill.BILL_NAME,
        committee: bill.COMMITTEE,
        committeeId: bill.COMMITTEE_ID,
        procResult: bill.PROC_RESULT,
        sponsorType: '대표발의',
        sponsorName: sponsor,
        proposeDate: bill.PROPOSE_DT,
        assemblyAge,
        detailLink: bill.DETAIL_LINK,
      });
    }
  }

  // 공동발의자 추가
  if (bill.PUBL_PROPOSER) {
    const coSponsors = bill.PUBL_PROPOSER.split(',').map(s => s.trim()).filter(Boolean);
    for (const sponsor of coSponsors) {
      sponsorships.push({
        billId: bill.BILL_ID,
        billNo: bill.BILL_NO,
        billName: bill.BILL_NAME,
        committee: bill.COMMITTEE,
        committeeId: bill.COMMITTEE_ID,
        procResult: bill.PROC_RESULT,
        sponsorType: '공동발의',
        sponsorName: sponsor,
        proposeDate: bill.PROPOSE_DT,
        assemblyAge,
        detailLink: bill.DETAIL_LINK,
      });
    }
  }

  return sponsorships;
}

/**
 * 법안 발의 ID 생성
 */
export function generateBillSponsorshipId(): string {
  return `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================
// 표결정보 API - OpenWatch 연동
// https://openwatch.kr/api/national-assembly/votes
// 다중 소스 크로스체크를 위한 민간 데이터 활용
// =====================================

// OpenWatch 표결정보 API 응답 타입
interface OpenWatchVotesResponse {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  rows: OpenWatchVoteRaw[];
}

// OpenWatch 표결정보 원본 데이터
export interface OpenWatchVoteRaw {
  id: string;                        // 표결 ID
  nationalAssemblyMemberId: string;  // 의원 ID
  memberName: string;                // 의원명
  partyName: string;                 // 정당명
  billId: string;                    // 법안 ID
  billName: string;                  // 법안명
  bonMeetingId: string;              // 본회의 ID
  voteResult: string;                // 투표 결과 (찬성/반대/기권/불참)
  voteDate: string;                  // 투표일
  age: number;                       // 국회 대수
}

// 정제된 표결 데이터
export interface VoteRecordData {
  voteId: string;           // OpenWatch 표결 ID
  billId: string;
  billName: string;
  politicianId: string;     // OpenWatch 의원 ID
  politicianName: string;
  partyName: string;
  voteResult: '찬성' | '반대' | '기권' | '불참';
  voteDate: string;
  assemblyAge: number;
  bonMeetingId: string;
}

/**
 * OpenWatch 표결정보 API 클라이언트
 *
 * OpenWatch는 국회 원본 데이터를 정제하여 제공하는 민간 서비스입니다.
 * 다중 소스 크로스체크를 위해 활용합니다.
 */
export class OpenWatchVoteClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://openwatch.kr/api/national-assembly';
  }

  /**
   * 표결정보 목록 조회
   * @param age 국회 대수 (22 = 제22대)
   * @param page 페이지 번호
   * @param pageSize 페이지당 건수 (최대 100)
   * @param nationalAssemblyMemberId 특정 의원 ID (선택)
   * @param billId 특정 법안 ID (선택)
   */
  async getVotes(
    age: number = 22,
    page: number = 1,
    pageSize: number = 100,
    nationalAssemblyMemberId?: string,
    billId?: string
  ): Promise<OpenWatchVoteRaw[]> {
    const url = new URL(`${this.baseUrl}/votes`);
    url.searchParams.set('age', String(age));
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(Math.min(pageSize, 100)));

    if (nationalAssemblyMemberId) {
      url.searchParams.set('nationalAssemblyMemberId', nationalAssemblyMemberId);
    }
    if (billId) {
      url.searchParams.set('billId', billId);
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenWatch API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as OpenWatchVotesResponse;
      return data.rows || [];
    } catch (error) {
      console.error('OpenWatch 표결 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 대수의 전체 표결 기록 가져오기
   * 페이지네이션으로 전체 데이터 수집
   */
  async getAllVotes(age: number = 22, maxPages: number = 50): Promise<OpenWatchVoteRaw[]> {
    const allVotes: OpenWatchVoteRaw[] = [];
    let page = 1;
    const pageSize = 100;

    while (page <= maxPages) {
      console.log(`OpenWatch 표결정보 ${page}페이지 조회 중...`);
      const votes = await this.getVotes(age, page, pageSize);

      if (votes.length === 0) break;

      allVotes.push(...votes);

      if (votes.length < pageSize) break;

      page++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`총 ${allVotes.length}개 표결 기록 조회 완료`);
    return allVotes;
  }

  /**
   * 특정 의원의 표결 기록 가져오기
   */
  async getMemberVotes(nationalAssemblyMemberId: string, age: number = 22): Promise<OpenWatchVoteRaw[]> {
    const allVotes: OpenWatchVoteRaw[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      const votes = await this.getVotes(age, page, pageSize, nationalAssemblyMemberId);

      if (votes.length === 0) break;

      allVotes.push(...votes);

      if (votes.length < pageSize) break;

      page++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return allVotes;
  }
}

/**
 * OpenWatch 표결 데이터를 정제된 형태로 변환
 */
export function transformOpenWatchVote(raw: OpenWatchVoteRaw): VoteRecordData {
  // 투표 결과 정규화
  let voteResult: '찬성' | '반대' | '기권' | '불참' = '불참';
  const result = raw.voteResult?.toLowerCase() || '';

  if (result.includes('찬성') || result.includes('yes') || result === '1') {
    voteResult = '찬성';
  } else if (result.includes('반대') || result.includes('no') || result === '0') {
    voteResult = '반대';
  } else if (result.includes('기권') || result.includes('abstain')) {
    voteResult = '기권';
  } else if (result.includes('불참') || result.includes('absent')) {
    voteResult = '불참';
  }

  return {
    voteId: raw.id,
    billId: raw.billId,
    billName: raw.billName,
    politicianId: raw.nationalAssemblyMemberId,
    politicianName: raw.memberName,
    partyName: raw.partyName,
    voteResult,
    voteDate: raw.voteDate,
    assemblyAge: raw.age || 22,
    bonMeetingId: raw.bonMeetingId,
  };
}

/**
 * 표결 기록 ID 생성
 */
export function generateVoteRecordId(): string {
  return `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 활동 통계 ID 생성
 */
export function generateActivityStatsId(): string {
  return `stats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================
// 위원회 활동 데이터 변환
// ALLNAMEMBER API에서 위원회 정보 추출
// =====================================

// 위원회 활동 데이터
export interface CommitteeActivityData {
  politicianName: string;
  committeeName: string;      // CMIT_NM (위원회명)
  belongingCommittee: string; // BLNG_CMIT_NM (소속위원회명)
  position: string | null;    // 위원회 직위 (위원장, 간사, 위원 등)
  assemblyAge: number;
}

/**
 * 의원 데이터에서 위원회 활동 추출
 * CMIT_NM과 BLNG_CMIT_NM 필드 사용
 */
export function extractCommitteeActivities(raw: AssemblyMemberRaw): CommitteeActivityData[] {
  const activities: CommitteeActivityData[] = [];
  const name = raw.NAAS_NM?.trim() || '';

  // CMIT_NM (주요 위원회명) - 슬래시로 구분된 값 처리
  const cmitNames = (raw.CMIT_NM || '').split('/').map(s => s.trim()).filter(Boolean);
  // BLNG_CMIT_NM (소속위원회명) - 슬래시로 구분된 값 처리
  const blngCmitNames = (raw.BLNG_CMIT_NM || '').split('/').map(s => s.trim()).filter(Boolean);

  // 위원회명 목록 생성 (중복 제거)
  const allCommittees = new Set<string>();

  // CMIT_NM에서 최신 값 사용 (마지막 값)
  if (cmitNames.length > 0) {
    const latestCmit = cmitNames[cmitNames.length - 1];
    if (latestCmit) {
      allCommittees.add(latestCmit);
    }
  }

  // BLNG_CMIT_NM에서 최신 값 파싱 (쉼표로 여러 위원회 구분될 수 있음)
  if (blngCmitNames.length > 0) {
    const latestBlng = blngCmitNames[blngCmitNames.length - 1];
    // 쉼표로 구분된 복수 위원회 처리
    const committees = latestBlng.split(',').map(s => s.trim()).filter(Boolean);
    committees.forEach(c => allCommittees.add(c));
  }

  // 직위 추출 (DTY_NM에서 위원회 관련 직위 확인)
  const dtyNm = raw.DTY_NM?.trim() || '';
  let position: string | null = null;

  if (dtyNm.includes('위원장')) {
    position = '위원장';
  } else if (dtyNm.includes('간사')) {
    position = '간사';
  } else {
    position = '위원';
  }

  // 위원회별 활동 레코드 생성
  for (const committee of allCommittees) {
    if (committee) {
      activities.push({
        politicianName: name,
        committeeName: committee,
        belongingCommittee: committee,
        position,
        assemblyAge: 22,
      });
    }
  }

  return activities;
}

/**
 * 위원회 활동 ID 생성
 */
export function generateCommitteeActivityId(): string {
  return `cmit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
