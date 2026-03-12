'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// DSR 규제 한도
const DSR_LIMITS = {
  bank: 40, // 은행권 40%
  nonBank: 50, // 비은행권 50%
};

// 스트레스 DSR 가산금리 (2026년 3단계)
const STRESS_DSR = {
  metro: 1.5, // 수도권: 3.0%p × 50% = 1.5%p (2026 기준)
  nonMetro: 0.75, // 비수도권: 1.5%p × 50% = 0.75%p
};

// 청년 장래소득 인정 비율
const YOUTH_INCOME_BOOST: Record<string, number> = {
  '20-24': 0.516,
  '25-29': 0.314,
  '30-34': 0.131,
};

// 대출 유형별 DSR 환산 규칙
const LOAN_CONVERSION: Record<string, { label: string; years: number; method: string; desc: string }> = {
  mortgage: { label: '주택담보대출', years: 0, method: 'actual', desc: '실제 상환방식 기준' },
  credit: { label: '신용대출', years: 5, method: 'equal_payment', desc: '5년 원리금균등 환산' },
  minus: { label: '마이너스통장', years: 5, method: 'equal_payment', desc: '한도 전액, 5년 원리금균등 환산' },
  cardLoan: { label: '카드론', years: 3, method: 'equal_payment', desc: '3년 원리금균등 환산' },
  student: { label: '학자금대출', years: 10, method: 'equal_payment', desc: '10년 원리금균등 환산' },
  autoLoan: { label: '자동차할부', years: 0, method: 'actual', desc: '실제 상환방식 기준' },
};

type RepaymentMethod = 'equal_payment' | 'equal_principal' | 'bullet';

