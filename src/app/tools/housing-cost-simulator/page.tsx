'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';

// ── 유틸 ──

function formatEok(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const eok = Math.floor(abs / 100000000);
  const man = Math.round((abs % 100000000) / 10000);
  if (eok > 0 && man > 0) return `${sign}${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${sign}${eok}억원`;
  if (man > 0) return `${sign}${man.toLocaleString()}만원`;
  return '0원';
}

// ── 프리셋 ──

interface Preset {
  label: string;
  desc: string;
  wolseDeposit: number; // 만원
  wolseRent: number; // 만원
  jeonseAmount: number; // 억원
  jeonseLoanRatio: number;
  jeonseLoanRate: number;
  buyPrice: number; // 억원
  ltv: number;
  buyLoanRate: number;
  buyLoanYears: number;
  holdingCost: number; // 연간 보유비용 만원 (재산세+수선)
  taxExempt: boolean; // 1주택 비과세 적용
}

const PRESETS: Preset[] = [
  {
    label: '서울 원룸',
    desc: '보증금 1천/월세 60',
    wolseDeposit: 1000,
    wolseRent: 60,
    jeonseAmount: 1.5,
    jeonseLoanRatio: 80,
    jeonseLoanRate: 3.5,
    buyPrice: 2.5,
    ltv: 60,
    buyLoanRate: 4.0,
    buyLoanYears: 30,
    holdingCost: 100,
    taxExempt: true,
  },
  {
    label: '수도권 아파트',
    desc: '보증금 3천/월세 80',
    wolseDeposit: 3000,
    wolseRent: 80,
    jeonseAmount: 3,
    jeonseLoanRatio: 70,
    jeonseLoanRate: 3.5,
    buyPrice: 5,
    ltv: 60,
    buyLoanRate: 4.0,
    buyLoanYears: 30,
    holdingCost: 200,
    taxExempt: true,
  },
  {
    label: '서울 아파트',
    desc: '보증금 5천/월세 120',
    wolseDeposit: 5000,
    wolseRent: 120,
    jeonseAmount: 6,
    jeonseLoanRatio: 60,
    jeonseLoanRate: 3.5,
    buyPrice: 9,
    ltv: 50,
    buyLoanRate: 4.0,
    buyLoanYears: 30,
    holdingCost: 350,
    taxExempt: true,
  },
];

// ── 계산 ──

const DEPOSIT_RATE = 0.03; // 기회비용 예금금리

interface YearData {
  year: number;
  wolseCumCost: number;
  wolseNetCost: number;
  jeonseCumCost: number;
  jeonseNetCost: number;
  buyCumCost: number;
  buyAssetValue: number; // 순자산 (집값 - 대출잔액)
  buySellingCost: number; // 매도비용 (중개수수료 + 양도세)
  buyNetCost: number; // 순비용 (총지출 - 순자산 + 매도비용)
}

// ── 매도비용 계산 ──

// 중개수수료 (2024 요율 기준)
function calcBrokerageFee(salePrice: number): number {
  if (salePrice < 5e7) return Math.min(salePrice * 0.006, 250000);
  if (salePrice < 2e8) return Math.min(salePrice * 0.005, 800000);
  if (salePrice < 6e8) return salePrice * 0.004;
  if (salePrice < 9e8) return salePrice * 0.005;
  return salePrice * 0.005; // 9억 이상 (상한 0.9%, 보통 0.5% 협의)
}

// 양도소득세 (누진세율)
function calcProgressiveTax(taxableGain: number): number {
  if (taxableGain <= 0) return 0;
  const brackets: [number, number][] = [
    [14000000, 0.06],
    [50000000, 0.15],
    [88000000, 0.24],
    [150000000, 0.35],
    [300000000, 0.38],
    [500000000, 0.40],
    [1000000000, 0.42],
    [Infinity, 0.45],
  ];
  let tax = 0;
  let remaining = taxableGain;
  let prevLimit = 0;
  for (const [limit, rate] of brackets) {
    const taxable = Math.min(remaining, limit - prevLimit);
    if (taxable <= 0) break;
    tax += taxable * rate;
    remaining -= taxable;
    prevLimit = limit;
  }
  return tax * 1.1; // 지방소득세 10% 포함
}

