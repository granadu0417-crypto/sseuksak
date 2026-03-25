'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 양도소득세 기본세율 (2026년)
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

// 장기보유특별공제율 (1세대 1주택)
function getOneHouseLongTermDeduction(holdingYears: number, residenceYears: number): number {
  // 보유기간 공제: 3년 이상부터 연 4%, 최대 40% (10년)
  let holdingRate = 0;
  if (holdingYears >= 3) {
    holdingRate = Math.min(holdingYears, 10) * 4;
  }
  // 거주기간 공제: 2년 이상부터 연 4%, 최대 40% (10년)
  let residenceRate = 0;
  if (residenceYears >= 2) {
    residenceRate = Math.min(residenceYears, 10) * 4;
  }
  return Math.min(holdingRate + residenceRate, 80);
}

// 장기보유특별공제율 (일반)
function getGeneralLongTermDeduction(holdingYears: number): number {
  if (holdingYears < 3) return 0;
  return Math.min(holdingYears, 15) * 2;
}

// 양도소득세 계산
function calcProgressiveTax(taxableBase: number): { tax: number; rate: number; deduction: number } {
  if (taxableBase <= 0) return { tax: 0, rate: 0.06, deduction: 0 };
  for (const bracket of TAX_BRACKETS) {
    if (taxableBase <= bracket.max) {
      return {
        tax: Math.max(taxableBase * bracket.rate - bracket.deduction, 0),
        rate: bracket.rate,
        deduction: bracket.deduction,
      };
    }
  }
  const last = TAX_BRACKETS[TAX_BRACKETS.length - 1];
  return { tax: taxableBase * last.rate - last.deduction, rate: last.rate, deduction: last.deduction };
}

// 프리셋
const PRESETS = [
  { label: '1주택 (5억 매수 → 8억 매도)', sellPrice: 800000000, buyPrice: 500000000, expenses: 5000000, holdingYears: 7, residenceYears: 5, houseCount: 1, isRegulated: false },
  { label: '1주택 (8억 매수 → 15억 매도)', sellPrice: 1500000000, buyPrice: 800000000, expenses: 10000000, holdingYears: 10, residenceYears: 8, houseCount: 1, isRegulated: false },
  { label: '2주택 (4억 매수 → 6억 매도)', sellPrice: 600000000, buyPrice: 400000000, expenses: 5000000, holdingYears: 5, residenceYears: 0, houseCount: 2, isRegulated: true },
  { label: '단기매도 (1년 미만)', sellPrice: 600000000, buyPrice: 500000000, expenses: 5000000, holdingYears: 0, residenceYears: 0, houseCount: 1, isRegulated: false },
];

const QUICK_SELL = [
  { label: '5억', value: 500000000 },
  { label: '7억', value: 700000000 },
  { label: '10억', value: 1000000000 },
  { label: '15억', value: 1500000000 },
  { label: '20억', value: 2000000000 },
];

const QUICK_BUY = [
  { label: '3억', value: 300000000 },
  { label: '5억', value: 500000000 },
  { label: '7억', value: 700000000 },
  { label: '10억', value: 1000000000 },
  { label: '15억', value: 1500000000 },
];

function formatNumber(num: number): string {
  return Math.round(num).toLocaleString('ko-KR');
}

function formatWon(num: number): string {
  if (num >= 100000000) {
    const eok = Math.floor(num / 100000000);
    const remainder = num % 100000000;
    if (remainder >= 10000) {
      return `${eok}억 ${formatNumber(Math.round(remainder / 10000))}만원`;
    }
    return `${eok}억원`;
  }
  if (num >= 10000) {
    return `${formatNumber(Math.round(num / 10000))}만원`;
  }
  return `${formatNumber(num)}원`;
}

interface CalcResult {
  sellPrice: number;
  buyPrice: number;
  expenses: number;
  gain: number;
  isExempt: boolean;
  exemptNote: string;
  taxableGain: number;
  longTermDeductionRate: number;
  longTermDeduction: number;
  basicDeduction: number;
  taxableBase: number;
  baseTax: number;
  surchargeRate: number;
  surcharge: number;
  totalIncomeTax: number;
  localTax: number;
  totalTax: number;
  netProceeds: number;
  effectiveRate: number;
  appliedRate: number;
}

