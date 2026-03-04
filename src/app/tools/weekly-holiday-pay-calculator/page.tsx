'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 최저시급
const MINIMUM_WAGE_2026 = 10320;

interface WeeklyHolidayPayResult {
  weeklyWorkHours: number;
  isEligible: boolean;
  weeklyHolidayHours: number;
  weeklyHolidayPay: number;
  monthlyWeeklyHolidayPay: number;
  totalWeeklyPay: number;
  totalMonthlyPay: number;
}

function calculateWeeklyHolidayPay(
  hourlyWage: number,
  dailyHours: number,
  workDays: number
): WeeklyHolidayPayResult {
  const weeklyWorkHours = dailyHours * workDays;

  // 주휴수당 자격: 주 15시간 이상 근무
  const isEligible = weeklyWorkHours >= 15;

  // 주휴시간 = 1주 소정근로시간 / 40 × 8
  // 최대 8시간 (주 40시간 이상 근무 시)
  const weeklyHolidayHours = isEligible
    ? Math.min((weeklyWorkHours / 40) * 8, 8)
    : 0;

  // 주휴수당 = 주휴시간 × 시급
  const weeklyHolidayPay = weeklyHolidayHours * hourlyWage;

  // 월 주휴수당 (4.345주 기준)
  const monthlyWeeklyHolidayPay = weeklyHolidayPay * 4.345;

  // 주급 (근로수당 + 주휴수당)
  const totalWeeklyPay = (weeklyWorkHours * hourlyWage) + weeklyHolidayPay;

  // 월급 (4.345주 기준)
  const totalMonthlyPay = totalWeeklyPay * 4.345;

  return {
    weeklyWorkHours,
    isEligible,
    weeklyHolidayHours,
    weeklyHolidayPay,
    monthlyWeeklyHolidayPay,
    totalWeeklyPay,
    totalMonthlyPay,
  };
}

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

// 빠른 선택 옵션
const QUICK_HOURS = [
  { label: '4시간', value: 4 },
  { label: '5시간', value: 5 },
  { label: '6시간', value: 6 },
  { label: '8시간', value: 8 },
];

const QUICK_DAYS = [
  { label: '3일', value: 3 },
  { label: '4일', value: 4 },
  { label: '5일', value: 5 },
  { label: '6일', value: 6 },
];

