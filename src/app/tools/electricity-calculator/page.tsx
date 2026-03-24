'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2024년 기준 주택용 전력 누진제 (저압)
// 1구간: 0~200kWh, 2구간: 201~400kWh, 3구간: 401kWh~
const TIERS = [
  { limit: 200, rate: 120.0, base: 910 },
  { limit: 400, rate: 214.6, base: 1600 },
  { limit: Infinity, rate: 307.3, base: 7300 },
];

// 필수 사용량 보장공제 (200kWh 이하)
const ESSENTIAL_DISCOUNT_LIMIT = 200;
const ESSENTIAL_DISCOUNT = 4000;

// 복지 할인
const WELFARE_DISCOUNTS: { label: string; value: string; amount: number }[] = [
  { label: '해당 없음', value: 'none', amount: 0 },
  { label: '장애인 할인 (월 16,000원)', value: 'disabled', amount: 16000 },
  { label: '기초생활수급자 (월 16,000원)', value: 'basic', amount: 16000 },
  { label: '차상위계층 (월 10,000원)', value: 'near-basic', amount: 10000 },
  { label: '대가족/3자녀 (월 16,000원)', value: 'family', amount: 16000 },
  { label: '독립유공자 (월 16,000원)', value: 'patriot', amount: 16000 },
  { label: '사회복지시설 (월 전기요금 감면)', value: 'welfare', amount: 10000 },
];

// 하계(7~8월) 누진 완화
const SUMMER_TIERS = [
  { limit: 300, rate: 120.0, base: 910 },
  { limit: 450, rate: 214.6, base: 1600 },
  { limit: Infinity, rate: 307.3, base: 7300 },
];

const QUICK_KWH = [100, 200, 300, 400, 500, 600];

// 가전제품별 월 예상 사용량
const APPLIANCES = [
  { name: '에어컨', kwh: 150, icon: 'AC' },
  { name: '냉장고', kwh: 40, icon: '냉' },
  { name: '세탁기', kwh: 20, icon: '세' },
  { name: 'TV', kwh: 30, icon: 'TV' },
  { name: '전기밥솥', kwh: 25, icon: '밥' },
  { name: '컴퓨터', kwh: 45, icon: 'PC' },
  { name: '전기히터', kwh: 180, icon: '히' },
  { name: '건조기', kwh: 60, icon: '건' },
];

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

function calculateBill(kwh: number, isSummer: boolean) {
  const tiers = isSummer ? SUMMER_TIERS : TIERS;
  let remaining = kwh;
  let energyCharge = 0;
  let baseFee = 0;
  let tierIndex = 0;

  for (let i = 0; i < tiers.length; i++) {
    const prevLimit = i === 0 ? 0 : tiers[i - 1].limit;
    const tierKwh = Math.min(remaining, tiers[i].limit - prevLimit);
    if (tierKwh <= 0) break;
    energyCharge += tierKwh * tiers[i].rate;
    remaining -= tierKwh;
    tierIndex = i;
    if (remaining <= 0) break;
  }

  baseFee = tiers[tierIndex].base;

  // 필수 사용량 보장공제
  const essentialDiscount = kwh <= ESSENTIAL_DISCOUNT_LIMIT ? ESSENTIAL_DISCOUNT : 0;

  const subtotal = baseFee + energyCharge - essentialDiscount;
  const climateCharge = Math.round(kwh * 9); // 기후환경요금 약 9원/kWh
  const fuelAdjust = Math.round(kwh * 5); // 연료비조정액 약 5원/kWh

  const beforeVat = subtotal + climateCharge + fuelAdjust;
  const vat = Math.round(beforeVat * 0.1); // 부가세 10%
  const elecFund = Math.round(beforeVat * 0.037); // 전력산업기반기금 3.7%

  const total = beforeVat + vat + elecFund;
  // 10원 미만 절사
  const finalTotal = Math.floor(total / 10) * 10;

  return {
    kwh,
    tierIndex,
    baseFee,
    energyCharge: Math.round(energyCharge),
    essentialDiscount,
    climateCharge,
    fuelAdjust,
    subtotal: Math.round(subtotal),
    vat,
    elecFund,
    total: finalTotal,
  };
}

