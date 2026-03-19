'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 1주택 취득세율 (6억~9억 구간별 차등)
function getOneHouseTaxRate(price: number): number {
  if (price <= 600000000) return 0.01;
  if (price <= 900000000) {
    // (취득가액 × 2/3억원 - 3) / 100
    return (price * 2 / 300000000 - 3) / 100;
  }
  return 0.03;
}

// 다주택 취득세율
function getMultiHouseTaxRate(houseCount: number, isRegulated: boolean): number {
  if (houseCount === 2) {
    return isRegulated ? 0.08 : -1; // -1은 일반세율 적용
  }
  if (houseCount >= 3) {
    return isRegulated ? 0.12 : 0.08;
  }
  return -1; // 1주택은 일반세율
}

// 감면 혜택
interface Reduction {
  type: string;
  label: string;
  description: string;
}

const REDUCTIONS: Reduction[] = [
  { type: 'none', label: '감면 없음', description: '일반 취득' },
  { type: 'firstHome', label: '생애최초 주택 구입', description: '부부합산 연소득 7,000만원 이하, 수도권 4억·비수도권 3억 이하' },
  { type: 'newlywed', label: '신혼부부 감면', description: '혼인신고 5년 이내, 수도권 4억·비수도권 3억 이하' },
  { type: 'childbirth', label: '출산가구 감면', description: '2024.1.1 이후 출산, 5년 이내 주택 취득, 500만원 한도 면제' },
];

// 빠른 금액
const QUICK_AMOUNTS = [
  { label: '2억', value: 200000000 },
  { label: '3억', value: 300000000 },
  { label: '5억', value: 500000000 },
  { label: '7억', value: 700000000 },
  { label: '9억', value: 900000000 },
  { label: '12억', value: 1200000000 },
  { label: '15억', value: 1500000000 },
];

interface CalcResult {
  price: number;
  taxRate: number;
  acquisitionTax: number;
  localEducationTax: number;
  ruralTax: number;
  totalTax: number;
  reductionAmount: number;
  finalTax: number;
  effectiveRate: number;
}

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

