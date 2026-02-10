'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// YMOYL 4가지 업무 관련 비용 카테고리
const EXPENSE_CATEGORIES = [
  {
    name: 'Getting Ready (준비)',
    description: '출근 준비에 들어가는 시간과 비용',
    timeExamples: ['옷 고르기', '화장/면도', '머리 손질'],
    costExamples: ['업무용 의류', '미용/이발', '세탁비'],
  },
  {
    name: 'Commuting (통근)',
    description: '출퇴근에 들어가는 시간과 비용',
    timeExamples: ['왕복 출퇴근', '대중교통 대기', '주차'],
    costExamples: ['교통비', '기름값', '주차비', '자동차 유지비'],
  },
  {
    name: 'Extras (추가비용)',
    description: '업무와 관련된 추가 지출',
    timeExamples: ['업무 회식', '네트워킹', '점심 약속'],
    costExamples: ['점심값', '커피', '회식비', '업무용품'],
  },
  {
    name: 'Recovery (회복)',
    description: '일 때문에 필요한 휴식과 스트레스 해소',
    timeExamples: ['퇴근 후 멍때리기', '주말 회복 시간'],
    costExamples: ['스트레스 해소 쇼핑', '술', '배달음식'],
  },
];

// 생명 에너지 변환 예시 (한국 기준)
const LIFE_ENERGY_EXAMPLES = [
  { item: '아메리카노', cost: 4500 },
  { item: '점심 한 끼', cost: 10000 },
  { item: '넷플릭스 1년', cost: 197000 },
  { item: '최신 아이폰', cost: 1500000 },
  { item: '자동차', cost: 30000000 },
  { item: '서울 아파트', cost: 1000000000 },
];

interface WageResult {
  officialHourlyWage: number;
  trueHourlyWage: number;
  difference: number;
  differencePercent: number;
  totalMonthlyHours: number;
  totalWorkRelatedCosts: number;
  netIncome: number;
}

function calculateTrueWage(
  monthlySalary: number,
  weeklyWorkHours: number,
  weeklyOvertimeHours: number,
  dailyCommuteMinutes: number,
  workDaysPerWeek: number,
  lunchCost: number,
  coffeeCost: number,
  clothingCost: number,
  otherCost: number
): WageResult {
  const WEEKS_PER_MONTH = 4.33;

  // 공식 시급 (근무시간만 계산)
  const officialMonthlyHours = weeklyWorkHours * WEEKS_PER_MONTH;
  const officialHourlyWage = monthlySalary / officialMonthlyHours;

  // 실제 투입 시간
  const weeklyCommuteHours = (dailyCommuteMinutes / 60) * workDaysPerWeek;
  const totalWeeklyHours = weeklyWorkHours + weeklyOvertimeHours + weeklyCommuteHours;
  const totalMonthlyHours = totalWeeklyHours * WEEKS_PER_MONTH;

  // 업무 관련 지출
  const monthlyLunchCost = lunchCost * workDaysPerWeek * WEEKS_PER_MONTH;
  const monthlyCoffeeCost = coffeeCost * workDaysPerWeek * WEEKS_PER_MONTH;
  const totalWorkRelatedCosts = monthlyLunchCost + monthlyCoffeeCost + clothingCost + otherCost;

  // 실제 수입
  const netIncome = monthlySalary - totalWorkRelatedCosts;

  // 진짜 시급
  const trueHourlyWage = netIncome / totalMonthlyHours;

  // 차이
  const difference = officialHourlyWage - trueHourlyWage;
  const differencePercent = (difference / officialHourlyWage) * 100;

  return {
    officialHourlyWage,
    trueHourlyWage,
    difference,
    differencePercent,
    totalMonthlyHours,
    totalWorkRelatedCosts,
    netIncome,
  };
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('ko-KR', { maximumFractionDigits: 0 }) + '원';
}

