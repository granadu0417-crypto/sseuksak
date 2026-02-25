# sseuksak.com 진행 현황

> 마지막 업데이트: 2026-02-25

## 프로젝트 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| 사이트 URL | https://sseuksak.com | 라이브 |
| 게시글 | **35개 공개** (93개 draft) | finance 28, insurance 7 |
| 도구 | **16개** | 금융 계산기 14개 + 생활 계산기 2개 (평수, 나이) |
| 테스트 | **2개 공개** (8개 숨김) | 소비유형, 재테크성향 |
| AdSense | 🔄 **4차 심사 중** | 2/25 재신청 완료 (금융 니치 전환 후) |
| GA4 | 설치됨 | G-CMZF467RLD |
| IndexNow | ✅ 적용 | 네이버, Bing, Yandex 자동 알림 |
| **네이버 SEO** | ✅ 90/100 | 웹마스터 가이드 기준 평가 완료 |
| **AI 콘텐츠 품질** | ✅ **완료** | 7가지 AI 핑거프린트 제거 + 95/95 리라이팅 완료 (구조 8가지 균등 분포) |
| **팩트체크** | ✅ **100%** | 109개 전체 검증 완료, 오류수정 29개 (26.6%) |

## 아카이브

오래된 작업 기록은 아카이브 폴더에서 확인:
- [2026년 1월 1주차](archive/PROGRESS_2026_01_WEEK1.md) (01-02 ~ 01-07)
- [2026년 1월 2주차](archive/PROGRESS_2026_01_WEEK2.md) (01-08 ~ 01-14)
- [2026년 1월 3주차](archive/PROGRESS_2026_01_WEEK3.md) (01-15 ~ 01-21)
- [2026년 1월 4주차](archive/PROGRESS_2026_01_WEEK4.md) (01-22 ~ 01-27)
- [2026년 2월 1주차](archive/PROGRESS_2026_02_WEEK1.md) (01-27 ~ 02-09)

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
| - 계산기 코드 기반 숫자 검증, 공식 법률·고시 출처 대조 | ✅ |
| **문서 업데이트** | ✅ |
| - CONTENT_INVENTORY.md: 10개 글 추가 (118→128개) | ✅ |
| - FACTCHECK_LOG.md: 10개 글 검증 기록 추가 | ✅ |
| - PROGRESS.md: 작업 기록 | ✅ |

---

## 2026-02-25

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **검색 인덱스 draft 필터링** | ✅ |
| - `scripts/generate-search-index.js`에 draft 필터 추가 (118개→25개) | ✅ |
| - 사이트 내 검색 테스트 완료 (draft 글 미노출 확인) | ✅ |
| **사이트 정체성 금융 니치로 재정비** | ✅ |
| - 홈페이지 히어로: "생활 금융 계산기 & 가이드" | ✅ |
| - About 페이지: 금융/보험 전문 사이트로 전면 개편 | ✅ |
| - 네비게이션: 카테고리 6개→2개 (금융/투자, 보험/법률) | ✅ |
| - 푸터: 금융 니치 소개 + 카테고리 정리 | ✅ |
| - 메타데이터: title, description, keywords, OG/Twitter 전체 업데이트 | ✅ |
| **도구 페이지 정리** | ✅ |
| - BMI/음주/수면/인생주간 도구 제거 (20개→16개) | ✅ |
| - "라이프 도구" → "생활 계산기" 명칭 변경 | ✅ |
| **테스트 페이지 정리** | ✅ |
| - 10개→2개 (소비유형, 재테크성향만 유지) | ✅ |
| - 준비 중: 절약습관, 보험IQ, 노후준비도 (금융 테마) | ✅ |
| - 안내 문구 금융 맥락으로 변경 | ✅ |
| **커밋 & 배포** | ✅ |
| - 93개 draft 처리 커밋 (`65ab06a`) | ✅ |
| - 검색 인덱스 수정 커밋 (`5b05df3`) | ✅ |
| - 사이트 정체성 재정비 커밋 (`5318c39`) | ✅ |
| - 도구/테스트 정리 커밋 (`10aed20`) | ✅ |
| - 배포 2회 + 라이브 검증 완료 | ✅ |
| - 홈페이지 테스트 카드 문구 수정 (`3528be8`) + 배포 | ✅ |
| **AdSense 4차 재신청** | ✅ |
| - 사이트 전체 점검 (8개 페이지 + 검색 + 모바일) | ✅ |
| - AdSense 검토 요청 완료 (2/25) | ✅ |

