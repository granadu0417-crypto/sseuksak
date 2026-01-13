'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: '주말 아침, 알람 없이 눈이 떠졌어요. 가장 먼저 하는 행동은?',
    options: [
      { text: '바로 스마트폰 들여다보기', score: 1 },
      { text: '좀 더 뒹굴거리다 일어나기', score: 2 },
      { text: '일어나서 커피부터 내리기', score: 3 },
      { text: '오늘 할 일 생각하며 계획 세우기', score: 4 },
    ],
  },
  {
    id: 2,
    question: '친구가 새로운 맛집을 추천해줬어요. 당신의 반응은?',
    options: [
      { text: '바로 예약하고 리뷰 폭풍 검색', score: 1 },
      { text: '일단 인스타 검색해서 분위기 체크', score: 2 },
      { text: '가격대랑 위치 먼저 확인', score: 3 },
      { text: '그냥 가던 집이 편한데...', score: 4 },
    ],
  },
  {
    id: 3,
    question: '처음 보는 키오스크 앞에 섰어요. 당신의 행동은?',
    options: [
      { text: '일단 이것저것 눌러보기', score: 1 },
      { text: '화면 안내 따라 차근차근 주문', score: 2 },
      { text: '잠깐 관찰 후 주문 시작', score: 3 },
      { text: '직원 호출 버튼 찾기', score: 4 },
    ],
  },
  {
    id: 4,
    question: '갑자기 비가 와서 카페에 들어갔어요. 뭘 하며 시간을 보낼까요?',
    options: [
      { text: '틱톡이나 릴스 무한스크롤', score: 1 },
      { text: '친구한테 카톡하거나 SNS 구경', score: 2 },
      { text: '밀린 뉴스나 기사 읽기', score: 3 },
      { text: '그냥 창밖 비 구경하며 생각 정리', score: 4 },
    ],
  },
  {
    id: 5,
    question: '누군가 "요즘 뭐가 유행이야?"라고 물어봤어요.',
    options: [
      { text: '최신 밈이나 챌린지 설명 가능', score: 1 },
      { text: '대충 알지만 직접 하진 않음', score: 2 },
      { text: '무슨 말인지 검색해봐야 알 것 같음', score: 3 },
      { text: '유행은 잘 모르고 관심도 없음', score: 4 },
    ],
  },
  {
    id: 6,
    question: '갑자기 30분의 자유시간이 생겼어요!',
    options: [
      { text: '유튜브 쇼츠나 게임', score: 1 },
      { text: 'SNS 둘러보기', score: 2 },
      { text: '잠깐 낮잠 또는 멍 때리기', score: 3 },
      { text: '밀린 집안일 하나 해치우기', score: 4 },
    ],
  },
  {
    id: 7,
    question: '친구들과 여행 계획을 세워요. 당신의 역할은?',
    options: [
      { text: '핫플 검색하고 인스타 감성 장소 추천', score: 1 },
      { text: '숙소랑 교통편 비교 검색', score: 2 },
      { text: '예산 관리 및 일정 조율', score: 3 },
      { text: '다른 사람이 정해주면 따라감', score: 4 },
    ],
  },
  {
    id: 8,
    question: '스트레스 받을 때 푸는 방법은?',
    options: [
      { text: '신나는 음악 틀고 춤추거나 노래', score: 1 },
      { text: '친구 만나서 수다 떨기', score: 2 },
      { text: '혼자 산책하거나 운동', score: 3 },
      { text: '그냥 집에서 조용히 쉬기', score: 4 },
    ],
  },
  {
    id: 9,
    question: '평소 잠드는 시간은 언제인가요?',
    options: [
      { text: '새벽 2시 이후 (밤은 나의 세상)', score: 1 },
      { text: '자정~새벽 1시쯤', score: 2 },
      { text: '밤 11시~자정 사이', score: 3 },
      { text: '밤 10시 전후 (일찍 자야 건강)', score: 4 },
    ],
  },
  {
    id: 10,
    question: '새해 목표를 세운다면?',
    options: [
      { text: '거창하게 세우고 작심삼일', score: 1 },
      { text: '현실적으로 세우고 반 정도 달성', score: 2 },
      { text: '꼭 지킬 것만 몇 개 정해서 실천', score: 3 },
      { text: '굳이 목표 안 세움, 그때그때 살아감', score: 4 },
    ],
  },
  {
    id: 11,
    question: '이성에게 호감을 표현하는 방식은?',
    options: [
      { text: 'DM이나 메시지로 적극 어필', score: 1 },
      { text: '자주 연락하고 만남 제안', score: 2 },
      { text: '은근히 티 내면서 반응 살피기', score: 3 },
      { text: '그냥 가만히 있음, 인연이면 되겠지', score: 4 },
    ],
  },
  {
    id: 12,
    question: '10년 뒤 나의 모습을 상상하면?',
    options: [
      { text: '아직 모르겠고 일단 지금이 중요', score: 1 },
      { text: '대충 방향은 있지만 구체적이진 않음', score: 2 },
      { text: '어느 정도 계획이 있고 준비 중', score: 3 },
      { text: '지금 잘 살고 있으니 크게 안 바뀔 듯', score: 4 },
    ],
  },
];

