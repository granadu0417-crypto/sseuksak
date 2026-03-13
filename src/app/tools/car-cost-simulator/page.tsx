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

function formatMan(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const eok = Math.floor(abs / 10000);
  const man = Math.round(abs % 10000);
  if (eok > 0 && man > 0) return `${sign}${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${sign}${eok}억원`;
  if (man > 0) return `${sign}${man.toLocaleString()}만원`;
  return '0원';
}

// ── 프리셋 ──

interface Preset {
  label: string;
  desc: string;
  carPrice: number;    // 만원
  loanRatio: number;   // %
  loanRate: number;     // %
  loanYears: number;
  regTaxRate: number;   // %
  insurance: number;    // 만원/년
  carTax: number;       // 만원/년
  maintenance: number;  // 만원/년
  depRate: number;      // %/년
  leaseDeposit: number; // 만원
  leaseMonthly: number; // 만원
  leaseInsurance: number; // 만원/년
  leaseMaint: number;   // 만원/년
  rentDeposit: number;  // 만원
  rentMonthly: number;  // 만원
  fuelMonthly: number;  // 만원
}

const PRESETS: Preset[] = [
  {
    label: '경형차',
    desc: '모닝/스파크',
    carPrice: 1500,
    loanRatio: 70,
    loanRate: 5.5,
    loanYears: 5,
    regTaxRate: 7,
    insurance: 40,
    carTax: 10,
    maintenance: 30,
    depRate: 15,
    leaseDeposit: 200,
    leaseMonthly: 22,
    leaseInsurance: 40,
    leaseMaint: 30,
    rentDeposit: 200,
    rentMonthly: 35,
    fuelMonthly: 10,
  },
  {
    label: '준중형',
    desc: '아반떼/K3',
    carPrice: 2500,
    loanRatio: 70,
    loanRate: 5.5,
    loanYears: 5,
    regTaxRate: 7,
    insurance: 65,
    carTax: 25,
    maintenance: 40,
    depRate: 15,
    leaseDeposit: 300,
    leaseMonthly: 38,
    leaseInsurance: 65,
    leaseMaint: 40,
    rentDeposit: 300,
    rentMonthly: 52,
    fuelMonthly: 15,
  },
  {
    label: '중형 SUV',
    desc: '투싼/스포티지',
    carPrice: 3800,
    loanRatio: 70,
    loanRate: 5.5,
    loanYears: 5,
    regTaxRate: 7,
    insurance: 85,
    carTax: 35,
    maintenance: 50,
    depRate: 15,
    leaseDeposit: 500,
    leaseMonthly: 55,
    leaseInsurance: 85,
    leaseMaint: 50,
    rentDeposit: 500,
    rentMonthly: 72,
    fuelMonthly: 18,
  },
];

// ── 계산 ──

const OPP_RATE = 0.03; // 기회비용 연 3%

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

interface YearData {
  year: number;
  buyCum: number;
  buyResidual: number;
  buyNet: number;
  leaseCum: number;
  leaseNet: number;
  rentCum: number;
  rentNet: number;
}

