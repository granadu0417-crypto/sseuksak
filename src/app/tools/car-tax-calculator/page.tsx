'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 비영업용 승용자동차 자동차세 (cc당 세율)
const TAX_RATES = [
  { maxCc: 1000, rate: 80, label: '1,000cc 이하' },
  { maxCc: 1600, rate: 140, label: '1,001~1,600cc' },
  { maxCc: Infinity, rate: 200, label: '1,601cc 이상' },
];

// 차령별 경감률 (3년 이후 매년 5%, 최대 50%)
function getAgeDiscount(years: number): number {
  if (years <= 2) return 0;
  const discountYears = years - 2;
  return Math.min(discountYears * 0.05, 0.5);
}

// 연납 할인율
const ANNUAL_DISCOUNTS: { month: number; label: string; rate: number }[] = [
  { month: 1, label: '1월 연납', rate: 0.05 },
  { month: 3, label: '3월 연납', rate: 0.0375 },
  { month: 6, label: '6월 연납', rate: 0.025 },
  { month: 9, label: '9월 연납', rate: 0.0125 },
];

// 인기 차량 프리셋
const PRESETS = [
  { name: '모닝 (1.0L)', cc: 998, type: 'gasoline' as const },
  { name: '아반떼 (1.6L)', cc: 1598, type: 'gasoline' as const },
  { name: '쏘나타 (2.0L)', cc: 1999, type: 'gasoline' as const },
  { name: '그랜저 (2.5L)', cc: 2497, type: 'gasoline' as const },
  { name: '투싼 (1.6T)', cc: 1598, type: 'gasoline' as const },
  { name: '팰리세이드 (3.8L)', cc: 3778, type: 'gasoline' as const },
  { name: '테슬라 모델3', cc: 0, type: 'electric' as const },
  { name: '아이오닉6', cc: 0, type: 'electric' as const },
];

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

function calculateCarTax(cc: number, vehicleAge: number, isElectric: boolean) {
  // 전기차: 비영업용 기준 연 130,000원 고정
  if (isElectric) {
    const baseTax = 130000;
    const localEduTax = Math.round(baseTax * 0.3); // 지방교육세 30%
    const total = baseTax + localEduTax;
    return {
      baseTax,
      localEduTax,
      total,
      ageDiscount: 0,
      ageDiscountRate: 0,
      taxPerCc: 0,
      halfYear: Math.round(total / 2),
    };
  }

  // 내연기관
  let taxPerCc = 0;
  for (const tier of TAX_RATES) {
    if (cc <= tier.maxCc) {
      taxPerCc = tier.rate;
      break;
    }
  }

  const rawBaseTax = cc * taxPerCc;
  const ageDiscountRate = getAgeDiscount(vehicleAge);
  const ageDiscount = Math.round(rawBaseTax * ageDiscountRate);
  const baseTax = rawBaseTax - ageDiscount;
  const localEduTax = Math.round(baseTax * 0.3); // 지방교육세 30%
  const total = baseTax + localEduTax;

  return {
    baseTax: Math.round(baseTax),
    localEduTax,
    total,
    ageDiscount,
    ageDiscountRate,
    taxPerCc,
    halfYear: Math.round(total / 2),
  };
}

