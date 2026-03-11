# 사이트 전환 실행 계획

> **작성일**: 2026-03-10
> **목적**: AdSense 4차 심사 결과에 따른 사이트 구조 전환 실행 가이드
> **핵심 방향**: "백과사전형 금융 블로그" → "금융 계산기 + 실용 가이드 사이트"

---

## 1. 현재 상태 진단

### 1-1. 트래픽 현실

| 지표 | 수치 | 의미 |
|------|------|------|
| 공개 글 | 76개 | 많음 |
| 실제 클릭 받는 글 | **4~5개** | 76개 중 6% |
| Google CTR | 0.2% | 매우 낮음 |
| 최대 트래픽 페이지 | alcohol-calculator (도구) | **글이 아니라 도구가 트래픽을 만듦** |

### 1-2. 콘텐츠 경쟁력 문제 (솔직한 진단)

| 문제 | 심각도 | 설명 |
|------|--------|------|
| AI 생성 느낌 | **심각** | 일관된 문체, 동일 구조, 백과사전식 나열 |
| 개인 경험 부재 | **심각** | E-E-A-T의 Experience 0점 |
| 이미지 없음 | 높음 | 텍스트 only, 경쟁사 대비 시각적 매력 없음 |
| 얇은 글 다수 | 높음 | 5,000B 미만 글 12개 |
| 일괄 발행 | 중간 | 75개 글이 1~2월 집중 발행 → "콘텐츠 팜" 감지 위험 |
| 고유 데이터 없음 | 중간 | 정부사이트 정보 재구성 수준 |

### 1-3. 진짜 경쟁력

| 자산 | 경쟁력 | 이유 |
|------|--------|------|
| **계산기/시뮬레이터 29개** | **높음** | 인터랙티브, 즉시 가치 제공, 복제 어려움 |
| 블로그 글 76개 | 낮음 | 정부사이트, KB Think 등과 동일 정보 |
| 내부 링크 네트워크 | 중간 | 도구↔글 연결 양호 |

---

## 2. AdSense 심사 결과별 액션

### 시나리오 A: 4차 승인 시

Phase 3, 4만 점진적으로 진행. 기존 콘텐츠 대규모 변경 불필요.

| 순서 | 작업 | 우선순위 |
|------|------|----------|
| 1 | 상위 10개 도구 페이지 FAQ/사용예시 추가 (Phase 3) | 즉시 |
| 2 | 메인 페이지를 도구 중심으로 개편 (Phase 4) | 1주 내 |
| 3 | 얇은 글(5,000B 미만) 12개만 draft 처리 | 1주 내 |
| 4 | 월 2~3개씩 기존 글 품질 개선 | 점진적 |

### 시나리오 B: 4차 거절 시 (메인 시나리오)

Phase 1~5 전체 실행. 아래 상세 계획 따름.

---

## 3. Phase 1: 콘텐츠 대정리 (글 76개 → 25개)

### 3-1. 유지할 글 25개 (확정 목록)

#### A그룹: 트래픽 실적 있는 글 (5개) — 무조건 유지

| # | 파일명 | 이유 | 크기 |
|---|--------|------|------|
| 1 | `savings-account-comparison-2026` | Google 노출 7,653, 클릭 3 | 10,324B |
| 2 | `samsung-special-dividend-guide-2026` | Google 클릭 3, CTR 1.7% | 11,839B |
| 3 | `car-individual-consumption-tax-2026` | Google 클릭 2, CTR 1.5% | — |
| 4 | `cherry-blossom-forecast-2026` | Naver 상승중 (현재 lifestyle draft → 복원 검토) | — |
| 5 | `fire-early-retirement-simulation-2026` | FIRE 계산기 연결, 검색 수요 | 8,756B |

#### B그룹: 도구 직접 연결 글 (12개) — 계산기 사용 맥락 제공

