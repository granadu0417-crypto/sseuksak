'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 중개수수료 상한요율표 (2021.10.19 개정, 2026년 현행)
// 매매·교환
const SALE_RATES = [
  { min: 0, max: 50000000, rate: 0.006, limit: 250000 },
  { min: 50000000, max: 200000000, rate: 0.005, limit: null },
  { min: 200000000, max: 600000000, rate: 0.004, limit: null },
  { min: 600000000, max: 900000000, rate: 0.005, limit: null },
  { min: 900000000, max: Infinity, rate: 0.009, limit: null },
];

// 임대차 (전세·월세)
const LEASE_RATES = [
  { min: 0, max: 50000000, rate: 0.005, limit: 200000 },
  { min: 50000000, max: 100000000, rate: 0.004, limit: null },
  { min: 100000000, max: 600000000, rate: 0.003, limit: null },
  { min: 600000000, max: 300000000000, rate: 0.004, limit: null },
  { min: 300000000000, max: Infinity, rate: 0.008, limit: null },
];

// 오피스텔 (매매)
const OFFICETEL_SALE_RATE = 0.005;
// 오피스텔 (임대차)
const OFFICETEL_LEASE_RATE = 0.004;

type DealType = 'sale' | 'jeonse' | 'monthly';
type PropertyType = 'apartment' | 'officetel';

const DEAL_LABELS: Record<DealType, string> = {
  sale: '매매',
  jeonse: '전세',
  monthly: '월세',
};

const QUICK_AMOUNTS: Record<DealType, { label: string; value: number }[]> = {
  sale: [
    { label: '3억', value: 300000000 },
    { label: '5억', value: 500000000 },
    { label: '7억', value: 700000000 },
    { label: '10억', value: 1000000000 },
    { label: '15억', value: 1500000000 },
  ],
  jeonse: [
    { label: '1억', value: 100000000 },
    { label: '2억', value: 200000000 },
    { label: '3억', value: 300000000 },
    { label: '5억', value: 500000000 },
    { label: '7억', value: 700000000 },
  ],
  monthly: [
    { label: '1천만', value: 10000000 },
    { label: '3천만', value: 30000000 },
    { label: '5천만', value: 50000000 },
    { label: '1억', value: 100000000 },
    { label: '2억', value: 200000000 },
  ],
};

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

// 월세 → 환산보증금 (월세 x 100)
function toConvertedDeposit(deposit: number, monthlyRent: number): number {
  return deposit + monthlyRent * 100;
}

interface CalcResult {
  transactionAmount: number;
  appliedRate: number;
  brokerageFee: number;
  vat: number;
  totalFee: number;
  rateLabel: string;
  note: string;
}