interface Loan {
  id: string;
  type: keyof typeof LOAN_CONVERSION;
  balance: number; // 잔액 (또는 한도)
  rate: number; // 금리 (%)
  remainingYears: number; // 잔여 기간 (년)
  method: RepaymentMethod; // 상환방식
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

// 원리금균등 연간 상환액 계산
function calcAnnualPaymentEqual(principal: number, annualRate: number, years: number): number {
  if (years <= 0 || principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return principal / years;
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return monthlyPayment * 12;
}

// 원금균등 연간 상환액 계산 (첫 해 기준 = 최대)
function calcAnnualPaymentPrincipal(principal: number, annualRate: number, years: number): number {
  if (years <= 0 || principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  const monthlyPrincipal = principal / months;
  // 첫 달이 가장 많으므로 첫 해 12개월 합산
  let total = 0;
  for (let i = 0; i < 12; i++) {
    const balance = principal - monthlyPrincipal * i;
    total += monthlyPrincipal + balance * monthlyRate;
  }
  return total;
}

// 만기일시 연간 상환액 (이자만)
function calcAnnualPaymentBullet(principal: number, annualRate: number): number {
  return principal * (annualRate / 100);
}

// 대출별 연간 상환액 계산 (DSR 환산 기준 적용)
function calcLoanAnnualPayment(loan: Loan, stressRate: number): number {
  const conversion = LOAN_CONVERSION[loan.type];
  const effectiveRate = loan.rate + stressRate;

  // DSR 환산 기간 결정
  const years = conversion.years > 0 ? conversion.years : loan.remainingYears;
  if (years <= 0) return 0;

  // DSR 환산 방식 결정
  if (conversion.method === 'actual') {
    switch (loan.method) {
      case 'equal_payment':
        return calcAnnualPaymentEqual(loan.balance, effectiveRate, years);
      case 'equal_principal':
        return calcAnnualPaymentPrincipal(loan.balance, effectiveRate, years);
      case 'bullet':
        return calcAnnualPaymentBullet(loan.balance, effectiveRate);
      default:
        return calcAnnualPaymentEqual(loan.balance, effectiveRate, years);
    }
  }

  // 강제 원리금균등 환산 (신용대출, 마이너스통장, 카드론 등)
  return calcAnnualPaymentEqual(loan.balance, effectiveRate, years);
}

// 추가 대출 가능 금액 역산
function calcMaxAdditionalLoan(
  annualIncome: number,
  currentAnnualPayment: number,
  dsrLimit: number,
  newRate: number,
  newYears: number,
  stressRate: number
): number {
  const maxTotalPayment = annualIncome * (dsrLimit / 100);
  const remainingCapacity = maxTotalPayment - currentAnnualPayment;
  if (remainingCapacity <= 1000) return 0; // 미세 오차 무시

  const effectiveRate = newRate + stressRate;
  const monthlyRate = effectiveRate / 100 / 12;
  const months = newYears * 12;

  if (monthlyRate === 0) return remainingCapacity * newYears;

  // 연간 상환액 = 월 상환액 × 12
  // 월 상환액 = P × r × (1+r)^n / ((1+r)^n - 1)
  // → P = 월상환액 × ((1+r)^n - 1) / (r × (1+r)^n)
  const monthlyCapacity = remainingCapacity / 12;
  const maxLoan =
    (monthlyCapacity * (Math.pow(1 + monthlyRate, months) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, months));

  const result = Math.max(0, Math.floor(maxLoan / 10000) * 10000); // 만원 단위 절삭
  return result < 1000000 ? 0 : result; // 100만원 미만은 실질적으로 0 처리
}

const DEFAULT_LOAN: () => Loan = () => ({
  id: generateId(),
  type: 'mortgage',
  balance: 200000000,
  rate: 4.0,
  remainingYears: 30,
  method: 'equal_payment',
});

const PRESETS = [
  {
    label: '대출 없음 (연봉 5천)',
    income: 50000000,
    loans: [],
  },
  {
    label: '직장인 (연봉 5천)',
    income: 50000000,
    loans: [
      { type: 'mortgage' as const, balance: 300000000, rate: 3.8, remainingYears: 30, method: 'equal_payment' as RepaymentMethod },
      { type: 'credit' as const, balance: 20000000, rate: 5.5, remainingYears: 5, method: 'equal_payment' as RepaymentMethod },
    ],
  },
  {
    label: '신혼부부 (연봉 7천)',
    income: 70000000,
    loans: [
      { type: 'mortgage' as const, balance: 500000000, rate: 3.5, remainingYears: 30, method: 'equal_payment' as RepaymentMethod },
    ],
  },
  {
    label: '사회초년생 (연봉 3천)',
    income: 30000000,
    loans: [
      { type: 'credit' as const, balance: 10000000, rate: 6.0, remainingYears: 5, method: 'equal_payment' as RepaymentMethod },
      { type: 'student' as const, balance: 15000000, rate: 1.7, remainingYears: 10, method: 'equal_payment' as RepaymentMethod },
    ],
  },
];

export default function DsrCalculatorPage() {
  const [annualIncome, setAnnualIncome] = useState(50000000);
  const [loans, setLoans] = useState<Loan[]>([
    { ...DEFAULT_LOAN(), type: 'mortgage', balance: 300000000, rate: 3.8, remainingYears: 30 },
  ]);
  const [region, setRegion] = useState<'metro' | 'nonMetro'>('metro');
  const [useStressDsr, setUseStressDsr] = useState(true);
  const [ageGroup, setAgeGroup] = useState<string>('none');
  const [lenderType, setLenderType] = useState<'bank' | 'nonBank'>('bank');

  // 추가 대출 시뮬레이션용
  const [newLoanRate, setNewLoanRate] = useState(4.0);
  const [newLoanYears, setNewLoanYears] = useState(30);

  const addLoan = () => {
    setLoans([...loans, DEFAULT_LOAN()]);
  };

  const removeLoan = (id: string) => {
    setLoans(loans.filter((l) => l.id !== id));
  };

  const updateLoan = (id: string, field: keyof Loan, value: string | number) => {
    setLoans(
      loans.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        // 대출 유형 변경 시 환산 기간/방식 자동 세팅
        if (field === 'type') {
          const conv = LOAN_CONVERSION[value as string];
          if (conv.years > 0) {
            updated.remainingYears = conv.years;
            updated.method = 'equal_payment';
          }
        }
        return updated;
      })
    );
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setAnnualIncome(preset.income);
    setLoans(
      preset.loans.map((l) => ({
        ...l,
        id: generateId(),
      }))
    );
  };

  const stressRate = useMemo(() => {
    if (!useStressDsr) return 0;
    return region === 'metro' ? STRESS_DSR.metro : STRESS_DSR.nonMetro;
  }, [useStressDsr, region]);

  const result = useMemo(() => {
    // 청년 장래소득 적용
    let effectiveIncome = annualIncome;
    if (ageGroup !== 'none' && YOUTH_INCOME_BOOST[ageGroup]) {
      effectiveIncome = annualIncome * (1 + YOUTH_INCOME_BOOST[ageGroup]);
    }

    // 각 대출별 연간 상환액
    const loanDetails = loans.map((loan) => {
      const annualPayment = calcLoanAnnualPayment(loan, stressRate);
      return {
        ...loan,
        annualPayment,
        conversionInfo: LOAN_CONVERSION[loan.type],
      };
    });

    const totalAnnualPayment = loanDetails.reduce((sum, l) => sum + l.annualPayment, 0);
    const dsr = effectiveIncome > 0 ? (totalAnnualPayment / effectiveIncome) * 100 : 0;
    const dsrLimit = lenderType === 'bank' ? DSR_LIMITS.bank : DSR_LIMITS.nonBank;
    const isOver = dsr > dsrLimit;
    const remaining = dsrLimit - dsr;

    // 추가 대출 가능 금액
    const maxAdditional = calcMaxAdditionalLoan(
      effectiveIncome,
      totalAnnualPayment,
      dsrLimit,
      newLoanRate,
      newLoanYears,
      stressRate
    );

    return {
      effectiveIncome,
      loanDetails,
      totalAnnualPayment,
      dsr,
      dsrLimit,
      isOver,
      remaining,
      maxAdditional,
    };
  }, [annualIncome, loans, stressRate, ageGroup, lenderType, newLoanRate, newLoanYears]);

  const getDsrColor = (dsr: number, limit: number) => {
    const ratio = dsr / limit;
    if (ratio >= 1) return 'text-red-600';
    if (ratio >= 0.8) return 'text-orange-500';
    if (ratio >= 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDsrBgColor = (dsr: number, limit: number) => {
    const ratio = dsr / limit;
    if (ratio >= 1) return 'bg-red-500';
    if (ratio >= 0.8) return 'bg-orange-400';
    if (ratio >= 0.6) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getDsrLabel = (dsr: number, limit: number) => {
    if (dsr > limit) return '한도 초과';
    if (Math.abs(dsr - limit) < 0.1) return '한도 도달';
    const ratio = dsr / limit;
    if (ratio >= 0.8) return '주의';
    if (ratio >= 0.6) return '보통';
    return '여유';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="DSR 계산기"
        description="총부채원리금상환비율(DSR)을 계산하고 추가 대출 가능 금액을 확인합니다"
        url="/tools/dsr-calculator"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'DSR이란 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'DSR(Debt Service Ratio, 총부채원리금상환비율)은 모든 대출의 연간 원리금 상환액을 연소득으로 나눈 비율입니다. 은행권은 40%, 비은행권은 50%가 한도이며, 총 대출 1억 초과 시 적용됩니다.',
                },
              },
              {
                '@type': 'Question',
                name: '스트레스 DSR이란 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '스트레스 DSR은 금리 상승 위험을 반영해 실제 금리에 가산금리를 더해 DSR을 계산하는 제도입니다. 2026년 기준 수도권은 3.0%p의 50%(1.5%p), 비수도권은 1.5%p의 50%(0.75%p)가 가산됩니다.',
                },
              },
              {
                '@type': 'Question',
                name: 'DSR 계산 시 신용대출은 어떻게 환산하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '신용대출은 실제 만기와 상관없이 5년 원리금균등 상환 방식으로 환산합니다. 마이너스통장은 한도 전액을 5년 원리금균등으로, 카드론은 3년 원리금균등으로 환산합니다.',
                },
              },
            ],
          }),
        }}
      />

      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &#8592; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DSR 계산기</h1>
        <p className="text-gray-600">
          총부채원리금상환비율(DSR)을 계산하고 추가 대출 가능 금액을 확인해요
        </p>
      </div>

      {/* 프리셋 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 소득 입력 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">소득 정보</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">연소득 (세전)</label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step={1000000}
            min={0}
          />
          <p className="mt-1 text-sm text-gray-500">월 {formatMoney(Math.round(annualIncome / 12))} (세전)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">금융권</label>
            <select
              value={lenderType}
              onChange={(e) => setLenderType(e.target.value as 'bank' | 'nonBank')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="bank">은행권 (한도 40%)</option>
              <option value="nonBank">비은행권 (한도 50%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">청년 장래소득</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">해당 없음</option>
              <option value="20-24">만 20~24세 (+51.6%)</option>
              <option value="25-29">만 25~29세 (+31.4%)</option>
              <option value="30-34">만 30~34세 (+13.1%)</option>
            </select>
          </div>
        </div>

        {ageGroup !== 'none' && (
          <p className="mt-2 text-sm text-blue-600">
            장래소득 반영 후 인정소득: {formatMoney(Math.round(result.effectiveIncome))}
          </p>
        )}
      </div>

      {/* 스트레스 DSR */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">스트레스 DSR</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useStressDsr}
              onChange={(e) => setUseStressDsr(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">적용</span>
          </label>
        </div>

        {useStressDsr && (
          <div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="region"
                  checked={region === 'metro'}
                  onChange={() => setRegion('metro')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">수도권 (+{STRESS_DSR.metro}%p)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="region"
                  checked={region === 'nonMetro'}
                  onChange={() => setRegion('nonMetro')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">비수도권 (+{STRESS_DSR.nonMetro}%p)</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              2026년 스트레스 DSR 3단계: 대출 금리에 가산금리를 더해 DSR을 산출합니다
            </p>
          </div>
        )}
      </div>

      {/* 대출 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">기존 대출 ({loans.length}건)</h3>
          <button
            onClick={addLoan}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            + 대출 추가
          </button>
        </div>

        <div className="space-y-6">
          {loans.length === 0 && (
            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm mb-1">기존 대출이 없습니다</p>
              <p className="text-xs">아래 &apos;추가 대출 가능 금액&apos;에서 최대 한도를 확인하세요</p>
            </div>
          )}
          {loans.map((loan, index) => {
            const conv = LOAN_CONVERSION[loan.type];
            const isFixed = conv.years > 0;

            return (
              <div key={loan.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">대출 {index + 1}</span>
                  <button
                    onClick={() => removeLoan(loan.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">대출 유형</label>
                    <select
                      value={loan.type}
                      onChange={(e) => updateLoan(loan.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(LOAN_CONVERSION).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">{conv.desc}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {loan.type === 'minus' ? '한도 금액' : '대출 잔액'}
                    </label>
                    <input
                      type="number"
                      value={loan.balance}
                      onChange={(e) => updateLoan(loan.id, 'balance', Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      step={10000000}
                      min={0}
                    />
                    <p className="mt-1 text-xs text-gray-400">{formatMoney(loan.balance)}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">금리 (%)</label>
                    <input
                      type="number"
                      value={loan.rate}
                      onChange={(e) => updateLoan(loan.id, 'rate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      step={0.1}
                      min={0}
                      max={30}
                    />
                    {stressRate > 0 && (
                      <p className="mt-1 text-xs text-orange-500">
                        스트레스 반영: {(loan.rate + stressRate).toFixed(1)}%
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {isFixed ? 'DSR 환산 기간' : '잔여 기간 (년)'}
                    </label>
                    <input
                      type="number"
                      value={isFixed ? conv.years : loan.remainingYears}
                      onChange={(e) => updateLoan(loan.id, 'remainingYears', Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      min={1}
                      max={50}
                      disabled={isFixed}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">상환방식</label>
                    <select
                      value={isFixed ? 'equal_payment' : loan.method}
                      onChange={(e) => updateLoan(loan.id, 'method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      disabled={isFixed}
                    >
                      <option value="equal_payment">원리금균등</option>
                      <option value="equal_principal">원금균등</option>
                      <option value="bullet">만기일시</option>
                    </select>
                  </div>
                </div>

                {/* 대출별 연간 상환액 미리보기 */}
                <div className="text-right text-sm text-gray-600">
                  연간 상환액:{' '}
                  <span className="font-semibold text-gray-900">
                    {formatMoney(Math.round(result.loanDetails.find((d) => d.id === loan.id)?.annualPayment || 0))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 결과 - DSR 게이지 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">DSR 결과</h3>

        {/* 게이지 바 */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className={`text-4xl font-bold ${getDsrColor(result.dsr, result.dsrLimit)}`}>
                {result.dsr.toFixed(1)}%
              </span>
              <span className="text-lg text-gray-400 ml-1">/ {result.dsrLimit}%</span>
            </div>
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${
                result.isOver
                  ? 'bg-red-100 text-red-700'
                  : Math.abs(result.dsr - result.dsrLimit) < 0.1
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
              }`}
            >
              {getDsrLabel(result.dsr, result.dsrLimit)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getDsrBgColor(result.dsr, result.dsrLimit)}`}
              style={{ width: `${Math.min(result.dsr / result.dsrLimit * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>0%</span>
            <span className="text-gray-600 font-medium">{result.dsrLimit}% 한도</span>
          </div>
        </div>

        {/* 주요 수치 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">연간 총 상환액</p>
            <p className="text-lg font-bold text-gray-900">{formatMoney(Math.round(result.totalAnnualPayment))}</p>
            <p className="text-xs text-gray-400">월 {formatMoney(Math.round(result.totalAnnualPayment / 12))}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">인정 연소득</p>
            <p className="text-lg font-bold text-gray-900">{formatMoney(Math.round(result.effectiveIncome))}</p>
            <p className="text-xs text-gray-400">월 {formatMoney(Math.round(result.effectiveIncome / 12))}</p>
          </div>
        </div>

        {/* 대출별 DSR 기여도 */}
        {result.loanDetails.length > 1 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">대출별 DSR 기여도</p>
            <div className="space-y-2">
              {result.loanDetails.map((loan, i) => {
                const contribution = result.effectiveIncome > 0 ? (loan.annualPayment / result.effectiveIncome) * 100 : 0;
                return (
                  <div key={loan.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16 shrink-0">대출 {i + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((contribution / result.dsrLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-12 text-right">
                      {contribution.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {result.isOver && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">DSR 한도를 초과했습니다</p>
            <p className="text-sm text-red-600 mt-1">
              현재 DSR {result.dsr.toFixed(1)}%로 {lenderType === 'bank' ? '은행' : '비은행'} 한도 {result.dsrLimit}%를{' '}
              {(result.dsr - result.dsrLimit).toFixed(1)}%p 초과합니다.
              기존 대출 상환이나 소득 증가가 필요합니다.
            </p>
          </div>
        )}
      </div>

      {/* 추가 대출 가능 금액 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">추가 대출 가능 금액</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">예상 금리 (%)</label>
            <input
              type="number"
              value={newLoanRate}
              onChange={(e) => setNewLoanRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              step={0.1}
              min={0}
              max={30}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">대출 기간 (년)</label>
            <input
              type="number"
              value={newLoanYears}
              onChange={(e) => setNewLoanYears(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              min={1}
              max={50}
            />
          </div>
        </div>

        <div className={`rounded-lg p-4 ${result.maxAdditional > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
          <p className="text-sm text-gray-600 mb-1">
            원리금균등 {newLoanYears}년, 금리 {newLoanRate}%
            {stressRate > 0 ? ` (스트레스 반영 ${(newLoanRate + stressRate).toFixed(1)}%)` : ''} 기준
          </p>
          <p className={`text-2xl font-bold ${result.maxAdditional > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
            {result.maxAdditional > 0 ? `최대 ${formatMoney(result.maxAdditional)}` : '추가 대출 불가'}
          </p>
          {result.maxAdditional > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              잔여 DSR 여력: {result.remaining.toFixed(1)}%p (연 {formatMoney(Math.round(result.effectiveIncome * result.remaining / 100))} 상환 가능)
            </p>
          )}
        </div>
      </div>

      {/* 대출별 상세 */}
      {loans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">대출별 DSR 상세</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">구분</th>
                  <th className="text-right py-2 text-gray-500 font-medium">잔액</th>
                  <th className="text-right py-2 text-gray-500 font-medium">금리</th>
                  <th className="text-right py-2 text-gray-500 font-medium">연상환</th>
                  <th className="text-right py-2 text-gray-500 font-medium">DSR</th>
                </tr>
              </thead>
              <tbody>
                {result.loanDetails.map((loan, i) => {
                  const contribution = result.effectiveIncome > 0 ? (loan.annualPayment / result.effectiveIncome) * 100 : 0;
                  return (
                    <tr key={loan.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">
                        <span className="font-medium">{LOAN_CONVERSION[loan.type].label}</span>
                        <br />
                        <span className="text-xs text-gray-400">대출 {i + 1}</span>
                      </td>
                      <td className="py-2 text-right text-gray-900">{formatMoney(loan.balance)}</td>
                      <td className="py-2 text-right text-gray-900">
                        {loan.rate}%
                        {stressRate > 0 && (
                          <span className="text-xs text-orange-500 block">
                            ({(loan.rate + stressRate).toFixed(1)}%)
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right text-gray-900">{formatMoney(Math.round(loan.annualPayment))}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{contribution.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {loans.length > 1 && (
                  <tr className="font-medium">
                    <td className="py-2 text-gray-900">합계</td>
                    <td className="py-2 text-right text-gray-900">
                      {formatMoney(loans.reduce((sum, l) => sum + l.balance, 0))}
                    </td>
                    <td className="py-2 text-right text-gray-400">-</td>
                    <td className="py-2 text-right text-gray-900">
                      {formatMoney(Math.round(result.totalAnnualPayment))}
                    </td>
                    <td className={`py-2 text-right ${getDsrColor(result.dsr, result.dsrLimit)}`}>
                      {result.dsr.toFixed(1)}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 안내 */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">DSR 규제 안내</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-1">DSR 규제 대상</p>
            <p>총 대출액 1억원 초과 시 적용됩니다. 전세대출, 중도금대출, 300만원 이하 소액 신용대출은 DSR에서 제외됩니다.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">대출 유형별 환산 방식</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>주택담보대출: 실제 상환방식과 잔여 기간 기준</li>
              <li>신용대출: 만기와 무관하게 5년 원리금균등 환산</li>
              <li>마이너스통장: 한도 전액을 5년 원리금균등 환산</li>
              <li>카드론: 3년 원리금균등 환산</li>
              <li>학자금대출: 10년 원리금균등 환산</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">스트레스 DSR (2026년 3단계)</p>
            <p>
              금리 변동 위험을 반영하여 대출 금리에 가산금리를 더합니다.
              수도권 3.0%p, 비수도권 1.5%p의 50%를 반영합니다.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">청년 장래소득 인정</p>
            <p>
              만 34세 이하 무주택 청년은 현재 소득에 장래소득 증가분을 반영하여 DSR을 산출할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">관련 계산기</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/tools/loan-calculator"
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">대출이자 계산기</p>
            <p className="text-xs text-gray-500">월 상환금과 총 이자 비교</p>
          </Link>
          <Link
            href="/tools/loan-repayment-simulator"
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">대출 상환 전략 비교</p>
            <p className="text-xs text-gray-500">상환방식별 차트 비교</p>
          </Link>
          <Link
            href="/tools/salary-calculator"
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">연봉 실수령액 계산기</p>
            <p className="text-xs text-gray-500">세후 실수령액 확인</p>
          </Link>
          <Link
            href="/tools/housing-cost-simulator"
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 text-sm">전세 vs 월세 vs 매매</p>
            <p className="text-xs text-gray-500">주거비용 장기 비교</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
