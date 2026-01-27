# sseuksak.com 프론트엔드 아키텍처 계획서

## 현재 상태 분석

### 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: Tailwind CSS v4
- **언어**: TypeScript 5
- **React**: 19

### 현재 구조
```
src/
├── app/           # 10개 페이지/라우트
├── components/    # 7개 컴포넌트
└── lib/           # 2개 유틸리티
```

### 개선이 필요한 부분
1. **코드 중복**: `categoryLabels`가 3개 파일에서 반복
2. **타입/상수 관리 부재**: 공유 상수/타입이 체계화되지 않음
3. **컴포넌트 구조화 부재**: 모든 컴포넌트가 한 폴더에 혼재
4. **재사용 UI 컴포넌트 부족**: Button, Card 등 기본 UI 없음

---

## 목표 아키텍처

### 새로운 폴더 구조
```
src/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 메인 레이아웃 그룹
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── posts/[slug]/
│   │   ├── category/[slug]/
│   │   └── tag/[slug]/
│   ├── (legal)/                  # 법률 페이지 그룹
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── layout.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui 기본 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── sheet.tsx            # 모바일 메뉴용
│   │
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Header.tsx           # 메인 헤더
│   │   ├── Footer.tsx           # 푸터
│   │   ├── Sidebar.tsx          # 사이드바 (카테고리, 태그)
│   │   ├── MobileNav.tsx        # 모바일 네비게이션
│   │   └── Container.tsx        # 레이아웃 컨테이너
│   │
│   ├── post/                     # 게시글 관련 컴포넌트
│   │   ├── PostCard.tsx         # 게시글 카드
│   │   ├── PostList.tsx         # 게시글 리스트
│   │   ├── PostContent.tsx      # 게시글 본문
│   │   ├── PostHeader.tsx       # 게시글 헤더
│   │   ├── PostNavigation.tsx   # 이전/다음 게시글
│   │   ├── RelatedPosts.tsx     # 관련 게시글
│   │   └── TableOfContents.tsx  # 목차
│   │
│   ├── common/                   # 공통 컴포넌트
│   │   ├── Breadcrumb.tsx       # 경로 표시
│   │   ├── SearchBar.tsx        # 검색바
│   │   ├── Pagination.tsx       # 페이지네이션
│   │   ├── CategoryBadge.tsx    # 카테고리 배지
│   │   ├── TagList.tsx          # 태그 목록
│   │   ├── ShareButtons.tsx     # 공유 버튼
│   │   └── ScrollToTop.tsx      # 맨 위로 버튼
│   │
│   └── ads/                      # 광고 컴포넌트
│       ├── AdSense.tsx          # 구글 애드센스
│       ├── AdBanner.tsx         # 배너 광고
│       └── AdInArticle.tsx      # 본문 내 광고
│
├── lib/
│   ├── posts.ts                  # 게시글 CRUD 로직
│   ├── metadata.ts               # SEO 메타데이터 생성
│   ├── utils.ts                  # cn() 등 유틸리티
│   └── format.ts                 # 날짜, 숫자 포맷
│
├── hooks/                        # 커스텀 훅
│   ├── useMediaQuery.ts         # 반응형 감지
│   ├── usePagination.ts         # 페이지네이션 로직
│   ├── useSearch.ts             # 검색 로직
│   ├── useLocalStorage.ts       # 로컬 스토리지
│   └── useIntersectionObserver.ts # 무한 스크롤
│
├── constants/                    # 상수
│   ├── categories.ts            # 카테고리 정의
│   ├── navigation.ts            # 네비게이션 메뉴
│   ├── seo.ts                   # SEO 기본값
│   └── config.ts                # 사이트 설정
│
└── types/                        # 타입 정의
    ├── post.ts                  # 게시글 타입
    ├── category.ts              # 카테고리 타입
    └── index.ts                 # 통합 export
```

---

## shadcn/ui 도입 계획

### 설치 명령어
```bash
# shadcn/ui 초기화
npx shadcn@latest init

# 필요한 컴포넌트 설치
npx shadcn@latest add button card badge skeleton
npx shadcn@latest add input dialog dropdown-menu sheet
npx shadcn@latest add breadcrumb pagination
```

### 기본 설정 (components.json)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 상수 통합 계획

### src/constants/categories.ts
```typescript
export const CATEGORIES = {
  finance: { name: '금융/투자', slug: 'finance', icon: '💰', cpc: 5 },
  insurance: { name: '보험/법률', slug: 'insurance', icon: '🏥', cpc: 5 },
  health: { name: '건강/의료', slug: 'health', icon: '❤️', cpc: 4 },
  tech: { name: 'IT/테크', slug: 'tech', icon: '💻', cpc: 4 },
  education: { name: '교육/자격증', slug: 'education', icon: '📚', cpc: 3 },
  lifestyle: { name: '생활정보', slug: 'lifestyle', icon: '✨', cpc: 3 },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

export const getCategoryLabel = (slug: CategorySlug): string => {
  return CATEGORIES[slug]?.name || slug;
};

export const getAllCategories = (): CategorySlug[] => {
  return Object.keys(CATEGORIES) as CategorySlug[];
};
```

