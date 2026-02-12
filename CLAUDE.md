# sseuksak.com 프로젝트 규칙

## 프로젝트 개요

| 항목 | 값 |
|------|-----|
| 프로젝트 | sseuksak.com AdSense 블로그 |
| 기술 스택 | Next.js 15, Tailwind CSS v4, TypeScript |
| 배포 | Cloudflare Workers + KV |
| 라이브 URL | https://sseuksak.com |

---

## 세션 시작 시 필수 체크

**새 세션을 시작하거나 작업 계획을 세울 때 반드시 아래 항목을 먼저 확인:**

1. **Google Search Console** (https://search.google.com/search-console) - Playwright로 접속
   - 색인 페이지 수 / 미색인 사유
   - 클릭, 노출, CTR, 평균순위
2. **Naver Search Advisor** (https://searchadvisor.naver.com) - Playwright로 접속
   - 색인 현황 (색인, 수집제한, 색인제외)
   - 콘텐츠 노출/클릭, CTR, 인기 키워드/페이지
3. 확인 결과를 `docs/ANALYTICS_HISTORY.md`에 기록
4. 색인 문제가 있으면 콘텐츠 작업보다 색인 개선을 우선

---

## 문서 참조 가이드

| 상황 | 참조 문서 |
|------|----------|
| 작업 기록/진행 현황 | `docs/PROGRESS.md` |
| 아키텍처/기술 결정 | `docs/ARCHITECTURE.md` |
| 테스트/퀴즈 개발 | `docs/TEST_DEVELOPMENT.md` |
| SEO/색인 관련 | `docs/SEO_INDEXING.md` |
| **noindex 처리 현황** | `docs/NOINDEX_REPORT.md` |
| 콘텐츠 검증 | `docs/CONTENT_VERIFICATION.md` |
| **팩트체크 기록** | `docs/FACTCHECK_LOG.md` |
| 배포 상세 | `docs/DEPLOYMENT_GUIDE.md` |
| 게시글 스타일링 | `docs/CONTENT_STYLING.md` |
| **콘텐츠 작성 가이드** | `docs/CONTENT_WRITING_GUIDE.md` |
| **콘텐츠 목록 (중복방지)** | `docs/CONTENT_INVENTORY.md` |
| **Analytics 히스토리** | `docs/ANALYTICS_HISTORY.md` |
| **Analytics 상세 보고서** | `docs/analytics/YYYY-MM-DD.md` |

---

## 배포 명령어

```bash
# 로컬 개발
npm run dev

# 일반 배포 (KV 증분 + IndexNow) - ~5분
CLOUDFLARE_API_TOKEN="PVRNKyVYVAr_i_boHjTfvuKwlzq5dFrpVNfiCkQ2" npm run cf:quick

# 전체 배포 (캐시 초기화 + IndexNow) - ~6분
CLOUDFLARE_API_TOKEN="PVRNKyVYVAr_i_boHjTfvuKwlzq5dFrpVNfiCkQ2" npm run cf:deploy
```

| 명령어 | KV 캐시 | IndexNow | 용도 | 소요 시간 |
|--------|---------|----------|------|----------|
| `cf:quick` | ✅ 증분 | ✅ | 글 수정, 일반 배포 | ~5분 |
| `cf:deploy` | ✅ 전체 | ✅ | 새 기능, 캐시 초기화 | ~6분 |

### 배포 주의사항

**절대 `npx wrangler deploy`를 직접 사용하지 마세요!**

```bash
# ❌ 금지 - KV 캐시 동기화 안됨 → 404 에러 발생
npm run cf:build && npx wrangler deploy

# ✅ 올바른 방법 - KV 캐시 포함
npm run cf:quick   # 또는 cf:deploy
```

| 명령어 | KV 캐시 동기화 | 결과 |
|--------|---------------|------|
| `wrangler deploy` | ❌ | 페이지 404 에러 |
| `cf:quick` / `cf:deploy` | ✅ | 정상 동작 |

Next.js ISR 페이지들이 Cloudflare KV에 저장되므로, KV 캐시 없이 Worker만 배포하면 페이지를 찾을 수 없어 404가 발생합니다.

---

## 폴더 구조

```
src/
├── app/           # Next.js 페이지 (App Router)
│   ├── posts/     # 게시글
│   ├── tools/     # 계산기/도구
│   ├── tests/     # 인터랙티브 테스트
│   └── calendar/  # 일정 캘린더
├── components/    # React 컴포넌트
├── lib/           # 유틸리티 함수
└── constants/     # 상수 정의

content/posts/     # 마크다운 게시글
docs/              # 문서
```

---

## 핵심 코딩 규칙

### 도구 사용
| 도구 | 사용 |
|------|------|
| Playwright MCP | ✅ 필수 (웹 접근) |
| WebFetch | ❌ 금지 |

### 컴포넌트 규칙
- 함수형 컴포넌트 사용
- `'use client'`는 필요한 경우에만
- Props 인터페이스는 컴포넌트 파일 내 정의

### UI 규칙
- Tailwind CSS 직접 사용
- **이모지 사용 금지** → 텍스트 + 그라데이션 박스
- shadcn/ui 컴포넌트 활용

```tsx
// ❌ 이모지 (크로스 플랫폼 렌더링 차이)
<span>🧠</span>

// ✅ 텍스트 + 그라데이션
<div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl">
  정신
</div>
```

### Next.js 15 주의사항
- `useSearchParams()` 사용 시 **Suspense 필수**
```tsx
<Suspense fallback={<Loading />}>
  <ComponentUsingSearchParams />
</Suspense>
```

---

## 네비게이션 구조

게시글 접근 시 **브레드크럼** 필수:
```
홈 > 카테고리 > 게시글 제목
```

필수 요소:
- 브레드크럼 (현재 위치)
- 이전/다음 게시글 링크
- 관련 게시글 추천
- 카테고리로 돌아가기

---

## SEO 핵심 규칙

### Unsplash API
- **한글 검색어 미지원**
- 영어 카테고리 사용 필수

```typescript
// ❌ 한글 태그 (검색 실패)
const query = post.tags[0];

// ✅ 영어 카테고리
const query = post.category; // finance, health, tech...
```

### 카테고리 → 검색어 매핑
| 카테고리 | 검색어 |
|----------|--------|
| lifestyle | lifestyle |
| finance | finance, money |
| tech | technology |
| health | health |
| education | education |
| insurance | insurance |

### JSON-LD
- 로고 파일: `public/logo.svg` (PNG 아님)
- Article, BreadcrumbList, WebSite, Organization 포함

---

## 콘텐츠 주의사항

### 연도별 정보 정확성
| 연도 | 트렌드 코리아 | 띠 |
|------|--------------|-----|
| 2025년 | SNAKE SENSE | 을사년 (뱀) |
| 2026년 | HORSE POWER | 병오년 (말) |

⚠️ 게시글 작성 시 연도와 키워드 일치 확인 필수!

### 데이터 검증
- AI 생성 정보는 **공식 출처로 반드시 검증**
- 검증 출처: 국세청, 국민건강보험공단, Q-Net, 고용노동부 등

---

## 자동 업데이트 규칙

**다음 상황에서 `docs/PROGRESS.md` 업데이트 필수:**

1. 새로운 기능 구현 완료
2. 버그 수정 완료
3. 배포 완료
4. 세션 종료 시

### 업데이트 형식
```markdown
## YYYY-MM-DD

### 완료된 작업
| 작업 내용 | 상태 |
|----------|------|
| [작업 설명] | ✅ |
```

### 상태 표시
- ✅ 완료
- 🔄 진행 중
- ⏳ 대기 중
- ❌ 취소/실패

---

## 테스트/퀴즈 개발 핵심

### 공유 링크 기능
- URL 파라미터로 결과 전달: `?score=XX`
- 공유 결과 vs 본인 결과 UI 구분

| 상황 | 배너 | 버튼 |
|------|------|------|
| 공유 결과 | "친구의 테스트 결과예요!" | 나도 테스트하기 |
| 본인 결과 | 없음 | 결과 공유하기, 다시 하기 |

상세 가이드: `docs/TEST_DEVELOPMENT.md`
