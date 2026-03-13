'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ── 타입 ──

interface MonthlyPayment {
  month: number;
  principal: number;
  interest: number;
  payment: number;
  balance: number;
}

interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: MonthlyPayment[];
}

interface YearlyChartData {
  year: string;
  yearNum: number;
  equalPaymentBalance: number;
  equalPrincipalBalance: number;
  bulletBalance: number;
  equalPaymentCumInterest: number;
  equalPrincipalCumInterest: number;
  bulletCumInterest: number;
  equalPaymentMonthly: number;
  equalPrincipalMonthly: number;
  bulletMonthly: number;
}

interface Preset {
  label: string;
  desc: string;
  principal: number;
  rate: number;
  years: number;
  graceYears: number;
}

// ── 프리셋 ──

const PRESETS: Preset[] = [
  {
    label: '신혼부부 전세대출',
    desc: '2억 / 3.5% / 10년',
    principal: 20000,
    rate: 3.5,
    years: 10,
    graceYears: 1,
  },
  {
    label: '주택담보대출',
    desc: '3억 / 4.0% / 30년',
    principal: 30000,
    rate: 4.0,
    years: 30,
    graceYears: 0,
  },
  {
    label: '고액 아파트 대출',
    desc: '5억 / 4.5% / 30년',
    principal: 50000,
    rate: 4.5,
    years: 30,
    graceYears: 3,
  },
];

// ── 계산 함수 (loan-calculator 재활용) ──

