# Politica - 실시간 작업 상태

## 현재 상태: Phase 5 완료 ✅

### 최근 완료 (2025-12-17)

#### 1. 국회 API 연동 완료
- 304명 현역 국회의원 동기화
- 데이터 중복 문제 해결 (슬래시 구분 값 처리)
- 매일 새벽 3시 자동 동기화 (Cron)

#### 2. 다중 소스 자료조사 완료
사용자 요구사항: "단일 소스가 아닌 여러 소스에서 크로스체크하여 신뢰할 수 있는 정보 제공"

#### 3. 발의법률안 API 연동 완료 ✅
- API 엔드포인트: `nzmimeepazxkubdpn`
- DB 스키마: `bill_sponsorships`, `politician_activity_stats` 테이블 추가
- 동기화 API: `/api/sync/bills`
- 현재 동기화된 데이터: 43개 법안, 499건 발의 기록 (샘플)
- 정치인 상세 API에 `activity_stats`, `recent_bills` 필드 추가

#### 4. 표결정보 API 연동 완료 ✅
- **데이터 소스**: OpenWatch API (`https://openwatch.kr/api/national-assembly/votes`)
- **선택 이유**: 국회 원본 API 엔드포인트 불명확, OpenWatch가 정제된 의원별 표결 데이터 제공
- 동기화 API: `/api/sync/votes`
- DB 테이블: `voting_records` (003_activity_data.sql에 이미 생성됨)
- 정치인 상세 API에 `recent_votes` 필드 추가
- **다중 소스 전략**: 민간 데이터(OpenWatch) 활용으로 크로스체크 기반 마련

#### 5. 상임위원회 활동 API 연동 완료 ✅
- **데이터 소스**: 국회 ALLNAMEMBER API (기존 API 재활용)
  - `CMIT_NM`: 위원회명
  - `BLNG_CMIT_NM`: 소속위원회명
- **구현 방식**: 별도 API 연동 없이 기존 의원 데이터에서 위원회 정보 추출
- 동기화 API: `/api/sync/committees`
- DB 테이블: `committee_activities` (003_activity_data.sql에 이미 생성됨)
- 정치인 상세 API에 `committee_activities` 필드 추가
- **주요 정보**: 위원회명, 직위(위원장/간사/위원)

#### 6. 선관위 API 연동 완료 ✅ (Phase 2)
- **데이터 소스**: 중앙선거관리위원회 공공데이터 API
  - 당선인 정보 API: `http://apis.data.go.kr/9760000/WinnerInfoInqireService2`
  - 선거공약 정보 API: `http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService`
- **구현 파일**:
  - `src/lib/nec-api.ts` - 선관위 API 클라이언트
  - `src/app/api/sync/elections/route.ts` - 동기화 엔드포인트
  - `db/migrations/004_election_data.sql` - DB 스키마
- **DB 테이블**:
  - `election_history` - 선거 이력 (당선 기록)
  - `election_promises` - 선거 공약
  - `elections` - 선거 목록 (마스터)
- 정치인 상세 API에 `election_history`, `election_promises` 필드 추가
- **지원 선거**: 18대 ~ 22대 국회의원 선거
- **환경변수 필요**: `NEC_API_KEY` (공공데이터포털에서 발급)

#### 7. OpenWatch 크로스체크 데이터 연동 완료 ✅ (Phase 3)
- **데이터 소스**: OpenWatch API (민간 데이터)
  - 자산정보 API: `https://openwatch.kr/api/national-assembly/assets`
  - 정치후원금 총액 API: `https://openwatch.kr/api/political-contributions/totals`
  - 고액후원자 API: `https://openwatch.kr/api/political-contributions`
- **구현 파일**:
  - `src/lib/openwatch-api.ts` - OpenWatch API 클라이언트 확장
    - `OpenWatchAssetClient` - 자산정보 조회
    - `OpenWatchContributionClient` - 후원금 조회
  - `src/app/api/sync/assets/route.ts` - 자산정보 동기화 엔드포인트
  - `src/app/api/sync/contributions/route.ts` - 후원금 동기화 엔드포인트
  - `db/migrations/005_openwatch_data.sql` - DB 스키마
