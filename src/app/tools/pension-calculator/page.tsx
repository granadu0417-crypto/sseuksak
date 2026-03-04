'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 국민연금 기준
const NPS = {
  premiumRate: 0.095, // 보험료율 9.5% (2026년)
  employeeShare: 0.5, // 근로자 부담 50%
  avgIncomeA: 2860000, // 전체 가입자 평균소득월액 (2025년 기준 약 286만원)
  baseCoefficient: 1.2, // 기본연금액 계수 (소득대체율 40% 기준)
  extraYearRate: 0.05, // 20년 초과 시 연 5% 추가
  baseMonths: 240, // 기본 가입 기간 20년(240개월)
  minIncome: 370000, // 기준소득월액 하한 (2026년)
  maxIncome: 6170000, // 기준소득월액 상한 (2026년)
  lifeExpectancy: 83, // 기대수명
};

function formatMoney(value: number): string {
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const man = Math.round(value % 10000);
    if (man === 0) return `${eok}억`;
    return `${eok}억 ${man.toLocaleString()}만`;
  }
  return `${Math.round(value).toLocaleString()}만`;
}

function formatWon(value: number): string {
  return value.toLocaleString() + '원';
}

interface PensionResult {
  monthlyPension: number;
  totalContribution: number;
  totalContributionEmployee: number;
  contributionYears: number;
  contributionMonths: number;
  totalReceive: number;
  receiveYears: number;
  ratio: number;
}

function calculatePension(
  avgMonthlySalary: number,
  contributionYears: number,
  startAge: number
): PensionResult {
  const bounded = Math.min(Math.max(avgMonthlySalary, NPS.minIncome), NPS.maxIncome);
  const contributionMonths = contributionYears * 12;

  // 기본연금액 산식: 1.2 × (A + B) × 가입기간 보정
  const A = NPS.avgIncomeA;
  const B = bounded;

  let monthlyPension: number;
  if (contributionMonths <= NPS.baseMonths) {
    // 20년 이하: 비례 계산
    monthlyPension = NPS.baseCoefficient * (A + B) * (contributionMonths / NPS.baseMonths) / 12;
  } else {
    // 20년 초과: 기본액 + 추가 연수분
    const extraYears = (contributionMonths - NPS.baseMonths) / 12;
    monthlyPension = NPS.baseCoefficient * (A + B) * (1 + NPS.extraYearRate * extraYears) / 12;
  }

  monthlyPension = Math.round(monthlyPension);

  // 총 납부액
  const monthlyPremium = bounded * NPS.premiumRate;
  const totalContribution = monthlyPremium * contributionMonths;
  const totalContributionEmployee = totalContribution * NPS.employeeShare;

  // 수령 기간 (65세부터 기대수명까지)
  const receiveStartAge = 65;
  const receiveYears = Math.max(NPS.lifeExpectancy - receiveStartAge, 0);
  const totalReceive = monthlyPension * 12 * receiveYears;

  // 납부 대비 수령 비율 (근로자 부담분 대비)
  const ratio = totalContributionEmployee > 0 ? totalReceive / totalContributionEmployee : 0;

  return {
    monthlyPension,
    totalContribution,
    totalContributionEmployee,
    contributionYears,
    contributionMonths,
    totalReceive,
    receiveYears,
    ratio,
  };
}

const SALARY_PRESETS = [
  { label: '200만', value: 2000000 },
  { label: '250만', value: 2500000 },
  { label: '300만', value: 3000000 },
  { label: '350만', value: 3500000 },
  { label: '400만', value: 4000000 },
  { label: '500만', value: 5000000 },
];

const PERIOD_PRESETS = [
  { label: '10년', value: 10 },
  { label: '15년', value: 15 },
  { label: '20년', value: 20 },
  { label: '25년', value: 25 },
  { label: '30년', value: 30 },
  { label: '35년', value: 35 },
];

