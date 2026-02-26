'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2025년 귀속 종합소득세 세율 (소득세법 제55조)
const TAX_BRACKETS = [
  { limit: 14000000, rate: 0.06, deduction: 0, label: '1,400만원 이하' },
  { limit: 50000000, rate: 0.15, deduction: 1260000, label: '5,000만원 이하' },
  { limit: 88000000, rate: 0.24, deduction: 5760000, label: '8,800만원 이하' },
  { limit: 150000000, rate: 0.35, deduction: 15440000, label: '1.5억 이하' },
  { limit: 300000000, rate: 0.38, deduction: 19940000, label: '3억 이하' },
  { limit: 500000000, rate: 0.40, deduction: 25940000, label: '5억 이하' },
  { limit: 1000000000, rate: 0.42, deduction: 35940000, label: '10억 이하' },
  { limit: Infinity, rate: 0.45, deduction: 65940000, label: '10억 초과' },
];

// 기본공제 금액
const BASIC_DEDUCTION = 1500000; // 본인 기본공제
const DEPENDENT_DEDUCTION = 1500000; // 부양가족 1인당
const STANDARD_DEDUCTION = 70000; // 표준세액공제 (특별공제 미신청 시)

function calculateTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.limit) {
      return Math.max(0, taxableIncome * bracket.rate - bracket.deduction);
    }
  }
  return 0;
}

