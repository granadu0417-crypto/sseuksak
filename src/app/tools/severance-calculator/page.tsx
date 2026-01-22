'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SeveranceResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  averageDailyWage: number;
  severancePay: number;
  taxableAmount: number;
  incomeTax: number;
  localTax: number;
  netSeverancePay: number;
}

function calculateSeverance(
  startDate: Date,
  endDate: Date,
  monthlySalary: number,
  includeBonus: boolean,
  annualBonus: number
): SeveranceResult {
  // 근속일수 계산
  const diffTime = endDate.getTime() - startDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  // 평균임금 계산 (최근 3개월 기준)
  // 월급 + (연간 상여금/12개월) = 월 평균
  const monthlyAverage = includeBonus
    ? monthlySalary + (annualBonus / 12)
    : monthlySalary;

  // 1일 평균임금 = 3개월 급여 총액 / 92일 (보통 3개월을 92일로 계산)
  const averageDailyWage = (monthlyAverage * 3) / 92;

  // 퇴직금 = 1일 평균임금 × 30일 × (총 근속일수 / 365)
  const severancePay = averageDailyWage * 30 * (totalDays / 365);

  // 퇴직소득세 계산 (간이 계산)
  // 퇴직소득공제 적용 (근속연수에 따라 다름)
  let deduction = 0;
  if (years <= 5) {
    deduction = years * 1000000 * 0.3;
  } else if (years <= 10) {
    deduction = 1500000 + (years - 5) * 2000000 * 0.3;
  } else if (years <= 20) {
    deduction = 4500000 + (years - 10) * 2500000 * 0.3;
  } else {
    deduction = 12000000 + (years - 20) * 3000000 * 0.3;
  }

  const taxableAmount = Math.max(0, severancePay - deduction);

  // 퇴직소득세율 (간이 - 실제로는 더 복잡)
  let taxRate = 0;
  if (taxableAmount <= 12000000) taxRate = 0.06;
  else if (taxableAmount <= 46000000) taxRate = 0.15;
  else if (taxableAmount <= 88000000) taxRate = 0.24;
  else if (taxableAmount <= 150000000) taxRate = 0.35;
  else taxRate = 0.38;

  const incomeTax = taxableAmount * taxRate;
  const localTax = incomeTax * 0.1;
  const netSeverancePay = severancePay - incomeTax - localTax;

  return {
    totalDays,
    years,
    months,
    days,
    averageDailyWage,
    severancePay,
    taxableAmount,
    incomeTax,
    localTax,
    netSeverancePay,
  };
}

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function SeveranceCalculatorPage() {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 3);

  const [startDate, setStartDate] = useState(formatDate(oneYearAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [monthlySalary, setMonthlySalary] = useState(3000000);
  const [includeBonus, setIncludeBonus] = useState(false);
  const [annualBonus, setAnnualBonus] = useState(0);

  const result = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return null;
    return calculateSeverance(start, end, monthlySalary, includeBonus, annualBonus);
  }, [startDate, endDate, monthlySalary, includeBonus, annualBonus]);

  const isEligible = result && result.totalDays >= 365;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">퇴직금 계산기</h1>
        <p className="text-gray-600">
          근속기간과 급여를 입력하면 예상 퇴직금을 계산해드려요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">근무 정보 입력</h3>

        {/* 근무 기간 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              입사일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              퇴사일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 월급 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            월 급여 (세전, 기본급 + 고정수당)
          </label>
          <input
            type="number"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(Number(e.target.value))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step={100000}
            min={0}
          />
        </div>

        {/* 상여금 포함 여부 */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBonus}
              onChange={(e) => setIncludeBonus(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">상여금 포함</span>
          </label>
        </div>

        {/* 상여금 입력 */}
        {includeBonus && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연간 상여금 총액
            </label>
            <input
              type="number"
              value={annualBonus}
              onChange={(e) => setAnnualBonus(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step={100000}
              min={0}
            />
            <p className="mt-1 text-sm text-gray-500">
              설, 추석, 명절 상여 등 연간 받는 상여금 총액
            </p>
          </div>
        )}
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className={`rounded-xl border p-6 mb-6 ${
          isEligible
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
        }`}>
          {/* 근속기간 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">총 근속기간</p>
            <p className="text-2xl font-bold text-gray-900">
              {result.years}년 {result.months}개월 {result.days}일
            </p>
            <p className="text-sm text-gray-500">({result.totalDays.toLocaleString()}일)</p>
          </div>

          {/* 퇴직금 수급 자격 */}
          {!isEligible ? (
            <div className="bg-red-100 rounded-lg p-4 text-center mb-6">
              <p className="text-red-700 font-semibold">
                퇴직금 수급 대상이 아닙니다
              </p>
              <p className="text-sm text-red-600 mt-1">
                퇴직금은 1년 이상 근무해야 받을 수 있습니다.
                <br />
                (현재 {365 - result.totalDays}일 부족)
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-1">예상 퇴직금 (세전)</p>
                <p className="text-4xl font-bold text-green-600">{formatMoney(result.severancePay)}</p>
              </div>

              {/* 계산 상세 */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">계산 상세</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>1일 평균임금</span>
                    <span>{formatMoney(result.averageDailyWage)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>계산식</span>
                    <span className="text-right text-xs">
                      {formatMoney(result.averageDailyWage)} × 30일 × ({result.totalDays}/365)
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span>퇴직금 (세전)</span>
                    <span className="text-green-600">{formatMoney(result.severancePay)}</span>
                  </div>
                </div>
              </div>

              {/* 세금 계산 */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">퇴직소득세 (예상)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>퇴직소득 과세표준</span>
                    <span>{formatMoney(result.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>퇴직소득세</span>
                    <span className="text-red-500">-{formatMoney(result.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>지방소득세</span>
                    <span className="text-red-500">-{formatMoney(result.localTax)}</span>
                  </div>
                </div>
              </div>

              {/* 실수령액 */}
              <div className="bg-green-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">예상 실수령액</span>
                  <span className="text-2xl font-bold text-green-700">{formatMoney(result.netSeverancePay)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 퇴직금 기준표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">근속연수별 퇴직금 예시</h3>
        <p className="text-sm text-gray-500 mb-4">월급 300만원 기준</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">근속연수</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">예상 퇴직금</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 5, 10, 15, 20].map((years) => {
                const start = new Date();
                start.setFullYear(start.getFullYear() - years);
                const calc = calculateSeverance(start, new Date(), 3000000, false, 0);
                return (
                  <tr key={years} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-gray-900">{years}년</td>
                    <td className="py-2 px-2 text-right font-medium text-green-600">
                      {formatMoney(calc.severancePay)}
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
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 퇴직금은 1년 이상 근무한 근로자에게 지급됩니다.</li>
          <li>* 퇴직금 = 1일 평균임금 x 30일 x (총 근속일수/365)</li>
          <li>* 평균임금 계산 시 상여금, 연차수당 등이 포함될 수 있습니다.</li>
          <li>* 실제 퇴직금은 회사 규정에 따라 달라질 수 있습니다.</li>
          <li>* 퇴직소득세는 간이 계산이며, 실제와 다를 수 있습니다.</li>
        </ul>
      </div>

      {/* 관련 링크 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 글</h3>
        <Link
          href="/posts/resignation-checklist-2026"
          className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <span className="text-blue-600 font-medium">퇴사 전 체크리스트 - 놓치면 손해보는 돈과 서류 총정리</span>
          <p className="text-sm text-gray-500 mt-1">퇴직금, 연차수당, 실업급여까지 한눈에</p>
        </Link>
      </div>
    </div>
  );
}
