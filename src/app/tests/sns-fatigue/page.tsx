'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: '하루에 SNS(인스타, 유튜브, 틱톡 등)를 얼마나 사용하나요?',
    options: [
      { text: '1시간 이하', score: 1 },
      { text: '1-2시간', score: 2 },
      { text: '3-4시간', score: 3 },
      { text: '5시간 이상', score: 4 },
    ],
  },
  {
    id: 2,
    question: '아침에 눈 뜨자마자 스마트폰으로 SNS부터 확인하나요?',
    options: [
      { text: '거의 안 함', score: 1 },
      { text: '가끔 (주 1-2회)', score: 2 },
      { text: '자주 (거의 매일)', score: 3 },
      { text: '무조건 SNS부터 확인', score: 4 },
    ],
  },
  {
    id: 3,
    question: 'SNS에서 다른 사람과 나를 비교하며 우울해진 적 있나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '가끔 있음', score: 2 },
      { text: '자주 있음', score: 3 },
      { text: '거의 매번 비교함', score: 4 },
    ],
  },
  {
    id: 4,
    question: 'SNS 알림이 오면 바로 확인해야 마음이 편한가요?',
    options: [
      { text: '천천히 봐도 됨', score: 1 },
      { text: '시간 날 때 확인', score: 2 },
      { text: '가능하면 빨리 확인하고 싶음', score: 3 },
      { text: '바로 확인 안 하면 불안함', score: 4 },
    ],
  },
  {
    id: 5,
    question: 'SNS를 안 보면 뭔가 놓치는 것 같은 불안감(FOMO)을 느끼나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '가끔 느낌', score: 2 },
      { text: '자주 느낌', score: 3 },
      { text: '항상 불안함', score: 4 },
    ],
  },
  {
    id: 6,
    question: 'SNS 때문에 잠자리에 늦게 든 적이 있나요?',
    options: [
      { text: '거의 없음', score: 1 },
      { text: '가끔 (월 1-2회)', score: 2 },
      { text: '자주 (주 2-3회)', score: 3 },
      { text: '거의 매일', score: 4 },
    ],
  },
  {
    id: 7,
    question: 'SNS 사용 후 피곤하거나 허무한 기분이 드나요?',
    options: [
      { text: '전혀 없음', score: 1 },
      { text: '가끔 느낌', score: 2 },
      { text: '자주 느낌', score: 3 },
      { text: '거의 항상 느낌', score: 4 },
    ],
  },
  {
    id: 8,
    question: 'SNS 사용 시간을 줄이려고 시도해본 적 있나요?',
    options: [
      { text: '줄일 필요성을 못 느낌', score: 1 },
      { text: '시도해서 성공함', score: 2 },
      { text: '시도했지만 실패함', score: 3 },
      { text: '여러 번 시도했지만 매번 실패', score: 4 },
    ],
  },
  {
    id: 9,
    question: '실제로 만나는 친구보다 SNS 소통이 더 많나요?',
    options: [
      { text: '오프라인 만남이 훨씬 많음', score: 1 },
      { text: '비슷함', score: 2 },
      { text: 'SNS가 더 많음', score: 3 },
      { text: '거의 SNS로만 소통', score: 4 },
    ],
  },
  {
    id: 10,
    question: 'SNS에 올릴 콘텐츠 때문에 스트레스를 받나요?',
    options: [
      { text: '전혀 없음 (거의 안 올림)', score: 1 },
      { text: '가끔 신경 씀', score: 2 },
      { text: '올릴 때마다 고민됨', score: 3 },
      { text: '완벽해야 해서 스트레스', score: 4 },
    ],
  },
  {
    id: 11,
    question: 'SNS 없이 하루를 보낼 수 있나요?',
    options: [
      { text: '문제없음', score: 1 },
      { text: '불편하지만 가능', score: 2 },
      { text: '매우 힘들 것 같음', score: 3 },
      { text: '상상도 못함', score: 4 },
    ],
  },
  {
    id: 12,
    question: '좋아요/팔로워 수에 신경이 쓰이나요?',
    options: [
      { text: '전혀 신경 안 씀', score: 1 },
      { text: '가끔 확인', score: 2 },
      { text: '자주 확인하고 신경 씀', score: 3 },
      { text: '숫자에 따라 기분이 좌우됨', score: 4 },
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
  dailyUsage: string;
  symptoms: string[];
  tips: string[];
  detoxChallenge: string;
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
    level: 'balanced',
    title: '디지털 균형파',
    emoji: '🌱',
    description: 'SNS를 건강하게 사용하고 있어요! 현실과 온라인의 균형을 잘 유지하고 있습니다.',
    dailyUsage: '1-2시간 이하',
    symptoms: [
      'SNS 없어도 일상에 지장 없음',
      '오프라인 관계가 더 중요함',
      '비교 의식 거의 없음',
      '수면과 생산성에 영향 없음',
    ],
    tips: [
      '현재의 건강한 습관을 유지하세요',
      '가끔 SNS 휴식일을 가져보세요',
      '오프라인 취미 활동을 더 늘려보세요',
      '주변 사람들에게 좋은 모범이 되어주세요',
      '디지털 웰빙에 대해 주변에 공유해보세요',
    ],
    detoxChallenge: '주말 하루 SNS 완전 OFF',
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
    level: 'mild',
    title: '가벼운 SNS 피로',
    emoji: '📱',
    description: 'SNS 사용이 조금 습관화되고 있어요. 지금 관리하면 건강하게 유지할 수 있습니다.',
    dailyUsage: '2-3시간',
    symptoms: [
      '습관적으로 SNS 확인',
      '가끔 비교 의식 느낌',
      '알림에 반응하게 됨',
      '가끔 시간 낭비 느낌',
    ],
    tips: [
      '알림을 꺼두고 정해진 시간에만 확인',
      '잠자리에서 스마트폰 멀리 두기',
      '하루 사용 시간 제한 앱 활용',
      'SNS 대신 책이나 운동으로 대체',
      '팔로우 정리로 피드 최적화',
    ],
    detoxChallenge: '하루 1시간 이하로 줄여보기',
    color: {
      gradient: 'from-amber-500 to-yellow-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
  },
  {
    minScore: 31,
    maxScore: 40,
    level: 'moderate',
    title: '중간 SNS 피로',
    emoji: '😓',
    description: 'SNS가 일상에 꽤 많은 영향을 주고 있어요. 디지털 디톡스를 시작할 때입니다.',
    dailyUsage: '3-5시간',
    symptoms: [
      'FOMO(놓칠까봐 불안) 경험',
      '자주 비교하며 우울해짐',
      '수면에 영향 받음',
      '생산성 저하 느낌',
    ],
    tips: [
      '주 1-2일 SNS 휴식일 만들기',
      '침실에 스마트폰 반입 금지',
      '식사 시간에는 폰 멀리 두기',
      '오프라인 만남 일정 먼저 잡기',
      'SNS 앱 홈 화면에서 제거',
    ],
    detoxChallenge: '주말 하루 완전 디지털 디톡스',
    color: {
      gradient: 'from-orange-500 to-red-400',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  },
  {
    minScore: 41,
    maxScore: 48,
    level: 'severe',
    title: '심각한 SNS 피로',
    emoji: '🆘',
    description: 'SNS가 정신 건강에 영향을 주고 있어요. 적극적인 디지털 디톡스가 필요합니다.',
    dailyUsage: '5시간 이상',
    symptoms: [
      '강한 불안감과 FOMO',
      '수면 장애 동반 가능',
      '현실 관계 소홀해짐',
      '자존감 저하 경험',
    ],
    tips: [
      '1주일 SNS 완전 휴식 도전',
      '스마트폰 사용 시간 추적 앱 필수',
      '전문 상담 고려 (스마트쉼센터 등)',
      'SNS 계정 일시 비활성화 고려',
      '오프라인 취미 활동 시작하기',
    ],
    detoxChallenge: '1주일 SNS 완전 끊기 챌린지',
    color: {
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  },
];

// SNS 평균 사용 시간 참고
const SNS_STATS = [
  { age: '10대', time: '약 5시간', platform: '틱톡, 인스타' },
  { age: '20대', time: '약 4시간', platform: '인스타, 유튜브' },
  { age: '30대', time: '약 3시간', platform: '유튜브, 카카오' },
  { age: '40대 이상', time: '약 2시간', platform: '카카오, 유튜브' },
];

function SnsFatigueTest() {
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
        setStep('result');
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
    const shareUrl = `${window.location.origin}/tests/sns-fatigue?score=${totalScore}`;
    const shareText = `나의 SNS 피로도: ${result.title}! 당신은 어떤 상태인가요?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SNS 피로도 테스트 결과',
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
    window.history.replaceState({}, '', '/tests/sns-fatigue');
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
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              SNS
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              SNS 피로도 테스트
            </h1>
            <p className="text-gray-600">
              나는 디지털 균형파? 아니면 SNS 피로 상태?
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 mb-6 border border-violet-100">
            <div className="flex justify-center gap-4 text-sm text-gray-600 mb-6">
              <span>약 2분</span>
              <span className="text-gray-300">|</span>
              <span>12문항</span>
            </div>

            {/* 피로도 레벨 미리보기 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {RESULTS.map((result) => (
                <div
                  key={result.level}
                  className="bg-white/70 rounded-xl p-3 text-center"
                >
                  <div className="text-2xl mb-1">{result.emoji}</div>
                  <div className="font-medium text-gray-800 text-sm">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.dailyUsage}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-4">
              <strong>스마트쉼센터</strong> 진단 기준을 참고한 테스트입니다.
              <br />
              FOMO, 비교 의식, 수면 영향 등을 종합 평가합니다.
            </p>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              테스트 시작하기
            </button>
          </div>

          <p className="text-xs text-gray-400">
            * 본 테스트는 재미로 즐기는 테스트입니다.
          </p>
        </div>
      )}

      {/* 질문 화면 */}
      {step === 'question' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* 진행 상태 */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-violet-600 font-bold">
              Q{currentQuestion + 1}
            </span>
            <span className="text-gray-400 text-sm">
              {currentQuestion + 1} / {QUESTIONS.length}
            </span>
          </div>

          {/* 진행 바 */}
          <div className="w-full h-2 bg-gray-100 rounded-full mb-8">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
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
                  className="w-full p-4 text-left bg-gray-50 hover:bg-violet-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-all duration-200"
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
            <div className="bg-violet-100 border border-violet-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-violet-800 font-medium">
                친구의 테스트 결과예요!
              </p>
              <p className="text-violet-600 text-sm mt-1">
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

            {/* 일일 사용 시간 */}
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">
                예상 일일 SNS 사용 시간
              </h3>
              <p className={`text-lg font-bold ${getResult().color.text}`}>
                {getResult().dailyUsage}
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
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">
                디지털 웰빙 팁
              </h3>
              <ul className="space-y-2">
                {getResult().tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-violet-500">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 디톡스 챌린지 */}
            <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl p-4 border border-violet-200">
              <h3 className="font-bold text-violet-800 mb-2">
                추천 디톡스 챌린지
              </h3>
              <p className="text-violet-700 font-medium">
                {getResult().detoxChallenge}
              </p>
            </div>
          </div>

          {/* 연령대별 SNS 사용 시간 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">
              연령대별 평균 SNS 사용 시간 (참고)
            </h3>
            <div className="space-y-2 text-sm">
              {SNS_STATS.map((stat, index) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{stat.age}</span>
                  <span className="text-gray-500">{stat.platform}</span>
                  <span className="font-medium text-gray-800">{stat.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            {isSharedResult ? (
              <button
                onClick={handleRetry}
                className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                나도 테스트하기
              </button>
            ) : (
              <>
                <button
                  onClick={handleShare}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
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
              href="/tests/sleep-type"
              className="block w-full py-4 bg-indigo-50 text-indigo-700 font-medium rounded-xl text-center hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              수면 유형 테스트도 해보기 →
            </Link>
          </div>

          {/* 피로도 단계 비교 */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 text-center">
              SNS 피로도 단계
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
                      {result.minScore}-{result.maxScore}점 | {result.dailyUsage}
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
            * 본 테스트는 재미로 즐기는 테스트입니다.
            <br />
            심각한 SNS 의존 증상이 있다면 스마트쉼센터(1599-0075) 상담을 권장합니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SnsFatiguePage() {
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
      <SnsFatigueTest />
    </Suspense>
  );
}
