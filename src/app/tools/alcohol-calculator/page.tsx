'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 위드마크 공식 상수
const WIDMARK_FACTOR = {
  male: 0.68,
  female: 0.55,
};

// 알코올 분해 속도 (시간당 BAC 감소율)
const ELIMINATION_RATE = 0.015;

// 한국 음주운전 기준
const BAC_LIMITS = {
  safe: 0.03, // 면허정지 기준
  criminal: 0.08, // 형사처벌 기준
};

// 주류 정보
const DRINKS = [
  { id: 'soju-glass', name: '소주 1잔', ml: 50, abv: 17 },
  { id: 'soju-bottle', name: '소주 1병', ml: 360, abv: 17 },
  { id: 'beer-glass', name: '맥주 1잔', ml: 350, abv: 5 },
  { id: 'beer-500', name: '맥주 500ml', ml: 500, abv: 5 },
  { id: 'makgeolli', name: '막걸리 1사발', ml: 300, abv: 6 },
  { id: 'wine', name: '와인 1잔', ml: 150, abv: 13 },
  { id: 'whiskey', name: '위스키 1잔', ml: 45, abv: 40 },
  { id: 'highball', name: '하이볼 1잔', ml: 350, abv: 8 },
];

// 순수 알코올 그램 계산
function calculateAlcoholGrams(ml: number, abv: number): number {
  return ml * (abv / 100) * 0.789;
}

// 혈중 알코올 농도 계산 (위드마크 공식)
function calculateBAC(
  alcoholGrams: number,
  weightKg: number,
  gender: 'male' | 'female',
  hoursElapsed: number
): number {
  const r = WIDMARK_FACTOR[gender];
  const bac = (alcoholGrams / (weightKg * 1000 * r)) * 100 - ELIMINATION_RATE * hoursElapsed;
  return Math.max(0, bac);
}

// 특정 BAC까지 걸리는 시간 계산
function calculateTimeToBAC(
  currentBAC: number,
  targetBAC: number
): number {
  if (currentBAC <= targetBAC) return 0;
  return (currentBAC - targetBAC) / ELIMINATION_RATE;
}

// 결과 타입
interface CalculationResult {
  currentBAC: number;
  timeToSafe: number;
  timeToZero: number;
  timeline: { time: number; bac: number }[];
}

