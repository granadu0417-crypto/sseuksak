'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 5가지 운세 키워드 유형
type FortuneType = 'A' | 'B' | 'C' | 'D' | 'E';

interface FortuneResult {
  type: FortuneType;
  keyword: string;
  subKeyword: string;
  emoji: string;
  title: string;
  description: string;
  luckyMonths: string[];
  luckyColor: string;
  luckyNumber: string;
  advice: string;
  caution: string;
  bestPartner: string;
  gradient: string;
}

const RESULTS: Record<FortuneType, FortuneResult> = {
  A: {
    type: 'A',
    keyword: '도약',
    subKeyword: 'LEAP',
    emoji: '🚀',
    title: '힘차게 도약하는 한 해',
    description: '2026년은 당신에게 새로운 시작의 해입니다. 병오년(丙午年) 붉은 말의 기운을 받아 그 어느 때보다 과감하게 도전할 수 있는 시기예요. 망설였던 일, 미뤄왔던 계획을 실행에 옮기기 좋은 때입니다.',
    luckyMonths: ['3월', '7월', '11월'],
    luckyColor: '빨간색, 주황색',
    luckyNumber: '3, 7',
    advice: '새로운 것에 도전하세요. 첫걸음이 두렵더라도 시작하면 기운이 따릅니다.',
    caution: '너무 급하게 서두르지 마세요. 기회가 왔을 때 움직이되, 준비는 철저히!',
    bestPartner: '당신의 도전을 응원해주는 사람과 함께하면 더 큰 성과를 얻습니다.',
    gradient: 'from-red-500 to-orange-500',
  },
  B: {
    type: 'B',
    keyword: '풍요',
    subKeyword: 'ABUNDANCE',
    emoji: '💰',
    title: '풍요로움이 찾아오는 한 해',
    description: '2026년 당신의 키워드는 풍요입니다. 물질적으로나 정신적으로 채워지는 시기예요. 그동안 노력한 것들이 결실을 맺고, 예상치 못한 곳에서 행운이 찾아올 수 있습니다.',
    luckyMonths: ['2월', '6월', '10월'],
    luckyColor: '금색, 노란색',
    luckyNumber: '8, 6',
    advice: '받는 것에 감사하고, 나눔을 실천하면 더 큰 풍요가 돌아옵니다.',
    caution: '욕심을 부리면 오히려 가진 것을 잃을 수 있어요. 만족을 아는 것도 복입니다.',
    bestPartner: '긍정적인 에너지를 가진 사람과 함께하면 재물운이 더 좋아집니다.',
    gradient: 'from-yellow-500 to-amber-500',
  },
  C: {
    type: 'C',
    keyword: '사랑',
    subKeyword: 'LOVE',
    emoji: '💕',
    title: '사랑이 꽃피는 한 해',
    description: '2026년은 인연의 해입니다. 새로운 만남이 특별한 관계로 발전하거나, 기존 관계가 더욱 깊어지는 시기예요. 사람과의 인연이 인생의 전환점이 될 수 있습니다.',
    luckyMonths: ['4월', '8월', '12월'],
    luckyColor: '핑크색, 하늘색',
    luckyNumber: '2, 9',
    advice: '마음을 열고 진심으로 다가가세요. 진정성 있는 관계가 행운을 불러옵니다.',
    caution: '첫인상에만 의존하지 마세요. 시간을 두고 상대를 알아가는 것이 중요합니다.',
    bestPartner: '대화가 잘 통하는 사람과의 만남이 올해의 키포인트입니다.',
    gradient: 'from-pink-500 to-rose-500',
  },
  D: {
    type: 'D',
    keyword: '성장',
    subKeyword: 'GROWTH',
    emoji: '🌱',
    title: '한 뼘 더 성장하는 한 해',
    description: '2026년은 배움과 성장의 해입니다. 새로운 것을 배우고 익히기에 최적의 시기예요. 자기계발에 투자한 시간이 미래의 큰 자산이 됩니다.',
    luckyMonths: ['1월', '5월', '9월'],
    luckyColor: '초록색, 민트색',
    luckyNumber: '1, 5',
    advice: '호기심을 잃지 마세요. 배움에는 나이도 때도 없습니다.',
    caution: '완벽주의는 성장의 적입니다. 실패도 배움의 일부라고 생각하세요.',
    bestPartner: '좋은 스승이나 멘토를 만나면 올해 큰 도움이 됩니다.',
    gradient: 'from-green-500 to-emerald-500',
  },
  E: {
    type: 'E',
    keyword: '안정',
    subKeyword: 'STABILITY',
    emoji: '🏠',
    title: '평온함을 찾는 한 해',
    description: '2026년은 안정과 균형의 해입니다. 지금까지 달려온 것을 정리하고, 내면의 평화를 찾는 시기예요. 무리한 변화보다 현재에 집중하는 것이 좋습니다.',
    luckyMonths: ['3월', '6월', '9월'],
    luckyColor: '베이지색, 갈색',
    luckyNumber: '4, 6',
    advice: '조급해하지 마세요. 천천히 가도 괜찮습니다. 쉬어가는 것도 전진입니다.',
    caution: '변화를 너무 두려워하면 좋은 기회를 놓칠 수 있어요. 적절한 균형을 찾으세요.',
    bestPartner: '믿을 수 있는 가족이나 오랜 친구가 올해 당신의 버팀목이 됩니다.',
    gradient: 'from-amber-600 to-yellow-700',
  },
};

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    scores: Record<FortuneType, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '2026년에 가장 이루고 싶은 것은?',
    options: [
      { text: '새로운 일에 도전해서 성공하기', scores: { A: 3, B: 1, C: 0, D: 1, E: 0 } },
      { text: '경제적으로 여유로워지기', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '좋은 사람을 만나거나 관계 발전', scores: { A: 0, B: 0, C: 3, D: 1, E: 1 } },
      { text: '나 자신을 발전시키기', scores: { A: 1, B: 0, C: 0, D: 3, E: 1 } },
    ],
  },
  {
    id: 2,
    question: '최근 자주 드는 생각은?',
    options: [
      { text: '뭔가 새로운 시작이 필요해', scores: { A: 3, B: 0, C: 1, D: 1, E: 0 } },
      { text: '돈이 좀 더 있었으면 좋겠다', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '외로울 때가 많다, 좋은 인연을 만나고 싶다', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '요즘 좀 지치고 쉬고 싶다', scores: { A: 0, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 3,
    question: '새해 첫날, 가장 하고 싶은 것은?',
    options: [
      { text: '버킷리스트 세우고 계획 짜기', scores: { A: 3, B: 1, C: 0, D: 2, E: 0 } },
      { text: '가족이나 연인과 따뜻한 시간 보내기', scores: { A: 0, B: 0, C: 3, D: 0, E: 2 } },
      { text: '재테크 목표 세우기', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '조용히 나만의 시간 갖기', scores: { A: 0, B: 0, C: 1, D: 1, E: 3 } },
    ],
  },
  {
    id: 4,
    question: '행운의 징조라고 느끼는 것은?',
    options: [
      { text: '예상치 못한 제안이나 기회', scores: { A: 3, B: 1, C: 0, D: 1, E: 0 } },
      { text: '갑자기 생긴 용돈이나 보너스', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '좋은 사람과의 우연한 만남', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
      { text: '하던 일이 순조롭게 풀릴 때', scores: { A: 1, B: 1, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 5,
    question: '가장 두려운 것은?',
    options: [
      { text: '도전하지 못하고 후회하는 것', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '경제적으로 어려워지는 것', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '혼자가 되는 것', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '변화 속에서 길을 잃는 것', scores: { A: 0, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 6,
    question: '친구가 고민 상담을 요청하면?',
    options: [
      { text: '해결책과 실행 방법을 제시한다', scores: { A: 3, B: 1, C: 0, D: 2, E: 0 } },
      { text: '현실적인 조언을 해준다', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '공감하고 위로해준다', scores: { A: 0, B: 0, C: 3, D: 0, E: 2 } },
      { text: '천천히 들어주며 생각할 시간을 준다', scores: { A: 0, B: 0, C: 1, D: 1, E: 3 } },
    ],
  },
  {
    id: 7,
    question: '자유시간이 생기면 주로?',
    options: [
      { text: '새로운 취미나 활동에 도전', scores: { A: 3, B: 0, C: 1, D: 2, E: 0 } },
      { text: '부업이나 재테크 공부', scores: { A: 0, B: 3, C: 0, D: 1, E: 0 } },
      { text: '사람들 만나고 수다 떨기', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '집에서 쉬면서 충전', scores: { A: 0, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 8,
    question: '나를 가장 잘 표현하는 단어는?',
    options: [
      { text: '열정적', scores: { A: 3, B: 1, C: 1, D: 1, E: 0 } },
      { text: '실용적', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '따뜻한', scores: { A: 0, B: 0, C: 3, D: 0, E: 2 } },
      { text: '신중한', scores: { A: 0, B: 1, C: 0, D: 2, E: 3 } },
    ],
  },
  {
    id: 9,
    question: '스트레스를 받으면?',
    options: [
      { text: '더 열심히 해서 극복한다', scores: { A: 3, B: 1, C: 0, D: 2, E: 0 } },
      { text: '쇼핑이나 맛있는 음식으로 푼다', scores: { A: 0, B: 3, C: 1, D: 0, E: 1 } },
      { text: '친구나 가족에게 털어놓는다', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '혼자만의 시간을 갖는다', scores: { A: 0, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 10,
    question: '지금 가장 필요한 것은?',
    options: [
      { text: '용기와 결단력', scores: { A: 3, B: 0, C: 0, D: 1, E: 0 } },
      { text: '여유 자금과 재정 안정', scores: { A: 0, B: 3, C: 0, D: 0, E: 1 } },
      { text: '이해해주는 사람', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '휴식과 재충전', scores: { A: 0, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 11,
    question: '1년 후 나의 모습은?',
    options: [
      { text: '새로운 분야에서 활약하고 있다', scores: { A: 3, B: 1, C: 0, D: 2, E: 0 } },
      { text: '재정적으로 더 여유로워졌다', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '소중한 사람과 함께하고 있다', scores: { A: 0, B: 0, C: 3, D: 0, E: 2 } },
      { text: '마음의 평화를 찾았다', scores: { A: 0, B: 0, C: 1, D: 1, E: 3 } },
    ],
  },
  {
    id: 12,
    question: '내가 중요하게 생각하는 가치는?',
    options: [
      { text: '도전과 성취', scores: { A: 3, B: 1, C: 0, D: 2, E: 0 } },
      { text: '안정과 풍요', scores: { A: 0, B: 3, C: 0, D: 0, E: 2 } },
      { text: '사랑과 관계', scores: { A: 0, B: 0, C: 3, D: 0, E: 1 } },
      { text: '균형과 평화', scores: { A: 0, B: 0, C: 1, D: 1, E: 3 } },
    ],
  },
];

function calculateResult(scores: Record<FortuneType, number>): FortuneType {
  const sortedTypes = (Object.entries(scores) as [FortuneType, number][])
    .sort((a, b) => b[1] - a[1]);
  return sortedTypes[0][0];
}

function Fortune2026TestContent() {
  const searchParams = useSearchParams();
  const sharedType = searchParams.get('type') as FortuneType | null;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<FortuneType, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [result, setResult] = useState<FortuneResult | null>(
    sharedType && RESULTS[sharedType] ? RESULTS[sharedType] : null
  );
  const [showFriendResult, setShowFriendResult] = useState(!!sharedType);
  const [isStarted, setIsStarted] = useState(false);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    const question = QUESTIONS[currentQuestion];
    const option = question.options[optionIndex];

    const newScores = { ...scores };
    (Object.keys(option.scores) as FortuneType[]).forEach((type) => {
      newScores[type] += option.scores[type];
    });

    const newSelectedOptions = [...selectedOptions, optionIndex];
    setSelectedOptions(newSelectedOptions);
    setScores(newScores);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const resultType = calculateResult(newScores);
      setResult(RESULTS[resultType]);
      setShowFriendResult(false);
    }
  }, [currentQuestion, scores, selectedOptions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      const prevOptionIndex = selectedOptions[prevQuestion];
      const prevOption = QUESTIONS[prevQuestion].options[prevOptionIndex];

      const newScores = { ...scores };
      (Object.keys(prevOption.scores) as FortuneType[]).forEach((type) => {
        newScores[type] -= prevOption.scores[type];
      });

      setScores(newScores);
      setSelectedOptions(selectedOptions.slice(0, -1));
      setCurrentQuestion(prevQuestion);
    }
  }, [currentQuestion, scores, selectedOptions]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setScores({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    setSelectedOptions([]);
    setResult(null);
    setShowFriendResult(false);
    setIsStarted(false);
  }, []);

  const handleStartTest = useCallback(() => {
    setShowFriendResult(false);
    setIsStarted(true);
    setResult(null);
  }, []);

  // 친구 결과 보기 화면
  if (showFriendResult && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${result.gradient} p-6 text-white text-center`}>
            <p className="text-sm opacity-90 mb-2">친구의 2026 운세 키워드</p>
            <div className="text-6xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold">{result.keyword}</h2>
            <p className="text-sm opacity-80 mt-1">{result.subKeyword}</p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">{result.description}</p>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-600 mb-4">나의 2026년 키워드도 확인해볼까요?</p>
              <button
                onClick={handleStartTest}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r ${result.gradient} hover:opacity-90 transition-opacity`}
              >
                나도 테스트하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 시작 화면
  if (!isStarted && !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white text-center">
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="text-2xl font-bold mb-2">2026 나의 운세 키워드</h1>
            <p className="opacity-90">병오년(丙午年) 붉은 말의 해</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-5 gap-2 text-center text-3xl">
              <div className="p-3 bg-red-50 rounded-lg">🚀</div>
              <div className="p-3 bg-yellow-50 rounded-lg">💰</div>
              <div className="p-3 bg-pink-50 rounded-lg">💕</div>
              <div className="p-3 bg-green-50 rounded-lg">🌱</div>
              <div className="p-3 bg-amber-50 rounded-lg">🏠</div>
            </div>

            <div className="text-center text-gray-600">
              <p className="mb-2">도약? 풍요? 사랑? 성장? 안정?</p>
              <p>2026년 당신을 이끌어줄 키워드는 무엇일까요?</p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-indigo-700 text-sm">
                🐴 2026년은 <strong>병오년(丙午年)</strong>,<br />
                붉은 말의 기운이 가득한 해입니다
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>⏱ 약 2분</span>
              <span className="text-gray-300">|</span>
              <span>📝 12문항</span>
            </div>

            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-opacity"
            >
              테스트 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (result && !showFriendResult) {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/tests/fortune-2026?type=${result.type}`
      : '';

    const handleShare = async () => {
      const shareText = `나의 2026년 운세 키워드는 "${result.keyword}"!\n\n${shareUrl}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: '2026 나의 운세 키워드', text: shareText, url: shareUrl });
        } catch (error) {
          console.log('Share cancelled');
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('링크가 복사되었습니다!');
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${result.gradient} p-8 text-white text-center`}>
            <p className="text-sm opacity-90 mb-2">2026년 당신의 키워드</p>
            <div className="text-7xl mb-3">{result.emoji}</div>
            <h2 className="text-3xl font-bold mb-1">{result.keyword}</h2>
            <p className="text-lg opacity-80">{result.subKeyword}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{result.title}</h3>
              <p className="text-gray-700 leading-relaxed">{result.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xs text-purple-500 mb-1">행운의 달</p>
                <p className="font-medium text-purple-700 text-sm">{result.luckyMonths.join(', ')}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-xs text-indigo-500 mb-1">행운의 색</p>
                <p className="font-medium text-indigo-700 text-sm">{result.luckyColor}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-500 mb-1">행운의 숫자</p>
                <p className="font-medium text-blue-700 text-sm">{result.luckyNumber}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-green-800 mb-2">✨ 2026년 조언</h3>
              <p className="text-green-700 text-sm">{result.advice}</p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-2">⚠️ 주의할 점</h3>
              <p className="text-amber-700 text-sm">{result.caution}</p>
            </div>

            <div className="bg-pink-50 rounded-xl p-4">
              <h3 className="font-bold text-pink-800 mb-2">💫 올해의 인연</h3>
              <p className="text-pink-700 text-sm">{result.bestPartner}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className={`flex-1 py-3 rounded-xl text-white font-medium bg-gradient-to-r ${result.gradient} hover:opacity-90 transition-opacity`}
              >
                결과 공유하기
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                다시 하기
              </button>
            </div>

            <Link href="/tests" className="block text-center text-gray-500 hover:text-gray-700 transition-colors">
              ← 다른 테스트 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 질문 화면
  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Progress */}
        <div className="bg-gray-100 h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-500">
              질문 {currentQuestion + 1} / {QUESTIONS.length}
            </span>
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← 이전 질문으로
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
              >
                <span className="text-gray-700">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Fortune2026TestPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🔮</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <Fortune2026TestContent />
    </Suspense>
  );
}