- **DB 테이블**:
  - `politician_assets` - 자산 상세 (건물, 토지, 증권, 예금 등)
  - `politician_asset_summary` - 자산 요약 (캐시)
  - `political_contributions` - 후원금 총액
  - `contribution_donors` - 고액후원자 (연 300만원 초과)
  - `politician_contribution_summary` - 후원금 요약 (캐시)
- 정치인 상세 API에 `asset_summary`, `contribution_summary` 필드 추가
- **다중 소스 크로스체크**: 민간 데이터로 공식 데이터 검증 기반 마련
- **⚠️ 알려진 제한**: 자산 API는 의원별 필터 없음 → 전체 데이터 가져와 이름 매핑 필요

#### 8. 정당 지도부/당직 정보 연동 완료 ✅ (Phase 4)
- **데이터 소스**: 나무위키 (정당별 지도부 페이지)
  - 더불어민주당: https://namu.wiki/w/더불어민주당/지도부
  - 국민의힘: https://namu.wiki/w/국민의힘/지도부
  - 조국혁신당: https://namu.wiki/w/조국혁신당/지도부
  - 개혁신당: https://namu.wiki/w/개혁신당/지도부
- **구현 방식**: 반자동 (위키 데이터 수동 입력 → API로 동기화)
  - 정당 공식 사이트는 SPA 구조로 스크래핑 어려움
  - 나무위키가 체계적인 지도부 정보 제공
- **구현 파일**:
  - `src/lib/party-scraper.ts` - 당직 데이터 및 유틸리티
  - `src/app/api/sync/leadership/route.ts` - 당직 동기화 엔드포인트
  - `db/migrations/006_party_leadership.sql` - DB 스키마
- **DB 테이블**:
  - `party_position_types` - 당직 유형 (당대표, 원내대표, 최고위원 등)
  - `party_positions` - 당직자 기록 (현직/역대)
  - `v_current_party_leadership` - 현재 지도부 뷰
  - `v_politician_party_roles` - 정치인별 당직 뷰
- 정치인 상세 API에 `party_positions` 필드 추가
- **현재 지도부 (2025년 12월 기준)**:
  - 더불어민주당: 정청래(당대표), 김병기(원내대표)
  - 국민의힘: 장동혁(당대표), 송언석(원내대표)
  - 조국혁신당: 조국(당대표), 서왕진(원내대표)
  - 개혁신당: 이준석(당대표), 천하람(원내대표)

#### 9. 크로스체크 엔진 구현 완료 ✅ (Phase 5)
- **목적**: 다중 데이터 소스 비교 및 불일치 감지 시스템
- **핵심 기능**:
  - 소스별 raw_data 저장 (원본 데이터 보관)
  - 데이터 비교 알고리즘 (exact, fuzzy, numeric_tolerance, date)
  - 불일치 감지 및 심각도 분류 (critical, high, medium, low)
  - 크로스체크 결과 집계 및 캐싱
- **구현 파일**:
  - `src/lib/crosscheck-engine.ts` - 크로스체크 엔진 라이브러리
  - `src/app/api/crosscheck/route.ts` - 크로스체크 실행/현황 API
  - `src/app/api/crosscheck/conflicts/route.ts` - 불일치 목록/해결 API
  - `db/migrations/007_crosscheck_engine.sql` - DB 스키마
- **DB 테이블**:
  - `data_sources` - 데이터 소스 마스터 (9개 소스 등록)
  - `raw_politician_info` - 정치인 기본정보 원본
  - `raw_vote_info` - 표결 정보 원본
  - `raw_asset_info` - 자산 정보 원본
  - `data_conflicts` - 불일치 감지 기록
  - `crosscheck_results` - 크로스체크 결과 캐시
  - `crosscheck_logs` - 실행 로그
  - `comparison_rules` - 필드 비교 규칙
  - `v_unresolved_conflicts` - 미해결 불일치 뷰
  - `v_politician_crosscheck_summary` - 정치인별 요약 뷰
