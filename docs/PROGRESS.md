# sseuksak.com 진행 현황

> 마지막 업데이트: 2026-03-06

## 프로젝트 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| 사이트 URL | https://sseuksak.com | 라이브 |
| 게시글 | **72개 공개** (91개 draft) | finance 60 + insurance 12 |
| **Google 색인** | **47개** | 노출 8,153 / 클릭 12 / CTR 0.1% |
| **Naver 색인** | **85개** | 클릭 ~130 / CTR 9.8% / 수집제한 34 |
| 도구 | **29개** | 금융 계산기 18 + 생활 2 + 시뮬레이터 4 + 기타 5 |
| 테스트 | **2개 공개** (8개 숨김) | 소비유형, 재테크성향 |
| AdSense | **4차 심사 중** | sseuksak.com "준비 중", Ads.txt "승인됨" |
| GA4 | 설치됨 | G-CMZF467RLD |
| IndexNow | 적용 | 네이버, Bing, Yandex 자동 알림 |
| **AI 콘텐츠 품질** | **완료** | 95/95 리라이팅 + 163개 팩트체크 완료 |

## 아카이브

오래된 작업 기록은 아카이브 폴더에서 확인:
- [2026년 1월 1주차](archive/PROGRESS_2026_01_WEEK1.md) (01-02 ~ 01-07)
- [2026년 1월 2주차](archive/PROGRESS_2026_01_WEEK2.md) (01-08 ~ 01-14)
- [2026년 1월 3주차](archive/PROGRESS_2026_01_WEEK3.md) (01-15 ~ 01-21)
- [2026년 1월 4주차](archive/PROGRESS_2026_01_WEEK4.md) (01-22 ~ 01-27)
- [2026년 2월 1주차](archive/PROGRESS_2026_02_WEEK1.md) (01-27 ~ 02-09)
- [2026년 2월 (2/10~2/28)](archive/PROGRESS_2026_02.md) (02-10 ~ 02-28)

---

## 2026-03-06

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Analytics 데이터 수집**: GSC + Naver Search Advisor + AdSense | ✅ |
| - GSC: 클릭 12, 노출 8,153(+60%), CTR 0.1%, 순위 7.7, 색인 47개 | ✅ |
| - Naver: 클릭 ~130(+68.8%), 노출 ~1,316, CTR 9.8%, 색인 85(+1), 수집제한 34 | ✅ |
| - AdSense: sseuksak.com "준비 중" (4차 심사 10일차), Ads.txt "승인됨" | ✅ |
| - natest.kr "주의 필요" → "준비 중"으로 변경 | ✅ |
| **Naver 수집제한 상세 분석**: 36개 중 공개 7개 / draft 29개 분류 | ✅ |
| **Naver 수집 요청 7개 제출**: 수집제한 걸린 공개 페이지 재크롤링 | ✅ |
| **내부링크 보강 (도구 페이지 연결)** | ✅ |
| - pension-calculator: 0→4개 링크 (national-pension, retirement-money, pension-savings-vs-irp, retirement-pension-dc-db) | ✅ |
| - rent-conversion-calculator: 1→2개 링크 (rent-conversion-rate-guide 본문 추가) | ✅ |
| - pyeong-calculator: 1→2개 링크 (housing-subscription-first-priority-guide 본문 추가) | ✅ |
| **문서 최적화** | ✅ |
| - PROGRESS.md: 2월 기록 아카이브 분리 (691줄→~200줄) + 다음 할 일 갱신 | ✅ |
| - SEO_INDEXING.md: 최신 데이터로 전체 갱신 (2/11→3/06) | ✅ |
| - CONTENT_INVENTORY.md: 공개/draft 분리, 누락 8개 추가 (155→163개) | ✅ |
| - NOINDEX_REPORT.md: 현재 사이트 구조 반영 갱신 (2/03→3/06) | ✅ |

