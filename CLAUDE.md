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

# Cloudflare Workers 빌드
npm run cf:build

# Cloudflare Workers 배포
CLOUDFLARE_API_KEY="c3a9f4fe1100c03ea1a3287c0655a7bbd1675" \
CLOUDFLARE_EMAIL="granadu0417@gmail.com" \
npm run cf:deploy
```

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

## 참고 문서
- [프론트엔드 아키텍처](docs/FRONTEND_ARCHITECTURE.md)
- [진행 현황](docs/PROGRESS.md)