- **API 엔드포인트**:
  - `POST /api/crosscheck` - 크로스체크 실행
  - `GET /api/crosscheck` - 크로스체크 현황 조회
  - `GET /api/crosscheck/conflicts` - 불일치 목록 조회
  - `PUT /api/crosscheck/conflicts` - 불일치 해결
- **비교 알고리즘**:
  - `exact`: 정확한 일치 비교
  - `fuzzy`: Levenshtein 기반 유사도 비교 (기본 90% 임계값)
  - `numeric_tolerance`: 숫자 비교 (1% 오차 허용)
  - `date`: 날짜 비교 (YYYY-MM-DD 정규화)
- **소스 권위 점수**:
  - 정부 공식 API (국회, 선관위): 1.0
  - 민간 검증 데이터 (OpenWatch): 0.8
  - 정당 공식사이트: 0.7
  - 위키: 0.5

---

## 📊 데이터 소스 전체 매핑

### 1. 정부 공식 API

| 소스 | API 수 | 주요 데이터 | 상태 |
|------|--------|-------------|------|
| **국회 열린데이터** | 274개 | 의원정보, 표결, 법안발의, 회의록 | ✅ 기본 연동됨 |
| **공공데이터포털** | 다수 | 국회의원 정보 통합 API | 🔲 미연동 |
| **중앙선거관리위원회** | 6개+ | 후보자, 당선인, 투개표, 선거공약 | ✅ 연동됨 |

**국회 열린데이터 핵심 API:**
- ALLNAMEMBER: 국회의원 정보 통합 (✅ 사용 중)
- nzmimeepazxkubdpn: 국회의원 발의법률안 (✅ 연동됨)
- ncocpgfiaoituanbr: 의안별 표결현황 (집계만 - 미사용)
- 국회의원 본회의 표결정보: OpenWatch로 대체 (✅ 연동됨)
- 국회의원 상임위 활동: 위원회 활동 (🔄 다음)
- 회의록 관련 API들: 본회의, 위원회, 국정감사 등

**선관위 API:**
- 후보자 정보: http://apis.data.go.kr/9760000/PofelcddInfoInqireService
- 당선인 정보: https://www.data.go.kr/data/15000864/openapi.do
- 선거공약 정보: https://www.data.go.kr/data/15040587/openapi.do
- 투개표 정보: https://www.data.go.kr/data/15000900/openapi.do

### 2. 민간 오픈소스/오픈데이터

| 소스 | URL | 특징 | 데이터 | 상태 |
|------|-----|------|--------|------|
| **OpenWatch** | docs.openwatch.kr/api | API 문서화됨 | 국회의원 자산, 표결, 지방의원, 정치후원금 | ✅ 표결+자산+후원금 연동됨 |
| **Popong** | data.popong.com | 매일 자동 업데이트 | 역대 국회의원, 의안, 회의록 | 🔲 미연동 |
| **열려라국회** | watch.peoplepower21.org | 참여연대 운영 | 의원 평가, 활동 분석 | 🔲 미연동 |

**OpenWatch API 엔드포인트 (사용 중):**
- ✅ 표결 현황: `GET /api/national-assembly/votes`
  - 파라미터: `page`, `pageSize`, `age`, `nationalAssemblyMemberId`, `billId`
- ✅ 국회의원 자산정보: `GET /api/national-assembly/assets`
  - 파라미터: `page`, `pageSize`, `date` (YYYYMM)
  - ⚠️ 의원별 필터 없음 - 전체 데이터 이름 매핑 필요
- ✅ 정치후원금 총액: `GET /api/political-contributions/totals`
  - 파라미터: `type`, `year`, `candidate`, `page`, `pageSize`
- ✅ 고액후원자: `GET /api/political-contributions`
  - 파라미터: `type`, `year`, `candidate`, `page`, `pageSize`
