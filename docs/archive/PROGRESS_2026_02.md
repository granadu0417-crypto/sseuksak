# 진행 현황 아카이브: 2026년 2월 (2/10 ~ 2/28)

> 2026-02-10 ~ 2026-02-28 작업 기록
> 메인 문서: [PROGRESS.md](../PROGRESS.md)

---

## 2026-02-28 (Phase 5)

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Phase 5: 보험/생활금융 클러스터 5개 신규** | ✅ |
| - health-insurance-claim-guide-2026 (실비보험 청구 방법: 앱으로 3분 만에 청구하는 법) | ✅ |
| - insurance-review-checklist-2026 (보험 리모델링 체크리스트: 불필요한 보험료 줄이는 5단계) | ✅ |
| - youth-housing-policy-summary-2026 (2026 청년 주거지원 총정리: 전세·월세·청약) | ✅ |
| - insurance-comparison-site-guide-2026 (보험다모아 vs 보험비교 사이트 비교) | ✅ |
| - debt-repayment-strategy-2026 (빚 갚는 순서: 눈덩이 vs 눈사태 전략 비교) | ✅ |
| **문서 업데이트** | ✅ |
| - CONTENT_INVENTORY.md: 5개 글 추가 (150→155개) | ✅ |
| - FACTCHECK_LOG.md: 5개 검증 기록 추가 | ✅ |
| **전체 Phase 1~5 완료**: 공개 글 35→63개, 계산기 16→20개 | ✅ |

## 2026-02-28 (Phase 4)

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Phase 4: 세금/정부지원 클러스터 + 신규 계산기 1개 (6개 신규 + 1개 undraft + 계산기 1개)** | ✅ |
| - 종합소득세 계산기 신규 개발 (`/tools/income-tax-calculator`) | ✅ |
| - income-tax-filing-guide-2026 (5월 종합소득세 신고 가이드) | ✅ |
| - earned-income-tax-credit-2026 (근로장려금 가이드 undraft + 리라이트) | ✅ |
| - acquisition-tax-guide-2026 (아파트 취득세 1주택·다주택 비교) | ✅ |
| - capital-gains-tax-guide-2026 (양도세 계산: 비과세 조건과 장기보유특별공제) | ✅ |
| - property-holding-tax-guide-2026 (종합부동산세 기준 금액과 세율) | ✅ |
| - medical-expense-deduction-guide-2026 (의료비 세액공제: 실비청구 동시 가능?) | ✅ |
| - childcare-expense-deduction-2026 (자녀 교육비·양육비 공제 총정리) | ✅ |
| **문서 업데이트** | ✅ |
| - CONTENT_INVENTORY.md: 6개 글 추가 (144→150개) | ✅ |
| - FACTCHECK_LOG.md: 7개 검증 기록 추가 (계산기 1 + 가이드 6) | ✅ |

## 2026-02-28 (Phase 3)

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Phase 3: 연금/부동산 클러스터 + 신규 계산기 2개 (6개 신규 + 계산기 2개)** | ✅ |
| - 국민연금 수령액 계산기 신규 개발 (`/tools/pension-calculator`) | ✅ |
| - 전월세 전환율 계산기 신규 개발 (`/tools/rent-conversion-calculator`) | ✅ |
| - retirement-pension-dc-db-comparison-2026 (퇴직연금 DC vs DB 비교) | ✅ |
| - retirement-money-planning-guide-2026 (은퇴 후 노후자금 계획) | ✅ |
| - didimdol-vs-bogeumjari-loan-2026 (디딤돌 vs 보금자리론 비교) | ✅ |
| - housing-subscription-point-guide-2026 (청약 가점 계산과 당첨 전략) | ✅ |
| - isa-account-guide-2026 (ISA 계좌 세제 혜택 총정리) | ✅ |
| - emergency-fund-guide-2026 (비상금 적정 금액 계산) | ✅ |
| **문서 업데이트** | ✅ |
| - CONTENT_INVENTORY.md: 6개 글 추가 (138→144개) | ✅ |
| - FACTCHECK_LOG.md: 6개 글 검증 기록 추가 | ✅ |
| **Phase 2: 시즌 콘텐츠 + 신규 계산기 (5개 신규 + 계산기 1개)** | ✅ |
| - 건강보험료 계산기 신규 개발 (`/tools/health-insurance-calculator`) | ✅ |
| - health-insurance-settlement-guide-2026 (4월 건보료 정산 가이드) | ✅ |
| - credit-loan-comparison-guide-2026 (신용대출 금리 비교) | ✅ |
| - national-pension-expected-amount-2026 (국민연금 예상 수령액) | ✅ |
| - pension-savings-vs-irp-guide-2026 (연금저축 vs IRP 비교) | ✅ |
| - rent-conversion-rate-guide-2026 (전월세 전환율 계산법) | ✅ |
| **문서 업데이트** | ✅ |
| - CONTENT_INVENTORY.md: 5개 글 추가 (133→138개) | ✅ |
| - FACTCHECK_LOG.md: 5개 글 검증 기록 추가 | ✅ |
| **배포** | ✅ |
| - cf:quick 배포 완료 | ✅ |

