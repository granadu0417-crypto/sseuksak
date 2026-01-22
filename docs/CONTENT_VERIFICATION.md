# 콘텐츠 검증 가이드

sseuksak.com 블로그 콘텐츠의 정확성을 보장하기 위한 검증 프로세스 문서입니다.

> **마지막 업데이트**: 2026-01-22
>
> **참고**: 상세 검증 기록은 git history에서 확인 가능합니다.

---

## 검증 프로세스 개요

```
1. 콘텐츠 작성 완료
    ↓
2. 공식 출처 확인
    ↓
3. 팩트체크 수행
    ↓
4. 검증 결과 기록 (아래 요약 테이블)
    ↓
5. 수정/보완 (필요시)
    ↓
6. 배포
```

---

## 카테고리별 공식 출처

### health (건강/의료)

| 주제 | 공식 출처 | URL |
|------|----------|-----|
| 건강검진 | 국민건강보험공단 | https://www.nhis.or.kr |
| 의료보험 | 국민건강보험공단 | https://www.nhis.or.kr |
| 예방접종 | 질병관리청 | https://www.kdca.go.kr |
| 의약품 정보 | 식품의약품안전처 | https://www.mfds.go.kr |

### finance (금융/투자)

| 주제 | 공식 출처 | URL |
|------|----------|-----|
| 금리/대출 | 한국은행, 금융감독원 | https://www.bok.or.kr, https://www.fss.or.kr |
| 세금 | 국세청 | https://www.nts.go.kr |
| 연금 | 국민연금공단 | https://www.nps.or.kr |
| 주식/ETF | 한국거래소 | https://www.krx.co.kr |
| 신용카드 | 여신금융협회 | https://www.crefia.or.kr |
| 정부지원금 | 정부24, 복지로 | https://www.gov.kr, https://www.bokjiro.go.kr |

### insurance (보험)

| 주제 | 공식 출처 | URL |
|------|----------|-----|
| 실손보험 | 금융감독원 | https://www.fss.or.kr |
| 자동차보험 | 손해보험협회 | https://www.knia.or.kr |
| 보험 비교 | 보험다모아 | https://www.e-insmarket.or.kr |

### tech (IT/테크)

| 주제 | 공식 출처 | URL |
|------|----------|-----|
| 제품 스펙 | 제조사 공식 사이트 | - |
| 정부 정책 | 과학기술정보통신부 | https://www.msit.go.kr |
| 전기차 보조금 | 환경부, 지자체 | https://www.ev.or.kr |

### education (교육)

| 주제 | 공식 출처 | URL |
|------|----------|-----|
| 교육 정책 | 교육부 | https://www.moe.go.kr |
| 자격증 시험 | 한국산업인력공단 | https://www.q-net.or.kr |
| 입시 정보 | 한국교육과정평가원 | https://www.kice.re.kr |

### lifestyle (생활)

| 주제 | 공식 출처 | URL |
|------|----------|-----|
| 법률 정보 | 법제처 | https://www.moleg.go.kr |
| 정부 지원금 | 정부24 | https://www.gov.kr |
| 최저임금 | 최저임금위원회 | https://www.minimumwage.go.kr |

---

## 검증 완료 기록

### 2026년 1월

| 날짜 | 파일명 | 정확도 | 상태 |
|------|--------|--------|------|
| 01-22 | unemployment-benefits-guide-2026.md | 100% | ✅ |
| 01-21 | earned-income-tax-credit-2026.md | 100% | ✅ |
| 01-21 | youth-rent-support-2026.md | 100% | ✅ |
| 01-20 | national-pension-reform-2026.md | 100% | ✅ 수정됨 |
| 01-20 | small-business-support-2026.md | 95% | ✅ |
| 01-20 | mortgage-rate-comparison-2026.md | 90% | ⚠️ |
| 01-20 | jeonse-loan-comparison-2026.md | 100% | ✅ 수정됨 |
| 01-20 | 2026-new-laws-guide.md | 95% | ✅ |
| 01-20 | 5th-generation-health-insurance-guide-2026.md | 85% | ⚠️ |
| 01-20 | ai-basic-law-2026-guide.md | 100% | ✅ |
| 01-12 | health-checkup-2026.md | 100% | ✅ 보완됨 |

### 검증 상태 범례

| 상태 | 설명 |
|------|------|
| ✅ | 검증 완료, 정확함 |
| ✅ 수정됨 | 검증 후 수정 완료 |
| ⚠️ | 대부분 정확, 일부 확인 필요 |
| ❌ | 수정 필요 |

---

## 새 게시글 검증 시 체크리스트

### 필수 확인 항목

- [ ] 핵심 수치/통계가 공식 출처와 일치하는가?
- [ ] 날짜/기간 정보가 정확한가?
- [ ] 신청 방법/URL이 유효한가?
- [ ] 자격 요건이 정확한가?
- [ ] 면책 조항이 포함되어 있는가?

### 검증 기록 추가 방법

위 "검증 완료 기록" 테이블에 한 줄 추가:
```markdown
| MM-DD | 파일명.md | 정확도% | 상태 |
```

---

*상세 팩트체크 내역이 필요한 경우 git history를 참조하세요.*
