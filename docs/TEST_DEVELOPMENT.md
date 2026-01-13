# 테스트/퀴즈 개발 가이드

> sseuksak.com 인터랙티브 테스트 및 퀴즈 개발 규칙

## 폴더 구조

```
src/app/tests/
├── page.tsx           # 테스트 목록 페이지
├── mental-age/        # 정신연령 테스트
│   └── page.tsx
└── [future-test]/     # 추가 테스트들
    └── page.tsx
```

## UI 일관성 규칙

### 이모지 사용 금지

크로스 플랫폼 렌더링 차이로 인해 **텍스트 + 그라데이션 박스** 사용:

```tsx
// ❌ 이모지 사용 (비권장)
<span>🧠</span>

// ✅ 텍스트 + 그라데이션 박스 (권장)
<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500
                flex items-center justify-center text-white font-bold text-xl shadow-lg">
  정신
</div>
```

### 그라데이션 패턴

| 테스트 유형 | 그라데이션 |
|-------------|-----------|
| 심리 테스트 | `from-purple-500 to-pink-500` |
| 능력 테스트 | `from-blue-500 to-cyan-500` |
| 재미 테스트 | `from-orange-500 to-yellow-500` |

## 공유 링크 기능 구현

### URL 파라미터로 결과 전달

테스트 결과 공유 시 URL에 점수를 포함하여 결과 화면 직접 표시:

```typescript
// 공유 URL 생성
const shareResult = useCallback(async () => {
  const currentScore = answers.reduce((sum, score) => sum + score, 0);

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const shareUrl = `${baseUrl}?score=${currentScore}`;

  // Web Share API 또는 클립보드 복사
  if (navigator.share) {
    await navigator.share({ title, text, url: shareUrl });
  } else {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
  }
}, [answers]);
```

### Next.js 15 Suspense 필수

`useSearchParams` 사용 시 반드시 Suspense로 감싸야 함:

```tsx
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 실제 콘텐츠 컴포넌트
function TestContent() {
  const searchParams = useSearchParams();
  const scoreParam = searchParams.get('score');

  // URL 파라미터 파싱 (컴포넌트 초기화 시)
  const initialSharedScore = scoreParam ? parseInt(scoreParam, 10) : null;
  const isValidSharedScore = initialSharedScore !== null
    && !isNaN(initialSharedScore)
    && initialSharedScore >= MIN_SCORE
    && initialSharedScore <= MAX_SCORE;

  const [state, setState] = useState(isValidSharedScore ? 'result' : 'intro');
  const [sharedScore, setSharedScore] = useState(isValidSharedScore ? initialSharedScore : null);

  // ...
}

// 로딩 폴백
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>로딩 중...</p>
    </div>
  );
}

// 페이지 컴포넌트 (Suspense 래퍼)
export default function TestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TestContent />
    </Suspense>
  );
}
```

### URL 파라미터 초기화

다시 시작 시 URL 파라미터 제거:

```typescript
const restart = useCallback(() => {
  // URL 파라미터 제거
  if (typeof window !== 'undefined' && sharedScore !== null) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  setState('intro');
  setSharedScore(null);
  // 기타 상태 초기화...
}, [sharedScore]);
```

## 공유 결과 화면 UI

### 본인 결과 vs 친구 결과 구분

```tsx
const isSharedResult = sharedScore !== null;

// 결과 화면
{state === 'result' && (
  <div>
    {/* 공유 결과 배너 */}
    {isSharedResult && (
      <div className="bg-purple-100 text-purple-700 rounded-xl px-4 py-3 mb-4 text-sm">
        친구의 테스트 결과예요!
      </div>
    )}

    {/* 결과 내용 */}
    <ResultContent score={sharedScore ?? calculatedScore} />

    {/* 버튼 - 상황에 따라 다르게 표시 */}
    {isSharedResult ? (
      <>
        <button onClick={restart}>나도 테스트하기</button>
        <button onClick={shareResult}>이 결과 공유하기</button>
      </>
    ) : (
      <>
        <button onClick={shareResult}>결과 공유하기</button>
        <button onClick={restart}>다시 하기</button>
      </>
    )}
  </div>
)}
```

### UI 비교표

| 상황 | 배너 | 주 버튼 | 부 버튼 |
|------|------|---------|---------|
| 본인 결과 | 없음 | 결과 공유하기 | 다시 하기 |
| 공유 결과 | "친구의 테스트 결과예요!" | 나도 테스트하기 | 이 결과 공유하기 |

## 테스트 상태 관리

### 상태 타입

```typescript
type TestState = 'intro' | 'question' | 'result';

const [state, setState] = useState<TestState>('intro');
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState<number[]>([]);
const [sharedScore, setSharedScore] = useState<number | null>(null);
```

### 상태 흐름

```
[공유 링크 접속]          [직접 접속]
      ↓                      ↓
   result ←──────────────→ intro
      ↓                      ↓
(나도 테스트하기)      (테스트 시작)
      ↓                      ↓
    intro                question
                             ↓
                          result
                             ↓
                    (다시 하기 / 공유)
```

## 결과 계산 로직

### 점수 범위 기반 결과

```typescript
interface TestResult {
  age: string;
  title: string;
  description: string;
  traits: string[];
  advice: string;
}

const getResult = (score: number): TestResult => {
  if (score <= 20) return { age: '10대', ... };
  if (score <= 28) return { age: '20대', ... };
  if (score <= 36) return { age: '30대', ... };
  if (score <= 44) return { age: '40대', ... };
  return { age: '50대 이상', ... };
};
```

## 추천 테스트 아이디어

| 테스트 | 연계 콘텐츠 | 바이럴 포인트 |
|--------|------------|--------------|
| 나의 소비 유형 테스트 | 신용카드 비교 글 | SNS 공유 |
| 재테크 성향 테스트 | ETF 가이드 글 | 결과 이미지 |
| 연말정산 환급 예측 | 연말정산 글 | 금액 공유 |
| 절약 레벨 테스트 | 생활비 절약 글 | 레벨 비교 |
