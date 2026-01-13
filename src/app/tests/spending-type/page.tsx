'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터 - 각 답변은 특정 유형에 점수 부여
// A: 플렉스형, B: 가치소비형, C: 계획형, D: 절약형, E: 감정소비형
const QUESTIONS = [
  {
    id: 1,
    question: '월급날, 통장에 돈이 들어왔어요!',
    options: [
      { text: '오늘은 나를 위한 플렉스 데이!', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '미리 찜해둔 물건 드디어 구매', scores: { A: 1, B: 2, C: 1, D: 0, E: 0 } },
      { text: '정해둔 예산대로 저축부터 이체', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '최대한 안 쓰고 버텨야지', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
  {
    id: 2,
    question: '친구가 비싼 레스토랑을 예약했어요.',
    options: [
      { text: '좋아! 인생은 즐기는 거야', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '특별한 날이니까 괜찮아', scores: { A: 1, B: 2, C: 1, D: 0, E: 0 } },
      { text: '이번 달 외식 예산 확인 먼저', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '집에서 해먹자고 제안', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 3,
    question: '쇼핑몰에서 50% 세일 중!',
    options: [
      { text: '일단 장바구니 폭탄 담기', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '평소 갖고 싶던 거 있으면 구매', scores: { A: 1, B: 2, C: 1, D: 0, E: 0 } },
      { text: '정말 필요한 것만 비교 후 구매', scores: { A: 0, B: 1, C: 3, D: 0, E: 0 } },
      { text: '세일이어도 안 사면 100% 할인', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 4,
    question: '요즘 스트레스가 쌓여서 힘들어요.',
    options: [
      { text: '지름신 강림! 쇼핑으로 스트레스 해소', scores: { A: 2, B: 0, C: 0, D: 0, E: 3 } },
      { text: '맛있는 거 먹으러 가자', scores: { A: 1, B: 1, C: 0, D: 0, E: 2 } },
      { text: '무료로 즐길 수 있는 활동 찾기', scores: { A: 0, B: 1, C: 2, D: 2, E: 0 } },
      { text: '그냥 참고 집에서 쉬기', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
  {
    id: 5,
    question: '온라인 쇼핑 중 장바구니에 물건이 쌓였어요.',
    options: [
      { text: '고민 없이 전체 결제!', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '정말 원하는 것 위주로 선별 구매', scores: { A: 1, B: 2, C: 1, D: 0, E: 0 } },
      { text: '며칠 두고 진짜 필요한지 고민', scores: { A: 0, B: 1, C: 3, D: 1, E: 0 } },
      { text: '장바구니 비우고 창 닫기', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 6,
    question: '관심 있던 취미 클래스가 생겼어요. 수강료는 30만원.',
    options: [
      { text: '바로 결제! 후회 없는 인생', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '나의 성장에 투자하는 건 아끼지 않아', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '예산 확인 후 다음 달로 계획', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '유튜브 무료 강의로 대체', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
  {
    id: 7,
    question: '카드 명세서 확인할 때 기분은?',
    options: [
      { text: '일단 안 봄. 무서워서...', scores: { A: 2, B: 0, C: 0, D: 0, E: 2 } },
      { text: '쓴 만큼 즐겼으니 OK', scores: { A: 2, B: 2, C: 0, D: 0, E: 0 } },
      { text: '예산 대비 지출 분석', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '최소 금액에 뿌듯함', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
  {
    id: 8,
    question: '갑자기 보너스 100만원이 들어왔어요!',
    options: [
      { text: '갖고 싶던 거 바로 구매!', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '반은 저축, 반은 의미있는 곳에', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '비상금 통장에 바로 이체', scores: { A: 0, B: 0, C: 2, D: 2, E: 0 } },
      { text: '전액 저축 또는 투자', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
  {
    id: 9,
    question: '친구 생일 선물을 사야 해요.',
    options: [
      { text: '가격 상관없이 마음에 드는 걸로', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '정성껏 고민해서 의미있는 선물', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '선물 예산 내에서 가성비 좋은 것', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '손편지나 직접 만든 것으로', scores: { A: 0, B: 1, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 10,
    question: '오늘 기분이 너무 좋아요!',
    options: [
      { text: '이런 날 안 쓰면 언제 쓰나', scores: { A: 2, B: 0, C: 0, D: 0, E: 3 } },
      { text: '좋은 기분 기념 소소한 지출', scores: { A: 1, B: 1, C: 0, D: 0, E: 2 } },
      { text: '기분과 지출은 별개', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '좋은 기분은 공짜로 즐기기', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
  {
    id: 11,
    question: '여행 계획을 세워요. 숙소 선택 기준은?',
    options: [
      { text: '최고급 호텔! 인생은 한 번', scores: { A: 3, B: 0, C: 0, D: 0, E: 0 } },
      { text: '경험에 투자, 좋은 뷰나 위치 우선', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '여행 예산에 맞춰 적당한 곳', scores: { A: 0, B: 1, C: 3, D: 0, E: 0 } },
      { text: '가장 저렴한 곳. 어차피 잠만 잠', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 12,
    question: '1년 후 통장 잔고 예상은?',
    options: [
      { text: '모르겠고 오늘이 중요해', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '어느 정도는 모아져 있을 듯', scores: { A: 1, B: 2, C: 1, D: 0, E: 0 } },
      { text: '목표 금액 달성 예정', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '지금보다 확실히 많을 것', scores: { A: 0, B: 0, C: 1, D: 3, E: 0 } },
    ],
  },
];

// 결과 타입
interface ResultType {
  type: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  traits: string[];
  tips: string[];
  compatibility: { good: string; bad: string };
}

// 결과 데이터
const RESULTS: Record<string, ResultType> = {
  A: {
    type: 'A',
    title: '욜로 플렉서',
    emoji: '💎',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50',
    description: '인생은 한 번! 현재의 행복을 위해 과감하게 소비하는 타입이에요. 돈은 쓰라고 있는 거라는 철학을 가지고 있어요.',
    traits: ['충동구매 잦음', 'YOLO 정신', '트렌드 민감', '경험 중시'],
    tips: [
      '월급의 10%만이라도 자동이체 저축 시작하기',
      '큰 금액은 24시간 냉각기 갖기',
      '신용카드 대신 체크카드 사용해보기',
    ],
    compatibility: { good: '절약형', bad: '감정소비형' },
  },
  B: {
    type: 'B',
    title: '가치 투자자',
    emoji: '🎯',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-50 to-teal-50',
    description: '의미 있는 곳에는 아끼지 않지만, 가치 없다고 생각하는 곳에는 지갑을 열지 않아요. 현명한 소비의 달인!',
    traits: ['선택적 소비', '자기계발 투자', '경험 중시', '품질 우선'],
    tips: [
      '가치 소비도 예산 내에서 하면 더 완벽',
      '큰 지출 전 가격 비교 습관 들이기',
      '구독 서비스 정기 점검하기',
    ],
    compatibility: { good: '계획형', bad: '절약형' },
  },
  C: {
    type: 'C',
    title: '계획의 달인',
    emoji: '📊',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    description: '예산을 세우고 지키는 것이 습관화된 타입! 가계부 작성과 재정 관리에 능숙해요. 미래를 위한 준비가 철저해요.',
    traits: ['예산 관리', '가계부 필수', '장기 계획', '합리적 소비'],
    tips: [
      '가끔은 계획에 없는 작은 사치도 OK',
      '예산에 "자유 지출" 항목 추가해보기',
      '과도한 절제는 오히려 역효과일 수 있어요',
    ],
    compatibility: { good: '가치소비형', bad: '플렉스형' },
  },
  D: {
    type: 'D',
    title: '철벽 세이버',
    emoji: '🏦',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    description: '한 푼이라도 아끼는 극한의 절약러! 저축 통장 잔고 보는 게 가장 큰 행복이에요. 미래를 위한 준비는 확실해요.',
    traits: ['극단적 절약', '저축 우선', '가성비 추구', '미래 지향'],
    tips: [
      '현재의 행복도 중요해요, 적당한 소비는 OK',
      '건강이나 자기계발에는 투자 고려해보기',
      '소중한 사람들과의 경험에도 지갑 열어보기',
    ],
    compatibility: { good: '플렉스형', bad: '가치소비형' },
  },
  E: {
    type: 'E',
    title: '무드 쇼퍼',
    emoji: '🎭',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-50 to-violet-50',
    description: '기분에 따라 소비 패턴이 달라지는 타입! 좋을 때도, 나쁠 때도 쇼핑이 위로가 돼요. 감정과 지갑이 연결되어 있어요.',
    traits: ['기분따라 소비', '스트레스 쇼핑', '감성 구매', '보상 심리'],
    tips: [
      '쇼핑 전 "정말 필요한가?" 3번 물어보기',
      '스트레스 해소용 무료 활동 리스트 만들기',
      '기분 좋을 때 저축하는 습관 만들기',
    ],
    compatibility: { good: '계획형', bad: '플렉스형' },
  },
};

// 점수 합산 함수
interface Scores {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

function calculateScores(answers: Scores[]): Scores {
  return answers.reduce(
    (total, current) => ({
      A: total.A + current.A,
      B: total.B + current.B,
      C: total.C + current.C,
      D: total.D + current.D,
      E: total.E + current.E,
    }),
    { A: 0, B: 0, C: 0, D: 0, E: 0 }
  );
}

// 최고 점수 유형 찾기
function getTopType(scores: Scores): string {
  const entries = Object.entries(scores) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

// URL 파라미터에서 결과 파싱
function parseResultFromParam(param: string | null): string | null {
  if (!param) return null;
  const validTypes = ['A', 'B', 'C', 'D', 'E'];
  const type = param.toUpperCase();
  return validTypes.includes(type) ? type : null;
}

// 테스트 상태
type TestState = 'intro' | 'question' | 'result';

function SpendingTypeTestContent() {
  const searchParams = useSearchParams();

  // URL 파라미터에서 결과 확인
  const typeParam = searchParams.get('type');
  const sharedType = parseResultFromParam(typeParam);

  const [state, setState] = useState<TestState>(sharedType ? 'result' : 'intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Scores[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultType, setResultType] = useState<string | null>(sharedType);

  // 테스트 시작
  const startTest = useCallback(() => {
    setState('question');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setResultType(null);
  }, []);

  // 답변 선택
  const selectOption = useCallback((scores: Scores, index: number) => {
    if (isAnimating) return;

    setSelectedOption(index);
    setIsAnimating(true);

    setTimeout(() => {
      const newAnswers = [...answers, scores];
      setAnswers(newAnswers);

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
      } else {
        // 결과 계산
        const totalScores = calculateScores(newAnswers);
        const topType = getTopType(totalScores);
        setResultType(topType);
        setState('result');
      }
      setIsAnimating(false);
    }, 400);
  }, [answers, currentQuestion, isAnimating]);

  // 다시 하기
  const restart = useCallback(() => {
    if (typeof window !== 'undefined' && sharedType) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setState('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setResultType(null);
  }, [sharedType]);

  // 공유하기
  const shareResult = useCallback(async () => {
    if (!resultType) return;
    const result = RESULTS[resultType];
    const shareText = `나의 소비유형은 "${result.title}" ${result.emoji}\n\n당신의 소비유형은?\n`;

    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
    const shareUrl = `${baseUrl}?type=${resultType}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '소비유형 테스트 결과',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // 공유 취소됨
      }
    } else {
      await navigator.clipboard.writeText(shareText + shareUrl);
      alert('링크가 복사되었습니다!');
    }
  }, [resultType]);

  // 진행률
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const result = resultType ? RESULTS[resultType] : null;
  const isSharedResult = sharedType !== null;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${result ? result.bgColor : 'from-emerald-50 to-teal-50'}`}>
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 헤더 */}
        <nav className="mb-6">
          <Link href="/tests" className="text-emerald-600 hover:text-emerald-800 text-sm">
            ← 테스트 목록으로
          </Link>
        </nav>

        {/* 인트로 화면 */}
        {state === 'intro' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                소비
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                소비유형 테스트
              </h1>
              <p className="text-gray-600 text-lg">
                나는 어떤 소비 유형일까?
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
                <span>약 2분</span>
                <span className="text-gray-300">|</span>
                <span>{QUESTIONS.length}문항</span>
              </div>

              <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">5가지 소비 유형 중 나는?</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">💎 플렉서</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">🎯 가치투자자</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">📊 계획달인</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">🏦 철벽세이버</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">🎭 무드쇼퍼</span>
                </div>
              </div>

              <button
                onClick={startTest}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                테스트 시작하기
              </button>
            </div>

            <p className="text-xs text-gray-400">
              * 재미로 보는 테스트입니다. 실제 재정 상담과 무관합니다.
            </p>
          </div>
        )}

        {/* 질문 화면 */}
        {state === 'question' && (
          <div>
            {/* 진행 바 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Q{currentQuestion + 1}</span>
                <span>{currentQuestion + 1} / {QUESTIONS.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 질문 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                {QUESTIONS[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {QUESTIONS[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectOption(option.scores, index)}
                    disabled={isAnimating}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-emerald-500 bg-emerald-50 scale-[0.98]'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="text-gray-700">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {state === 'result' && result && (
          <div className="text-center">
            {/* 공유된 결과 안내 */}
            {isSharedResult && (
              <div className="bg-emerald-100 text-emerald-700 rounded-xl px-4 py-3 mb-4 text-sm">
                친구의 테스트 결과예요!
              </div>
            )}

            {/* 결과 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <p className="text-gray-500 mb-4">{isSharedResult ? '친구의 소비유형은' : '당신의 소비유형은'}</p>

              <div className="text-5xl mb-3">{result.emoji}</div>

              <h2 className={`text-3xl font-bold bg-gradient-to-r ${result.color} bg-clip-text text-transparent mb-2`}>
                {result.title}
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-gray-600 leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* 특성 태그 */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {result.traits.map((trait, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 bg-gradient-to-r ${result.color} text-white rounded-full text-sm`}
                  >
                    #{trait}
                  </span>
                ))}
              </div>

              {/* 재정 팁 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">💡 맞춤 재정 팁</p>
                <ul className="space-y-2">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 궁합 */}
              <div className={`bg-gradient-to-r ${result.bgColor} rounded-xl p-4 text-left border border-gray-100`}>
                <p className="text-sm font-medium text-gray-700 mb-2">💑 소비 궁합</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">찰떡궁합:</span>
                    <span className="ml-1 font-medium text-emerald-600">{result.compatibility.good}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">주의:</span>
                    <span className="ml-1 font-medium text-rose-500">{result.compatibility.bad}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              {isSharedResult ? (
                <>
                  <button
                    onClick={restart}
                    className={`w-full py-4 bg-gradient-to-r ${result.color} text-white text-lg font-bold rounded-xl transition-all`}
                  >
                    나도 테스트하기
                  </button>
                  <button
                    onClick={shareResult}
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  >
                    이 결과 공유하기
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={shareResult}
                    className={`w-full py-4 bg-gradient-to-r ${result.color} text-white text-lg font-bold rounded-xl transition-all`}
                  >
                    결과 공유하기
                  </button>
                  <button
                    onClick={restart}
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  >
                    다시 하기
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 로딩 컴포넌트
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
          소비
        </div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

// Suspense 래퍼
export default function SpendingTypeTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SpendingTypeTestContent />
    </Suspense>
  );
}
