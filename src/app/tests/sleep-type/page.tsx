'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터 (크로노타입 기반)
const QUESTIONS = [
  {
    id: 1,
    question: '알람 없이 자연스럽게 일어난다면, 몇 시에 눈이 떠질 것 같아요?',
    options: [
      { text: '새벽 5~6시, 해 뜨기 전후', score: 1 }, // 사자
      { text: '아침 7~8시, 적당히 밝아질 때', score: 2 }, // 곰
      { text: '오전 9~10시 이후, 충분히 자고 싶어', score: 3 }, // 늑대
      { text: '불규칙해서 예측 불가, 잠을 잘 못 자서', score: 4 }, // 돌고래
    ],
  },
  {
    id: 2,
    question: '하루 중 가장 에너지가 넘치고 집중이 잘 되는 시간은?',
    options: [
      { text: '오전 중 (아침~점심 전)', score: 1 },
      { text: '점심 전후 (오전 10시~오후 2시)', score: 2 },
      { text: '저녁~밤 (오후 6시 이후)', score: 3 },
      { text: '일정하지 않음, 컨디션에 따라 다름', score: 4 },
    ],
  },
  {
    id: 3,
    question: '주말 밤, 보통 몇 시에 잠자리에 드나요?',
    options: [
      { text: '밤 10시 전후 (평소랑 비슷)', score: 1 },
      { text: '밤 11시~자정 사이', score: 2 },
      { text: '새벽 1~2시 이후 (주말엔 밤새도 OK)', score: 3 },
      { text: '정해진 시간 없음, 잠이 안 와서 뒤척임', score: 4 },
    ],
  },
  {
    id: 4,
    question: '중요한 시험이나 미팅이 있다면, 언제 준비하는 게 효율적이에요?',
    options: [
      { text: '일찍 일어나서 아침에 준비', score: 1 },
      { text: '평소 시간에 맞춰 차분하게', score: 2 },
      { text: '전날 밤에 집중해서 몰아서', score: 3 },
      { text: '불안해서 며칠 전부터 조금씩', score: 4 },
    ],
  },
  {
    id: 5,
    question: '아침에 일어났을 때 기분은 어때요?',
    options: [
      { text: '상쾌하고 활력이 넘침', score: 1 },
      { text: '괜찮은 편, 커피 한 잔이면 OK', score: 2 },
      { text: '힘들고 피곤함, 오전은 좀비 모드', score: 3 },
      { text: '제대로 못 잔 것 같아 늘 피곤함', score: 4 },
    ],
  },
  {
    id: 6,
    question: '낮잠에 대한 생각은?',
    options: [
      { text: '필요 없음, 밤에 충분히 자서', score: 1 },
      { text: '가끔 20~30분 파워냅은 좋음', score: 2 },
      { text: '낮잠 자면 밤에 더 안 와서 안 잠', score: 3 },
      { text: '낮에 졸려도 잠이 잘 안 옴', score: 4 },
    ],
  },
  {
    id: 7,
    question: '운동을 한다면 언제 하는 게 좋아요?',
    options: [
      { text: '이른 아침 (출근/등교 전)', score: 1 },
      { text: '점심시간 또는 오후', score: 2 },
      { text: '저녁~밤 (퇴근 후)', score: 3 },
      { text: '컨디션 봐서, 일정하지 않음', score: 4 },
    ],
  },
  {
    id: 8,
    question: '카페인(커피, 에너지드링크) 섭취 패턴은?',
    options: [
      { text: '아침에 한 잔이면 충분', score: 1 },
      { text: '오전~오후에 1~2잔', score: 2 },
      { text: '오후~저녁에 필수, 안 마시면 졸림', score: 3 },
      { text: '예민해서 카페인 피하거나, 마셔도 효과 없음', score: 4 },
    ],
  },
  {
    id: 9,
    question: '잠들기까지 보통 얼마나 걸려요?',
    options: [
      { text: '5분 이내, 누우면 바로 잠듦', score: 1 },
      { text: '10~20분 정도', score: 2 },
      { text: '30분 이상, 생각이 많아서', score: 3 },
      { text: '1시간 이상 걸리거나 뒤척이는 경우 많음', score: 4 },
    ],
  },
  {
    id: 10,
    question: '주중과 주말 수면 패턴 차이가 있나요?',
    options: [
      { text: '거의 없음, 규칙적으로 유지', score: 1 },
      { text: '주말에 1~2시간 더 자는 정도', score: 2 },
      { text: '주말엔 완전 다름 (늦게 자고 늦게 일어남)', score: 3 },
      { text: '평일이든 주말이든 수면 질이 안 좋음', score: 4 },
    ],
  },
  {
    id: 11,
    question: '밤에 자다가 깨는 경우가 있나요?',
    options: [
      { text: '거의 없음, 통잠', score: 1 },
      { text: '가끔, 화장실 가고 다시 잠듦', score: 2 },
      { text: '자주 깸, 다시 자는 건 어렵지 않음', score: 3 },
      { text: '자주 깨고, 다시 잠들기 힘듦', score: 4 },
    ],
  },
  {
    id: 12,
    question: '전반적인 수면 만족도는?',
    options: [
      { text: '매우 만족, 잠이 삶의 활력', score: 1 },
      { text: '대체로 만족, 큰 문제 없음', score: 2 },
      { text: '그저 그럼, 더 자고 싶은데 시간이 없음', score: 3 },
      { text: '불만족, 늘 피곤하고 잠이 안 옴', score: 4 },
    ],
  },
];

