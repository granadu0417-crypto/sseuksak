'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 5가지 번아웃 위험 단계
type BurnoutLevel = 'A' | 'B' | 'C' | 'D' | 'E';

interface BurnoutResult {
  type: BurnoutLevel;
  level: string;
  percentage: string;
  emoji: string;
  title: string;
  description: string;
  symptoms: string[];
  recovery: string[];
  warning: string;
  gradient: string;
}

const RESULTS: Record<BurnoutLevel, BurnoutResult> = {
  A: {
    type: 'A',
    level: '안전',
    percentage: '0-20%',
    emoji: '🌈',
    title: '건강한 에너지 상태',
    description: '축하해요! 현재 당신의 에너지 레벨은 매우 건강합니다. 일과 삶의 균형이 잘 잡혀있고, 스트레스 관리도 잘하고 계세요. 이 상태를 유지하면서 가끔 자신을 점검하는 것이 좋습니다.',
    symptoms: ['업무에 활력이 있다', '충분한 휴식을 취하고 있다', '취미생활을 즐기고 있다', '인간관계가 원만하다'],
    recovery: ['현재 생활 패턴 유지하기', '정기적인 자기 점검 습관들이기', '주변 동료들 챙기기', '예방적 휴식 취하기'],
    warning: '너무 안심하지 마세요! 갑작스러운 업무 폭증이나 환경 변화에 대비해 미리 대처 방법을 알아두면 좋아요.',
    gradient: 'from-green-400 to-emerald-500',
  },
  B: {
    type: 'B',
    level: '주의',
    percentage: '21-40%',
    emoji: '🌤️',
    title: '약간의 피로 신호',
    description: '전반적으로 괜찮지만, 가끔 피로를 느끼는 상태입니다. 아직 심각한 단계는 아니지만, 지금 조금씩 관리하면 번아웃을 예방할 수 있어요. 소소한 휴식을 챙겨보세요.',
    symptoms: ['가끔 피곤함을 느낀다', '월요병이 있다', '휴일에 뭘 해야 할지 모르겠다', '업무 집중력이 예전 같지 않다'],
    recovery: ['주말에 완전한 휴식 취하기', '짧은 휴가 계획하기', '취미활동 다시 시작하기', '수면 패턴 점검하기'],
    warning: '이 시기를 놓치면 피로가 누적됩니다. 지금 작은 변화를 시작하세요!',
    gradient: 'from-yellow-400 to-amber-500',
  },
  C: {
    type: 'C',
    level: '경계',
    percentage: '41-60%',
    emoji: '🌥️',
    title: '번아웃 조짐 발견',
    description: '당신의 몸과 마음이 경고 신호를 보내고 있습니다. 업무나 일상에서 무력감을 느끼는 순간이 늘어나고 있어요. 지금 조치를 취하지 않으면 더 심해질 수 있습니다.',
    symptoms: ['아침에 일어나기가 힘들다', '업무 의욕이 많이 떨어졌다', '짜증이 자주 난다', '몸이 자주 아프다'],
    recovery: ['업무량 조정 요청하기', '일주일에 하루는 완전 휴식', '전문 상담 고려하기', '운동 루틴 만들기'],
    warning: '혼자 해결하려 하지 마세요. 주변에 도움을 요청하는 것도 능력입니다.',
    gradient: 'from-orange-400 to-orange-500',
  },
  D: {
    type: 'D',
    level: '위험',
    percentage: '61-80%',
    emoji: '🌧️',
    title: '심각한 번아웃 위험',
    description: '현재 상당히 지친 상태입니다. 이미 번아웃의 많은 증상을 경험하고 있을 수 있어요. 무리하면 신체적, 정신적 건강에 심각한 영향을 줄 수 있습니다. 적극적인 회복이 필요합니다.',
    symptoms: ['출근이 너무 싫다', '잠을 자도 피곤하다', '자주 우울하거나 불안하다', '식욕이나 수면 패턴이 불규칙하다'],
    recovery: ['장기 휴가 고려하기', '전문가 상담 강력 권장', '업무 환경 변화 검토', '건강검진 받기'],
    warning: '당신의 건강이 최우선입니다. 일은 대체할 수 있지만, 당신은 대체할 수 없어요.',
    gradient: 'from-red-400 to-rose-500',
  },
  E: {
    type: 'E',
    level: '응급',
    percentage: '81-100%',
    emoji: '⛈️',
    title: '즉각적인 조치 필요',
    description: '지금 당신은 심각한 번아웃 상태입니다. 더 이상 미루지 마세요. 신체적, 정신적 건강이 위험한 수준입니다. 즉시 전문가의 도움을 받고, 충분한 휴식을 취해야 합니다.',
    symptoms: ['아무것도 하고 싶지 않다', '삶의 의미를 모르겠다', '신체 증상(두통, 소화불량 등)이 심하다', '무기력함이 지속된다'],
    recovery: ['즉시 휴직 또는 휴가', '정신건강 전문의 상담 필수', '주변에 현재 상태 알리기', '일단 모든 것을 멈추기'],
    warning: '이 결과가 나왔다면 가볍게 여기지 마세요. 당신을 아끼는 사람에게 지금 바로 연락하세요.',
    gradient: 'from-red-600 to-red-700',
  },
};

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    scores: Record<BurnoutLevel, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '아침에 눈을 떴을 때 기분은?',
    options: [
      { text: '상쾌하고 오늘 할 일이 기대된다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '조금 피곤하지만 괜찮다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '일어나기 싫지만 억지로 일어난다', scores: { A: 0, B: 1, C: 3, D: 1, E: 0 } },
      { text: '출근 생각만 해도 우울하다', scores: { A: 0, B: 0, C: 1, D: 3, E: 2 } },
    ],
  },
  {
    id: 2,
    question: '요즘 업무에 대한 열정은?',
    options: [
      { text: '여전히 재미있고 보람을 느낀다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '예전보다는 줄었지만 나쁘지 않다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '의무감으로 하고 있다', scores: { A: 0, B: 1, C: 3, D: 1, E: 0 } },
      { text: '아무런 감정이 없다, 그냥 한다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 3,
    question: '퇴근 후 주로 어떻게 보내나요?',
    options: [
      { text: '취미활동이나 운동을 즐긴다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '집에서 쉬면서 TV나 유튜브를 본다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '뭘 해야 할지 모르고 멍하게 있다', scores: { A: 0, B: 1, C: 2, D: 3, E: 1 } },
      { text: '아무것도 할 기력이 없다', scores: { A: 0, B: 0, C: 1, D: 1, E: 3 } },
    ],
  },
  {
    id: 4,
    question: '최근 수면 상태는?',
    options: [
      { text: '잘 자고 개운하게 일어난다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '가끔 잠들기 어렵지만 괜찮다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '자도 자도 피곤하다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '불면증이 있거나 악몽을 자주 꾼다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 5,
    question: '업무 중 실수가 생기면?',
    options: [
      { text: '빠르게 해결하고 넘어간다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '좀 신경 쓰이지만 해결한다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '자책감이 오래 간다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '모든 게 내 탓 같아서 괴롭다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 6,
    question: '주말에 주로 어떤 생각을 하나요?',
    options: [
      { text: '무엇을 할지 설레고 기대된다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '푹 쉬면서 재충전한다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '월요일이 다가오는 게 두렵다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '주말이라도 아무것도 하고 싶지 않다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 7,
    question: '사람들과의 관계는 어떤가요?',
    options: [
      { text: '즐겁게 교류하고 에너지를 얻는다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '필요한 만큼만 만나고 있다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '사람 만나는 게 피곤해졌다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '아무도 만나고 싶지 않다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 8,
    question: '신체 상태는 어떤가요?',
    options: [
      { text: '건강하고 컨디션이 좋다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '가끔 피로감을 느끼지만 괜찮다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '두통, 어깨결림 등이 자주 있다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '여러 신체 증상이 지속된다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 9,
    question: '업무량에 대한 느낌은?',
    options: [
      { text: '적당하고 관리 가능하다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '좀 많지만 해낼 수 있다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '벅차고 따라가기 힘들다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '감당이 안 되고 무너질 것 같다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 10,
    question: '자신에 대한 느낌은?',
    options: [
      { text: '나 자신이 자랑스럽다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '나름 괜찮은 사람이다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '내가 뭘 잘하는지 모르겠다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '나는 무능력한 것 같다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 11,
    question: '"쉬어도 되는데"라는 말을 들으면?',
    options: [
      { text: '고마운 마음에 편하게 쉰다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '쉬면 좋겠지만 일단 마무리한다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '쉬어도 죄책감이 든다', scores: { A: 0, B: 1, C: 3, D: 2, E: 0 } },
      { text: '쉬어도 회복이 안 되는 느낌이다', scores: { A: 0, B: 0, C: 1, D: 2, E: 3 } },
    ],
  },
  {
    id: 12,
    question: '요즘 전반적인 기분 상태는?',
    options: [
      { text: '긍정적이고 활력이 있다', scores: { A: 3, B: 1, C: 0, D: 0, E: 0 } },
      { text: '기복이 있지만 대체로 괜찮다', scores: { A: 1, B: 3, C: 1, D: 0, E: 0 } },
      { text: '우울하거나 불안한 날이 많다', scores: { A: 0, B: 1, C: 2, D: 3, E: 1 } },
      { text: '감정이 없고 공허하다', scores: { A: 0, B: 0, C: 0, D: 2, E: 3 } },
    ],
  },
];

function calculateResult(scores: Record<BurnoutLevel, number>): BurnoutLevel {
  const sortedTypes = (Object.entries(scores) as [BurnoutLevel, number][])
    .sort((a, b) => b[1] - a[1]);
  return sortedTypes[0][0];
}

function BurnoutRiskTestContent() {
  const searchParams = useSearchParams();
  const sharedType = searchParams.get('type') as BurnoutLevel | null;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<BurnoutLevel, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [result, setResult] = useState<BurnoutResult | null>(
    sharedType && RESULTS[sharedType] ? RESULTS[sharedType] : null
  );
  const [showFriendResult, setShowFriendResult] = useState(!!sharedType);
  const [isStarted, setIsStarted] = useState(false);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    const question = QUESTIONS[currentQuestion];
    const option = question.options[optionIndex];

    const newScores = { ...scores };
    (Object.keys(option.scores) as BurnoutLevel[]).forEach((type) => {
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
      (Object.keys(prevOption.scores) as BurnoutLevel[]).forEach((type) => {
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
            <p className="text-sm opacity-90 mb-2">친구의 번아웃 위험도</p>
            <div className="text-6xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold">{result.level}</h2>
            <p className="text-sm opacity-80 mt-1">{result.percentage}</p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">{result.description}</p>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-600 mb-4">나의 번아웃 위험도도 확인해볼까요?</p>
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
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-2xl font-bold mb-2">번아웃 위험도 테스트</h1>
            <p className="opacity-90">나의 에너지 레벨은 안전할까?</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-5 gap-2 text-center text-3xl">
              <div className="p-3 bg-green-50 rounded-lg">🌈</div>
              <div className="p-3 bg-yellow-50 rounded-lg">🌤️</div>
              <div className="p-3 bg-orange-50 rounded-lg">🌥️</div>
              <div className="p-3 bg-red-50 rounded-lg">🌧️</div>
              <div className="p-3 bg-red-100 rounded-lg">⛈️</div>
            </div>

            <div className="text-center text-gray-600">
              <p className="mb-2">안전? 주의? 경계? 위험? 응급?</p>
              <p>지금 나의 에너지 상태를 점검해보세요</p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-red-700 text-sm">
                💡 번아웃은 갑자기 오지 않아요.<br />
                작은 신호를 무시하면 큰 위기가 됩니다.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>⏱ 약 2분</span>
              <span className="text-gray-300">|</span>
              <span>📝 12문항</span>
            </div>

            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 transition-opacity"
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
      ? `${window.location.origin}/tests/burnout-risk?type=${result.type}`
      : '';

    const handleShare = async () => {
      const shareText = `나의 번아웃 위험도는 "${result.level}" (${result.percentage})\n\n${shareUrl}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: '번아웃 위험도 테스트', text: shareText, url: shareUrl });
        } catch {
          console.log('Share cancelled');
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('링크가 복사되었습니다!');
      }
    };

    const levelColors: Record<BurnoutLevel, string> = {
      A: 'text-green-600',
      B: 'text-yellow-600',
      C: 'text-orange-600',
      D: 'text-red-500',
      E: 'text-red-700',
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${result.gradient} p-8 text-white text-center`}>
            <p className="text-sm opacity-90 mb-2">나의 번아웃 위험도</p>
            <div className="text-7xl mb-3">{result.emoji}</div>
            <h2 className="text-3xl font-bold mb-1">{result.level}</h2>
            <p className="text-lg opacity-80">{result.percentage}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{result.title}</h3>
              <p className="text-gray-700 leading-relaxed">{result.description}</p>
            </div>

            {/* 번아웃 레벨 게이지 */}
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-green-600">안전</span>
                <span className="text-yellow-600">주의</span>
                <span className="text-orange-600">경계</span>
                <span className="text-red-500">위험</span>
                <span className="text-red-700">응급</span>
              </div>
              <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 via-red-400 to-red-600 rounded-full relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center text-sm"
                  style={{
                    left: `${['A', 'B', 'C', 'D', 'E'].indexOf(result.type) * 25}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  ●
                </div>
              </div>
              <p className={`text-center mt-2 font-medium ${levelColors[result.type]}`}>
                현재 위치: {result.level}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-3">📋 현재 상태 체크리스트</h3>
              <ul className="space-y-1">
                {result.symptoms.map((s, i) => (
                  <li key={i} className="text-blue-700 text-sm">✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-green-800 mb-3">💚 회복을 위한 제안</h3>
              <ul className="space-y-1">
                {result.recovery.map((r, i) => (
                  <li key={i} className="text-green-700 text-sm">• {r}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
              <h3 className="font-bold text-amber-800 mb-2">⚠️ 기억하세요</h3>
              <p className="text-amber-700 text-sm">{result.warning}</p>
            </div>

            {(result.type === 'D' || result.type === 'E') && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h3 className="font-bold text-red-800 mb-2">📞 도움이 필요하시면</h3>
                <p className="text-red-700 text-sm mb-2">
                  • 정신건강 위기상담 전화: 1577-0199<br />
                  • 자살예방 상담전화: 1393<br />
                  • 근로복지공단 EAP: 1588-6497
                </p>
                <p className="text-red-600 text-xs">
                  전문가의 도움을 받는 것은 약함이 아닙니다.
                </p>
              </div>
            )}

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
            className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-300"
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

export default function BurnoutRiskTestPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🔥</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <BurnoutRiskTestContent />
    </Suspense>
  );
}