// 결과 타입
interface ResultType {
  minScore: number;
  maxScore: number;
  age: string;
  title: string;
  description: string;
  traits: string[];
  advice: string;
}

// 결과 데이터
const RESULTS: ResultType[] = [
  {
    minScore: 12,
    maxScore: 18,
    age: '10대',
    title: '청춘 만개! 열정 가득 10대',
    description: '트렌드에 민감하고 새로운 것에 대한 호기심이 넘쳐요. 에너지가 넘치고 뭐든 일단 해보는 성격이에요.',
    traits: ['호기심 왕', '트렌드 민감', 'YOLO 정신', '밤샘 가능'],
    advice: '열정은 좋지만 가끔은 속도 조절도 필요해요!',
  },
  {
    minScore: 19,
    maxScore: 26,
    age: '20대',
    title: '뭐든 할 수 있는 20대',
    description: '도전적이고 활동적인 에너지를 가지고 있어요. 새로운 경험을 즐기면서도 현실적인 면도 있어요.',
    traits: ['도전 정신', '균형 감각', '적응력', '성장 욕구'],
    advice: '지금의 열정을 잘 방향 잡으면 큰 성과를 이룰 수 있어요!',
  },
  {
    minScore: 27,
    maxScore: 36,
    age: '30대',
    title: '안정과 재미 사이, 30대',
    description: '경험에서 우러나온 여유가 있어요. 효율을 중시하고 불필요한 에너지 낭비를 싫어해요.',
    traits: ['효율 추구', '경험치', '선택적 관심', '실용주의'],
    advice: '가끔은 비효율적인 즐거움도 필요해요!',
  },
  {
    minScore: 37,
    maxScore: 42,
    age: '40대',
    title: '인생의 여유를 아는 40대',
    description: '본질을 추구하고 검증된 것을 선호해요. 유행보다 자신만의 기준이 확실해요.',
    traits: ['본질 추구', '확고한 기준', '편안함 선호', '경험의 지혜'],
    advice: '새로운 것에 마음을 열어보면 또 다른 재미를 발견할 수 있어요!',
  },
  {
    minScore: 43,
    maxScore: 48,
    age: '50대 이상',
    title: '삶의 철학이 있는 50대+',
    description: '급하지 않고 여유로워요. 오래된 것의 가치를 알고, 자신만의 페이스를 지켜요.',
    traits: ['여유로움', '자기 페이스', '깊은 사고', '단순함 추구'],
    advice: '젊은 세대의 문화에도 관심을 가져보면 재미있는 발견이 있을 거예요!',
  },
];

// 결과 계산
function getResult(totalScore: number): ResultType {
  return RESULTS.find(r => totalScore >= r.minScore && totalScore <= r.maxScore) || RESULTS[2];
}

// 테스트 상태
type TestState = 'intro' | 'question' | 'result';