export default function ElectricityCalculatorPage() {
  const [kwh, setKwh] = useState<string>('300');
  const [isSummer, setIsSummer] = useState(false);
  const [welfare, setWelfare] = useState('none');
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);

  const applianceKwh = useMemo(() => {
    return APPLIANCES
      .filter((a) => selectedAppliances.includes(a.name))
      .reduce((sum, a) => sum + a.kwh, 0);
  }, [selectedAppliances]);

  const totalKwh = useMemo(() => {
    const input = parseInt(kwh) || 0;
    return input + applianceKwh;
  }, [kwh, applianceKwh]);

  const result = useMemo(() => {
    if (totalKwh <= 0) return null;
    return calculateBill(totalKwh, isSummer);
  }, [totalKwh, isSummer]);

  const welfareAmount = WELFARE_DISCOUNTS.find((w) => w.value === welfare)?.amount || 0;
  const finalBill = result ? Math.max(0, result.total - welfareAmount) : 0;

  // 구간별 비교 테이블
  const comparisonData = useMemo(() => {
    return [100, 200, 300, 400, 500, 600].map((k) => {
      const r = calculateBill(k, isSummer);
      return { kwh: k, total: r.total, perKwh: Math.round(r.total / k) };
    });
  }, [isSummer]);

  const tierLabel = result
    ? result.tierIndex === 0
      ? '1구간 (0~200kWh)'
      : result.tierIndex === 1
        ? '2구간 (201~400kWh)'
        : '3구간 (401kWh~)'
    : '';

  const tierColor = result
    ? result.tierIndex === 0
      ? 'text-green-600'
      : result.tierIndex === 1
        ? 'text-yellow-600'
        : 'text-red-600'
    : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="전기세 계산기"
        description="월 전기 사용량(kWh)을 입력하면 누진제 구간별 전기요금, 부가세, 기후환경요금까지 포함한 예상 전기세를 계산합니다"
        url="/tools/electricity-calculator"
      />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">전기세 계산기</h1>
        <p className="text-gray-600">
          월 사용량으로 누진제 전기요금을 계산해요
        </p>
      </div>

      {/* 시즌 선택 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setIsSummer(false)}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            !isSummer
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          일반 (3~6월, 9~2월)
        </button>
        <button
          onClick={() => setIsSummer(true)}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            isSummer
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          하계 (7~8월)
        </button>
      </div>

      {/* 사용량 입력 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          월 전기 사용량 (kWh)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={kwh}
            onChange={(e) => setKwh(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="9999"
            placeholder="사용량 입력"
          />
          <span className="text-gray-500 font-medium">kWh</span>
        </div>

        {/* 빠른 선택 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_KWH.map((q) => (
            <button
              key={q}
              onClick={() => setKwh(q.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                parseInt(kwh) === q
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {q}kWh
            </button>
          ))}
        </div>
      </div>

      {/* 가전제품 추가 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          가전제품 추가 (월 예상 사용량)
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {APPLIANCES.map((appliance) => {
            const isSelected = selectedAppliances.includes(appliance.name);
            return (
              <button
                key={appliance.name}
                onClick={() =>
                  setSelectedAppliances((prev) =>
                    isSelected
                      ? prev.filter((a) => a !== appliance.name)
                      : [...prev, appliance.name]
                  )
                }
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{appliance.icon}</span>
                <span>{appliance.name}</span>
                <span className="text-[10px] text-gray-400">{appliance.kwh}kWh</span>
              </button>
            );
          })}
        </div>
        {applianceKwh > 0 && (
          <p className="mt-3 text-sm text-blue-600">
            가전제품 추가: +{applianceKwh}kWh → 총 {totalKwh}kWh
          </p>
        )}
      </div>

      {/* 복지 할인 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          복지 할인 대상
        </label>
        <select
          value={welfare}
          onChange={(e) => setWelfare(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {WELFARE_DISCOUNTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* 계산 결과 */}
      {result && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-1">예상 전기요금</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatMoney(finalBill)}
              </p>
              <p className={`text-sm font-medium mt-1 ${tierColor}`}>
                {tierLabel}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">기본요금</span>
                <span className="font-medium">{formatMoney(result.baseFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">전력량요금 ({totalKwh}kWh)</span>
                <span className="font-medium">{formatMoney(result.energyCharge)}</span>
              </div>
              {result.essentialDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>필수사용량 보장공제</span>
                  <span className="font-medium">-{formatMoney(result.essentialDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">기후환경요금</span>
                <span className="font-medium">{formatMoney(result.climateCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연료비조정액</span>
                <span className="font-medium">{formatMoney(result.fuelAdjust)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-gray-600">부가세 (10%)</span>
                <span className="font-medium">{formatMoney(result.vat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">전력산업기반기금 (3.7%)</span>
                <span className="font-medium">{formatMoney(result.elecFund)}</span>
              </div>
              {welfareAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>복지 할인</span>
                  <span className="font-medium">-{formatMoney(welfareAmount)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-base font-bold">
                <span>최종 납부액</span>
                <span className="text-blue-600">{formatMoney(finalBill)}</span>
              </div>
            </div>
          </div>

          {/* kWh당 단가 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-1">kWh당 단가</h2>
            <p className="text-2xl font-bold text-gray-900">
              {totalKwh > 0 ? Math.round(finalBill / totalKwh) : 0}원/kWh
            </p>
            <p className="text-sm text-gray-500 mt-1">
              총 {formatMoney(finalBill)} / {totalKwh}kWh
            </p>
          </div>

          {/* 구간별 비교 테이블 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">사용량별 요금 비교</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">사용량</th>
                    <th className="text-right py-2 text-gray-600">예상 요금</th>
                    <th className="text-right py-2 text-gray-600">kWh당 단가</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row) => (
                    <tr
                      key={row.kwh}
                      className={`border-b border-gray-100 ${
                        row.kwh === Math.round(totalKwh / 100) * 100 || (totalKwh <= 100 && row.kwh === 100)
                          ? 'bg-blue-50 font-semibold'
                          : ''
                      }`}
                    >
                      <td className="py-2">{row.kwh}kWh</td>
                      <td className="text-right py-2">{formatMoney(row.total)}</td>
                      <td className="text-right py-2">{row.perKwh}원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 절약 팁 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">전기세 절약 팁</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span><strong>1구간(200kWh) 이하 유지</strong>가 핵심 &#8212; 2구간 넘어가면 단가가 약 79% 급등합니다</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span><strong>에어컨 설정 온도 26도</strong> &#8212; 1도 올리면 월 전기세 약 3~5% 절감</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span><strong>대기전력 차단</strong> &#8212; 멀티탭 스위치 끄기만으로 월 5~10% 절감 가능</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span><strong>LED 조명 교체</strong> &#8212; 형광등 대비 전력 소비 60% 감소</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span><strong>에너지 효율 1등급 가전</strong> 선택 &#8212; 5등급 대비 연간 30~40% 전력 절감</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* 누진제 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">주택용 전기 누진제 요금표</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 text-gray-600">구간</th>
                <th className="text-right py-2 text-gray-600">사용량</th>
                <th className="text-right py-2 text-gray-600">기본요금</th>
                <th className="text-right py-2 text-gray-600">전력량요금</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-green-600 font-medium">1구간</td>
                <td className="text-right py-2">{isSummer ? '0~300' : '0~200'}kWh</td>
                <td className="text-right py-2">{formatMoney(910)}</td>
                <td className="text-right py-2">120.0원/kWh</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-yellow-600 font-medium">2구간</td>
                <td className="text-right py-2">{isSummer ? '301~450' : '201~400'}kWh</td>
                <td className="text-right py-2">{formatMoney(1600)}</td>
                <td className="text-right py-2">214.6원/kWh</td>
              </tr>
              <tr>
                <td className="py-2 text-red-600 font-medium">3구간</td>
                <td className="text-right py-2">{isSummer ? '451kWh~' : '401kWh~'}</td>
                <td className="text-right py-2">{formatMoney(7300)}</td>
                <td className="text-right py-2">307.3원/kWh</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * 2024년 한국전력 주택용 전력(저압) 기준. 기후환경요금, 연료비조정액, 부가세, 전력산업기반기금 별도 부과됩니다.
        </p>
      </div>

      {/* 관련 도구 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-3">관련 도구</h2>
        <div className="grid gap-3">
          <Link
            href="/tools/salary-calculator"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">연봉 실수령액 계산기</p>
            <p className="text-sm text-gray-500">4대보험, 소득세 공제 후 실제 받는 월급</p>
          </Link>
          <Link
            href="/tools/subscription-audit"
            className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
          >
            <p className="font-medium text-gray-900">구독 서비스 총액 계산기</p>
            <p className="text-sm text-gray-500">내가 쓰는 구독 서비스 총액 확인</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