| # | 파일명 | 연결 도구 | 크기 |
|---|--------|----------|------|
| 6 | `health-insurance-premium-2026` | 건강보험료 계산기 | 22,805B → 축소 |
| 7 | `credit-score-guide-2026` | (신용점수 체크리스트 도구화 가능) | 16,347B → 축소 |
| 8 | `jeonse-vs-wolse-cost-comparison-2026` | 주거비용 시뮬레이터 | 12,761B |
| 9 | `mortgage-rate-comparison-2026` | 대출이자 계산기 | 13,039B |
| 10 | `year-end-tax-settlement-2026` | 연말정산 계산기 | — |
| 11 | `freelancer-side-job-income-tax-guide-2026` | 종합소득세 계산기 | 16,371B → 축소 |
| 12 | `unemployment-benefit-amount-guide-2026` | 실업급여 계산기 | 10,496B |
| 13 | `national-pension-expected-amount-2026` | 국민연금 수령액 계산기 | 5,807B → 보강 |
| 14 | `hourly-wage-monthly-salary-guide-2026` | 시급 계산기 | 5,822B → 보강 |
| 15 | `gift-tax-practical-guide-2026` | 증여세 계산기 | 9,904B |
| 16 | `salary-take-home-comparison-2026` | 연봉 실수령액 계산기 | 10,833B |
| 17 | `savings-interest-comparison-guide-2026` | 적금 이자 계산기 | 5,864B → 보강 |

#### C그룹: 독립적 가치가 높은 글 (8개)

| # | 파일명 | 선정 이유 | 크기 |
|---|--------|----------|------|
| 18 | `gold-investment-guide-2026` | 깊이, 독립 수요 높음 | 17,534B |
| 19 | `family-loan-agreement-guide-2026` | 실용적, 차용증 템플릿 | 16,249B |
| 20 | `jeonse-fraud-prevention-guide-2026` | 최근 팩트체크 완료 | 15,983B |
| 21 | `applyhome-guide-2026` | 청약 가이드, 수요 높음 | — |
| 22 | `2026-credit-card-comparison` | 비교 콘텐츠, 수요 높음 | 13,998B |
| 23 | `travel-insurance-comparison-2026` | 비교 콘텐츠 | 16,428B |
| 24 | `etf-investment-guide-2026` | 깊이 있음, FIRE 연결 | 18,955B → 축소 |
| 25 | `ima-investment-account-guide-2026` | IMA 가이드, 희소성 | 18,716B → 축소 |

### 3-2. Draft 처리할 글 (51개)

아래 글들은 전부 `draft: true`로 변경:

```
# 얇은 글 (5,000B 미만) — 12개, 전부 draft
childcare-expense-deduction-2026          (4,911B)
youth-housing-policy-summary-2026         (5,001B)

# 도구 연결 없는 정보 나열형 — 전부 draft
birth-support-benefit-guide-2026
unemployment-benefits-guide-2026
earned-income-tax-credit-2026
youth-rent-support-2026
minimum-wage-2026
year-end-tax-simplification-service-2026
vat-filing-guide-january-2026
self-employed-tax-guide-2026
real-estate-tax-guide-2026
car-tax-annual-payment-2026
national-pension-reform-2026
youth-policy-2026
youth-future-savings-2026
youth-savings-comparison-2026
small-business-support-2026
jeonse-loan-comparison-2026
sunloan-2026-reform-guide
2026-investment-strategy-guide
resignation-checklist-2026
parental-leave-benefit-guide-2026
livelihood-support-fund-2026
employment-subsidy-guide-2026
maternity-leave-benefit-guide-2026
national-scholarship-student-loan-guide-2026
worker-meal-support-2026
gyeonggi-jeonse-interest-support-2026
synthetic-nicotine-e-cigarette-regulation-2026
inheritance-forfeiture-system-2026
capital-gains-tax-surcharge-deadline-2026
just-give-welfare-program-2026
gift-tax-guide-2026
basic-livelihood-security-2026
hidden-financial-assets-guide-2026
youth-tomorrow-savings-account-2026
national-growth-fund-2026
bitcoin-crash-factcheck-2026
minor-stock-account-gift-tax-guide-2026
four-major-insurance-guide-2026
employment-contract-guide-2026
mortgage-vs-credit-loan-interest-2026
severance-pay-by-tenure-2026
tax-refund-deduction-guide-2026
weekly-holiday-pay-monthly-salary-2026
vat-calculation-guide-2026
livelihood-benefit-eligibility-check-2026
income-deduction-vs-tax-credit-guide-2026
bank-account-splitting-guide-2026
monthly-rent-tax-credit-guide-2026
housing-subscription-first-priority-guide-2026
loan-refinancing-guide-2026
jeonse-deposit-guarantee-insurance-2026
income-tax-filing-guide-2026
acquisition-tax-guide-2026
capital-gains-tax-guide-2026
property-holding-tax-guide-2026
medical-expense-deduction-guide-2026
health-insurance-claim-guide-2026
insurance-review-checklist-2026
year-end-refund-march-2026
retirement-money-planning-guide-2026
subscription-cost-save-guide-2026
credit-loan-comparison-guide-2026
health-insurance-settlement-guide-2026
housing-subscription-point-guide-2026
pension-savings-vs-irp-guide-2026
isa-account-guide-2026
retirement-pension-dc-db-comparison-2026
emergency-fund-guide-2026
didimdol-vs-bogeumjari-loan-2026
true-hourly-wage-guide-2026
rent-conversion-rate-guide-2026
debt-repayment-strategy-2026
```

