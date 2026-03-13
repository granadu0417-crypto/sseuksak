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
  goalAmount: number;
  monthlyAmount: number;
  initialAmount: number;
  years: number;
  depositRate: number;
  investRate: number;
  aggressiveRate: number;
  balanceRatio: number;
}

const PRESETS: Preset[] = [
  {
    label: '사회초년생',
    desc: '월 50만 / 목표 1억',
    goalAmount: 10000,
    monthlyAmount: 50,
    initialAmount: 0,
    years: 10,
    depositRate: 3.5,
    investRate: 7,
    aggressiveRate: 10,
    balanceRatio: 50,
  },
  {
    label: '직장인 5년차',
    desc: '월 100만 / 목표 3억',
    goalAmount: 30000,
    monthlyAmount: 100,
    initialAmount: 2000,
    years: 15,
    depositRate: 3.5,
    investRate: 7,
    aggressiveRate: 10,
    balanceRatio: 50,
  },
  {
    label: '맞벌이 부부',
    desc: '월 200만 / 목표 5억',
    goalAmount: 50000,
    monthlyAmount: 200,
    initialAmount: 5000,
    years: 10,
    depositRate: 3.5,
    investRate: 7,
    aggressiveRate: 10,
    balanceRatio: 50,
  },
];

// ── 계산 ──

interface YearData {
  year: number;
  principal: number;
  safeTotal: number;
  safeReturn: number;
  balancedTotal: number;
  balancedReturn: number;
  aggressiveTotal: number;
  aggressiveReturn: number;
}

function simulate(
  years: number,
  initialAmount: number,
  monthlyAmount: number,
  depositRate: number,
  investRate: number,
  aggressiveRate: number,
  balanceRatio: number,
): YearData[] {
  const data: YearData[] = [];

  const depMonthlyRate = depositRate / 100 / 12;
  const invMonthlyRate = investRate / 100 / 12;
  const aggMonthlyRate = aggressiveRate / 100 / 12;

  let safeBalance = initialAmount;

  const depRatio = balanceRatio / 100;
  let balDepBalance = initialAmount * depRatio;
  let balInvBalance = initialAmount * (1 - depRatio);

  let aggBalance = initialAmount;

  const depMonthly = monthlyAmount * depRatio;
  const invMonthly = monthlyAmount * (1 - depRatio);

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      safeBalance = safeBalance * (1 + depMonthlyRate) + monthlyAmount;
      balDepBalance = balDepBalance * (1 + depMonthlyRate) + depMonthly;
      balInvBalance = balInvBalance * (1 + invMonthlyRate) + invMonthly;
      aggBalance = aggBalance * (1 + aggMonthlyRate) + monthlyAmount;
    }

    const principal = initialAmount + monthlyAmount * 12 * y;

    data.push({
      year: y,
      principal,
      safeTotal: Math.round(safeBalance),
      safeReturn: Math.round(safeBalance - principal),
      balancedTotal: Math.round(balDepBalance + balInvBalance),
      balancedReturn: Math.round(balDepBalance + balInvBalance - principal),
      aggressiveTotal: Math.round(aggBalance),
      aggressiveReturn: Math.round(aggBalance - principal),
    });
  }

  return data;
}

// ── 목표 달성 연도 ──

function findGoalYears(data: YearData[], goalAmount: number) {
  let safe: number | null = null;
  let balanced: number | null = null;
  let aggressive: number | null = null;

  for (const d of data) {
    if (safe === null && d.safeTotal >= goalAmount) safe = d.year;
    if (balanced === null && d.balancedTotal >= goalAmount) balanced = d.year;
    if (aggressive === null && d.aggressiveTotal >= goalAmount) aggressive = d.year;
  }

  return { safe, balanced, aggressive };
}

// ── 인사이트 ──

