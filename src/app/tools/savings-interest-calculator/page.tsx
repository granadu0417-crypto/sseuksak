'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

type ProductType = 'savings' | 'deposit';
type InterestType = 'simple' | 'compound';
type TaxType = 'normal' | 'taxBreak' | 'taxFree';

const TAX_RATES: Record<TaxType, { rate: number; label: string; desc: string }> = {
  normal: { rate: 0.154, label: '일반과세', desc: '이자소득세 14% + 지방소득세 1.4%' },
  taxBreak: { rate: 0.095, label: '세금우대', desc: '이자소득세 9% + 지방소득세 0.5%' },
  taxFree: { rate: 0, label: '비과세', desc: '세금 없음 (청년희망적금, ISA 등)' },
};

const QUICK_AMOUNTS = [
  { label: '10만', value: 100000 },
  { label: '30만', value: 300000 },
  { label: '50만', value: 500000 },
  { label: '100만', value: 1000000 },
  { label: '300만', value: 3000000 },
  { label: '1,000만', value: 10000000 },
];

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

interface SavingsResult {
  totalDeposit: number;
  grossInterest: number;
  tax: number;
  netInterest: number;
  totalReceive: number;
  effectiveRate: number;
}

function calculateSavings(
  monthlyAmount: number,
  months: number,
  annualRate: number,
  interestType: InterestType,
  taxType: TaxType,
): SavingsResult {
  const totalDeposit = monthlyAmount * months;
  const monthlyRate = annualRate / 100 / 12;
  let grossInterest = 0;

  if (interestType === 'simple') {
    // 단리: 각 회차 납입금 x 월이율 x 잔여개월수
    for (let i = 1; i <= months; i++) {
      grossInterest += monthlyAmount * monthlyRate * (months - i + 1);
    }
  } else {
    // 월복리: 각 회차 납입금이 복리로 성장
    let accumulated = 0;
    for (let i = 1; i <= months; i++) {
      accumulated = (accumulated + monthlyAmount) * (1 + monthlyRate);
    }
    grossInterest = accumulated - totalDeposit;
  }

  const taxRate = TAX_RATES[taxType].rate;
  const tax = Math.round(grossInterest * taxRate);
  const netInterest = grossInterest - tax;
  const totalReceive = totalDeposit + netInterest;
  const effectiveRate = totalDeposit > 0 ? (netInterest / totalDeposit) * (12 / months) * 100 : 0;

  return {
    totalDeposit,
    grossInterest: Math.round(grossInterest),
    tax,
    netInterest: Math.round(netInterest),
    totalReceive: Math.round(totalReceive),
    effectiveRate,
  };
}

function calculateDeposit(
  principal: number,
  months: number,
  annualRate: number,
  interestType: InterestType,
  taxType: TaxType,
): SavingsResult {
  let grossInterest: number;

  if (interestType === 'simple') {
    grossInterest = principal * (annualRate / 100) * (months / 12);
  } else {
    const monthlyRate = annualRate / 100 / 12;
    grossInterest = principal * (Math.pow(1 + monthlyRate, months) - 1);
  }

  const taxRate = TAX_RATES[taxType].rate;
  const tax = Math.round(grossInterest * taxRate);
  const netInterest = grossInterest - tax;
  const totalReceive = principal + netInterest;
  const effectiveRate = principal > 0 ? (netInterest / principal) * (12 / months) * 100 : 0;

  return {
    totalDeposit: principal,
    grossInterest: Math.round(grossInterest),
    tax,
    netInterest: Math.round(netInterest),
    totalReceive: Math.round(totalReceive),
    effectiveRate,
  };
}