// 결과 타입
interface ResultType {
  minScore: number;
  maxScore: number;
  type: string;
  animal: string;
  title: string;
  description: string;
  traits: string[];
  schedule: {
    wakeUp: string;
    peakTime: string;
    sleep: string;
  };
  tips: string[];
  famousPeople: string[];
}

// 결과 데이터 (마이클 브레우스 박사 크로노타입 기반)
const RESULTS: ResultType[] = [
  {
    minScore: 12,
    maxScore: 20,
    type: 'lion',
    animal: '사자',
    title: '아침형 리더, 사자형',
    description: '해가 뜨기 전에 일어나 하루를 시작하는 진정한 아침형 인간이에요. 오전에 가장 생산적이고, 중요한 일은 점심 전에 끝내는 게 최고의 전략이에요.',
    traits: ['조기 기상', '오전 집중력 최고', '일찍 자는 편', '규칙적인 생활'],
    schedule: {
      wakeUp: '오전 5:30~6:00',
      peakTime: '오전 8:00~12:00',
      sleep: '밤 9:30~10:00',
    },
    tips: [
      '중요한 업무는 오전에 배치하세요',
      '저녁 약속은 너무 늦지 않게',
      '아침 루틴을 만들어 활용하세요',
      '오후엔 가벼운 업무 위주로',
    ],
    famousPeople: ['팀 쿡 (애플 CEO)', '미셸 오바마', '드웨인 존슨'],
  },
  {
    minScore: 21,
    maxScore: 30,
    type: 'bear',
    animal: '곰',
    title: '균형 잡힌 다수, 곰형',
    description: '전체 인구의 약 50%가 곰형이에요. 해가 뜨면 일어나고 어두워지면 졸려지는 자연스러운 수면 패턴을 가지고 있어요. 사회적 스케줄에 잘 적응해요.',
    traits: ['자연스러운 리듬', '적응력 좋음', '사교적', '안정적인 에너지'],
    schedule: {
      wakeUp: '오전 7:00~8:00',
      peakTime: '오전 10:00~오후 2:00',
      sleep: '밤 11:00~12:00',
    },
    tips: [
      '오전 중반이 집중력 최고 시간',
      '점심 후 슬럼프에 짧은 산책을',
      '규칙적인 수면 시간을 유지하세요',
      '카페인은 오후 2시 전까지만',
    ],
    famousPeople: ['스티븐 킹 (작가)', '엘렌 드제너러스'],
  },
  {
    minScore: 31,
    maxScore: 40,
    type: 'wolf',
    animal: '늑대',
    title: '창의적 밤형, 늑대형',
    description: '밤에 창의력이 폭발하는 진정한 야행성이에요. 아침은 좀비 모드지만, 해가 지면 에너지가 솟아나요. 창의적인 분야에서 두각을 나타내는 경우가 많아요.',
    traits: ['야행성', '창의적', '아침에 느림', '밤에 생산적'],
    schedule: {
      wakeUp: '오전 8:30~9:30',
      peakTime: '오후 5:00~밤 12:00',
      sleep: '새벽 12:00~1:00',
    },
    tips: [
      '중요 업무는 오후 늦게 배치하세요',
      '아침 미팅은 피할 수 있으면 피하기',
      '밤 창의력을 활용한 취미를 가져보세요',
      '수면 부족 누적에 주의하세요',
    ],
    famousPeople: ['빌 게이츠', '마크 저커버그', '오바마 전 대통령'],
  },
  {
    minScore: 41,
    maxScore: 48,
    type: 'dolphin',
    animal: '돌고래',
    title: '예민한 수면가, 돌고래형',
    description: '잠들기 어렵고 쉽게 깨는, 수면이 까다로운 유형이에요. 완벽주의 성향이 있고 불안을 느끼기 쉬워요. 전체 인구의 10% 정도로 가장 희귀해요.',
    traits: ['가벼운 수면', '예민함', '완벽주의', '불규칙한 패턴'],
    schedule: {
      wakeUp: '오전 6:30 (힘들게)',
      peakTime: '오전 10:00~12:00 (불규칙)',
      sleep: '밤 11:30 (잠들기까지 오래 걸림)',
    },
    tips: [
      '취침 1시간 전 전자기기 OFF',
      '카페인은 오전에만, 가능하면 피하기',
      '규칙적인 수면 루틴이 특히 중요해요',
      '명상이나 호흡 운동을 시도해보세요',
    ],
    famousPeople: ['찰스 다윈', '토마스 에디슨', '마가렛 대처'],
  },
];

