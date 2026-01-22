'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type CalculationMode = 'hourly_to_monthly' | 'monthly_to_hourly' | 'yearly_to_hourly';

const MINIMUM_WAGE_2026 = 10030; // 2026년 최저시급
const WEEKS_PER_MONTH = 4.345; // 월 평균 주수

interface CalculationResult {
  hourlyWage: number;
  monthlyWage: number;
  yearlyWage: number;
  weeklyHolidayPay: number;
  monthlyWithHolidayPay: number;
  yearlyWithHolidayPay: number;
  hourlyWithHolidayPay: number;
  isAboveMinimum: boolean;
  minimumDifference: number;
  minimumPercentage: number;
}

function calculateWages(
  inputValue: number,
  mode: CalculationMode,
  weeklyHours: number
): CalculationResult {
  let hourlyWage = 0;
  let monthlyWage = 0;
  let yearlyWage = 0;

  const monthlyHours = weeklyHours * WEEKS_PER_MONTH;

  // 기본 계산 (주휴수당 미포함)
  switch (mode) {
    case 'hourly_to_monthly':
      hourlyWage = inputValue;
      monthlyWage = hourlyWage * monthlyHours;
      yearlyWage = monthlyWage * 12;
      break;
    case 'monthly_to_hourly':
      monthlyWage = inputValue;
      hourlyWage = monthlyWage / monthlyHours;
      yearlyWage = monthlyWage * 12;
      break;
    case 'yearly_to_hourly':
      yearlyWage = inputValue;
      monthlyWage = yearlyWage / 12;
      hourlyWage = monthlyWage / monthlyHours;
      break;
  }

  // 주휴수당 계산 (주 15시간 이상 근무 시)
  // 주휴시간 = (주 근무시간 / 40) * 8, 최대 8시간
  const weeklyHolidayHours = weeklyHours >= 15 ? Math.min((weeklyHours / 40) * 8, 8) : 0;
  const weeklyHolidayPay = hourlyWage * weeklyHolidayHours;
  const monthlyHolidayPay = weeklyHolidayPay * WEEKS_PER_MONTH;

  // 주휴수당 포함 금액
  const monthlyWithHolidayPay = monthlyWage + monthlyHolidayPay;
  const yearlyWithHolidayPay = monthlyWithHolidayPay * 12;

  // 주휴수당 포함 시급 (209시간 기준 역산)
  const totalMonthlyHours = monthlyHours + (weeklyHolidayHours * WEEKS_PER_MONTH);
  const hourlyWithHolidayPay = monthlyWithHolidayPay / totalMonthlyHours;

  // 최저시급 비교
  const isAboveMinimum = hourlyWage >= MINIMUM_WAGE_2026;
  const minimumDifference = hourlyWage - MINIMUM_WAGE_2026;
  const minimumPercentage = (hourlyWage / MINIMUM_WAGE_2026) * 100;

  return {
    hourlyWage,
    monthlyWage,
    yearlyWage,
    weeklyHolidayPay,
    monthlyWithHolidayPay,
    yearlyWithHolidayPay,
    hourlyWithHolidayPay,
    isAboveMinimum,
    minimumDifference,
    minimumPercentage,
  };
}

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

const QUICK_HOURLY = [
  { label: '최저시급', value: MINIMUM_WAGE_2026 },
  { label: '11,000', value: 11000 },
  { label: '12,000', value: 12000 },
  { label: '15,000', value: 15000 },
  { label: '20,000', value: 20000 },
];

const QUICK_MONTHLY = [
  { label: '200만', value: 2000000 },
  { label: '250만', value: 2500000 },
  { label: '300만', value: 3000000 },
  { label: '350만', value: 3500000 },
  { label: '400만', value: 4000000 },
];

const QUICK_YEARLY = [
  { label: '2400만', value: 24000000 },
  { label: '3000만', value: 30000000 },
  { label: '3600만', value: 36000000 },
  { label: '4200만', value: 42000000 },
  { label: '5000만', value: 50000000 },
];

const QUICK_HOURS = [
  { label: '15시간', value: 15 },
  { label: '20시간', value: 20 },
  { label: '30시간', value: 30 },
  { label: '40시간', value: 40 },
];