// 장기보유특별공제율 (1세대 1주택: 보유 연4% + 거주 연4%, 각 최대 40%, 합계 80%)
function calcLongTermDeduction(holdYears: number): number {
  if (holdYears < 3) return 0;
  const holdRate = Math.min(holdYears * 0.04, 0.40);
  const liveRate = Math.min(holdYears * 0.04, 0.40); // 보유=거주 가정
  return Math.min(holdRate + liveRate, 0.80);
}

// 양도소득세 계산 (1주택 비과세 반영)
function calcCapitalGainsTax(
  buyPrice: number,
  salePrice: number,
  holdYears: number,
  taxExempt: boolean
): number {
  const totalGain = salePrice - buyPrice;
  if (totalGain <= 0) return 0;

  if (taxExempt && holdYears >= 2) {
    // 1세대 1주택 비과세: 실거래가 12억 이하 전액 비과세
    if (salePrice <= 12e8) return 0;
    // 12억 초과분만 과세: 양도차익 × (매도가 - 12억) / 매도가
    const taxableRatio = (salePrice - 12e8) / salePrice;
    const taxableGain = totalGain * taxableRatio;
    // 장기보유특별공제
    const deduction = calcLongTermDeduction(holdYears);
    const afterDeduction = taxableGain * (1 - deduction);
    // 기본공제 250만원
    const finalGain = Math.max(0, afterDeduction - 2500000);
    return calcProgressiveTax(finalGain);
  }

  // 비과세 미적용: 전체 차익 과세
  const deduction = holdYears >= 3 ? Math.min(holdYears * 0.02, 0.30) : 0; // 일반 장특공제
  const afterDeduction = totalGain * (1 - deduction);
  const finalGain = Math.max(0, afterDeduction - 2500000);
  return calcProgressiveTax(finalGain);
}

// ── 취득세 계산 (1세대 1주택 기준) ──

function calcAcquisitionTax(price: number): number {
  if (price <= 6e8) {
    // 6억 이하: 취득세 1% + 지방교육세 0.1% = 1.1%
    return price * 0.011;
  } else if (price <= 9e8) {
    // 6억~9억: 비례세율 (매매가(억)×2/3 - 3)% + 지방교육세(취득세×10%)
    const priceInEok = price / 1e8;
    const taxRate = (priceInEok * 2 / 3 - 3) / 100;
    const localEduTax = taxRate * 0.1;
    return price * (taxRate + localEduTax);
  } else {
    // 9억 초과: 취득세 3% + 지방교육세 0.3% = 3.3%
    return price * 0.033;
  }
}

// 매도비용 합계 (중개수수료 + 양도소득세)
function calcSellingCosts(
  buyPrice: number,
  salePrice: number,
  holdYears: number,
  taxExempt: boolean
): number {
  return calcBrokerageFee(salePrice) + calcCapitalGainsTax(buyPrice, salePrice, holdYears, taxExempt);
}

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function calcLoanBalance(principal: number, annualRate: number, months: number, paidMonths: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal - (principal / months) * paidMonths;
  const pmt = calcMonthlyPayment(principal, annualRate, months);
  return principal * Math.pow(1 + r, paidMonths) - pmt * ((Math.pow(1 + r, paidMonths) - 1) / r);
}