function simulate(
  years: number,
  carPrice: number,
  loanRatio: number,
  loanRate: number,
  loanYears: number,
  regTaxRate: number,
  insurance: number,
  carTax: number,
  maintenance: number,
  depRate: number,
  leaseDeposit: number,
  leaseMonthly: number,
  leaseInsurance: number,
  leaseMaint: number,
  rentDeposit: number,
  rentMonthly: number,
  fuelMonthly: number,
): YearData[] {
  const data: YearData[] = [];

  // ── 구매 ──
  const loanAmount = carPrice * (loanRatio / 100);
  const ownFund = carPrice - loanAmount;
  const regTax = carPrice * (regTaxRate / 100);
  const loanMonths = loanYears * 12;
  const monthlyPmt = calcMonthlyPayment(loanAmount, loanRate / 100, loanMonths);

  let buyCum = regTax; // 취등록세 초기

  // ── 리스 ──
  let leaseCum = 0;

  // ── 장기렌트 ──
  let rentCum = 0;

  for (let y = 1; y <= years; y++) {
    // 구매: 대출상환(대출기간까지만) + 보험 + 자동차세 + 정비 + 유류 + 기회비용
    const buyLoanPayYear = y <= loanYears ? monthlyPmt * 12 : 0;
    const buyOppCost = ownFund * OPP_RATE;
    buyCum += buyLoanPayYear + insurance + carTax + maintenance + fuelMonthly * 12 + buyOppCost;

    // 잔존가치
    const residual = carPrice * Math.pow(1 - depRate / 100, y);

    // 순비용 = 총지출 - 잔존가치
    const buyNet = buyCum - residual;

    // 리스: 리스료 + 보험 + 정비 + 유류 + 보증금 기회비용
    const leaseOppCost = leaseDeposit * OPP_RATE;
    leaseCum += leaseMonthly * 12 + leaseInsurance + leaseMaint + fuelMonthly * 12 + leaseOppCost;
    const leaseNet = leaseCum;

    // 장기렌트: 렌트료 + 유류 + 보증금 기회비용
    const rentOppCost = rentDeposit * OPP_RATE;
    rentCum += rentMonthly * 12 + fuelMonthly * 12 + rentOppCost;
    const rentNet = rentCum;

    data.push({
      year: y,
      buyCum,
      buyResidual: residual,
      buyNet,
      leaseCum,
      leaseNet,
      rentCum,
      rentNet,
    });
  }

  return data;
}

// ── 교차점 ──

interface CrossPoint {
  year: number;
  label: string;
}

function findCrossPoints(data: YearData[]): CrossPoint[] {
  const points: CrossPoint[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    if (prev.buyNet >= prev.leaseNet && curr.buyNet < curr.leaseNet) {
      points.push({ year: curr.year, label: `${curr.year}년차: 구매가 리스보다 유리` });
    }
    if (prev.buyNet >= prev.rentNet && curr.buyNet < curr.rentNet) {
      points.push({ year: curr.year, label: `${curr.year}년차: 구매가 렌트보다 유리` });
    }
    if (prev.leaseNet >= prev.rentNet && curr.leaseNet < curr.rentNet) {
      points.push({ year: curr.year, label: `${curr.year}년차: 리스가 렌트보다 유리` });
    }
  }
  return points;
}

// ── 인사이트 ──

