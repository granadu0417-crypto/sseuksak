'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: '하루에 카페인 음료를 얼마나 마시나요?',
    options: [
      { text: '거의 안 마심 (주 1-2회 이하)', score: 1 },
      { text: '1잔 정도', score: 2 },
      { text: '2-3잔', score: 3 },
      { text: '4잔 이상', score: 4 },
    ],
  },
  {
    id: 2,
    question: '아침에 일어나서 카페인 음료를 마시기까지 얼마나 걸리나요?',
    options: [
      { text: '굳이 안 마셔도 됨', score: 1 },
      { text: '출근/등교 후 여유있게', score: 2 },
      { text: '1시간 이내에 마셔야 함', score: 3 },
      { text: '눈 뜨자마자 바로 찾음', score: 4 },
    ],
  },
  {
    id: 3,
    question: '카페인을 안 마시면 두통이 오나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '가끔 머리가 무거운 정도', score: 2 },
      { text: '하루 안 마시면 두통 시작', score: 3 },
      { text: '반나절만 지나도 심한 두통', score: 4 },
    ],
  },
  {
    id: 4,
    question: '예전보다 카페인 섭취량이 늘었나요?',
    options: [
      { text: '오히려 줄었거나 비슷함', score: 1 },
      { text: '조금 늘었음', score: 2 },
      { text: '확실히 많이 늘었음', score: 3 },
      { text: '2배 이상 늘었음', score: 4 },
    ],
  },
  {
    id: 5,
    question: '카페인을 줄이려고 시도해본 적 있나요?',
    options: [
      { text: '줄일 필요성을 못 느낌', score: 1 },
      { text: '시도해서 성공함', score: 2 },
      { text: '시도했지만 실패함', score: 3 },
      { text: '여러 번 시도했지만 매번 실패', score: 4 },
    ],
  },
  {
    id: 6,
    question: '카페인 없이 하루를 보내면 어떤 기분이 드나요?',
    options: [
      { text: '별 차이 없음', score: 1 },
      { text: '약간 피곤한 정도', score: 2 },
      { text: '짜증나고 집중 안 됨', score: 3 },
      { text: '심하게 예민해지고 일상이 힘듦', score: 4 },
    ],
  },
  {
    id: 7,
    question: '저녁 늦게도 카페인을 마시나요?',
    options: [
      { text: '오후 2시 이후로는 안 마심', score: 1 },
      { text: '가끔 오후에 마심', score: 2 },
      { text: '저녁에도 자주 마심', score: 3 },
      { text: '밤늦게도 상관없이 마심', score: 4 },
    ],
  },
  {
    id: 8,
    question: '카페인 때문에 수면에 문제가 있나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '가끔 잠들기 어려움', score: 2 },
      { text: '자주 수면에 영향 받음', score: 3 },
      { text: '만성 수면 문제 있음', score: 4 },
    ],
  },
  {
    id: 9,
    question: '카페인 섭취 후 가슴 두근거림이나 불안감을 느끼나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '많이 마셨을 때만 가끔', score: 2 },
      { text: '자주 느낌', score: 3 },
      { text: '거의 매번 느끼지만 계속 마심', score: 4 },
    ],
  },
  {
    id: 10,
    question: '카페인 없이 중요한 일(시험, 회의 등)을 할 수 있나요?',
    options: [
      { text: '문제없음', score: 1 },
      { text: '있으면 좋지만 없어도 됨', score: 2 },
      { text: '없으면 불안하고 집중 어려움', score: 3 },
      { text: '반드시 마셔야 함, 없으면 못함', score: 4 },
    ],
  },
  {
    id: 11,
    question: '카페인 음료에 얼마나 지출하나요? (월 기준)',
    options: [
      { text: '거의 안 씀 (1만원 이하)', score: 1 },
      { text: '적당히 (1-5만원)', score: 2 },
      { text: '꽤 많이 (5-10만원)', score: 3 },
      { text: '상당히 많이 (10만원 이상)', score: 4 },
    ],
  },
  {
    id: 12,
    question: '카페인 섭취에 대해 주변에서 걱정하나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '가끔 언급하는 정도', score: 2 },
      { text: '자주 걱정함', score: 3 },
      { text: '심각하게 걱정하고 줄이라고 함', score: 4 },
    ],
  },
];

// 결과 유형
interface ResultType {
  minScore: number;
  maxScore: number;
  level: string;
  title: string;
  emoji: string;
  description: string;
  dailyCaffeine: string;
  symptoms: string[];
  tips: string[];
  color: {
    gradient: string;
    bg: string;
    text: string;
    border: string;
  };
}