function simulate(
  years: number,
  annualGrowth: number,
  wolseDeposit: number,
  wolseRent: number,
  jeonseAmount: number,
  jeonseLoanRatio: number,
  jeonseLoanRate: number,
  buyPrice: number,
  ltv: number,
  buyLoanRate: number,
  buyLoanYears: number,
  holdingCost: number,
  taxExempt: boolean
): YearData[] {
  const data: YearData[] = [];

  // ── 월세 ──
  let wolseCum = 0;

  // ── 전세 ──
  let jeonseOwnFund = jeonseAmount * (1 - jeonseLoanRatio / 100);
  let currentJeonse = jeonseAmount;
  let jeonseCum = 0;

  // ── 매매 ──
  const buyLoanAmount = buyPrice * (ltv / 100);
  const buyOwnFund = buyPrice - buyLoanAmount;
  const acquisitionTax = calcAcquisitionTax(buyPrice);
  const monthlyPmt = calcMonthlyPayment(buyLoanAmount, buyLoanRate / 100, buyLoanYears * 12);
  let buyCum = acquisitionTax;

  for (let y = 1; y <= years; y++) {
    // 월세: 매년 상승
    const yearWolse = wolseRent * 12 * Math.pow(1 + annualGrowth / 100, y - 1);
    const wolseOppCost = wolseDeposit * DEPOSIT_RATE;
    wolseCum += yearWolse + wolseOppCost;

    // 전세: 2년마다 갱신, 대출이자 + 기회비용
    if (y > 1 && (y - 1) % 2 === 0) {
      currentJeonse *= Math.pow(1 + annualGrowth / 100, 2);
      jeonseOwnFund = currentJeonse * (1 - jeonseLoanRatio / 100);
    }
    const jeonseLoanAmt = currentJeonse * (jeonseLoanRatio / 100);
    const jeonseInterest = jeonseLoanAmt * (jeonseLoanRate / 100);
    const jeonseOppCost = jeonseOwnFund * DEPOSIT_RATE;
    jeonseCum += jeonseInterest + jeonseOppCost;

    // 매매: 월상환 + 기회비용 + 보유비용
    const buyAnnualPayment = monthlyPmt * 12;
    const buyOppCost = buyOwnFund * DEPOSIT_RATE;
    buyCum += buyAnnualPayment + buyOppCost + holdingCost;

    // 매매 자산가치 (해당 연차에 매도한다고 가정)
    const currentBuyValue = buyPrice * Math.pow(1 + annualGrowth / 100, y);
    const remainLoan = Math.max(0, calcLoanBalance(buyLoanAmount, buyLoanRate / 100, buyLoanYears * 12, y * 12));
    const buyAsset = currentBuyValue - remainLoan;

    // 매도비용 (해당 시점에 팔 경우)
    const sellingCost = calcSellingCosts(buyPrice, currentBuyValue, y, taxExempt);

    data.push({
      year: y,
      wolseCumCost: wolseCum,
      wolseNetCost: wolseCum,
      jeonseCumCost: jeonseCum,
      jeonseNetCost: jeonseCum,
      buyCumCost: buyCum,
      buyAssetValue: buyAsset,
      buySellingCost: sellingCost,
      buyNetCost: buyCum - buyAsset + sellingCost,
    });
  }

  return data;
}

// ── 교차점 찾기 ──

interface CrossPoint {
  year: number;
  label: string;
}

function findCrossPoints(data: YearData[]): CrossPoint[] {
  const points: CrossPoint[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    // 매매 순비용이 전세보다 작아지는 시점
    if (prev.buyNetCost >= prev.jeonseNetCost && curr.buyNetCost < curr.jeonseNetCost) {
      points.push({ year: curr.year, label: `${curr.year}년차: 매매가 전세보다 유리` });
    }
    // 매매 순비용이 월세보다 작아지는 시점
    if (prev.buyNetCost >= prev.wolseNetCost && curr.buyNetCost < curr.wolseNetCost) {
      points.push({ year: curr.year, label: `${curr.year}년차: 매매가 월세보다 유리` });
    }
    // 전세가 월세보다 작아지는 시점
    if (prev.jeonseNetCost >= prev.wolseNetCost && curr.jeonseNetCost < curr.wolseNetCost) {
      points.push({ year: curr.year, label: `${curr.year}년차: 전세가 월세보다 유리` });
    }
  }
  return points;
}