#### 보험 카테고리 — 4개만 유지, 8개 draft

**유지 (4개):**
- `travel-insurance-comparison-2026` (C그룹에 포함)
- `car-insurance-renewal-guide-2026` (실용적 비교)
- `5th-generation-health-insurance-guide-2026` (수요 높음)
- `social-insurance-guide-for-beginners-2026` (4대보험 계산기 연결)

**Draft 처리 (8개):**
```
car-insurance-policy-changes-2026
driver-insurance-guide-2026
pet-insurance-comparison-2026
prenatal-insurance-guide-2026
health-insurance-claim-guide-2026
insurance-review-checklist-2026
insurance-comparison-site-guide-2026
car-insurance-special-coverage-guide-2026
```

### 3-3. 실행 방법

```bash
# 각 파일의 frontmatter에 draft: true 추가
# 예시:
# ---
# title: "..."
# draft: true    ← 이 줄 추가
# ---
```

### 3-4. 정리 후 예상 결과

| 항목 | Before | After |
|------|--------|-------|
| 공개 글 | 76개 | **25개** |
| 공개 도구 | 29개 | 29개 |
| 총 공개 페이지 | ~107개 | ~56개 |
| "얇은" 글 비율 | 16% (12/76) | **0%** |
| 도구 연결 글 비율 | 17% (13/76) | **48%** (12/25) |

---

## 4. Phase 2: 남은 25개 글 품질 개선

### 4-1. 전체 적용 규칙

#### 문체 변경

| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 도입부 | "2026년 X는 Y입니다. Z법에 따라..." | "이번 달 급여명세서에서 X가 달라졌다면, 이유는 이것이다" |
| 소제목 | "~은 어떻게 처리됩니까" | "~하면 어떻게 되나" / "~하는 법" |
| 본문 경어 | "~입니다/합니다" 100% | "~이다/한다" 기본체 (핵심 안내만 경어) |
| 글 끝맺음 | "출처 및 참고문헌" (논문식) | "관련 도구" + "더 읽어보기" |

#### 구조 변경 — 모든 글에 적용

```
[도입부] — 상황/문제 제시 (3~4문장, 공감형)
    ↓
[30초 요약 박스] — 핵심 숫자/결론 요약
    ↓
[본문] — 핵심 3~5개 섹션만 (불필요 섹션 삭제)
    ↓
[계산기 CTA] — "내 경우는? → 계산기로 확인"
    ↓
[관련 글 2~3개]
```

#### 길이 조정

| 유형 | 목표 크기 | 기준 |
|------|----------|------|
| 도구 연결 글 | 6,000~10,000B | 맥락 제공 + 계산기 유도 |
| 독립 가이드 | 10,000~15,000B | 깊이 있되 군더더기 제거 |
| 비교 글 | 8,000~12,000B | 표 중심, 결론 명확 |

### 4-2. 글별 구체적 개선 사항

#### 축소 대상 (현재 너무 긴 글)