**주요 인사이트:**
- Google 노출 급증 (+60%), 색인 47개로 서서히 증가
- savings-account-comparison: Google 노출 1위 (7,325) / CTR 0.04% → 타이틀 최적화 최우선
- Naver 클릭 +68.8% 지속 성장, 넷플릭스 3월 신작이 신규 견인
- 도구 페이지 내부링크 보강으로 SEO 크롤링 연결성 강화

---

## 2026-03-05

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **주거비용 시뮬레이터 신규 개발**: `/tools/housing-cost-simulator` | ✅ |
| - 전세 vs 월세 vs 매매 3종 비교, 취득세 구간별 적용 | ✅ |
| **대출 상환 전략 비교 시뮬레이터**: `/tools/loan-repayment-simulator` | ✅ |
| - 원리금균등/원금균등/만기일시 3가지 상환방식 비교 | ✅ |
| **자동차 구매 vs 리스 vs 장기렌트 시뮬레이터**: `/tools/car-cost-simulator` | ✅ |
| - 구매/리스/장기렌트 3가지 방식 장기 비용 비교 | ✅ |
| **도구 등록 업데이트**: page.tsx, sitemap.ts, layout.tsx JSON-LD, indexnow.js | ✅ |
| **내부링크 추가**: 14개 기존 글에 3개 신규 시뮬레이터 링크 16개 | ✅ |
| **얇은 글 보강**: 4개 게시글 콘텐츠 확충 | ✅ |
| **SEO 메타 최적화**: alcohol-calculator 제목/설명 키워드 최적화 | ✅ |
| **배포**: cf:deploy + cf:quick 2회 | ✅ |

---

## 2026-03-04

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Analytics 데이터 수집**: GSC + Naver Search Advisor | ✅ |
| **Naver 데이터 보정**: 이전 기록(2/24~3/3) 클릭/노출 값 수정 | ✅ |
| **비활성 카테고리 noindex**: health, tech, education, lifestyle | ✅ |
| **국민성장펀드 게시글 작성**: national-growth-fund-2026.md (팩트체크 완료) | ✅ |
| **배포**: cf:quick (IndexNow 115개) | ✅ |

---

## 2026-03-03

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Git Push**: 미푸시 커밋 3개 GitHub 동기화 | ✅ |
| **Analytics 데이터 수집**: GSC + Naver + AdSense | ✅ |
| **GSC 색인 요청**: 26개 전체 완료 | ✅ |
| **404 오류 분석**: youth-future-savings undraft + 태그 페이지 조치 불필요 확인 | ✅ |
| **에버그린 콘텐츠 7개 신규 작성** | ✅ |
| - family-loan-agreement, monthly-rent-tax-credit, social-insurance-guide | ✅ |
| - bank-account-splitting, housing-subscription-first-priority | ✅ |
| - car-insurance-special-coverage, income-deduction-vs-tax-credit | ✅ |
| **타이틀 정리**: 전 페이지 '| 쓱싹' 중복 제거 (24개 파일 수정) | ✅ |
| **배포**: cf:deploy (전체 배포) | ✅ |

---

## 다음 할 일

### 우선순위 높음
- [ ] savings-account-comparison-2026 타이틀/메타 최적화 (Google 7,325노출 / CTR 0.04%)
- [ ] AdSense 4차 심사 결과 확인 (2/25 제출, 10일차)
- [ ] GSC 404 에러 6건 조사 및 해결

### 우선순위 중간
- [ ] Naver 수집제한 34건 모니터링 (draft 전환 영향, 자연 해소 대기)
- [ ] Naver H1 복수 SEO 이슈 14건 점검
- [ ] 금융 콘텐츠 추가 작성 (계산기 연동형 가이드 확대)

### 콘텐츠 확장 (선택)
- [ ] 넷플릭스 4월 신작 게시글 (3월 신작이 네이버 주요 트래픽원)
- [ ] 금융 테마 테스트 추가 (절약습관, 보험IQ, 노후준비도)
- [ ] draft 글 중 품질 높은 것 선별 공개 (현재 72개 공개 / 91개 draft)

---

## 주요 링크

- **프로덕션**: https://sseuksak.com
- **GitHub**: https://github.com/granadu0417-crypto/sseuksak-blog
