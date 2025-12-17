/**
 * 중앙선거관리위원회 공공데이터 API 연동 서비스
 *
 * 국회의원 선거 당선자 및 공약 정보를 가져옵니다.
 *
 * API 문서:
 * - 당선인 정보: https://www.data.go.kr/data/15000864/openapi.do
 * - 선거공약 정보: https://www.data.go.kr/data/15040587/openapi.do
 */

// =====================================
// 당선인 정보 API
// =====================================

// 당선인 API 응답 타입
interface WinnerApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: WinnerRaw | WinnerRaw[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// 당선인 원본 데이터
export interface WinnerRaw {
  sgId: string;           // 선거ID
  sgTypecode: string;     // 선거종류코드
  huboid: string;         // 후보자ID
  sggName: string;        // 선거구명
  sdName: string;         // 시도명
  wiwName: string;        // 구시군명
  gihoSangse: string;     // 기호상세
  jdName: string;         // 정당명
  name: string;           // 한글성명
  hanjaName: string;      // 한자성명
  gender: string;         // 성별
  birthday: string;       // 생년월일
  age: string;            // 연령
  addr: string;           // 주소
  job: string;            // 직업
  edu: string;            // 학력
  career1: string;        // 경력1
  career2: string;        // 경력2
  dugsu: string;          // 득표수
  dugyul: string;         // 득표율
  status: string;         // 당선상태
}

// 정제된 당선인 데이터
export interface ElectionHistoryData {
  electionId: string;
  electionType: string;
  electionDate: string;
  candidateId: string;
  candidateNo: number | null;
  name: string;
  partyName: string;
  constituency: string;
  sidoName: string;
  voteCount: number;
  voteRate: number;
  isElected: boolean;
  job: string;
  education: string;
  career: string;
  assemblyAge: number;
}

/**
 * 선관위 당선인 정보 API 클라이언트
 */
export class NecWinnerApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'http://apis.data.go.kr/9760000/WinnerInfoInqireService2';
  }

  /**
   * 당선인 정보 조회
   * @param sgId 선거ID (예: 20240410)
   * @param sgTypecode 선거종류코드 (2 = 국회의원)
   * @param sdName 시도명 (옵션)
   * @param pageNo 페이지번호
   * @param numOfRows 페이지당 건수
   */
  async getWinners(
    sgId: string,
    sgTypecode: string = '2',
    sdName?: string,
    pageNo: number = 1,
    numOfRows: number = 100
  ): Promise<WinnerRaw[]> {
    const url = new URL(`${this.baseUrl}/getWinnerInfoInqire`);
    url.searchParams.set('serviceKey', this.apiKey);
    url.searchParams.set('sgId', sgId);
    url.searchParams.set('sgTypecode', sgTypecode);
    url.searchParams.set('pageNo', String(pageNo));
    url.searchParams.set('numOfRows', String(numOfRows));
    url.searchParams.set('resultType', 'json');

    if (sdName) {
      url.searchParams.set('sdName', sdName);
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`선관위 API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as WinnerApiResponse;

      // 에러 체크
      if (data.response.header.resultCode !== '00') {
        throw new Error(`선관위 API 오류: ${data.response.header.resultMsg}`);
      }

      // 결과 추출
      const items = data.response.body.items?.item;
      if (!items) {
        return [];
      }

      // 단일 객체일 경우 배열로 변환
      return Array.isArray(items) ? items : [items];
    } catch (error) {
      console.error('선관위 당선인 API 호출 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 선거의 전체 당선인 조회
   */
  async getAllWinners(sgId: string, sgTypecode: string = '2'): Promise<WinnerRaw[]> {
    const allWinners: WinnerRaw[] = [];
    let pageNo = 1;
    const pageSize = 100;

    while (true) {
      console.log(`선관위 당선인 ${pageNo}페이지 조회 중...`);
      const winners = await this.getWinners(sgId, sgTypecode, undefined, pageNo, pageSize);

      if (winners.length === 0) break;

      allWinners.push(...winners);

      if (winners.length < pageSize) break;

      pageNo++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

      // 안전장치
      if (pageNo > 50) {
        console.warn('최대 페이지 수 초과, 중단');
        break;
      }
    }

    console.log(`총 ${allWinners.length}명 당선인 조회 완료`);
    return allWinners;
  }
}

/**
 * 당선인 데이터를 정제된 형태로 변환
 */
export function transformWinnerData(
  raw: WinnerRaw,
  electionDate: string,
  assemblyAge: number
): ElectionHistoryData {
  // 득표수/득표율 파싱
  const voteCount = parseInt(raw.dugsu?.replace(/,/g, '') || '0') || 0;
  const voteRate = parseFloat(raw.dugyul?.replace(/%/g, '') || '0') || 0;

  // 기호 파싱
  let candidateNo: number | null = null;
  const gihoMatch = raw.gihoSangse?.match(/\d+/);
  if (gihoMatch) {
    candidateNo = parseInt(gihoMatch[0]);
  }

  // 경력 합치기
  const careers = [raw.career1, raw.career2].filter(Boolean).join(' / ');

  return {
    electionId: raw.sgId,
    electionType: raw.sgTypecode === '2' ? '국회의원' : raw.sgTypecode,
    electionDate,
    candidateId: raw.huboid,
    candidateNo,
    name: raw.name?.trim() || '',
    partyName: raw.jdName?.trim() || '',
    constituency: raw.sggName?.trim() || '',
    sidoName: raw.sdName?.trim() || '',
    voteCount,
    voteRate,
    isElected: raw.status === '당선',
    job: raw.job?.trim() || '',
    education: raw.edu?.trim() || '',
    career: careers,
    assemblyAge,
  };
}

// =====================================
// 선거공약 정보 API
// =====================================

// 공약 API 응답 타입
interface PromiseApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: PromiseRaw | PromiseRaw[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// 공약 원본 데이터
export interface PromiseRaw {
  sgId: string;           // 선거ID
  sgTypecode: string;     // 선거종류코드
  cnddtId: string;        // 후보자ID
  name: string;           // 후보자명
  jdName: string;         // 정당명
  sggName: string;        // 선거구명
  prmsOrd1?: string;      // 공약순번1
  prmsRealmName1?: string; // 공약분야명1
  prmsTitle1?: string;    // 공약제목1
  prmmCont1?: string;     // 공약내용1
  // ... 공약 2-10 (같은 패턴)
  prmsOrd2?: string;
  prmsRealmName2?: string;
  prmsTitle2?: string;
  prmmCont2?: string;
  prmsOrd3?: string;
  prmsRealmName3?: string;
  prmsTitle3?: string;
  prmmCont3?: string;
  prmsOrd4?: string;
  prmsRealmName4?: string;
  prmsTitle4?: string;
  prmmCont4?: string;
  prmsOrd5?: string;
  prmsRealmName5?: string;
  prmsTitle5?: string;
  prmmCont5?: string;
  prmsOrd6?: string;
  prmsRealmName6?: string;
  prmsTitle6?: string;
  prmmCont6?: string;
  prmsOrd7?: string;
  prmsRealmName7?: string;
  prmsTitle7?: string;
  prmmCont7?: string;
  prmsOrd8?: string;
  prmsRealmName8?: string;
  prmsTitle8?: string;
  prmmCont8?: string;
  prmsOrd9?: string;
  prmsRealmName9?: string;
  prmsTitle9?: string;
  prmmCont9?: string;
  prmsOrd10?: string;
  prmsRealmName10?: string;
  prmsTitle10?: string;
  prmmCont10?: string;
}

// 정제된 공약 데이터
export interface ElectionPromiseData {
  electionId: string;
  candidateId: string;
  candidateName: string;
  partyName: string;
  constituency: string;
  promiseNo: number;
  category: string;
  title: string;
  content: string;
}

/**
 * 선관위 선거공약 API 클라이언트
 */
export class NecPromiseApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService';
  }

  /**
   * 후보자별 공약 정보 조회
   * @param sgId 선거ID
   * @param sgTypecode 선거종류코드
   * @param cnddtId 후보자ID
   */
  async getPromises(
    sgId: string,
    sgTypecode: string,
    cnddtId: string
  ): Promise<PromiseRaw | null> {
    const url = new URL(`${this.baseUrl}/getCnddtElecPrmsInfoInqire`);
    url.searchParams.set('serviceKey', this.apiKey);
    url.searchParams.set('sgId', sgId);
    url.searchParams.set('sgTypecode', sgTypecode);
    url.searchParams.set('cnddtId', cnddtId);
    url.searchParams.set('resultType', 'json');

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Politica/1.0 (https://sseuksak.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`선관위 공약 API 요청 실패: ${response.status}`);
      }

      const data = await response.json() as PromiseApiResponse;

      // 에러 체크
      if (data.response.header.resultCode !== '00') {
        // 공약 정보가 없는 경우 null 반환
        if (data.response.header.resultCode === '03') {
          return null;
        }
        throw new Error(`선관위 공약 API 오류: ${data.response.header.resultMsg}`);
      }

      const items = data.response.body.items?.item;
      if (!items) {
        return null;
      }

      // 단일 객체 반환
      return Array.isArray(items) ? items[0] : items;
    } catch (error) {
      console.error('선관위 공약 API 호출 오류:', error);
      throw error;
    }
  }
}

/**
 * 공약 원본 데이터에서 개별 공약 추출
 */
export function extractPromises(raw: PromiseRaw): ElectionPromiseData[] {
  const promises: ElectionPromiseData[] = [];

  for (let i = 1; i <= 10; i++) {
    const ordKey = `prmsOrd${i}` as keyof PromiseRaw;
    const realmKey = `prmsRealmName${i}` as keyof PromiseRaw;
    const titleKey = `prmsTitle${i}` as keyof PromiseRaw;
    const contKey = `prmmCont${i}` as keyof PromiseRaw;

    const title = raw[titleKey] as string | undefined;
    if (!title) continue;

    promises.push({
      electionId: raw.sgId,
      candidateId: raw.cnddtId,
      candidateName: raw.name?.trim() || '',
      partyName: raw.jdName?.trim() || '',
      constituency: raw.sggName?.trim() || '',
      promiseNo: parseInt(raw[ordKey] as string || String(i)) || i,
      category: (raw[realmKey] as string)?.trim() || '기타',
      title: title.trim(),
      content: ((raw[contKey] as string) || '').trim(),
    });
  }

  return promises;
}

// =====================================
// ID 생성 유틸리티
// =====================================

export function generateElectionHistoryId(): string {
  return `elec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateElectionPromiseId(): string {
  return `prms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================
// 선거 정보 상수
// =====================================

export const ELECTIONS = {
  '22대': { sgId: '20240410', date: '2024-04-10', assemblyAge: 22 },
  '21대': { sgId: '20200415', date: '2020-04-15', assemblyAge: 21 },
  '20대': { sgId: '20160413', date: '2016-04-13', assemblyAge: 20 },
  '19대': { sgId: '20120411', date: '2012-04-11', assemblyAge: 19 },
  '18대': { sgId: '20080409', date: '2008-04-09', assemblyAge: 18 },
} as const;

export const ELECTION_TYPE_CODES = {
  '국회의원': '2',
  '대통령': '1',
  '시도지사': '3',
  '구시군장': '4',
  '시도의원': '5',
  '구시군의원': '6',
} as const;