export default function AlcoholCalculatorPage() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('70'); // string으로 변경하여 빈 값 허용
  const [selectedDrinks, setSelectedDrinks] = useState<{ id: string; count: number }[]>([]);
  const [hoursElapsed, setHoursElapsed] = useState(0);
  const [customDrink, setCustomDrink] = useState({ ml: 0, abv: 0, count: 0 });
  const [result, setResult] = useState<CalculationResult | null>(null); // 계산 결과 상태

  // 계산 실행 함수
  const handleCalculate = () => {
    const weightNum = Number(weight) || 70; // 빈 값이면 기본값 70

    // 총 알코올 그램 계산
    let totalAlcoholGrams = 0;

    // 선택된 음료
    selectedDrinks.forEach((selected) => {
      const drink = DRINKS.find((d) => d.id === selected.id);
      if (drink) {
        totalAlcoholGrams += calculateAlcoholGrams(drink.ml, drink.abv) * selected.count;
      }
    });

    // 커스텀 음료
    if (customDrink.ml > 0 && customDrink.abv > 0 && customDrink.count > 0) {
      totalAlcoholGrams += calculateAlcoholGrams(customDrink.ml, customDrink.abv) * customDrink.count;
    }

    // BAC 계산
    const currentBAC = calculateBAC(totalAlcoholGrams, weightNum, gender, hoursElapsed);
    const timeToSafe = calculateTimeToBAC(currentBAC, BAC_LIMITS.safe);
    const timeToZero = calculateTimeToBAC(currentBAC, 0);

    // 타임라인 생성
    const timeline: { time: number; bac: number }[] = [];
    if (currentBAC > 0) {
      let time = 0;
      let bac = currentBAC;
      while (bac > 0 && time <= 24) {
        timeline.push({ time, bac });
        time += 0.5;
        bac = Math.max(0, currentBAC - ELIMINATION_RATE * time);
      }
      timeline.push({ time, bac: 0 });
    }

    setResult({ currentBAC, timeToSafe, timeToZero, timeline });
  };

  // 입력 변경 시 결과 초기화
  const resetResult = () => {
    setResult(null);
  };

  // 음료 추가/제거
  const updateDrinkCount = (drinkId: string, delta: number) => {
    resetResult(); // 입력 변경 시 결과 초기화
    setSelectedDrinks((prev) => {
      const existing = prev.find((d) => d.id === drinkId);
      if (existing) {
        const newCount = Math.max(0, existing.count + delta);
        if (newCount === 0) {
          return prev.filter((d) => d.id !== drinkId);
        }
        return prev.map((d) => (d.id === drinkId ? { ...d, count: newCount } : d));
      } else if (delta > 0) {
        return [...prev, { id: drinkId, count: 1 }];
      }
      return prev;
    });
  };

  const getDrinkCount = (drinkId: string): number => {
    return selectedDrinks.find((d) => d.id === drinkId)?.count || 0;
  };

  // 시간 포맷팅
  const formatTime = (hours: number): string => {
    if (hours === 0) return '지금 바로';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}분`;
    if (m === 0) return `${h}시간`;
    return `${h}시간 ${m}분`;
  };

  // 예상 시각 계산
  const getExpectedTime = (hoursFromNow: number): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + hoursFromNow * 60);
    return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // BAC 상태 판정
  const getBACStatus = (bac: number) => {
    if (bac === 0) return { level: 'safe', text: '정상', color: 'text-green-600', bg: 'bg-green-50' };
    if (bac < BAC_LIMITS.safe) return { level: 'caution', text: '주의', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (bac < BAC_LIMITS.criminal) return { level: 'warning', text: '면허정지', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'danger', text: '형사처벌', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // 총 음료 수량 계산
  const totalDrinkCount = selectedDrinks.reduce((sum, d) => sum + d.count, 0) +
    (customDrink.ml > 0 && customDrink.abv > 0 ? customDrink.count : 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ToolJsonLd name="알코올 분해 시간 계산기" description="음주 후 알코올 분해에 걸리는 시간을 계산합니다" url="/tools/alcohol-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:text-blue-800 text-sm">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">알코올 분해 시간 계산기</h1>
        <p className="text-gray-600">위드마크 공식으로 혈중 알코올 농도와 분해 시간을 계산해요</p>
      </div>

      {/* 경고 메시지 */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-800 text-sm font-medium">
          이 계산기는 참고용입니다. 개인차가 있으므로 음주 후에는 절대 운전하지 마세요.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 입력 섹션 */}
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">기본 정보</h3>

            <div className="space-y-4">
              {/* 성별 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">성별</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setGender('male'); resetResult(); }}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      gender === 'male'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    남성
                  </button>
                  <button
                    onClick={() => { setGender('female'); resetResult(); }}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      gender === 'female'
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300'
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>

              {/* 체중 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); resetResult(); }}
                  onBlur={() => { if (!weight || Number(weight) < 30) setWeight('70'); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={30}
                  max={200}
                  placeholder="70"
                />
              </div>

              {/* 음주 후 경과 시간 */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  음주 후 경과 시간: <span className="font-semibold">{hoursElapsed}시간</span>
                </label>
                <input
                  type="range"
                  value={hoursElapsed}
                  onChange={(e) => { setHoursElapsed(Number(e.target.value)); resetResult(); }}
                  className="w-full"
                  min={0}
                  max={12}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>방금 전</span>
                  <span>12시간</span>
                </div>
              </div>
            </div>
          </div>

          {/* 음주량 입력 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">음주량</h3>

            <div className="grid grid-cols-2 gap-3">
              {DRINKS.map((drink) => {
                const count = getDrinkCount(drink.id);
                return (
                  <div
                    key={drink.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      count > 0
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="text-center mb-2">
                      <p className="text-sm text-gray-700 font-medium">{drink.name}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateDrinkCount(drink.id, -1)}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                        disabled={count === 0}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold">{count}</span>
                      <button
                        onClick={() => updateDrinkCount(drink.id, 1)}
                        className="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 직접 입력 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">직접 입력</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">용량(ml)</label>
                  <input
                    type="number"
                    value={customDrink.ml || ''}
                    onChange={(e) => { setCustomDrink((prev) => ({ ...prev, ml: Number(e.target.value) })); resetResult(); }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">도수(%)</label>
                  <input
                    type="number"
                    value={customDrink.abv || ''}
                    onChange={(e) => { setCustomDrink((prev) => ({ ...prev, abv: Number(e.target.value) })); resetResult(); }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수량</label>
                  <input
                    type="number"
                    value={customDrink.count || ''}
                    onChange={(e) => { setCustomDrink((prev) => ({ ...prev, count: Number(e.target.value) })); resetResult(); }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 계산하기 버튼 */}
          <button
            onClick={handleCalculate}
            disabled={totalDrinkCount === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              totalDrinkCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {totalDrinkCount > 0 ? '계산하기' : '음주량을 입력하세요'}
          </button>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-6">
          {/* BAC 결과 - 계산 전 */}
          {!result && (
            <div className="rounded-xl border p-6 bg-gray-50 border-gray-200">
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">음주량을 입력하고</p>
                <p className="text-gray-500 text-lg">계산하기 버튼을 눌러주세요</p>
              </div>
            </div>
          )}

          {/* BAC 결과 - 계산 후 */}
          {result && (() => {
            const bacStatus = getBACStatus(result.currentBAC);
            return (
              <div className={`rounded-xl border p-6 ${bacStatus.bg} border-gray-200`}>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">현재 추정 혈중 알코올 농도</p>
                  <p className={`text-5xl font-bold ${bacStatus.color}`}>
                    {result.currentBAC.toFixed(3)}%
                  </p>
                  <p className={`mt-2 text-lg font-semibold ${bacStatus.color}`}>
                    {bacStatus.text}
                  </p>
                </div>

                {result.currentBAC > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-gray-600">운전 가능 (0.03% 미만)</span>
                      <span className="font-semibold">
                        {result.timeToSafe > 0 ? (
                          <>
                            {formatTime(result.timeToSafe)} 후
                            <span className="text-xs text-gray-500 ml-1">
                              ({getExpectedTime(result.timeToSafe)})
                            </span>
                          </>
                        ) : (
                          <span className="text-green-600">가능</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-gray-600">완전 분해 (0%)</span>
                      <span className="font-semibold">
                        {formatTime(result.timeToZero)} 후
                        <span className="text-xs text-gray-500 ml-1">
                          ({getExpectedTime(result.timeToZero)})
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 타임라인 */}
          {result && result.currentBAC > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">시간별 예상 혈중 알코올 농도</h3>

              <div className="relative h-40 mb-4">
                {/* Y축 기준선 */}
                <div className="absolute left-0 right-0 bottom-[30%] border-t border-dashed border-orange-300">
                  <span className="absolute -left-1 -top-3 text-xs text-orange-500">0.08%</span>
                </div>
                <div className="absolute left-0 right-0 bottom-[15%] border-t border-dashed border-yellow-400">
                  <span className="absolute -left-1 -top-3 text-xs text-yellow-600">0.03%</span>
                </div>

                {/* 그래프 바 */}
                <div className="absolute inset-0 flex items-end gap-1">
                  {result.timeline.slice(0, 16).map((point, index) => {
                    const height = Math.min(100, (point.bac / Math.max(result.currentBAC, 0.1)) * 100);
                    const getBarColor = () => {
                      if (point.bac >= BAC_LIMITS.criminal) return 'bg-red-500';
                      if (point.bac >= BAC_LIMITS.safe) return 'bg-orange-400';
                      if (point.bac > 0) return 'bg-yellow-400';
                      return 'bg-green-400';
                    };
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className={`w-full rounded-t ${getBarColor()} transition-all`}
                          style={{ height: `${height}%` }}
                        />
                        {index % 2 === 0 && (
                          <span className="text-xs text-gray-400 mt-1">
                            {point.time}h
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 법적 기준 안내 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">음주운전 처벌 기준</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-500 font-bold">0.03%</span>
                <div>
                  <p className="font-medium text-gray-900">면허정지</p>
                  <p className="text-xs text-gray-600">100일 면허정지 + 벌점 100점</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-500 font-bold">0.08%</span>
                <div>
                  <p className="font-medium text-gray-900">면허취소 + 형사처벌</p>
                  <p className="text-xs text-gray-600">1년 이하 징역 또는 500만원 이하 벌금</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-red-500 font-bold">0.2%+</span>
                <div>
                  <p className="font-medium text-gray-900">가중처벌</p>
                  <p className="text-xs text-gray-600">2년 이상 5년 이하 징역 또는 1천~2천만원 벌금</p>
                </div>
              </div>
            </div>
          </div>

          {/* 참고사항 */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">참고사항</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>* 위드마크 공식 기반 추정치로, 실제 수치와 차이가 있을 수 있습니다.</li>
              <li>* 공복/식사 여부, 체질, 컨디션에 따라 분해 속도가 달라집니다.</li>
              <li>* 숙취해소제, 커피, 사우나는 알코올 분해에 도움이 되지 않습니다.</li>
              <li>* 음주 후에는 반드시 대리운전이나 대중교통을 이용하세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
