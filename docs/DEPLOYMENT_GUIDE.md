# sseuksak.com 빌드 및 배포 가이드

## 개요

이 프로젝트는 **GitHub Actions**를 통해 자동으로 **Cloudflare Workers**에 배포됩니다.

```
[콘텐츠 작성] → [Git Push] → [GitHub Actions] → [Cloudflare Workers]
     ↓              ↓              ↓                    ↓
  .md 파일      main 브랜치    자동 빌드/배포      sseuksak.com 반영
```

---

## 일상적인 작업 흐름

### 새 게시글 작성 및 배포

```bash
# 1. 새 게시글 작성
# content/posts/ 폴더에 마크다운 파일 생성

# 2. 변경사항 커밋 및 푸시
git add .
git commit -m "post: 새 게시글 제목"
git push origin main

# 3. 자동 배포 (약 2분 소요)
# GitHub Actions가 자동으로 실행됩니다
```

### 배포 확인 방법

1. **GitHub Actions 확인**: https://github.com/[username]/adsense/actions
2. **라이브 사이트 확인**: https://sseuksak.com

---

## 로컬 개발

### 개발 서버 실행

```bash
npm run dev
```
- 접속: http://localhost:3000
- 파일 변경 시 자동 새로고침

### 로컬에서 Cloudflare 환경 테스트

```bash
# Cloudflare Workers 빌드
npm run cf:build

# Cloudflare 로컬 개발 서버
npm run cf:dev
```

---

## 수동 배포 (필요시)

GitHub Actions 없이 직접 배포하려면:

```bash
# 1. 빌드
npm run cf:build

# 2. 배포
CLOUDFLARE_API_TOKEN="your-token" \
CLOUDFLARE_ACCOUNT_ID="your-account-id" \
npm run cf:deploy
```

---

## 배포 프로세스 상세

### GitHub Actions 워크플로우

`.github/workflows/deploy.yml`:

1. **Checkout**: 코드 체크아웃
2. **Setup Node.js**: Node.js 20 설치
3. **Install dependencies**: `npm ci`
4. **Build**: `npm run cf:build` (OpenNext 빌드)
5. **Deploy**: `npm run cf:deploy` (Cloudflare 배포 + KV 캐시 업로드)

### 빌드 산출물

```
.open-next/
├── worker.js          # Cloudflare Worker 코드
├── assets/            # 정적 파일 (CSS, JS, 이미지)
└── cache/             # 프리렌더링된 페이지 캐시
```

### KV 캐시

- **용도**: SSG 페이지 캐시 저장
- **Namespace ID**: `730393564acb444b84d96c45e82a6ff8`
- **바인딩**: `NEXT_INC_CACHE_KV`

배포 시 자동으로 KV에 캐시가 업로드됩니다:
```
Populating KV incremental cache...
Successfully populated cache with XX assets
```

---

## 트러블슈팅

### 게시글이 404 에러 발생

**원인**: KV 캐시에 페이지가 업로드되지 않음

**해결**:
1. GitHub Actions 로그에서 "Populating KV" 메시지 확인
2. 없다면 다시 푸시하여 재배포

### 빌드 실패

**확인 사항**:
1. `npm run build`가 로컬에서 성공하는지 확인
2. 마크다운 파일 문법 오류 확인
3. 이미지 경로가 올바른지 확인

### 배포 후 변경사항 미반영

**해결**:
1. Cloudflare Dashboard에서 캐시 퍼지
2. 브라우저 캐시 삭제 후 확인
3. 5-10분 대기 (CDN 캐시 갱신)

---

## 환경 변수

### GitHub Secrets (CI/CD용)

| 변수명 | 설명 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |

### 로컬 개발용 (.env.local)

```bash
# 필요시 추가
NEXT_PUBLIC_SITE_URL=https://sseuksak.com
```

---

## 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | Next.js 빌드 |
| `npm run cf:build` | Cloudflare Workers 빌드 |
| `npm run cf:dev` | Cloudflare 로컬 테스트 |
| `npm run cf:deploy` | Cloudflare 배포 |

---

## 요약: 새 글 배포하기

```bash
# 이것만 하면 됩니다!
git add .
git commit -m "post: 게시글 제목"
git push origin main

# 2분 후 https://sseuksak.com 에서 확인
```
