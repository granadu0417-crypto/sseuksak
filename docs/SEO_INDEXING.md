# SEO 색인 관리 가이드

sseuksak.com 블로그의 검색엔진 색인 관리를 위한 문서입니다.

---

## 현재 색인 현황

### Google Search Console

| 항목 | 상태 | 날짜 |
|------|------|------|
| 사이트 인증 | ✅ 완료 | 2026-01-05 |
| sitemap.xml 제출 | ✅ 완료 | 2026-01-05 |
| 발견된 URL | 226개 | 2026-01-12 |
| 색인된 URL | ~9개 | 2026-01-19 |
| 미색인 URL | ~217개 | 2026-01-19 |
| **유효성 검사 요청** | ✅ 진행 중 | 2026-01-12 |

### 색인 개선 작업 (2026-01-19)

| 작업 | 상태 | 효과 |
|------|------|------|
| 전체 게시글 출처/참고문헌 추가 | ✅ 완료 | E-E-A-T 신뢰도 향상 |
| AuthorInfo 컴포넌트 추가 | ✅ 완료 | 저자 신뢰도 표시 |
| robots.ts 개선 (모든 크롤러 허용) | ✅ 완료 | 크롤링 접근성 향상 |
| 짧은 글 3개 콘텐츠 보강 | ✅ 완료 | 콘텐츠 품질 향상 |
| 신뢰도 페이지 확인 | ✅ 완료 | About, Privacy, Terms, Contact |

### 네이버 서치어드바이저

| 항목 | 상태 | 날짜 |
|------|------|------|
| 사이트 인증 | ✅ 완료 | 2026-01-05 |
| sitemap.xml 제출 | ✅ 완료 | 2026-01-05 |
| 노출 수 | 1회 | 2026-01-11 기준 |
| 클릭 수 | 0회 | 2026-01-11 기준 |

---

## 색인 요청 방법

### Google Search Console - 대량 색인 요청 (권장)

**"수정 결과 확인" 기능 사용** - 가장 효율적인 방법