function formatMoney(amount: number): string {
  if (amount < 0) return '-' + formatMoney(-amount);
  if (amount >= 100000000) {
    const uk = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만원` : `${uk}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${Math.floor(amount).toLocaleString()}원`;
}

function formatWon(amount: number): string {
  return `${Math.floor(amount).toLocaleString()}원`;
}

export default function IncomeTaxCalculator() {
  const [incomeType, setIncomeType] = useState<'business' | 'freelancer' | 'rental' | 'other'>('freelancer');
  const [totalIncome, setTotalIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [useSimpleRate, setUseSimpleRate] = useState(true);
  const [dependents, setDependents] = useState(0);
  const [pensionPaid, setPensionPaid] = useState('');
  const [healthInsurancePaid, setHealthInsurancePaid] = useState('');
  const [pensionSavings, setPensionSavings] = useState('');
  const [prepaidTax, setPrepaidTax] = useState('');

  // 업종별 단순경비율 (국세청 기준, 대표적 업종)
  const simpleExpenseRates: Record<string, { rate: number; label: string }[]> = {
    freelancer: [
      { rate: 64.1, label: '프리랜서 (일반)' },
      { rate: 73.1, label: 'IT 개발·디자인' },
      { rate: 61.1, label: '강사·교육' },
      { rate: 60.0, label: '번역·통역' },
    ],
    business: [
      { rate: 90.2, label: '소매업 (일반)' },
      { rate: 87.4, label: '음식점업' },
      { rate: 79.4, label: '서비스업 (일반)' },
    ],
    rental: [
      { rate: 42.6, label: '주택임대' },
    ],
    other: [
      { rate: 60.0, label: '기타소득 (일반)' },
    ],
  };

  const [selectedExpenseRate, setSelectedExpenseRate] = useState(64.1);

  const result = useMemo(() => {
    const income = Number(totalIncome) * 10000 || 0;
    if (income <= 0) return null;

    // 1. 필요경비 계산
    let expenseAmount: number;
    if (useSimpleRate) {
      expenseAmount = income * (selectedExpenseRate / 100);
    } else {
      expenseAmount = Number(expenses) * 10000 || 0;
    }

    // 2. 소득금액 = 총수입 - 필요경비
    const netIncome = Math.max(0, income - expenseAmount);

    // 3. 소득공제
    const basicDeduction = BASIC_DEDUCTION; // 본인
    const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
    const pensionDeduction = Number(pensionPaid) * 10000 || 0; // 국민연금
    const healthDeduction = Number(healthInsurancePaid) * 10000 || 0; // 건강보험료

    const totalDeduction = basicDeduction + dependentDeduction + pensionDeduction + healthDeduction;

    // 4. 과세표준 = 소득금액 - 소득공제
    const taxableIncome = Math.max(0, netIncome - totalDeduction);

    // 5. 산출세액
    const calculatedTax = calculateTax(taxableIncome);

    // 6. 세액공제
    const pensionSavingsAmount = Math.min(Number(pensionSavings) * 10000 || 0, 9000000);
    const pensionSavingsRate = income <= 55000000 ? 0.165 : 0.132;
    const pensionSavingsCredit = pensionSavingsAmount * pensionSavingsRate;
    const standardCredit = STANDARD_DEDUCTION;
    const totalCredit = pensionSavingsCredit + standardCredit;

    // 7. 결정세액
    const determinedTax = Math.max(0, calculatedTax - totalCredit);

    // 8. 지방소득세 (10%)
    const localTax = determinedTax * 0.1;

    // 9. 총 세금
    const totalTax = determinedTax + localTax;

    // 10. 기납부세액 (원천징수 등)
    const prepaid = Number(prepaidTax) * 10000 || 0;

    // 11. 추가납부/환급
    const finalAmount = totalTax - prepaid;

    // 세율 구간 확인
    let appliedRate = '6%';
    for (const bracket of TAX_BRACKETS) {
      if (taxableIncome <= bracket.limit) {
        appliedRate = `${bracket.rate * 100}%`;
        break;
      }
    }

    return {
      income,
      expenseAmount,
      netIncome,
      basicDeduction,
      dependentDeduction,
      pensionDeduction,
      healthDeduction,
      totalDeduction,
      taxableIncome,
      calculatedTax,
      pensionSavingsCredit,
      standardCredit,
      totalCredit,
      determinedTax,
      localTax,
      totalTax,
      prepaid,
      finalAmount,
      appliedRate,
    };
  }, [totalIncome, expenses, useSimpleRate, selectedExpenseRate, dependents, pensionPaid, healthInsurancePaid, pensionSavings, prepaidTax, incomeType]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="종합소득세 계산기"
        description="프리랜서, 개인사업자, 부업 소득의 종합소득세 예상 세액을 계산합니다."
        url="https://sseuksak.com/tools/income-tax-calculator"
      />

      <div className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline text-sm">
          &larr; 계산기 목록
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">종합소득세 계산기</h1>
      <p className="text-gray-600 mb-6">
        프리랜서, 개인사업자, 임대소득자의 종합소득세 예상 세액을 계산합니다.
      </p>

      <div className="space-y-6">
        {/* 소득 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">소득 유형</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'freelancer' as const, label: '프리랜서 (3.3%)' },
              { value: 'business' as const, label: '개인사업자' },
              { value: 'rental' as const, label: '임대소득' },
              { value: 'other' as const, label: '기타소득' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setIncomeType(type.value);
                  const rates = simpleExpenseRates[type.value];
                  if (rates && rates.length > 0) setSelectedExpenseRate(rates[0].rate);
                }}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  incomeType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 총 수입 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">연간 총 수입금액 (만원)</label>
          <input
            type="number"
            value={totalIncome}
            onChange={(e) => setTotalIncome(e.target.value)}
            placeholder="예: 5000"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex gap-2 mt-2">
            {[3000, 5000, 8000, 12000].map((v) => (
              <button
                key={v}
                onClick={() => setTotalIncome(String(v))}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
              >
                {v.toLocaleString()}만
              </button>
            ))}
          </div>
        </div>

        {/* 경비 처리 방식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">경비 처리 방식</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseSimpleRate(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                useSimpleRate ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              단순경비율
            </button>
            <button
              onClick={() => setUseSimpleRate(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                !useSimpleRate ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              직접 입력
            </button>
          </div>

          {useSimpleRate ? (
            <div>
              <select
                value={selectedExpenseRate}
                onChange={(e) => setSelectedExpenseRate(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {simpleExpenseRates[incomeType]?.map((item) => (
                  <option key={item.rate} value={item.rate}>
                    {item.label} ({item.rate}%)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                * 단순경비율은 직전연도 수입 2,400만원(프리랜서) 미만 시 적용 가능
              </p>
            </div>
          ) : (
            <div>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder="필요경비 합계 (만원)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* 부양가족 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">부양가족 수 (본인 제외)</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setDependents(n)}
                className={`w-12 h-10 rounded-lg text-sm font-medium ${
                  dependents === n
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}명
              </button>
            ))}
          </div>
        </div>

        {/* 소득공제 항목 */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">소득공제 항목 (선택)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">국민연금 납부액 (만원/연)</label>
              <input
                type="number"
                value={pensionPaid}
                onChange={(e) => setPensionPaid(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">건강보험료 (만원/연)</label>
              <input
                type="number"
                value={healthInsurancePaid}
                onChange={(e) => setHealthInsurancePaid(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 세액공제 항목 */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">세액공제 항목 (선택)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">연금저축+IRP 납입 (만원/연)</label>
              <input
                type="number"
                value={pensionSavings}
                onChange={(e) => setPensionSavings(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">기납부세액 (만원)</label>
              <input
                type="number"
                value={prepaidTax}
                onChange={(e) => setPrepaidTax(e.target.value)}
                placeholder="원천징수 등"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">3.3% 원천징수 등</p>
            </div>
          </div>
        </div>

        {/* 결과 */}
        {result && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">계산 결과</h2>

            {/* 핵심 결과 */}
            <div className={`p-4 rounded-xl text-center ${
              result.finalAmount > 0 ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <p className="text-sm text-gray-600 mb-1">
                {result.finalAmount > 0 ? '추가 납부할 세금' : '환급받을 세금'}
              </p>
              <p className={`text-3xl font-bold ${
                result.finalAmount > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatMoney(Math.abs(result.finalAmount))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                종합소득세 {formatWon(result.determinedTax)} + 지방소득세 {formatWon(result.localTax)}
              </p>
            </div>

            {/* 세금 계산 과정 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">총 수입금액</span>
                <span className="font-medium">{formatMoney(result.income)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">(-) 필요경비</span>
                <span className="text-gray-500">{formatMoney(result.expenseAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                <span>소득금액</span>
                <span>{formatMoney(result.netIncome)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">(-) 기본공제 (본인)</span>
                <span className="text-gray-500">{formatMoney(result.basicDeduction)}</span>
              </div>
              {result.dependentDeduction > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">(-) 부양가족공제</span>
                  <span className="text-gray-500">{formatMoney(result.dependentDeduction)}</span>
                </div>
              )}
              {result.pensionDeduction > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">(-) 국민연금</span>
                  <span className="text-gray-500">{formatMoney(result.pensionDeduction)}</span>
                </div>
              )}
              {result.healthDeduction > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">(-) 건강보험료</span>
                  <span className="text-gray-500">{formatMoney(result.healthDeduction)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                <span>과세표준</span>
                <span>{formatMoney(result.taxableIncome)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">산출세액 (세율 {result.appliedRate})</span>
                <span className="font-medium">{formatMoney(result.calculatedTax)}</span>
              </div>

              {result.pensionSavingsCredit > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">(-) 연금저축 세액공제</span>
                  <span className="text-gray-500">{formatMoney(result.pensionSavingsCredit)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">(-) 표준세액공제</span>
                <span className="text-gray-500">{formatMoney(result.standardCredit)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                <span>결정세액</span>
                <span>{formatMoney(result.determinedTax)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">(+) 지방소득세 (10%)</span>
                <span className="text-gray-500">{formatMoney(result.localTax)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                <span>총 세금</span>
                <span>{formatMoney(result.totalTax)}</span>
              </div>
              {result.prepaid > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">(-) 기납부세액</span>
                  <span className="text-gray-500">{formatMoney(result.prepaid)}</span>
                </div>
              )}
              <div className={`flex justify-between py-2 font-bold text-lg ${
                result.finalAmount > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                <span>{result.finalAmount > 0 ? '추가 납부' : '환급'}</span>
                <span>{formatMoney(Math.abs(result.finalAmount))}</span>
              </div>
            </div>

            {/* 세율 구간표 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">2025년 귀속 종합소득세 세율</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2">과세표준</th>
                      <th className="text-right p-2">세율</th>
                      <th className="text-right p-2">누진공제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAX_BRACKETS.map((bracket, idx) => (
                      <tr
                        key={idx}
                        className={result.taxableIncome > 0 && result.taxableIncome <= bracket.limit && (idx === 0 || result.taxableIncome > TAX_BRACKETS[idx - 1].limit)
                          ? 'bg-blue-50 font-medium'
                          : ''
                        }
                      >
                        <td className="p-2">{bracket.label}</td>
                        <td className="text-right p-2">{(bracket.rate * 100)}%</td>
                        <td className="text-right p-2">{bracket.deduction > 0 ? formatMoney(bracket.deduction) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 안내 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <p className="font-medium mb-1">참고사항</p>
          <ul className="space-y-1 text-xs">
            <li>* 이 계산기는 간이 계산용이며, 실제 세액과 차이가 있을 수 있습니다.</li>
            <li>* 종합소득세 신고 기간: 매년 5월 1일~31일</li>
            <li>* 성실신고확인 대상자: 6월 30일까지 연장</li>
            <li>* 정확한 신고는 홈택스(hometax.go.kr)를 이용하세요.</li>
          </ul>
        </div>

        {/* 관련 가이드 */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">관련 가이드</h3>
          <div className="space-y-2">
            <Link href="/posts/income-tax-filing-guide-2026" className="block text-sm text-blue-600 hover:underline">
              5월 종합소득세 신고: 대상자 확인부터 신고까지
            </Link>
            <Link href="/posts/freelancer-side-job-income-tax-guide-2026" className="block text-sm text-blue-600 hover:underline">
              투잡 직장인·프리랜서 종합소득세 실전 계산
            </Link>
            <Link href="/posts/pension-savings-vs-irp-guide-2026" className="block text-sm text-blue-600 hover:underline">
              연금저축 vs IRP 세액공제 비교
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