export default function BrokerageFeeCalculator() {
  const [dealType, setDealType] = useState<DealType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [amount, setAmount] = useState(500000000);
  const [amountInput, setAmountInput] = useState('50000');
  const [monthlyRent, setMonthlyRent] = useState(500000);
  const [monthlyRentInput, setMonthlyRentInput] = useState('50');
  const [includeVat, setIncludeVat] = useState(true);

  const result = useMemo<CalcResult | null>(() => {
    if (amount <= 0) return null;

    let transactionAmount = amount;
    let note = '';

    // 월세: 환산보증금 계산
    if (dealType === 'monthly') {
      const converted = toConvertedDeposit(amount, monthlyRent);
      // 환산보증금과 보증금 중 큰 금액 기준
      transactionAmount = Math.max(converted, amount);
      if (converted > amount) {
        note = `환산보증금: ${formatWon(converted)} (보증금 + 월세x100)`;
      }
    }

    let appliedRate: number;
    let limitAmount: number | null = null;

    if (propertyType === 'officetel') {
      appliedRate = dealType === 'sale' ? OFFICETEL_SALE_RATE : OFFICETEL_LEASE_RATE;
    } else {
      const rates = dealType === 'sale' ? SALE_RATES : LEASE_RATES;
      const bracket = rates.find((r) => transactionAmount >= r.min && transactionAmount < r.max);
      if (bracket) {
        appliedRate = bracket.rate;
        limitAmount = bracket.limit;
      } else {
        appliedRate = rates[rates.length - 1].rate;
      }
    }

    let brokerageFee = Math.round(transactionAmount * appliedRate);

    // 한도 적용
    if (limitAmount !== null && brokerageFee > limitAmount) {
      brokerageFee = limitAmount;
    }

    const vat = includeVat ? Math.round(brokerageFee * 0.1) : 0;
    const totalFee = brokerageFee + vat;

    const rateLabel = `${(appliedRate * 100).toFixed(1)}%`;

    return {
      transactionAmount,
      appliedRate,
      brokerageFee,
      vat,
      totalFee,
      rateLabel,
      note,
    };
  }, [amount, monthlyRent, dealType, propertyType, includeVat]);

  const handleAmountInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    setAmountInput(num);
    setAmount(parseInt(num || '0') * 10000);
  };

  const handleMonthlyRentInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    setMonthlyRentInput(num);
    setMonthlyRent(parseInt(num || '0') * 10000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="부동산 중개수수료 계산기"
        description="부동산 중개수수료를 자동 계산합니다. 매매·전세·월세 거래 유형별 수수료율, 상한요율, 부가세 포함 실제 부담 금액까지 한번에 확인."
        url="https://sseuksak.com/tools/brokerage-fee-calculator"
      />

      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-1">/</span>
        <Link href="/tools" className="hover:text-blue-600">도구</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">부동산 중개수수료 계산기</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">부동산 중개수수료 계산기</h1>
      <p className="text-gray-600 mb-6">
        매매·전세·월세 거래 시 부동산 중개수수료를 계산합니다. 2021년 개정 상한요율 기준입니다.
      </p>

      <div className="space-y-5">
        {/* 거래 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">거래 유형</label>
          <div className="flex gap-2">
            {(['sale', 'jeonse', 'monthly'] as DealType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setDealType(type);
                  if (type === 'sale') { setAmount(500000000); setAmountInput('50000'); }
                  if (type === 'jeonse') { setAmount(300000000); setAmountInput('30000'); }
                  if (type === 'monthly') { setAmount(50000000); setAmountInput('5000'); setMonthlyRent(500000); setMonthlyRentInput('50'); }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  dealType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {DEAL_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* 부동산 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">부동산 유형</label>
          <div className="flex gap-2">
            {[
              { value: 'apartment' as PropertyType, label: '주택 (아파트·빌라·단독)' },
              { value: 'officetel' as PropertyType, label: '오피스텔' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPropertyType(opt.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  propertyType === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 금액 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {dealType === 'sale' ? '매매가' : dealType === 'jeonse' ? '전세 보증금' : '보증금'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => handleAmountInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">만원</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {QUICK_AMOUNTS[dealType].map((q) => (
              <button
                key={q.value}
                onClick={() => { setAmount(q.value); setAmountInput(String(q.value / 10000)); }}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 월세 입력 */}
        {dealType === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월세</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={monthlyRentInput}
                onChange={(e) => handleMonthlyRentInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">만원</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {[30, 50, 70, 100, 150].map((v) => (
                <button
                  key={v}
                  onClick={() => { setMonthlyRent(v * 10000); setMonthlyRentInput(String(v)); }}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 rounded transition-colors"
                >
                  {v}만
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 부가세 포함 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeVat}
            onChange={(e) => setIncludeVat(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">부가세(10%) 포함 (개인 중개사는 면세, 법인은 과세)</span>
        </label>
      </div>

      {/* 결과 */}
      {result && (
        <div className="mt-8 space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-center">
            <p className="text-sm text-blue-600 mb-1">중개수수료 {includeVat ? '(부가세 포함)' : '(부가세 제외)'}</p>
            <p className="text-4xl font-bold text-blue-900">{formatWon(result.totalFee)}</p>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <div>
                <span className="text-gray-500">적용 요율 </span>
                <span className="font-semibold text-gray-900">{result.rateLabel}</span>
              </div>
              <div>
                <span className="text-gray-500">거래금액 </span>
                <span className="font-semibold text-gray-900">{formatWon(result.transactionAmount)}</span>
              </div>
            </div>
            {result.note && (
              <p className="text-xs text-gray-500 mt-2">{result.note}</p>
            )}
          </div>

          {/* 상세 내역 */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">계산 상세</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">{dealType === 'sale' ? '매매가' : '보증금'}</span>
                <span className="text-sm text-gray-900">{formatWon(amount)}</span>
              </div>
              {dealType === 'monthly' && (
                <>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-700">월세</span>
                    <span className="text-sm text-gray-900">{formatWon(monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-500 pl-2">환산보증금 (보증금 + 월세x100)</span>
                    <span className="text-sm text-gray-900">{formatWon(toConvertedDeposit(amount, monthlyRent))}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">상한요율</span>
                <span className="text-sm text-gray-900">{result.rateLabel}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">중개수수료</span>
                <span className="text-sm font-medium text-gray-900">{formatWon(result.brokerageFee)}</span>
              </div>
              {includeVat && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-500 pl-2">(+) 부가세 10%</span>
                  <span className="text-sm text-gray-900">{formatWon(result.vat)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2.5 bg-blue-50">
                <span className="text-sm font-bold text-blue-900">총 부담 금액</span>
                <span className="text-lg font-bold text-blue-900">{formatWon(result.totalFee)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상한요율표 */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">주택 중개수수료 상한요율표</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left border border-gray-200">거래금액</th>
                <th className="px-3 py-2 text-center border border-gray-200">매매</th>
                <th className="px-3 py-2 text-center border border-gray-200">임대차</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: '5천만원 미만', sale: '0.6% (한도 25만)', lease: '0.5% (한도 20만)' },
                { range: '5천만 ~ 2억원', sale: '0.5%', lease: '0.4%' },
                { range: '2억 ~ 6억원', sale: '0.4%', lease: '0.3%' },
                { range: '6억 ~ 9억원', sale: '0.5%', lease: '0.4%' },
                { range: '9억원 이상 / 3억 이상(임대)', sale: '0.9% 이내', lease: '0.8% 이내' },
              ].map((row) => (
                <tr key={row.range} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-200">{row.range}</td>
                  <td className="px-3 py-2 text-center border border-gray-200">{row.sale}</td>
                  <td className="px-3 py-2 text-center border border-gray-200">{row.lease}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">* 오피스텔: 매매 0.5%, 임대차 0.4% (거래금액 무관)</p>
      </div>

      {/* 상세 가이드 */}
      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">중개수수료 알아두면 좋은 점</h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">상한요율은 최대 금액</h3>
          <p className="text-sm text-gray-700">상한요율은 법적으로 받을 수 있는 최대 금액입니다. 중개사와 협의하면 그보다 낮출 수 있습니다. 특히 9억 이상 구간(0.9% 이내)은 협상 여지가 큽니다.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">부가세는 누가 내나</h3>
          <p className="text-sm text-gray-700">개인 중개사(간이과세자)는 부가세가 면제됩니다. 법인 중개사무소나 일반과세자는 중개수수료에 부가세 10%가 별도 부과됩니다. 계약 전 중개사에게 확인하세요.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">월세 환산보증금</h3>
          <p className="text-sm text-gray-700">월세 거래 시 수수료 기준은 &quot;보증금 + (월세 x 100)&quot;으로 환산한 금액과 실제 보증금 중 큰 금액입니다. 예: 보증금 3,000만원 / 월세 50만원 → 환산보증금 8,000만원 기준으로 수수료를 계산합니다.</p>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">관련 도구</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/capital-gains-tax-calculator', name: '양도소득세 계산기', desc: '부동산 매도 시 세금 계산' },
            { href: '/tools/acquisition-tax-calculator', name: '취득세 계산기', desc: '주택 취득 시 세금 계산' },
            { href: '/tools/rent-conversion-calculator', name: '전월세 전환 계산기', desc: '전세·월세 비용 비교' },
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
          <li><Link href="/posts/real-estate-brokerage-fee-guide-2026" className="text-blue-600 hover:underline">부동산 중개수수료 총정리 가이드</Link></li>
          <li><Link href="/posts/jeonse-fraud-prevention-guide-2026" className="text-blue-600 hover:underline">전세사기 예방 가이드</Link></li>
          <li><Link href="/posts/rent-conversion-rate-guide-2026" className="text-blue-600 hover:underline">전월세 전환율 계산법</Link></li>
          <li><Link href="/posts/acquisition-tax-guide-2026" className="text-blue-600 hover:underline">아파트 살 때 취득세 얼마?</Link></li>
        </ul>
      </div>

      <p className="mt-8 text-xs text-gray-400 leading-relaxed">
        본 계산기는 공인중개사법 시행규칙(2021.10.19 개정) 기준 참고용 계산입니다. 실제 수수료는 중개사와의 협의에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
