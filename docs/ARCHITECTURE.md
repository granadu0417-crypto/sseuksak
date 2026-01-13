# 아키텍처 결정사항

> sseuksak.com 프로젝트의 기술 아키텍처 및 설계 결정사항

## 기술 스택

```yaml
프레임워크: Next.js 15 (App Router)
스타일링: Tailwind CSS v4
언어: TypeScript 5
런타임: React 19
배포: Cloudflare Workers
캐시: Cloudflare KV
어댑터: @opennextjs/cloudflare
```

## Cloudflare 배포 결정

| 항목 | 선택 | 이유 |
|------|------|------|
| 배포 방식 | **Workers** | Pages는 빌드 시간/크기 제한, Next.js 지원 제한적 |
| 캐시 방식 | **KV** | Hugo 등 정적 생성기는 KV 미지원 |
| 배포 전략 | **증분 배포** | 전체 배포는 비효율적, KV 증분 캐시 활용 |

### 검토했던 대안들

```
❌ Cloudflare Pages
   - 빌드 시간 제한 (20분)
   - 빌드 크기 제한 (20,000 파일)
   - Next.js 지원 제한적

❌ Hugo + Workers
   - KV 증분 배포 미지원
   - 동적 기능 구현 어려움

✅ Next.js + Workers + KV 증분 배포
   - 동적 라우팅 지원
   - ISR(Incremental Static Regeneration) 가능
   - KV 캐시로 빠른 응답
```

## 네비게이션 구조

게시글 접근 시 반드시 **브레드크럼 네비게이션** 구조 사용:

```
홈 > 카테고리 > 게시글 제목

예시:
홈 > 금융/투자 > 2026년 추천 신용카드 비교 가이드
홈 > IT/테크 > 업무 효율을 높이는 AI 도구 추천
```

### 필수 네비게이션 요소

| 요소 | 위치 | 설명 |
|------|------|------|
| 브레드크럼 | 상단 | 현재 위치 표시 |
| 이전/다음 게시글 | 하단 | 시리즈 탐색 |
| 관련 게시글 | 하단 | 추천 콘텐츠 |
| 카테고리 링크 | 하단 | 카테고리로 돌아가기 |

## 폴더 구조

```
src/
├── app/           # Next.js 페이지 (App Router)
│   ├── posts/     # 게시글 페이지
│   ├── category/  # 카테고리 페이지
│   ├── tag/       # 태그 페이지
│   ├── tools/     # 계산기/도구 페이지
│   ├── tests/     # 인터랙티브 테스트
│   └── calendar/  # 일정 캘린더
├── components/    # React 컴포넌트
│   ├── ui/        # shadcn/ui 기본 컴포넌트
│   ├── layout/    # 레이아웃 컴포넌트
│   ├── post/      # 게시글 관련 컴포넌트
│   └── common/    # 공통 컴포넌트
├── lib/           # 유틸리티 함수
├── hooks/         # 커스텀 훅
├── constants/     # 상수 정의
└── types/         # TypeScript 타입

docs/              # 문서
├── PROGRESS.md    # 진행 현황
├── ARCHITECTURE.md # 아키텍처 (이 문서)
└── archive/       # 아카이브

content/posts/     # 마크다운 게시글
```

## SEO 아키텍처

### 메타데이터 생성

| 항목 | 파일 | 설명 |
|------|------|------|
| sitemap.xml | `src/app/sitemap.ts` | 자동 생성 |
| robots.txt | `src/app/robots.ts` | 크롤러 허용 규칙 |
| OG 이미지 | `generateMetadata()` | Unsplash API 연동 |

### JSON-LD 구조화 데이터

- **Article**: 개별 게시글 페이지
- **BreadcrumbList**: 네비게이션 경로
- **WebSite**: 사이트 전체 정보
- **Organization**: 발행자 정보

### 주의사항

```typescript
// Unsplash API는 한글 검색어 미지원
// ❌ 잘못된 방법
const searchQuery = post.tags[0]; // 한글 태그

// ✅ 올바른 방법
const searchQuery = post.category; // 영어 카테고리
```

## 성능 최적화

### PageSpeed 목표

| 지표 | 목표 | 현재 |
|------|------|------|
| Performance | 80+ | 78-80 |
| Accessibility | 95+ | 96 |
| Best Practices | 95+ | 96 |
| SEO | 90+ | 92 |

### 적용된 최적화

- 폰트 preload 및 최적화
- AdSense lazyOnload
- LCP 이미지 priority
- 미사용 JS 제거
- CSS 최적화 (critters)