// ── 인사이트 생성 ──

function generateInsights(data: YearData[], years: number): string[] {
  if (data.length === 0) return [];
  const last = data[data.length - 1];
  const insights: string[] = [];

  // 최종 순비용 비교
  const costs = [
    { name: '월세', cost: last.wolseNetCost },
    { name: '전세', cost: last.jeonseNetCost },
    { name: '매매', cost: last.buyNetCost },
  ].sort((a, b) => a.cost - b.cost);

  const bestCostStr = costs[0].cost < 0
    ? `순이익 +${formatEok(Math.abs(costs[0].cost))}`
    : `순비용 ${formatEok(costs[0].cost)}`;
  insights.push(
    `${years}년 기준, ${costs[0].name}가 가장 유리합니다 (${bestCostStr})`
  );

  // 월세 vs 전세 차이
  const wolseVsJeonse = last.wolseNetCost - last.jeonseNetCost;
  if (wolseVsJeonse > 0) {
    insights.push(
      `전세가 월세보다 ${years}년간 총 ${formatEok(Math.abs(wolseVsJeonse))} 절약됩니다`
    );
  } else {
    insights.push(
      `월세가 전세보다 ${years}년간 총 ${formatEok(Math.abs(wolseVsJeonse))} 절약됩니다`
    );
  }

  // 매매 자산 형성
  if (last.buyAssetValue > 0) {
    insights.push(
      `매매 시 ${years}년 후 예상 순자산은 ${formatEok(last.buyAssetValue)}입니다`
    );
  }

  // 교차점
  const crosses = findCrossPoints(data);
  for (const cp of crosses) {
    insights.push(cp.label);
  }

  return insights;
}

