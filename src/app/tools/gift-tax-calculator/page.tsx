'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 증여세 세율표 (2026년 현행 유지)
const TAX_BRACKETS = [
  { min: 0, max: 100000000, rate: 0.10, deduction: 0 },
  { min: 100000000, max: 500000000, rate: 0.20, deduction: 10000000 },
  { min: 500000000, max: 1000000000, rate: 0.30, deduction: 60000000 },
  { min: 1000000000, max: 3000000000, rate: 0.40, deduction: 160000000 },
  { min: 3000000000, max: Infinity, rate: 0.50, deduction: 460000000 },
];

// 증여재산공제 (10년 합산)
const GIFT_DEDUCTIONS: Record<string, { amount: number; label: string; description: string }> = {
  spouse: {
    amount: 600000000,
    label: '배우자',
    description: '법률상 혼인관계에 있는 배우자'
  },
  adultChild: {
    amount: 50000000,
    label: '직계존속 → 성년 자녀/손자녀',
    description: '부모·조부모·증조부모 등 → 만 19세 이상 자녀·손자녀·증손자녀'
  },
  minorChild: {
    amount: 20000000,
    label: '직계존속 → 미성년 자녀/손자녀',
    description: '부모·조부모·증조부모 등 → 만 19세 미만 자녀·손자녀·증손자녀'
  },
  parent: {
    amount: 50000000,
    label: '직계비속 → 부모/조부모',
    description: '자녀·손자녀 등 → 부모·조부모·증조부모 (역증여)'
  },
  relative: {
    amount: 10000000,
    label: '기타 친족',
    description: '형제자매, 6촌 이내 혈족, 4촌 이내 인척 (시부모, 장인장모 포함)'
  },
  other: {
    amount: 0,
    label: '그 외 (타인)',
    description: '친족관계가 아닌 제3자'
  },
};

// 빠른 금액 선택
const QUICK_AMOUNTS = [
  { label: '1천만', value: 10000000 },
  { label: '5천만', value: 50000000 },
  { label: '1억', value: 100000000 },
  { label: '2억', value: 200000000 },
  { label: '5억', value: 500000000 },
  { label: '10억', value: 1000000000 },
];

interface CalculationResult {
  giftAmount: number;
  deduction: number;
  taxableBase: number;
  calculatedTax: number;
  reportDiscount: number;
  generationSkipSurcharge: number;
  finalTax: number;
  effectiveRate: number;
  bracket: { rate: number; deduction: number };
}