// 결과 계산
function getResult(totalScore: number): ResultType {
  return RESULTS.find(r => totalScore >= r.minScore && totalScore <= r.maxScore) || RESULTS[1];
}

// 동물 아이콘 색상
const ANIMAL_COLORS: Record<string, { from: string; to: string; bg: string }> = {
  lion: { from: 'from-amber-400', to: 'to-orange-500', bg: 'bg-amber-50' },
  bear: { from: 'from-emerald-400', to: 'to-teal-500', bg: 'bg-emerald-50' },
  wolf: { from: 'from-indigo-400', to: 'to-purple-500', bg: 'bg-indigo-50' },
  dolphin: { from: 'from-cyan-400', to: 'to-blue-500', bg: 'bg-cyan-50' },
};

// 테스트 상태
type TestState = 'intro' | 'question' | 'result';

function SleepTypeTestContent() {
  const searchParams = useSearchParams();

  // URL 파라미터에서 점수 확인
  const scoreParam = searchParams.get('score');
  const initialSharedScore = scoreParam ? parseInt(scoreParam, 10) : null;
  const isValidSharedScore = initialSharedScore !== null && !isNaN(initialSharedScore) && initialSharedScore >= 12 && initialSharedScore <= 48;

  const [state, setState] = useState<TestState>(isValidSharedScore ? 'result' : 'intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sharedScore, setSharedScore] = useState<number | null>(isValidSharedScore ? initialSharedScore : null);

  // 테스트 시작
  const startTest = useCallback(() => {
    setState('question');
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
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
    if (typeof window !== 'undefined' && sharedScore !== null) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setState('intro');
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    setSharedScore(null);
  }, [sharedScore]);

  // 총점 계산
  const calculateTotalScore = useCallback(() => {
    return selectedAnswers.reduce((sum, answerIndex, qIndex) => {
      return sum + QUESTIONS[qIndex].options[answerIndex].score;
    }, 0);
  }, [selectedAnswers]);

  // 공유하기
  const shareResult = useCallback(async () => {
    const currentScore = sharedScore ?? calculateTotalScore();
    const result = getResult(currentScore);
    const shareText = `나의 수면 유형은 "${result.animal}형"! ${result.title}\n\n당신의 수면 유형은?\n`;

    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
    const shareUrl = `${baseUrl}?score=${currentScore}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '수면 유형 테스트 결과',
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
  }, [calculateTotalScore, sharedScore]);

  // 진행률
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const totalScore = sharedScore ?? calculateTotalScore();
  const result = state === 'result' ? getResult(totalScore) : null;
  const isSharedResult = sharedScore !== null;
  const colors = result ? ANIMAL_COLORS[result.type] : ANIMAL_COLORS.bear;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50">
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                수면
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                수면 유형 테스트
              </h1>
              <p className="text-gray-600 text-lg">
                나는 사자형? 곰형? 늑대형? 돌고래형?
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
                <span>약 2분</span>
                <span className="text-gray-300">|</span>
                <span>{QUESTIONS.length}문항</span>
              </div>

              {/* 4가지 유형 미리보기 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🦁</div>
                  <div className="text-xs font-medium text-amber-700">사자형</div>
                  <div className="text-xs text-amber-600">아침형 리더</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🐻</div>
                  <div className="text-xs font-medium text-emerald-700">곰형</div>
                  <div className="text-xs text-emerald-600">균형 잡힌 다수</div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🐺</div>
                  <div className="text-xs font-medium text-indigo-700">늑대형</div>
                  <div className="text-xs text-indigo-600">창의적 밤형</div>
                </div>
                <div className="bg-cyan-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🐬</div>
                  <div className="text-xs font-medium text-cyan-700">돌고래형</div>
                  <div className="text-xs text-cyan-600">예민한 수면가</div>
                </div>
              </div>

              <p className="text-gray-600 mb-6 text-sm">
                마이클 브레우스 박사의<br />
                크로노타입(Chronotype) 이론 기반
              </p>

              <button
                onClick={startTest}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg font-bold rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                테스트 시작하기
              </button>
            </div>

            <p className="text-xs text-gray-400">
              * 수면 전문의 마이클 브레우스 박사의 크로노타입 분류를 참고했습니다.
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
              <p className="text-gray-500 mb-4">{isSharedResult ? '친구의 수면 유형은' : '당신의 수면 유형은'}</p>

              {/* 동물 아이콘 */}
              <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-white text-5xl shadow-lg`}>
                {result.type === 'lion' && '🦁'}
                {result.type === 'bear' && '🐻'}
                {result.type === 'wolf' && '🐺'}
                {result.type === 'dolphin' && '🐬'}
              </div>

              <h2 className={`text-3xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent mb-2`}>
                {result.animal}형
              </h2>

              <p className="text-xl font-medium text-gray-800 mb-6">
                {result.title}
              </p>

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
                    className={`px-3 py-1 ${colors.bg} text-gray-700 rounded-full text-sm`}
                  >
                    #{trait}
                  </span>
                ))}
              </div>

              {/* 최적 스케줄 */}
              <div className={`${colors.bg} rounded-xl p-4 mb-6 text-left`}>
                <p className="text-sm font-medium text-gray-700 mb-3">⏰ 최적의 하루 스케줄</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>기상 시간</span>
                    <span className="font-medium">{result.schedule.wakeUp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>집중력 피크</span>
                    <span className="font-medium">{result.schedule.peakTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>취침 시간</span>
                    <span className="font-medium">{result.schedule.sleep}</span>
                  </div>
                </div>
              </div>

              {/* 수면 팁 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">💡 {result.animal}형을 위한 팁</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 유명인 */}
              <div className="text-sm text-gray-500 mb-4">
                <span className="font-medium">같은 유형의 유명인:</span>
                <br />
                {result.famousPeople.join(', ')}
              </div>
            </div>

            {/* 수면 계산기 연결 */}
            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                🌙 나에게 맞는 수면 시간이 궁금하다면?
              </p>
              <Link
                href="/tools/sleep-calculator"
                className="inline-block px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg text-sm hover:bg-indigo-50 transition-colors"
              >
                수면 사이클 계산기 →
              </Link>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              {isSharedResult ? (
                <>
                  <button
                    onClick={restart}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg font-bold rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all"
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
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-lg font-bold rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all"
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

            {/* 점수 표시 */}
            <p className="mt-6 text-xs text-gray-400">
              총점: {totalScore}점 / {QUESTIONS.length * 4}점
            </p>
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
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
          수면
        </div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

// Suspense 래퍼
export default function SleepTypeTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SleepTypeTestContent />
    </Suspense>
  );
}
