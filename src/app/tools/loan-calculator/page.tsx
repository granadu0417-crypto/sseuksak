'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

type RepaymentMethod = 'equal_payment' | 'equal_principal' | 'bullet';

interface MonthlyPayment {
  month: number;
  principal: number;
  interest: number;
  payment: number;
  balance: number;
}

interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: MonthlyPayment[];
}

function calculateEqualPayment(
  principal: number,
  annualRate: number,
  months: number,
  gracePeriod: number
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthlyPayment[] = [];
  let balance = principal;
  let totalInterest = 0;

  // 거치기간
  for (let i = 1; i <= gracePeriod; i++) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    schedule.push({
      month: i,
      principal: 0,
      interest: Math.round(interest),
      payment: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  // 상환기간
  const repaymentMonths = months - gracePeriod;
  let monthlyPayment = 0;

  if (monthlyRate === 0) {
    monthlyPayment = principal / repaymentMonths;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
      (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
  }

  for (let i = gracePeriod + 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;
    totalInterest += interest;

    schedule.push({
      month: i,
      principal: Math.round(principalPayment),
      interest: Math.round(interest),
      payment: Math.round(monthlyPayment),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

function calculateEqualPrincipal(
  principal: number,
  annualRate: number,
  months: number,
  gracePeriod: number
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthlyPayment[] = [];
  let balance = principal;
  let totalInterest = 0;

  // 거치기간
  for (let i = 1; i <= gracePeriod; i++) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    schedule.push({
      month: i,
      principal: 0,
      interest: Math.round(interest),
      payment: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  // 상환기간
  const repaymentMonths = months - gracePeriod;
  const monthlyPrincipal = principal / repaymentMonths;

  for (let i = gracePeriod + 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const payment = monthlyPrincipal + interest;
    balance -= monthlyPrincipal;
    totalInterest += interest;

    schedule.push({
      month: i,
      principal: Math.round(monthlyPrincipal),
      interest: Math.round(interest),
      payment: Math.round(payment),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  // 첫 달 상환금 (가장 높음)
  const firstPayment = schedule[gracePeriod]?.payment || 0;

  return {
    monthlyPayment: firstPayment,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

function calculateBullet(
  principal: number,
  annualRate: number,
  months: number
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthlyPayment[] = [];
  const monthlyInterest = principal * monthlyRate;
  const totalInterest = monthlyInterest * months;

  for (let i = 1; i <= months; i++) {
    const isLastMonth = i === months;
    schedule.push({
      month: i,
      principal: isLastMonth ? Math.round(principal) : 0,
      interest: Math.round(monthlyInterest),
      payment: isLastMonth
        ? Math.round(principal + monthlyInterest)
        : Math.round(monthlyInterest),
      balance: isLastMonth ? 0 : Math.round(principal),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyInterest),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

function formatMoneyShort(amount: number): string {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(1).replace(/\.0$/, '') + '억원';
  }
  if (amount >= 10000) {
    return (amount / 10000).toFixed(0) + '만원';
  }
  return amount.toLocaleString('ko-KR') + '원';
}

const QUICK_AMOUNTS = [
  { label: '1천만', value: 10000000 },
  { label: '3천만', value: 30000000 },
  { label: '5천만', value: 50000000 },
  { label: '1억', value: 100000000 },
  { label: '2억', value: 200000000 },
  { label: '3억', value: 300000000 },
];

const QUICK_RATES = [
  { label: '3%', value: 3 },
  { label: '4%', value: 4 },
  { label: '5%', value: 5 },
  { label: '6%', value: 6 },
  { label: '7%', value: 7 },
];

const QUICK_PERIODS = [
  { label: '1년', value: 12 },
  { label: '3년', value: 36 },
  { label: '5년', value: 60 },
  { label: '10년', value: 120 },
  { label: '20년', value: 240 },
  { label: '30년', value: 360 },
];

export default function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState(100000000);
  const [annualRate, setAnnualRate] = useState(5);
  const [months, setMonths] = useState(120);
  const [gracePeriod, setGracePeriod] = useState(0);
  const [method, setMethod] = useState<RepaymentMethod>('equal_payment');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const result = useMemo(() => {
    if (principal <= 0 || annualRate < 0 || months <= 0) return null;
    if (gracePeriod >= months) return null;

    switch (method) {
      case 'equal_payment':
        return calculateEqualPayment(principal, annualRate, months, gracePeriod);
      case 'equal_principal':
        return calculateEqualPrincipal(principal, annualRate, months, gracePeriod);
      case 'bullet':
        return calculateBullet(principal, annualRate, months);
    }
  }, [principal, annualRate, months, gracePeriod, method]);

  const comparison = useMemo(() => {
    if (principal <= 0 || annualRate < 0 || months <= 0) return null;
    if (gracePeriod >= months) return null;

    return {
      equalPayment: calculateEqualPayment(principal, annualRate, months, gracePeriod),
      equalPrincipal: calculateEqualPrincipal(principal, annualRate, months, gracePeriod),
      bullet: calculateBullet(principal, annualRate, months),
    };
  }, [principal, annualRate, months, gracePeriod]);

  const methodLabels: Record<RepaymentMethod, string> = {
    equal_payment: '원리금균등상환',
    equal_principal: '원금균등상환',
    bullet: '만기일시상환',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="대출이자 계산기" description="대출 조건별 월 상환금과 총 이자를 비교 계산합니다" url="/tools/loan-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대출이자 계산기</h1>
        <p className="text-gray-600">
          대출 조건을 입력하면 월 상환금과 총 이자를 계산해드려요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">대출 정보 입력</h3>

        {/* 대출금액 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대출금액
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step={10000000}
            min={0}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_AMOUNTS.map((item) => (
              <button
                key={item.value}
                onClick={() => setPrincipal(item.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  principal === item.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 연이자율 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연이자율 (%)
          </label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step={0.1}
            min={0}
            max={30}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_RATES.map((item) => (
              <button
                key={item.value}
                onClick={() => setAnnualRate(item.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  annualRate === item.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 대출기간 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대출기간
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step={12}
              min={1}
              max={600}
            />
            <span className="text-gray-600 whitespace-nowrap">개월</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_PERIODS.map((item) => (
              <button
                key={item.value}
                onClick={() => setMonths(item.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  months === item.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 상환방법 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상환방법
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(methodLabels) as RepaymentMethod[]).map((key) => (
              <button
                key={key}
                onClick={() => setMethod(key)}
                className={`px-4 py-3 text-sm rounded-lg border transition-colors ${
                  method === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {methodLabels[key]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {method === 'equal_payment' &&
              '매달 동일한 금액을 상환합니다. 초기 이자 비중이 높습니다.'}
            {method === 'equal_principal' &&
              '매달 동일한 원금을 상환합니다. 총 이자가 가장 적습니다.'}
            {method === 'bullet' &&
              '매달 이자만 납부하고 만기에 원금을 상환합니다.'}
          </p>
        </div>

        {/* 거치기간 (만기일시상환 제외) */}
        {method !== 'bullet' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              거치기간 (선택)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step={1}
                min={0}
                max={months - 1}
              />
              <span className="text-gray-600 whitespace-nowrap">개월</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              거치기간 동안은 이자만 납부합니다
            </p>
          </div>
        )}
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">
              {methodLabels[method]} 기준 월 상환금
            </p>
            <p className="text-4xl font-bold text-blue-600">
              {formatMoney(result.monthlyPayment)}
            </p>
            {method === 'equal_principal' && (
              <p className="text-sm text-gray-500 mt-1">
                (첫 달 기준, 매월 감소)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">총 이자</p>
              <p className="text-xl font-bold text-red-500">
                {formatMoney(result.totalInterest)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">총 상환금</p>
              <p className="text-xl font-bold text-gray-900">
                {formatMoney(result.totalPayment)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">대출 요약</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>대출원금</span>
                <span>{formatMoney(principal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>연이자율</span>
                <span>{annualRate}%</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>대출기간</span>
                <span>
                  {Math.floor(months / 12)}년 {months % 12 > 0 ? `${months % 12}개월` : ''}
                </span>
              </div>
              {gracePeriod > 0 && method !== 'bullet' && (
                <div className="flex justify-between text-gray-600">
                  <span>거치기간</span>
                  <span>{gracePeriod}개월</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>상환방법</span>
                <span>{methodLabels[method]}</span>
              </div>
            </div>
          </div>

          {/* 상환방식 비교 버튼 */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors mb-3"
          >
            {showComparison ? '비교 숨기기' : '상환방식 비교하기'}
          </button>

          {/* 상환 스케줄 버튼 */}
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {showSchedule ? '상환 스케줄 숨기기' : '상환 스케줄 보기'}
          </button>
        </div>
      )}

      {/* 상환방식 비교 */}
      {showComparison && comparison && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">상환방식 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">
                    구분
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    원리금균등
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    원금균등
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    만기일시
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-700">월 상환금</td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatMoneyShort(comparison.equalPayment.monthlyPayment)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatMoneyShort(comparison.equalPrincipal.monthlyPayment)}
                    <span className="text-xs text-gray-500 block">
                      (첫 달)
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatMoneyShort(comparison.bullet.monthlyPayment)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-700">총 이자</td>
                  <td className="py-3 px-2 text-right text-red-500">
                    {formatMoneyShort(comparison.equalPayment.totalInterest)}
                  </td>
                  <td className="py-3 px-2 text-right text-green-600 font-semibold">
                    {formatMoneyShort(comparison.equalPrincipal.totalInterest)}
                    <span className="text-xs block">(최저)</span>
                  </td>
                  <td className="py-3 px-2 text-right text-red-600">
                    {formatMoneyShort(comparison.bullet.totalInterest)}
                    <span className="text-xs block">(최고)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 text-gray-700">총 상환금</td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatMoneyShort(comparison.equalPayment.totalPayment)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-green-600">
                    {formatMoneyShort(comparison.equalPrincipal.totalPayment)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatMoneyShort(comparison.bullet.totalPayment)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>원금균등상환</strong>이 총 이자{' '}
              <strong>
                {formatMoney(
                  comparison.equalPayment.totalInterest -
                    comparison.equalPrincipal.totalInterest
                )}
              </strong>{' '}
              절약으로 가장 유리합니다.
            </p>
          </div>
        </div>
      )}

      {/* 상환 스케줄 */}
      {showSchedule && result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            상환 스케줄 ({methodLabels[method]})
          </h3>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-center py-2 px-2 text-gray-600 font-medium">
                    회차
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    상환금
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    원금
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    이자
                  </th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">
                    잔액
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr
                    key={row.month}
                    className={`border-b border-gray-100 ${
                      row.month <= gracePeriod && method !== 'bullet'
                        ? 'bg-yellow-50'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-center text-gray-700">
                      {row.month}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {formatMoney(row.payment)}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-600">
                      {formatMoney(row.principal)}
                    </td>
                    <td className="py-2 px-2 text-right text-red-500">
                      {formatMoney(row.interest)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {formatMoney(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gracePeriod > 0 && method !== 'bullet' && (
            <p className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
              노란색 행은 거치기간으로, 이자만 납부합니다.
            </p>
          )}
        </div>
      )}

      {/* 상환방식 안내 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">상환방식 안내</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">원리금균등상환</h4>
            <p className="text-sm text-blue-800">
              매달 동일한 금액을 상환합니다. 초기에는 이자 비중이 높고, 시간이
              지날수록 원금 비중이 높아집니다. 월 상환금이 일정해 자금 계획이
              쉽습니다.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">원금균등상환</h4>
            <p className="text-sm text-green-800">
              매달 동일한 원금을 상환합니다. 초기 상환 부담이 크지만, 시간이
              지날수록 상환금이 줄어들고 <strong>총 이자가 가장 적습니다.</strong>
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">만기일시상환</h4>
            <p className="text-sm text-orange-800">
              매달 이자만 납부하고 만기에 원금을 한 번에 상환합니다. 월 납입금이
              가장 적지만, <strong>총 이자가 가장 많습니다.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 계산 결과는 참고용이며, 실제 대출 조건과 다를 수 있습니다.</li>
          <li>* 금융기관별로 이자 계산 방식이 다를 수 있습니다.</li>
          <li>* 중도상환 수수료, 대출 부대비용 등은 포함되지 않았습니다.</li>
          <li>* 변동금리 대출의 경우 금리 변동에 따라 상환금이 달라집니다.</li>
        </ul>
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
                name: '원리금균등상환과 원금균등상환의 차이는?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '원리금균등상환은 매달 동일한 금액을 납부하고, 원금균등상환은 매달 동일한 원금을 납부합니다. 원금균등상환이 총 이자가 적지만 초기 부담이 크며, 원리금균등상환은 자금 계획이 쉽습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '거치기간이란 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '거치기간은 대출 초기에 원금 상환 없이 이자만 납부하는 기간입니다. 초기 부담을 줄일 수 있지만, 총 이자 부담이 늘어납니다.',
                },
              },
              {
                '@type': 'Question',
                name: '대출 상환 방식 중 어떤 것이 가장 유리한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '총 이자 비용 기준으로 원금균등상환이 가장 유리합니다. 다만 초기 상환 부담이 크므로 소득과 상황에 맞게 선택해야 합니다. 만기일시상환은 월 납입금이 가장 적지만 총 이자가 가장 많습니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 상세 가이드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">대출이자 계산 완벽 가이드</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">대출 상환 방식 3가지 비교</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>원리금균등</strong>: 매달 같은 금액(원금+이자)을 납부. 초반 이자 비중 높고 점차 원금 비중 증가. 월 납입액이 일정하여 가계 예산 관리에 유리</li>
              <li><strong>원금균등</strong>: 매달 같은 원금을 갚고 이자는 줄어듦. 초반 부담이 크지만 총 이자가 가장 적음</li>
              <li><strong>만기일시</strong>: 매달 이자만 내고 만기에 원금 전액 상환. 월 부담 가장 낮지만 총 이자가 가장 많음</li>
            </ul>
            <p className="mt-2">1억원, 연 4%, 20년 기준 총 이자: 원리금균등 약 4,553만원, 원금균등 약 4,017만원, 만기일시 약 8,000만원. 상환 방식에 따라 이자 차이가 수천만원에 달합니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">고정금리 vs 변동금리 vs 혼합금리</h3>
            <p>고정금리는 대출 기간 내내 같은 금리가 적용되어 예측 가능성이 높습니다. 변동금리는 기준금리(COFIX, CD금리 등)에 가산금리를 더해 주기적(3~6개월)으로 변동합니다. 혼합금리는 초기 일정 기간(3~5년) 고정 후 변동으로 전환됩니다. 금리 인상기에는 고정, 인하기에는 변동이 유리합니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">중도상환수수료</h3>
            <p>대출을 조기에 갚으면 중도상환수수료가 부과됩니다. 통상 1.2~1.5%이며, 대출 실행 후 3년이 지나면 면제되는 경우가 많습니다. 중도상환수수료 = 상환금액 x 수수료율 x (잔여기간/약정기간)으로 계산합니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">DTI와 DSR 규제</h3>
            <p>DTI(총부채상환비율)는 소득 대비 주담대 원리금+기타대출 이자의 비율입니다. DSR(총부채원리금상환비율)은 모든 대출의 원리금 상환액을 소득과 비교합니다. 개인별 DSR 40% 규제가 적용되어 연소득 5,000만원이면 연간 원리금 상환 한도가 2,000만원(월 167만원)입니다.</p>
          </div>
        </div>
      </div>

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">대출이자 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">주택담보대출 3억원, 금리 3.5%, 30년</p>
            <p className="text-sm text-gray-600">
              원리금균등: 월 134.7만원 / 총이자 1억 8,480만원.
              원금균등 선택 시 총이자 1억 5,793만원으로 약 2,687만원 절약됩니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">전세대출 2억원, 금리 3.2%, 2년 만기일시</p>
            <p className="text-sm text-gray-600">
              월 이자만 53.3만원 납부, 만기 시 원금 2억 일시상환.
              총 이자 1,280만원. 전세보증금 반환으로 일시상환하는 구조입니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">신용대출 5,000만원, 금리 5.5%, 5년 (거치 1년)</p>
            <p className="text-sm text-gray-600">
              거치기간 1년간 월 22.9만원(이자만), 이후 월 100.7만원 상환.
              거치 없을 때 대비 총이자가 약 137만원 더 발생합니다.
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
              원리금균등과 원금균등, 어떤 게 유리한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              총 이자 기준으로 원금균등상환이 유리합니다. 하지만 초기 월 상환금이 크기 때문에
              소득 여유가 있는 경우에 적합합니다. 일정한 상환금을 원하면 원리금균등이 편리합니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              거치기간을 두면 얼마나 손해인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              거치기간 동안 원금이 줄지 않아 이자가 계속 발생합니다. 예를 들어 3억 대출(금리 3.5%)에서
              1년 거치 시 약 300만원, 3년 거치 시 약 800만원의 추가 이자가 발생합니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              중도상환하면 이자를 줄일 수 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              네. 원금을 미리 상환하면 남은 기간의 이자가 줄어듭니다. 다만 중도상환 수수료(보통 1~1.5%)가
              부과될 수 있으므로, 수수료와 절약되는 이자를 비교해야 합니다. 대출 후 3년이 지나면 수수료가 면제되는 경우가 많습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              변동금리와 고정금리, 어떤 걸 선택해야 하나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              금리 하락기에는 변동금리가, 금리 상승기에는 고정금리가 유리합니다.
              장기 대출(20년 이상)은 고정금리가 안정적이고, 단기 대출(5년 이하)은 변동금리도 고려할 만합니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 링크 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 글</h3>
        <div className="space-y-2">
          <Link
            href="/posts/mortgage-rate-comparison-2026"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">
              주택담보대출 금리 비교 가이드
            </span>
            <p className="text-sm text-gray-500 mt-1">
              은행별 금리 비교와 대출 전략
            </p>
          </Link>
          <Link
            href="/posts/jeonse-loan-comparison-2026"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">
              전세대출 조건 비교 가이드
            </span>
            <p className="text-sm text-gray-500 mt-1">
              청년버팀목, 신혼부부 전세대출 조건
            </p>
          </Link>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/rent-conversion-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">전월세 전환율 계산기</span>
            <p className="text-sm text-gray-500 mt-1">전세↔월세 전환율과 적정 월세 계산</p>
          </Link>
          <Link href="/tools/savings-interest-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">적금 이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">적금/예금 이자와 세후 실수령액 계산</p>
          </Link>
          <Link href="/tools/salary-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
