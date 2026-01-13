'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터 - 각 답변은 특정 유형에 점수 부여
// A: 공격형, B: 안정형, C: 균형형, D: 부동산형, E: 트렌드형
const QUESTIONS = [
  {
    id: 1,
    question: '1억원이 생겼어요! 어디에 투자할까요?',
    options: [
      { text: '성장주나 코인에 올인!', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '예금이나 채권이 안전하지', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '주식, 채권, 예금 분산투자', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '소형 아파트 전세 투자', scores: { A: 0, B: 1, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 2,
    question: '투자한 종목이 -20% 하락했어요.',
    options: [
      { text: '물타기 기회! 추가 매수', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '손절하고 안전 자산으로', scores: { A: 0, B: 3, C: 0, D: 0, E: 0 } },
      { text: '포트폴리오 전체를 점검', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '부동산은 이런 일 없는데...', scores: { A: 0, B: 1, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 3,
    question: '뉴스에서 새로운 투자 상품이 화제예요.',
    options: [
      { text: '수익률 보고 바로 진입!', scores: { A: 2, B: 0, C: 0, D: 0, E: 3 } },
      { text: '위험해 보여... 패스', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '공부하고 소액으로 시작', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '검증된 투자처가 최고야', scores: { A: 0, B: 2, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 4,
    question: '친구가 좋은 투자 정보를 줬어요.',
    options: [
      { text: '바로 투자! 믿음 가즈아', scores: { A: 3, B: 0, C: 0, D: 0, E: 2 } },
      { text: '친구 말이라도 신중하게', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '직접 분석 후 결정', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '부동산 정보면 관심 있어', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 5,
    question: '투자 수익률 목표는?',
    options: [
      { text: '연 30% 이상, 크게 벌자!', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '연 5% 정도, 안전하게', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '연 10~15% 목표로 균형있게', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '시세차익 + 임대수익 둘 다!', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 6,
    question: '잠자기 전 확인하는 것은?',
    options: [
      { text: '실시간 해외 선물 시세', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '딱히 확인 안 해요', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '포트폴리오 전체 현황', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '부동산 시세와 매물 정보', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 7,
    question: 'AI, 2차전지 등 테마주가 급등 중!',
    options: [
      { text: '놓치면 안 돼! 바로 매수', scores: { A: 3, B: 0, C: 0, D: 0, E: 2 } },
      { text: '급등한 건 위험해, 관망', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '소액으로 분할 매수', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: 'AI 데이터센터 부지에 관심', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 8,
    question: '투자 공부는 어떻게?',
    options: [
      { text: '실전이 최고의 공부!', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '전문가 의견 위주로', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '재무제표, 차트 분석 공부', scores: { A: 1, B: 0, C: 3, D: 0, E: 0 } },
      { text: '임장, 경매 공부에 집중', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 9,
    question: '투자할 때 가장 중요한 것은?',
    options: [
      { text: '높은 수익률', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '원금 보장', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '리스크 대비 수익', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '실물 자산 보유', scores: { A: 0, B: 1, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 10,
    question: 'NFT, 밈코인 등 새로운 투자처가 등장!',
    options: [
      { text: '대박 기회! 일단 들어가자', scores: { A: 2, B: 0, C: 0, D: 0, E: 3 } },
      { text: '이해 못하는 건 투자 안 해', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '소액으로 경험해보자', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '땅이 진짜 재테크지', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 11,
    question: '경기 침체가 예상된다면?',
    options: [
      { text: '하락장이 기회! 공격 투자', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '현금 비중 높이고 방어', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '방어주와 성장주 리밸런싱', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '급매물 노려볼 타이밍', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 12,
    question: '10년 후 나의 자산은?',
    options: [
      { text: '대박 아니면 쪽박', scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
      { text: '안정적으로 불어났으면', scores: { A: 0, B: 3, C: 1, D: 0, E: 0 } },
      { text: '꾸준히 복리로 성장', scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: '건물주가 되어 있을 거야', scores: { A: 0, B: 0, C: 0, D: 3, E: 0 } },
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
  assets: string[];
}

// 결과 데이터
const RESULTS: Record<string, ResultType> = {
  A: {
    type: 'A',
    title: '월가의 늑대',
    emoji: '🐺',
    color: 'from-red-500 to-orange-500',
    bgColor: 'from-red-50 to-orange-50',
    description: '높은 수익을 위해 높은 리스크도 감수하는 공격적인 투자자! 시장의 변동성을 즐기고, 큰 기회를 노려요.',
    traits: ['고위험 고수익', '적극적 매매', '레버리지 활용', '모멘텀 투자'],
    tips: [
      '투자금의 일부는 반드시 안전자산으로',
      '손절라인을 미리 정해두세요',
      '레버리지는 신중하게 사용하기',
    ],
    compatibility: { good: '안정형', bad: '트렌드형' },
    assets: ['성장주', '선물/옵션', '코인', '레버리지 ETF'],
  },
  B: {
    type: 'B',
    title: '든든한 거북이',
    emoji: '🐢',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    description: '천천히 그러나 확실하게! 원금 보존을 최우선으로 하는 안정형 투자자예요. 시간이 걸려도 안전한 길을 선택해요.',
    traits: ['원금 보존', '저위험 투자', '장기 투자', '복리의 마법'],
    tips: [
      '인플레이션을 고려해 일부는 성장자산에',
      '너무 안전한 자산만으로는 실질 수익 감소',
      '분산투자로 리스크 줄이며 수익 높이기',
    ],
    compatibility: { good: '공격형', bad: '부동산형' },
    assets: ['예금', '채권', '배당주', '적금'],
  },
  C: {
    type: 'C',
    title: '현명한 올빼미',
    emoji: '🦉',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    description: '분석과 균형의 달인! 리스크와 수익을 철저히 계산하고, 다양한 자산에 분산투자하는 균형 잡힌 투자자예요.',
    traits: ['분산투자', '리밸런싱', '데이터 분석', '장기 관점'],
    tips: [
      '가끔은 확신 있는 종목에 집중투자도 OK',
      '과도한 분석은 기회비용이 될 수 있어요',
      '시장 타이밍보다 자산배분에 집중하기',
    ],
    compatibility: { good: '트렌드형', bad: '공격형' },
    assets: ['ETF', '인덱스펀드', '혼합형펀드', '글로벌 분산'],
  },
  D: {
    type: 'D',
    title: '땅부자 두더지',
    emoji: '🏠',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'from-amber-50 to-yellow-50',
    description: '실물 자산의 매력을 아는 부동산 투자자! 눈에 보이는 자산을 선호하고, 월세 받는 건물주를 꿈꿔요.',
    traits: ['실물 자산', '임대 수익', '레버리지', '장기 보유'],
    tips: [
      '부동산 외 자산에도 분산투자 고려',
      '금리 변동에 따른 리스크 관리 필수',
      '유동성 확보를 위한 현금도 보유하기',
    ],
    compatibility: { good: '균형형', bad: '안정형' },
    assets: ['아파트', '오피스텔', '상가', '리츠(REITs)'],
  },
  E: {
    type: 'E',
    title: '기회의 매',
    emoji: '🦅',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-50 to-violet-50',
    description: '새로운 기회를 빠르게 포착하는 트렌드 헌터! 남들보다 먼저 움직여서 큰 수익을 노리는 타입이에요.',
    traits: ['트렌드 선도', 'FOMO', '빠른 의사결정', '정보력'],
    tips: [
      '모든 트렌드가 기회는 아니에요',
      '충분한 검증 없이 투자하면 위험',
      '수익 실현 타이밍도 중요해요',
    ],
    compatibility: { good: '균형형', bad: '공격형' },
    assets: ['IPO', '테마주', '신기술', '이머징마켓'],
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

function InvestmentStyleTestContent() {
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
    const shareText = `나의 재테크 성향은 "${result.title}" ${result.emoji}\n\n당신의 재테크 성향은?\n`;

    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
    const shareUrl = `${baseUrl}?type=${resultType}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '재테크 성향 테스트 결과',
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
    <div className={`min-h-screen bg-gradient-to-b ${result ? result.bgColor : 'from-indigo-50 to-blue-50'}`}>
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 헤더 */}
        <nav className="mb-6">
          <Link href="/tests" className="text-indigo-600 hover:text-indigo-800 text-sm">
            ← 테스트 목록으로
          </Link>
        </nav>

        {/* 인트로 화면 */}
        {state === 'intro' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                투자
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                재테크 성향 테스트
              </h1>
              <p className="text-gray-600 text-lg">
                나는 어떤 투자 스타일일까?
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
                <span>약 2분</span>
                <span className="text-gray-300">|</span>
                <span>{QUESTIONS.length}문항</span>
              </div>

              <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">5가지 투자 성향 중 나는?</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">🐺 월가의 늑대</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">🐢 든든한 거북이</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">🦉 현명한 올빼미</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">🏠 땅부자 두더지</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">🦅 기회의 매</span>
                </div>
              </div>

              <button
                onClick={startTest}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg font-bold rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                테스트 시작하기
              </button>
            </div>

            <p className="text-xs text-gray-400">
              * 재미로 보는 테스트입니다. 실제 투자 자문과 무관합니다.
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
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
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
                        ? 'border-indigo-500 bg-indigo-50 scale-[0.98]'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
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
                className="w-full py-3 text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors disabled:opacity-50"
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
              <div className="bg-indigo-100 text-indigo-700 rounded-xl px-4 py-3 mb-4 text-sm">
                친구의 테스트 결과예요!
              </div>
            )}

            {/* 결과 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <p className="text-gray-500 mb-4">{isSharedResult ? '친구의 재테크 성향은' : '당신의 재테크 성향은'}</p>

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

              {/* 추천 자산 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">💰 추천 투자 자산</p>
                <div className="flex flex-wrap gap-2">
                  {result.assets.map((asset, index) => (
                    <span key={index} className="px-2 py-1 bg-white text-gray-600 rounded-lg text-sm border border-gray-200">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              {/* 투자 팁 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">💡 맞춤 투자 팁</p>
                <ul className="space-y-2">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-indigo-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 궁합 */}
              <div className={`bg-gradient-to-r ${result.bgColor} rounded-xl p-4 text-left border border-gray-100`}>
                <p className="text-sm font-medium text-gray-700 mb-2">💑 투자 파트너 궁합</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">찰떡궁합:</span>
                    <span className="ml-1 font-medium text-indigo-600">{result.compatibility.good}</span>
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
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
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
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
          투자
        </div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

// Suspense 래퍼
export default function InvestmentStyleTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InvestmentStyleTestContent />
    </Suspense>
  );
}