function calculateEqualPayment(
  principal: number,
  annualRate: number,
  months: number,
  gracePeriod: number
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthlyPayment[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= gracePeriod; i++) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    schedule.push({
      month: i,
      principal: 0,
      interest: Math.round(interest),
      payment: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  const repaymentMonths = months - gracePeriod;
  let monthlyPayment = 0;

  if (monthlyRate === 0) {
    monthlyPayment = principal / repaymentMonths;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
      (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
  }

  for (let i = gracePeriod + 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;
    totalInterest += interest;
    schedule.push({
      month: i,
      principal: Math.round(principalPayment),
      interest: Math.round(interest),
      payment: Math.round(monthlyPayment),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

function calculateEqualPrincipal(
  principal: number,
  annualRate: number,
  months: number,
  gracePeriod: number
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthlyPayment[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= gracePeriod; i++) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    schedule.push({
      month: i,
      principal: 0,
      interest: Math.round(interest),
      payment: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  const repaymentMonths = months - gracePeriod;
  const monthlyPrincipal = principal / repaymentMonths;

  for (let i = gracePeriod + 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const payment = monthlyPrincipal + interest;
    balance -= monthlyPrincipal;
    totalInterest += interest;
    schedule.push({
      month: i,
      principal: Math.round(monthlyPrincipal),
      interest: Math.round(interest),
      payment: Math.round(payment),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  const firstPayment = schedule[gracePeriod]?.payment || 0;

  return {
    monthlyPayment: firstPayment,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

function calculateBullet(
  principal: number,
  annualRate: number,
  months: number
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthlyPayment[] = [];
  const monthlyInterest = principal * monthlyRate;
  const totalInterest = monthlyInterest * months;

  for (let i = 1; i <= months; i++) {
    const isLastMonth = i === months;
    schedule.push({
      month: i,
      principal: isLastMonth ? Math.round(principal) : 0,
      interest: Math.round(monthlyInterest),
      payment: isLastMonth
        ? Math.round(principal + monthlyInterest)
        : Math.round(monthlyInterest),
      balance: isLastMonth ? 0 : Math.round(principal),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyInterest),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

// ── 유틸 ──

function formatEok(value: number): string {
  const abs = Math.abs(value);
  const eok = Math.floor(abs / 100000000);
  const man = Math.round((abs % 100000000) / 10000);
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억원`;
  if (man > 0) return `${man.toLocaleString()}만원`;
  return '0원';
}

function formatMan(value: number): string {
  const man = Math.round(value / 10000);
  if (man >= 10000) {
    const eok = Math.floor(man / 10000);
    const remain = man % 10000;
    if (remain > 0) return `${eok}억 ${remain.toLocaleString()}만원`;
    return `${eok}억원`;
  }
  return `${man.toLocaleString()}만원`;
}

// 월별 스케줄 → 연도별 차트 데이터 변환
function toYearlyChartData(
  ep: LoanResult,
  epr: LoanResult,
  bu: LoanResult,
  totalYears: number
): YearlyChartData[] {
  const data: YearlyChartData[] = [];

  for (let y = 0; y <= totalYears; y++) {
    const monthIdx = y * 12; // 해당 연말 시점의 인덱스

    if (y === 0) {
      const principal = ep.schedule.length > 0 ? ep.schedule[0].balance + ep.schedule[0].principal : 0;
      data.push({
        year: '0년',
        yearNum: 0,
        equalPaymentBalance: principal,
        equalPrincipalBalance: principal,
        bulletBalance: principal,
        equalPaymentCumInterest: 0,
        equalPrincipalCumInterest: 0,
        bulletCumInterest: 0,
        equalPaymentMonthly: ep.schedule[0]?.payment || 0,
        equalPrincipalMonthly: epr.schedule[0]?.payment || 0,
        bulletMonthly: bu.schedule[0]?.payment || 0,
      });
      continue;
    }

    const epIdx = Math.min(monthIdx - 1, ep.schedule.length - 1);
    const eprIdx = Math.min(monthIdx - 1, epr.schedule.length - 1);
    const buIdx = Math.min(monthIdx - 1, bu.schedule.length - 1);

    // 누적 이자 계산
    let epCumInterest = 0;
    let eprCumInterest = 0;
    let buCumInterest = 0;
    for (let m = 0; m <= epIdx; m++) epCumInterest += ep.schedule[m].interest;
    for (let m = 0; m <= eprIdx; m++) eprCumInterest += epr.schedule[m].interest;
    for (let m = 0; m <= buIdx; m++) buCumInterest += bu.schedule[m].interest;

    data.push({
      year: `${y}년`,
      yearNum: y,
      equalPaymentBalance: ep.schedule[epIdx]?.balance || 0,
      equalPrincipalBalance: epr.schedule[eprIdx]?.balance || 0,
      bulletBalance: bu.schedule[buIdx]?.balance || 0,
      equalPaymentCumInterest: epCumInterest,
      equalPrincipalCumInterest: eprCumInterest,
      bulletCumInterest: buCumInterest,
      equalPaymentMonthly: ep.schedule[epIdx]?.payment || 0,
      equalPrincipalMonthly: epr.schedule[eprIdx]?.payment || 0,
      bulletMonthly: bu.schedule[buIdx]?.payment || 0,
    });
  }

  return data;
}

// 인사이트 생성
function generateInsights(
  ep: LoanResult,
  epr: LoanResult,
  bu: LoanResult,
  principal: number,
  gracePeriod: number
): string[] {
  const insights: string[] = [];

  // 원금균등 vs 원리금균등 이자 절약
  const savedInterest = ep.totalInterest - epr.totalInterest;
  if (savedInterest > 0) {
    insights.push(
      `원금균등 선택 시 원리금균등 대비 총 ${formatMan(savedInterest)} 이자를 절약할 수 있습니다`
    );
  }

  // 원금균등의 첫달 납입금 vs 원리금균등
  const firstDiff = epr.monthlyPayment - ep.monthlyPayment;
  if (firstDiff > 0) {
    insights.push(
      `원금균등의 첫달 납입금은 ${formatMan(epr.monthlyPayment)}으로, 원리금균등보다 ${formatMan(firstDiff)} 높습니다`
    );
  }

  // 만기일시 특성
  insights.push(
    `만기일시는 월 부담이 ${formatMan(bu.monthlyPayment)}으로 가장 적지만, 총 이자가 ${formatMan(bu.totalInterest)}으로 가장 많습니다`
  );

  // 원금균등 납입금이 원리금균등보다 낮아지는 시점
  const epSchedule = ep.schedule;
  const eprSchedule = epr.schedule;
  const startIdx = gracePeriod;
  for (let i = startIdx; i < Math.min(epSchedule.length, eprSchedule.length); i++) {
    if (eprSchedule[i].payment < epSchedule[i].payment) {
      const yearPoint = Math.ceil((i + 1) / 12);
      insights.push(
        `원금균등의 납입금이 원리금균등보다 낮아지는 시점: 약 ${yearPoint}년차`
      );
      break;
    }
  }

  // 만기일시 vs 원금균등 이자 차이
  const bulletVsEpr = bu.totalInterest - epr.totalInterest;
  if (bulletVsEpr > 0) {
    insights.push(
      `만기일시는 원금균등보다 총 이자가 ${formatMan(bulletVsEpr)} 더 많습니다`
    );
  }

  return insights;
}

// ── 커스텀 툴팁 ──

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
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

// ── 메인 컴포넌트 ──

export default function LoanRepaymentSimulator() {
  const [principalMan, setPrincipalMan] = useState(30000); // 만원 단위
  const [annualRate, setAnnualRate] = useState(4.0);
  const [loanYears, setLoanYears] = useState(30);
  const [graceYears, setGraceYears] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const principal = principalMan * 10000; // 원 단위
  const months = loanYears * 12;
  const gracePeriod = graceYears * 12;

  function applyPreset(p: Preset) {
    setPrincipalMan(p.principal);
    setAnnualRate(p.rate);
    setLoanYears(p.years);
    setGraceYears(p.graceYears);
  }

  // 3가지 상환방식 동시 계산
  const results = useMemo(() => {
    if (principal <= 0 || annualRate < 0 || months <= 0) return null;
    if (gracePeriod >= months) return null;

    const ep = calculateEqualPayment(principal, annualRate, months, gracePeriod);
    const epr = calculateEqualPrincipal(principal, annualRate, months, gracePeriod);
    const bu = calculateBullet(principal, annualRate, months);

    return { ep, epr, bu };
  }, [principal, annualRate, months, gracePeriod]);

  // 차트 데이터
  const chartData = useMemo(() => {
    if (!results) return [];
    return toYearlyChartData(results.ep, results.epr, results.bu, loanYears);
  }, [results, loanYears]);

  // 인사이트
  const insights = useMemo(() => {
    if (!results) return [];
    return generateInsights(results.ep, results.epr, results.bu, principal, gracePeriod);
  }, [results, principal, gracePeriod]);

  // 바 차트 데이터 (총 이자 비교)
  const barData = useMemo(() => {
    if (!results) return [];
    return [
      { name: '원리금균등', 총이자: results.ep.totalInterest, fill: '#3b82f6' },
      { name: '원금균등', 총이자: results.epr.totalInterest, fill: '#22c55e' },
      { name: '만기일시', 총이자: results.bu.totalInterest, fill: '#f59e0b' },
    ];
  }, [results]);

  // 연도별 테이블 데이터
  const yearlyTableData = useMemo(() => {
    if (!results) return [];
    const data: Array<{
      year: number;
      epPrincipal: number;
      epInterest: number;
      epBalance: number;
      eprPrincipal: number;
      eprInterest: number;
      eprBalance: number;
      buInterest: number;
      buBalance: number;
    }> = [];

    for (let y = 1; y <= loanYears; y++) {
      const startMonth = (y - 1) * 12;
      const endMonth = y * 12;

      let epP = 0, epI = 0, eprP = 0, eprI = 0, buI = 0;
      for (let m = startMonth; m < endMonth && m < results.ep.schedule.length; m++) {
        epP += results.ep.schedule[m].principal;
        epI += results.ep.schedule[m].interest;
      }
      for (let m = startMonth; m < endMonth && m < results.epr.schedule.length; m++) {
        eprP += results.epr.schedule[m].principal;
        eprI += results.epr.schedule[m].interest;
      }
      for (let m = startMonth; m < endMonth && m < results.bu.schedule.length; m++) {
        buI += results.bu.schedule[m].interest;
      }

      const epBalIdx = Math.min(endMonth - 1, results.ep.schedule.length - 1);
      const eprBalIdx = Math.min(endMonth - 1, results.epr.schedule.length - 1);
      const buBalIdx = Math.min(endMonth - 1, results.bu.schedule.length - 1);

      data.push({
        year: y,
        epPrincipal: epP,
        epInterest: epI,
        epBalance: results.ep.schedule[epBalIdx]?.balance || 0,
        eprPrincipal: eprP,
        eprInterest: eprI,
        eprBalance: results.epr.schedule[eprBalIdx]?.balance || 0,
        buInterest: buI,
        buBalance: results.bu.schedule[buBalIdx]?.balance || 0,
      });
    }

    return data;
  }, [results, loanYears]);

  // 가장 유리한 (총이자 최소)
  const bestMethod = useMemo(() => {
    if (!results) return '';
    const min = Math.min(results.ep.totalInterest, results.epr.totalInterest, results.bu.totalInterest);
    if (min === results.epr.totalInterest) return 'equalPrincipal';
    if (min === results.ep.totalInterest) return 'equalPayment';
    return 'bullet';
  }, [results]);

  // Y축 포맷
  const yAxisFormatter = (value: number) => {
    const eok = value / 100000000;
    if (Math.abs(eok) >= 1) return `${eok.toFixed(0)}억`;
    const man = value / 10000;
    return `${Math.round(man)}만`;
  };

  // 대출기간 옵션
  const yearOptions = [5, 10, 15, 20, 25, 30, 35];
  const graceOptions = [0, 1, 2, 3, 5];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ToolJsonLd
        name="대출 상환 전략 비교 시뮬레이터"
        description="원리금균등, 원금균등, 만기일시 3가지 상환방식을 차트로 비교합니다. 잔금 변화, 월 납입금, 총이자를 한눈에 확인하세요."
        url="/tools/loan-repayment-simulator"
      />

      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/tools" className="hover:text-blue-600 transition-colors">
          도구 목록
        </Link>
        <span>/</span>
        <span className="text-gray-900">대출 상환 전략 비교</span>
      </div>

      {/* 제목 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          대출 상환 전략 비교 시뮬레이터
        </h1>
        <p className="mt-2 text-gray-600">
          원리금균등, 원금균등, 만기일시 3가지 상환방식의 차이를 차트로 한눈에 비교해보세요.
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

        {/* 대출금액 슬라이더 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">대출금액</label>
            <span className="text-lg font-bold text-blue-600">{formatEok(principal)}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={principalMan}
            onChange={(e) => setPrincipalMan(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1천만</span>
            <span>2.5억</span>
            <span>5억</span>
            <span>7.5억</span>
            <span>10억</span>
          </div>
        </div>

        {/* 연이자율 슬라이더 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">연이자율</label>
            <span className="text-lg font-bold text-blue-600">{annualRate}%</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={10.0}
            step={0.1}
            value={annualRate}
            onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>3%</span>
            <span>5%</span>
            <span>7%</span>
            <span>10%</span>
          </div>
        </div>

        {/* 대출기간 + 거치기간 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대출기간</label>
            <div className="flex flex-wrap gap-2">
              {yearOptions.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setLoanYears(y);
                    if (graceYears >= y) setGraceYears(0);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    loanYears === y
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {y}년
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              거치기간
              <span className="text-xs text-gray-400 ml-1">(거치 중 이자만 납부)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {graceOptions.filter((g) => g < loanYears).map((g) => (
                <button
                  key={g}
                  onClick={() => setGraceYears(g)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    graceYears === g
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {g === 0 ? '없음' : `${g}년`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 결과 카드 3개 ── */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 원리금균등 */}
          <div
            className={`relative rounded-xl p-5 text-white ${bestMethod === 'equalPayment' ? 'ring-4 ring-blue-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            <p className="text-blue-100 text-sm">원리금균등상환</p>
            <p className="text-2xl font-bold mt-1">{formatMan(results.ep.monthlyPayment)}</p>
            <p className="text-blue-200 text-xs mt-1">매월 고정</p>
            <div className="mt-3 pt-3 border-t border-blue-400/30 space-y-1">
              <p className="text-blue-100 text-sm flex justify-between">
                <span>총 이자</span>
                <span className="font-medium">{formatMan(results.ep.totalInterest)}</span>
              </p>
              <p className="text-blue-100 text-sm flex justify-between">
                <span>총 납입액</span>
                <span className="font-medium">{formatMan(results.ep.totalPayment)}</span>
              </p>
            </div>
          </div>

          {/* 원금균등 */}
          <div
            className={`relative rounded-xl p-5 text-white ${bestMethod === 'equalPrincipal' ? 'ring-4 ring-green-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}
          >
            {bestMethod === 'equalPrincipal' && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                이자 절약
              </span>
            )}
            <p className="text-green-100 text-sm">원금균등상환</p>
            <p className="text-2xl font-bold mt-1">{formatMan(results.epr.monthlyPayment)}</p>
            <p className="text-green-200 text-xs mt-1">첫달 기준 (매월 감소)</p>
            <div className="mt-3 pt-3 border-t border-green-400/30 space-y-1">
              <p className="text-green-100 text-sm flex justify-between">
                <span>총 이자</span>
                <span className="font-medium">{formatMan(results.epr.totalInterest)}</span>
              </p>
              <p className="text-green-100 text-sm flex justify-between">
                <span>총 납입액</span>
                <span className="font-medium">{formatMan(results.epr.totalPayment)}</span>
              </p>
            </div>
          </div>

          {/* 만기일시 */}
          <div
            className={`relative rounded-xl p-5 text-white ${bestMethod === 'bullet' ? 'ring-4 ring-amber-300' : ''}`}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <p className="text-amber-100 text-sm">만기일시상환</p>
            <p className="text-2xl font-bold mt-1">{formatMan(results.bu.monthlyPayment)}</p>
            <p className="text-amber-200 text-xs mt-1">이자만 납부 (만기 원금상환)</p>
            <div className="mt-3 pt-3 border-t border-amber-400/30 space-y-1">
              <p className="text-amber-100 text-sm flex justify-between">
                <span>총 이자</span>
                <span className="font-medium">{formatMan(results.bu.totalInterest)}</span>
              </p>
              <p className="text-amber-100 text-sm flex justify-between">
                <span>총 납입액</span>
                <span className="font-medium">{formatMan(results.bu.totalPayment)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 차트 1: 대출 잔금 변화 ── */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">대출 잔금 변화</h2>
          <p className="text-sm text-gray-500 mb-4">
            상환방식에 따라 대출 잔금이 줄어드는 속도가 다릅니다
          </p>
          <div className="h-[320px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="equalPaymentBalance"
                  name="원리금균등"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="equalPrincipalBalance"
                  name="원금균등"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="bulletBalance"
                  name="만기일시"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── 차트 2: 월 납입금 변화 (원리금균등 vs 원금균등) ── */}
      {chartData.length > 0 && results && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">월 납입금 변화</h2>
          <p className="text-sm text-gray-500 mb-4">
            원리금균등은 일정, 원금균등은 점차 감소 (만기일시: 월 {formatMan(results.bu.monthlyPayment)} 고정)
          </p>
          <div className="h-[320px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.filter((d) => d.yearNum > 0)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="equalPaymentMonthly"
                  name="원리금균등"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="equalPrincipalMonthly"
                  name="원금균등"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── 차트 3: 총 이자 비교 (바차트) ── */}
      {barData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">총 이자 비교</h2>
          <p className="text-sm text-gray-500 mb-4">
            상환방식에 따른 총 이자 금액 차이
          </p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} width={70} />
                <Tooltip
                  formatter={(value?: number, name?: string) => [formatMan(value ?? 0), name ?? '']}
                />
                <Bar dataKey="총이자" radius={[0, 6, 6, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
          <span className="text-gray-400 text-xl">{showTable ? '\u2212' : '+'}</span>
        </button>
        {showTable && (
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th rowSpan={2} className="px-2 py-2 text-left text-gray-600 font-medium border-b border-gray-200">연차</th>
                  <th colSpan={3} className="px-2 py-1 text-center text-blue-600 font-medium border-b border-gray-200">원리금균등</th>
                  <th colSpan={3} className="px-2 py-1 text-center text-green-600 font-medium border-b border-gray-200">원금균등</th>
                  <th colSpan={2} className="px-2 py-1 text-center text-amber-600 font-medium border-b border-gray-200">만기일시</th>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">원금</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">이자</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">잔금</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">원금</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">이자</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">잔금</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">이자</th>
                  <th className="px-2 py-1 text-right text-gray-500 text-xs">잔금</th>
                </tr>
              </thead>
              <tbody>
                {yearlyTableData.map((row) => (
                  <tr key={row.year} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-2 font-medium text-gray-900">{row.year}년</td>
                    <td className="px-2 py-2 text-right text-blue-700">{formatMan(row.epPrincipal)}</td>
                    <td className="px-2 py-2 text-right text-blue-500">{formatMan(row.epInterest)}</td>
                    <td className="px-2 py-2 text-right text-blue-600 font-medium">{formatMan(row.epBalance)}</td>
                    <td className="px-2 py-2 text-right text-green-700">{formatMan(row.eprPrincipal)}</td>
                    <td className="px-2 py-2 text-right text-green-500">{formatMan(row.eprInterest)}</td>
                    <td className="px-2 py-2 text-right text-green-600 font-medium">{formatMan(row.eprBalance)}</td>
                    <td className="px-2 py-2 text-right text-amber-500">{formatMan(row.buInterest)}</td>
                    <td className="px-2 py-2 text-right text-amber-600 font-medium">{formatMan(row.buBalance)}</td>
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
          <li>* 고정금리 기준 계산이며, 변동금리 대출은 금리 변동에 따라 결과가 달라집니다.</li>
          <li>* 중도상환 수수료, 대출 부대비용 등은 포함되지 않았습니다.</li>
          <li>* 만기일시상환은 거치기간 설정과 관계없이 전 기간 이자만 납부합니다.</li>
          <li>* 금융기관별로 이자 계산 방식(일할, 월할)이 다를 수 있습니다.</li>
          <li>* 계산 결과는 참고용이며, 실제 대출 조건과 차이가 있을 수 있습니다.</li>
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
                name: '원리금균등과 원금균등 중 어떤 상환방식이 유리한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '총 이자를 줄이려면 원금균등상환이 유리합니다. 3억 대출, 연 4%, 30년 기준 원금균등은 원리금균등보다 약 1,800만원 이자를 절약합니다. 다만 초기 월 납입금이 높으므로 소득이 안정적이고 초기 부담을 감당할 수 있을 때 적합합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '만기일시상환은 어떤 경우에 선택하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '만기일시상환은 월 부담금이 가장 적지만 총 이자가 가장 많습니다. 전세자금 대출처럼 만기 시 보증금 반환으로 일시 상환이 가능한 경우, 또는 투자 수익이 대출 이자보다 높을 것으로 예상되는 경우에 선택합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '거치기간을 설정하면 이자가 얼마나 늘어나나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '거치기간 동안은 원금 상환 없이 이자만 납부하므로 총 이자가 증가합니다. 예를 들어 3억 대출, 연 4%, 30년 기준 거치기간 3년 설정 시 원리금균등 기준 총 이자가 약 1,500만~2,000만원 더 늘어납니다. 거치기간은 소득이 일시적으로 낮은 초기에만 활용하는 것이 좋습니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">대출 상환 시뮬레이터 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">주택담보대출 3억, 연 4%, 30년</p>
            <p className="text-sm text-gray-600">
              원리금균등 월 약 143만원(고정), 원금균등 첫달 약 183만원(점차 감소). 원금균등이 총 이자 약 1,800만원 절약.
              월 소득이 안정적이라면 원금균등, 초기 부담이 부담스러우면 원리금균등을 추천합니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">신혼부부 전세대출 2억, 연 3.5%, 10년 (거치 1년)</p>
            <p className="text-sm text-gray-600">
              거치 1년간 월 약 58만원(이자만), 이후 원리금균등 월 약 237만원. 전세 만기 시 보증금 반환을 계획하고 있다면
              만기일시상환(월 약 58만원)도 고려할 수 있습니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">고액 아파트 대출 5억, 연 4.5%, 30년 (거치 3년)</p>
            <p className="text-sm text-gray-600">
              거치 3년간 월 약 187만원(이자만), 이후 원리금균등 월 약 313만원. 거치기간 없이 바로 상환하면
              총 이자를 약 3,000만원 이상 절약할 수 있어, 가능하다면 거치기간을 최소화하는 것이 유리합니다.
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
              원리금균등과 원금균등 중 어떤 상환방식이 유리한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              총 이자를 줄이려면 원금균등상환이 유리합니다. 3억 대출, 연 4%, 30년 기준 원금균등은
              원리금균등보다 약 1,800만원 이자를 절약합니다. 다만 초기 월 납입금이 높으므로
              소득이 안정적이고 초기 부담을 감당할 수 있을 때 적합합니다.
              원리금균등은 매월 동일한 금액을 납부해 가계 예산 관리가 쉽습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              만기일시상환은 어떤 경우에 선택하나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              만기일시상환은 월 부담금이 가장 적지만 총 이자가 가장 많습니다.
              전세자금 대출처럼 만기 시 보증금 반환으로 일시 상환이 가능한 경우,
              또는 투자 수익이 대출 이자보다 높을 것으로 예상되는 경우에 선택합니다.
              일반 주택담보대출에서는 권장하지 않습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              거치기간을 설정하면 이자가 얼마나 늘어나나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              거치기간 동안은 원금 상환 없이 이자만 납부하므로 총 이자가 증가합니다.
              예를 들어 3억 대출, 연 4%, 30년 기준 거치기간 3년 설정 시 원리금균등 기준
              총 이자가 약 1,500만~2,000만원 더 늘어납니다. 거치기간은 소득이 일시적으로
              낮은 초기에만 활용하고, 가능하면 최소화하는 것이 좋습니다.
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
            <span className="text-blue-600 font-medium">대출이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">원리금균등, 원금균등, 만기일시 상환금 계산</p>
          </Link>
          <Link
            href="/tools/rent-conversion-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">전월세 전환율 계산기</span>
            <p className="text-sm text-gray-500 mt-1">전세/월세 전환율과 적정 월세 계산</p>
          </Link>
          <Link
            href="/tools/housing-cost-simulator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">전세 vs 월세 vs 매매 비교 시뮬레이터</span>
            <p className="text-sm text-gray-500 mt-1">장기 주거비용 시뮬레이션</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