- 🔲 국회의원 명단
- 🔲 본회의 정보
- 🔲 지방의원 정보

### 3. 정당 공식사이트 (API 없음 - 스크래핑 필요)

| 정당 | URL | 수집 대상 |
|------|-----|-----------|
| 더불어민주당 | theminjoo.kr | 당직, 정책 |
| 국민의힘 | peoplepowerparty.kr | 당직, 정책 |
| 조국혁신당 | rebuildingkoreaparty.kr | 당직, 정책 |
| 개혁신당 | reformparty.kr | 당직, 정책 |

### 4. 데이터별 소스 매핑

| 데이터 | 1차 소스 | 2차 소스 | 3차 소스 |
|--------|----------|----------|----------|
| 의원 기본정보 | 국회 API (✅) | OpenWatch | 정당 사이트 |
| 표결 정보 | OpenWatch (✅) | 국회 API | - |
| 법안 발의 | 국회 API (✅) | Popong | - |
| 당직/직책 | 정당 사이트 | 뉴스 검색 | - |
| 선거 이력 | 선관위 API (✅) | 국회 API | - |
| 공약 | 선관위 API (✅) | 정당 사이트 | - |
| 자산 | OpenWatch (✅) | - | - |
| 정치후원금 | OpenWatch (✅) | 선관위 | - |

---

## 🎯 구현 로드맵 (권장 순서)

### Phase 1: 국회 API 확장 (핵심 활동 데이터) - ✅ 완료
1. ~~발의법률안 API 연동~~ ✅ 완료
2. ~~표결정보 API 연동~~ ✅ 완료 (OpenWatch 사용)
3. ~~상임위 활동 API 연동~~ ✅ 완료 (ALLNAMEMBER 재활용)

### Phase 2: 선관위 API 연동 (선거/공약 데이터) - ✅ 완료
1. ~~당선인 정보 API~~ ✅ 완료 → 선거 이력
2. ~~선거공약 정보 API~~ ✅ 완료 → 공약 데이터
3. ~~정치인 상세 API에 선거 데이터 추가~~ ✅ 완료

### Phase 3: OpenWatch API 연동 (크로스체크용) - ✅ 완료
1. ~~국회의원 자산정보~~ ✅ 완료
2. ~~표결 현황~~ ✅ 완료
3. ~~정치후원금 데이터~~ ✅ 완료

### Phase 4: 정당 지도부/당직 정보 (나무위키 기반) - ✅ 완료
1. ~~더불어민주당 당직 정보~~ ✅ 완료
2. ~~국민의힘 당직 정보~~ ✅ 완료
3. ~~조국혁신당, 개혁신당 당직 정보~~ ✅ 완료

### Phase 5: 크로스체크 엔진 구현
1. 소스별 raw_data 테이블 설계
2. 데이터 비교 알고리즘
3. 불일치 감지 및 플래그 시스템

### Phase 6: 신뢰도 시스템
1. 신뢰도 점수 계산 로직
2. 출처 표시 UI
3. 불일치 알림 시스템

---

## 🏗️ 제안 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    데이터 소스들                      │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ 국회 API │ 선관위   │ OpenWatch│ 정당사이트│ 뉴스    │
│  (✅)    │  (🔲)   │   (✅)   │   (🔲)   │  (🔲)   │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬────┘
     ↓          ↓          ↓          ↓          ↓
┌─────────────────────────────────────────────────────┐
│              raw_data (소스별 원본)                   │
│  assembly_raw, nec_raw, openwatch_raw, party_raw   │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│              크로스체크 엔진                          │
│  - 소스 간 비교                                      │
│  - 불일치 감지                                       │
│  - 신뢰도 점수 계산                                  │
└─────────────────────┬───────────────────────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌───────────────────┐    ┌───────────────────┐
│  verified_data    │    │  conflict_data    │
│  (검증 완료)       │    │  (불일치 - 검토)   │
│  신뢰도: 높음      │    │  플래그 표시       │
└───────────────────┘    └───────────────────┘
```

---

## 📝 신뢰도 계산 공식 (제안)

```
신뢰도 점수 =
  (소스 일치 점수 × 0.4) +
  (최신성 점수 × 0.3) +
  (소스 권위 점수 × 0.3)