### Phase 2 콘텐츠 구조 다양성 검증
| 글 | 구조 | 도입부 | 연동 계산기 |
|----|------|--------|-----------|
| health-insurance-settlement | E (PREP) | 숫자/통계 | health-insurance-calculator |
| credit-loan-comparison | A (역피라미드) | 상황묘사 | loan-calculator |
| national-pension-expected-amount | F (FAQ) | 오해바로잡기 | pension-calculator (Phase3) |
| pension-savings-vs-irp | C (비교분석) | 비교/대조 | tax-refund-calculator |
| rent-conversion-rate | B (문제해결) | 결론먼저 | loan-calculator |

---

## 2026-02-27

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **Phase 1: 기존 계산기 가이드 연결 (5개 신규 + CTR 1건)** | ✅ |
| - savings-account-comparison CTR 개선 (메타태그 리라이트) | ✅ |
| - hourly-wage-monthly-salary-guide-2026 (시급·월급·연봉 환산) | ✅ |
| - true-hourly-wage-guide-2026 (출퇴근 포함 진짜 시급) | ✅ |
| - subscription-cost-save-guide-2026 (구독료 정리 절약법) | ✅ |
| - savings-interest-comparison-guide-2026 (적금 vs 예금 vs CMA) | ✅ |
| - year-end-refund-march-2026 (3월 환급금 입금일 확인법) | ✅ |
| **문서 업데이트** | ✅ |
| - CONTENT_INVENTORY.md: 5개 글 추가 (128→133개) | ✅ |
| - FACTCHECK_LOG.md: 5개 글 검증 기록 추가 | ✅ |
| **배포** | ✅ |
| - cf:quick 배포 완료 | ✅ |

### Phase 1 콘텐츠 구조 다양성 검증
| 글 | 구조 | 도입부 | 연동 계산기 |
|----|------|--------|-----------|
| hourly-wage-monthly-salary | C (비교분석) | 숫자/통계 | hourly-wage-calculator |
| true-hourly-wage | H (Before-After) | 상황묘사 | true-hourly-wage |
| subscription-cost-save | B (문제해결) | 오해바로잡기 | subscription-audit |
| savings-interest-comparison | C (비교분석) | 비교/대조 | savings-interest-calculator |
| year-end-refund-march | D (단계별) | 결론먼저 | tax-refund-calculator |

---

## 2026-02-26

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **계산기 연동형 실전 가이드 10개 신규 작성** | ✅ |
| - 연봉 실수령액 비교 (salary-take-home-comparison-2026) | ✅ |
| - 주담대 vs 신용대출 이자 비교 (mortgage-vs-credit-loan-interest-2026) | ✅ |
| - 퇴직금 근속별 비교 (severance-pay-by-tenure-2026) | ✅ |
| - 증여세 실전 가이드 (gift-tax-practical-guide-2026) | ✅ |
| - 실업급여 수령액·기간 (unemployment-benefit-amount-guide-2026) | ✅ |
| - 연말정산 환급액 가이드 (tax-refund-deduction-guide-2026) | ✅ |
| - 주휴수당 월급 계산 (weekly-holiday-pay-monthly-salary-2026) | ✅ |
| - FIRE 조기은퇴 시뮬레이션 (fire-early-retirement-simulation-2026) | ✅ |
| - 부가세 계산 가이드 (vat-calculation-guide-2026) | ✅ |
| - 생계급여 자가진단 (livelihood-benefit-eligibility-check-2026) | ✅ |
| **10개 글 팩트체크 완료** | ✅ |
| **Google Search Console 색인 요청 10개 완료** | ✅ |
| **Naver Search Advisor 수집 요청 10개 완료** | ✅ |
| **Analytics 2026-02-26 보고서 작성** | ✅ |
| **GSC 미색인 16건 원인 분석** | ✅ |
| **Naver SEO H1 복수 14건 분석** | ✅ |
| **사이트맵 재제출** (GSC + Naver) | ✅ |

