'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2025년 귀속 근로소득세율 (국세청 공식 데이터)
const TAX_BRACKETS = [
  { limit: 14000000, rate: 0.06, deduction: 0 },
  { limit: 50000000, rate: 0.15, deduction: 1260000 },
  { limit: 88000000, rate: 0.24, deduction: 5760000 },
  { limit: 150000000, rate: 0.35, deduction: 15440000 },
  { limit: 300000000, rate: 0.38, deduction: 19940000 },
  { limit: 500000000, rate: 0.40, deduction: 25940000 },
  { limit: 1000000000, rate: 0.42, deduction: 35940000 },
  { limit: Infinity, rate: 0.45, deduction: 65940000 },
];

// 근로소득공제 계산 (2025년 귀속)
function calculateEmploymentDeduction(totalSalary: number): number {
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

// 산출세액 계산
function calculateTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.limit) {
      return taxableIncome * bracket.rate - bracket.deduction;
    }
  }
  return 0;
}

// 근로소득세액공제 계산 (2025년 귀속)
function calculateEarnedIncomeCredit(calculatedTax: number, totalSalary: number): number {
  let credit = 0;

  if (calculatedTax <= 1300000) {
    credit = calculatedTax * 0.55;
  } else {
    credit = 715000 + (calculatedTax - 1300000) * 0.3;
  }

  // 총급여에 따른 한도
  let limit = 0;
  if (totalSalary <= 33000000) {
    limit = 740000;
  } else if (totalSalary <= 70000000) {
    limit = Math.max(740000 - (totalSalary - 33000000) * 0.008, 660000);
  } else {
    limit = Math.max(660000 - (totalSalary - 70000000) * 0.5 / 10000000, 500000);
  }

  return Math.min(credit, limit);
}

// 자녀세액공제 계산
function calculateChildCredit(childCount: number): number {
  if (childCount === 0) return 0;
  if (childCount === 1) return 150000;
  if (childCount === 2) return 350000;
  return 350000 + (childCount - 2) * 300000;
}