export default function CapitalGainsTaxCalculator() {
  const [sellPrice, setSellPrice] = useState(800000000);
  const [sellInput, setSellInput] = useState('80000');
  const [buyPrice, setBuyPrice] = useState(500000000);
  const [buyInput, setBuyInput] = useState('50000');
  const [expenses, setExpenses] = useState(5000000);
  const [expenseInput, setExpenseInput] = useState('500');
  const [holdingYears, setHoldingYears] = useState(7);
  const [residenceYears, setResidenceYears] = useState(5);
  const [houseCount, setHouseCount] = useState(1);
  const [isRegulated, setIsRegulated] = useState(false);

  const result = useMemo<CalcResult | null>(() => {
    if (sellPrice <= 0 || buyPrice <= 0) return null;

    const gain = sellPrice - buyPrice - expenses;
    if (gain <= 0) {
      return {
        sellPrice, buyPrice, expenses, gain, isExempt: false, exemptNote: '',
        taxableGain: 0, longTermDeductionRate: 0, longTermDeduction: 0,
        basicDeduction: 0, taxableBase: 0, baseTax: 0, surchargeRate: 0,
        surcharge: 0, totalIncomeTax: 0, localTax: 0, totalTax: 0,
        netProceeds: sellPrice - buyPrice, effectiveRate: 0, appliedRate: 0,
      };
    }

    // 1세대 1주택 비과세 (12억 이하, 보유 2년 이상)
    let taxableGain = gain;
    let isExempt = false;
    let exemptNote = '';

    if (houseCount === 1 && holdingYears >= 2) {
      const residenceOk = isRegulated ? residenceYears >= 2 : true;
      if (residenceOk) {
        if (sellPrice <= 1200000000) {
          // 전액 비과세
          isExempt = true;
          exemptNote = '1세대 1주택 비과세 (양도가액 12억원 이하)';
          return {
            sellPrice, buyPrice, expenses, gain, isExempt, exemptNote,
            taxableGain: 0, longTermDeductionRate: 0, longTermDeduction: 0,
            basicDeduction: 0, taxableBase: 0, baseTax: 0, surchargeRate: 0,
            surcharge: 0, totalIncomeTax: 0, localTax: 0, totalTax: 0,
            netProceeds: gain, effectiveRate: 0, appliedRate: 0,
          };
        } else {
          // 12억 초과분만 과세
          taxableGain = Math.round(gain * (sellPrice - 1200000000) / sellPrice);
          exemptNote = `12억 초과분 과세 (과세비율: ${((sellPrice - 1200000000) / sellPrice * 100).toFixed(1)}%)`;
        }
      }
    }

    // 장기보유특별공제
    let longTermDeductionRate = 0;
    if (houseCount === 1 && holdingYears >= 3) {
      longTermDeductionRate = getOneHouseLongTermDeduction(holdingYears, residenceYears);
    } else if (houseCount >= 2 && isRegulated) {
      // 조정대상지역 다주택: 장특공 미적용
      longTermDeductionRate = 0;
    } else if (holdingYears >= 3) {
      longTermDeductionRate = getGeneralLongTermDeduction(holdingYears);
    }

    const longTermDeduction = Math.round(taxableGain * longTermDeductionRate / 100);
    const afterLongTerm = taxableGain - longTermDeduction;

    // 기본공제 250만원
    const basicDeduction = Math.min(afterLongTerm, 2500000);
    const taxableBase = Math.max(afterLongTerm - basicDeduction, 0);

    // 기본 세율
    let baseTax: number;
    let appliedRate: number;

    // 단기매도 세율
    if (holdingYears < 1) {
      // 1년 미만 보유: 70% (주택)
      appliedRate = 0.70;
      baseTax = taxableBase * 0.70;
    } else if (holdingYears < 2) {
      // 1년 이상 2년 미만: 60%
      appliedRate = 0.60;
      baseTax = taxableBase * 0.60;
    } else {
      const progressive = calcProgressiveTax(taxableBase);
      baseTax = progressive.tax;
      appliedRate = progressive.rate;
    }

    // 다주택 중과
    let surchargeRate = 0;
    if (holdingYears >= 2) {
      if (houseCount === 2 && isRegulated) surchargeRate = 0.20;
      if (houseCount >= 3 && isRegulated) surchargeRate = 0.30;
    }
    const surcharge = surchargeRate > 0 ? taxableBase * surchargeRate : 0;

    const totalIncomeTax = Math.round(baseTax + surcharge);
    const localTax = Math.round(totalIncomeTax * 0.1);
    const totalTax = totalIncomeTax + localTax;
    const effectiveRate = gain > 0 ? (totalTax / gain) * 100 : 0;

    return {
      sellPrice, buyPrice, expenses, gain, isExempt, exemptNote,
      taxableGain, longTermDeductionRate, longTermDeduction,
      basicDeduction, taxableBase, baseTax, surchargeRate,
      surcharge, totalIncomeTax, localTax, totalTax,
      netProceeds: gain - totalTax,
      effectiveRate, appliedRate,
    };
  }, [sellPrice, buyPrice, expenses, holdingYears, residenceYears, houseCount, isRegulated]);

  const handleInput = (
    value: string,
    setInput: (v: string) => void,
    setValue: (v: number) => void,
  ) => {
    const num = value.replace(/[^0-9]/g, '');
    setInput(num);
    setValue(parseInt(num || '0') * 10000);
  };

  const applyPreset = (p: typeof PRESETS[number]) => {
    setSellPrice(p.sellPrice);
    setSellInput(String(p.sellPrice / 10000));
    setBuyPrice(p.buyPrice);
    setBuyInput(String(p.buyPrice / 10000));
    setExpenses(p.expenses);
    setExpenseInput(String(p.expenses / 10000));
    setHoldingYears(p.holdingYears);
    setResidenceYears(p.residenceYears);
    setHouseCount(p.houseCount);
    setIsRegulated(p.isRegulated);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="양도소득세 계산기"
        description="부동산 양도소득세를 자동 계산합니다. 1세대 1주택 비과세(12억), 장기보유특별공제, 다주택 중과세율, 조정대상지역까지 반영한 정확한 양도세 계산."
        url="https://sseuksak.com/tools/capital-gains-tax-calculator"
      />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-1">/</span>
        <Link href="/tools" className="hover:text-blue-600">도구</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">양도소득세 계산기</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">양도소득세 계산기</h1>
      <p className="text-gray-600 mb-6">
        부동산 매도 시 양도소득세를 계산합니다. 1세대 1주택 비과세, 장기보유특별공제, 다주택 중과까지 반영합니다.
      </p>

      {/* 프리셋 */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">빠른 설정</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {/* 양도가액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">양도가액 (매도 금액)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={sellInput}
              onChange={(e) => handleInput(e.target.value, setSellInput, setSellPrice)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">만원</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {QUICK_SELL.map((q) => (
              <button
                key={q.value}
                onClick={() => { setSellPrice(q.value); setSellInput(String(q.value / 10000)); }}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 취득가액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">취득가액 (매수 금액)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={buyInput}
              onChange={(e) => handleInput(e.target.value, setBuyInput, setBuyPrice)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">만원</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {QUICK_BUY.map((q) => (
              <button
                key={q.value}
                onClick={() => { setBuyPrice(q.value); setBuyInput(String(q.value / 10000)); }}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 필요경비 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            필요경비 (중개수수료, 인테리어 등)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={expenseInput}
              onChange={(e) => handleInput(e.target.value, setExpenseInput, setExpenses)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">만원</span>
          </div>
        </div>

        {/* 보유기간 / 거주기간 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">보유기간</label>
            <select
              value={holdingYears}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setHoldingYears(v);
                if (residenceYears > v) setResidenceYears(v);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 21 }, (_, i) => (
                <option key={i} value={i}>{i === 0 ? '1년 미만' : `${i}년`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">거주기간</label>
            <select
              value={residenceYears}
              onChange={(e) => setResidenceYears(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: holdingYears + 1 }, (_, i) => (
                <option key={i} value={i}>{i === 0 ? '거주 안 함' : `${i}년`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 주택 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">보유 주택 수</label>
          <div className="flex gap-2">
            {[
              { value: 1, label: '1주택' },
              { value: 2, label: '2주택' },
              { value: 3, label: '3주택 이상' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHouseCount(opt.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  houseCount === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 조정대상지역 */}
        {houseCount >= 2 && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegulated}
                onChange={(e) => setIsRegulated(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">조정대상지역 (서울, 과천, 성남 분당 등)</span>
            </label>
          </div>
        )}
        {houseCount === 1 && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegulated}
                onChange={(e) => setIsRegulated(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">조정대상지역 (비과세 시 거주 2년 요건 적용)</span>
            </label>
          </div>
        )}
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-8 space-y-4">
          {/* 핵심 결과 */}
          <div className={`p-6 rounded-2xl ${result.isExempt ? 'bg-green-50 border border-green-200' : result.gain <= 0 ? 'bg-gray-50 border border-gray-200' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'}`}>
            {result.gain <= 0 ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">양도차손 (세금 없음)</p>
                <p className="text-3xl font-bold text-gray-600">{formatWon(Math.abs(result.gain))}</p>
                <p className="text-sm text-gray-500 mt-1">매도가가 매수가+경비보다 낮아 세금이 없습니다</p>
              </div>
            ) : result.isExempt ? (
              <div className="text-center">
                <p className="text-sm text-green-600 mb-1">양도소득세</p>
                <p className="text-4xl font-bold text-green-700">0원</p>
                <p className="text-sm text-green-600 mt-2 font-medium">{result.exemptNote}</p>
                <p className="text-sm text-gray-600 mt-1">양도차익: {formatWon(result.gain)} (전액 비과세)</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-blue-600 mb-1">총 납부 세금</p>
                <p className="text-4xl font-bold text-blue-900">{formatWon(result.totalTax)}</p>
                <div className="flex justify-center gap-6 mt-3 text-sm">
                  <div>
                    <span className="text-gray-500">실효세율 </span>
                    <span className="font-semibold text-gray-900">{result.effectiveRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">실수익 </span>
                    <span className="font-semibold text-gray-900">{formatWon(result.netProceeds)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 상세 내역 */}
          {result.gain > 0 && !result.isExempt && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-900">계산 상세</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <Row label="양도가액" value={formatWon(result.sellPrice)} />
                <Row label="(-) 취득가액" value={formatWon(result.buyPrice)} sub />
                <Row label="(-) 필요경비" value={formatWon(result.expenses)} sub />
                <Row label="= 양도차익" value={formatWon(result.gain)} bold />
                {result.exemptNote && (
                  <Row label="12억 초과분 과세" value={formatWon(result.taxableGain)} note={result.exemptNote} />
                )}
                {result.longTermDeductionRate > 0 && (
                  <Row
                    label={`(-) 장기보유특별공제 (${result.longTermDeductionRate}%)`}
                    value={formatWon(result.longTermDeduction)}
                    sub
                  />
                )}
                <Row label="(-) 기본공제" value={formatWon(result.basicDeduction)} sub />
                <Row label="= 과세표준" value={formatWon(result.taxableBase)} bold />
                <Row
                  label={`양도소득세 (${holdingYears < 1 ? '70%' : holdingYears < 2 ? '60%' : `${(result.appliedRate * 100).toFixed(0)}%`})`}
                  value={formatWon(result.baseTax)}
                />
                {result.surchargeRate > 0 && (
                  <Row
                    label={`(+) 다주택 중과 (+${result.surchargeRate * 100}%p)`}
                    value={formatWon(result.surcharge)}
                    warn
                  />
                )}
                <Row label="(+) 지방소득세 (10%)" value={formatWon(result.localTax)} />
                <Row label="총 납부 세금" value={formatWon(result.totalTax)} highlight />
                <Row label="세후 실수익" value={formatWon(result.netProceeds)} bold />
              </div>
            </div>
          )}

          {/* 안내 */}
          {result.gain > 0 && !result.isExempt && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-900 mb-2">참고사항</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                {holdingYears < 2 && (
                  <li>- 보유기간 2년 미만 단기매도 시 높은 세율({holdingYears < 1 ? '70%' : '60%'})이 적용됩니다.</li>
                )}
                {houseCount >= 2 && isRegulated && (
                  <li>- 조정대상지역 {houseCount}주택: 기본세율 + {houseCount === 2 ? '20' : '30'}%p 중과세율이 적용됩니다.</li>
                )}
                {houseCount === 1 && holdingYears >= 2 && result.longTermDeductionRate > 0 && (
                  <li>- 1세대 1주택 장기보유특별공제 {result.longTermDeductionRate}% 적용 (보유 {Math.min(holdingYears, 10) * 4}% + 거주 {Math.min(residenceYears, 10) * 4}%).</li>
                )}
                <li>- 본 계산은 2026년 세법 기준 추정치이며, 정확한 세액은 세무사 상담을 권장합니다.</li>
                <li>- 양도소득세 신고 기한: 양도일이 속하는 달의 말일부터 2개월 이내.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 세율표 */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">2026년 양도소득세 기본세율</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left border border-gray-200">과세표준</th>
                <th className="px-3 py-2 text-right border border-gray-200">세율</th>
                <th className="px-3 py-2 text-right border border-gray-200">누진공제</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: '1,400만원 이하', rate: '6%', ded: '-' },
                { range: '1,400만 ~ 5,000만원', rate: '15%', ded: '126만원' },
                { range: '5,000만 ~ 8,800만원', rate: '24%', ded: '576만원' },
                { range: '8,800만 ~ 1.5억원', rate: '35%', ded: '1,544만원' },
                { range: '1.5억 ~ 3억원', rate: '38%', ded: '1,994만원' },
                { range: '3억 ~ 5억원', rate: '40%', ded: '2,594만원' },
                { range: '5억 ~ 10억원', rate: '42%', ded: '3,594만원' },
                { range: '10억원 초과', rate: '45%', ded: '6,594만원' },
              ].map((row) => (
                <tr key={row.range} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-200">{row.range}</td>
                  <td className="px-3 py-2 text-right border border-gray-200 font-medium">{row.rate}</td>
                  <td className="px-3 py-2 text-right border border-gray-200">{row.ded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 가이드 */}
      <div className="mt-10 prose prose-sm max-w-none">
        <h2 className="text-lg font-bold text-gray-900 mb-3">양도소득세 계산 순서</h2>
        <div className="space-y-4 text-gray-700">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">1단계: 양도차익 계산</h3>
            <p>양도차익 = 양도가액 - 취득가액 - 필요경비. 필요경비에는 취득 시 중개수수료, 취득세, 법무사 비용, 인테리어 비용(자본적 지출) 등이 포함됩니다. 영수증이 없으면 인정되지 않으므로 반드시 보관해야 합니다.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">2단계: 장기보유특별공제</h3>
            <p>1세대 1주택은 보유기간(연 4%, 최대 40%) + 거주기간(연 4%, 최대 40%) = 최대 80%까지 공제. 일반 주택은 보유기간 연 2%, 최대 30%까지 공제됩니다. 조정대상지역 다주택자는 장기보유특별공제가 적용되지 않습니다.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">3단계: 세율 적용</h3>
            <p>과세표준에 기본세율(6~45%)을 적용합니다. 1년 미만 보유 시 70%, 1~2년 보유 시 60%의 단일세율이 적용됩니다. 조정대상지역 2주택은 +20%p, 3주택 이상은 +30%p가 중과됩니다.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">4단계: 1세대 1주택 비과세</h3>
            <p>양도가액 12억원 이하이고 보유기간 2년 이상(조정대상지역은 거주 2년도 필요)이면 전액 비과세. 12억 초과 시에는 초과분에 해당하는 양도차익만 과세됩니다.</p>
          </div>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">관련 도구</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/acquisition-tax-calculator', name: '취득세 계산기', desc: '주택 취득 시 세금 계산' },
            { href: '/tools/gift-tax-calculator', name: '증여세 계산기', desc: '관계별 증여세 자동 계산' },
            { href: '/tools/loan-calculator', name: '대출이자 계산기', desc: '대출 원리금 상환액 계산' },
            { href: '/tools/housing-cost-simulator', name: '주거비용 시뮬레이터', desc: '전세·월세·매매 비용 비교' },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group"
            >
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-700">{tool.name}</p>
                <p className="text-xs text-gray-500">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 관련 게시글 */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">관련 게시글</h2>
        <ul className="space-y-2 text-sm">
          <li><Link href="/posts/acquisition-tax-guide-2026" className="text-blue-600 hover:underline">아파트 살 때 취득세 얼마? 1주택·다주택 세율 비교</Link></li>
          <li><Link href="/posts/gift-tax-guide-2026" className="text-blue-600 hover:underline">증여세 실전 가이드: 관계별·금액별 세금 계산</Link></li>
          <li><Link href="/posts/real-estate-brokerage-fee-guide-2026" className="text-blue-600 hover:underline">부동산 중개수수료 총정리</Link></li>
          <li><Link href="/posts/property-holding-tax-guide-2026" className="text-blue-600 hover:underline">종합부동산세 기준 금액과 세율 총정리</Link></li>
        </ul>
      </div>

      {/* 면책 */}
      <p className="mt-8 text-xs text-gray-400 leading-relaxed">
        본 계산기는 2026년 소득세법 기준 참고용 추정치를 제공합니다. 비과세 요건, 중과세율, 장기보유특별공제 등은 개인 상황에 따라 달라질 수 있으므로 정확한 세액은 국세청 홈택스 또는 세무사와 상담하시기 바랍니다.
      </p>
    </div>
  );
}

function Row({ label, value, bold, sub, highlight, warn, note }: {
  label: string; value: string; bold?: boolean; sub?: boolean; highlight?: boolean; warn?: boolean; note?: string;
}) {
  return (
    <div className={`flex justify-between items-center px-4 py-2.5 ${highlight ? 'bg-blue-50' : ''}`}>
      <span className={`text-sm ${sub ? 'text-gray-500 pl-2' : bold ? 'font-semibold text-gray-900' : highlight ? 'font-bold text-blue-900' : warn ? 'text-red-700' : 'text-gray-700'}`}>
        {label}
        {note && <span className="block text-xs text-gray-400 font-normal">{note}</span>}
      </span>
      <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : highlight ? 'font-bold text-blue-900 text-lg' : warn ? 'text-red-700 font-medium' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
