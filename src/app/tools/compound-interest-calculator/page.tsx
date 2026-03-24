'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

const QUICK_AMOUNTS = [
  { label: '100만', value: 1000000 },
  { label: '500만', value: 5000000 },
  { label: '1,000만', value: 10000000 },
  { label: '3,000만', value: 30000000 },
  { label: '5,000만', value: 50000000 },
  { label: '1억', value: 100000000 },
];

const QUICK_RATES = [3, 5, 7, 10, 12, 15];
const QUICK_YEARS = [1, 3, 5, 10, 20, 30];

// 복리 주기
const COMPOUND_PERIODS = [
  { label: '월복리', value: 12 },
  { label: '분기복리', value: 4 },
  { label: '반기복리', value: 2 },
  { label: '연복리', value: 1 },
];

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

function formatExact(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

function calculate(principal: number, rate: number, years: number, compoundPerYear: number, monthlyAdd: number) {
  const r = rate / 100;
  const n = compoundPerYear;
  const t = years;

  // 복리 원금
  const compoundPrincipal = principal * Math.pow(1 + r / n, n * t);

  // 월 적립금 복리 (적립식)
  let additionTotal = 0;
  if (monthlyAdd > 0) {
    // 매월 적립 → 월복리 기준 미래가치
    const monthlyRate = r / 12;
    const totalMonths = years * 12;
    additionTotal = monthlyAdd * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  }

  const totalCompound = compoundPrincipal + additionTotal;
  const totalInvested = principal + monthlyAdd * years * 12;
  const totalInterest = totalCompound - totalInvested;

  // 단리 비교
  const simpleTotal = principal * (1 + r * t) + monthlyAdd * years * 12;
  const simpleInterest = simpleTotal - totalInvested;

  // 연도별 추이
  const yearlyData = [];
  for (let y = 1; y <= years; y++) {
    const cp = principal * Math.pow(1 + r / n, n * y);
    let ap = 0;
    if (monthlyAdd > 0) {
      const monthlyRate = r / 12;
      const months = y * 12;
      ap = monthlyAdd * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }
    const total = cp + ap;
    const invested = principal + monthlyAdd * y * 12;
    yearlyData.push({
      year: y,
      invested,
      total: Math.round(total),
      interest: Math.round(total - invested),
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    totalCompound: Math.round(totalCompound),
    totalInterest: Math.round(totalInterest),
    simpleTotal: Math.round(simpleTotal),
    simpleInterest: Math.round(simpleInterest),
    compoundAdvantage: Math.round(totalInterest - simpleInterest),
    yearlyData,
  };
}

export default function CompoundInterestCalculatorPage() {
  const [principal, setPrincipal] = useState<string>('10000000');
  const [rate, setRate] = useState<string>('7');
  const [years, setYears] = useState<string>('10');
  const [compoundPeriod, setCompoundPeriod] = useState(12);
  const [monthlyAdd, setMonthlyAdd] = useState<string>('0');

  const result = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseInt(years) || 0;
    const m = parseFloat(monthlyAdd) || 0;
    if (p <= 0 || r <= 0 || y <= 0) return null;
    return calculate(p, r, y, compoundPeriod, m);
  }, [principal, rate, years, compoundPeriod, monthlyAdd]);

  // 수익률별 비교
  const rateComparison = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const y = parseInt(years) || 0;
    const m = parseFloat(monthlyAdd) || 0;
    if (p <= 0 || y <= 0) return [];
    return [3, 5, 7, 10, 15].map((r) => {
      const res = calculate(p, r, y, compoundPeriod, m);
      return { rate: r, total: res.totalCompound, interest: res.totalInterest };
    });
  }, [principal, years, compoundPeriod, monthlyAdd]);

  // 최대 바 값
  const maxTotal = result ? result.totalCompound : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="복리 계산기"
        description="원금, 수익률, 투자기간을 입력하면 복리 효과로 불어나는 미래 자산을 계산합니다. 단리 대비 복리 이점, 연도별 자산 추이, 월 적립금 포함 시뮬레이션까지."
        url="/tools/compound-interest-calculator"
      />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">복리 계산기</h1>
        <p className="text-gray-600">
          복리의 마법으로 자산이 얼마나 불어나는지 확인해요
        </p>
      </div>

      {/* 원금 입력 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          초기 투자 원금
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            placeholder="원금 입력"
          />
          <span className="text-gray-500 font-medium">원</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q.value}
              onClick={() => setPrincipal(q.value.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                parseInt(principal) === q.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 월 추가 적립금 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          월 추가 적립금 (선택)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={monthlyAdd}
            onChange={(e) => setMonthlyAdd(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            placeholder="0"
          />
          <span className="text-gray-500 font-medium">원/월</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[0, 100000, 300000, 500000, 1000000].map((q) => (
            <button
              key={q}
              onClick={() => setMonthlyAdd(q.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                parseInt(monthlyAdd) === q
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {q === 0 ? '없음' : `${(q / 10000).toLocaleString()}만`}
            </button>
          ))}
        </div>
      </div>

      {/* 연 수익률 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          연 수익률 (%)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
            step="0.1"
            placeholder="수익률 입력"
          />
          <span className="text-gray-500 font-medium">%</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_RATES.map((q) => (
            <button
              key={q}
              onClick={() => setRate(q.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                parseFloat(rate) === q
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {q}%
            </button>
          ))}
        </div>
      </div>

      {/* 투자 기간 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          투자 기간
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="50"
            placeholder="기간 입력"
          />
          <span className="text-gray-500 font-medium">년</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_YEARS.map((q) => (
            <button
              key={q}
              onClick={() => setYears(q.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                parseInt(years) === q
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {q}년
            </button>
          ))}
        </div>
      </div>

      {/* 복리 주기 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">복리 주기</h2>
        <div className="grid grid-cols-4 gap-2">
          {COMPOUND_PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setCompoundPeriod(p.value)}
              className={`py-2 rounded-xl text-sm font-medium transition-all ${
                compoundPeriod === p.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 계산 결과 */}
      {result && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-1">{parseInt(years)}년 후 예상 자산</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatMoney(result.totalCompound)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ({formatExact(result.totalCompound)})
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">총 투자 원금</span>
                <span className="font-medium">{formatMoney(result.totalInvested)}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>복리 수익</span>
                <span className="font-medium">+{formatMoney(result.totalInterest)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-gray-600">수익률</span>
                <span className="font-medium">
                  {result.totalInvested > 0
                    ? `+${((result.totalInterest / result.totalInvested) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* 단리 vs 복리 비교 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">단리 vs 복리 비교</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">단리</span>
                  <span className="font-medium">{formatMoney(result.simpleTotal)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gray-400 h-3 rounded-full"
                    style={{ width: `${(result.simpleTotal / result.totalCompound) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">수익: +{formatMoney(result.simpleInterest)}</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600 font-medium">복리</span>
                  <span className="font-medium">{formatMoney(result.totalCompound)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full w-full" />
                </div>
                <p className="text-xs text-blue-600 mt-0.5">수익: +{formatMoney(result.totalInterest)}</p>
              </div>
              {result.compoundAdvantage > 0 && (
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-blue-700">
                    복리가 단리보다 <strong>{formatMoney(result.compoundAdvantage)}</strong> 더 많습니다
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 수익률별 비교 */}
          {rateComparison.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">수익률별 {parseInt(years)}년 후 자산</h2>
              <div className="space-y-3">
                {rateComparison.map((row) => (
                  <div key={row.rate}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${parseFloat(rate) === row.rate ? 'text-blue-600' : 'text-gray-600'}`}>
                        연 {row.rate}%
                      </span>
                      <span className="font-medium">{formatMoney(row.total)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${parseFloat(rate) === row.rate ? 'bg-blue-500' : 'bg-gray-300'}`}
                        style={{ width: `${Math.min((row.total / (rateComparison[rateComparison.length - 1]?.total || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 연도별 추이 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">연도별 자산 추이</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">년차</th>
                    <th className="text-right py-2 text-gray-600">투자원금</th>
                    <th className="text-right py-2 text-gray-600">총 자산</th>
                    <th className="text-right py-2 text-gray-600">수익</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData
                    .filter((_, i) => {
                      const totalYears = result.yearlyData.length;
                      if (totalYears <= 10) return true;
                      // 긴 기간이면 주요 포인트만
                      return i < 5 || i === Math.floor(totalYears / 2) - 1 || i >= totalYears - 3;
                    })
                    .map((row, idx, arr) => {
                      // 생략 표시
                      const prevYear = idx > 0 ? arr[idx - 1].year : 0;
                      const showEllipsis = row.year - prevYear > 1;
                      return (
                        <tbody key={row.year}>
                          {showEllipsis && (
                            <tr>
                              <td colSpan={4} className="text-center py-1 text-gray-400">...</td>
                            </tr>
                          )}
                          <tr className="border-b border-gray-100">
                            <td className="py-2">{row.year}년</td>
                            <td className="text-right py-2">{formatMoney(row.invested)}</td>
                            <td className="text-right py-2 font-medium">{formatMoney(row.total)}</td>
                            <td className="text-right py-2 text-blue-600">+{formatMoney(row.interest)}</td>
                          </tr>
                        </tbody>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 복리 효과 설명 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">복리의 힘</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span><strong>72의 법칙</strong>: 72 / 수익률 = 원금이 2배 되는 기간. 연 {parseFloat(rate) || 7}%면 약 {Math.round(72 / (parseFloat(rate) || 7))}년</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span><strong>시간이 가장 큰 무기</strong>: 복리 효과는 후반부에 기하급수적으로 커집니다</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span><strong>월 적립 추가</strong>: 소액이라도 꾸준히 넣으면 복리 효과가 극대화됩니다</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* 관련 도구 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">관련 도구</h2>
        <div className="grid gap-3">
          <Link
            href="/tools/savings-interest-calculator"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">적금 이자 계산기</p>
            <p className="text-sm text-gray-500">적금/예금 이자와 세후 실수령액 계산</p>
          </Link>
          <Link
            href="/tools/fire-calculator"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">FIRE 조기은퇴 계산기</p>
            <p className="text-sm text-gray-500">저축률과 투자수익률로 은퇴 시점 계산</p>
          </Link>
          <Link
            href="/tools/savings-goal-simulator"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">목돈 모으기 시뮬레이터</p>
            <p className="text-sm text-gray-500">적금+투자 3가지 전략 비교</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