export default function CarTaxCalculatorPage() {
  const [cc, setCc] = useState<string>('1999');
  const [vehicleAge, setVehicleAge] = useState<string>('0');
  const [isElectric, setIsElectric] = useState(false);
  const [annualPayMonth, setAnnualPayMonth] = useState(1);

  const result = useMemo(() => {
    const ccNum = parseInt(cc) || 0;
    const ageNum = parseInt(vehicleAge) || 0;
    if (ccNum <= 0 && !isElectric) return null;
    return calculateCarTax(ccNum, ageNum, isElectric);
  }, [cc, vehicleAge, isElectric]);

  const annualDiscount = ANNUAL_DISCOUNTS.find((d) => d.month === annualPayMonth);
  const annualSaving = result && annualDiscount ? Math.round(result.total * annualDiscount.rate) : 0;
  const annualTotal = result ? result.total - annualSaving : 0;

  // 차량 연식별 비교
  const ageComparison = useMemo(() => {
    const ccNum = parseInt(cc) || 0;
    if (ccNum <= 0 && !isElectric) return [];
    return [0, 3, 5, 7, 10, 12].map((age) => {
      const r = calculateCarTax(ccNum, age, isElectric);
      return { age, total: r.total, discountRate: r.ageDiscountRate };
    });
  }, [cc, isElectric]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="자동차세 계산기"
        description="배기량(cc)과 차량 연식으로 자동차세를 계산합니다. 연납 할인, 차령 경감, 전기차 세금까지 한번에 확인하세요."
        url="/tools/car-tax-calculator"
      />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">자동차세 계산기</h1>
        <p className="text-gray-600">
          배기량과 연식으로 연간 자동차세를 계산해요
        </p>
      </div>

      {/* 차량 유형 선택 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setIsElectric(false)}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            !isElectric
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          내연기관
        </button>
        <button
          onClick={() => setIsElectric(true)}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            isElectric
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전기차
        </button>
      </div>

      {/* 인기 차량 프리셋 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">인기 차량 바로 선택</h2>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.filter((p) => (isElectric ? p.type === 'electric' : p.type !== 'electric')).map(
            (preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setCc(preset.cc.toString());
                  setIsElectric(preset.type === 'electric');
                }}
                className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                  parseInt(cc) === preset.cc && isElectric === (preset.type === 'electric')
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <p className="font-semibold">{preset.name}</p>
                <p className="text-xs text-gray-400">{preset.cc > 0 ? `${preset.cc.toLocaleString()}cc` : '전기차'}</p>
              </button>
            )
          )}
        </div>
      </div>

      {/* 배기량 입력 */}
      {!isElectric && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배기량 (cc)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="9999"
              placeholder="배기량 입력"
            />
            <span className="text-gray-500 font-medium">cc</span>
          </div>
        </div>
      )}

      {/* 차량 연식 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          차량 연식 (경과 년수)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={vehicleAge}
            onChange={(e) => setVehicleAge(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="30"
            placeholder="0"
          />
          <span className="text-gray-500 font-medium">년</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          3년부터 매년 5%씩 경감 (최대 50%, 12년 이상)
        </p>
      </div>

      {/* 연납 할인 선택 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">연납 시기</h2>
        <div className="grid grid-cols-2 gap-2">
          {ANNUAL_DISCOUNTS.map((d) => (
            <button
              key={d.month}
              onClick={() => setAnnualPayMonth(d.month)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                annualPayMonth === d.month
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <p className="font-semibold">{d.label}</p>
              <p className="text-xs text-gray-400">약 {(d.rate * 100).toFixed(1)}% 할인</p>
            </button>
          ))}
        </div>
      </div>

      {/* 계산 결과 */}
      {result && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-1">연간 자동차세</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatMoney(annualTotal)}
              </p>
              {annualSaving > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  연납 할인 -{formatMoney(annualSaving)} 적용
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {!isElectric && (
                <div className="flex justify-between">
                  <span className="text-gray-600">cc당 세율</span>
                  <span className="font-medium">{result.taxPerCc}원/cc</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">자동차세 (본세)</span>
                <span className="font-medium">{formatMoney(result.baseTax)}</span>
              </div>
              {result.ageDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>차령 경감 ({Math.round(result.ageDiscountRate * 100)}%)</span>
                  <span className="font-medium">-{formatMoney(result.ageDiscount)} 적용됨</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">지방교육세 (30%)</span>
                <span className="font-medium">{formatMoney(result.localEduTax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-gray-600">연간 합계</span>
                <span className="font-medium">{formatMoney(result.total)}</span>
              </div>
              {annualSaving > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>연납 할인</span>
                  <span className="font-medium">-{formatMoney(annualSaving)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-base font-bold">
                <span>최종 납부액</span>
                <span className="text-blue-600">{formatMoney(annualTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>반기별 납부 시</span>
                <span>{formatMoney(result.halfYear)} x 2회</span>
              </div>
            </div>
          </div>

          {/* 연식별 비교 */}
          {!isElectric && ageComparison.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">연식별 자동차세 비교</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600">차량 연식</th>
                      <th className="text-right py-2 text-gray-600">경감률</th>
                      <th className="text-right py-2 text-gray-600">연간 세금</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ageComparison.map((row) => (
                      <tr
                        key={row.age}
                        className={`border-b border-gray-100 ${
                          row.age === parseInt(vehicleAge)
                            ? 'bg-blue-50 font-semibold'
                            : ''
                        }`}
                      >
                        <td className="py-2">{row.age === 0 ? '신차' : `${row.age}년`}</td>
                        <td className="text-right py-2">
                          {row.discountRate > 0
                            ? `-${Math.round(row.discountRate * 100)}%`
                            : '-'}
                        </td>
                        <td className="text-right py-2">{formatMoney(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 세율표 안내 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">비영업용 승용차 자동차세율</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 text-gray-600">배기량</th>
                    <th className="text-right py-2 text-gray-600">cc당 세액</th>
                    <th className="text-right py-2 text-gray-600">예시 (연간)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">1,000cc 이하</td>
                    <td className="text-right py-2">80원</td>
                    <td className="text-right py-2">1,000cc = {formatMoney(1000 * 80 * 1.3)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">1,001~1,600cc</td>
                    <td className="text-right py-2">140원</td>
                    <td className="text-right py-2">1,600cc = {formatMoney(1600 * 140 * 1.3)}</td>
                  </tr>
                  <tr>
                    <td className="py-2">1,601cc 이상</td>
                    <td className="text-right py-2">200원</td>
                    <td className="text-right py-2">2,000cc = {formatMoney(2000 * 200 * 1.3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * 지방교육세 30% 포함 금액. 전기차는 비영업용 기준 연 130,000원 + 지방교육세.
            </p>
          </div>
        </>
      )}

      {/* 관련 도구 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">관련 도구</h2>
        <div className="grid gap-3">
          <Link
            href="/tools/car-cost-simulator"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">자동차 구매 vs 리스 vs 장기렌트 비교</p>
            <p className="text-sm text-gray-500">3가지 방식의 장기 비용 차트 비교</p>
          </Link>
          <Link
            href="/tools/acquisition-tax-calculator"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">취득세 계산기</p>
            <p className="text-sm text-gray-500">부동산 취득세 자동 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