export default function AcquisitionTaxCalculator() {
  const [price, setPrice] = useState<number>(500000000);
  const [priceInput, setPriceInput] = useState('50000');
  const [houseCount, setHouseCount] = useState<number>(1);
  const [isRegulated, setIsRegulated] = useState<boolean>(true);
  const [isOver85sqm, setIsOver85sqm] = useState<boolean>(false);
  const [reduction, setReduction] = useState<string>('none');

  const result = useMemo<CalcResult | null>(() => {
    if (price <= 0) return null;

    let taxRate: number;

    if (houseCount === 1) {
      taxRate = getOneHouseTaxRate(price);
    } else {
      const multiRate = getMultiHouseTaxRate(houseCount, isRegulated);
      taxRate = multiRate === -1 ? getOneHouseTaxRate(price) : multiRate;
    }

    const acquisitionTax = price * taxRate;

    // 지방교육세: 취득세의 10% (중과세시 중과분 제외 기본세율 기준)
    const localEducationTax = taxRate <= 0.03
      ? acquisitionTax * 0.1
      : price * 0.03 * 0.1; // 중과세 시 기본세율(3%) 기준

    // 농어촌특별세: 전용 85㎡ 초과 시 취득세의 10% (중과세시도 동일 기준)
    const ruralTax = isOver85sqm
      ? (taxRate <= 0.03 ? acquisitionTax * 0.1 : price * 0.03 * 0.1)
      : 0;

    const totalTax = acquisitionTax + localEducationTax + ruralTax;

    // 감면 계산
    let reductionAmount = 0;
    if (reduction === 'firstHome') {
      // 1.5억 이하 면제, 그 외 50% 감면 (200만원 한도)
      if (price <= 150000000) {
        reductionAmount = acquisitionTax;
      } else {
        reductionAmount = Math.min(acquisitionTax * 0.5, 2000000);
      }
    } else if (reduction === 'newlywed') {
      reductionAmount = Math.min(acquisitionTax * 0.5, 2000000);
    } else if (reduction === 'childbirth') {
      reductionAmount = Math.min(acquisitionTax, 5000000);
    }

    // 다주택은 감면 불가
    if (houseCount >= 2 && isRegulated) {
      reductionAmount = 0;
    }

    const finalTax = totalTax - reductionAmount;
    const effectiveRate = price > 0 ? (finalTax / price) * 100 : 0;

    return {
      price,
      taxRate,
      acquisitionTax,
      localEducationTax,
      ruralTax,
      totalTax,
      reductionAmount,
      finalTax,
      effectiveRate,
    };
  }, [price, houseCount, isRegulated, isOver85sqm, reduction]);

  const handlePriceInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    setPriceInput(num);
    setPrice(parseInt(num || '0') * 10000);
  };

  const handleQuickAmount = (value: number) => {
    setPrice(value);
    setPriceInput(String(value / 10000));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="취득세 계산기"
        description="주택 취득세를 자동 계산합니다. 1주택·다주택 세율, 조정대상지역, 생애최초·신혼·출산가구 감면까지 반영한 정확한 취득세 계산."
        url="https://sseuksak.com/tools/acquisition-tax-calculator"
      />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-1">/</span>
        <Link href="/tools" className="hover:text-blue-600">도구</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">취득세 계산기</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">취득세 계산기</h1>
      <p className="text-gray-600 mb-6">주택 가격, 보유 주택 수, 지역 구분을 입력하면 취득세·지방교육세·농어촌특별세를 자동 계산합니다.</p>

      {/* 입력 영역 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-5">
        {/* 주택 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">주택 가격 (만원)</label>
          <input
            type="text"
            inputMode="numeric"
            value={priceInput ? parseInt(priceInput).toLocaleString('ko-KR') : ''}
            onChange={(e) => handlePriceInput(e.target.value)}
            placeholder="50000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          {price > 0 && (
            <p className="text-sm text-gray-500 mt-1">{formatWon(price)}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q.value}
                onClick={() => handleQuickAmount(q.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  price === q.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* 보유 주택 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">취득 후 보유 주택 수</label>
          <div className="flex gap-2">
            {[
              { value: 1, label: '1주택' },
              { value: 2, label: '2주택' },
              { value: 3, label: '3주택+' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHouseCount(opt.value)}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  houseCount === opt.value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 조정대상지역 (다주택일 때만 표시) */}
        {houseCount >= 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">조정대상지역 여부</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRegulated(true)}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  isRegulated
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                조정대상지역
              </button>
              <button
                onClick={() => setIsRegulated(false)}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  !isRegulated
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                비조정대상지역
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">서울 전역, 경기 과천·성남·하남·광명 등이 조정대상지역입니다 (2026년 기준)</p>
          </div>
        )}

        {/* 전용면적 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="over85"
            checked={isOver85sqm}
            onChange={(e) => setIsOver85sqm(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="over85" className="text-sm text-gray-700">
            전용면적 85㎡(약 25.7평) 초과
            <span className="text-gray-400 ml-1">(농어촌특별세 추가)</span>
          </label>
        </div>

        {/* 감면 혜택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">감면 혜택</label>
          <div className="space-y-2">
            {REDUCTIONS.map((r) => (
              <label
                key={r.type}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  reduction === r.type
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="reduction"
                  value={r.type}
                  checked={reduction === r.type}
                  onChange={() => setReduction(r.type)}
                  className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">{r.label}</span>
                  <p className="text-xs text-gray-500">{r.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">계산 결과</h2>

          {/* 최종 납부액 */}
          <div className="bg-white rounded-lg p-5 mb-4 text-center">
            <p className="text-sm text-gray-500 mb-1">총 납부세액</p>
            <p className="text-3xl font-bold text-blue-700">{formatWon(result.finalTax)}</p>
            <p className="text-sm text-gray-500 mt-1">
              실효세율 {result.effectiveRate.toFixed(2)}%
            </p>
          </div>

          {/* 세부 내역 */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">주택 가격</span>
              <span className="font-medium">{formatWon(result.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                적용 세율
                {houseCount >= 2 && isRegulated && (
                  <span className="text-red-500 ml-1">(중과)</span>
                )}
              </span>
              <span className="font-medium">{(result.taxRate * 100).toFixed(2)}%</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">취득세</span>
              <span className="font-medium">{formatWon(result.acquisitionTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">지방교육세</span>
              <span className="font-medium">{formatWon(result.localEducationTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">농어촌특별세 {!isOver85sqm && '(해당없음)'}</span>
              <span className="font-medium">{formatWon(result.ruralTax)}</span>
            </div>
            {result.reductionAmount > 0 && (
              <>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">감면액</span>
                  <span className="font-medium text-green-600">-{formatWon(result.reductionAmount)}</span>
                </div>
              </>
            )}
            <hr className="border-gray-200" />
            <div className="flex justify-between font-bold">
              <span>최종 납부액</span>
              <span className="text-blue-700">{formatWon(result.finalTax)}</span>
            </div>
          </div>

          {/* 경고/안내 */}
          {houseCount >= 2 && isRegulated && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                조정대상지역 {houseCount}주택 중과세율({(result.taxRate * 100).toFixed(0)}%)이 적용됩니다.
                1주택이면 {formatWon(price * getOneHouseTaxRate(price) * 1.1)}으로 약 {formatWon(result.finalTax - price * getOneHouseTaxRate(price) * 1.1)} 절감됩니다.
              </p>
            </div>
          )}

          {reduction !== 'none' && result.reductionAmount === 0 && houseCount >= 2 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                다주택 중과세 적용 시 감면 혜택을 받을 수 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 가격대별 비교 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">주택 가격대별 취득세 비교</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-gray-600 font-medium">주택 가격</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">1주택</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">2주택(조정)</th>
                <th className="text-right py-2 pl-2 text-gray-600 font-medium">3주택+(조정)</th>
              </tr>
            </thead>
            <tbody>
              {[300000000, 500000000, 700000000, 900000000, 1200000000, 1500000000].map((p) => {
                const rate1 = getOneHouseTaxRate(p);
                const tax1 = p * rate1 * 1.1;
                const tax2 = p * 0.08 + p * 0.03 * 0.1;
                const tax3 = p * 0.12 + p * 0.03 * 0.1;
                return (
                  <tr key={p} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">{formatWon(p)}</td>
                    <td className="py-2 px-2 text-right">{formatWon(tax1)}</td>
                    <td className="py-2 px-2 text-right text-red-600">{formatWon(tax2)}</td>
                    <td className="py-2 pl-2 text-right text-red-700 font-medium">{formatWon(tax3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">* 지방교육세 포함, 농어촌특별세 미포함 기준</p>
      </div>

      {/* 상세 가이드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">취득세 상세 가이드</h2>

        <h3 className="font-semibold text-gray-900 mt-4 mb-2">1주택 취득세율 구조</h3>
        <p className="text-sm text-gray-600 mb-3">
          1주택자의 취득세율은 주택 가격에 따라 1~3%가 적용됩니다. 6억원 이하는 1%, 9억원 초과는 3%이며,
          6억~9억원 구간은 점진적으로 올라갑니다. 정확한 산식은 (취득가액 x 2/3억원 - 3) / 100입니다.
          예를 들어 7억원이면 약 1.67%, 8억원이면 약 2.33%입니다.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4 mb-2">다주택 중과세율</h3>
        <p className="text-sm text-gray-600 mb-3">
          조정대상지역에서 2주택을 보유하면 8%, 3주택 이상이면 12%의 중과세율이 적용됩니다.
          비조정대상지역에서는 2주택까지 일반세율(1~3%)이 적용되고, 3주택부터 8%가 적용됩니다.
          법인은 지역에 관계없이 12%입니다. 같은 7억원 아파트라도 1주택(약 1,300만원)과
          조정지역 3주택(약 9,660만원)은 7배 이상 차이가 납니다.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4 mb-2">부가세 — 지방교육세와 농어촌특별세</h3>
        <p className="text-sm text-gray-600 mb-3">
          취득세 외에 지방교육세(기본세율 기준 취득세의 10%)가 추가됩니다.
          전용면적 85㎡(약 25.7평)를 초과하는 주택은 농어촌특별세(기본세율 기준 취득세의 10%)도 부과됩니다.
          국민주택규모(85㎡ 이하)는 농어촌특별세가 면제됩니다.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4 mb-2">감면 혜택 상세</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>생애최초 주택 구입:</strong> 부부합산 연소득 7,000만원 이하이고 수도권 4억원(비수도권 3억원) 이하 주택이면
            취득세 50% 감면(200만원 한도). 1.5억원 이하 주택은 전액 면제됩니다.
          </p>
          <p>
            <strong>신혼부부:</strong> 혼인신고일 기준 5년 이내, 수도권 4억원(비수도권 3억원) 이하 주택에 대해 취득세 50% 감면.
          </p>
          <p>
            <strong>출산가구 (2024년 신설):</strong> 2024년 1월 1일 이후 출산한 자녀가 있는 가구가 출생 후 5년 이내 주택을 취득하면
            취득세 500만원 한도 면제. 생애최초보다 감면 한도가 큽니다.
          </p>
        </div>

        <h3 className="font-semibold text-gray-900 mt-4 mb-2">납부 시기와 방법</h3>
        <p className="text-sm text-gray-600 mb-3">
          취득세는 잔금일(소유권 이전일)로부터 60일 이내에 신고·납부해야 합니다. 기한 초과 시 무신고가산세 20%가 부과됩니다.
          위택스(wetax.go.kr)에서 온라인 신고·납부하거나, 법무사를 통해 등기와 함께 처리할 수 있습니다.
          법무사 수수료는 30~50만원 수준입니다.
        </p>

        <h3 className="font-semibold text-gray-900 mt-4 mb-2">주택 외 취득세</h3>
        <p className="text-sm text-gray-600">
          토지는 4%, 건물(비주거)은 4%, 상속 취득은 2.8%(농지 2.3%), 증여 취득은 3.5%입니다.
          이 계산기는 유상 매매에 의한 주택 취득세를 기준으로 합니다. 증여 취득세는 별도의 세율이 적용되므로
          증여세 계산기를 참고하세요.
        </p>
      </div>

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">사용 예시</h3>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">무주택자가 5억원 아파트 매수 (85㎡ 이하)</p>
            <p className="text-sm text-gray-600">
              1주택 세율 1% 적용. 취득세 500만원 + 지방교육세 50만원 = 총 550만원.
              생애최초 감면 시 200만원 감면되어 350만원 납부.
            </p>
          </div>
          <div className="border-l-4 border-red-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">1주택자가 조정지역에서 7억원 아파트 추가 매수</p>
            <p className="text-sm text-gray-600">
              2주택 중과세율 8% 적용. 취득세 5,600만원 + 지방교육세 210만원 = 약 5,810만원.
              1주택이면 약 1,380만원으로 4,400만원 이상 차이.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">출산가구가 3억원 아파트 생애최초 매수</p>
            <p className="text-sm text-gray-600">
              취득세 300만원. 출산가구 감면(500만원 한도) 적용 시 취득세 전액 면제.
              지방교육세 30만원만 납부하면 됩니다.
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
              조정대상지역인지 어떻게 확인하나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              국토교통부 홈페이지에서 &apos;조정대상지역&apos;을 검색하면 현재 지정 목록을 확인할 수 있습니다.
              2026년 기준 서울 전역, 경기 과천·성남·하남·광명 등이 조정대상지역입니다.
              지역 지정·해제는 수시로 변경되므로 매수 전에 반드시 최신 현황을 확인하세요.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              생애최초 감면과 출산가구 감면을 동시에 받을 수 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              중복 적용이 안 됩니다. 두 가지 모두 해당되는 경우, 감면 금액이 더 큰 쪽을 선택하는 것이 유리합니다.
              출산가구 감면은 500만원 한도로 생애최초(200만원 한도)보다 클 수 있습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              일시적 2주택도 중과세가 적용되나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              이사 등의 이유로 일시적 2주택이 된 경우, 종전 주택을 3년 이내에 처분하면
              1주택 세율이 적용됩니다. 단, 취득 시점에는 일단 2주택 세율로 납부하고
              처분 후 환급 신청하는 방식이므로, 자금 계획에 유의해야 합니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              취득세 납부 기한을 넘기면 어떻게 되나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              잔금일로부터 60일 이내에 신고·납부해야 합니다. 기한을 넘기면 무신고가산세 20%와
              납부불성실가산세(1일당 약 0.022%)가 추가됩니다. 예를 들어 취득세 500만원을 30일 늦게 납부하면
              가산세만 약 103만원(무신고 100만원 + 납부불성실 약 3만원)이 추가됩니다.
            </div>
          </details>
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
                name: '조정대상지역인지 어떻게 확인하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '국토교통부 홈페이지에서 조정대상지역을 검색하면 현재 지정 목록을 확인할 수 있습니다. 2026년 기준 서울 전역, 경기 과천·성남·하남·광명 등이 조정대상지역입니다.',
                },
              },
              {
                '@type': 'Question',
                name: '생애최초 감면과 출산가구 감면을 동시에 받을 수 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '중복 적용이 안 됩니다. 두 가지 모두 해당되는 경우 감면 금액이 더 큰 쪽을 선택하는 것이 유리합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '일시적 2주택도 중과세가 적용되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '이사 등의 이유로 일시적 2주택이 된 경우, 종전 주택을 3년 이내에 처분하면 1주택 세율이 적용됩니다.',
                },
              },
              {
                '@type': 'Question',
                name: '취득세 납부 기한을 넘기면 어떻게 되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '잔금일로부터 60일 이내에 신고·납부해야 합니다. 기한을 넘기면 무신고가산세 20%와 납부불성실가산세가 추가됩니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/housing-cost-simulator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">주거비용 시뮬레이터</span>
            <p className="text-sm text-gray-500 mt-1">전세 vs 월세 vs 매매 총비용 비교</p>
          </Link>
          <Link href="/tools/gift-tax-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">증여세 계산기</span>
            <p className="text-sm text-gray-500 mt-1">증여재산 세금 자동 계산</p>
          </Link>
          <Link href="/tools/loan-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">대출이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">주담대 월 상환액 계산</p>
          </Link>
          <Link href="/posts/acquisition-tax-guide-2026" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">취득세 완전 가이드</span>
            <p className="text-sm text-gray-500 mt-1">1주택·다주택 세율 비교 + 감면 혜택 총정리</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