| 글 | 현재 | 목표 | 삭제할 섹션 |
|----|------|------|-----------|
| `health-insurance-premium-2026` | 22,805B | 12,000B | 외국인 가입, 체납 불이익, 보험료율 산출 근거 상세, 프리랜서/플랫폼 노동자 (별도 글감) |
| `etf-investment-guide-2026` | 18,955B | 12,000B | 매수 주문 프로세스 (당연한 내용), NAV/추적오차 상세 (초보자 불필요) |
| `freelancer-side-job-income-tax-guide-2026` | 16,371B | 10,000B | 과도한 계산 예시 축소, 핵심 계산만 유지 |
| `credit-score-guide-2026` | 16,347B | 12,000B | 착각 5가지 + 올리는 방법 7가지 중 반복되는 내용 합치기 |
| `ima-investment-account-guide-2026` | 18,716B | 12,000B | 과도한 배경 설명 축소 |

#### 보강 대상 (현재 너무 짧은 글)

| 글 | 현재 | 목표 | 추가할 내용 |
|----|------|------|-----------|
| `national-pension-expected-amount-2026` | 5,807B | 8,000B | 납부 기간별 예상 수령액 표, 계산기 사용 예시 |
| `hourly-wage-monthly-salary-guide-2026` | 5,822B | 7,000B | 업종별 평균 시급 비교표, 계산기 CTA 강화 |
| `savings-interest-comparison-guide-2026` | 5,864B | 7,000B | 세후 실수령 비교표 확대, ISA 활용팁 |

### 4-3. 개선 우선순위

| 순서 | 글 | 이유 |
|------|-----|------|
| 1 | `savings-account-comparison-2026` | 노출 7,653인데 CTR 0.04% — 즉시 개선 효과 |
| 2 | `health-insurance-premium-2026` | 가장 긴 글, 축소+문체 변경 효과 큼 |
| 3 | `credit-score-guide-2026` | 구성 좋으나 AI 느낌 강함 |
| 4 | `etf-investment-guide-2026` | 축소 필요 |
| 5 | B그룹 도구 연결 글 (12개) | 계산기 CTA 삽입 |
| 6 | C그룹 독립 글 (8개) | 문체 변경 |

---

## 5. Phase 3: 도구 페이지 콘텐츠 강화

### 5-1. 모든 도구에 추가할 요소

현재 도구 페이지 = 입력 UI + 결과 + 참고사항
→ 변경: 입력 UI + 결과 + **사용 예시** + **FAQ** + 관련 도구 + 관련 글

#### 추가할 3가지

**a) 사용 예시 섹션**
```tsx
// 도구 결과 아래에 추가
<section>
  <h2>사용 예시</h2>
  <p>월급 300만원, 부양가족 없음, 비과세 식대 20만원 적용 시:</p>
  <ul>
    <li>건강보험료: 100,730원</li>
    <li>국민연금: 135,000원</li>
    <li>실수령액: 2,487,000원</li>
  </ul>
</section>
```

**b) FAQ 섹션 (FAQPage schema 포함)**
```tsx
// 도구 페이지 하단에 추가
<section>
  <h2>자주 묻는 질문</h2>
  <details>
    <summary>Q. 비과세 식대는 어떻게 적용하나요?</summary>
    <p>A. 월 20만원 한도로 급여에서 제외됩니다. 회사 급여체계에 따라 다릅니다.</p>
  </details>
</section>

// + JSON-LD FAQPage schema
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>
```

**c) 관련 글 링크 섹션**
```tsx
<section>
  <h2>더 알아보기</h2>
  <ul>
    <li><a href="/posts/health-insurance-premium-2026">건강보험료 절약하는 법</a></li>
  </ul>
</section>
```

### 5-2. 도구별 FAQ 예시 (상위 10개)

#### 1. alcohol-calculator (트래픽 1위)
- Q. 소주 2병 마시면 몇 시간 후 운전 가능한가요?
- Q. 체중에 따라 알코올 분해 시간이 다른가요?
- Q. 음주 후 다음 날 아침 운전해도 되나요?

#### 2. salary-calculator (연봉 실수령액)
- Q. 연봉 3,000만원이면 실수령액이 얼마인가요?
- Q. 비과세 항목은 어떤 것이 있나요?
- Q. 4대보험 요율은 얼마인가요?