### src/constants/navigation.ts
```typescript
import { CATEGORIES, CategorySlug } from './categories';

export const MAIN_NAV = Object.entries(CATEGORIES).map(([slug, data]) => ({
  name: data.name,
  href: `/category/${slug}`,
  slug: slug as CategorySlug,
}));

export const FOOTER_NAV = {
  about: [
    { name: '소개', href: '/about' },
    { name: '연락처', href: '/contact' },
  ],
  legal: [
    { name: '개인정보처리방침', href: '/privacy' },
    { name: '이용약관', href: '/terms' },
  ],
  categories: MAIN_NAV,
};
```

### src/constants/config.ts
```typescript
export const SITE_CONFIG = {
  name: '쓱싹',
  title: '쓱싹 - 유용한 정보 블로그',
  description: '금융, 건강, IT 등 다양한 주제의 유용한 정보를 쉽게 알려드립니다.',
  url: 'https://sseuksak.com',
  locale: 'ko_KR',

  // AdSense
  adsense: {
    enabled: false, // AdSense 승인 후 true로 변경
    clientId: 'ca-pub-XXXXXXXXXX',
  },

  // SEO
  defaultOgImage: '/og-image.png',
  twitterHandle: '@sseuksak',

  // 페이지네이션
  postsPerPage: 12,
} as const;
```

---

## 타입 통합 계획

### src/types/post.ts
```typescript
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: CategorySlug;
  tags: string[];
  thumbnail?: string;
  readingTime: string;
  author?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export interface PostListProps {
  posts: PostMeta[];
  layout?: 'grid' | 'list';
  columns?: 1 | 2 | 3;
}
```

### src/types/category.ts
```typescript
import { CATEGORIES } from '@/constants/categories';

export type CategorySlug = keyof typeof CATEGORIES;

export interface Category {
  name: string;
  slug: CategorySlug;
  icon: string;
  cpc: number;
}
```

---

## 컴포넌트 마이그레이션 계획

### 1단계: 기본 설정
- [ ] shadcn/ui 설치 및 초기화
- [ ] lib/utils.ts에 cn() 함수 추가
- [ ] constants/ 폴더 생성 및 상수 통합

### 2단계: UI 컴포넌트 추가
- [ ] Button, Card, Badge 추가
- [ ] Sheet (모바일 메뉴용) 추가
- [ ] Skeleton (로딩 상태용) 추가

### 3단계: 레이아웃 컴포넌트 리팩토링
- [ ] Header.tsx → shadcn Sheet 사용하여 모바일 메뉴 개선
- [ ] Footer.tsx → 상수 파일 사용하도록 변경
- [ ] 새로운 Container.tsx 추가

### 4단계: 게시글 컴포넌트 리팩토링
- [ ] PostCard.tsx → shadcn Card 사용
- [ ] CategoryBadge 컴포넌트 분리
- [ ] PostNavigation.tsx 개선
- [ ] RelatedPosts.tsx 개선

### 5단계: 공통 컴포넌트 추가
- [ ] Pagination 컴포넌트 추가
- [ ] SearchBar 컴포넌트 추가
- [ ] ScrollToTop 버튼 추가
- [ ] ShareButtons 추가

### 6단계: 페이지 리팩토링
- [ ] 홈페이지 리팩토링
- [ ] 카테고리 페이지 리팩토링
- [ ] 게시글 상세 페이지 리팩토링

---

## 예상 일정

| 단계 | 작업 내용 | 예상 시간 |
|------|----------|-----------|
| 1단계 | 기본 설정 | 30분 |
| 2단계 | UI 컴포넌트 | 1시간 |
| 3단계 | 레이아웃 리팩토링 | 1시간 |
| 4단계 | 게시글 컴포넌트 | 1시간 |
| 5단계 | 공통 컴포넌트 | 1시간 |
| 6단계 | 페이지 리팩토링 | 1시간 |
| **총계** | | **5.5시간** |

---

## 참고 자료

- [shadcn/ui 공식 문서](https://ui.shadcn.com/)
- [Next.js App Router 가이드](https://nextjs.org/docs/app)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React 19 새 기능](https://react.dev/blog)

---

## 완료 조건

- [ ] 모든 컴포넌트가 새 구조로 마이그레이션
- [ ] 코드 중복 제거 완료
- [ ] TypeScript 타입 오류 없음
- [ ] 빌드 성공 및 배포 테스트 완료
- [ ] 모바일/데스크톱 반응형 확인
- [ ] Lighthouse 성능 점수 90점 이상