소스 권위 점수:
- 정부 공식 API: 1.0
- 민간 검증 데이터 (OpenWatch 등): 0.8
- 정당 공식사이트: 0.7
- 뉴스/인터넷: 0.5
```

---

## 🔧 현재 구현된 파일

### 국회 API 관련
- `src/lib/assembly-api.ts` - API 클라이언트
  - `AssemblyApiClient` - 국회의원 정보
  - `BillApiClient` - 발의법률안
  - `OpenWatchVoteClient` - 표결 정보
  - `extractCommitteeActivities()` - 위원회 정보 추출
- `src/app/api/sync/assembly/route.ts` - 의원 동기화 엔드포인트
- `src/app/api/sync/bills/route.ts` - 법안 동기화 엔드포인트
- `src/app/api/sync/votes/route.ts` - 표결 동기화 엔드포인트
- `src/app/api/sync/committees/route.ts` - 위원회 동기화 엔드포인트

### 선관위 API 관련 (Phase 2)
- `src/lib/nec-api.ts` - 선관위 API 클라이언트
  - `NecWinnerApiClient` - 당선인 정보
  - `NecPromiseApiClient` - 선거공약 정보
  - `transformWinnerData()` - 당선인 데이터 변환
  - `extractPromises()` - 공약 추출
- `src/app/api/sync/elections/route.ts` - 선거 데이터 동기화 엔드포인트

### DB 마이그레이션
- `db/migrations/002_assembly_api_integration.sql` - 의원 동기화 스키마
- `db/migrations/003_activity_data.sql` - 활동 데이터 스키마
  - `voting_records` - 표결 기록 (사용 중)
  - `bill_sponsorships` - 법안 발의 (사용 중)
  - `committee_activities` - 위원회 활동
  - `attendance_records` - 출석 기록
  - `politician_activity_stats` - 활동 통계 캐시 (사용 중)
- `db/migrations/004_election_data.sql` - 선거 데이터 스키마 (Phase 2)
  - `election_history` - 선거 이력 (당선 기록)
  - `election_promises` - 선거 공약
  - `elections` - 선거 목록 (마스터)
- `db/migrations/005_openwatch_data.sql` - OpenWatch 크로스체크 스키마 (Phase 3)
  - `politician_assets` - 자산 상세
  - `politician_asset_summary` - 자산 요약 (캐시)
  - `political_contributions` - 후원금 총액
  - `contribution_donors` - 고액후원자
  - `politician_contribution_summary` - 후원금 요약 (캐시)

### OpenWatch API 관련 (Phase 3)
- `src/lib/openwatch-api.ts` - OpenWatch API 클라이언트 (확장)
  - `OpenWatchVoteClient` - 표결 정보 (Phase 1)
  - `OpenWatchAssetClient` - 자산정보
  - `OpenWatchContributionClient` - 정치후원금
  - `transformAssetData()` - 자산 데이터 변환
  - `transformContributionTotalData()` - 후원금 총액 변환
  - `transformDonorData()` - 고액후원자 변환
- `src/app/api/sync/assets/route.ts` - 자산정보 동기화 엔드포인트
- `src/app/api/sync/contributions/route.ts` - 후원금 동기화 엔드포인트

### 정당 당직 관련 (Phase 4)
- `src/lib/party-scraper.ts` - 정당 당직 데이터 및 유틸리티
  - `PARTY_CODES` - 정당 코드 매핑
  - `POSITION_TYPES` - 당직 유형 상수
  - `CURRENT_LEADERSHIP` - 현재 지도부 데이터 (수동 관리)
  - `getCurrentLeadership()` - 지도부 조회
  - `getAllPartyLeaders()` - 당대표 목록
  - `getAllFloorLeaders()` - 원내대표 목록
- `src/app/api/sync/leadership/route.ts` - 당직 동기화 엔드포인트

### 정치인 API 업데이트
- `src/app/api/politicians/[id]/route.ts`
  - `activity_stats` 필드 추가 (표결+발의 통계)
  - `recent_bills` 필드 추가 (최근 발의 법안)
  - `recent_votes` 필드 추가 (최근 표결 기록)
  - `committee_activities` 필드 추가 (위원회 소속 정보)
  - `election_history` 필드 추가 (선거 이력) (Phase 2)
  - `election_promises` 필드 추가 (선거 공약) (Phase 2)
  - `asset_summary` 필드 추가 (자산 요약) (Phase 3)
  - `contribution_summary` 필드 추가 (후원금 요약) (Phase 3)
  - `party_positions` 필드 추가 (당직 정보) (Phase 4)

## 🔑 설정된 시크릿

- `ASSEMBLY_API_KEY`: 국회 API 키
- `SYNC_SECRET`: 동기화 API 인증 키
- `NEC_API_KEY`: 선관위 API 키 (⚠️ 설정 필요 - 공공데이터포털에서 발급)

---

## ⚠️ 알려진 이슈

### Cloudflare Workers API 호출 제한
- 전체 법안 동기화 시 "Too many API requests" 오류 발생
- 해결 방안:
  1. 샘플 모드로 분할 동기화 (`?sample=true`)
  2. Cron 작업에서 배치 처리
  3. Queue/Durable Objects 활용 고려

### OpenWatch API 의존성
- 표결 데이터가 OpenWatch 민간 서비스에 의존
- 해결 방안:
  1. 국회 원본 API 엔드포인트 발견 시 추가 연동
  2. 두 소스 크로스체크로 신뢰도 향상

---

## 다음 세션에서 할 일

**Phase 5**: 크로스체크 엔진 구현
1. 소스별 raw_data 테이블 설계
2. 데이터 비교 알고리즘
3. 불일치 감지 및 플래그 시스템

**Phase 6**: 신뢰도 시스템
1. 신뢰도 점수 계산 로직
2. 출처 표시 UI
3. 불일치 알림 시스템

**데이터 동기화 실행 필요**:
- ✅ 국회의원 데이터: `POST /api/sync/assembly` (x-sync-secret 헤더 필요)
- 위원회 데이터: `POST /api/sync/committees` (x-sync-secret 헤더 필요)
- 표결 데이터: `POST /api/sync/votes?sample=true` (x-sync-secret 헤더 필요)
- 선거 데이터: `POST /api/sync/elections?election=22대` (x-sync-secret + NEC_API_KEY 필요)
- 선거 공약 포함: `POST /api/sync/elections?election=22대&includePromises=true`
- 자산정보 데이터: `POST /api/sync/assets?sample=true` (x-sync-secret 헤더 필요)
- 후원금 데이터: `POST /api/sync/contributions?sample=true` (x-sync-secret 헤더 필요)
- 후원금+고액후원자: `POST /api/sync/contributions?includeDonors=true` (x-sync-secret 헤더 필요)
- 🆕 당직정보 데이터: `POST /api/sync/leadership` (x-sync-secret 헤더 필요)

**⚠️ 선관위 API 사용을 위해 필요한 작업**:
1. 공공데이터포털에서 NEC_API_KEY 발급 (https://www.data.go.kr/data/15000864/openapi.do)
2. Cloudflare Workers에 `NEC_API_KEY` 시크릿 설정
3. 선거 데이터 동기화 실행

**⚠️ Phase 3 완료 후 알려진 제한사항**:
1. 자산정보 API는 의원별 필터가 없어 전체 데이터를 가져온 후 이름 매핑 필요
2. 현재는 politician_assets 테이블에 politician_id가 NULL로 저장됨
3. 추후 이름 매핑 로직 또는 OpenWatch 의원 명단 API 연동 필요