export default function TrueHourlyWagePage() {
  const [monthlySalary, setMonthlySalary] = useState(3000000);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState(40);
  const [weeklyOvertimeHours, setWeeklyOvertimeHours] = useState(5);
  const [dailyCommuteMinutes, setDailyCommuteMinutes] = useState(60);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [lunchCost, setLunchCost] = useState(10000);
  const [coffeeCost, setCoffeeCost] = useState(5000);
  const [clothingCost, setClothingCost] = useState(100000);
  const [otherCost, setOtherCost] = useState(50000);
  const [result, setResult] = useState<WageResult | null>(null);

  const handleCalculate = () => {
    const wageResult = calculateTrueWage(
      monthlySalary,
      weeklyWorkHours,
      weeklyOvertimeHours,
      dailyCommuteMinutes,
      workDaysPerWeek,
      lunchCost,
      coffeeCost,
      clothingCost,
      otherCost
    );
    setResult(wageResult);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="진짜 시급 계산기" description="출퇴근, 야근 포함한 실제 시급을 계산합니다" url="/tools/true-hourly-wage" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">진짜 시급 계산기</h1>
        <p className="text-gray-600">
          출퇴근, 야근, 업무 지출까지 포함한 실제 시급을 계산해요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">기본 정보</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월급 (세후)
            </label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              step={100000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주당 근무시간
              </label>
              <input
                type="number"
                value={weeklyWorkHours}
                onChange={(e) => setWeeklyWorkHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주당 야근시간
              </label>
              <input
                type="number"
                value={weeklyOvertimeHours}
                onChange={(e) => setWeeklyOvertimeHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출퇴근 왕복 (분)
              </label>
              <input
                type="number"
                value={dailyCommuteMinutes}
                onChange={(e) => setDailyCommuteMinutes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주당 근무일
              </label>
              <input
                type="number"
                value={workDaysPerWeek}
                onChange={(e) => setWorkDaysPerWeek(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min={1}
                max={7}
              />
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-4">업무 관련 지출</h3>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                점심값 (일)
              </label>
              <input
                type="number"
                value={lunchCost}
                onChange={(e) => setLunchCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                step={1000}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                커피/간식 (일)
              </label>
              <input
                type="number"
                value={coffeeCost}
                onChange={(e) => setCoffeeCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                step={1000}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                업무용 의류/미용 (월)
              </label>
              <input
                type="number"
                value={clothingCost}
                onChange={(e) => setClothingCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                step={10000}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기타 지출 (월)
              </label>
              <input
                type="number"
                value={otherCost}
                onChange={(e) => setOtherCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                step={10000}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          진짜 시급 계산하기
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">계산 결과</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">공식 시급</p>
                <p className="text-2xl font-bold text-gray-400 line-through">
                  {formatMoney(result.officialHourlyWage)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-green-400">
                <p className="text-sm text-gray-600 mb-1">진짜 시급</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatMoney(result.trueHourlyWage)}
                </p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">시급 차이</span>
                <span className="text-xl font-bold text-red-600">
                  -{formatMoney(result.difference)} ({result.differencePercent.toFixed(1)}% 감소)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>월 실제 투입 시간</span>
                <span className="font-medium">{result.totalMonthlyHours.toFixed(1)}시간</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>월 업무 관련 지출</span>
                <span className="font-medium text-red-600">-{formatMoney(result.totalWorkRelatedCosts)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>실질 월 소득</span>
                <span className="font-medium">{formatMoney(result.netIncome)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">이 시급으로 환산하면...</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                • 10만원짜리 물건 = <strong>{(100000 / result.trueHourlyWage).toFixed(1)}시간</strong> 일해야 함
              </li>
              <li>
                • 5만원짜리 식사 = <strong>{(50000 / result.trueHourlyWage).toFixed(1)}시간</strong> 일해야 함
              </li>
              <li>
                • 커피 한 잔 (5천원) = <strong>{(5000 / result.trueHourlyWage).toFixed(0)}분</strong> 일해야 함
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 핵심 개념 */}
      <div className="mt-8 bg-green-50 rounded-xl border border-green-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">핵심 개념: 돈 = 생명 에너지</h3>
        <blockquote className="border-l-4 border-green-400 pl-4 italic text-gray-700 mb-4">
          &quot;돈이 무엇이든 간에, 한 가지 진실은 모두에게 적용돼요: <strong>돈은 당신의 생명 에너지와 교환하는 것</strong>입니다. 당신은 시간으로 돈을 삽니다. 그리고 그 교환은 생각보다 좋지 않아요.&quot;
        </blockquote>
        <p className="text-sm text-gray-600">
          — &quot;Your Money or Your Life&quot; (Vicki Robin & Joe Dominguez)
        </p>
      </div>

      {/* 4가지 비용 카테고리 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">YMOYL의 4가지 숨겨진 비용</h3>
        <p className="text-sm text-gray-600 mb-4">
          공식 시급에는 이 비용들이 빠져있어요. 진짜 시급을 알려면 모두 고려해야 해요.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat.name} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{cat.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-xs font-medium text-gray-500">시간:</span>
                {cat.timeExamples.map((ex) => (
                  <span key={ex} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    {ex}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs font-medium text-gray-500">비용:</span>
                {cat.costExamples.map((ex) => (
                  <span key={ex} className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 생명 에너지 변환표 */}
      {result && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">당신의 생명 에너지 변환표</h3>
          <p className="text-sm text-gray-600 mb-4">
            진짜 시급 <strong className="text-green-600">{formatMoney(result.trueHourlyWage)}</strong> 기준으로,
            각 항목을 사려면 얼마나 일해야 할까요?
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">항목</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">가격</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">필요 노동시간</th>
                </tr>
              </thead>
              <tbody>
                {LIFE_ENERGY_EXAMPLES.map((item) => {
                  const hours = item.cost / result.trueHourlyWage;
                  let timeDisplay: string;
                  if (hours < 1) {
                    timeDisplay = `${Math.round(hours * 60)}분`;
                  } else if (hours < 24) {
                    timeDisplay = `${hours.toFixed(1)}시간`;
                  } else if (hours < 168) {
                    timeDisplay = `${(hours / 8).toFixed(1)}일 (8시간 기준)`;
                  } else if (hours < 2080) {
                    timeDisplay = `${(hours / 40).toFixed(1)}주`;
                  } else {
                    timeDisplay = `${(hours / 2080).toFixed(1)}년`;
                  }
                  return (
                    <tr key={item.item} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-900">{item.item}</td>
                      <td className="py-2 px-3 text-right text-gray-600">{formatMoney(item.cost)}</td>
                      <td className="py-2 px-3 text-right font-medium text-green-600">{timeDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 활용법 */}
      <div className="mt-6 bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">이렇게 활용해보세요</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>물건을 살 때:</strong> &quot;이 물건은 {result ? `${(50000 / result.trueHourlyWage).toFixed(1)}시간` : 'X시간'} 일해야 살 수 있어. 그만한 가치가 있을까?&quot;
          </p>
          <p>
            <strong>추가 근무할 때:</strong> &quot;야근 1시간 = {result ? formatMoney(result.trueHourlyWage) : 'X원'}의 내 생명 에너지&quot;
          </p>
          <p>
            <strong>이직 고민할 때:</strong> &quot;연봉이 올라도 출퇴근이 1시간 늘면 진짜 시급은?&quot;
          </p>
        </div>
      </div>

      {/* 기본 설명 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">진짜 시급이란?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 1992년 출간된 <strong>&quot;Your Money or Your Life&quot;</strong> 책에서 유명해진 개념이에요</li>
          <li>• 단순 급여 / 근무시간이 아닌, <strong>실제 투입되는 모든 시간과 비용</strong>을 계산해요</li>
          <li>• 출퇴근, 야근, 점심값, 업무 의류, 스트레스 해소 비용까지 포함해요</li>
          <li>• 물건을 살 때 &quot;이거 사려면 몇 시간 일해야 하지?&quot;라고 생각하면 소비 습관이 바뀌어요</li>
          <li>• 직장을 바꿀 때도 연봉뿐 아니라 <strong>진짜 시급</strong>을 비교해보세요</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            참고: &quot;Your Money or Your Life&quot; by Vicki Robin & Joe Dominguez (1992), yourmoneyoryourlife.com
          </p>
        </div>
      </div>
    </div>
  );
}