export default function TaxRefundCalculator() {
  // 기본 정보
  const [annualSalary, setAnnualSalary] = useState('');
  const [paidTax, setPaidTax] = useState('');

  // 인적공제
  const [hasSpouse, setHasSpouse] = useState(false);
  const [dependents, setDependents] = useState(0);
  const [children, setChildren] = useState(0);

  // 소득공제
  const [nationalPension, setNationalPension] = useState('');
  const [healthInsurance, setHealthInsurance] = useState('');
  const [employmentInsurance, setEmploymentInsurance] = useState('');
  const [creditCardDeduction, setCreditCardDeduction] = useState('');

  // 세액공제
  const [pensionSavings, setPensionSavings] = useState('');
  const [insurancePremium, setInsurancePremium] = useState('');
  const [medicalExpense, setMedicalExpense] = useState('');
  const [educationExpense, setEducationExpense] = useState('');
  const [donation, setDonation] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  const [result, setResult] = useState<{
    employmentDeduction: number;
    personalExemption: number;
    specialDeduction: number;
    taxableIncome: number;
    calculatedTax: number;
    taxCredits: number;
    finalTax: number;
    refund: number;
  } | null>(null);

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? parseInt(num).toLocaleString() : '';
  };

  const parseNumber = (value: string) => {
    return parseInt(value.replace(/[^0-9]/g, '') || '0');
  };

  const calculate = () => {
    const salary = parseNumber(annualSalary);
    const paid = parseNumber(paidTax);

    if (salary === 0) {
      alert('연간 총급여를 입력해주세요.');
      return;
    }

    // 1. 근로소득공제 계산
    const employmentDeduction = calculateEmploymentDeduction(salary);

    // 2. 근로소득금액
    const earnedIncome = salary - employmentDeduction;

    // 3. 인적공제 (기본공제)
    const personalExemption = 1500000 * (1 + (hasSpouse ? 1 : 0) + dependents + children);

    // 4. 특별소득공제 (국민연금, 건강보험, 고용보험)
    const pension = parseNumber(nationalPension);
    const health = parseNumber(healthInsurance);
    const employment = parseNumber(employmentInsurance);
    const creditCard = parseNumber(creditCardDeduction);

    const specialDeduction = pension + health + employment + creditCard;

    // 5. 과세표준
    const taxableIncome = Math.max(earnedIncome - personalExemption - specialDeduction, 0);

    // 6. 산출세액
    const calculatedTax = calculateTax(taxableIncome);

    // 7. 세액공제 계산
    const earnedIncomeCredit = calculateEarnedIncomeCredit(calculatedTax, salary);
    const childCredit = calculateChildCredit(children);

    // 연금저축 세액공제 (최대 400만원 한도, 공제율 12~15%)
    const pensionCredit = Math.min(parseNumber(pensionSavings), 4000000) * (salary <= 55000000 ? 0.15 : 0.12);

    // 보험료 세액공제 (최대 100만원 한도, 12%)
    const insuranceCredit = Math.min(parseNumber(insurancePremium), 1000000) * 0.12;

    // 의료비 세액공제 (총급여의 3% 초과분, 15%)
    const medicalThreshold = salary * 0.03;
    const medicalCredit = Math.max(parseNumber(medicalExpense) - medicalThreshold, 0) * 0.15;

    // 교육비 세액공제 (15%)
    const educationCredit = parseNumber(educationExpense) * 0.15;

    // 기부금 세액공제 (15~30%)
    const donationCredit = parseNumber(donation) * 0.15;

    // 월세 세액공제 (최대 750만원, 17%)
    const rentCredit = Math.min(parseNumber(monthlyRent), 7500000) * 0.17;

    const totalCredits = earnedIncomeCredit + childCredit + pensionCredit + insuranceCredit +
                         medicalCredit + educationCredit + donationCredit + rentCredit;

    // 8. 결정세액
    const finalTax = Math.max(calculatedTax - totalCredits, 0);

    // 9. 환급/추가납부액
    const refund = paid - finalTax;

    setResult({
      employmentDeduction,
      personalExemption,
      specialDeduction,
      taxableIncome,
      calculatedTax,
      taxCredits: totalCredits,
      finalTax,
      refund,
    });
  };

  const reset = () => {
    setAnnualSalary('');
    setPaidTax('');
    setHasSpouse(false);
    setDependents(0);
    setChildren(0);
    setNationalPension('');
    setHealthInsurance('');
    setEmploymentInsurance('');
    setCreditCardDeduction('');
    setPensionSavings('');
    setInsurancePremium('');
    setMedicalExpense('');
    setEducationExpense('');
    setDonation('');
    setMonthlyRent('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ToolJsonLd name="연말정산 환급액 계산기" description="2025년 귀속 연말정산 예상 환급액을 계산합니다" url="/tools/tax-refund-calculator" />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">&gt;</span>
        <Link href="/tools" className="hover:text-blue-600">도구</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">연말정산 환급액 계산기</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">연말정산 환급액 계산기</h1>
        <p className="text-gray-600">
          2025년 귀속 연말정산 예상 환급액을 계산해보세요. 국세청 공식 세율 및 공제율을 적용했습니다.
        </p>
      </div>

      <div className="space-y-8">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연간 총급여 (세전)
              </label>
              <input
                type="text"
                value={formatNumber(annualSalary)}
                onChange={(e) => setAnnualSalary(e.target.value)}
                placeholder="50,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">원천징수영수증의 총급여 금액</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기납부 세액 (원천징수된 세금)
              </label>
              <input
                type="text"
                value={formatNumber(paidTax)}
                onChange={(e) => setPaidTax(e.target.value)}
                placeholder="3,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">매월 급여에서 공제된 세금의 합계</p>
            </div>
          </div>
        </div>

        {/* 인적공제 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">인적공제 (1인당 150만원)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">배우자 공제</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">연소득 100만원 이하</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부양가족 수 (배우자 제외)
              </label>
              <select
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}명</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                자녀 수 (만 7세 이상)
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}명</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">자녀세액공제 별도 적용</p>
            </div>
          </div>
        </div>

        {/* 소득공제 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">소득공제</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                국민연금 납입액
              </label>
              <input
                type="text"
                value={formatNumber(nationalPension)}
                onChange={(e) => setNationalPension(e.target.value)}
                placeholder="2,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                건강보험료 (본인부담분)
              </label>
              <input
                type="text"
                value={formatNumber(healthInsurance)}
                onChange={(e) => setHealthInsurance(e.target.value)}
                placeholder="1,500,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                고용보험료
              </label>
              <input
                type="text"
                value={formatNumber(employmentInsurance)}
                onChange={(e) => setEmploymentInsurance(e.target.value)}
                placeholder="400,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                신용카드 등 소득공제액
              </label>
              <input
                type="text"
                value={formatNumber(creditCardDeduction)}
                onChange={(e) => setCreditCardDeduction(e.target.value)}
                placeholder="1,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">총급여 25% 초과 사용분의 공제금액</p>
            </div>
          </div>
        </div>

        {/* 세액공제 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">세액공제</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연금저축 납입액 (연간)
              </label>
              <input
                type="text"
                value={formatNumber(pensionSavings)}
                onChange={(e) => setPensionSavings(e.target.value)}
                placeholder="4,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">최대 400만원, 12~15% 공제</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                보장성보험료 (연간)
              </label>
              <input
                type="text"
                value={formatNumber(insurancePremium)}
                onChange={(e) => setInsurancePremium(e.target.value)}
                placeholder="1,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">최대 100만원, 12% 공제</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                의료비 지출액 (연간)
              </label>
              <input
                type="text"
                value={formatNumber(medicalExpense)}
                onChange={(e) => setMedicalExpense(e.target.value)}
                placeholder="2,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">총급여 3% 초과분의 15% 공제</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                교육비 지출액 (연간)
              </label>
              <input
                type="text"
                value={formatNumber(educationExpense)}
                onChange={(e) => setEducationExpense(e.target.value)}
                placeholder="3,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">15% 공제</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기부금 (연간)
              </label>
              <input
                type="text"
                value={formatNumber(donation)}
                onChange={(e) => setDonation(e.target.value)}
                placeholder="500,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">15% 공제 (1천만원 초과분 30%)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월세 납입액 (연간)
              </label>
              <input
                type="text"
                value={formatNumber(monthlyRent)}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="6,000,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">최대 750만원, 17% 공제 (총급여 7천만원 이하)</p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            환급액 계산하기
          </button>
          <button
            onClick={reset}
            className="py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            초기화
          </button>
        </div>

        {/* 결과 */}
        {result && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">계산 결과</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">연간 총급여</span>
                <span className="font-medium">{parseNumber(annualSalary).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">(-) 근로소득공제</span>
                <span className="font-medium">{Math.round(result.employmentDeduction).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">(-) 인적공제</span>
                <span className="font-medium">{result.personalExemption.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">(-) 특별소득공제</span>
                <span className="font-medium">{result.specialDeduction.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 font-semibold">
                <span className="text-gray-800">과세표준</span>
                <span>{Math.round(result.taxableIncome).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">산출세액</span>
                <span className="font-medium">{Math.round(result.calculatedTax).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">(-) 세액공제 합계</span>
                <span className="font-medium">{Math.round(result.taxCredits).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 font-semibold">
                <span className="text-gray-800">결정세액</span>
                <span>{Math.round(result.finalTax).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-gray-600">기납부세액</span>
                <span className="font-medium">{parseNumber(paidTax).toLocaleString()}원</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${result.refund >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {result.refund >= 0 ? '예상 환급액' : '예상 추가납부액'}
                </p>
                <p className={`text-3xl font-bold ${result.refund >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.refund >= 0 ? '+' : ''}{Math.round(result.refund).toLocaleString()}원
                </p>
              </div>
            </div>

            {result.refund >= 0 ? (
              <p className="text-sm text-gray-600 mt-4 text-center">
                기납부세액이 결정세액보다 많아 {Math.round(result.refund).toLocaleString()}원을 환급받을 수 있습니다.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-4 text-center">
                기납부세액이 결정세액보다 적어 {Math.round(Math.abs(result.refund)).toLocaleString()}원을 추가로 납부해야 합니다.
              </p>
            )}
          </div>
        )}

        {/* 2025년 귀속 소득세율표 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2025년 귀속 근로소득세율표</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">과세표준</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">세율</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">누진공제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2">1,400만원 이하</td><td className="px-4 py-2 text-center">6%</td><td className="px-4 py-2 text-right">-</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-2">1,400만원 ~ 5,000만원</td><td className="px-4 py-2 text-center">15%</td><td className="px-4 py-2 text-right">126만원</td></tr>
                <tr><td className="px-4 py-2">5,000만원 ~ 8,800만원</td><td className="px-4 py-2 text-center">24%</td><td className="px-4 py-2 text-right">576만원</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-2">8,800만원 ~ 1.5억원</td><td className="px-4 py-2 text-center">35%</td><td className="px-4 py-2 text-right">1,544만원</td></tr>
                <tr><td className="px-4 py-2">1.5억원 ~ 3억원</td><td className="px-4 py-2 text-center">38%</td><td className="px-4 py-2 text-right">1,994만원</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-2">3억원 ~ 5억원</td><td className="px-4 py-2 text-center">40%</td><td className="px-4 py-2 text-right">2,594만원</td></tr>
                <tr><td className="px-4 py-2">5억원 ~ 10억원</td><td className="px-4 py-2 text-center">42%</td><td className="px-4 py-2 text-right">3,594만원</td></tr>
                <tr className="bg-gray-50"><td className="px-4 py-2">10억원 초과</td><td className="px-4 py-2 text-center">45%</td><td className="px-4 py-2 text-right">6,594만원</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 공식 자료 안내 */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">공식 자료 안내</h2>
          <p className="text-sm text-amber-700 mb-4">
            본 계산기는 2025년 귀속 연말정산 기준으로 제작되었으며, 참고용으로만 사용해주세요.
            정확한 세금 계산은 아래 공식 자료를 확인하시거나, 국세청 상담센터(126)로 문의하시기 바랍니다.
          </p>
          <div className="space-y-2">
            <a
              href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2304&cntntsId=238938"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-amber-800 hover:text-amber-900 underline"
            >
              <span>국세청 연말정산 종합 안내 페이지</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://www.hometax.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-amber-800 hover:text-amber-900 underline"
            >
              <span>국세청 홈택스 - 연말정산 간소화 서비스</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://call.nts.go.kr/call/taxInfo/selectTaxInfo.do?mi=1317"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-amber-800 hover:text-amber-900 underline"
            >
              <span>국세청 연말정산 상담도우미</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>면책조항:</strong> 본 계산기의 결과는 예상치이며, 실제 환급액과 다를 수 있습니다.
              개인의 상황에 따라 적용되는 공제 항목과 한도가 다르므로, 정확한 계산은 반드시
              국세청 홈택스 연말정산 간소화 서비스 또는 세무 전문가와 상담하시기 바랍니다.
            </p>
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
                  name: '연말정산 환급은 언제 받나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '연말정산은 매년 1월 중순~2월 중순에 진행되며, 환급금은 보통 2월 또는 3월 급여에 포함되어 지급됩니다. 회사마다 지급 시기가 다를 수 있으므로 회사 인사팀에 확인하시기 바랍니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '연말정산에서 가장 절세 효과가 큰 항목은 무엇인가요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '연금저축/IRP 세액공제(최대 연 900만원, 공제율 12~16.5%), 월세 세액공제(최대 750만원, 17%), 신용카드 소득공제(총급여 25% 초과 사용분)가 대표적입니다. 총급여 5,500만원 이하인 경우 공제율이 더 높아 절세 효과가 큽니다.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '연말정산을 못하면 어떻게 하나요?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '연말정산을 놓쳤거나 추가 공제를 적용하고 싶다면, 5월 종합소득세 신고 기간에 확정신고를 통해 정정할 수 있습니다. 홈택스에서 경정청구를 하면 최대 5년 이내 환급이 가능합니다.',
                  },
                },
              ],
            }),
          }}
        />

        {/* 사용 예시 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">연말정산 환급액 계산기 사용 예시</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">연봉 5,000만원, 기납부세액 300만원, 연금저축 400만원</p>
              <p className="text-sm text-gray-600">
                근로소득공제 후 과세표준 약 3,300만원, 산출세액 약 370만원.
                근로소득세액공제 + 연금저축 세액공제(15%) 60만원 적용.
                결정세액 약 240만원으로, 기납부세액 300만원과의 차이 약 60만원 환급 가능.
              </p>
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">연봉 3,500만원, 월세 연 600만원 납부</p>
              <p className="text-sm text-gray-600">
                총급여 7천만원 이하이므로 월세 세액공제 17% 적용.
                월세 600만원 x 17% = 102만원 세액공제.
                다른 공제 항목과 합산하면 상당한 환급을 받을 수 있습니다.
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
                연말정산 환급은 언제 받나요?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600">
                연말정산은 매년 1월 중순~2월 중순에 진행되며, 환급금은 보통 2월 또는 3월 급여에 포함되어 지급됩니다.
                회사마다 지급 시기가 다를 수 있으므로 회사 인사팀에 확인하시기 바랍니다.
              </div>
            </details>
            <details className="group border border-gray-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
                연말정산에서 가장 절세 효과가 큰 항목은 무엇인가요?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600">
                연금저축/IRP 세액공제(최대 연 900만원, 공제율 12~16.5%), 월세 세액공제(최대 750만원, 17%),
                신용카드 소득공제(총급여 25% 초과 사용분)가 대표적입니다.
                총급여 5,500만원 이하인 경우 공제율이 더 높아 절세 효과가 큽니다.
              </div>
            </details>
            <details className="group border border-gray-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
                연말정산을 못하면 어떻게 하나요?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-600">
                연말정산을 놓쳤거나 추가 공제를 적용하고 싶다면, 5월 종합소득세 신고 기간에 확정신고를 통해
                정정할 수 있습니다. 홈택스에서 경정청구를 하면 최대 5년 이내 환급이 가능합니다.
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
            <Link href="/tools/income-tax-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">종합소득세 계산기</span>
              <p className="text-sm text-gray-500 mt-1">프리랜서·사업자 종합소득세 계산</p>
            </Link>
            <Link href="/tools/pension-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">국민연금 수령액 계산기</span>
              <p className="text-sm text-gray-500 mt-1">예상 국민연금 월 수령액 계산</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
