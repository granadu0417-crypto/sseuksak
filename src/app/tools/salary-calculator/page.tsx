'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 4대보험 요율 (근로자 부담분)
const INSURANCE_RATES = {
  nationalPension: 0.045, // 국민연금 4.5%
  healthInsurance: 0.03545, // 건강보험 3.545%
  longTermCare: 0.1295, // 장기요양보험 (건강보험의 12.95%)
  employmentInsurance: 0.009, // 고용보험 0.9%
};

// 2026년 소득세 구간 (과세표준 기준)
const TAX_BRACKETS = [
  { min: 0, max: 14000000, rate: 0.06, deduction: 0 },
  { min: 14000000, max: 50000000, rate: 0.15, deduction: 1260000 },
  { min: 50000000, max: 88000000, rate: 0.24, deduction: 5760000 },
  { min: 88000000, max: 150000000, rate: 0.35, deduction: 15440000 },
  { min: 150000000, max: 300000000, rate: 0.38, deduction: 19940000 },
  { min: 300000000, max: 500000000, rate: 0.40, deduction: 25940000 },
  { min: 500000000, max: 1000000000, rate: 0.42, deduction: 35940000 },
  { min: 1000000000, max: Infinity, rate: 0.45, deduction: 65940000 },
];

// 근로소득공제 계산
function calculateEarnedIncomeDeduction(totalSalary: number): number {
  if (totalSalary <= 5000000) {
    return totalSalary * 0.7;
  } else if (totalSalary <= 15000000) {
    return 3500000 + (totalSalary - 5000000) * 0.4;
  } else if (totalSalary <= 45000000) {
    return 7500000 + (totalSalary - 15000000) * 0.15;
  } else if (totalSalary <= 100000000) {
    return 12000000 + (totalSalary - 45000000) * 0.05;
  } else {
    return 14750000 + (totalSalary - 100000000) * 0.02;
  }
}

// 소득세 계산
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.max) {
      return taxableIncome * bracket.rate - bracket.deduction;
    }
  }
  return 0;
}

interface SalaryResult {
  annualSalary: number;
  monthlySalary: number;
  // 4대보험 (월)
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  totalInsurance: number;
  // 세금 (월)
  incomeTax: number;
  localIncomeTax: number;
  totalTax: number;
  // 총 공제 및 실수령액
  totalDeduction: number;
  netSalary: number;
  annualNetSalary: number;
}

function calculateSalary(annualSalary: number, dependents: number, children: number): SalaryResult {
  const monthlySalary = annualSalary / 12;

  // 4대보험 계산 (월 기준)
  const nationalPension = Math.min(monthlySalary * INSURANCE_RATES.nationalPension, 265500); // 상한선 적용
  const healthInsurance = monthlySalary * INSURANCE_RATES.healthInsurance;
  const longTermCare = healthInsurance * INSURANCE_RATES.longTermCare;
  const employmentInsurance = monthlySalary * INSURANCE_RATES.employmentInsurance;
  const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentInsurance;

  // 연간 소득세 계산
  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(annualSalary);
  const basicDeduction = 1500000 * (1 + dependents); // 본인 + 부양가족
  const childDeduction = children * 150000; // 자녀세액공제 기본

  const taxableIncome = Math.max(0, annualSalary - earnedIncomeDeduction - basicDeduction);
  const annualIncomeTax = Math.max(0, calculateIncomeTax(taxableIncome) - childDeduction);
  const annualLocalTax = annualIncomeTax * 0.1;

  // 월 세금
  const incomeTax = annualIncomeTax / 12;
  const localIncomeTax = annualLocalTax / 12;
  const totalTax = incomeTax + localIncomeTax;

  // 총 공제 및 실수령액
  const totalDeduction = totalInsurance + totalTax;
  const netSalary = monthlySalary - totalDeduction;
  const annualNetSalary = netSalary * 12;

  return {
    annualSalary,
    monthlySalary,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    totalInsurance,
    incomeTax,
    localIncomeTax,
    totalTax,
    totalDeduction,
    netSalary,
    annualNetSalary,
  };
}

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

// 연봉 구간별 빠른 선택 버튼
const QUICK_SALARIES = [
  { label: '3,000만', value: 30000000 },
  { label: '4,000만', value: 40000000 },
  { label: '5,000만', value: 50000000 },
  { label: '6,000만', value: 60000000 },
  { label: '7,000만', value: 70000000 },
  { label: '8,000만', value: 80000000 },
  { label: '1억', value: 100000000 },
];