### 참고: 현재 상태
- **공개 글**: 25개 (finance 18 + insurance 7)
- **도구**: 16개 (금융 14 + 생활 2)
- **테스트**: 2개 공개 (소비유형, 재테크성향)
- **draft 글**: 93개 (파일 보존, `draft: true`로 숨김)
- **승인 후**: draft 글 다시 공개 가능 (draft: true 제거)

---

## 2026-02-24

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| **AdSense 3차 거절 분석 및 니치 전환** | ✅ |
| - 거절 사유: "가치가 별로 없는 콘텐츠" 분석 | ✅ |
| - infozip365.com (승인) / housingzip365.com (승인) 비교 분석 | ✅ |
| - infozip365와 중복 글 파악: URL 동일 4개 + 주제 중복 14개 = 18개 | ✅ |
| - "생활 금융 계산기" 니치로 전환 결정 | ✅ |
| - 유지할 25개 글 선별 (finance 18 + insurance 7) | ✅ |
| **93개 글 draft 처리 및 배포** | ✅ |
| - 93개 md 파일에 `draft: true` 추가 | ✅ |
| - `src/lib/posts.ts`에 draft 필터링 로직 추가 (getAllPosts + getPostBySlug) | ✅ |
| - `health-insurance-premium-2026` 카테고리 health → insurance 변경 | ✅ |
| - 빌드 성공 (25개 글만 생성 확인) | ✅ |
| - cf:deploy 배포 완료 + IndexNow 149 URL 제출 | ✅ |
| **신규 게시글 8개 팩트체크 및 오류 수정** | ✅ |
| - 4대보험(#113): 2026년 요율 반영 (국민연금 9.5%, 건보 7.19%, 장기요양 13.14%) | ✅ |
| - 소액소송(#114): 송달료 5,500원/10회, 압류금지 250만원 수정 | ✅ |
| - 내용증명(#112): 우편료 430원, 등기 2,400원, 배달증명 1,600원 수정 | ✅ |
| - FACTCHECK_LOG.md 업데이트 (오류수정 37개) | ✅ |
| **신규 계산기 5개 개발 및 배포** | ✅ |
| - 평수 계산기 (평↔㎡ 변환, 주요 평형 참조표) | ✅ |
| - 나이 계산기 (만나이·한국나이·연나이, 띠·별자리) | ✅ |
| - 부가세 계산기 (정방향·역산, 공급가액↔합계금액) | ✅ |
| - 적금 이자 계산기 (적금/예금, 단리/복리, 3가지 세금유형) | ✅ |
| - 실업급여 계산기 (나이·근속기간·급여 기준 수령액·수급기간) | ✅ |
| sitemap.ts에 5개 신규 도구 등록 + lastModified 업데이트 | ✅ |
| tools/page.tsx 금융계산기·라이프도구 목록에 5개 추가 | ✅ |
| 데이터 정확성 검증 (5개 전체) | ✅ |
| - 실업급여 하한액 수정: 63,104원→64,192원 (2026 최저시급 10,030원 기준) | ✅ |
| - 적금 세금우대 세율 수정: 9.2%→9.5% (이자소득세 9%+지방소득세 0.5%) | ✅ |
| 모바일 반응형 검증 (iPhone 375×812) 5개 전체 통과 | ✅ |
| 배포 2회 (cf:deploy 초기 + cf:quick 데이터 수정) | ✅ |
| **신규 게시글 8개 일괄 작성 및 배포** | ✅ |
| - 등기부등본 열람·발급 방법과 꼭 확인할 항목 총정리 (#111) | ✅ |
| - 내용증명 작성부터 발송까지 셀프로 하는 법 (#112) | ✅ |
| - 4대보험료 얼마나 내고 있나? 가입확인·계산·절약법 정리 (#113) | ✅ |
| - 소액소송 혼자 하는 법 - 소장 작성부터 판결까지 총정리 (#114) | ✅ |
| - 인감증명서 발급 방법 - 주민센터·온라인·대리 발급 가이드 (#115) | ✅ |
| - 장례식 비용 얼마나 들까? 절차·준비물·비용 절감법 정리 (#116) | ✅ |
| - 알바·정규직 근로계약서 작성법 - 꼭 들어가야 할 항목 7가지 (#117) | ✅ |
| - 주민등록등본 발급 방법 총정리 - 온라인·주민센터·무인발급기 (#118) | ✅ |
| 8개 글 구조 다양화 (A,B,B,C,D,E,F,H) + 도입부 8가지 유형 | ✅ |
| 경쟁 블로그 10개+ 분석 후 차별화 포인트 반영 | ✅ |
| E-E-A-T 요소 각 글 2개 이상 포함 | ✅ |
| CONTENT_INVENTORY.md, FACTCHECK_LOG.md 업데이트 | ✅ |
| **라이브 사이트 검증 (모바일 375×812 + PC 1280×800)** | ✅ |
| - 등기부등본(#111), 4대보험(#113), 근로계약서(#117) 외 전체 정상 | ✅ |
| **Google Search Console 색인 요청 8개 완료 (10차)** | ✅ |
| - property-register-guide-2026 (#111) | ✅ |
| - certified-mail-guide-2026 (#112) | ✅ |
| - four-major-insurance-guide-2026 (#113) | ✅ |
| - small-claims-court-guide-2026 (#114) | ✅ |
| - seal-certificate-guide-2026 (#115) | ✅ |
| - funeral-cost-guide-2026 (#116) | ✅ |
| - employment-contract-guide-2026 (#117) | ✅ |
| - resident-registration-copy-guide-2026 (#118) | ✅ |
| **Naver Search Advisor 수집 요청 8개 완료** | ✅ |
| - property-register-guide-2026 (12:09:21) | ✅ |
| - certified-mail-guide-2026 (12:09:56) | ✅ |
| - four-major-insurance-guide-2026 (12:10:13) | ✅ |
| - small-claims-court-guide-2026 (12:10:30) | ✅ |
| - seal-certificate-guide-2026 (12:10:45) | ✅ |
| - funeral-cost-guide-2026 (12:11:01) | ✅ |
| - employment-contract-guide-2026 (12:11:18) | ✅ |
| - resident-registration-copy-guide-2026 (12:11:36) | ✅ |

---

## 2026-02-23

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| Google Search Console 404 에러 9개 URL 확인 및 색인 재요청 | ✅ |
| 카테고리 4개 (tech, education, insurance, finance) - 색인 요청 성공 | ✅ |
| 게시글 2개 (youth-future-savings, health-insurance-premium) - 색인 요청 성공 | ✅ |
| 태그 3개 (TIGER, 전세자금대출, 주담대금리) - noindex로 거부됨 (정상) | ✅ |
| 남은 6개 게시글 색인 요청 완료 (9차) | ✅ |
| - year-end-tax-simplification-service-2026: 이미 색인됨 (스킵) | ⏭️ |
| - young-adults-pancreatic-cancer-alcohol-2026: 색인 요청됨 | ✅ |
| - youth-future-savings-2026: 색인 요청됨 (재요청, 404 상태) | ✅ |
| - youth-rent-support-2026: 색인 요청됨 | ✅ |
| - youth-savings-comparison-2026: 색인 요청됨 | ✅ |
| - youth-tomorrow-savings-account-2026: 색인 요청됨 | ✅ |
| **전체 게시글 색인 요청 100% 완료 (남은 URL: 0개)** | ✅ |
| docs/GOOGLE_INDEX_REQUEST_LOG.md 업데이트 | ✅ |
| **신규 게시글: 미성년자 주식 계좌 개설·증여세·절세 가이드 2026 (#105)** | ✅ |
| - 국세청 공식 사이트에서 증여세 면제한도·가산세·신고기한 검증 | ✅ |
| - 네이버 블로그 15개 + 구글 10개 = 25개 경쟁 게시글 분석 | ✅ |
| - FACTCHECK_LOG.md 업데이트 (104개 검증 완료) | ✅ |
| - 빌드·배포 완료 (IndexNow 136개 URL 전송) | ✅ |
| **신규 게시글 5개 일괄 작성 (#106~#110)** | ✅ |
| - #106: 전세사기 예방법 2026 총정리 (lifestyle, 구조D) | ✅ |
| - #107: 2026 봄철 알레르기 비염 예방·치료 총정리 (health, 구조B) | ✅ |
| - #108: 투잡 직장인·프리랜서 종합소득세 가이드 (finance, 구조varies) | ✅ |
| - #109: 건강검진 결과표 판정 등급·수치 해석 가이드 (health, 구조C) | ✅ |
| - #110: 자동차 정기검사·종합검사 가이드 2026 (lifestyle, 구조F) | ✅ |
| - 5개 전체 팩트체크 완료, 오류수정 적용 (109개 검증, 29건 수정) | ✅ |
| - FACTCHECK_LOG.md, CONTENT_VERIFICATION.md, CONTENT_INVENTORY.md 업데이트 | ✅ |
| - 일괄 빌드·배포 완료 | ✅ |

### 발견된 이슈
- Cloudflare KV 캐시 cold start 시 간헐적 404 반환 문제 지속
- /category/finance가 당일(2/23) 크롤링에도 404 → KV 캐시 warming 필요

---

## 2026-02-13

### 완료된 작업 (3월 넷플릭스 신작 게시글 + 가독성 개선)
| 작업 내용 | 상태 |
|----------|------|
| **netflix-march-2026-new-releases.md** 신규 게시글 작성 | ✅ |
| 3월 넷플릭스 신작 6선: 월간남친, 공룡, ONE PIECE S2, 피키 블라인더스, BTS 컴백, Something Very Bad | ✅ |
| YouTube 예고편 4개 삽입 (월간남친, 공룡, ONE PIECE S2, 피키 블라인더스) | ✅ |
| 1월·2월 넷플릭스 게시글에 3월 글 관련 링크 추가 | ✅ |
| 2월·3월 게시글 장르별 추천 섹션 리스트(`-`) 형식으로 가독성 개선 | ✅ |
| docs/CONTENT_INVENTORY.md 업데이트 | ✅ |
| 배포 2회 (cf:quick + IndexNow) | ✅ |

### 완료된 작업 (Google 색인 생성 요청 - 추가 28개, 총 94개 완료)
| 작업 내용 | 상태 |
|----------|------|
| **Google Search Console 수동 색인 요청 추가 28개 URL** | ✅ |
| **6차 (14개)**: just-give-welfare-program ~ pet-insurance-comparison-2026 | ✅ |
| **7차 (14개)**: prenatal-insurance-guide ~ worker-meal-support-2026 | ✅ |
| ⏭️ 추가 스킵 2건: right-to-disconnect-guide-2026, water-meter-freeze-prevention-tips-2026 (이미 색인됨) | ℹ️ |
| **총 누적**: 94개 요청 완료 + 거부 3건 + 스킵 3건 | ✅ |
| **남은 6개**: year-end-tax-simplification-service ~ youth-tomorrow-savings-account-2026 | ⏳ |
| URL 검사 용량 초과로 중단 (내일 갱신) | ℹ️ |
| docs/GOOGLE_INDEX_REQUEST_LOG.md 업데이트 | ✅ |
| docs/analytics/2026-02-13.md 업데이트 | ✅ |

---

## 2026-02-12

### 완료된 작업 (새 게시글 작성 + 배포)
| 작업 내용 | 상태 |
|----------|------|
| 숨은 금융자산 조회·환급 완벽 가이드 작성 (102번째 글) | ✅ |
| - 금융감독원·금융위원회·서민금융진흥원·생명보험협회 공식 자료 검증 | ✅ |
| - 5가지 공식 채널 비교표 + 유형별/연령별 환급 데이터 (차별화) | ✅ |
| - 구조 B(문제-해결형), 도입부 숫자/통계형 | ✅ |
| - 경쟁블로그 13개+ 분석 후 차별점 7가지 반영 | ✅ |
| FACTCHECK_LOG.md 업데이트 (102개) | ✅ |
| CONTENT_INVENTORY.md 업데이트 (102개) | ✅ |
| 배포 완료 (cf:deploy) | ✅ |
| 신용점수 올리는 방법과 흔한 착각 5가지 작성 (103번째 글) | ✅ |
| - 금감원 신용관리10계명 + 금융위 신용평가개편TF + NICE/KCB 공식 자료 검증 | ✅ |
| - 13항목 팩트체크 전부 정확 | ✅ |
| - 구조 E(PREP형), 도입부 오해 바로잡기형 | ✅ |
| - 네이버블로그+구글 경쟁게시글 15개 분석 후 차별점 6가지 반영 | ✅ |
| FACTCHECK_LOG.md 업데이트 (103개) | ✅ |
| CONTENT_INVENTORY.md 업데이트 (103개) | ✅ |
| 배포 완료 (cf:deploy) | ✅ |

### 완료된 작업 (Analytics 업데이트 + 문서 정리)
| 작업 내용 | 상태 |
|----------|------|
| Google/Naver/AdSense 최신 데이터 수집 | ✅ |
| docs/analytics/2026-02-12.md 상세 보고서 작성 | ✅ |
| docs/ANALYTICS_HISTORY.md 업데이트 | ✅ |
| CLAUDE.md에 세션 시작 시 필수 체크 규칙 추가 | ✅ |
| PROGRESS.md 아카이브 분리 (1/27~2/9 → archive/) | ✅ |

### 완료된 작업 (Google 색인 생성 요청 - 총 66개 URL)
| 작업 내용 | 상태 |
|----------|------|
| **Google Search Console 수동 색인 요청 66개 URL 완료** | ✅ |
| **1차 (10개)**: 신규 게시글 4 + Naver 트래픽 기반 6 | ✅ |
| - sunloan-2026-reform-guide, traffic-fine-payment-guide | ✅ |
| - hidden-financial-assets-guide-2026, credit-score-guide-2026 | ✅ |
| - netflix-february/january-2026, health-checkup-2026 | ✅ |
| - car-insurance-policy-changes-2026, new-certifications-2026-guide | ✅ |
| - national-pension-reform-2026 | ✅ |
| **2차 (14개)**: ces-2026 ~ self-employed-tax-guide-2026 | ✅ |
| **3차 (8개)**: birth-support ~ parental-leave-benefit-guide-2026 | ✅ |
| **4차 (32개)**: 2026-golden-holiday ~ health-insurance-premium-2026 | ✅ |
| **5차 (2개)**: high-school-credit-system-2026, inheritance-forfeiture-system-2026 | ✅ |
| ❌ 거부 3건: sleep-quality-improvement-guide(슬러그 없음), netflix-march(미발행), digital-detox-guide(슬러그 없음) | ℹ️ |
| ⏭️ 스킵 1건: savings-account-comparison-2026 (이미 색인됨) | ℹ️ |
| **핵심 발견**: 103개 게시글 중 Google 색인 1개뿐 (나머지 40개는 도구/테스트/카테고리) | ℹ️ |
| **내일 계속**: 나머지 36개 URL 색인 요청 예정 | ⏳ |

---

## 2026-02-11

### 완료된 작업 (새 게시글 작성 + 배포)
| 작업 내용 | 상태 |
|----------|------|
| 햇살론 2026 일반·특례·유스 3종 비교 가이드 작성 | ✅ |
| - 금융위원회 보도자료 + 서민금융진흥원 + 토스뱅크 출처 검증 | ✅ |
| - 불법사금융예방대출 이자 시뮬레이션 포함 (차별화) | ✅ |
| - 구조 C(비교-분석형), 도입부 숫자/통계형 | ✅ |
| - 경쟁블로그 11개+ 분석 후 차별점 5가지 반영 | ✅ |
| FACTCHECK_LOG.md 업데이트 (100개) | ✅ |
| 배포 완료 (cf:quick) | ✅ |
| 교통범칙금·과태료 조회 납부 가이드 작성 (101번째 글) | ✅ |
| - 경찰청 이파인 + 찾기쉬운 생활법령정보 + 도로교통법 시행령 검증 | ✅ |
| - 12항목 팩트체크 (3건 수정: 법조문·금액·면허정지 기준) | ✅ |
| - 구조 C(비교-분석형), 도입부 오해 바로잡기형 | ✅ |
| - 경쟁블로그 11개+ 분석 후 원스톱 가이드 차별화 | ✅ |
| FACTCHECK_LOG.md 업데이트 (101개) | ✅ |
| CONTENT_INVENTORY.md 업데이트 (101개) | ✅ |
| 배포 완료 (cf:quick) | ✅ |

### 완료된 작업 (모바일 성능 최적화)
| 작업 내용 | 상태 |
|----------|------|
| **PageSpeed 모바일 성능: 54점 → 73점 (+19점)** | ✅ |
| SearchButton에서 `useRouter` 제거 → `window.location.href` 대체 (JS 번들 축소) | ✅ |
| SearchButton `next/dynamic` 동적 import로 코드 스플리팅 | ✅ |
| GA 스크립트 `afterInteractive` → `lazyOnload` 변경 (TBT 430ms → 100ms) | ✅ |
| 불필요한 preconnect 4개 제거 → `dns-prefetch` 경량화 (next/font 셀프호스팅) | ✅ |
| `next.config.ts`에 `optimizePackageImports` 추가 (트리쉐이킹 향상) | ✅ |
| 폰트 `adjustFontFallback: true` 추가 (CLS 방지) | ✅ |
| **Core Web Vitals 개선**: FCP 4.7→3.9초, LCP 6.0→4.4초, TBT 430→100ms | ✅ |
| 배포 완료 (cf:quick) | ✅ |

---

## 2026-02-10

### 완료된 작업 (SEO 6개 항목 개선 + 배포)
| 작업 내용 | 상태 |
|----------|------|
| **1. Sitemap lastmod 수정** | ✅ |
| - 정적 페이지 `new Date()` → 고정 날짜로 변경 | ✅ |
| - 카테고리 페이지: 해당 카테고리 최신 글 날짜 사용 | ✅ |
| - 누락된 도구 7개 사이트맵에 추가 (총 15개) | ✅ |
| **2. React #418 hydration 에러 개선** | ✅ |
| - TableOfContents: DOMParser 분기 제거 → regex 통일 | ✅ |
| - `<body>` 태그에 `suppressHydrationWarning` 추가 | ✅ |
| - AdSense/GA 외부 스크립트 기인 경고는 제거 불가 (알려진 이슈) | ℹ️ |
| **3. 계산기 15개 JSON-LD 추가** | ✅ |
| - `ToolJsonLd.tsx` 컴포넌트 신규 생성 (WebApplication 스키마) | ✅ |
| - 15개 도구 페이지 전체에 개별 JSON-LD 삽입 | ✅ |
| - tools/layout.tsx CollectionPage hasPart 15개로 확장 | ✅ |
| **4. 홈페이지 최신글 3개 → 6개** | ✅ |
| **5. ARIA 접근성 강화** | ✅ |
| - DesktopNav: `aria-expanded`, `aria-haspopup` 추가 | ✅ |
| - MobileNav: `aria-expanded`, 동적 `aria-label` 추가 | ✅ |
| - TableOfContents: `aria-expanded`, `aria-controls` 추가 | ✅ |
| **6. 도구/테스트 페이지 브레드크럼 추가** | ✅ |
| - tools/page.tsx, tests/page.tsx에 Breadcrumb 컴포넌트 추가 | ✅ |
| - 타이틀 중복 수정 (tools/tests layout template → `%s | 쓱싹`) | ✅ |
| **배포 2회 완료** | ✅ |
| - 754 페이지, 777 KV assets, IndexNow 제출 | ✅ |

### 완료된 작업 (4대 플랫폼 현황 파악 + AdSense 재검토 제출)
| 작업 내용 | 상태 |
|----------|------|
| **4대 플랫폼 종합 현황 파악** | ✅ |
| - Google AdSense: 상태 "주의 필요 → 준비 중" | ✅ |
| - Google Search Console: 4클릭, 4,993노출, CTR 0.1%, 색인 41/128 | ✅ |
| - Google Analytics: 활성사용자 138명(+23.2%), 30일 351명(+58.1%) | ✅ |
| - Naver Search Advisor: 150클릭(+100%), 1,400노출, CTR 11.2% | ✅ |
| **AdSense 재검토 요청 제출** | ✅ |
| - "문제를 수정했음을 확인합니다" 체크 → "검토 요청" 클릭 | ✅ |
| - 사이트 상태: "주의 필요" → "준비 중" (검토 중) | ✅ |
| - 95/95 리라이팅 + 4개 신규 콘텐츠 + 2개 계산기 반영 상태 | ✅ |

### 완료된 작업 (신규 콘텐츠 색인 요청 - Naver + Google)
| 작업 내용 | 상태 |
|----------|------|
| **Naver Search Advisor 크롤링 요청 (6개 URL)** | ✅ |
| **Google Search Console 색인 생성 요청 (6개 URL)** | ✅ |

**주요 인사이트:**
- 네이버가 주 트래픽 엔진 (150클릭 vs Google 4클릭)
- 넷플릭스 콘텐츠가 양 플랫폼 모두 1위 견인
- GA 활성사용자 +23%, 네이버 클릭 +100% 우상향 추세
- Google 색인율 32% (41/128) — 개선 여지 큼
- AdSense 재검토 결과 수일~2주 소요 예상
- 신규 6개 URL 양 플랫폼(Naver+Google) 수동 색인 요청 완료

---

## 다음 할 일

### 우선순위 높음
- [x] ~~Google 색인 요청 전체 완료~~ (112/118 게시글 요청, 1개 이미 색인, 5개 계산기)
- [x] ~~Naver Search Advisor 수집 요청 완료~~ (신규 8개 #111~#118)
- [ ] AdSense 재검토 결과 확인 (2/10 제출, 재심사 15일차)

### 우선순위 중간
- [ ] 색인 반영 결과 확인 (112개 수동 요청 URL)
- [ ] 금융 콘텐츠 키워드 다각화 (적금, 대출, 보험 등)

### 콘텐츠 확장 (선택)
- [ ] 추가 테스트/퀴즈 개발
- [ ] 콘텐츠 지속 확충 (현재 118개)
- [ ] GA4 ↔ Search Console 연결

---

## 주요 링크

- **프로덕션**: https://sseuksak.com
- **GitHub**: https://github.com/granadu0417-crypto/sseuksak-blog
