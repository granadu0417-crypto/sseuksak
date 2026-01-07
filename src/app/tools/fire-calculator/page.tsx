'use client';

import { useState } from 'react';
import Link from 'next/link';

// FIRE 유형별 정보
const FIRE_TYPES = [
  {
    name: 'Lean FIRE',
    multiplier: 20,
    description: '최소한의 지출로 빠르게 은퇴. 연간 지출 2천만원 이하 목표.',
    color: 'bg-green-100 border-green-300',
  },
  {
    name: 'Regular FIRE',
    multiplier: 25,
    description: '일반적인 FIRE. 현재 생활 수준 유지하며 은퇴.',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    name: 'Fat FIRE',
    multiplier: 33,
    description: '넉넉한 은퇴 자금. 여유로운 생활과 여행 가능.',
    color: 'bg-purple-100 border-purple-300',
  },
  {
    name: 'Coast FIRE',
    multiplier: 0,
    description: '은퇴 자금을 복리로 굴려두고, 생활비만 벌면 되는 상태.',
    color: 'bg-orange-100 border-orange-300',
  },
  {
    name: 'Barista FIRE',
    multiplier: 0,
    description: '부분 은퇴. 좋아하는 일을 파트타임으로 하며 부족분 충당.',
    color: 'bg-pink-100 border-pink-300',
  },
];

// 저축률별 은퇴 연수 (7% 수익률 기준)
const SAVINGS_RATE_TABLE = [
  { rate: 10, years: 51 },
  { rate: 20, years: 37 },
  { rate: 30, years: 28 },
  { rate: 40, years: 22 },
  { rate: 50, years: 17 },
  { rate: 60, years: 12.5 },
  { rate: 70, years: 8.5 },
  { rate: 80, years: 5.5 },
  { rate: 90, years: 2.5 },
];

interface FireResult {
  retireAge: number;
  yearsToFire: number;
  fireNumber: number;
  yearlyData: Array<{
    age: number;
    assets: number;
    target: number;
  }>;
}