// ── 커스텀 툴팁 ──

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <span className="font-medium">{formatEok(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

// ── 입력 컴포넌트 ──

function NumberInput({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: number;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──

export default function HousingCostSimulator() {
  // 공통
  const [years, setYears] = useState(10);
  const [growthRate, setGrowthRate] = useState(3);

  // 월세 (만원 단위 입력)
  const [wolseDeposit, setWolseDeposit] = useState(3000);
  const [wolseRent, setWolseRent] = useState(80);

  // 전세 (억원 단위 입력)
  const [jeonseAmount, setJeonseAmount] = useState(3);
  const [jeonseLoanRatio, setJeonseLoanRatio] = useState(70);
  const [jeonseLoanRate, setJeonseLoanRate] = useState(3.5);

  // 매매 (억원 단위 입력)
  const [buyPrice, setBuyPrice] = useState(5);
  const [ltv, setLtv] = useState(60);
  const [buyLoanRate, setBuyLoanRate] = useState(4.0);
  const [buyLoanYears, setBuyLoanYears] = useState(30);
  const [holdingCost, setHoldingCost] = useState(200); // 연간 보유비용 만원
  const [taxExempt, setTaxExempt] = useState(true); // 1주택 비과세

  // 상세 테이블 토글
  const [showTable, setShowTable] = useState(false);

  function applyPreset(p: Preset) {
    setWolseDeposit(p.wolseDeposit);
    setWolseRent(p.wolseRent);
    setJeonseAmount(p.jeonseAmount);
    setJeonseLoanRatio(p.jeonseLoanRatio);
    setJeonseLoanRate(p.jeonseLoanRate);
    setBuyPrice(p.buyPrice);
    setLtv(p.ltv);
    setBuyLoanRate(p.buyLoanRate);
    setBuyLoanYears(p.buyLoanYears);
    setHoldingCost(p.holdingCost);
    setTaxExempt(p.taxExempt);
  }

  // 시뮬레이션
  const data = useMemo(
    () =>
      simulate(
        years,
        growthRate,
        wolseDeposit * 10000,
        wolseRent * 10000,
        jeonseAmount * 100000000,
        jeonseLoanRatio,
        jeonseLoanRate,
        buyPrice * 100000000,
        ltv,
        buyLoanRate,
        buyLoanYears,
        holdingCost * 10000,
        taxExempt
      ),
    [years, growthRate, wolseDeposit, wolseRent, jeonseAmount, jeonseLoanRatio, jeonseLoanRate, buyPrice, ltv, buyLoanRate, buyLoanYears, holdingCost, taxExempt]
  );

  const lastData = data.length > 0 ? data[data.length - 1] : null;
  const insights = useMemo(() => generateInsights(data, years), [data, years]);
  const crossPoints = useMemo(() => findCrossPoints(data), [data]);

  // 가장 유리한 옵션
  const bestOption = useMemo(() => {
    if (!lastData) return '';
    const costs = [
      { name: '월세', cost: lastData.wolseNetCost },
      { name: '전세', cost: lastData.jeonseNetCost },
      { name: '매매', cost: lastData.buyNetCost },
    ];
    return costs.sort((a, b) => a.cost - b.cost)[0].name;
  }, [lastData]);

  // 차트 데이터
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        year: `${d.year}년`,
        yearNum: d.year,
        월세: Math.round(d.wolseNetCost),
        전세: Math.round(d.jeonseNetCost),
        매매: Math.round(d.buyNetCost),
      })),
    [data]
  );

  // 바 차트 데이터
  const barData = useMemo(() => {
    if (!lastData) return [];
    return [
      {
        name: '월세',
        총지출: Math.round(lastData.wolseCumCost),
        자산형성: 0,
      },
      {
        name: '전세',
        총지출: Math.round(lastData.jeonseCumCost),
        자산형성: 0,
      },
      {
        name: '매매',
        총지출: Math.round(lastData.buyCumCost),
        자산형성: Math.round(Math.max(0, lastData.buyAssetValue)),
      },
    ];
  }, [lastData]);

  // Y축 포맷
  const yAxisFormatter = (value: number) => {
    const eok = value / 100000000;
    if (Math.abs(eok) >= 1) return `${eok.toFixed(0)}억`;
    const man = value / 10000;
    return `${Math.round(man)}만`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ToolJsonLd
        name="전세 vs 월세 vs 매매 비교 시뮬레이터"
        description="장기 주거비용을 라인 차트로 비교합니다. 전세, 월세, 매매 중 가장 유리한 선택을 시뮬레이션해보세요."
        url="/tools/housing-cost-simulator"
      />

      {/* 브레드크럼 + 뒤로가기 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/tools" className="hover:text-blue-600 transition-colors">
          도구 목록
        </Link>
        <span>/</span>
        <span className="text-gray-900">전세 vs 월세 vs 매매 비교</span>
      </div>

      {/* 제목 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          전세 vs 월세 vs 매매 비교 시뮬레이터
        </h1>
        <p className="mt-2 text-gray-600">
          장기 주거비용을 한눈에 비교해보세요. 기간에 따라 어떤 선택이 유리한지 시각적으로 확인할 수 있습니다.
        </p>
      </div>

      {/* ── 입력 섹션 ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* 프리셋 */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">빠른 설정</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors"
              >
                <span className="block">{p.label}</span>
                <span className="block text-xs text-gray-400">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 비교 기간 슬라이더 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">비교 기간</label>
            <span className="text-lg font-bold text-blue-600">{years}년</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1년</span>
            <span>10년</span>
            <span>20년</span>
            <span>30년</span>
          </div>
        </div>

        {/* 3컬럼 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 월세 */}
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
            <h3 className="font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              월세
            </h3>
            <NumberInput label="보증금" value={wolseDeposit} onChange={setWolseDeposit} unit="만원" step={100} />
            <NumberInput label="월세" value={wolseRent} onChange={setWolseRent} unit="만원" step={5} />
          </div>

          {/* 전세 */}
          <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/30 space-y-3">
            <h3 className="font-semibold text-purple-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              전세
            </h3>
            <NumberInput label="전세금" value={jeonseAmount} onChange={setJeonseAmount} unit="억원" step={0.5} />
            <NumberInput label="대출 비율" value={jeonseLoanRatio} onChange={setJeonseLoanRatio} unit="%" step={5} />
            <NumberInput label="대출 금리" value={jeonseLoanRate} onChange={setJeonseLoanRate} unit="%" step={0.1} />
          </div>

          {/* 매매 */}
          <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/30 space-y-3">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              매매
            </h3>
            <NumberInput label="매매가" value={buyPrice} onChange={setBuyPrice} unit="억원" step={0.5} />
            <NumberInput label="LTV (대출비율)" value={ltv} onChange={setLtv} unit="%" step={5} />
            <NumberInput label="대출 금리" value={buyLoanRate} onChange={setBuyLoanRate} unit="%" step={0.1} />
            <NumberInput label="대출 기간" value={buyLoanYears} onChange={setBuyLoanYears} unit="년" step={5} min={5} />
            <NumberInput label="보유비용 (재산세+수선)" value={holdingCost} onChange={setHoldingCost} unit="만/년" step={10} />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxExempt}
                  onChange={(e) => setTaxExempt(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                1주택 비과세 적용
              </label>
              <p className="text-xs text-gray-400 mt-1">2년 보유+거주, 12억 이하 비과세</p>
            </div>
          </div>
        </div>

        {/* 상승률 */}
        <div className="max-w-xs">
          <NumberInput label="연간 상승률 (전세/월세/매매 공통)" value={growthRate} onChange={setGrowthRate} unit="%" step={0.5} />
        </div>
      </div>

      {/* ── 핵심 결과 카드 ── */}
      {lastData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 월세 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '월세' ? 'ring-4 ring-blue-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            {bestOption === '월세' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-blue-100 text-sm">월세 {years}년 순비용</p>
            <p className="text-2xl font-bold mt-1">{formatEok(lastData.wolseNetCost)}</p>
            <p className="text-blue-200 text-xs mt-2">총 지출 = 순비용 (자산 없음)</p>
          </div>

          {/* 전세 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '전세' ? 'ring-4 ring-purple-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
            {bestOption === '전세' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-purple-100 text-sm">전세 {years}년 순비용</p>
            <p className="text-2xl font-bold mt-1">{formatEok(lastData.jeonseNetCost)}</p>
            <p className="text-purple-200 text-xs mt-2">대출이자 + 기회비용</p>
          </div>

          {/* 매매 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '매매' ? 'ring-4 ring-green-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}>
            {bestOption === '매매' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-green-100 text-sm">
              매매 {years}년 {lastData.buyNetCost < 0 ? '순이익' : '순비용'}
            </p>
            <p className="text-2xl font-bold mt-1">
              {lastData.buyNetCost < 0 ? '+' : ''}{formatEok(Math.abs(lastData.buyNetCost))}
            </p>
            <p className="text-green-200 text-xs mt-2">
              지출 {formatEok(lastData.buyCumCost)} + 매도비용 {formatEok(lastData.buySellingCost)}
            </p>
            <p className="text-green-200 text-xs">
              - 순자산 {formatEok(lastData.buyAssetValue)}
            </p>
          </div>
        </div>
      )}

      {/* ── 라인 차트 (핵심) ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">누적 순비용 추이</h2>
        <p className="text-sm text-gray-500 mb-4">선이 교차하는 시점에서 유불리가 바뀝니다</p>
        <div className="h-[350px] md:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="월세"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="전세"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="매매"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              {/* 교차점 표시 */}
              {crossPoints.map((cp, i) => (
                <ReferenceLine
                  key={i}
                  x={`${cp.year}년`}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                >
                  <Label
                    value={cp.label}
                    position="top"
                    fill="#92400e"
                    fontSize={11}
                  />
                </ReferenceLine>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 총비용 구성 바 차트 ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{years}년 총비용 구성</h2>
        <p className="text-sm text-gray-500 mb-4">총 지출 금액과 자산 형성 비교</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} width={40} />
              <Tooltip
                formatter={(value?: number, name?: string) => [formatEok(value ?? 0), name ?? '']}
              />
              <Legend />
              <Bar dataKey="총지출" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} />
              <Bar dataKey="자산형성" stackId="b" fill="#34d399" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 분석 인사이트 ── */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">분석 인사이트</h2>
          <ul className="space-y-2">
            {insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-800">
                <span className="text-amber-500 mt-0.5 shrink-0">&#9654;</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 연도별 상세 테이블 ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900">연도별 상세 비교</span>
          <span className="text-gray-400 text-xl">{showTable ? '−' : '+'}</span>
        </button>
        {showTable && (
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">연차</th>
                  <th className="px-3 py-2 text-right text-blue-600 font-medium">월세 누적</th>
                  <th className="px-3 py-2 text-right text-purple-600 font-medium">전세 누적</th>
                  <th className="px-3 py-2 text-right text-green-600 font-medium">매매 총지출</th>
                  <th className="px-3 py-2 text-right text-orange-600 font-medium">매도비용</th>
                  <th className="px-3 py-2 text-right text-green-600 font-medium">매매 자산</th>
                  <th className="px-3 py-2 text-right text-green-700 font-medium">매매 순비용</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.year} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{d.year}년</td>
                    <td className="px-3 py-2 text-right text-blue-700">{formatEok(d.wolseNetCost)}</td>
                    <td className="px-3 py-2 text-right text-purple-700">{formatEok(d.jeonseNetCost)}</td>
                    <td className="px-3 py-2 text-right text-green-600">{formatEok(d.buyCumCost)}</td>
                    <td className="px-3 py-2 text-right text-orange-600">{formatEok(d.buySellingCost)}</td>
                    <td className="px-3 py-2 text-right text-green-600">{formatEok(d.buyAssetValue)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${d.buyNetCost < 0 ? 'text-emerald-600' : 'text-green-700'}`}>
                      {d.buyNetCost < 0 ? '+' : ''}{formatEok(Math.abs(d.buyNetCost))}{d.buyNetCost < 0 ? ' (이익)' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 가정 및 참고 ── */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">가정 및 참고사항</h3>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li>* 보증금/자기자금의 기회비용은 연 3% 예금금리로 계산합니다.</li>
          <li>* 전세는 2년마다 갱신하며, 갱신 시 상승률이 반영됩니다.</li>
          <li>* 매매 취득세는 1주택 기준 구간별 적용: 6억 이하 1.1%, 6~9억 비례세율(1.1~3.3%), 9억 초과 3.3%.</li>
          <li>* 매매 대출은 원리금균등상환 방식입니다.</li>
          <li>* 보유비용(재산세+수선충당금)은 연간 고정 금액으로 반영됩니다.</li>
          <li>* 매도비용에는 중개수수료(요율표 기준)와 양도소득세가 포함됩니다.</li>
          <li>* 1주택 비과세: 2년 보유+거주 시 12억 이하 비과세, 초과분은 장기보유특별공제(보유+거주 연4%, 최대 80%) 적용 후 과세합니다.</li>
          <li>* 실제 시장 상황과 개인 조건에 따라 결과가 달라질 수 있습니다.</li>
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
                name: '전세, 월세, 매매 중 어떤 게 가장 유리한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '단기(1~5년) 거주 시 전세나 월세가 유리하고, 장기(10년 이상) 거주 시 매매가 유리한 경우가 많습니다. 집값 상승률이 대출금리보다 높으면 매매가 유리하고, 반대라면 전세가 유리합니다. 개인 상황에 따라 다르므로 시뮬레이션으로 비교해보세요.',
                },
              },
              {
                '@type': 'Question',
                name: '1주택 비과세 조건은 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '1세대 1주택으로 2년 이상 보유(조정대상지역은 2년 거주 포함) 시 매도가 12억원 이하면 양도소득세가 전액 비과세됩니다. 12억 초과분은 장기보유특별공제(보유+거주 연 4%, 최대 80%)를 적용한 후 과세합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '취득세는 얼마나 내야 하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '1주택 기준 6억 이하 1.1%, 6~9억 구간 비례세율(1.1~3.3%), 9억 초과 3.3%입니다. 예를 들어 5억 아파트는 약 550만원, 9억 초과 아파트는 매매가의 3.3%를 취득세로 납부합니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">주거비용 비교 시뮬레이터 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">사회초년생 - 서울 원룸 (월세 vs 전세)</p>
            <p className="text-sm text-gray-600">
              보증금 1,000만원/월세 60만원 vs 전세 1.5억(대출 80%, 금리 3.5%).
              전세 대출이자 연 420만원 + 기회비용 vs 월세 연 720만원. 2년 이상이면 전세가 유리합니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">신혼부부 - 수도권 아파트 (전세 vs 매매)</p>
            <p className="text-sm text-gray-600">
              전세 3억 vs 매매 5억(LTV 60%, 금리 4%). 연 3% 상승 가정 시 약 7~8년차부터
              매매가 전세보다 유리해집니다. 집값 상승분이 대출 이자를 상쇄하기 때문입니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">장기 거주 - 서울 아파트 매매 20년</p>
            <p className="text-sm text-gray-600">
              매매 9억, 연 3% 상승 시 20년 후 집값 약 16.3억. 1주택 비과세(12억 이하)와
              장기보유특별공제 적용으로 양도세 부담이 크게 줄어 매매가 압도적으로 유리합니다.
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
              전세, 월세, 매매 중 어떤 게 가장 유리한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              단기(1~5년) 거주 시 전세나 월세가 유리하고, 장기(10년 이상) 거주 시 매매가 유리한 경우가 많습니다.
              핵심은 집값 상승률과 대출금리의 차이입니다. 상승률이 금리보다 높으면 매매가, 낮으면 전세가 유리합니다.
              개인의 자금 상황, 거주 기간, 지역 시세 등을 종합적으로 고려해야 합니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              1주택 비과세 조건은 무엇인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              1세대 1주택으로 2년 이상 보유(조정대상지역은 2년 거주 포함) 시 매도가 12억원 이하면
              양도소득세가 전액 비과세됩니다. 12억 초과분은 장기보유특별공제(보유+거주 각 연 4%, 최대 80%)를
              적용한 후 기본공제 250만원을 빼고 과세합니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              취득세는 얼마나 내야 하나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              1주택 기준 6억 이하 1.1%, 6~9억 구간 비례세율(1.1~3.3%), 9억 초과 3.3%입니다.
              예를 들어 5억 아파트는 약 550만원, 10억 아파트는 약 3,300만원의 취득세가 발생합니다.
              다주택자는 중과세율(8~12%)이 적용될 수 있으니 주의하세요.
            </div>
          </details>
        </div>
      </div>

      {/* ── 관련 도구 ── */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link
            href="/tools/rent-conversion-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">전월세 전환율 계산기</span>
            <p className="text-sm text-gray-500 mt-1">전세/월세 전환율과 적정 월세 계산</p>
          </Link>
          <Link
            href="/tools/loan-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">대출 이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">원리금균등, 원금균등, 만기일시 상환금 계산</p>
          </Link>
          <Link
            href="/tools/income-tax-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">종합소득세 계산기</span>
            <p className="text-sm text-gray-500 mt-1">종합소득세 예상 세액 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
