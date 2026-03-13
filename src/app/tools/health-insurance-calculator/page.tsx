'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 건강보험 요율 (보건복지부 고시)
const RATES = {
  healthInsurance: 0.0719, // 건강보험료율 7.19% (사용자+근로자)
  employeeShare: 0.5, // 근로자 부담 50%
  longTermCare: 0.1314, // 장기요양보험료율 (건강보험료의 13.14%)
};

// 직장가입자 보수월액 상·하한 (2026년)
const SALARY_BOUNDS = {
  min: 280000, // 최저 보수월액
  max: 119090000, // 최고 보수월액
};

interface HealthInsuranceResult {
  monthlySalary: number;
  healthPremium: number; // 건강보험료 (근로자)
  longTermCarePremium: number; // 장기요양보험료 (근로자)
  totalMonthly: number; // 월 합계
  totalAnnual: number; // 연간 합계
  healthPremiumFull: number; // 건강보험료 (사용자+근로자)
  longTermCarePremiumFull: number; // 장기요양보험료 전체
}

function calculateHealthInsurance(monthlySalary: number): HealthInsuranceResult {
  const bounded = Math.min(Math.max(monthlySalary, SALARY_BOUNDS.min), SALARY_BOUNDS.max);

  const healthPremiumFull = bounded * RATES.healthInsurance;
  const healthPremium = Math.round(healthPremiumFull * RATES.employeeShare);

  const longTermCarePremiumFull = healthPremiumFull * RATES.longTermCare;
  const longTermCarePremium = Math.round(longTermCarePremiumFull * RATES.employeeShare);

  const totalMonthly = healthPremium + longTermCarePremium;
  const totalAnnual = totalMonthly * 12;

  return {
    monthlySalary: bounded,
    healthPremium,
    longTermCarePremium,
    totalMonthly,
    totalAnnual,
    healthPremiumFull: Math.round(healthPremiumFull),
    longTermCarePremiumFull: Math.round(longTermCarePremiumFull),
  };
}

interface SettlementResult {
  lastYearMonthly: number;
  thisYearMonthly: number;
  lastYearAnnualPremium: number;
  thisYearAnnualPremium: number;
  difference: number; // 양수면 추가납부, 음수면 환급
}

function calculateSettlement(lastYearSalary: number, thisYearSalary: number): SettlementResult {
  const lastYear = calculateHealthInsurance(lastYearSalary);
  const thisYear = calculateHealthInsurance(thisYearSalary);

  // 전년도 보수 기준으로 납부한 보험료 vs 올해 실제 보수 기준 보험료
  const lastYearAnnualPremium = lastYear.totalMonthly * 12;
  const thisYearAnnualPremium = thisYear.totalMonthly * 12;
  const difference = thisYearAnnualPremium - lastYearAnnualPremium;

  return {
    lastYearMonthly: lastYear.totalMonthly,
    thisYearMonthly: thisYear.totalMonthly,
    lastYearAnnualPremium,
    thisYearAnnualPremium,
    difference,
  };
}

function formatMoney(amount: number): string {
  return Math.round(Math.abs(amount)).toLocaleString('ko-KR') + '원';
}

const QUICK_SALARIES = [
  { label: '250만', value: 2500000 },
  { label: '300만', value: 3000000 },
  { label: '350만', value: 3500000 },
  { label: '400만', value: 4000000 },
  { label: '500만', value: 5000000 },
  { label: '700만', value: 7000000 },
];