#### 3. savings-interest-calculator (적금 이자)
- Q. 적금 금리 4%면 실제로 이자를 얼마 받나요?
- Q. 이자소득세 15.4%는 어떻게 계산하나요?

#### 4. tax-refund-calculator (연말정산)
- Q. 연말정산에서 마이너스가 나오면 어떻게 되나요?
- Q. 신용카드와 체크카드, 어느 쪽이 공제에 유리한가요?

#### 5. loan-calculator (대출이자)
- Q. 원리금균등 vs 원금균등, 어느 쪽이 유리한가요?
- Q. 거치기간을 두면 총 이자가 얼마나 늘어나나요?

#### 6. gift-tax-calculator (증여세)
- Q. 부모가 자녀에게 5,000만원까지 증여세 없이 줄 수 있나요?
- Q. 10년 합산 규정이 뭔가요?

#### 7. unemployment-benefit-calculator (실업급여)
- Q. 자발적 퇴사도 실업급여 받을 수 있나요?
- Q. 실업급여 수급 중 알바해도 되나요?

#### 8. fire-calculator (FIRE 조기은퇴)
- Q. 4% Rule이 뭔가요?
- Q. 저축률 50%면 몇 년 만에 은퇴할 수 있나요?

#### 9. pension-calculator (국민연금)
- Q. 국민연금 10년 내면 얼마 받나요?
- Q. 수령 나이를 늦추면 연금이 늘어나나요?

#### 10. health-insurance-calculator (건강보험료)
- Q. 직장가입자 건강보험료는 누가 부담하나요?
- Q. 연말 정산 때 추가 납부가 발생하는 이유는?

### 5-3. 실행 우선순위

| 순서 | 도구 | 현재 SEO 수준 | 작업 내용 |
|------|------|-------------|----------|
| 1 | alcohol-calculator | 중간 | FAQ 3개 + 사용예시 + schema |
| 2 | salary-calculator | 완전 | FAQ 3개 + schema |
| 3 | savings-interest-calculator | 중간 | FAQ 2개 + 사용예시 + schema |
| 4 | tax-refund-calculator | 완전 | FAQ 2개 + schema |
| 5 | loan-calculator | 완전 | FAQ 2개 + schema |
| 6 | gift-tax-calculator | 완전 | FAQ 2개 + schema |
| 7 | unemployment-benefit-calculator | 중간 | FAQ 2개 + 사용예시 |
| 8 | fire-calculator | 완전 | FAQ 2개 + schema |
| 9 | pension-calculator | 중간 | FAQ 2개 + 사용예시 |
| 10 | health-insurance-calculator | 중간 | FAQ 2개 + 사용예시 |

---

## 6. Phase 4: 사이트 구조 변경

### 6-1. 메인 페이지 개편

**현재**: 최신 글 목록이 메인

**변경안**:
```
Hero 섹션
├── "생활 금융 계산기" 타이틀
├── 인기 도구 TOP 3 바로가기 (alcohol, salary, savings)
└── 검색바

카테고리별 도구 그리드
├── 시뮬레이터 (4개)
├── 세금/공제 계산기
├── 대출/저축 계산기
├── 급여/수당 계산기
└── 생활 계산기

최신 가이드 (5개)
└── 유지된 25개 글 중 최신 5개

Footer
```

### 6-2. 네비게이션 변경

**현재**: 홈 | 금융/투자 | 보험/법률 | 계산기 | 테스트

**변경**: 홈 | **계산기** | **시뮬레이터** | 가이드 | 테스트

### 6-3. About 페이지 강화

현재 About 페이지를 아래 내용으로 보강:

```
쓱싹은 복잡한 금융 계산을 쉽게 해결하는 도구 모음입니다.

29개의 계산기와 시뮬레이터:
- 연봉 실수령액, 적금 이자, 대출 상환 등 금융 계산
- 전세/월세/매매 비용 비교, 자동차 비용 비교 등 시뮬레이션
- 모든 계산기는 2026년 최신 세율과 요율 적용

운영자: [이름]
문의: [이메일]
```

### 6-4. 카테고리 URL 구조

변경 없음 (기존 URL 유지, 리다이렉트 불필요)
- `/tools/*` — 계산기/시뮬레이터
- `/posts/*` — 가이드 글

