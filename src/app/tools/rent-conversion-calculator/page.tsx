'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 2월 기준
const RATES = {
  baseRate: 2.75, // 한국은행 기준금리 (%)
  legalCap: 2.0, // 법정 상한 가산율 (%)
  depositRate: 3.0, // 보증금 기회비용 산정용 예금 금리 (%)
};

const legalMaxRate = RATES.baseRate + RATES.legalCap; // 4.75%

function formatWon(value: number): string {
  return Math.round(value).toLocaleString() + '원';
}

function formatEok(value: number): string {
  const eok = Math.floor(value / 100000000);
  const man = Math.round((value % 100000000) / 10000);
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${man.toLocaleString()}만원`;
}

type CalcMode = 'toMonthly' | 'toRate';

interface ConversionResult {
  jeonseDeposit: number;
  monthlyDeposit: number;
  depositDiff: number;
  conversionRate: number;
  monthlyRent: number;
  annualRent: number;
  isWithinLegal: boolean;
  // 비교 분석
  jeonseLoanCost: number; // 전세대출 시 월 비용 (3.5% 기준)
  monthlyTotalCost: number; // 월세 + 보증금 기회비용
  cheaper: 'jeonse' | 'monthly' | 'same';
  monthlySaving: number;
}

function calculateConversion(
  jeonseDeposit: number,
  monthlyDeposit: number,
  input: number,
  mode: CalcMode
): ConversionResult | null {
  if (jeonseDeposit <= 0 || monthlyDeposit < 0 || jeonseDeposit <= monthlyDeposit) return null;

  const depositDiff = jeonseDeposit - monthlyDeposit;

  let conversionRate: number;
  let monthlyRent: number;

  if (mode === 'toMonthly') {
    // 전환율 → 월세 계산
    conversionRate = input;
    if (conversionRate <= 0) return null;
    monthlyRent = Math.round((depositDiff * (conversionRate / 100)) / 12);
  } else {
    // 월세 → 전환율 계산
    monthlyRent = input;
    if (monthlyRent <= 0) return null;
    conversionRate = ((monthlyRent * 12) / depositDiff) * 100;
  }

  const annualRent = monthlyRent * 12;
  const isWithinLegal = conversionRate <= legalMaxRate;

  // 전세대출 비교 (금리 3.5% 가정)
  const jeonseLoanRate = 3.5;
  const jeonseLoanCost = Math.round((jeonseDeposit * (jeonseLoanRate / 100)) / 12);

  // 월세 실질 비용 (월세 + 보증금 기회비용)
  const depositOpportunityCost = Math.round((monthlyDeposit * (RATES.depositRate / 100)) / 12);
  const monthlyTotalCost = monthlyRent + depositOpportunityCost;

  let cheaper: 'jeonse' | 'monthly' | 'same';
  if (Math.abs(jeonseLoanCost - monthlyTotalCost) < 5000) {
    cheaper = 'same';
  } else if (jeonseLoanCost < monthlyTotalCost) {
    cheaper = 'jeonse';
  } else {
    cheaper = 'monthly';
  }

  const monthlySaving = Math.abs(jeonseLoanCost - monthlyTotalCost);

  return {
    jeonseDeposit,
    monthlyDeposit,
    depositDiff,
    conversionRate,
    monthlyRent,
    annualRent,
    isWithinLegal,
    jeonseLoanCost,
    monthlyTotalCost,
    cheaper,
    monthlySaving,
  };
}

const JEONSE_PRESETS = [
  { label: '1억', value: 100000000 },
  { label: '1.5억', value: 150000000 },
  { label: '2억', value: 200000000 },
  { label: '2.5억', value: 250000000 },
  { label: '3억', value: 300000000 },
];

const DEPOSIT_PRESETS = [
  { label: '1천만', value: 10000000 },
  { label: '3천만', value: 30000000 },
  { label: '5천만', value: 50000000 },
  { label: '1억', value: 100000000 },
];

export default function RentConversionCalculatorPage() {
  const [mode, setMode] = useState<CalcMode>('toMonthly');
  const [jeonse, setJeonse] = useState('200000000');
  const [deposit, setDeposit] = useState('50000000');
  const [rateInput, setRateInput] = useState('4.75');
  const [rentInput, setRentInput] = useState('500000');

  const result = useMemo(() => {
    const j = parseInt(jeonse) || 0;
    const d = parseInt(deposit) || 0;
    if (mode === 'toMonthly') {
      const r = parseFloat(rateInput) || 0;
      return calculateConversion(j, d, r, mode);
    } else {
      const rent = parseInt(rentInput) || 0;
      return calculateConversion(j, d, rent, mode);
    }
  }, [jeonse, deposit, rateInput, rentInput, mode]);

  return (
    <>
      <ToolJsonLd
        name="전월세 전환율 계산기"
        description="전세금과 월세 보증금을 입력하면 전환율과 적정 월세를 계산합니다."
        url="https://sseuksak.com/tools/rent-conversion-calculator"
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/tools" className="hover:text-blue-600">도구</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">전월세 전환율 계산기</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">전월세 전환율 계산기</h1>
        <p className="text-gray-600 mb-6">
          전세금과 월세 보증금을 입력하면 전환율과 적정 월세를 계산합니다.
          법정 상한 전환율(기준금리 + 2% = {legalMaxRate}%) 초과 여부도 확인할 수 있습니다.
        </p>

        {/* 모드 선택 */}
        <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => setMode('toMonthly')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === 'toMonthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            전환율 → 월세 계산
          </button>
          <button
            onClick={() => setMode('toRate')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === 'toRate'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            월세 → 전환율 역산
          </button>
        </div>

        {/* 입력 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-5">
          {/* 전세금 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전세 보증금</label>
            <input
              type="number"
              value={jeonse}
              onChange={(e) => setJeonse(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="전세 보증금 (원)"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {JEONSE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setJeonse(p.value.toString())}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    parseInt(jeonse) === p.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 월세 보증금 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월세 보증금</label>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="월세 보증금 (원)"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {DEPOSIT_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setDeposit(p.value.toString())}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    parseInt(deposit) === p.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 전환율 or 월세 입력 */}
          {mode === 'toMonthly' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전환율 (%)
              </label>
              <input
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="전환율 (%)"
                step="0.25"
              />
              <p className="text-xs text-gray-400 mt-1">
                법정 상한 전환율: {legalMaxRate}% (기준금리 {RATES.baseRate}% + {RATES.legalCap}%)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월세 (원)
              </label>
              <input
                type="number"
                value={rentInput}
                onChange={(e) => setRentInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="월세 (원)"
              />
            </div>
          )}
        </div>

        {/* 결과 영역 */}
        {result && (
          <div className="space-y-4">
            {/* 메인 결과 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600 mb-1">
                    {mode === 'toMonthly' ? '계산된 월세' : '계산된 전환율'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {mode === 'toMonthly'
                      ? `월 ${formatWon(result.monthlyRent)}`
                      : `${result.conversionRate.toFixed(2)}%`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">
                    {mode === 'toMonthly' ? '적용 전환율' : '월세'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {mode === 'toMonthly'
                      ? `${result.conversionRate.toFixed(2)}%`
                      : `월 ${formatWon(result.monthlyRent)}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      result.isWithinLegal ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className={`text-sm ${result.isWithinLegal ? 'text-green-700' : 'text-red-700'}`}>
                    법정 상한 전환율({legalMaxRate}%)
                    {result.isWithinLegal ? ' 이내' : ' 초과'}
                  </span>
                </div>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">계산 내역</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">전세 보증금</span>
                  <span className="font-medium">{formatEok(result.jeonseDeposit)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">월세 보증금</span>
                  <span className="font-medium">{formatEok(result.monthlyDeposit)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">보증금 차액</span>
                  <span className="font-medium">{formatEok(result.depositDiff)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">연간 월세</span>
                  <span className="font-medium">{formatWon(result.annualRent)}</span>
                </div>
              </div>
            </div>

            {/* 전세 vs 월세 비교 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">전세 vs 월세 비용 비교</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg border ${result.cheaper === 'jeonse' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-xs text-gray-500 mb-1">전세 (대출 3.5% 기준)</p>
                  <p className="text-lg font-semibold">월 {formatWon(result.jeonseLoanCost)}</p>
                  <p className="text-xs text-gray-400">전세대출 이자만 계산</p>
                </div>
                <div className={`p-4 rounded-lg border ${result.cheaper === 'monthly' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-xs text-gray-500 mb-1">월세 (기회비용 포함)</p>
                  <p className="text-lg font-semibold">월 {formatWon(result.monthlyTotalCost)}</p>
                  <p className="text-xs text-gray-400">
                    월세 {formatWon(result.monthlyRent)} + 기회비용
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-lg text-sm ${
                result.cheaper === 'jeonse'
                  ? 'bg-blue-50 text-blue-800'
                  : result.cheaper === 'monthly'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50 text-gray-700'
              }`}>
                {result.cheaper === 'jeonse'
                  ? `전세대출이 월 ${formatWon(result.monthlySaving)} 저렴합니다 (대출 금리 3.5% 기준).`
                  : result.cheaper === 'monthly'
                  ? `월세가 월 ${formatWon(result.monthlySaving)} 저렴합니다.`
                  : '전세와 월세의 비용이 비슷합니다.'}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                전세: 전세대출 금리 3.5% 가정. 월세: 보증금 기회비용 연 {RATES.depositRate}% 반영.
              </p>
            </div>

            {/* 전환율별 월세 비교표 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                전환율별 월세 비교 (보증금 차액 {formatEok(result.depositDiff)} 기준)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">전환율</th>
                      <th className="text-right py-2 text-gray-500 font-medium">월세</th>
                      <th className="text-right py-2 text-gray-500 font-medium">연간</th>
                      <th className="text-right py-2 text-gray-500 font-medium">법정상한</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[3.0, 3.5, 4.0, 4.5, 4.75, 5.0, 5.5, 6.0].map((rate) => {
                      const rent = Math.round((result.depositDiff * (rate / 100)) / 12);
                      const isLegal = rate <= legalMaxRate;
                      const isCurrent = Math.abs(rate - result.conversionRate) < 0.01;
                      return (
                        <tr
                          key={rate}
                          className={`border-b border-gray-100 ${isCurrent ? 'bg-blue-50 font-semibold' : ''}`}
                        >
                          <td className="py-2">{rate.toFixed(2)}%</td>
                          <td className="text-right py-2">{formatWon(rent)}</td>
                          <td className="text-right py-2">{formatWon(rent * 12)}</td>
                          <td className="text-right py-2">
                            <span className={isLegal ? 'text-green-600' : 'text-red-500'}>
                              {isLegal ? '이내' : '초과'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 관련 가이드 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">관련 가이드</h3>
          <div className="grid gap-2">
            <Link
              href="/posts/rent-conversion-rate-guide-2026"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                전월세 전환율 계산법: 전세가 유리할까 월세가 유리할까
              </span>
            </Link>
            <Link
              href="/posts/jeonse-loan-comparison-2026"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                전세대출 조건 비교: 청년버팀목부터 시중은행까지
              </span>
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          2026년 2월 기준 | 한국은행 기준금리 {RATES.baseRate}%, 법정 상한 전환율 {legalMaxRate}%
        </p>

        {/* 관련 도구 */}
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
          <div className="space-y-2">
            <Link href="/tools/loan-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">대출이자 계산기</span>
              <p className="text-sm text-gray-500 mt-1">대출 조건별 월 상환금과 총 이자 비교</p>
            </Link>
            <Link href="/tools/savings-interest-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">적금 이자 계산기</span>
              <p className="text-sm text-gray-500 mt-1">적금/예금 이자와 세후 실수령액 계산</p>
            </Link>
            <Link href="/tools/pyeong-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">평수 계산기</span>
              <p className="text-sm text-gray-500 mt-1">평수↔제곱미터 간편 변환</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