function MentalAgeTestContent() {
  const searchParams = useSearchParams();

  // URL 파라미터에서 점수 확인
  const scoreParam = searchParams.get('score');
  const initialSharedScore = scoreParam ? parseInt(scoreParam, 10) : null;
  const isValidSharedScore = initialSharedScore !== null && !isNaN(initialSharedScore) && initialSharedScore >= 12 && initialSharedScore <= 48;

  const [state, setState] = useState<TestState>(isValidSharedScore ? 'result' : 'intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // 각 질문의 선택된 옵션 인덱스를 저장
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
      // 이미 답변한 질문이면 교체, 아니면 추가
      const newSelectedAnswers = [...selectedAnswers];
      if (currentQuestion < newSelectedAnswers.length) {
        newSelectedAnswers[currentQuestion] = index;
      } else {
        newSelectedAnswers.push(index);
      }
      setSelectedAnswers(newSelectedAnswers);

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        // 다음 질문에 이미 답변이 있으면 그것을 선택 상태로
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
      // 이전 질문의 답변을 선택 상태로 복원
      setSelectedOption(selectedAnswers[prevQuestion] ?? null);
    }
  }, [currentQuestion, selectedAnswers, isAnimating]);

  // 다시 하기
  const restart = useCallback(() => {
    // URL에서 score 파라미터 제거
    if (typeof window !== 'undefined' && sharedScore !== null) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setState('intro');
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    setSharedScore(null);
  }, [sharedScore]);

  // 선택된 답변에서 총점 계산
  const calculateTotalScore = useCallback(() => {
    return selectedAnswers.reduce((sum, answerIndex, qIndex) => {
      return sum + QUESTIONS[qIndex].options[answerIndex].score;
    }, 0);
  }, [selectedAnswers]);

  // 공유하기
  const shareResult = useCallback(async () => {
    const currentScore = sharedScore ?? calculateTotalScore();
    const result = getResult(currentScore);
    const shareText = `나의 정신연령은 ${result.age}! ${result.title}\n\n당신의 정신연령은?\n`;

    // 결과 점수를 URL에 포함
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';
    const shareUrl = `${baseUrl}?score=${currentScore}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '정신연령 테스트 결과',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // 공유 취소됨
      }
    } else {
      // 클립보드 복사
      await navigator.clipboard.writeText(shareText + shareUrl);
      alert('링크가 복사되었습니다!');
    }
  }, [calculateTotalScore, sharedScore]);

  // 진행률
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const totalScore = sharedScore ?? calculateTotalScore();
  const result = state === 'result' ? getResult(totalScore) : null;
  const isSharedResult = sharedScore !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 헤더 */}
        <nav className="mb-6">
          <Link href="/tests" className="text-purple-600 hover:text-purple-800 text-sm">
            ← 테스트 목록으로
          </Link>
        </nav>

        {/* 인트로 화면 */}
        {state === 'intro' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                정신
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                정신연령 테스트
              </h1>
              <p className="text-gray-600 text-lg">
                실제 나이와 다른 나의 정신연령은?
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
                <span>약 2분</span>
                <span className="text-gray-300">|</span>
                <span>{QUESTIONS.length}문항</span>
              </div>

              <p className="text-gray-600 mb-6">
                12개의 질문에 답하면<br />
                당신의 정신연령을 알려드려요!
              </p>

              <button
                onClick={startTest}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                테스트 시작하기
              </button>
            </div>

            <p className="text-xs text-gray-400">
              * 재미로 보는 테스트입니다. 실제 연령과 무관합니다.
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
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
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
                        ? 'border-purple-500 bg-purple-50 scale-[0.98]'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
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
                className="w-full py-3 text-gray-500 hover:text-purple-600 text-sm font-medium transition-colors disabled:opacity-50"
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
              <div className="bg-purple-100 text-purple-700 rounded-xl px-4 py-3 mb-4 text-sm">
                친구의 테스트 결과예요!
              </div>
            )}

            {/* 결과 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <p className="text-gray-500 mb-4">{isSharedResult ? '친구의 정신연령은' : '당신의 정신연령은'}</p>

              <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {result.age}
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
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    #{trait}
                  </span>
                ))}
              </div>

              {/* 조언 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-left border border-purple-100">
                <p className="text-sm font-medium text-purple-600 mb-1">한마디</p>
                <p className="text-gray-700">{result.advice}</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              {isSharedResult ? (
                <>
                  <button
                    onClick={restart}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    나도 테스트하기
                  </button>
                  <button
                    onClick={shareResult}
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    이 결과 공유하기
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={shareResult}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    결과 공유하기
                  </button>
                  <button
                    onClick={restart}
                    className="w-full py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    다시 하기
                  </button>
                </>
              )}
            </div>

            {/* 점수 표시 (작게) */}
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
          정신
        </div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

// Suspense 래퍼
export default function MentalAgeTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MentalAgeTestContent />
    </Suspense>
  );
}
