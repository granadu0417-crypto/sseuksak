'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터 - 각 답변은 특정 유형에 점수 부여
// A: 로맨틱형, B: 현실형, C: 자유형, D: 헌신형, E: 신중형
const QUESTIONS = [
  {
    id: 1,
    question: '첫 데이트 장소로 어디가 좋아요?',
    options: [
      { text: '야경 보이는 분위기 있는 레스토랑', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '맛집 탐방 후 영화 보기', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '각자 하고 싶은 거 하다가 만나기', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '상대방이 좋아하는 곳 어디든', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 2,
    question: '연인에게 가장 듣고 싶은 말은?',
    options: [
      { text: '"넌 내 인생 최고의 선물이야"', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '"우리 같이 미래 계획 세워보자"', scores: { A: 0, B: 3, C: 0, D: 1, E: 0 } },
      { text: '"네 시간도 소중하니까 존중할게"', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '"난 네 편이야, 항상"', scores: { A: 0, B: 0, C: 0, D: 3, E: 1 } },
    ],
  },
  {
    id: 3,
    question: '연인과 연락 스타일은?',
    options: [
      { text: '하루 종일 달달한 메시지 주고받기', scores: { A: 3, B: 0, C: 0, D: 2, E: 0 } },
      { text: '필요할 때 연락, 자연스럽게', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '각자 바쁘면 연락 없어도 OK', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '상대가 원하는 만큼 맞춰주기', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 4,
    question: '100일 기념일, 어떻게 보내고 싶어요?',
    options: [
      { text: '깜짝 이벤트와 특별한 선물 준비', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '좋은 밥 먹고 선물 교환', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '굳이 챙겨야 해? 매일이 기념일인데', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '상대가 원하는 방식대로', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 5,
    question: '연인이 바빠서 못 만난 지 2주째...',
    options: [
      { text: '보고 싶다고 로맨틱하게 표현', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '이해하지만 시간 조율 제안', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '나도 내 시간 알차게 보내기', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '연인 응원하며 묵묵히 기다리기', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 6,
    question: '연인과 싸웠을 때 나는?',
    options: [
      { text: '감정 담은 긴 편지 쓰기', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '차분히 대화로 해결하기', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '서로 시간 갖고 정리 후 대화', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '내가 먼저 사과하고 풀기', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 7,
    question: '이상형 월드컵! 가장 중요한 건?',
    options: [
      { text: '설렘 주는 로맨틱한 사람', scores: { A: 3, B: 0, C: 0, D: 0, E: 0 } },
      { text: '안정적이고 믿음직한 사람', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '서로 존중하고 독립적인 사람', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '나를 최우선으로 생각해주는 사람', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 8,
    question: '연인의 이성 친구, 어떻게 생각해요?',
    options: [
      { text: '질투는 사랑의 표현! 좀 신경 쓰여', scores: { A: 2, B: 0, C: 0, D: 2, E: 0 } },
      { text: '신뢰가 기본, 걱정 안 해', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '나도 이성 친구 있으니까 당연히 OK', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '연인이 불편해하면 조심해줬으면', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 9,
    question: '연애할 때 나의 SNS는?',
    options: [
      { text: '연인 사진으로 도배! 자랑하고 싶어', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '가끔 올리는 정도, 자연스럽게', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '연애와 SNS는 별개', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '연인이 좋아하는 대로', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 10,
    question: '좋아하는 사람이 생기면?',
    options: [
      { text: '확 빠져서 적극 어필!', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '천천히 알아가며 확인', scores: { A: 0, B: 2, C: 0, D: 0, E: 3 } },
      { text: '자연스럽게 친해지기', scores: { A: 0, B: 1, C: 3, D: 0, E: 0 } },
      { text: '상대 반응 보며 맞춰가기', scores: { A: 0, B: 0, C: 0, D: 3, E: 1 } },
    ],
  },
  {
    id: 11,
    question: '연인과의 미래, 언제부터 생각해요?',
    options: [
      { text: '만난 순간부터 상상 시작!', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '어느 정도 만나면 자연스럽게', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '미래보다 현재가 중요해', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '상대가 원할 때 함께 고민', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 12,
    question: '이별 후 나는?',
    options: [
      { text: '한동안 다음 연애 생각 못 해...', scores: { A: 3, B: 0, C: 0, D: 2, E: 0 } },
      { text: '아프지만 정리하고 일상 회복', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '내 시간에 집중하며 극복', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '오래 힘들어하며 추억에 젖기', scores: { A: 1, B: 0, C: 0, D: 3, E: 0 } },
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
  loveLanguage: string;
}

// 결과 데이터
const RESULTS: Record<string, ResultType> = {
  A: {
    type: 'A',
    title: '설렘 중독 로맨티스트',
    emoji: '💕',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50',
    description: '연애는 두근두근해야 제맛! 설렘과 감동을 추구하는 로맨틱한 연애 스타일이에요. 이벤트와 표현을 사랑하고, 드라마 같은 사랑을 꿈꿔요.',
    traits: ['이벤트 마스터', '표현력 만렙', '감성 충만', '두근두근 추구'],
    tips: [
      '설렘이 식어도 사랑은 계속될 수 있어요',
      '현실적인 부분도 함께 챙겨보기',
      '상대의 사랑 표현 방식도 존중해주세요',
    ],
    compatibility: { good: '헌신형', bad: '자유형' },
    loveLanguage: '표현 & 이벤트',
  },
  B: {
    type: 'B',
    title: '믿음직한 현실주의자',
    emoji: '🏠',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50',
    description: '안정적이고 건강한 관계를 추구해요. 감정보다 신뢰와 존중을 기반으로 한 성숙한 연애를 원하는 스타일이에요.',
    traits: ['안정 추구', '신뢰 기반', '현실적', '계획적'],
    tips: [
      '가끔은 로맨틱한 서프라이즈도 좋아요',
      '감정 표현도 연애의 중요한 부분이에요',
      '상대의 감성적 니즈도 채워주세요',
    ],
    compatibility: { good: '신중형', bad: '로맨틱형' },
    loveLanguage: '안정 & 신뢰',
  },
  C: {
    type: 'C',
    title: '자유로운 영혼 연애러',
    emoji: '🦋',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'from-teal-50 to-emerald-50',
    description: '연애도 중요하지만 나의 시간과 공간도 소중해요! 서로 독립적이면서도 함께하는 건강한 관계를 추구하는 스타일이에요.',
    traits: ['독립적', '자유 존중', '개인 시간 중시', '쿨한 연애'],
    tips: [
      '상대에게는 더 많은 애정 표현이 필요할 수도',
      '함께하는 시간의 질에 집중해보세요',
      '적절한 밀당은 OK, 너무 쿨하면 오해 받을 수 있어요',
    ],
    compatibility: { good: '자유형', bad: '헌신형' },
    loveLanguage: '존중 & 자유',
  },
  D: {
    type: 'D',
    title: '올인 헌신파',
    emoji: '🔥',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
    description: '사랑하면 올인! 연인을 위해 뭐든 할 수 있는 헌신적인 연애 스타일이에요. 상대 행복이 곧 내 행복인 타입이에요.',
    traits: ['헌신적', '상대 우선', '올인 스타일', '배려심 최고'],
    tips: [
      '나 자신도 챙기는 게 중요해요',
      '일방적인 헌신은 관계에 부담이 될 수 있어요',
      '상대도 당신을 위해 노력하게 해주세요',
    ],
    compatibility: { good: '로맨틱형', bad: '자유형' },
    loveLanguage: '헌신 & 배려',
  },
  E: {
    type: 'E',
    title: '신중한 탐색가',
    emoji: '🔍',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'from-purple-50 to-indigo-50',
    description: '연애는 신중하게! 충분히 알아가고 확신이 생긴 후에 시작하는 타입이에요. 한번 시작하면 진지하고 깊은 관계를 맺어요.',
    traits: ['신중함', '깊은 관계', '천천히 진행', '확신 중시'],
    tips: [
      '너무 신중하면 기회를 놓칠 수 있어요',
      '완벽한 확신은 없을 수도 있어요',
      '가끔은 감정에 솔직해져 보세요',
    ],
    compatibility: { good: '현실형', bad: '로맨틱형' },
    loveLanguage: '진정성 & 깊이',
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

function LoveStyleTestContent() {
  const searchParams = useSearchParams();

  // URL 파라미터에서 결과 확인
  const typeParam = searchParams.get('type');
  const sharedType = parseResultFromParam(typeParam);

  const [state, setState] = useState<TestState>(sharedType ? 'result' : 'intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resultType, setResultType] = useState<string | null>(sharedType);

  // 테스트 시작
  const startTest = useCallback(() => {
    setState('question');
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    setResultType(null);
  }, []);

  // 답변 선택
  const selectOption = useCallback((index: number) => {
    if (isAnimating) return;

    setSelectedOption(index);
    setIsAnimating(true);

    setTimeout(() => {
      const newSelectedAnswers = [...selectedAnswers];
      if (currentQuestion < newSelectedAnswers.length) {
        newSelectedAnswers[currentQuestion] = index;
      } else {
        newSelectedAnswers.push(index);
      }
      setSelectedAnswers(newSelectedAnswers);

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        const nextAnswer = newSelectedAnswers[currentQuestion + 1];
        setSelectedOption(nextAnswer !== undefined ? nextAnswer : null);
      } else {
        const allScores = newSelectedAnswers.map((answerIndex, qIndex) =>
          QUESTIONS[qIndex].options[answerIndex].scores
        );
        const totalScores = calculateScores(allScores);
        const topType = getTopType(totalScores);
        setResultType(topType);
        setState('result');
      }
      setIsAnimating(false);
    }, 400);
  }, [selectedAnswers, currentQuestion, isAnimating]);

  // 이전 질문으로
  const goBack = useCallback(() => {
    if (currentQuestion > 0 && !isAnimating) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      setSelectedOption(selectedAnswers[prevQuestion] ?? null);
    }
  }, [currentQuestion, selectedAnswers, isAnimating]);

  // 다시 하기
  const restart = useCallback(() => {
    if (typeof window !== 'undefined' && sharedType) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setState('intro');
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    setResultType(null);
  }, [sharedType]);

  // 공유하기
  const shareResult = useCallback(async () => {
    if (!resultType) return;
    const result = RESULTS[resultType];
    const shareText = `나의 연애스타일은 "${result.title}" ${result.emoji}\n\n당신의 연애스타일은?\n`;

    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
    const shareUrl = `${baseUrl}?type=${resultType}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '연애스타일 테스트 결과',
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
    <div className={`min-h-screen bg-gradient-to-b ${result ? result.bgColor : 'from-pink-50 to-rose-50'}`}>
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 헤더 */}
        <nav className="mb-6">
          <Link href="/tests" className="text-pink-600 hover:text-pink-800 text-sm">
            ← 테스트 목록으로
          </Link>
        </nav>

        {/* 인트로 화면 */}
        {state === 'intro' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                연애
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                연애스타일 테스트
              </h1>
              <p className="text-gray-600 text-lg">
                나는 어떤 연애 스타일일까?
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
                <span>약 2분</span>
                <span className="text-gray-300">|</span>
                <span>{QUESTIONS.length}문항</span>
              </div>

              <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">5가지 연애 스타일 중 나는?</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">💕 로맨티스트</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">🏠 현실주의자</span>
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">🦋 자유영혼</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">🔥 올인헌신파</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">🔍 신중탐색가</span>
                </div>
              </div>

              <button
                onClick={startTest}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                테스트 시작하기
              </button>
            </div>

            <p className="text-xs text-gray-400">
              * 재미로 보는 테스트입니다. 실제 연애 상담과 무관합니다.
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
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
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
                    onClick={() => selectOption(index)}
                    disabled={isAnimating}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-pink-500 bg-pink-50 scale-[0.98]'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                    } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="text-gray-700">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 이전 버튼 */}
            {currentQuestion > 0 && (
              <button
                onClick={goBack}
                disabled={isAnimating}
                className="w-full py-3 text-gray-500 hover:text-pink-600 text-sm font-medium transition-colors disabled:opacity-50"
              >
                ← 이전 질문으로
              </button>
            )}
          </div>
        )}

        {/* 결과 화면 */}
        {state === 'result' && result && (
          <div className="text-center">
            {/* 공유된 결과 안내 */}
            {isSharedResult && (
              <div className="bg-pink-100 text-pink-700 rounded-xl px-4 py-3 mb-4 text-sm">
                친구의 테스트 결과예요!
              </div>
            )}

            {/* 결과 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <p className="text-gray-500 mb-4">{isSharedResult ? '친구의 연애스타일은' : '당신의 연애스타일은'}</p>

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

              {/* 사랑의 언어 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">💝 나의 사랑 언어</p>
                <p className="text-lg font-bold text-gray-800">{result.loveLanguage}</p>
              </div>

              {/* 연애 팁 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">💡 연애 꿀팁</p>
                <ul className="space-y-2">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-pink-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 궁합 */}
              <div className={`bg-gradient-to-r ${result.bgColor} rounded-xl p-4 text-left border border-gray-100`}>
                <p className="text-sm font-medium text-gray-700 mb-2">💑 연애 궁합</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">찰떡궁합:</span>
                    <span className="ml-1 font-medium text-pink-600">{result.compatibility.good}</span>
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
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all"
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
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all"
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
          연애
        </div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

// Suspense 래퍼
export default function LoveStyleTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoveStyleTestContent />
    </Suspense>
  );
}