---

## 7. Phase 5: AdSense 재심사

### 7-1. 재심사 전 체크리스트

| # | 항목 | 확인 |
|---|------|------|
| 1 | 공개 글이 25개 이하인가 | ☐ |
| 2 | 5,000B 미만 얇은 글이 없는가 | ☐ |
| 3 | 모든 글에 계산기 CTA가 있는가 | ☐ |
| 4 | 도입부가 백과사전식이 아닌가 | ☐ |
| 5 | 상위 10개 도구에 FAQ가 있는가 | ☐ |
| 6 | About 페이지가 충실한가 | ☐ |
| 7 | 메인 페이지가 도구 중심인가 | ☐ |
| 8 | 404 에러가 해결되었는가 | ☐ |
| 9 | draft 처리한 URL의 IndexNow 처리 완료 | ☐ |
| 10 | 배포 후 최소 1주일 안정화 기간 경과 | ☐ |

### 7-2. 타이밍

- Phase 1~4 완료 후 **배포**
- 배포 후 **1주일** 안정화 (색인 반영 대기)
- 안정화 후 **5차 AdSense 심사 제출**
- 이전 거절과 최소 **2주 간격** 유지

### 7-3. 거절 사유별 추가 대응

| 거절 사유 | 추가 액션 |
|----------|----------|
| "가치가 별로 없는 콘텐츠" | 글 추가 축소(20개), 도구 콘텐츠 더 강화 |
| "확장된 콘텐츠 악용" | 글 15개까지 축소, 발행 간격 확인 |
| "사이트 탐색 문제" | 네비게이션/사이트맵 개선 |
| "콘텐츠가 충분하지 않음" | 도구 페이지 콘텐츠 추가 (FAQ, 예시 확대) |

---

## 8. 실행 일정 (시나리오 B 기준)

| 단계 | 작업 | 예상 소요 | 의존성 |
|------|------|----------|--------|
| **Phase 1** | 51개 글 draft 처리 | 1~2시간 | 없음 |
| **Phase 2-a** | 상위 5개 글 문체/구조 개선 | 1세션 | Phase 1 |
| **Phase 2-b** | 나머지 20개 글 개선 | 2~3세션 | Phase 2-a |
| **Phase 3** | 상위 10개 도구 FAQ 추가 | 1~2세션 | 없음 (병렬 가능) |
| **Phase 4** | 메인페이지 + 네비게이션 개편 | 1세션 | Phase 1 |
| **배포** | cf:deploy + IndexNow | 30분 | Phase 1~4 완료 |
| **안정화** | 1주일 대기 | 7일 | 배포 완료 |
| **Phase 5** | AdSense 5차 제출 | 10분 | 안정화 완료 |

**총 예상**: 5~7세션 + 1주 안정화

---

## 9. 측정 지표

### 변환 성공 기준

| 지표 | 현재 | 1개월 후 목표 | 3개월 후 목표 |
|------|------|-------------|-------------|
| Google CTR | 0.2% | 0.5% | 1.0% |
| Naver 클릭 | 72/주 | 100/주 | 150/주 |
| AdSense 상태 | 심사중 | 승인 | 수익 발생 |
| 도구 페이지 유입 | 측정 안됨 | 전체의 40% | 전체의 60% |

### 모니터링 항목

- GSC: 색인 수, 클릭, CTR, 404 에러
- Naver: 색인 수, 클릭, CTR
- GA4: 페이지별 세션, 도구 사용률
- AdSense: 심사 상태

---

## 부록: 하지 말아야 할 것

| 금지 사항 | 이유 |
|----------|------|
| 글을 더 많이 쓰기 | 양의 문제가 아님, 질의 문제 |
| AI로 글을 다시 생성 | 같은 문제 반복 |
| 이미지만 추가 | 본질이 안 바뀜 |
| 카테고리 늘리기 | 이미 2개로 줄인 게 맞음 |
| draft URL을 삭제 | 404 발생, draft 처리로 충분 |
| 한 번에 모든 글 수정 | 점진적으로, 품질 확인하며 진행 |
| 심사 직후 재제출 | 최소 2주 간격 유지 |