export default function HealthInsuranceCalculatorPage() {
  const [mode, setMode] = useState<'monthly' | 'settlement'>('monthly');
  const [monthlySalary, setMonthlySalary] = useState(3500000);
  const [lastYearSalary, setLastYearSalary] = useState(3000000);
  const [thisYearSalary, setThisYearSalary] = useState(3500000);

  const monthlyResult = useMemo(() => calculateHealthInsurance(monthlySalary), [monthlySalary]);
  const settlementResult = useMemo(() => calculateSettlement(lastYearSalary, thisYearSalary), [lastYearSalary, thisYearSalary]);

  const premiumRate = ((monthlyResult.totalMonthly / monthlySalary) * 100).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="건강보험료 계산기" description="2026년 직장가입자 건강보험료와 장기요양보험료, 4월 정산 예상액을 계산합니다" url="/tools/health-insurance-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">건강보험료 계산기</h1>
        <p className="text-gray-600">
          2026년 직장가입자 건강보험료와 4월 정산 예상액을 계산해요
        </p>
      </div>

      {/* 모드 선택 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('monthly')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          월 보험료 계산
        </button>
        <button
          onClick={() => setMode('settlement')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'settlement'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          4월 정산 예상
        </button>
      </div>

      {mode === 'monthly' ? (
        <>
          {/* 월 보험료 계산 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">보수월액 입력</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_SALARIES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setMonthlySalary(item.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    monthlySalary === item.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월 보수 (세전 급여)
              </label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step={100000}
                min={0}
              />
              <p className="mt-1 text-sm text-gray-500">
                연봉 {formatMoney(monthlySalary * 12)} 기준
              </p>
            </div>
          </div>

          {/* 결과 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">월 건강보험료 (근로자 부담)</p>
              <p className="text-4xl font-bold text-blue-600">{formatMoney(monthlyResult.totalMonthly)}</p>
              <p className="text-sm text-gray-500 mt-1">
                연간 {formatMoney(monthlyResult.totalAnnual)} (급여의 {premiumRate}%)
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">근로자 부담분 (50%)</h4>
                  <span className="text-blue-600 font-bold">{formatMoney(monthlyResult.totalMonthly)}/월</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>건강보험료 (3.595%)</span>
                    <span>{formatMoney(monthlyResult.healthPremium)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>장기요양보험료 (건보의 13.14%)</span>
                    <span>{formatMoney(monthlyResult.longTermCarePremium)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">사용자 부담분 (50%)</h4>
                  <span className="text-gray-600 font-bold">{formatMoney(monthlyResult.totalMonthly)}/월</span>
                </div>
                <p className="text-sm text-gray-500">회사가 동일 금액을 부담합니다</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">총 보험료 (근로자+사용자)</span>
                  <span className="text-gray-900 font-bold">{formatMoney(monthlyResult.healthPremiumFull + monthlyResult.longTermCarePremiumFull)}/월</span>
                </div>
              </div>
            </div>
          </div>

          {/* 보수월액별 비교표 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">보수월액별 건강보험료 비교</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-gray-600 font-medium">보수월액</th>
                    <th className="text-right py-2 px-2 text-gray-600 font-medium">건강보험료</th>
                    <th className="text-right py-2 px-2 text-gray-600 font-medium">장기요양</th>
                    <th className="text-right py-2 px-2 text-gray-600 font-medium">월 합계</th>
                  </tr>
                </thead>
                <tbody>
                  {[2000000, 2500000, 3000000, 3500000, 4000000, 5000000, 6000000, 7000000, 10000000].map((salary) => {
                    const r = calculateHealthInsurance(salary);
                    const isSelected = salary === monthlySalary;
                    return (
                      <tr
                        key={salary}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => setMonthlySalary(salary)}
                      >
                        <td className={`py-2 px-2 ${isSelected ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                          {(salary / 10000).toLocaleString()}만원
                        </td>
                        <td className="py-2 px-2 text-right text-gray-600">
                          {formatMoney(r.healthPremium)}
                        </td>
                        <td className="py-2 px-2 text-right text-gray-600">
                          {formatMoney(r.longTermCarePremium)}
                        </td>
                        <td className={`py-2 px-2 text-right font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                          {formatMoney(r.totalMonthly)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 4월 정산 예상 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">정산 예상 입력</h3>
            <p className="text-sm text-gray-500 mb-4">
              전년도 보수와 올해 실제 보수를 입력하면 4월 정산 시 추가납부 또는 환급 예상액을 계산합니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전년도 보수월액 (기존 납부 기준)
                </label>
                <input
                  type="number"
                  value={lastYearSalary}
                  onChange={(e) => setLastYearSalary(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step={100000}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  올해 실제 보수월액 (성과급·보너스 포함)
                </label>
                <input
                  type="number"
                  value={thisYearSalary}
                  onChange={(e) => setThisYearSalary(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step={100000}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* 정산 결과 */}
          <div className={`rounded-xl border p-6 mb-6 ${
            settlementResult.difference > 0
              ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              : settlementResult.difference < 0
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">4월 정산 예상</p>
              {settlementResult.difference > 0 ? (
                <>
                  <p className="text-4xl font-bold text-red-600">+{formatMoney(settlementResult.difference)}</p>
                  <p className="text-sm text-red-500 mt-1">추가납부 예상</p>
                </>
              ) : settlementResult.difference < 0 ? (
                <>
                  <p className="text-4xl font-bold text-green-600">-{formatMoney(settlementResult.difference)}</p>
                  <p className="text-sm text-green-500 mt-1">환급 예상</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-gray-600">0원</p>
                  <p className="text-sm text-gray-500 mt-1">추가납부/환급 없음</p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">전년도 기준 납부한 보험료 (연)</span>
                  <span className="font-medium">{formatMoney(settlementResult.lastYearAnnualPremium)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">올해 실제 보수 기준 보험료 (연)</span>
                  <span className="font-medium">{formatMoney(settlementResult.thisYearAnnualPremium)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="text-gray-600">월 보험료 변동</span>
                  <span className={`font-medium ${settlementResult.thisYearMonthly > settlementResult.lastYearMonthly ? 'text-red-600' : 'text-green-600'}`}>
                    {settlementResult.thisYearMonthly > settlementResult.lastYearMonthly ? '+' : '-'}
                    {formatMoney(Math.abs(settlementResult.thisYearMonthly - settlementResult.lastYearMonthly))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 정산 안내 */}
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">정산이란?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>* 매월 급여에서 전년도 보수 기준으로 건보료를 냅니다.</li>
              <li>* 4월에 올해 실제 보수와 비교하여 차액을 정산합니다.</li>
              <li>* 보수가 올랐으면 추가납부, 내렸으면 환급됩니다.</li>
              <li>* 추가납부는 4~5월 급여에서 분할 공제됩니다.</li>
            </ul>
          </div>
        </>
      )}

      {/* 안내 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 2026년 건강보험료율 7.19%, 장기요양보험료율 13.14% 기준입니다.</li>
          <li>* 직장가입자 기준이며, 지역가입자는 소득·재산·자동차 등을 종합하여 산정됩니다.</li>
          <li>* 비과세 소득(식대, 자가운전보조금 등)은 보수월액에서 제외됩니다.</li>
          <li>* 정확한 금액은 국민건강보험공단(1577-1000)에서 확인하세요.</li>
        </ul>
      </div>

      {/* 관련 가이드 */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 가이드</h3>
        <div className="space-y-2">
          <Link href="/posts/health-insurance-settlement-guide-2026" className="block text-blue-600 hover:underline text-sm">
            4월 건강보험료 정산, 추가납부 줄이는 3가지 방법
          </Link>
          <Link href="/posts/salary-take-home-comparison-2026" className="block text-blue-600 hover:underline text-sm">
            연봉 3000~5000만원 실수령액 비교 가이드
          </Link>
          <Link href="/posts/four-major-insurance-guide-2026" className="block text-blue-600 hover:underline text-sm">
            4대보험료 얼마나 내고 있나? 가입확인·계산·절약법 정리
          </Link>
        </div>
      </div>

      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '2026년 건강보험료율은 얼마인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '2026년 직장가입자 건강보험료율은 7.19%(근로자 3.595% + 사용자 3.595%)이며, 장기요양보험료는 건강보험료의 13.14%입니다. 보수월액 상한은 약 1억 1,909만원, 하한은 28만원입니다.',
                },
              },
              {
                '@type': 'Question',
                name: '4월 건강보험료 정산이란 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '매월 건강보험료는 전년도 보수 기준으로 납부하는데, 4월에 실제 보수와 비교하여 차액을 정산합니다. 보수가 오르면 추가납부, 내리면 환급됩니다. 추가납부액은 보통 4~5월 급여에서 분할 공제됩니다.',
                },
              },
              {
                '@type': 'Question',
                name: '직장가입자와 지역가입자의 건보료 계산 방식이 다른가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '네, 다릅니다. 직장가입자는 보수월액(급여)에 보험료율을 곱하여 산정하고 사용자와 50%씩 부담합니다. 지역가입자는 소득, 재산(부동산, 자동차 등), 생활 수준 등을 종합하여 부과점수를 산정하고, 점수당 금액을 곱하여 계산합니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">건강보험료 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">월 보수 350만원 직장인</p>
            <p className="text-sm text-gray-600">
              건강보험료(근로자) 약 125,830원 + 장기요양보험료 약 16,530원 = 월 약 142,360원.
              연간 약 170만원을 건강보험료로 납부하며, 연봉의 약 4.07%에 해당합니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">연봉 인상으로 4월 정산 (300만 → 350만원)</p>
            <p className="text-sm text-gray-600">
              전년도 기준 월 보험료 약 121,740원에서 올해 기준 약 142,360원으로 인상.
              연간 차이 약 247,440원을 4월에 추가 납부해야 합니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">월 보수 500만원 직장인</p>
            <p className="text-sm text-gray-600">
              건강보험료(근로자) 약 179,750원 + 장기요양보험료 약 23,620원 = 월 약 203,370원.
              연간 약 244만원으로, 4대보험 중 가장 큰 비중을 차지합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 자주 묻는 질문 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">자주 묻는 질문</h3>
        <div className="space-y-3">
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              2026년 건강보험료율은 얼마인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              2026년 직장가입자 건강보험료율은 7.19%(근로자 3.595% + 사용자 3.595%)이며,
              장기요양보험료는 건강보험료의 13.14%입니다.
              보수월액 상한은 약 1억 1,909만원, 하한은 28만원입니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              4월 건강보험료 정산이란 무엇인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              매월 건강보험료는 전년도 보수 기준으로 납부하는데, 4월에 실제 보수와 비교하여 차액을 정산합니다.
              보수가 오르면 추가납부, 내리면 환급됩니다.
              추가납부액은 보통 4~5월 급여에서 분할 공제됩니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              직장가입자와 지역가입자의 건보료 계산 방식이 다른가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              네, 다릅니다. 직장가입자는 보수월액(급여)에 보험료율을 곱하여 산정하고 사용자와 50%씩 부담합니다.
              지역가입자는 소득, 재산(부동산, 자동차 등), 생활 수준 등을 종합하여
              부과점수를 산정하고, 점수당 금액을 곱하여 계산합니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/salary-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
          <Link href="/tools/pension-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">국민연금 수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">예상 국민연금 월 수령액 계산</p>
          </Link>
          <Link href="/tools/tax-refund-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">연말정산 환급액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">연말정산 예상 환급액 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