function generateInsights(data: YearData[], years: number): string[] {
  if (data.length === 0) return [];
  const last = data[data.length - 1];
  const insights: string[] = [];

  const costs = [
    { name: '구매', cost: last.buyNet },
    { name: '리스', cost: last.leaseNet },
    { name: '장기렌트', cost: last.rentNet },
  ].sort((a, b) => a.cost - b.cost);

  insights.push(
    `${years}년 기준 ${costs[0].name}가 가장 유리합니다 (순비용 ${formatMan(costs[0].cost)})`
  );

  const diff = Math.abs(costs[0].cost - costs[2].cost);
  insights.push(
    `${costs[0].name}와 ${costs[2].name}의 차이는 ${formatMan(diff)}입니다`
  );

  insights.push(
    `구매 시 ${years}년 후 예상 잔존가치는 ${formatMan(last.buyResidual)}입니다`
  );

  // 월 평균
  const buyMonthly = Math.round(last.buyNet / (years * 12));
  const leaseMonthly = Math.round(last.leaseNet / (years * 12));
  const rentMonthly = Math.round(last.rentNet / (years * 12));
  insights.push(
    `월 평균 비용: 구매 ${buyMonthly.toLocaleString()}만원, 리스 ${leaseMonthly.toLocaleString()}만원, 렌트 ${rentMonthly.toLocaleString()}만원`
  );

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
          <span className="font-medium">{formatMan(entry.value)}</span>
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

// ── 메인 ──

export default function CarCostSimulator() {
  const [years, setYears] = useState(5);

  // 구매
  const [carPrice, setCarPrice] = useState(2500);
  const [loanRatio, setLoanRatio] = useState(70);
  const [loanRate, setLoanRate] = useState(5.5);
  const [loanYears, setLoanYears] = useState(5);
  const [regTaxRate, setRegTaxRate] = useState(7);
  const [insurance, setInsurance] = useState(65);
  const [carTax, setCarTax] = useState(25);
  const [maintenance, setMaintenance] = useState(40);
  const [depRate, setDepRate] = useState(15);

  // 리스
  const [leaseDeposit, setLeaseDeposit] = useState(300);
  const [leaseMonthly, setLeaseMonthly] = useState(38);
  const [leaseInsurance, setLeaseInsurance] = useState(65);
  const [leaseMaint, setLeaseMaint] = useState(40);

  // 장기렌트
  const [rentDeposit, setRentDeposit] = useState(300);
  const [rentMonthly, setRentMonthly] = useState(52);

  // 공통
  const [fuelMonthly, setFuelMonthly] = useState(15);

  const [showTable, setShowTable] = useState(false);

  function applyPreset(p: Preset) {
    setCarPrice(p.carPrice);
    setLoanRatio(p.loanRatio);
    setLoanRate(p.loanRate);
    setLoanYears(p.loanYears);
    setRegTaxRate(p.regTaxRate);
    setInsurance(p.insurance);
    setCarTax(p.carTax);
    setMaintenance(p.maintenance);
    setDepRate(p.depRate);
    setLeaseDeposit(p.leaseDeposit);
    setLeaseMonthly(p.leaseMonthly);
    setLeaseInsurance(p.leaseInsurance);
    setLeaseMaint(p.leaseMaint);
    setRentDeposit(p.rentDeposit);
    setRentMonthly(p.rentMonthly);
    setFuelMonthly(p.fuelMonthly);
  }

  const data = useMemo(
    () => simulate(
      years, carPrice, loanRatio, loanRate, loanYears,
      regTaxRate, insurance, carTax, maintenance, depRate,
      leaseDeposit, leaseMonthly, leaseInsurance, leaseMaint,
      rentDeposit, rentMonthly, fuelMonthly,
    ),
    [years, carPrice, loanRatio, loanRate, loanYears, regTaxRate, insurance, carTax, maintenance, depRate, leaseDeposit, leaseMonthly, leaseInsurance, leaseMaint, rentDeposit, rentMonthly, fuelMonthly]
  );

  const lastData = data.length > 0 ? data[data.length - 1] : null;
  const insights = useMemo(() => generateInsights(data, years), [data, years]);
  const crossPoints = useMemo(() => findCrossPoints(data), [data]);

  const bestOption = useMemo(() => {
    if (!lastData) return '';
    const costs = [
      { name: '구매', cost: lastData.buyNet },
      { name: '리스', cost: lastData.leaseNet },
      { name: '장기렌트', cost: lastData.rentNet },
    ];
    return costs.sort((a, b) => a.cost - b.cost)[0].name;
  }, [lastData]);

  const chartData = useMemo(
    () => data.map((d) => ({
      year: `${d.year}년`,
      구매: Math.round(d.buyNet),
      리스: Math.round(d.leaseNet),
      장기렌트: Math.round(d.rentNet),
    })),
    [data]
  );

  const barData = useMemo(() => {
    if (!lastData) return [];
    return [
      {
        name: '구매',
        초기비용: Math.round(carPrice * (regTaxRate / 100)),
        월납입합계: Math.round(lastData.buyCum - carPrice * (regTaxRate / 100) - lastData.buyResidual),
        잔존가치: Math.round(lastData.buyResidual),
      },
      {
        name: '리스',
        초기비용: 0,
        월납입합계: Math.round(lastData.leaseCum),
        잔존가치: 0,
      },
      {
        name: '장기렌트',
        초기비용: 0,
        월납입합계: Math.round(lastData.rentCum),
        잔존가치: 0,
      },
    ];
  }, [lastData, carPrice, regTaxRate]);

  const yAxisFormatter = (value: number) => {
    if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(0)}억`;
    return `${Math.round(value)}만`;
  };

  const loanYearOptions = [3, 4, 5, 6, 7];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ToolJsonLd
        name="자동차 구매 vs 리스 vs 장기렌트 비교 시뮬레이터"
        description="자동차 구매, 리스, 장기렌트 3가지 방식의 장기 비용을 차트로 비교합니다. 어떤 방식이 가장 유리한지 시뮬레이션해보세요."
        url="/tools/car-cost-simulator"
      />

      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/tools" className="hover:text-blue-600 transition-colors">
          도구 목록
        </Link>
        <span>/</span>
        <span className="text-gray-900">자동차 구매 vs 리스 vs 장기렌트 비교</span>
      </div>

      {/* 제목 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          자동차 구매 vs 리스 vs 장기렌트 비교 시뮬레이터
        </h1>
        <p className="mt-2 text-gray-600">
          자동차를 구매, 리스, 장기렌트 중 어떤 방식으로 이용하는 게 유리한지 장기 비용을 비교해보세요.
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
            min={3}
            max={10}
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3년</span>
            <span>5년</span>
            <span>7년</span>
            <span>10년</span>
          </div>
        </div>

        {/* 3컬럼 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 구매 */}
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
            <h3 className="font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              구매
            </h3>
            <NumberInput label="차량가격" value={carPrice} onChange={setCarPrice} unit="만원" step={100} />
            <NumberInput label="대출비율" value={loanRatio} onChange={setLoanRatio} unit="%" step={5} />
            <NumberInput label="대출금리" value={loanRate} onChange={setLoanRate} unit="%" step={0.1} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대출기간</label>
              <div className="flex gap-1">
                {loanYearOptions.map((y) => (
                  <button
                    key={y}
                    onClick={() => setLoanYears(y)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      loanYears === y
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {y}년
                  </button>
                ))}
              </div>
            </div>
            <NumberInput label="취등록세율" value={regTaxRate} onChange={setRegTaxRate} unit="%" step={0.5} />
            <NumberInput label="보험료" value={insurance} onChange={setInsurance} unit="만/년" step={5} />
            <NumberInput label="자동차세" value={carTax} onChange={setCarTax} unit="만/년" step={5} />
            <NumberInput label="정비비" value={maintenance} onChange={setMaintenance} unit="만/년" step={5} />
            <NumberInput label="감가율" value={depRate} onChange={setDepRate} unit="%/년" step={1} />
          </div>

          {/* 리스 */}
          <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/30 space-y-3">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              리스
            </h3>
            <NumberInput label="보증금" value={leaseDeposit} onChange={setLeaseDeposit} unit="만원" step={50} />
            <NumberInput label="월 리스료" value={leaseMonthly} onChange={setLeaseMonthly} unit="만원" step={1} />
            <NumberInput label="보험료" value={leaseInsurance} onChange={setLeaseInsurance} unit="만/년" step={5} />
            <NumberInput label="정비비" value={leaseMaint} onChange={setLeaseMaint} unit="만/년" step={5} />
          </div>

          {/* 장기렌트 */}
          <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50/30 space-y-3">
            <h3 className="font-semibold text-amber-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              장기렌트
            </h3>
            <NumberInput label="보증금" value={rentDeposit} onChange={setRentDeposit} unit="만원" step={50} />
            <NumberInput label="월 렌트료" value={rentMonthly} onChange={setRentMonthly} unit="만원" step={1} />
            <p className="text-xs text-gray-400">* 보험/정비/세금 포함</p>
          </div>
        </div>

        {/* 월 유류비 */}
        <div className="max-w-xs">
          <NumberInput label="월 유류비 (공통)" value={fuelMonthly} onChange={setFuelMonthly} unit="만원" step={1} />
        </div>
      </div>

      {/* ── 결과 카드 ── */}
      {lastData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 구매 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '구매' ? 'ring-4 ring-blue-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            {bestOption === '구매' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-blue-100 text-sm">구매 {years}년 순비용</p>
            <p className="text-2xl font-bold mt-1">{formatMan(lastData.buyNet)}</p>
            <p className="text-blue-200 text-xs mt-2">
              지출 {formatMan(lastData.buyCum)} - 잔존가치 {formatMan(lastData.buyResidual)}
            </p>
          </div>

          {/* 리스 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '리스' ? 'ring-4 ring-green-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}>
            {bestOption === '리스' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-green-100 text-sm">리스 {years}년 순비용</p>
            <p className="text-2xl font-bold mt-1">{formatMan(lastData.leaseNet)}</p>
            <p className="text-green-200 text-xs mt-2">
              보증금 기회비용 + 총납입 {formatMan(lastData.leaseCum)}
            </p>
          </div>

          {/* 장기렌트 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '장기렌트' ? 'ring-4 ring-amber-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {bestOption === '장기렌트' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-amber-100 text-sm">장기렌트 {years}년 순비용</p>
            <p className="text-2xl font-bold mt-1">{formatMan(lastData.rentNet)}</p>
            <p className="text-amber-200 text-xs mt-2">
              보증금 기회비용 + 총납입 {formatMan(lastData.rentCum)}
            </p>
          </div>
        </div>
      )}

      {/* ── 라인 차트 ── */}
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
              <Line type="monotone" dataKey="구매" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="리스" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="장기렌트" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              {crossPoints.map((cp, i) => (
                <ReferenceLine
                  key={i}
                  x={`${cp.year}년`}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                >
                  <Label value={cp.label} position="top" fill="#991b1b" fontSize={11} />
                </ReferenceLine>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 총비용 구성 바 차트 ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{years}년 총비용 구성</h2>
        <p className="text-sm text-gray-500 mb-4">초기비용, 총납입, 잔존가치 비교</p>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} width={60} />
              <Tooltip formatter={(value?: number, name?: string) => [formatMan(value ?? 0), name ?? '']} />
              <Legend />
              <Bar dataKey="초기비용" fill="#f87171" radius={[0, 0, 0, 0]} />
              <Bar dataKey="월납입합계" fill="#60a5fa" radius={[0, 0, 0, 0]} />
              <Bar dataKey="잔존가치" fill="#34d399" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 인사이트 ── */}
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
                  <th className="px-3 py-2 text-right text-blue-600 font-medium">구매 총지출</th>
                  <th className="px-3 py-2 text-right text-blue-600 font-medium">잔존가치</th>
                  <th className="px-3 py-2 text-right text-blue-700 font-medium">구매 순비용</th>
                  <th className="px-3 py-2 text-right text-green-600 font-medium">리스 순비용</th>
                  <th className="px-3 py-2 text-right text-amber-600 font-medium">렌트 순비용</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.year} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{d.year}년</td>
                    <td className="px-3 py-2 text-right text-blue-600">{formatMan(d.buyCum)}</td>
                    <td className="px-3 py-2 text-right text-blue-600">{formatMan(d.buyResidual)}</td>
                    <td className="px-3 py-2 text-right text-blue-700 font-medium">{formatMan(d.buyNet)}</td>
                    <td className="px-3 py-2 text-right text-green-600 font-medium">{formatMan(d.leaseNet)}</td>
                    <td className="px-3 py-2 text-right text-amber-600 font-medium">{formatMan(d.rentNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 가정사항 ── */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">가정 및 참고사항</h3>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li>* 구매 시 자기자금(차량가-대출금)의 기회비용은 연 3% 예금금리로 계산합니다.</li>
          <li>* 리스/렌트 보증금의 기회비용도 연 3%로 계산합니다.</li>
          <li>* 구매 대출은 원리금균등상환 방식이며, 대출기간 종료 후 상환금은 없습니다.</li>
          <li>* 잔존가치 = 차량가격 x (1 - 감가율)^년수 (정률법 적용).</li>
          <li>* 취등록세는 차량가격의 약 7% (비영업용 승용차 기준: 취득세 7%).</li>
          <li>* 장기렌트 월납입금에는 보험료, 자동차세, 정비비가 포함되어 있습니다.</li>
          <li>* 리스는 운용리스 기준이며, 만기 시 반납을 가정합니다.</li>
          <li>* 실제 조건(신용등급, 차종, 계약조건)에 따라 달라질 수 있습니다.</li>
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
                name: '자동차 구매, 리스, 장기렌트 중 어떤 게 가장 유리한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '3년 이하 단기 이용 시 장기렌트나 리스가 유리하고, 5년 이상 장기 보유 시 구매가 유리한 경우가 많습니다. 차량가격, 대출금리, 감가율에 따라 달라지므로 시뮬레이션으로 비교해보는 것이 정확합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '리스와 장기렌트의 차이점은 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '리스는 보험료, 자동차세, 정비비를 별도로 부담하지만 월 리스료가 저렴합니다. 장기렌트는 보험, 세금, 정비가 월 렌트료에 포함되어 관리가 편리하지만 총 비용은 높을 수 있습니다. 리스는 만기 시 인수 옵션이 있고, 장기렌트는 반납이 기본입니다.',
                },
              },
              {
                '@type': 'Question',
                name: '자동차 취등록세는 얼마인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '비영업용 승용차 기준 취득세 7%가 적용됩니다. 예를 들어 2,500만원 차량이면 약 175만원의 취등록세가 발생합니다. 경차는 취득세가 면제(2024년 기준)되며, 하이브리드/전기차는 감면 혜택이 있습니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">자동차 비용 비교 시뮬레이터 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">사회초년생 - 아반떼 2,500만원, 5년 이용</p>
            <p className="text-sm text-gray-600">
              대출 70%, 금리 5.5% 기준 구매 시 5년 순비용 약 1,600만원, 장기렌트 약 3,720만원.
              5년 이상 타실 예정이라면 구매가 유리합니다. 단, 초기 취등록세 175만원이 필요합니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">법인사업자 - 중형 SUV 리스 3년</p>
            <p className="text-sm text-gray-600">
              법인 리스는 월 리스료 전액 비용 처리가 가능해 절세 효과가 큽니다.
              3년 후 반납하고 신차로 교체하면 감가 부담 없이 항상 새 차를 이용할 수 있습니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">차량 관리가 부담스러운 경우 - 장기렌트</p>
            <p className="text-sm text-gray-600">
              보험, 세금, 정비를 월 렌트료에 포함시키면 관리가 편리합니다.
              사고 이력이 있어 보험료가 높거나, 만 26세 미만이라면 장기렌트가 보험 부담을 줄일 수 있습니다.
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
              자동차 구매, 리스, 장기렌트 중 어떤 게 가장 유리한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              3년 이하 단기 이용 시 장기렌트나 리스가 유리하고, 5년 이상 장기 보유 시 구매가 유리한 경우가 많습니다.
              차량가격, 대출금리, 감가율에 따라 달라지므로 시뮬레이션으로 비교해보는 것이 정확합니다.
              특히 구매는 잔존가치가 남아 오래 탈수록 순비용이 줄어드는 구조입니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              리스와 장기렌트의 차이점은 무엇인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              리스는 보험료, 자동차세, 정비비를 별도로 부담하지만 월 리스료가 저렴합니다.
              장기렌트는 보험, 세금, 정비가 월 렌트료에 포함되어 관리가 편리하지만 총 비용은 높을 수 있습니다.
              번호판도 리스는 일반 번호판, 장기렌트는 허/하/호 번호판이 부여됩니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              자동차 취등록세는 얼마인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              비영업용 승용차 기준 취득세 7%가 적용됩니다. 예를 들어 2,500만원 차량이면 약 175만원의 취등록세가 발생합니다.
              경차는 취득세가 면제되며, 하이브리드/전기차는 감면 혜택이 있습니다.
              리스와 장기렌트는 취등록세를 직접 부담하지 않습니다.
            </div>
          </details>
        </div>
      </div>

      {/* ── 관련 도구 ── */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link
            href="/tools/loan-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">대출 이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">원리금균등, 원금균등, 만기일시 상환금 계산</p>
          </Link>
          <Link
            href="/tools/loan-repayment-simulator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">대출 상환 전략 비교 시뮬레이터</span>
            <p className="text-sm text-gray-500 mt-1">원리금균등/원금균등/만기일시 3가지 상환방식 비교</p>
          </Link>
          <Link
            href="/tools/housing-cost-simulator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">전세 vs 월세 vs 매매 비교 시뮬레이터</span>
            <p className="text-sm text-gray-500 mt-1">장기 주거비용을 차트로 비교</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