function calculateTax(taxableBase: number): { tax: number; bracket: { rate: number; deduction: number } } {
  if (taxableBase <= 0) {
    return { tax: 0, bracket: { rate: 0.10, deduction: 0 } };
  }

  for (const bracket of TAX_BRACKETS) {
    if (taxableBase <= bracket.max) {
      const tax = taxableBase * bracket.rate - bracket.deduction;
      return { tax: Math.max(tax, 0), bracket };
    }
  }

  const lastBracket = TAX_BRACKETS[TAX_BRACKETS.length - 1];
  return {
    tax: taxableBase * lastBracket.rate - lastBracket.deduction,
    bracket: lastBracket,
  };
}

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    const billions = Math.floor(amount / 100000000);
    const millions = Math.floor((amount % 100000000) / 10000);
    if (millions > 0) {
      return `${billions}억 ${millions.toLocaleString()}만원`;
    }
    return `${billions}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

function formatMoneyFull(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

export default function GiftTaxCalculator() {
  // 기본 정보
  const [giftAmount, setGiftAmount] = useState(200000000);
  const [relationship, setRelationship] = useState('adultChild');
  const [priorGifts, setPriorGifts] = useState(0);  // 10년 내 기증여액

  // 추가 옵션
  const [willReport, setWillReport] = useState(true);      // 신고 여부
  const [isGenerationSkip, setIsGenerationSkip] = useState(false);  // 세대생략
  const [isMinorOver20B, setIsMinorOver20B] = useState(false);  // 미성년+20억 초과

  const result = useMemo<CalculationResult>(() => {
    // 1. 증여재산공제
    const deductionInfo = GIFT_DEDUCTIONS[relationship];
    const availableDeduction = Math.max(deductionInfo.amount - priorGifts, 0);
    const deduction = Math.min(availableDeduction, giftAmount);

    // 2. 과세표준
    const taxableBase = Math.max(giftAmount + priorGifts - deductionInfo.amount, 0);

    // 3. 산출세액
    const { tax: calculatedTax, bracket } = calculateTax(taxableBase);

    // 4. 세대생략 할증 (조부모 → 손자녀: 30%, 미성년+20억 초과: 40%)
    let generationSkipSurcharge = 0;
    if (isGenerationSkip) {
      const surchargeRate = isMinorOver20B ? 0.40 : 0.30;
      generationSkipSurcharge = calculatedTax * surchargeRate;
    }

    const taxAfterSurcharge = calculatedTax + generationSkipSurcharge;

    // 5. 신고세액공제 (기한 내 신고 시 3%)
    const reportDiscount = willReport ? taxAfterSurcharge * 0.03 : 0;

    // 6. 최종 납부세액
    const finalTax = Math.max(taxAfterSurcharge - reportDiscount, 0);

    // 7. 실효세율
    const effectiveRate = giftAmount > 0 ? (finalTax / giftAmount) * 100 : 0;

    return {
      giftAmount,
      deduction,
      taxableBase,
      calculatedTax,
      reportDiscount,
      generationSkipSurcharge,
      finalTax,
      effectiveRate,
      bracket,
    };
  }, [giftAmount, relationship, priorGifts, willReport, isGenerationSkip, isMinorOver20B]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ToolJsonLd name="증여세 계산기" description="증여금액과 관계에 따른 증여세를 계산합니다" url="/tools/gift-tax-calculator" />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">&gt;</span>
        <Link href="/tools" className="hover:text-blue-600">도구</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">증여세 계산기</span>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">2026년 증여세 계산기</h1>
        <p className="text-gray-600">
          증여재산공제와 세율을 적용하여 납부할 증여세를 계산해보세요
        </p>
      </div>

      {/* 증여금액 입력 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">증여금액</h3>

        {/* 빠른 선택 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.map((item) => (
            <button
              key={item.value}
              onClick={() => setGiftAmount(item.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                giftAmount === item.value
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
            이번에 증여받는 금액
          </label>
          <input
            type="number"
            value={giftAmount}
            onChange={(e) => setGiftAmount(Number(e.target.value))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            step={10000000}
            min={0}
          />
          <p className="mt-1 text-sm text-gray-500">
            {formatMoney(giftAmount)}
          </p>
        </div>
      </div>

      {/* 증여 관계 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">증여자와의 관계</h3>

        <div className="grid gap-2">
          {Object.entries(GIFT_DEDUCTIONS).map(([key, info]) => (
            <label
              key={key}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${
                relationship === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="relationship"
                    value={key}
                    checked={relationship === key}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-gray-800">{info.label}</span>
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  공제 {formatMoney(info.amount)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">{info.description}</p>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            10년 내 동일인에게 받은 기증여액
          </label>
          <input
            type="number"
            value={priorGifts || ''}
            onChange={(e) => setPriorGifts(Number(e.target.value))}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            같은 그룹(예: 부모는 합산)에서 10년간 받은 증여 합계
          </p>
        </div>
      </div>

      {/* 추가 옵션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">추가 옵션</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={willReport}
              onChange={(e) => setWillReport(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">
              기한 내 신고 예정 <span className="text-blue-600">(3% 공제)</span>
            </span>
          </label>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isGenerationSkip}
                onChange={(e) => {
                  setIsGenerationSkip(e.target.checked);
                  if (!e.target.checked) setIsMinorOver20B(false);
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                세대생략 증여 <span className="text-red-600">(+30% 할증)</span>
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6 mt-1">
              조부모→손자녀, 증조부모→증손자녀 등 한 세대 이상 건너뛴 증여
            </p>
          </div>

          {isGenerationSkip && (
            <label className="flex items-center gap-2 ml-6">
              <input
                type="checkbox"
                checked={isMinorOver20B}
                onChange={(e) => setIsMinorOver20B(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                미성년자 + 20억 초과 <span className="text-red-600">(+40% 할증)</span>
              </span>
            </label>
          )}
        </div>
      </div>

      {/* 결과 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-1">납부할 증여세</p>
          <p className="text-4xl font-bold text-blue-600">{formatMoneyFull(result.finalTax)}</p>
          <p className="text-sm text-gray-500 mt-2">
            실효세율: {result.effectiveRate.toFixed(2)}% | 적용세율: {(result.bracket.rate * 100).toFixed(0)}%
          </p>
        </div>

        {/* 계산 과정 */}
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">증여재산가액</span>
              <span className="font-bold">{formatMoneyFull(result.giftAmount)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">(-) 증여재산공제</span>
              <span className="font-bold text-green-600">-{formatMoneyFull(result.deduction)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {GIFT_DEDUCTIONS[relationship].label}: {formatMoney(GIFT_DEDUCTIONS[relationship].amount)} (10년 합산)
            </p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">과세표준</span>
              <span className="font-bold">{formatMoneyFull(result.taxableBase)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">산출세액</span>
              <span className="font-bold">{formatMoneyFull(result.calculatedTax)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              과세표준 × {(result.bracket.rate * 100).toFixed(0)}% - 누진공제 {formatMoney(result.bracket.deduction)}
            </p>
          </div>

          {result.generationSkipSurcharge > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-red-700">(+) 세대생략 할증</span>
                <span className="font-bold text-red-600">+{formatMoneyFull(result.generationSkipSurcharge)}</span>
              </div>
            </div>
          )}

          {result.reportDiscount > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-green-700">(-) 신고세액공제 (3%)</span>
                <span className="font-bold text-green-600">-{formatMoneyFull(result.reportDiscount)}</span>
              </div>
            </div>
          )}

          <div className="bg-blue-100 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-800">최종 납부세액</span>
              <span className="font-bold text-blue-600">{formatMoneyFull(result.finalTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 세율표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">증여세 세율표 (2026년)</h3>
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
              {TAX_BRACKETS.map((bracket, idx) => {
                const isActive = result.taxableBase > 0 &&
                  result.taxableBase > (TAX_BRACKETS[idx - 1]?.max || 0) &&
                  result.taxableBase <= bracket.max;
                return (
                  <tr key={idx} className={isActive ? 'bg-blue-50 font-medium' : ''}>
                    <td className="px-4 py-2">
                      {idx === 0 ? '1억원 이하' :
                       idx === TAX_BRACKETS.length - 1 ? '30억원 초과' :
                       `${formatMoney(TAX_BRACKETS[idx - 1].max)} ~ ${formatMoney(bracket.max)}`}
                    </td>
                    <td className="px-4 py-2 text-center">{(bracket.rate * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2 text-right">
                      {bracket.deduction > 0 ? formatMoney(bracket.deduction) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 증여재산공제표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">증여재산공제 한도 (10년 합산)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">관계</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">공제 한도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(GIFT_DEDUCTIONS).map(([key, info]) => (
                <tr key={key} className={relationship === key ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-2">{info.label}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {info.amount > 0 ? formatMoney(info.amount) : '공제 없음'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">관계 용어 설명</h4>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li><strong>직계존속:</strong> 부모, 조부모, 증조부모 등 윗세대 (친가+외가 모두 합산)</li>
            <li><strong>직계비속:</strong> 자녀, 손자녀, 증손자녀 등 아랫세대</li>
            <li><strong>세대생략:</strong> 조부모→손자녀처럼 한 세대 이상 건너뛴 증여 (30~40% 할증)</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              * 아버지와 어머니는 &apos;직계존속&apos;으로 합산됩니다. (각각 5천만원이 아님)
            </p>
            <p className="text-xs text-gray-500">
              * 친조부모와 외조부모도 &apos;직계존속&apos;으로 합산됩니다.
            </p>
            <p className="text-xs text-gray-500">
              * 조부모→손자녀 증여 시 공제는 5천만원이지만, 세대생략 할증(30%)이 추가됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 신고 안내 */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-800 mb-3">증여세 신고 안내</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li><strong>신고 기한:</strong> 증여받은 날이 속하는 달의 말일부터 3개월 이내</li>
          <li><strong>신고 방법:</strong> 국세청 홈택스 전자신고 또는 세무서 방문</li>
          <li><strong>필요 서류:</strong> 증여세 과세표준신고서, 증여재산 평가명세서</li>
          <li>* 기한 내 신고하면 <strong>산출세액의 3%</strong>를 공제받습니다.</li>
        </ul>
        <div className="mt-4 flex gap-3">
          <a
            href="https://www.hometax.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-800 hover:text-amber-900 underline"
          >
            국세청 홈택스
          </a>
          <a
            href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2340&cntntsId=7728"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-800 hover:text-amber-900 underline"
          >
            증여세 세액계산 안내
          </a>
        </div>
        <div className="mt-4 p-3 bg-amber-100 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>면책조항:</strong> 본 계산기는 참고용이며, 실제 세액과 다를 수 있습니다.
            정확한 세금 계산은 국세청 또는 세무사와 상담하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
