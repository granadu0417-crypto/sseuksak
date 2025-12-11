# Supabase 데이터베이스 설정 가이드

이 문서는 쓱싹 프로젝트의 Supabase 데이터베이스를 설정하는 방법을 안내합니다.

## 📋 사용자가 해야 할 작업

### 1단계: Supabase 프로젝트 생성 (5분)

1. [https://supabase.com](https://supabase.com) 접속
2. **Start your project** 클릭 → GitHub 계정으로 로그인
3. **New Project** 클릭
4. 프로젝트 설정:
   - **Name**: `sseuksak` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 설정 (기억해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 사용자용)
5. **Create new project** 클릭 → 2-3분 대기

### 2단계: 환경변수 복사 (1분)

1. Supabase 대시보드에서 **Settings** → **API** 클릭
2. 다음 값을 복사:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (긴 문자열)

3. 프로젝트 폴더에서 `.env.local` 파일 생성:
   ```bash
   # Windows (PowerShell)
   copy .env.local.example .env.local

   # Mac/Linux
   cp .env.local.example .env.local
   ```

4. `.env.local` 파일을 열고 복사한 값 붙여넣기:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...복사한키...
   ```

### 3단계: 데이터베이스 테이블 생성 (2분)

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사 → 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. "Success. No rows returned" 메시지 확인

### 4단계: 초기 데이터 입력 (1분)

1. SQL Editor에서 새 쿼리 생성
2. `supabase/seed.sql` 파일 내용 전체 복사 → 붙여넣기
3. **Run** 버튼 클릭
4. "Success" 메시지 확인

### 5단계: 확인 (1분)

1. Supabase 대시보드에서 **Table Editor** 클릭
2. 생성된 테이블 확인:
   - ✅ profiles
   - ✅ categories (12개 카테고리 데이터)
   - ✅ services (10개 샘플 서비스)
   - ✅ reviews (5개 샘플 리뷰)
   - ✅ favorites
   - ✅ chat_rooms
   - ✅ chat_messages

3. 개발 서버 재시작:
   ```bash
   # Ctrl+C로 서버 중지 후
   npm run dev
   ```

4. http://localhost:3000 접속하여 데이터 확인

---

## 📁 프로젝트 구조

```
숨고사이트/
├── .env.local              # 환경변수 (직접 생성 필요)
├── .env.local.example      # 환경변수 템플릿
├── supabase/
│   ├── schema.sql          # 데이터베이스 스키마
│   └── seed.sql            # 초기 데이터
├── src/
│   ├── lib/
│   │   ├── supabase.ts         # 브라우저 클라이언트
│   │   ├── supabase-server.ts  # 서버 클라이언트
│   │   └── api/
│   │       └── services.ts     # 서비스 데이터 API
│   └── types/
│       └── database.ts         # TypeScript 타입 정의
```

---

## ❓ 문제 해결

### "Invalid API key" 오류
- `.env.local` 파일의 키가 올바른지 확인
- 개발 서버 재시작 필요 (환경변수 변경 후)

### "relation does not exist" 오류
- `schema.sql`이 제대로 실행되었는지 확인
- Table Editor에서 테이블이 생성되었는지 확인

### 데이터가 표시되지 않음
- `seed.sql`이 실행되었는지 확인
- 브라우저 개발자 도구(F12) → Network 탭에서 오류 확인

### RLS 정책 오류
- 현재 익명 사용자도 조회 가능하도록 설정됨
- 추후 인증 기능 추가 시 정책 수정 필요

---

## 🚀 다음 단계

데이터베이스 설정이 완료되면:

1. **인증 기능 추가**: 회원가입/로그인 구현
2. **서비스 등록**: 전문가 서비스 등록 페이지
3. **검색 기능**: 서비스 검색 및 필터링
4. **채팅 기능**: 실시간 채팅 구현
5. **결제 연동**: Toss Payments 등 결제 시스템

---

## 💡 팁

- Supabase 무료 플랜: 500MB 데이터베이스, 월 2GB 대역폭
- 실시간 기능(채팅)은 Supabase Realtime 사용 가능
- 이미지 업로드는 Supabase Storage 사용 예정
