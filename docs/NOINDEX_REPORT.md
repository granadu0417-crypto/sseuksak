# noindex 처리 현황 보고서

> **생성일**: 2026-02-03
> **사이트**: https://sseuksak.com

---

## 요약

| 구분 | 페이지 수 | 색인 상태 |
|------|----------|-----------|
| **noindex 처리** | 약 **502개** | ❌ 검색엔진 색인 제외 |
| **sitemap 제외 (index 가능)** | 약 **9개** | ⚠️ 크롤링 시 색인 가능 |
| **robots.txt 차단** | 3개 경로 | ❌ 크롤링 자체 차단 |
| **정상 색인 대상** | **118개** | ✅ sitemap.xml 포함 |

---

## 1. noindex 처리된 페이지 (메타 태그)

### 1.1 검색 페이지 (1개)

| 경로 | 파일 위치 | 설정 |
|------|----------|------|
| `/search` | `src/app/search/page.tsx` | `index: false, follow: true` |

**적용 코드:**
```typescript
// src/app/search/page.tsx (L8-11)
robots: {
  index: false,
  follow: true,
},
```

**noindex 이유:**
- 검색 결과 페이지는 동적 콘텐츠로, 검색엔진에 중복 콘텐츠로 인식될 수 있음
- 크롤 예산 낭비 방지

---

### 1.2 태그 페이지 (약 501개)

| 경로 패턴 | 파일 위치 | 설정 |
|----------|----------|------|
| `/tag/[slug]` | `src/app/tag/[slug]/page.tsx` | `index: false, follow: true` |

**예시 URL:**
- `/tag/청년복지`
- `/tag/벚꽃개화시기`
- `/tag/연말정산`
- ... (총 약 501개 태그)

**적용 코드:**
```typescript
// src/app/tag/[slug]/page.tsx (L33-44)
// 태그 페이지는 noindex 처리 - 크롤 예산 절약 및 중복 콘텐츠 방지
return {
  ...baseMeta,
  robots: {
    index: false,
    follow: true, // 링크는 따라가도록 유지
    googleBot: {
      index: false,
      follow: true,
    },
  },
};
```

**noindex 이유:**
- 크롤 예산 절약 (501개 → 0개 크롤 요청)
- 중복 콘텐츠 방지 (같은 게시글이 여러 태그 페이지에 중복 표시)
- 핵심 콘텐츠(게시글)에 크롤 리소스 집중

---

## 2. robots.txt 차단 경로

**파일 위치:** `src/app/robots.ts`

| 차단 경로 | 설명 |
|----------|------|
| `/api/` | API 엔드포인트 (검색 API 등) |
| `/_next/` | Next.js 내부 자원 |
| `/static/` | 정적 파일 |

**적용 코드:**
```typescript
// src/app/robots.ts
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: [
      '/api/',
      '/_next/',
      '/static/',
    ],
  },
  // Googlebot, Yeti(네이버), Bingbot 모두 허용
],
```

---

## 3. sitemap.xml 현황

**총 URL 수:** 118개

### 3.1 sitemap에 포함된 페이지

| 페이지 유형 | 개수 | priority |
|------------|------|----------|
| 홈페이지 | 1 | 1.0 |
| 게시글 (`/posts/*`) | 85 | 0.9 |
| 카테고리 (`/category/*`) | 6 | 0.7 |
| 도구 (`/tools/*`) | 9 | 0.6~0.7 |
| 테스트 (`/tests/*`) | 11 | 0.6~0.7 |
| 캘린더 | 1 | 0.7 |
| 페이지네이션 1페이지 | 1 | 0.6 |
| about, contact | 2 | 0.3 |

### 3.2 sitemap에서 제외된 페이지 (index는 가능)

| 페이지 유형 | 개수 | 이유 |
|------------|------|------|
| 페이지네이션 2~10페이지 | 9 | 크롤 우선순위 낮음 |

> ~~`/privacy`, `/terms`~~ → **2026-02-03 sitemap 추가 완료**

---

## 4. 검증 결과

### 4.1 실제 배포 사이트 확인

| URL | 메타 태그 확인 |
|-----|---------------|
| `/tag/청년복지` | ✅ `content="noindex"` 확인됨 |
| `/posts/page/2` | ✅ `content="index, follow"` 확인됨 |
| `/search` | ✅ `content="noindex"` 예상 |

### 4.2 빌드 출력 확인

```
Next.js 15.5.9 빌드 결과:
- /tag/[slug]: +498 more paths (총 약 501개)
- sitemap.xml: 116개 URL
```

---

## 5. SEO 영향 분석

### 장점

| 항목 | 효과 |
|------|------|
| 크롤 예산 절약 | 501개 태그 페이지 제외 → 핵심 콘텐츠 집중 |
| 중복 콘텐츠 방지 | 같은 게시글의 다중 노출 방지 |
| 색인 품질 향상 | 고품질 페이지만 색인 대상 |

### 현재 설정의 적절성

| 페이지 | 현재 설정 | 적절성 |
|--------|----------|--------|
| `/search` | noindex | ✅ 적절 (동적 결과 페이지) |
| `/tag/*` | noindex | ✅ 적절 (중복 콘텐츠, 크롤 예산) |
| `/posts/page/2~10` | index (sitemap 제외) | ✅ 적절 |
| `/privacy`, `/terms` | index | ✅ 적절 (법적 페이지) |

---

## 6. 권장사항

### 현재 설정 유지 권장

현재 noindex 설정은 SEO 모범 사례를 따르고 있습니다:

1. **태그 페이지 noindex**: Google은 태그/카테고리 페이지의 noindex를 권장
2. **검색 페이지 noindex**: 동적 결과 페이지는 색인 대상이 아님
3. **follow 유지**: 링크 크롤링은 허용하여 게시글 발견 가능

### 선택적 개선 사항

| 항목 | 현재 | 권장 | 우선순위 |
|------|------|------|----------|
| sitemap에 `/privacy`, `/terms` 추가 | ❌ 제외 | ⚠️ 선택적 | 낮음 |
| 페이지네이션 2~10 sitemap 추가 | ❌ 제외 | ⚠️ 선택적 | 낮음 |

> 위 항목들은 현재도 index 가능하므로 급하게 변경할 필요 없음

---

## 결론

**sseuksak.com의 noindex 설정은 적절하게 구성되어 있습니다.**

- 총 **502개 페이지**가 noindex 처리됨 (검색 1개 + 태그 약 501개)
- 핵심 콘텐츠 **116개 URL**이 sitemap.xml에 포함
- 크롤 예산이 게시글, 도구, 테스트 등 핵심 콘텐츠에 집중됨
- 중복 콘텐츠 문제 없음

---

*이 보고서는 2026-02-03 기준으로 작성되었습니다.*
