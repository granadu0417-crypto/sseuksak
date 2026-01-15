'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 5가지 직장 동물 유형
type AnimalType = 'A' | 'B' | 'C' | 'D' | 'E';

interface AnimalResult {
  type: AnimalType;
  animal: string;
  emoji: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  bestMatch: string;
  worstMatch: string;
  advice: string;
  gradient: string;
}

const RESULTS: Record<AnimalType, AnimalResult> = {
  A: {
    type: 'A',
    animal: '독수리',
    emoji: '🦅',
    title: '하늘을 지배하는 독수리',
    description: '높은 곳에서 전체를 조망하며 목표를 향해 단호하게 나아가는 리더형입니다. 결단력이 뛰어나고 성과 지향적이며, 팀을 이끌어 목표를 달성하는 데 탁월합니다.',
    strengths: ['뛰어난 리더십', '빠른 의사결정', '목표 지향적', '큰 그림을 보는 능력'],
    weaknesses: ['세부사항 놓치기 쉬움', '독단적일 수 있음', '타인 감정에 둔감할 수 있음'],
    bestMatch: '🐕 강아지 - 당신의 리더십을 잘 따르고 세부사항을 챙겨줍니다',
    worstMatch: '🐱 고양이 - 서로 독립성을 존중하되 갈등이 생길 수 있어요',
    advice: '가끔은 높은 곳에서 내려와 팀원들과 눈높이를 맞춰보세요.',
    gradient: 'from-amber-500 to-orange-600',
  },
  B: {
    type: 'B',
    animal: '강아지',
    emoji: '🐕',
    title: '모두의 친구 강아지',
    description: '밝은 에너지로 팀 분위기를 띄우고 협력을 이끌어내는 친화형입니다. 동료들과의 관계를 중시하며, 팀워크를 통해 최고의 성과를 만들어냅니다.',
    strengths: ['뛰어난 협력 능력', '긍정적 에너지', '충성심', '의사소통 능력'],
    weaknesses: ['거절을 잘 못함', 'NO라고 말하기 어려움', '갈등 회피 성향'],
    bestMatch: '🦅 독수리 - 명확한 방향을 제시해주는 리더가 필요해요',
    worstMatch: '🦊 여우 - 정치적 행동에 상처받을 수 있어요',
    advice: '모두를 기쁘게 하려 하지 마세요. 가끔은 자신의 의견을 강하게 표현해도 괜찮아요.',
    gradient: 'from-yellow-400 to-amber-500',
  },
  C: {
    type: 'C',
    animal: '고양이',
    emoji: '🐱',
    title: '나만의 길을 가는 고양이',
    description: '독립적이고 전문성을 갖춘 프로페셔널 타입입니다. 혼자서도 뛰어난 성과를 내며, 자신만의 방식으로 일을 완벽하게 처리합니다.',
    strengths: ['높은 전문성', '독립적 업무 처리', '창의적 문제해결', '품질에 대한 고집'],
    weaknesses: ['팀워크 어려움', '지시 받기 싫어함', '고집이 셀 수 있음'],
    bestMatch: '🦉 부엉이 - 서로의 전문성을 인정하고 존중해요',
    worstMatch: '🐕 강아지 - 너무 많은 관심이 부담스러울 수 있어요',
    advice: '가끔은 동료들과 협력하면 더 큰 성과를 낼 수 있다는 걸 기억하세요.',
    gradient: 'from-purple-500 to-pink-500',
  },
  D: {
    type: 'D',
    animal: '부엉이',
    emoji: '🦉',
    title: '지혜로운 분석가 부엉이',
    description: '데이터와 논리로 무장한 분석형입니다. 신중하게 결정하고, 꼼꼼한 분석으로 최적의 해결책을 찾아냅니다. 팀의 브레인 역할을 합니다.',
    strengths: ['뛰어난 분석력', '논리적 사고', '꼼꼼함', '전략적 계획'],
    weaknesses: ['결정이 느릴 수 있음', '과도한 분석', '감정 표현 서툼'],
    bestMatch: '🐱 고양이 - 서로의 전문성을 인정하며 깊은 논의가 가능해요',
    worstMatch: '🦅 독수리 - 빠른 결정을 요구받으면 스트레스받을 수 있어요',
    advice: '때로는 완벽한 분석보다 적절한 타이밍의 결정이 더 중요할 수 있어요.',
    gradient: 'from-indigo-500 to-purple-600',
  },
  E: {
    type: 'E',
    animal: '여우',
    emoji: '🦊',
    title: '영리한 전략가 여우',
    description: '상황 파악이 빠르고 정치적 감각이 뛰어난 전략형입니다. 복잡한 조직 내에서 능숙하게 움직이며, 기회를 포착하는 능력이 탁월합니다.',
    strengths: ['상황 판단력', '적응력', '네트워킹 능력', '기회 포착'],
    weaknesses: ['신뢰 얻기 어려울 수 있음', '일관성 부족', '깊은 관계 형성 어려움'],
    bestMatch: '🦅 독수리 - 서로의 전략적 사고를 인정하며 시너지를 내요',
    worstMatch: '🐕 강아지 - 순수한 강아지에게 상처를 줄 수 있어요',
    advice: '진정성 있는 관계 구축에 투자하세요. 장기적으로 더 큰 성과를 가져다줍니다.',
    gradient: 'from-orange-500 to-red-500',
  },
};

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    scores: Record<AnimalType, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '새로운 프로젝트가 주어졌을 때 당신은?',
    options: [
      { text: '바로 팀을 구성하고 역할을 분배한다', scores: { A: 3, B: 1, C: 0, D: 1, E: 1 } },
      { text: '팀원들의 의견을 모아 함께 계획을 세운다', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '일단 혼자 할 수 있는 부분을 파악한다', scores: { A: 0, B: 0, C: 3, D: 1, E: 1 } },
      { text: '충분한 자료 조사 후 상세 계획을 수립한다', scores: { A: 0, B: 0, C: 1, D: 3, E: 1 } },
    ],
  },
  {
    id: 2,
    question: '회의 중 동료와 의견이 충돌할 때?',
    options: [
      { text: '논리적으로 내 의견을 관철시킨다', scores: { A: 3, B: 0, C: 1, D: 1, E: 1 } },
      { text: '분위기를 보며 적절히 타협점을 찾는다', scores: { A: 0, B: 2, C: 0, D: 1, E: 3 } },
      { text: '굳이 충돌하지 않고 내 방식대로 한다', scores: { A: 0, B: 0, C: 3, D: 1, E: 1 } },
      { text: '양쪽 의견의 장단점을 분석해 제시한다', scores: { A: 1, B: 1, C: 0, D: 3, E: 1 } },
    ],
  },
  {
    id: 3,
    question: '점심시간에 주로 어떻게 보내나요?',
    options: [
      { text: '팀 회식이나 동료들과 함께 식사', scores: { A: 1, B: 3, C: 0, D: 0, E: 2 } },
      { text: '혼자 조용히 식사하며 휴식', scores: { A: 0, B: 0, C: 3, D: 2, E: 0 } },
      { text: '업무 네트워킹 점심 미팅', scores: { A: 2, B: 1, C: 0, D: 0, E: 3 } },
      { text: '뉴스나 업계 동향 체크하며 식사', scores: { A: 1, B: 0, C: 1, D: 3, E: 1 } },
    ],
  },
  {
    id: 4,
    question: '상사에게 피드백을 받을 때 선호하는 방식은?',
    options: [
      { text: '직접적이고 명확한 피드백', scores: { A: 3, B: 0, C: 2, D: 1, E: 0 } },
      { text: '칭찬과 함께 부드럽게', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '결과물 중심의 객관적 평가', scores: { A: 1, B: 0, C: 2, D: 3, E: 0 } },
      { text: '일대일로 조용히 이야기', scores: { A: 0, B: 1, C: 3, D: 1, E: 1 } },
    ],
  },
  {
    id: 5,
    question: '마감이 촉박한 상황에서 당신은?',
    options: [
      { text: '팀을 독려하고 우선순위를 재정비한다', scores: { A: 3, B: 1, C: 0, D: 1, E: 1 } },
      { text: '동료들에게 도움을 요청한다', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '야근을 해서라도 혼자 완수한다', scores: { A: 1, B: 0, C: 3, D: 1, E: 0 } },
      { text: '현실적인 일정 조정을 제안한다', scores: { A: 0, B: 0, C: 1, D: 3, E: 2 } },
    ],
  },
  {
    id: 6,
    question: '회사에서 당신이 가장 중요하게 생각하는 것은?',
    options: [
      { text: '성과와 목표 달성', scores: { A: 3, B: 0, C: 1, D: 1, E: 2 } },
      { text: '좋은 동료 관계와 팀워크', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '전문성 향상과 성장', scores: { A: 1, B: 0, C: 3, D: 2, E: 0 } },
      { text: '승진과 커리어 발전', scores: { A: 2, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 7,
    question: '새로운 직원이 입사했을 때 당신은?',
    options: [
      { text: '업무 목표와 기대치를 명확히 설명한다', scores: { A: 3, B: 1, C: 1, D: 1, E: 0 } },
      { text: '점심에 초대하고 팀원들을 소개한다', scores: { A: 0, B: 3, C: 0, D: 0, E: 2 } },
      { text: '필요할 때 도움을 요청하라고 말한다', scores: { A: 0, B: 1, C: 3, D: 1, E: 0 } },
      { text: '회사 시스템과 프로세스를 상세히 알려준다', scores: { A: 0, B: 1, C: 0, D: 3, E: 1 } },
    ],
  },
  {
    id: 8,
    question: '업무 스타일을 고르자면?',
    options: [
      { text: '빠른 결정, 빠른 실행', scores: { A: 3, B: 1, C: 1, D: 0, E: 2 } },
      { text: '협력과 합의 중심', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '독립적이고 자율적인 업무', scores: { A: 0, B: 0, C: 3, D: 1, E: 1 } },
      { text: '철저한 계획과 분석 기반', scores: { A: 0, B: 0, C: 1, D: 3, E: 1 } },
    ],
  },
  {
    id: 9,
    question: '회사 회식 자리에서 당신은?',
    options: [
      { text: '자연스럽게 분위기를 이끈다', scores: { A: 2, B: 2, C: 0, D: 0, E: 3 } },
      { text: '모든 사람과 골고루 대화한다', scores: { A: 0, B: 3, C: 0, D: 1, E: 2 } },
      { text: '한두 명과 깊은 대화를 나눈다', scores: { A: 0, B: 1, C: 2, D: 3, E: 0 } },
      { text: '적당히 있다가 먼저 빠진다', scores: { A: 0, B: 0, C: 3, D: 1, E: 0 } },
    ],
  },
  {
    id: 10,
    question: '중요한 결정을 내릴 때 당신은?',
    options: [
      { text: '직감과 경험을 믿고 빠르게 결정', scores: { A: 3, B: 0, C: 1, D: 0, E: 2 } },
      { text: '주변 사람들의 의견을 충분히 듣는다', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '혼자 심사숙고한다', scores: { A: 0, B: 0, C: 3, D: 2, E: 0 } },
      { text: '데이터와 근거를 철저히 분석한다', scores: { A: 0, B: 0, C: 1, D: 3, E: 1 } },
    ],
  },
  {
    id: 11,
    question: '업무 중 실수가 발생했을 때?',
    options: [
      { text: '책임지고 빠르게 해결책을 찾는다', scores: { A: 3, B: 1, C: 1, D: 1, E: 0 } },
      { text: '팀과 함께 원인을 파악하고 해결한다', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '스스로 복기하고 다음엔 실수하지 않는다', scores: { A: 0, B: 0, C: 3, D: 2, E: 0 } },
      { text: '상황을 정리하고 재발 방지책을 문서화한다', scores: { A: 0, B: 0, C: 1, D: 3, E: 1 } },
    ],
  },
  {
    id: 12,
    question: '이상적인 직장 환경은?',
    options: [
      { text: '성과에 따른 보상이 확실한 곳', scores: { A: 3, B: 0, C: 1, D: 0, E: 2 } },
      { text: '팀워크와 소통이 원활한 곳', scores: { A: 0, B: 3, C: 0, D: 1, E: 1 } },
      { text: '자율성이 보장되는 곳', scores: { A: 0, B: 0, C: 3, D: 1, E: 1 } },
      { text: '체계와 시스템이 잘 갖춰진 곳', scores: { A: 0, B: 1, C: 0, D: 3, E: 1 } },
    ],
  },
];

function calculateResult(scores: Record<AnimalType, number>): AnimalType {
  const sortedTypes = (Object.entries(scores) as [AnimalType, number][])
    .sort((a, b) => b[1] - a[1]);
  return sortedTypes[0][0];
}

function OfficeAnimalTestContent() {
  const searchParams = useSearchParams();
  const sharedType = searchParams.get('type') as AnimalType | null;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<AnimalType, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [result, setResult] = useState<AnimalResult | null>(
    sharedType && RESULTS[sharedType] ? RESULTS[sharedType] : null
  );
  const [showFriendResult, setShowFriendResult] = useState(!!sharedType);
  const [isStarted, setIsStarted] = useState(false);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    const question = QUESTIONS[currentQuestion];
    const option = question.options[optionIndex];

    const newScores = { ...scores };
    (Object.keys(option.scores) as AnimalType[]).forEach((type) => {
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
      (Object.keys(prevOption.scores) as AnimalType[]).forEach((type) => {
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
            <p className="text-sm opacity-90 mb-2">친구의 직장 동물 결과</p>
            <div className="text-6xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold">{result.title}</h2>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">{result.description}</p>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-600 mb-4">나도 테스트해서 결과를 비교해볼까요?</p>
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
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 text-white text-center">
            <div className="text-6xl mb-4">🦁</div>
            <h1 className="text-2xl font-bold mb-2">회사에서 나는 무슨 동물?</h1>
            <p className="opacity-90">12개 질문으로 알아보는 나의 직장 동물 유형</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-5 gap-2 text-center text-3xl">
              <div className="p-3 bg-amber-50 rounded-lg">🦅</div>
              <div className="p-3 bg-yellow-50 rounded-lg">🐕</div>
              <div className="p-3 bg-purple-50 rounded-lg">🐱</div>
              <div className="p-3 bg-indigo-50 rounded-lg">🦉</div>
              <div className="p-3 bg-orange-50 rounded-lg">🦊</div>
            </div>

            <div className="text-center text-gray-600">
              <p className="mb-2">독수리? 강아지? 고양이?</p>
              <p>나의 업무 스타일은 어떤 동물과 비슷할까요?</p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>⏱ 약 2분</span>
              <span className="text-gray-300">|</span>
              <span>📝 12문항</span>
            </div>

            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 transition-opacity"
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
      ? `${window.location.origin}/tests/office-animal?type=${result.type}`
      : '';

    const handleShare = async () => {
      const shareText = `나의 직장 동물은 "${result.title}"!\n\n${shareUrl}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: '회사에서 나는 무슨 동물?', text: shareText, url: shareUrl });
        } catch {
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
            <p className="text-sm opacity-90 mb-2">나의 직장 동물 유형</p>
            <div className="text-7xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold mb-1">{result.title}</h2>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-gray-700 leading-relaxed text-center">{result.description}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-bold text-green-800 mb-3">💪 강점</h3>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-green-700 text-sm">✓ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <h3 className="font-bold text-red-800 mb-3">⚠️ 주의할 점</h3>
                <ul className="space-y-1">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-red-700 text-sm">• {w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <div>
                <h3 className="font-bold text-blue-800 mb-1">💕 환상의 궁합</h3>
                <p className="text-blue-700 text-sm">{result.bestMatch}</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-800 mb-1">💔 주의가 필요한 궁합</h3>
                <p className="text-blue-700 text-sm">{result.worstMatch}</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-2">💡 한마디 조언</h3>
              <p className="text-amber-700 text-sm">{result.advice}</p>
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
            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full transition-all duration-300"
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
                className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
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

export default function OfficeAnimalTestPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🦁</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <OfficeAnimalTestContent />
    </Suspense>
  );
}