export default function HourlyWageCalculatorPage() {
  const [mode, setMode] = useState<CalculationMode>('hourly_to_monthly');
  const [inputValue, setInputValue] = useState(MINIMUM_WAGE_2026);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [includeHolidayPay, setIncludeHolidayPay] = useState(true);

  const result = useMemo(() => {
    if (inputValue <= 0 || weeklyHours <= 0) return null;
    return calculateWages(inputValue, mode, weeklyHours);
  }, [inputValue, mode, weeklyHours]);

  const modeLabels: Record<CalculationMode, { title: string; inputLabel: string; placeholder: string }> = {
    hourly_to_monthly: {
      title: '시급 → 월급/연봉',
      inputLabel: '시급',
      placeholder: '시급을 입력하세요',
    },
    monthly_to_hourly: {
      title: '월급 → 시급',
      inputLabel: '월급 (세전)',
      placeholder: '월급을 입력하세요',
    },
    yearly_to_hourly: {
      title: '연봉 → 시급',
      inputLabel: '연봉 (세전)',
      placeholder: '연봉을 입력하세요',
    },
  };

  const getQuickButtons = () => {
    switch (mode) {
      case 'hourly_to_monthly':
        return QUICK_HOURLY;
      case 'monthly_to_hourly':
        return QUICK_MONTHLY;
      case 'yearly_to_hourly':
        return QUICK_YEARLY;
    }
  };

  const handleModeChange = (newMode: CalculationMode) => {
    setMode(newMode);
    // 모드 변경 시 적절한 기본값 설정
    switch (newMode) {
      case 'hourly_to_monthly':
        setInputValue(MINIMUM_WAGE_2026);
        break;
      case 'monthly_to_hourly':
        setInputValue(3000000);
        break;
      case 'yearly_to_hourly':
        setInputValue(36000000);
        break;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">시급 계산기</h1>
        <p className="text-gray-600">
          시급, 월급, 연봉을 자유롭게 변환하고 2026년 최저시급과 비교해보세요
        </p>
      </div>

      {/* 2026 최저시급 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">2026년 최저시급</p>
            <p className="text-2xl font-bold">{formatMoney(MINIMUM_WAGE_2026)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">주 40시간 기준 월급</p>
            <p className="text-lg font-semibold">{formatMoney(MINIMUM_WAGE_2026 * 209)}</p>
            <p className="text-xs opacity-75">(주휴수당 포함, 209시간)</p>
          </div>
        </div>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">계산 방식 선택</h3>

        {/* 계산 모드 선택 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          {(Object.keys(modeLabels) as CalculationMode[]).map((key) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                mode === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {modeLabels[key].title}
            </button>
          ))}
        </div>

        {/* 금액 입력 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {modeLabels[mode].inputLabel}
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            placeholder={modeLabels[mode].placeholder}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={0}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {getQuickButtons().map((item) => (
              <button
                key={item.value}
                onClick={() => setInputValue(item.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  inputValue === item.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 주당 근무시간 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주당 근무시간
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={1}
              max={80}
            />
            <span className="text-gray-600 whitespace-nowrap">시간</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_HOURS.map((item) => (
              <button
                key={item.value}
                onClick={() => setWeeklyHours(item.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  weeklyHours === item.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 주휴수당 포함 */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHolidayPay}
              onChange={(e) => setIncludeHolidayPay(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">주휴수당 포함</span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-7">
            주 15시간 이상 근무 시 주휴수당이 발생합니다
          </p>
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className={`rounded-xl border p-6 mb-6 ${
          result.isAboveMinimum
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
        }`}>
          {/* 메인 결과 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">시급</p>
            <p className="text-4xl font-bold text-gray-900">
              {formatMoney(result.hourlyWage)}
            </p>
            {weeklyHours >= 15 && includeHolidayPay && (
              <p className="text-sm text-gray-500 mt-1">
                (주휴수당 포함 시 {formatMoney(result.hourlyWithHolidayPay)})
              </p>
            )}
          </div>

          {/* 최저시급 비교 */}
          <div className={`rounded-lg p-4 mb-4 ${
            result.isAboveMinimum ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${
                result.isAboveMinimum ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.isAboveMinimum ? '최저시급 충족' : '최저시급 미달'}
              </span>
              <span className={`font-bold ${
                result.isAboveMinimum ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.minimumDifference >= 0 ? '+' : ''}{formatMoney(result.minimumDifference)}
              </span>
            </div>
            <p className="text-sm mt-1 text-gray-600">
              2026년 최저시급 대비 {result.minimumPercentage.toFixed(1)}%
            </p>
          </div>

          {/* 상세 결과 */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              {includeHolidayPay ? '주휴수당 포함 금액' : '기본 금액'}
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">시급</span>
                <span className="font-bold text-lg">
                  {formatMoney(includeHolidayPay && weeklyHours >= 15
                    ? result.hourlyWithHolidayPay
                    : result.hourlyWage)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">월급</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatMoney(includeHolidayPay && weeklyHours >= 15
                    ? result.monthlyWithHolidayPay
                    : result.monthlyWage)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">연봉</span>
                <span className="font-bold text-lg text-green-600">
                  {formatMoney(includeHolidayPay && weeklyHours >= 15
                    ? result.yearlyWithHolidayPay
                    : result.yearlyWage)}
                </span>
              </div>
            </div>
          </div>

          {/* 주휴수당 상세 */}
          {weeklyHours >= 15 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">주휴수당 상세</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>주휴시간</span>
                  <span>{Math.min((weeklyHours / 40) * 8, 8).toFixed(1)}시간/주</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>주휴수당 (주)</span>
                  <span>{formatMoney(result.weeklyHolidayPay)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>주휴수당 (월)</span>
                  <span className="text-blue-600 font-medium">
                    {formatMoney(result.weeklyHolidayPay * WEEKS_PER_MONTH)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {weeklyHours < 15 && (
            <div className="bg-yellow-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800">
                주 15시간 미만 근무 시 주휴수당이 발생하지 않습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 시급별 월급 비교표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">시급별 월급 비교표</h3>
        <p className="text-sm text-gray-500 mb-4">주 40시간, 주휴수당 포함 (209시간) 기준</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">시급</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">월급</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">연봉</th>
              </tr>
            </thead>
            <tbody>
              {[10030, 11000, 12000, 13000, 15000, 20000].map((wage) => {
                const monthly = wage * 209;
                const yearly = monthly * 12;
                const isMinimum = wage === MINIMUM_WAGE_2026;
                return (
                  <tr
                    key={wage}
                    className={`border-b border-gray-100 ${isMinimum ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-2 px-2">
                      <span className={isMinimum ? 'font-semibold text-blue-700' : 'text-gray-900'}>
                        {formatMoney(wage)}
                      </span>
                      {isMinimum && (
                        <span className="ml-1 text-xs text-blue-600">(최저)</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-blue-600">
                      {formatMoney(monthly)}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-green-600">
                      {(yearly / 10000).toFixed(0)}만원
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2026년 최저임금 안내 */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">2026년 최저임금 안내</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>시급</span>
            <span className="font-semibold">{formatMoney(MINIMUM_WAGE_2026)}</span>
          </div>
          <div className="flex justify-between">
            <span>일급 (8시간)</span>
            <span className="font-semibold">{formatMoney(MINIMUM_WAGE_2026 * 8)}</span>
          </div>
          <div className="flex justify-between">
            <span>주급 (40시간 + 주휴 8시간)</span>
            <span className="font-semibold">{formatMoney(MINIMUM_WAGE_2026 * 48)}</span>
          </div>
          <div className="flex justify-between">
            <span>월급 (209시간)</span>
            <span className="font-semibold text-blue-600">{formatMoney(MINIMUM_WAGE_2026 * 209)}</span>
          </div>
          <div className="flex justify-between">
            <span>연봉</span>
            <span className="font-semibold text-green-600">{formatMoney(MINIMUM_WAGE_2026 * 209 * 12)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          * 209시간 = (주 40시간 + 주휴 8시간) × 월 평균 4.345주
        </p>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 주휴수당은 주 15시간 이상 근무 시 발생합니다.</li>
          <li>* 주휴시간 = (주 근무시간 / 40) × 8시간 (최대 8시간)</li>
          <li>* 계산된 금액은 세전 기준이며, 4대보험 및 세금 공제 전입니다.</li>
          <li>* 월 평균 근무일수는 4.345주(365일÷12개월÷7일)로 계산됩니다.</li>
          <li>* 실제 급여는 회사 규정에 따라 달라질 수 있습니다.</li>
        </ul>
      </div>

      {/* 관련 링크 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구 및 글</h3>
        <div className="space-y-2">
          <Link
            href="/tools/weekly-holiday-pay-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">주휴수당 계산기</span>
            <p className="text-sm text-gray-500 mt-1">주휴수당 상세 계산</p>
          </Link>
          <Link
            href="/tools/salary-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
          <Link
            href="/posts/minimum-wage-2026"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">2026년 최저임금 완벽 가이드</span>
            <p className="text-sm text-gray-500 mt-1">최저시급, 주휴수당, 월급 계산법</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