export default function PensionCalculatorPage() {
  const [salary, setSalary] = useState('3000000');
  const [years, setYears] = useState('20');
  const [currentAge, setCurrentAge] = useState('35');

  const result = useMemo(() => {
    const s = parseInt(salary) || 0;
    const y = parseInt(years) || 0;
    const age = parseInt(currentAge) || 35;
    if (s <= 0 || y <= 0) return null;
    return calculatePension(s, y, age);
  }, [salary, years, currentAge]);

  // 가입기간별 비교 테이블
  const comparisonTable = useMemo(() => {
    const s = parseInt(salary) || 3000000;
    return [10, 15, 20, 25, 30, 35].map((y) => ({
      years: y,
      result: calculatePension(s, y, parseInt(currentAge) || 35),
    }));
  }, [salary, currentAge]);

  return (
    <>
      <ToolJsonLd
        name="국민연금 예상 수령액 계산기"
        description="가입 기간과 평균 소득을 입력하면 예상 국민연금 월 수령액을 계산합니다."
        url="https://sseuksak.com/tools/pension-calculator"
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/tools" className="hover:text-blue-600">도구</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">국민연금 수령액 계산기</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">국민연금 예상 수령액 계산기</h1>
        <p className="text-gray-600 mb-6">
          가입 기간과 월 평균소득을 입력하면 65세부터 받을 수 있는 예상 연금액을 계산합니다.
        </p>

        {/* 입력 영역 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-5">
          {/* 현재 나이 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 나이</label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="만 나이"
              min="18"
              max="64"
            />
          </div>

          {/* 월 평균소득 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 평균소득 (보수월액)
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="월 소득 (원)"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {SALARY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSalary(p.value.toString())}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    parseInt(salary) === p.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              기준소득월액: 하한 {formatWon(NPS.minIncome)} ~ 상한 {formatWon(NPS.maxIncome)}
            </p>
          </div>

          {/* 가입 기간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              총 가입 기간 (납부 연수)
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="납부 연수"
              min="1"
              max="40"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {PERIOD_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setYears(p.value.toString())}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    parseInt(years) === p.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 영역 */}
        {result && (
          <div className="space-y-4">
            {/* 메인 결과 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <p className="text-sm text-blue-600 mb-1">예상 월 수령액 (65세~)</p>
              <p className="text-3xl font-bold text-blue-900">
                월 {formatWon(result.monthlyPension)}
              </p>
              <p className="text-sm text-blue-500 mt-1">
                연 {formatWon(result.monthlyPension * 12)}
              </p>
            </div>

            {/* 상세 정보 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">총 납부액 (근로자)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatMoney(Math.round(result.totalContributionEmployee / 10000))}원
                </p>
                <p className="text-xs text-gray-400">
                  사용자 포함 {formatMoney(Math.round(result.totalContribution / 10000))}원
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">예상 총 수령액</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatMoney(Math.round(result.totalReceive / 10000))}원
                </p>
                <p className="text-xs text-gray-400">
                  65세~{NPS.lifeExpectancy}세 ({result.receiveYears}년)
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">납부 대비 수령</p>
                <p className="text-lg font-semibold text-green-700">
                  {result.ratio.toFixed(1)}배
                </p>
                <p className="text-xs text-gray-400">근로자 납부분 기준</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">월 보험료 (근로자)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatWon(Math.round((parseInt(salary) || 0) * NPS.premiumRate * NPS.employeeShare))}
                </p>
                <p className="text-xs text-gray-400">보험료율 {NPS.premiumRate * 100}%의 절반</p>
              </div>
            </div>

            {/* 가입기간별 비교 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                가입 기간별 예상 수령액 비교
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">가입 기간</th>
                      <th className="text-right py-2 text-gray-500 font-medium">월 수령액</th>
                      <th className="text-right py-2 text-gray-500 font-medium">연 수령액</th>
                      <th className="text-right py-2 text-gray-500 font-medium">수령 배수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonTable.map(({ years: y, result: r }) => (
                      <tr
                        key={y}
                        className={`border-b border-gray-100 ${
                          y === parseInt(years) ? 'bg-blue-50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2">{y}년</td>
                        <td className="text-right py-2">{formatWon(r.monthlyPension)}</td>
                        <td className="text-right py-2">{formatWon(r.monthlyPension * 12)}</td>
                        <td className="text-right py-2 text-green-600">{r.ratio.toFixed(1)}배</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 수령 나이 안내 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">출생연도별 수령 시작 나이</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">1953~1956년생</span>
                  <span className="font-medium">만 61세</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">1957~1960년생</span>
                  <span className="font-medium">만 62세</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">1961~1964년생</span>
                  <span className="font-medium">만 63세</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">1965~1968년생</span>
                  <span className="font-medium">만 64세</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">1969년 이후</span>
                  <span className="font-medium text-blue-600">만 65세</span>
                </div>
              </div>
            </div>

            {/* 안내 사항 */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                본 계산기는 2026년 기준 국민연금 산식을 적용한 <strong>추정치</strong>입니다.
                실제 수령액은 매년 변동되는 전체 가입자 평균소득월액(A값), 물가 변동률,
                제도 개정에 따라 달라질 수 있습니다. 정확한 예상액은{' '}
                <a
                  href="https://www.nps.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-900 underline"
                >
                  국민연금공단
                </a>
                에서 확인하세요.
              </p>
            </div>
          </div>
        )}

        {/* 관련 가이드 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">관련 가이드</h3>
          <div className="grid gap-2">
            <Link
              href="/posts/national-pension-expected-amount-2026"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                국민연금 예상 수령액: 20년 납부하면 월 얼마 받을까?
              </span>
            </Link>
            <Link
              href="/posts/pension-savings-vs-irp-guide-2026"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                연금저축 vs IRP: 세액공제 한도·수수료 비교
              </span>
            </Link>
            <Link
              href="/posts/fire-early-retirement-simulation-2026"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                FIRE 조기은퇴 저축률별 시뮬레이션
              </span>
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          2026년 기준 | 보험료율 9.5%, 전체 가입자 평균소득월액(A값) 286만원, 소득대체율 40% 적용
        </p>

        {/* 관련 도구 */}
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
          <div className="space-y-2">
            <Link href="/tools/salary-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
              <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
            </Link>
            <Link href="/tools/health-insurance-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">건강보험료 계산기</span>
              <p className="text-sm text-gray-500 mt-1">직장가입자 건강보험료 계산</p>
            </Link>
            <Link href="/tools/fire-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-blue-600 font-medium">FIRE 조기은퇴 계산기</span>
              <p className="text-sm text-gray-500 mt-1">저축률과 투자수익률로 은퇴 시기 계산</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