function calculateFire(
  currentAge: number,
  currentAssets: number,
  annualIncome: number,
  annualExpense: number,
  returnRate: number
): FireResult | null {
  const savingsRate = (annualIncome - annualExpense) / annualIncome;
  const annualSavings = annualIncome - annualExpense;

  // 4% Rule: 연간 지출의 25배가 은퇴 자금
  const fireNumber = annualExpense * 25;

  if (annualSavings <= 0) {
    return null;
  }

  const yearlyData: Array<{ age: number; assets: number; target: number }> = [];
  let assets = currentAssets;
  let age = currentAge;
  const maxAge = 80;

  while (assets < fireNumber && age < maxAge) {
    yearlyData.push({ age, assets, target: fireNumber });
    assets = assets * (1 + returnRate / 100) + annualSavings;
    age++;
  }

  yearlyData.push({ age, assets, target: fireNumber });

  return {
    retireAge: age,
    yearsToFire: age - currentAge,
    fireNumber,
    yearlyData,
  };
}

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export default function FireCalculatorPage() {
  const [currentAge, setCurrentAge] = useState(30);
  const [currentAssets, setCurrentAssets] = useState(50000000);
  const [annualIncome, setAnnualIncome] = useState(50000000);
  const [annualExpense, setAnnualExpense] = useState(30000000);
  const [returnRate, setReturnRate] = useState(7);
  const [result, setResult] = useState<FireResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    const fireResult = calculateFire(
      currentAge,
      currentAssets,
      annualIncome,
      annualExpense,
      returnRate
    );

    if (!fireResult) {
      setError('연간 저축액이 0 이하입니다. 지출을 줄이거나 소득을 늘려야 해요.');
      setResult(null);
      return;
    }

    if (fireResult.retireAge >= 80) {
      setError('현재 조건으로는 80세 이전에 은퇴가 어려워요. 저축률을 높여보세요.');
    }

    setResult(fireResult);
  };

  const savingsRate = ((annualIncome - annualExpense) / annualIncome * 100).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FIRE 조기은퇴 계산기</h1>
        <p className="text-gray-600">
          경제적 자유를 얻고 몇 살에 은퇴할 수 있는지 계산해요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 나이
            </label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min={20}
              max={70}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 자산 (원)
            </label>
            <input
              type="number"
              value={currentAssets}
              onChange={(e) => setCurrentAssets(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              step={10000000}
            />
            <p className="text-sm text-gray-500 mt-1">{formatMoney(currentAssets)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연간 소득 (세후)
            </label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              step={1000000}
            />
            <p className="text-sm text-gray-500 mt-1">{formatMoney(annualIncome)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연간 지출
            </label>
            <input
              type="number"
              value={annualExpense}
              onChange={(e) => setAnnualExpense(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              step={1000000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formatMoney(annualExpense)} (저축률: {savingsRate}%)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예상 투자 수익률 (연 %)
            </label>
            <input
              type="number"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min={0}
              max={15}
              step={0.5}
            />
            <p className="text-sm text-gray-500 mt-1">S&P 500 장기 평균: 약 7%</p>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full mt-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          계산하기
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">FIRE 결과</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">은퇴 가능 나이</p>
                <p className="text-3xl font-bold text-orange-600">{result.retireAge}세</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">남은 기간</p>
                <p className="text-3xl font-bold text-orange-600">{result.yearsToFire}년</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">필요한 은퇴 자금 (FIRE Number)</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(result.fireNumber)}</p>
              <p className="text-sm text-gray-500 mt-1">= 연간 지출 x 25 (4% Rule)</p>
            </div>
          </div>

          {/* 자산 성장 그래프 (간단한 막대) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">자산 성장 예측</h3>
            <div className="space-y-2">
              {result.yearlyData
                .filter((_, i) => i % Math.ceil(result.yearlyData.length / 8) === 0 || i === result.yearlyData.length - 1)
                .map((data, index) => {
                  const percentage = Math.min((data.assets / result.fireNumber) * 100, 100);
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-12 text-sm text-gray-600">{data.age}세</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentage >= 100 ? 'bg-green-500' : 'bg-orange-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-20 text-sm text-right text-gray-600">
                        {formatMoney(data.assets)}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>목표 달성 ({formatMoney(result.fireNumber)})</span>
            </div>
          </div>
        </div>
      )}

      {/* 핵심 인사이트 */}
      <div className="mt-8 bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">가장 중요한 인사이트</h3>
        <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-700">
          &quot;복리는 강력하지만 시간이 오래 걸려요. 5~10년 안에 은퇴하려면 <strong>투자 수익률이 아닌 저축률</strong>이 가장 중요해요.&quot;
        </blockquote>
        <p className="text-sm text-gray-600 mt-3">
          — networthify.com (FIRE 계산기 원본)
        </p>
      </div>

      {/* 저축률별 은퇴 기간 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">저축률별 은퇴까지 걸리는 시간</h3>
        <p className="text-sm text-gray-600 mb-4">
          현재 저축률: <span className="font-bold text-orange-600">{savingsRate}%</span>
        </p>
        <div className="space-y-2">
          {SAVINGS_RATE_TABLE.map((item) => {
            const isCurrentRange = Number(savingsRate) >= item.rate - 5 && Number(savingsRate) < item.rate + 5;
            return (
              <div key={item.rate} className="flex items-center gap-3">
                <span className="w-12 text-sm text-gray-600">{item.rate}%</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isCurrentRange ? 'bg-orange-500' : 'bg-blue-300'}`}
                    style={{ width: `${Math.min(100 - item.years, 100)}%` }}
                  />
                </div>
                <span className={`w-16 text-sm text-right ${isCurrentRange ? 'font-bold text-orange-600' : 'text-gray-600'}`}>
                  {item.years}년
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">* 연 7% 투자 수익률 가정</p>
      </div>

      {/* FIRE 유형 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">FIRE의 5가지 유형</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIRE_TYPES.slice(0, 4).map((type) => (
            <div
              key={type.name}
              className={`p-4 rounded-lg border ${type.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{type.name}</span>
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
              {type.multiplier > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  필요 자금: 연 지출 x {type.multiplier}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className={`p-4 rounded-lg border ${FIRE_TYPES[4].color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900">{FIRE_TYPES[4].name}</span>
            </div>
            <p className="text-sm text-gray-600">{FIRE_TYPES[4].description}</p>
          </div>
        </div>
      </div>

      {/* 4% Rule 상세 설명 */}
      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">4% Rule (트리니티 연구)</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            1998년 트리니티 대학의 연구에서 시작된 규칙이에요.
            주식 50% + 채권 50% 포트폴리오에서 매년 <strong>초기 자산의 4%</strong>를 인출하면,
            <strong>30년 이상 자산이 고갈되지 않을 확률이 95% 이상</strong>이라는 연구 결과예요.
          </p>
          <div className="bg-white rounded-lg p-4">
            <p className="font-medium mb-2">계산 예시:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• 연간 지출 3,000만원 → 필요 자금: 3,000만 x 25 = <strong>7.5억원</strong></li>
              <li>• 연간 지출 4,000만원 → 필요 자금: 4,000만 x 25 = <strong>10억원</strong></li>
              <li>• 연간 지출 5,000만원 → 필요 자금: 5,000만 x 25 = <strong>12.5억원</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 기본 설명 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">FIRE란?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• <strong>FIRE</strong>: Financial Independence, Retire Early (경제적 자유, 조기 은퇴)</li>
          <li>• <strong>경제적 자유</strong>: 투자 수익만으로 생활비를 충당할 수 있는 상태</li>
          <li>• <strong>핵심</strong>: 소비를 줄이면 1) 저축이 늘고 2) 필요 은퇴 자금이 줄어요</li>
          <li>• <strong>주의</strong>: 인플레이션, 의료비, 예상치 못한 지출을 고려해 여유있게 계획하세요</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            참고: networthify.com, Mr. Money Mustache, Trinity Study (1998)
          </p>
        </div>
      </div>
    </div>
  );
}
