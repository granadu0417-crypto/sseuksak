# Analytics 보고서 수집 가이드

## 데이터 수집 플랫폼

| 플랫폼 | URL | 수집 주기 |
|--------|-----|----------|
| Google Search Console | https://search.google.com/search-console | 주 1-2회 |
| Google Analytics | https://analytics.google.com | 주 1-2회 |
| Naver Search Advisor | https://searchadvisor.naver.com | 주 1-2회 |
| Google AdSense | https://www.google.com/adsense | 승인 후 |

---

## 수집할 지표 목록

### Google Search Console
- **성과 탭** (최근 3개월): 총 클릭, 총 노출, 평균 CTR, 평균 순위
- **인기 검색어**: 상위 5-10개 키워드 + 클릭/노출/CTR
- **색인 생성 범위**: 색인된 페이지 수, 제외된 페이지 수
- **사이트맵**: 발견된 URL 수

### Google Analytics
- **개요** (최근 7일): 활성 사용자, 신규 사용자
- **트래픽 소스**: Organic Search, Direct, Referral 세션 수
- **인기 페이지**: 상위 5-10개 페이지 + 조회수
- **이벤트**: 총 이벤트 수

### Naver Search Advisor
- **성과** (최근 30일): 총 클릭, 총 노출, 평균 CTR
- **인기 검색어**: 상위 10개 키워드 + 클릭/노출/CTR
- **인기 페이지**: 상위 10개 페이지 + 클릭/노출/CTR
- **사이트 상태**: 보안 인증서, HTTPS, 사이트맵

### Google AdSense
- **승인 상태**: 승인/미승인/심사 중
- **수익** (승인 후): 일별 수익, RPM, 페이지뷰

---

## 보고서 작성 템플릿

파일명: `docs/analytics/YYYY-MM-DD.md`

```markdown
# sseuksak.com 종합 분석 보고서

**분석일**: YYYY년 MM월 DD일
**대상 사이트**: https://sseuksak.com
**총 게시글 수**: XX개

---

## 1. 핵심 요약 (Executive Summary)

| 플랫폼 | 핵심 지표 | 상태 |
|--------|----------|------|
| Google Search Console | X% CTR, XX/XX 페이지 색인 | ⚠️/✅ |
| Google Analytics | XX 활성 사용자, +XX% 자연검색 | ⚠️/✅ |
| Google AdSense | 상태 | ⏳/✅ |
| Naver Search Advisor | X% CTR, XX 클릭 | ⚠️/✅ |

---

## 2. Google Search Console 분석

### 2.1 성과 개요 (최근 3개월)
| 지표 | 수치 | 평가 |
|------|------|------|
| 총 클릭 | X회 | |
| 총 노출 | X회 | |
| 평균 CTR | X% | |
| 평균 순위 | X위 | |

### 2.2 인기 검색어
### 2.3 색인 현황
### 2.4 문제점 분석

---

## 3. Google Analytics 분석

### 3.1 트래픽 개요 (최근 7일)
| 지표 | 수치 | 전주 대비 |
|------|------|----------|
| 활성 사용자 | X명 | |
| 신규 사용자 | X명 | |
| 총 이벤트 | X회 | |

### 3.2 트래픽 소스
### 3.3 인기 페이지

---

## 4. Google AdSense 분석
### 4.1 현재 상태
### 4.2 수익 현황 (승인 후)

---

## 5. Naver Search Advisor 분석

### 5.1 성과 개요 (최근 30일)
### 5.2 인기 검색어 TOP 10
### 5.3 인기 페이지 TOP 10

---

## 6. 주요 발견 사항
### 6.1 강점
### 6.2 약점
### 6.3 기회

---

## 7. 권장 조치 사항

---

*보고서 작성: YYYY년 MM월 DD일*
```

---

## ANALYTICS_HISTORY.md 업데이트 방법

보고서 작성 후, `docs/ANALYTICS_HISTORY.md`의 각 테이블에 새 행을 추가합니다.

```markdown
## Google Search Console (3개월 누적)
| 날짜 | 클릭 | 노출 | CTR | 평균순위 | 색인 페이지 | 색인률 |
|------|------|------|-----|---------|-----------|--------|
| 2026-02-05 | 3 | 4,148 | 0.1% | 7.2 | 41 | 37% |
| 2026-02-06 | X | X | X% | X | X | X% |   ← 새 행 추가
```

트렌드 요약에도 새 열을 추가하여 변화를 기록합니다.