export default function SavingsInterestCalculatorPage() {
  const [productType, setProductType] = useState<ProductType>('savings');
  const [amount, setAmount] = useState<string>('300000');
  const [months, setMonths] = useState(12);
  const [annualRate, setAnnualRate] = useState<string>('3.5');
  const [interestType, setInterestType] = useState<InterestType>('simple');
  const [taxType, setTaxType] = useState<TaxType>('normal');

  const result = useMemo(() => {
    const amt = parseFloat(amount);
    const rate = parseFloat(annualRate);
    if (!amt || amt <= 0 || !rate || rate <= 0 || months <= 0) return null;

    if (productType === 'savings') {
      return calculateSavings(amt, months, rate, interestType, taxType);
    } else {
      return calculateDeposit(amt, months, rate, interestType, taxType);
    }
  }, [productType, amount, months, annualRate, interestType, taxType]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="적금 이자 계산기" description="적금, 예금 이자와 세후 실수령액을 간편하게 계산합니다" url="/tools/savings-interest-calculator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "적금 금리 4%면 실제로 이자를 얼마 받나요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "월 30만원씩 12개월 적금(금리 4%, 단리)이면 총 납입액 360만원에 이자는 약 78,000원입니다. 여기서 이자소득세 15.4%를 떼면 세후 이자는 약 66,000원이고, 세후 수령액은 약 3,666,000원입니다. 적금은 매월 납입하므로 예금보다 실효 수익률이 낮습니다."
                }
              },
              {
                "@type": "Question",
                "name": "이자소득세 15.4%는 어떻게 계산하나요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "이자소득세는 이자의 14%(소득세) + 1.4%(지방소득세) = 총 15.4%입니다. 예를 들어 이자가 10만원이면 세금은 15,400원이고 세후 이자는 84,600원입니다. 비과세 적금(청년희망적금, ISA 등)을 이용하면 세금 없이 이자를 전액 받을 수 있습니다."
                }
              }
            ]
          })
        }}
      />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">적금/예금 이자 계산기</h1>
        <p className="text-gray-600">
          적금, 예금의 세후 이자와 만기 수령액을 계산해요
        </p>
      </div>

      {/* 상품 유형 선택 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setProductType('savings'); setAmount('300000'); }}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            productType === 'savings'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          적금 (매월 납입)
        </button>
        <button
          onClick={() => { setProductType('deposit'); setAmount('10000000'); }}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            productType === 'deposit'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          예금 (일시 예치)
        </button>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {/* 금액 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {productType === 'savings' ? '월 납입금' : '예치금'}
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={0}
            />
            <span className="text-gray-600 font-medium">원</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((item) => (
              <button
                key={item.value}
                onClick={() => setAmount(String(item.value))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  amount === String(item.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            가입 기간
          </label>
          <div className="flex flex-wrap gap-2">
            {[6, 12, 18, 24, 36].map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  months === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m}개월
              </button>
            ))}
          </div>
        </div>

        {/* 금리 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연이율 (%)
          </label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={0}
            max={20}
            step="0.1"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {['2.0', '3.0', '3.5', '4.0', '4.5', '5.0'].map((r) => (
              <button
                key={r}
                onClick={() => setAnnualRate(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  annualRate === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* 이자 방식 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">이자 계산 방식</label>
          <div className="flex gap-2">
            <button
              onClick={() => setInterestType('simple')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                interestType === 'simple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              단리
            </button>
            <button
              onClick={() => setInterestType('compound')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                interestType === 'compound'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              복리 (월복리)
            </button>
          </div>
        </div>

        {/* 세금 방식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">세금 유형</label>
          <div className="flex gap-2">
            {(Object.keys(TAX_RATES) as TaxType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTaxType(type)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  taxType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {TAX_RATES[type].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{TAX_RATES[taxType].desc}</p>
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="text-center mb-5">
            <p className="text-sm text-gray-600 mb-1">만기 수령액 (세후)</p>
            <p className="text-4xl font-bold text-blue-600">{formatMoney(result.totalReceive)}</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">
                  {productType === 'savings' ? '총 납입원금' : '예치원금'}
                </span>
                <span className="font-bold text-gray-900">{formatMoney(result.totalDeposit)}</span>
              </div>
              {productType === 'savings' && (
                <p className="text-xs text-gray-500">
                  월 {formatMoney(parseFloat(amount))} x {months}개월
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">세전 이자</span>
                <span className="font-bold text-green-600">+ {formatMoney(result.grossInterest)}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">이자소득세 ({TAX_RATES[taxType].label})</span>
                <span className="font-bold text-red-500">- {formatMoney(result.tax)}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                <span className="text-gray-900 font-medium">세후 이자</span>
                <span className="font-bold text-blue-600">{formatMoney(result.netInterest)}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">세후 실효 수익률 (연환산)</p>
              <p className="text-lg font-bold text-indigo-600">{result.effectiveRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 적금 vs 예금 비교 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">적금 vs 예금 비교</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">구분</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">적금</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">예금</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-gray-900 font-medium">납입 방식</td>
                <td className="py-2 px-2 text-center">매월 일정액</td>
                <td className="py-2 px-2 text-center">일시 예치</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-gray-900 font-medium">이자 계산</td>
                <td className="py-2 px-2 text-center">납입 회차별 계산</td>
                <td className="py-2 px-2 text-center">전체 원금 기준</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-gray-900 font-medium">실효 수익률</td>
                <td className="py-2 px-2 text-center">표시 금리의 약 절반</td>
                <td className="py-2 px-2 text-center">표시 금리와 유사</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-gray-900 font-medium">적합 대상</td>
                <td className="py-2 px-2 text-center">매월 저축 습관</td>
                <td className="py-2 px-2 text-center">목돈 운용</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 이자소득세: 이자의 14% + 지방소득세 1.4% = 총 15.4%</li>
          <li>* 비과세 적금: 청년희망적금, ISA 계좌, 조합원 예탁금 등</li>
          <li>* 적금은 매월 납입하므로 실효 수익률이 표시 금리보다 낮습니다.</li>
          <li>* 은행별 금리와 우대 조건이 다르므로 가입 전 비교하세요.</li>
        </ul>
      </div>

      {/* 상세 가이드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">적금 이자 계산 완벽 가이드</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">적금 vs 예금, 무엇이 다를까?</h3>
            <p>적금(積金)은 매월 일정 금액을 나누어 저축하는 상품이고, 예금(預金)은 목돈을 한 번에 맡기는 상품입니다. 같은 금리라면 예금이 더 유리합니다. 적금은 초반에 납입한 금액만 이자가 붙고, 나중에 납입한 금액은 이자가 적게 붙기 때문입니다. 예를 들어 금리 4%인 적금에 월 100만 원씩 12개월을 넣으면, 실질 수익률은 약 2.2% 수준입니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">단리 vs 복리</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>단리</strong>: 원금에 대해서만 이자를 계산합니다. 대부분의 시중 은행 적금이 단리 방식입니다.</li>
              <li><strong>복리</strong>: 원금 + 이자에 대해 이자를 계산합니다. 일부 저축은행이나 특판 상품에서 복리 적금을 제공합니다.</li>
            </ul>
            <p className="mt-2">12개월 단기 적금에서는 단리와 복리의 차이가 크지 않습니다. 하지만 기간이 길어질수록(3~5년) 복리 효과가 커집니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">이자소득세 15.4%</h3>
            <p>적금, 예금의 이자에는 이자소득세 14%와 지방소득세 1.4%(이자소득세의 10%)를 합한 15.4%가 원천징수됩니다. 예를 들어 세전 이자가 10만 원이면, 실수령 이자는 84,600원입니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>비과세 상품</strong>: 청년희망적금, 조합원 예탁금(농협/신협/새마을금고, 연 3,000만 원 한도) 등은 이자소득세가 면제됩니다.</li>
              <li><strong>세금우대</strong>: 신협/새마을금고의 세금우대 저축은 이자소득세 1.4%(지방소득세만)로 감면됩니다.</li>
              <li><strong>ISA 계좌</strong>: 개인종합자산관리계좌(ISA)에서 발생한 이자는 200~400만 원까지 비과세, 초과분은 9.9% 분리과세됩니다.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">적금 금리 비교 시 체크포인트</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>기본 금리 vs 우대 금리</strong>: 광고하는 금리가 우대 조건을 모두 충족했을 때의 최고 금리인 경우가 많습니다. 카드 실적, 급여이체, 자동이체 등 우대 조건을 꼼꼼히 확인하세요.</li>
              <li><strong>중도해지 금리</strong>: 만기 전 해지하면 약정 금리의 40~60% 수준의 중도해지 금리가 적용됩니다.</li>
              <li><strong>예금자보호</strong>: 은행, 저축은행, 신협 등 금융기관별로 1인당 5,000만 원까지 예금자보호가 됩니다(원금+이자 합산).</li>
              <li><strong>특판 적금</strong>: 은행 앱 전용, 비대면 전용 특판 적금이 일반 적금보다 금리가 0.5~1%p 높은 경우가 많습니다.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">적금 실효 수익률 계산법</h3>
            <p>적금의 표시 금리와 실제 수익률은 다릅니다. 적금은 매월 분할 납입하므로 첫 달 납입금은 12개월간 이자가 붙지만, 마지막 달 납입금은 1개월만 이자가 붙습니다. 이를 평균하면 실효 수익률은 표시 금리의 약 55% 수준입니다. 금리 4% 적금의 실효 수익률은 약 2.2%, 금리 5%이면 약 2.7%입니다.</p>
          </div>
        </div>
      </div>

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">사용 예시</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">월 30만원, 12개월, 금리 4% (단리)</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>총 납입액: 3,600,000원</li>
              <li>세전 이자: 약 78,000원</li>
              <li>이자소득세 (15.4%): 약 12,000원</li>
              <li>세후 수령액: 약 3,666,000원</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">월 50만원, 24개월, 금리 3.5% (단리)</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>총 납입액: 12,000,000원</li>
              <li>세전 이자: 약 437,500원</li>
              <li>이자소득세 (15.4%): 약 67,400원</li>
              <li>세후 수령액: 약 12,370,100원</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 자주 묻는 질문 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
        <div className="space-y-3">
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900 text-sm">적금 금리 4%면 실제로 이자를 얼마 받나요?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
              월 30만원씩 12개월 적금(금리 4%, 단리)이면 총 납입액 360만원에 이자는 약 78,000원입니다. 여기서 이자소득세 15.4%를 떼면 세후 이자는 약 66,000원이고, 세후 수령액은 약 3,666,000원입니다. 적금은 매월 납입하므로 예금보다 실효 수익률이 낮습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900 text-sm">이자소득세 15.4%는 어떻게 계산하나요?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
              이자소득세는 이자의 14%(소득세) + 1.4%(지방소득세) = 총 15.4%입니다. 예를 들어 이자가 10만원이면 세금은 15,400원이고 세후 이자는 84,600원입니다. 비과세 적금(청년희망적금, ISA 등)을 이용하면 세금 없이 이자를 전액 받을 수 있습니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/loan-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">대출이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">대출 조건별 월 상환금과 총 이자 비교</p>
          </Link>
          <Link href="/tools/fire-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">FIRE 조기은퇴 계산기</span>
            <p className="text-sm text-gray-500 mt-1">저축률과 투자수익률로 은퇴 시기 계산</p>
          </Link>
          <Link href="/tools/pension-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">국민연금 수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">예상 국민연금 월 수령액 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