export default function SalaryCalculatorPage() {
  const [annualSalary, setAnnualSalary] = useState(50000000);
  const [dependents, setDependents] = useState(0);
  const [children, setChildren] = useState(0);

  const result = useMemo(() => {
    return calculateSalary(annualSalary, dependents, children);
  }, [annualSalary, dependents, children]);

  const deductionRate = ((result.totalDeduction / result.monthlySalary) * 100).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="연봉 실수령액 계산기" description="4대보험, 소득세 공제 후 실제 받는 월급을 계산합니다" url="/tools/salary-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">연봉 실수령액 계산기</h1>
        <p className="text-gray-600">
          2026년 4대보험, 소득세 기준으로 실수령액을 계산해요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">연봉 입력</h3>

        {/* 빠른 선택 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_SALARIES.map((item) => (
            <button
              key={item.value}
              onClick={() => setAnnualSalary(item.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                annualSalary === item.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 연봉 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            연봉 (세전)
          </label>
          <input
            type="number"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step={1000000}
            min={0}
          />
          <p className="mt-1 text-sm text-gray-500">
            월 {formatMoney(annualSalary / 12)} (세전)
          </p>
        </div>

        {/* 부양가족 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부양가족 수 (본인 제외)
            </label>
            <select
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}명</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              20세 이하 자녀 수
            </label>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}명</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-1">월 실수령액</p>
          <p className="text-4xl font-bold text-blue-600">{formatMoney(result.netSalary)}</p>
          <p className="text-sm text-gray-500 mt-1">
            연 {formatMoney(result.annualNetSalary)} (공제율 {deductionRate}%)
          </p>
        </div>

        {/* 급여 막대 시각화 */}
        <div className="mb-6">
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(result.netSalary / result.monthlySalary) * 100}%` }}
            >
              실수령
            </div>
            <div
              className="bg-orange-400 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(result.totalInsurance / result.monthlySalary) * 100}%` }}
            >
              4대보험
            </div>
            <div
              className="bg-red-400 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(result.totalTax / result.monthlySalary) * 100}%` }}
            >
              세금
            </div>
          </div>
        </div>

        {/* 상세 내역 */}
        <div className="space-y-4">
          {/* 4대보험 */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-900">4대보험</h4>
              <span className="text-orange-600 font-bold">-{formatMoney(result.totalInsurance)}</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>국민연금 (4.5%)</span>
                <span>-{formatMoney(result.nationalPension)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>건강보험 (3.545%)</span>
                <span>-{formatMoney(result.healthInsurance)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>장기요양보험 (12.95%)</span>
                <span>-{formatMoney(result.longTermCare)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>고용보험 (0.9%)</span>
                <span>-{formatMoney(result.employmentInsurance)}</span>
              </div>
            </div>
          </div>

          {/* 세금 */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-900">세금</h4>
              <span className="text-red-600 font-bold">-{formatMoney(result.totalTax)}</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>소득세 (간이세액)</span>
                <span>-{formatMoney(result.incomeTax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>지방소득세 (10%)</span>
                <span>-{formatMoney(result.localIncomeTax)}</span>
              </div>
            </div>
          </div>

          {/* 총 공제 */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">총 공제액</span>
              <span className="text-gray-900 font-bold">-{formatMoney(result.totalDeduction)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 연봉 구간표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">2026년 연봉별 실수령액표</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">연봉</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">월급 (세전)</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">공제</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">실수령액</th>
              </tr>
            </thead>
            <tbody>
              {[30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 100000000, 120000000].map((salary) => {
                const r = calculateSalary(salary, 0, 0);
                const isSelected = salary === annualSalary;
                return (
                  <tr
                    key={salary}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => setAnnualSalary(salary)}
                  >
                    <td className={`py-2 px-2 ${isSelected ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                      {(salary / 10000).toLocaleString()}만
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {formatMoney(r.monthlySalary)}
                    </td>
                    <td className="py-2 px-2 text-right text-red-500">
                      -{formatMoney(r.totalDeduction)}
                    </td>
                    <td className={`py-2 px-2 text-right font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                      {formatMoney(r.netSalary)}
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
          <li>* 2026년 4대보험 요율 기준으로 계산됩니다.</li>
          <li>* 실제 급여는 회사의 급여 정책, 상여금, 수당에 따라 달라질 수 있습니다.</li>
          <li>* 비과세 항목(식대, 교통비 등)은 반영되지 않았습니다.</li>
          <li>* 정확한 금액은 급여명세서를 확인하세요.</li>
        </ul>
      </div>

      {/* 용어 설명 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">4대보험이란?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <strong className="text-gray-900">국민연금 (4.5%)</strong>
            <p>노후 대비 연금. 회사와 근로자가 각각 4.5%씩 부담.</p>
          </div>
          <div>
            <strong className="text-gray-900">건강보험 (3.545%)</strong>
            <p>의료비 지원. 회사와 근로자가 각각 3.545%씩 부담.</p>
          </div>
          <div>
            <strong className="text-gray-900">장기요양보험 (건강보험의 12.95%)</strong>
            <p>노인 돌봄 서비스 재원. 건강보험료의 12.95%.</p>
          </div>
          <div>
            <strong className="text-gray-900">고용보험 (0.9%)</strong>
            <p>실업급여, 육아휴직 급여 등. 근로자 0.9% 부담.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