const RESULTS: ResultType[] = [
  {
    minScore: 12,
    maxScore: 20,
    level: 'free',
    title: '카페인 자유인',
    emoji: '🌿',
    description: '카페인에 의존하지 않는 건강한 상태입니다. 필요할 때만 가볍게 즐기는 수준이에요.',
    dailyCaffeine: '0-100mg (커피 0-1잔)',
    symptoms: [
      '카페인 없어도 일상생활 문제없음',
      '금단 증상 없음',
      '수면의 질 양호',
      '에너지 레벨 안정적',
    ],
    tips: [
      '현재 상태를 유지하세요',
      '스트레스 상황에서도 카페인에 의존하지 마세요',
      '물을 충분히 마시는 습관 유지',
      '규칙적인 수면으로 자연 에너지 유지',
      '카페인 대신 스트레칭으로 활력 충전',
    ],
    color: {
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
  },
  {
    minScore: 21,
    maxScore: 30,
    level: 'lover',
    title: '카페인 애호가',
    emoji: '☕',
    description: '카페인을 즐기지만 아직 의존 수준은 아닙니다. 습관적 섭취에 주의가 필요해요.',
    dailyCaffeine: '100-200mg (커피 1-2잔)',
    symptoms: [
      '하루 1-2잔은 기본',
      '없어도 크게 불편하지 않음',
      '가끔 습관적으로 찾게 됨',
      '적정 섭취량 범위 내',
    ],
    tips: [
      '오후 2시 이후 카페인 섭취 자제',
      '주말에는 디카페인으로 대체해보기',
      '카페인 섭취 시간 기록해보기',
      '물을 커피와 1:1 비율로 마시기',
      '카페인 없는 날 일주일에 1-2일 만들기',
    ],
    color: {
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
  },
  {
    minScore: 31,
    maxScore: 40,
    level: 'dependent',
    title: '카페인 의존자',
    emoji: '⚡',
    description: '카페인 의존도가 높은 상태입니다. 금단 증상이 나타나고 있어 관리가 필요해요.',
    dailyCaffeine: '200-400mg (커피 2-4잔)',
    symptoms: [
      '안 마시면 두통, 피로감',
      '아침에 카페인 없이 시작 어려움',
      '점점 섭취량 증가 추세',
      '줄이려 해도 잘 안됨',
    ],
    tips: [
      '갑자기 끊지 말고 서서히 줄이기 (주당 25%씩)',
      '카페인 섭취량 400mg 이하로 제한',
      '아침 커피를 반카페인으로 바꾸기',
      '두통 시 물 충분히 마시기',
      '규칙적인 수면으로 자연 에너지 확보',
    ],
    color: {
      gradient: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  },
  {
    minScore: 41,
    maxScore: 48,
    level: 'addicted',
    title: '카페인 중독 위험',
    emoji: '🚨',
    description: '카페인 의존도가 매우 높습니다. 건강을 위해 전문가 상담과 적극적인 관리가 필요해요.',
    dailyCaffeine: '400mg 이상 (커피 4잔+)',
    symptoms: [
      '없으면 심한 두통, 짜증, 우울',
      '수면 장애 동반 가능성',
      '심장 두근거림 경험',
      '줄이기 매우 어려움',
    ],
    tips: [
      '무리하게 끊지 말고 2주에 걸쳐 서서히 감량',
      '심한 금단 증상 시 전문의 상담 권장',
      '디카페인으로 점진적 대체',
      '수면 위생 개선 필수',
      '운동으로 자연 도파민 분비 유도',
    ],
    color: {
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  },
];

// 카페인 함량 정보
const CAFFEINE_INFO = [
  { name: '아메리카노 (톨)', amount: '150mg' },
  { name: '에스프레소 (1샷)', amount: '75mg' },
  { name: '콜드브루 (톨)', amount: '200mg' },
  { name: '에너지 드링크', amount: '80-150mg' },
  { name: '녹차 (1잔)', amount: '30-50mg' },
  { name: '콜라 (355ml)', amount: '35mg' },
];

function CaffeineDependencyTest() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'intro' | 'question' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isSharedResult, setIsSharedResult] = useState(false);

  useEffect(() => {
    const scoreParam = searchParams.get('score');
    if (scoreParam) {
      const score = parseInt(scoreParam, 10);
      if (score >= 12 && score <= 48) {
        // URL 파라미터로 공유된 결과 표시 (초기 마운트 시에만 실행)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTotalScore(score);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStep('result');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSharedResult(true);
      }
    }
  }, [searchParams]);

  const handleStart = () => {
    setStep('question');
    setCurrentQuestion(0);
    setAnswers([]);
    setIsSharedResult(false);
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const total = newAnswers.reduce((sum, s) => sum + s, 0);
      setTotalScore(total);
      setStep('result');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const getResult = (): ResultType => {
    return RESULTS.find(
      (r) => totalScore >= r.minScore && totalScore <= r.maxScore
    ) || RESULTS[0];
  };

  const handleShare = async () => {
    const result = getResult();
    const shareUrl = `${window.location.origin}/tests/caffeine-dependency?score=${totalScore}`;
    const shareText = `나의 카페인 의존도: ${result.title}! 당신은 어떤 유형인가요?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '카페인 의존도 테스트 결과',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        await navigator.clipboard.writeText(shareUrl);
        alert('링크가 복사되었습니다!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleRetry = () => {
    setStep('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setTotalScore(0);
    setIsSharedResult(false);
    window.history.replaceState({}, '', '/tests/caffeine-dependency');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 네비게이션 */}
      <nav className="mb-6">
        <Link
          href="/tests"
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          ← 테스트 목록으로
        </Link>
      </nav>

      {/* 인트로 화면 */}
      {step === 'intro' && (
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              커피
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              카페인 의존도 테스트
            </h1>
            <p className="text-gray-600">
              나는 카페인 자유인? 의존자? 중독 위험?
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-amber-100">
            <div className="flex justify-center gap-4 text-sm text-gray-600 mb-6">
              <span>약 2분</span>
              <span className="text-gray-300">|</span>
              <span>12문항</span>
            </div>

            {/* 의존도 레벨 미리보기 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {RESULTS.map((result) => (
                <div
                  key={result.level}
                  className="bg-white/70 rounded-xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">{result.emoji}</div>
                  <div className="font-medium text-gray-800 text-sm">
                    {result.title.replace('카페인 ', '')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.dailyCaffeine.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-4">
              <strong>DSM-IV 카페인 의존 기준</strong>을 참고한 테스트입니다.
              <br />
              FDA 권장 일일 카페인 섭취량: 400mg 이하
            </p>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              테스트 시작하기
            </button>
          </div>

          <p className="text-xs text-gray-400">
            * 본 테스트는 의학적 진단을 대체하지 않습니다.
          </p>
        </div>
      )}

      {/* 질문 화면 */}
      {step === 'question' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* 진행 상태 */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-amber-600 font-bold">
              Q{currentQuestion + 1}
            </span>
            <span className="text-gray-400 text-sm">
              {currentQuestion + 1} / {QUESTIONS.length}
            </span>
          </div>

          {/* 진행 바 */}
          <div className="w-full h-2 bg-gray-100 rounded-full mb-8">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>

          {/* 질문 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {QUESTIONS[currentQuestion].question}
            </h2>

            <div className="space-y-3">
              {QUESTIONS[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.score)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-amber-50 rounded-xl border border-gray-200 hover:border-amber-300 transition-all duration-200"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* 이전 버튼 */}
          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← 이전 질문으로
            </button>
          )}
        </div>
      )}

      {/* 결과 화면 */}
      {step === 'result' && (
        <div>
          {/* 공유 결과 배너 */}
          {isSharedResult && (
            <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-amber-800 font-medium">
                친구의 테스트 결과예요!
              </p>
              <p className="text-amber-600 text-sm mt-1">
                나도 테스트해서 비교해보세요
              </p>
            </div>
          )}

          {/* 결과 카드 */}
          <div
            className={`${getResult().color.bg} rounded-2xl p-8 mb-6 border ${getResult().color.border}`}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getResult().emoji}</div>
              <div
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getResult().color.bg} ${getResult().color.text} mb-2`}
              >
                {totalScore}점 / 48점
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getResult().title}
              </h2>
              <p className="text-gray-600">{getResult().description}</p>
            </div>

            {/* 일일 카페인 섭취량 */}
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">
                예상 일일 카페인 섭취량
              </h3>
              <p className={`text-lg font-bold ${getResult().color.text}`}>
                {getResult().dailyCaffeine}
              </p>
            </div>

            {/* 현재 상태 */}
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">현재 상태</h3>
              <ul className="space-y-2">
                {getResult().symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className={getResult().color.text}>•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 추천 팁 */}
            <div className="bg-white/70 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">
                {getResult().level === 'free' ? '유지 방법' : '개선 방법'}
              </h3>
              <ul className="space-y-2">
                {getResult().tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-amber-500">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 카페인 함량 참고 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">
              음료별 카페인 함량 참고
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {CAFFEINE_INFO.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{item.name}</span>
                  <span className="font-medium text-gray-800">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            {isSharedResult ? (
              <button
                onClick={handleRetry}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                나도 테스트하기
              </button>
            ) : (
              <>
                <button
                  onClick={handleShare}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  결과 공유하기
                </button>
                <button
                  onClick={handleRetry}
                  className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  다시 하기
                </button>
              </>
            )}

            {/* 관련 도구 링크 */}
            <Link
              href="/tools/sleep-calculator"
              className="block w-full py-4 bg-indigo-50 text-indigo-700 font-medium rounded-xl text-center hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              수면 계산기로 최적 취침 시간 알아보기 →
            </Link>
          </div>

          {/* 의존도 단계 비교 */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 text-center">
              카페인 의존도 단계
            </h3>
            <div className="space-y-2">
              {RESULTS.map((result) => (
                <div
                  key={result.level}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    result.level === getResult().level
                      ? `${result.color.bg} ${result.color.border} border-2`
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{result.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {result.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.minScore}-{result.maxScore}점 | {result.dailyCaffeine}
                    </div>
                  </div>
                  {result.level === getResult().level && (
                    <span className={`text-xs font-bold ${result.color.text}`}>
                      현재
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-400 text-center mt-6">
            * 본 테스트는 재미로 즐기는 테스트이며, 의학적 진단을 대체하지 않습니다.
            <br />
            심각한 카페인 의존 증상이 있다면 전문의 상담을 권장합니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CaffeineDependencyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-200" />
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        </div>
      }
    >
      <CaffeineDependencyTest />
    </Suspense>
  );
}
