# sseuksak.com 프로젝트 규칙

## 프로젝트 개요
- **프로젝트**: sseuksak.com AdSense 블로그
- **기술 스택**: Next.js 15, Tailwind CSS v4, TypeScript, Cloudflare Workers
- **라이브 URL**: https://sseuksak.com

---

## 아키텍처 결정사항

### Cloudflare 배포 규칙

| 항목 | 선택 | 이유 |
|------|------|------|
| 배포 방식 | **Workers** | Pages는 빌드 시간/크기 제한, Next.js 지원 제한적 |
| 캐시 방식 | **KV** | Hugo 등 정적 생성기는 KV 미지원 |
| 배포 전략 | **증분 배포** | 전체 배포는 비효율적, KV 증분 캐시 활용 |

```
❌ Cloudflare Pages (deprecated, 제한 많음)
❌ Hugo + Workers (KV 증분 배포 미지원)
✅ Next.js + Workers + KV 증분 배포
```

### 네비게이션 구조 규칙

게시글 접근 시 반드시 **브레드크럼 네비게이션** 구조 사용:

```
홈 > 카테고리 > 게시글 제목

예시:
홈 > 금융/투자 > 2026년 추천 신용카드 비교 가이드
홈 > IT/테크 > 업무 효율을 높이는 AI 도구 추천
```

**필수 네비게이션 요소:**
- 브레드크럼 (현재 위치 표시)
- 이전/다음 게시글 링크
- 관련 게시글 추천
- 카테고리로 돌아가기 링크

---

## 자동 진행 현황 업데이트 규칙

### PROGRESS.md 업데이트 필수 조건

다음 상황에서 반드시 `docs/PROGRESS.md` 파일을 업데이트해야 합니다:

1. **작업 완료 시**
   - 새로운 기능 구현 완료
   - 버그 수정 완료
   - 설정 변경 완료
   - 배포 완료

2. **계획서 생성 시**
   - 새로운 `.md` 문서 생성
   - 아키텍처 문서 작성
   - TODO 목록 작성

3. **세션 종료 시**
   - 해당 세션에서 완료한 작업 기록
   - 다음 세션 할 일 업데이트

### 업데이트 형식

```markdown
### YYYY-MM-DD

#### 완료된 작업
| 시간 | 작업 내용 | 상태 |
|------|----------|------|
| - | [작업 설명] | ✅ 완료 |

#### 생성된 계획서
| 문서 | 경로 | 설명 |
|------|------|------|
| [문서명] | `[경로]` | [설명] |
```

### 상태 표시
- ✅ 완료
- 🔄 진행 중
- ⏳ 대기 중
- ❌ 취소/실패

---

## 배포 명령어

```bash
# 로컬 개발
npm run dev

# 배포 (캐시 삭제 + 빌드 + 배포)
CLOUDFLARE_API_TOKEN="PVRNKyVYVAr_i_boHjTfvuKwlzq5dFrpVNfiCkQ2" npm run cf:deploy
```

> **참고**: `cf:deploy`는 캐시 삭제(`cf:clean`) → 빌드(`cf:build`) → 배포를 순차 실행합니다.
> 새 파일이 감지 안 되는 OpenNext 캐시 문제를 방지합니다.
> 토큰: granadu0417@gmail.com 계정 (sseuksak-deploy). 다른 Cloudflare 로그인 상태여도 정상 작동.

---

## 폴더 구조 규칙

```
src/
├── app/           # Next.js 페이지 (App Router)
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
├── PROGRESS.md    # 진행 현황 (자동 업데이트)
└── *.md           # 기타 계획서

content/posts/     # 마크다운 게시글
```

---

## 코딩 규칙

### 도구 사용 규칙

| 도구 | 사용 여부 | 비고 |
|------|----------|------|
| **Playwright MCP** | ✅ 필수 사용 | 웹 페이지 접근, 브라우저 자동화 |
| **WebFetch** | ❌ 사용 금지 | Playwright로 대체 |

웹 페이지 접근이 필요한 모든 작업에서 반드시 Playwright MCP를 사용합니다.

### 컴포넌트
- 함수형 컴포넌트 사용
- Props 인터페이스는 컴포넌트 파일 내에 정의
- `'use client'`는 필요한 경우에만 사용

### 상수
- 반복되는 값은 `constants/` 폴더에 정의
- 카테고리 라벨은 `constants/categories.ts` 사용

### 스타일
- Tailwind CSS 클래스 직접 사용
- shadcn/ui 컴포넌트 활용

---

## SEO 및 색인 관련 규칙

### 색인 준비 상태
- **sitemap.xml**: 자동 생성 (`src/app/sitemap.ts`)
- **robots.txt**: Googlebot, Yeti(네이버) 허용 (`src/app/robots.ts`)
- **검증 태그**: Google/네이버 모두 설정됨 (`src/app/layout.tsx`)

### OG 이미지 규칙

⚠️ **주의사항**: Unsplash API는 **한글 검색어를 지원하지 않습니다**.

```typescript
// ❌ 잘못된 방법 (한글 태그 - 검색 실패)
const searchQuery = post.tags[0] || post.category;

// ✅ 올바른 방법 (영어 카테고리 사용)
const searchQuery = post.category || 'blog';
```

**카테고리 → Unsplash 검색어 매핑**:
| 카테고리 | 검색어 |
|----------|--------|
| lifestyle | lifestyle |
| finance | finance |
| tech | tech, technology |
| health | health |
| education | education |
| insurance | insurance |

### JSON-LD 구조화 데이터
- **로고 파일**: `public/logo.svg` (PNG 아님!)
- **Article**: 개별 게시글 페이지
- **BreadcrumbList**: 네비게이션 경로
- **WebSite**: 사이트 전체 정보
- **Organization**: 발행자 정보

---

## 콘텐츠 작성 시 주의사항

### 연도별 정보 정확성

⚠️ **트렌드 코리아 시리즈 주의**:
- 2025년: SNAKE SENSE (을사년, 뱀띠)
- 2026년: HORSE POWER (병오년, 말띠)

게시글 작성 시 연도와 키워드가 일치하는지 반드시 확인!

### 띠별 운세 작성 시
- 2026년 = 병오년 (丙午年) = 붉은 말의 해
- 60년 주기 (갑자 순환)

---

## 참고 문서
- [프론트엔드 아키텍처](docs/FRONTEND_ARCHITECTURE.md)
- [진행 현황](docs/PROGRESS.md)
- [배포 가이드](docs/DEPLOYMENT_GUIDE.md)