function generateInsights(data: YearData[], years: number, goalAmount: number): string[] {
  if (data.length === 0) return [];
  const last = data[data.length - 1];
  const insights: string[] = [];

  const strategies = [
    { name: '적금만', total: last.safeTotal },
    { name: '적금+투자', total: last.balancedTotal },
    { name: '투자 중심', total: last.aggressiveTotal },
  ].sort((a, b) => b.total - a.total);

  insights.push(
    `${years}년 후 ${strategies[0].name} 전략이 가장 많은 자산을 형성합니다 (${formatMan(strategies[0].total)})`
  );

  const diff = strategies[0].total - strategies[2].total;
  insights.push(
    `${strategies[0].name}과 ${strategies[2].name}의 차이는 ${formatMan(diff)}입니다`
  );

  const goalYears = findGoalYears(data, goalAmount);

  if (goalYears.aggressive !== null) {
    insights.push(`투자 중심 전략으로 목표 ${formatMan(goalAmount)}까지 약 ${goalYears.aggressive}년 소요`);
  }
  if (goalYears.balanced !== null) {
    insights.push(`적금+투자 전략으로 목표까지 약 ${goalYears.balanced}년 소요`);
  }
  if (goalYears.safe !== null) {
    insights.push(`적금만 전략으로 목표까지 약 ${goalYears.safe}년 소요`);
  }

  const unreached = [];
  if (goalYears.safe === null && last.safeTotal < goalAmount) unreached.push('적금만');
  if (goalYears.balanced === null && last.balancedTotal < goalAmount) unreached.push('적금+투자');
  if (goalYears.aggressive === null && last.aggressiveTotal < goalAmount) unreached.push('투자 중심');
  if (unreached.length > 0) {
    insights.push(
      `${unreached.join(', ')} 전략은 ${years}년 내 목표에 도달하지 못합니다. 기간을 늘리거나 월 저축액을 높여보세요.`
    );
  }

  const safeReturnRate = last.principal > 0 ? (last.safeReturn / last.principal * 100).toFixed(1) : '0';
  const balReturnRate = last.principal > 0 ? (last.balancedReturn / last.principal * 100).toFixed(1) : '0';
  const aggReturnRate = last.principal > 0 ? (last.aggressiveReturn / last.principal * 100).toFixed(1) : '0';
  insights.push(
    `총 수익률: 적금만 ${safeReturnRate}%, 적금+투자 ${balReturnRate}%, 투자 중심 ${aggReturnRate}%`
  );

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
  min,
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

export default function SavingsGoalSimulator() {
  const [goalAmount, setGoalAmount] = useState(10000);
  const [monthlyAmount, setMonthlyAmount] = useState(50);
  const [initialAmount, setInitialAmount] = useState(0);
  const [years, setYears] = useState(10);

  const [depositRate, setDepositRate] = useState(3.5);
  const [investRate, setInvestRate] = useState(7);
  const [aggressiveRate, setAggressiveRate] = useState(10);
  const [balanceRatio, setBalanceRatio] = useState(50);

  const [showTable, setShowTable] = useState(false);

  function applyPreset(p: Preset) {
    setGoalAmount(p.goalAmount);
    setMonthlyAmount(p.monthlyAmount);
    setInitialAmount(p.initialAmount);
    setYears(p.years);
    setDepositRate(p.depositRate);
    setInvestRate(p.investRate);
    setAggressiveRate(p.aggressiveRate);
    setBalanceRatio(p.balanceRatio);
  }

  const data = useMemo(
    () => simulate(years, initialAmount, monthlyAmount, depositRate, investRate, aggressiveRate, balanceRatio),
    [years, initialAmount, monthlyAmount, depositRate, investRate, aggressiveRate, balanceRatio]
  );

  const lastData = data.length > 0 ? data[data.length - 1] : null;
  const insights = useMemo(() => generateInsights(data, years, goalAmount), [data, years, goalAmount]);
  const goalYears = useMemo(() => findGoalYears(data, goalAmount), [data, goalAmount]);

  const bestOption = useMemo(() => {
    if (!lastData) return '';
    const options = [
      { name: '적금만', total: lastData.safeTotal },
      { name: '적금+투자', total: lastData.balancedTotal },
      { name: '투자 중심', total: lastData.aggressiveTotal },
    ];
    return options.sort((a, b) => b.total - a.total)[0].name;
  }, [lastData]);

  const chartData = useMemo(
    () => data.map((d) => ({
      year: `${d.year}년`,
      '적금만': d.safeTotal,
      '적금+투자': d.balancedTotal,
      '투자 중심': d.aggressiveTotal,
    })),
    [data]
  );

  const barData = useMemo(() => {
    if (!lastData) return [];
    return [
      { name: '적금만', 원금: lastData.principal, 수익: lastData.safeReturn },
      { name: '적금+투자', 원금: lastData.principal, 수익: lastData.balancedReturn },
      { name: '투자 중심', 원금: lastData.principal, 수익: lastData.aggressiveReturn },
    ];
  }, [lastData]);

  const yAxisFormatter = (value: number) => {
    if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(0)}억`;
    return `${Math.round(value)}만`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ToolJsonLd
        name="목돈 모으기 시뮬레이터"
        description="적금만, 적금+투자, 투자 중심 3가지 전략으로 목돈을 모으는 과정을 시뮬레이션합니다. 1억, 3억, 5억 목표에 맞는 최적의 저축 전략을 찾아보세요."
        url="/tools/savings-goal-simulator"
      />

      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/tools" className="hover:text-blue-600 transition-colors">
          도구 목록
        </Link>
        <span>/</span>
        <span className="text-gray-900">목돈 모으기 시뮬레이터</span>
      </div>

      {/* 제목 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          목돈 모으기 시뮬레이터
        </h1>
        <p className="mt-2 text-gray-600">
          적금만, 적금+투자, 투자 중심 3가지 전략으로 목돈을 모으는 과정을 비교해보세요. 수익률과 비율을 자유롭게 조정할 수 있습니다.
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

        {/* 공통 입력 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label="목표 금액" value={goalAmount} onChange={setGoalAmount} unit="만원" step={1000} min={0} />
          <NumberInput label="월 저축/투자액" value={monthlyAmount} onChange={setMonthlyAmount} unit="만원" step={10} min={0} />
          <NumberInput label="초기 자금 (시드머니)" value={initialAmount} onChange={setInitialAmount} unit="만원" step={100} min={0} />
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">목표 기간</label>
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
        </div>

        {/* 3컬럼 전략별 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 적금만 */}
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
            <h3 className="font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              적금만 (안전형)
            </h3>
            <NumberInput label="적금 금리 (연)" value={depositRate} onChange={setDepositRate} unit="%" step={0.1} min={0} />
            <p className="text-xs text-gray-400">* 원금 보장, 확정 이자</p>
          </div>

          {/* 적금+투자 */}
          <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/30 space-y-3">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              적금+투자 (균형형)
            </h3>
            <p className="text-xs text-gray-500">적금 부분: 안전형과 동일한 금리 ({depositRate}%) 적용</p>
            <NumberInput label="투자 수익률 (연)" value={investRate} onChange={setInvestRate} unit="%" step={0.5} />
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">적금 : 투자 비율</label>
                <span className="text-sm font-bold text-green-600">{balanceRatio} : {100 - balanceRatio}</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={10}
                value={balanceRatio}
                onChange={(e) => setBalanceRatio(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>적금 10%</span>
                <span>50:50</span>
                <span>적금 90%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">* 적금 부분 원금 보장, 투자 부분 변동</p>
          </div>

          {/* 투자 중심 */}
          <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50/30 space-y-3">
            <h3 className="font-semibold text-amber-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              투자 중심 (공격형)
            </h3>
            <NumberInput label="투자 수익률 (연)" value={aggressiveRate} onChange={setAggressiveRate} unit="%" step={0.5} />
            <p className="text-xs text-gray-400">* 원금 손실 가능, 높은 기대수익</p>
          </div>
        </div>
      </div>

      {/* ── 결과 카드 ── */}
      {lastData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 적금만 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '적금만' ? 'ring-4 ring-blue-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            {bestOption === '적금만' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-blue-100 text-sm">적금만 {years}년 후</p>
            <p className="text-2xl font-bold mt-1">{formatMan(lastData.safeTotal)}</p>
            <p className="text-blue-200 text-xs mt-2">
              원금 {formatMan(lastData.principal)} + 이자 {formatMan(lastData.safeReturn)}
            </p>
            {goalYears.safe && (
              <p className="text-blue-200 text-xs mt-1">목표 달성: {goalYears.safe}년</p>
            )}
          </div>

          {/* 적금+투자 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '적금+투자' ? 'ring-4 ring-green-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}>
            {bestOption === '적금+투자' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-green-100 text-sm">적금+투자 {years}년 후</p>
            <p className="text-2xl font-bold mt-1">{formatMan(lastData.balancedTotal)}</p>
            <p className="text-green-200 text-xs mt-2">
              원금 {formatMan(lastData.principal)} + 수익 {formatMan(lastData.balancedReturn)}
            </p>
            {goalYears.balanced && (
              <p className="text-green-200 text-xs mt-1">목표 달성: {goalYears.balanced}년</p>
            )}
          </div>

          {/* 투자 중심 */}
          <div className={`relative rounded-xl p-5 text-white ${bestOption === '투자 중심' ? 'ring-4 ring-amber-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {bestOption === '투자 중심' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                가장 유리
              </span>
            )}
            <p className="text-amber-100 text-sm">투자 중심 {years}년 후</p>
            <p className="text-2xl font-bold mt-1">{formatMan(lastData.aggressiveTotal)}</p>
            <p className="text-amber-200 text-xs mt-2">
              원금 {formatMan(lastData.principal)} + 수익 {formatMan(lastData.aggressiveReturn)}
            </p>
            {goalYears.aggressive && (
              <p className="text-amber-200 text-xs mt-1">목표 달성: {goalYears.aggressive}년</p>
            )}
          </div>
        </div>
      )}

      {/* ── 라인 차트 ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">자산 성장 추이</h2>
        <p className="text-sm text-gray-500 mb-4">빨간 점선은 목표 금액을 나타냅니다</p>
        <div className="h-[350px] md:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="적금만" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="적금+투자" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="투자 중심" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <ReferenceLine
                y={goalAmount}
                stroke="#ef4444"
                strokeDasharray="6 4"
                strokeWidth={2}
              >
                <Label value={`목표 ${formatMan(goalAmount)}`} position="insideTopRight" fill="#991b1b" fontSize={12} />
              </ReferenceLine>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 원금 vs 수익 바 차트 ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{years}년 후 원금 vs 수익 구성</h2>
        <p className="text-sm text-gray-500 mb-4">전략별 원금 대비 수익 비율 비교</p>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} width={60} />
              <Tooltip formatter={(value?: number, name?: string) => [formatMan(value ?? 0), name ?? '']} />
              <Legend />
              <Bar dataKey="원금" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
              <Bar dataKey="수익" stackId="a" fill="#34d399" radius={[0, 4, 4, 0]} />
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
                  <th className="px-3 py-2 text-right text-gray-600 font-medium">원금</th>
                  <th className="px-3 py-2 text-right text-blue-600 font-medium">적금만</th>
                  <th className="px-3 py-2 text-right text-blue-600 font-medium">이자</th>
                  <th className="px-3 py-2 text-right text-green-600 font-medium">적금+투자</th>
                  <th className="px-3 py-2 text-right text-green-600 font-medium">수익</th>
                  <th className="px-3 py-2 text-right text-amber-600 font-medium">투자 중심</th>
                  <th className="px-3 py-2 text-right text-amber-600 font-medium">수익</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => {
                  const isGoalYear =
                    d.year === goalYears.safe ||
                    d.year === goalYears.balanced ||
                    d.year === goalYears.aggressive;
                  return (
                    <tr key={d.year} className={`border-t border-gray-100 hover:bg-gray-50 ${isGoalYear ? 'bg-yellow-50' : ''}`}>
                      <td className="px-3 py-2 font-medium text-gray-900">{d.year}년</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatMan(d.principal)}</td>
                      <td className="px-3 py-2 text-right text-blue-600 font-medium">{formatMan(d.safeTotal)}</td>
                      <td className="px-3 py-2 text-right text-blue-400">{formatMan(d.safeReturn)}</td>
                      <td className="px-3 py-2 text-right text-green-600 font-medium">{formatMan(d.balancedTotal)}</td>
                      <td className="px-3 py-2 text-right text-green-400">{formatMan(d.balancedReturn)}</td>
                      <td className="px-3 py-2 text-right text-amber-600 font-medium">{formatMan(d.aggressiveTotal)}</td>
                      <td className="px-3 py-2 text-right text-amber-400">{formatMan(d.aggressiveReturn)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 가정 및 주의사항 ── */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">가정 및 주의사항</h3>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li>* 적금은 월복리로 계산하며, 실제 은행 적금은 단리 적용이 일반적입니다.</li>
          <li>* 투자 수익률은 연평균 기대수익률이며, 실제 수익은 매년 변동됩니다.</li>
          <li>* 투자에는 원금 손실 위험이 있으며, 과거 수익률이 미래를 보장하지 않습니다.</li>
          <li>* 세금(이자소득세 15.4%, 금융투자소득세 등)은 반영되지 않았습니다.</li>
          <li>* 물가상승률은 반영되지 않으므로, 실질 구매력은 표시 금액보다 낮을 수 있습니다.</li>
          <li>* 균형형의 적금 비율만큼은 원금 보장, 투자 비율만큼은 변동 수익입니다.</li>
          <li>* 실제 투자 시에는 분산투자, 리밸런싱 등 위험 관리가 필요합니다.</li>
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
                name: '1억 모으려면 월 얼마씩 저축해야 하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '적금 금리 3.5% 기준 월 50만원씩 저축하면 약 14년, 월 100만원이면 약 7년 6개월이 걸립니다. 적금+투자 혼합 전략(연 7% 수익률)을 활용하면 월 50만원으로도 약 10년이면 1억을 모을 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '적금만 vs 투자 병행, 어떤 전략이 유리한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '단기(3년 이내)에는 적금이 안전하고 유리합니다. 장기(10년 이상)에는 투자 병행이 복리 효과로 훨씬 유리합니다. 예를 들어 월 100만원 15년 기준, 적금만(3.5%)은 약 2억 1천만원, 투자 중심(10%)은 약 4억 1천만원으로 약 2배 차이가 납니다.',
                },
              },
              {
                '@type': 'Question',
                name: '시드머니(초기 자금)가 있으면 얼마나 유리한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '시드머니는 복리 효과를 극대화합니다. 예를 들어 초기 자금 2,000만원 + 월 100만원 투자(연 7%) 15년 후 약 3억 7천만원이 됩니다. 시드머니 없이 같은 조건이면 약 3억 1천만원으로 약 6천만원 차이가 납니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">목돈 모으기 시뮬레이터 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">사회초년생: 월 50만원으로 1억 모으기</p>
            <p className="text-sm text-gray-600">
              시드머니 없이 월 50만원 저축 시, 적금만(3.5%)으로는 약 14년, 적금+투자 혼합(7%)으로는 약 10년이 소요됩니다.
              투자 병행 시 약 4년을 앞당길 수 있지만, 원금 손실 위험이 있으므로 분산투자가 중요합니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">직장인 5년차: 시드머니 2,000만원 + 월 100만원으로 3억 모으기</p>
            <p className="text-sm text-gray-600">
              적금만으로는 약 20년 이상 걸리지만, 적금 50% + 투자 50% 균형 전략(투자 7%)을 활용하면
              약 15년이면 3억에 도달합니다. 시드머니가 복리 효과를 받아 후반부에 자산 성장이 가속됩니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">맞벌이 부부: 월 200만원으로 5억 모으기</p>
            <p className="text-sm text-gray-600">
              시드머니 5,000만원과 월 200만원 저축 시, 투자 중심(10%) 전략으로 약 10년이면 5억 달성 가능합니다.
              적금만(3.5%)으로는 약 16년이 걸려 투자 병행 시 6년을 앞당길 수 있습니다.
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
              1억 모으려면 월 얼마씩 저축해야 하나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              적금 금리 3.5% 기준 월 50만원씩 저축하면 약 14년, 월 100만원이면 약 7년 6개월이 걸립니다.
              적금+투자 혼합 전략(연 7% 수익률)을 활용하면 월 50만원으로도 약 10년이면 1억을 모을 수 있습니다.
              세금(이자소득세 15.4%)은 별도이므로 실제로는 조금 더 걸릴 수 있습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              적금만 vs 투자 병행, 어떤 전략이 유리한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              단기(3년 이내)에는 적금이 안전하고 유리합니다. 장기(10년 이상)에는 투자 병행이
              복리 효과로 훨씬 유리합니다. 다만 투자에는 원금 손실 위험이 있으므로
              자신의 위험 감수 성향과 투자 기간을 고려해 적금과 투자 비율을 조절하세요.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              시드머니(초기 자금)가 있으면 얼마나 유리한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              시드머니는 복리 효과를 극대화합니다. 예를 들어 초기 자금 2,000만원 + 월 100만원 투자(연 7%)
              15년 후 약 3억 7천만원이 됩니다. 시드머니 없이 같은 조건이면 약 3억 1천만원으로
              약 6천만원 차이가 납니다. 초기 자금이 클수록 장기적으로 더 큰 복리 혜택을 받습니다.
            </div>
          </details>
        </div>
      </div>

      {/* ── 관련 도구 ── */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link
            href="/tools/savings-interest-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">적금 이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">정기적금, 정기예금 이자와 세후 수령액을 계산</p>
          </Link>
          <Link
            href="/tools/fire-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">FIRE 조기은퇴 계산기</span>
            <p className="text-sm text-gray-500 mt-1">경제적 자유를 위한 은퇴자금과 달성 시점을 계산</p>
          </Link>
          <Link
            href="/tools/salary-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 소득세 공제 후 실제 받는 월급을 계산</p>
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