export default function WeeklyHolidayPayCalculatorPage() {
  const [hourlyWage, setHourlyWage] = useState(MINIMUM_WAGE_2026);
  const [dailyHours, setDailyHours] = useState(8);
  const [workDays, setWorkDays] = useState(5);

  const result = useMemo(() => {
    return calculateWeeklyHolidayPay(hourlyWage, dailyHours, workDays);
  }, [hourlyWage, dailyHours, workDays]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="주휴수당 계산기" description="주 15시간 이상 근무 시 받는 주휴수당을 계산합니다" url="/tools/weekly-holiday-pay-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">주휴수당 계산기</h1>
        <p className="text-gray-600">
          근무시간을 입력하면 주휴수당을 자동으로 계산해드려요
        </p>
      </div>

      {/* 2026 최저시급 안내 */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">2026년 최저시급</p>
            <p className="text-2xl font-bold text-blue-700">{MINIMUM_WAGE_2026.toLocaleString()}원</p>
          </div>
          <button
            onClick={() => setHourlyWage(MINIMUM_WAGE_2026)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            최저시급 적용
          </button>
        </div>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">근무 정보 입력</h3>

        {/* 시급 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시급
          </label>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Number(e.target.value))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step={100}
            min={MINIMUM_WAGE_2026}
          />
          {hourlyWage < MINIMUM_WAGE_2026 && (
            <p className="mt-1 text-sm text-red-500">
              최저시급({MINIMUM_WAGE_2026.toLocaleString()}원) 미만입니다
            </p>
          )}
        </div>

        {/* 일일 근무시간 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            일일 근무시간
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {QUICK_HOURS.map((item) => (
              <button
                key={item.value}
                onClick={() => setDailyHours(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dailyHours === item.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            step={0.5}
            min={1}
            max={12}
          />
        </div>

        {/* 주간 근무일수 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주간 근무일수
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {QUICK_DAYS.map((item) => (
              <button
                key={item.value}
                onClick={() => setWorkDays(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  workDays === item.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={workDays}
            onChange={(e) => setWorkDays(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min={1}
            max={7}
          />
        </div>

        {/* 주간 근무시간 표시 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">주간 총 근무시간</span>
            <span className={`font-bold ${result.isEligible ? 'text-green-600' : 'text-red-500'}`}>
              {result.weeklyWorkHours}시간
            </span>
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className={`rounded-xl border p-6 mb-6 ${
        result.isEligible
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
      }`}>
        {/* 자격 여부 */}
        {!result.isEligible ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl">X</span>
            </div>
            <h3 className="text-xl font-bold text-red-700 mb-2">주휴수당 대상이 아닙니다</h3>
            <p className="text-red-600">
              주휴수당은 주 15시간 이상 근무해야 받을 수 있습니다.
              <br />
              현재 주 {result.weeklyWorkHours}시간 근무 ({15 - result.weeklyWorkHours}시간 부족)
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">주휴수당 (주간)</p>
              <p className="text-4xl font-bold text-green-600">{formatMoney(result.weeklyHolidayPay)}</p>
              <p className="text-sm text-gray-500 mt-1">
                월 환산 약 {formatMoney(result.monthlyWeeklyHolidayPay)}
              </p>
            </div>

            {/* 계산 상세 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">계산 상세</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>주간 근무시간</span>
                  <span>{result.weeklyWorkHours}시간</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>주휴시간</span>
                  <span>{result.weeklyHolidayHours.toFixed(1)}시간</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>계산식</span>
                  <span>{result.weeklyHolidayHours.toFixed(1)}시간 × {hourlyWage.toLocaleString()}원</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                  <span>주휴수당</span>
                  <span className="text-green-600">{formatMoney(result.weeklyHolidayPay)}</span>
                </div>
              </div>
            </div>

            {/* 총 급여 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">주급 (주휴수당 포함)</p>
                <p className="text-xl font-bold text-gray-900">{formatMoney(result.totalWeeklyPay)}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">월급 (예상)</p>
                <p className="text-xl font-bold text-green-700">{formatMoney(result.totalMonthlyPay)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 주휴수당 계산 예시표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">주휴수당 계산 예시 (2026년 최저시급 기준)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">근무 패턴</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">주휴수당</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">월급 (예상)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { daily: 4, days: 5, label: '주 5일 × 4시간' },
                { daily: 5, days: 4, label: '주 4일 × 5시간' },
                { daily: 6, days: 5, label: '주 5일 × 6시간' },
                { daily: 8, days: 5, label: '주 5일 × 8시간' },
                { daily: 8, days: 6, label: '주 6일 × 8시간' },
              ].map((item, idx) => {
                const calc = calculateWeeklyHolidayPay(MINIMUM_WAGE_2026, item.daily, item.days);
                const isSelected = dailyHours === item.daily && workDays === item.days;
                return (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setDailyHours(item.daily);
                      setWorkDays(item.days);
                      setHourlyWage(MINIMUM_WAGE_2026);
                    }}
                  >
                    <td className={`py-2 px-2 ${isSelected ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                      {item.label} ({item.daily * item.days}시간)
                    </td>
                    <td className="py-2 px-2 text-right text-green-600 font-medium">
                      {formatMoney(calc.weeklyHolidayPay)}
                    </td>
                    <td className={`py-2 px-2 text-right font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                      {formatMoney(calc.totalMonthlyPay)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">주휴수당이란?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 1주일에 15시간 이상 근무한 근로자에게 지급되는 유급휴일 수당입니다.</li>
          <li>* 주휴시간 = 주간 근무시간 ÷ 40 × 8 (최대 8시간)</li>
          <li>* 주휴수당 = 주휴시간 × 시급</li>
          <li>* 월급제 근로자는 이미 주휴수당이 포함되어 있습니다.</li>
          <li>* 시급제/일급제 알바는 별도로 주휴수당을 받아야 합니다.</li>
        </ul>
      </div>

      {/* 자격 조건 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">주휴수당 지급 조건</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <strong className="text-gray-900">주 15시간 이상 근무</strong>
              <p>1주일에 15시간 이상 일해야 합니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <strong className="text-gray-900">소정근로일 개근</strong>
              <p>정해진 근무일에 빠지지 않고 출근해야 합니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <strong className="text-gray-900">다음 주 근로 예정</strong>
              <p>다음 주에도 계속 근무할 예정이어야 합니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link
            href="/tools/annual-leave-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">연차 계산기</span>
            <p className="text-sm text-gray-500 mt-1">입사일 기준 연차 발생일수 계산</p>
          </Link>
          <Link
            href="/tools/hourly-wage-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">시급 계산기</span>
            <p className="text-sm text-gray-500 mt-1">시급, 월급, 연봉 변환 계산</p>
          </Link>
          <Link
            href="/tools/salary-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
