# sseuksak.com 프로젝트 진행 현황

> 마지막 업데이트: 2026-01-05

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트 | sseuksak.com AdSense 블로그 |
| 시작일 | 2026-01-02 |
| 현재 상태 | 🟢 라이브 |
| 사이트 URL | https://sseuksak.com |

---

## 현재 진행 상황

### 완료된 단계
- [x] 프로젝트 초기 설정
- [x] Cloudflare Workers 배포
- [x] 도메인 연결

### 진행 중
- [ ] 프론트엔드 리팩토링

### 대기 중
- [ ] AdSense 신청
- [ ] 콘텐츠 확충 (20개 이상)

---

## 작업 기록

### 2026-01-02 (Day 1)

#### 완료된 작업

| 시간 | 작업 내용 | 상태 |
|------|----------|------|
| - | SSH 키 생성 및 GitHub 설정 | ✅ 완료 |
| - | Next.js 15 프로젝트 생성 | ✅ 완료 |
| - | Tailwind CSS 설정 | ✅ 완료 |
| - | 컴포넌트 구현 (Header, Footer, PostCard 등) | ✅ 완료 |
| - | 샘플 게시글 3개 작성 | ✅ 완료 |
| - | GitHub Push | ✅ 완료 |
| - | Cloudflare KV 네임스페이스 생성 | ✅ 완료 |
| - | Cloudflare Workers 배포 | ✅ 완료 |
| - | sseuksak.com 도메인 연결 | ✅ 완료 |

#### 생성된 계획서

| 문서 | 경로 | 설명 |
|------|------|------|
| 프로젝트 계획서 | `~/.claude/plans/playful-sauteeing-swan.md` | 전체 프로젝트 계획 |
| 프론트엔드 아키텍처 | `docs/FRONTEND_ARCHITECTURE.md` | 프론트엔드 리팩토링 계획 |

#### 세션 후반 추가 작업

| 시간 | 작업 내용 | 상태 |
|------|----------|------|
| - | PROGRESS.md 진행 현황 문서 생성 | ✅ 완료 |
| - | CLAUDE.md 프로젝트 규칙 생성 (자동 업데이트 규칙 포함) | ✅ 완료 |

#### 주요 결정사항
- Next.js 15 사용 (16은 OpenNext 호환성 문제)
- Cloudflare Workers + KV 조합 선택
- shadcn/ui 도입 예정
- PROGRESS.md 자동 업데이트 규칙 도입

---

## 계획서 목록

| 문서명 | 경로 | 상태 | 생성일 |
|--------|------|------|--------|
| 프로젝트 마스터 플랜 | `~/.claude/plans/playful-sauteeing-swan.md` | 🟡 진행 중 | 2026-01-02 |
| 프론트엔드 아키텍처 | `docs/FRONTEND_ARCHITECTURE.md` | 🟡 대기 중 | 2026-01-02 |
| 프로젝트 규칙 | `CLAUDE.md` | 🟢 활성 | 2026-01-02 |

---

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

---

## 주요 링크

- **프로덕션**: https://sseuksak.com
- **Workers URL**: https://sseuksak-blog.granadu0417.workers.dev
- **GitHub**: https://github.com/granadu0417-crypto/sseuksak-blog

---

## 메모

### 알려진 이슈
- ~~일부 정적 자산 404 에러 (CDN 전파 대기 중)~~ ✅ 해결됨 (2026-01-05)
- `/images/ai-tools.jpg` 404 (이미지 파일 미존재)
- 일부 카테고리/태그 페이지 404 (콘텐츠 미생성)

### 다음 세션 할 일
1. shadcn/ui 설치 및 초기화
2. 상수 파일 생성 (constants/)
3. 컴포넌트 구조 리팩토링
4. 누락된 이미지 파일 추가

---

## 작업 기록 (상세)

### 2026-01-05

#### 완료된 작업

| 시간 | 작업 내용 | 상태 |
|------|----------|------|
| - | CSS/JS 404 에러 근본 원인 분석 | ✅ 완료 |
| - | wrangler.toml 설정 수정 ([site] → [assets]) | ✅ 완료 |
| - | Cloudflare Workers 재배포 | ✅ 완료 |
| - | CSS/JS 정상 로딩 검증 | ✅ 완료 |

#### 핵심 수정 사항

**문제**: 프로덕션(sseuksak.com)에서 CSS/JS/폰트 404 에러

**근본 원인**:
- wrangler.toml에서 `[site]` 설정 사용 (Workers Sites 방식)
- Workers Sites는 KV에 파일을 해시 형식으로 저장
- @opennextjs/cloudflare는 `[assets]` 방식 필요

**해결책**:
```toml
# 이전 (잘못된 설정)
[site]
bucket = ".open-next/assets"

# 수정 후 (올바른 설정)
[assets]
binding = "ASSETS"
directory = ".open-next/assets"
```

**결과**:
- CSS 파일: 200 ✅
- JS 청크: 200 ✅
- 폰트 파일: 200 ✅
- 페이지 정상 렌더링 ✅