1. [Google Search Console](https://search.google.com/search-console) 접속
2. 좌측 메뉴: **색인생성** → **페이지** 클릭
3. 하단으로 스크롤하여 미색인 사유 클릭 (예: "발견됨 - 현재 색인이 생성되지 않음")
4. **"수정 결과 확인"** 버튼 클릭
5. 유효성 검사가 시작되며, Google이 해당 URL들을 재크롤링

**장점**:
- 한 번에 수백 개 URL 검토 요청 가능
- URL 하나씩 요청하는 것보다 훨씬 효율적
- Google이 우선순위에 따라 크롤링 진행

### Google Search Console - 개별 URL 색인 요청

특정 URL만 빠르게 색인하고 싶을 때 사용:

1. 상단 검색창에 URL 입력 (예: `https://sseuksak.com/posts/minimum-wage-2026`)
2. URL 검사 결과 확인
3. "색인 생성 요청" 버튼 클릭
4. 1-2분 대기 후 "색인 생성 요청됨" 확인

**주의**: URL당 1-2분 소요되므로 대량 요청 시 비효율적

### 네이버 서치어드바이저

1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속
2. 좌측 메뉴: **요청** → **웹 페이지 수집** 또는 **사이트맵 제출**
3. 사이트맵이 이미 제출되어 있으면 추가 작업 불필요
4. 네이버는 자동으로 크롤링 진행

---

## 색인 상태별 대응

### "발견됨 - 현재 색인이 생성되지 않음"

| 의미 | 대응 |
|------|------|
| sitemap에서 URL을 발견했지만 아직 크롤링하지 않음 | "수정 결과 확인" 버튼으로 재검토 요청 |

### "크롤링됨 - 현재 색인이 생성되지 않음"

| 의미 | 대응 |
|------|------|
| 크롤링은 했지만 품질/가치 문제로 색인 안 됨 | 콘텐츠 품질 개선 후 재요청 |

### "중복 - 제출된 URL이 표준으로 선택되지 않음"

| 의미 | 대응 |
|------|------|
| 다른 URL이 canonical로 선택됨 | canonical 태그 확인 및 수정 |

---

## 색인 요청 기록

### 2026-01-28

| 작업 | 대상 | 결과 |
|------|------|------|
| H1 중복 이슈 분석 | 28개 페이지 | ✅ 이미 수정됨 (캐시 문제) |
| 수집 제한 분석 | 10개 페이지 | ✅ 완료 |
| 네이버 재크롤링 요청 | 8개 URL | ✅ 제출 완료 |

**재크롤링 요청한 URL:**
1. /posts/minimum-wage-2026
2. /posts/health-insurance-premium-2026
3. /posts/national-pension-reform-2026
4. /posts/trend-korea-2026-keywords
5. /posts/car-tax-annual-payment-2026
6. /posts/car-insurance-policy-changes-2026
7. /posts/year-end-tax-simplification-service-2026
8. /posts/lunar-new-year-train-ticket-2026

**수집 제한 페이지 분석 결과:**

| 유형 | 개수 | 상태 | 조치 |
|------|------|------|------|
| 리다이렉션 | 3개 | 정상 | URL 구조 변경 (-test 제거) |
| 접근 불가 (정상 작동) | 4개 | 캐시 오류 | 재크롤링 요청 |
| 접근 불가 (OG 이미지) | 2개 | 404 | Unsplash로 대체, 자동 해결 |
| 접근 불가 (삭제됨) | 1개 | 404 | ktx-discount-2026, 자동 제거 |

---

### 2026-01-19

| 작업 | 대상 | 결과 |
|------|------|------|
| robots.ts 개선 | 모든 크롤러 허용 규칙 추가 | ✅ 완료 |
| 콘텐츠 품질 개선 | 40개 게시글 출처 추가 | ✅ 완료 |
| E-E-A-T 강화 | AuthorInfo 컴포넌트 추가 | ✅ 완료 |
| **배포 후 IndexNow 실행 필요** | 전체 URL | ⏳ 대기 |
| **Search Console 재검토 요청 필요** | 미색인 페이지 | ⏳ 대기 |

### 2026-01-12

| 작업 | 대상 | 결과 |
|------|------|------|
| Google 유효성 검사 요청 | 222개 페이지 | ✅ 시작됨 |
| Google 개별 색인 요청 | car-tax-annual-payment-2026 | ✅ 요청됨 |
| Google 개별 색인 요청 | minimum-wage-2026 | ✅ 요청됨 |
| Google 개별 색인 요청 | year-end-tax-settlement-2026 | ✅ 요청됨 |
| 네이버 sitemap 확인 | sitemap.xml | ✅ 이미 제출됨 (01.05) |

---

## 주기적 점검 사항

### 주간 점검

- [ ] Google Search Console 색인 현황 확인
- [ ] 네이버 서치어드바이저 노출/클릭 현황 확인
- [ ] 새 콘텐츠 색인 여부 확인

### 월간 점검

- [ ] 미색인 URL 사유 분석
- [ ] 색인 증가 추이 확인
- [ ] Core Web Vitals 점수 확인

---

## 관련 링크

| 도구 | URL |
|------|-----|
| Google Search Console | https://search.google.com/search-console |
| 네이버 서치어드바이저 | https://searchadvisor.naver.com |
| PageSpeed Insights | https://pagespeed.web.dev |
| Google 색인 상태 도움말 | https://support.google.com/webmasters/answer/7440203 |

---

## 참고 문서

- [CLAUDE.md](../CLAUDE.md) - 프로젝트 규칙
- [PROGRESS.md](./PROGRESS.md) - 진행 현황
- [CONTENT_VERIFICATION.md](./CONTENT_VERIFICATION.md) - 콘텐츠 검증 가이드