---

## 2026-02-25

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **검색 인덱스 draft 필터링** | ✅ |
| - `scripts/generate-search-index.js`에 draft 필터 추가 (118개→25개) | ✅ |
| **사이트 정체성 금융 니치로 재정비** | ✅ |
| - 홈페이지 히어로: "생활 금융 계산기 & 가이드" | ✅ |
| - 네비게이션: 카테고리 6개→2개 (금융/투자, 보험/법률) | ✅ |
| - 메타데이터: title, description, keywords, OG/Twitter 전체 업데이트 | ✅ |
| **도구 페이지 정리**: 20개→16개 | ✅ |
| **테스트 페이지 정리**: 10개→2개 | ✅ |
| **AdSense 4차 재신청** (2/25) | ✅ |

---

## 2026-02-24

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **AdSense 3차 거절 분석 및 니치 전환** | ✅ |
| - 거절 사유: "가치가 별로 없는 콘텐츠" 분석 | ✅ |
| - "생활 금융 계산기" 니치로 전환 결정 | ✅ |
| **93개 글 draft 처리 및 배포** | ✅ |
| **신규 게시글 8개 팩트체크 및 오류 수정** | ✅ |
| **신규 계산기 5개 개발 및 배포** (평수, 나이, 부가세, 적금이자, 실업급여) | ✅ |
| **신규 게시글 8개 일괄 작성 및 배포** (#111~#118) | ✅ |
| **Google Search Console 색인 요청 8개 + Naver 수집 요청 8개** | ✅ |

---

## 2026-02-23

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| Google Search Console 404 에러 9개 URL 확인 및 색인 재요청 | ✅ |
| **전체 게시글 색인 요청 100% 완료 (남은 URL: 0개)** | ✅ |
| **신규 게시글: 미성년자 주식 계좌 개설·증여세·절세 가이드 (#105)** | ✅ |
| **신규 게시글 5개 일괄 작성 (#106~#110)** | ✅ |
| - 전세사기 예방법, 봄철 알레르기, 투잡 종합소득세, 건강검진 결과표, 자동차 정기검사 | ✅ |

---

## 2026-02-13

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **netflix-march-2026-new-releases.md** 신규 게시글 작성 | ✅ |
| **Google 색인 생성 요청 추가 28개 (총 94개 완료)** | ✅ |

---

## 2026-02-12

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| 숨은 금융자산 조회·환급 완벽 가이드 작성 (#102) | ✅ |
| 신용점수 올리는 방법과 흔한 착각 5가지 작성 (#103) | ✅ |
| **Google/Naver/AdSense 최신 데이터 수집** | ✅ |
| **Google 수동 색인 요청 66개 URL 완료** | ✅ |
| PROGRESS.md 아카이브 분리 (1/27~2/9 → archive/) | ✅ |

---

## 2026-02-11

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| 햇살론 2026 가이드 작성 (#100) | ✅ |
| 교통범칙금·과태료 가이드 작성 (#101) | ✅ |
| **PageSpeed 모바일 성능: 54점 → 73점 (+19점)** | ✅ |
| - Core Web Vitals: FCP 4.7→3.9초, LCP 6.0→4.4초, TBT 430→100ms | ✅ |

---

## 2026-02-10

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **SEO 6개 항목 개선** | ✅ |
| - Sitemap lastmod 수정 + 누락 도구 7개 추가 | ✅ |
| - React #418 hydration 에러 개선 | ✅ |
| - 계산기 15개 JSON-LD 추가 | ✅ |
| - 홈페이지 최신글 3개 → 6개 | ✅ |
| - ARIA 접근성 강화 | ✅ |
| - 도구/테스트 페이지 브레드크럼 추가 | ✅ |
| **4대 플랫폼 현황 파악 + AdSense 재검토 제출** | ✅ |
| **Naver + Google 신규 콘텐츠 6개 색인 요청** | ✅ |
