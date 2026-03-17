'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

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
      <ToolJsonLd name="FIRE 조기은퇴 계산기" description="저축률과 투자수익률로 조기 은퇴 가능 시기를 계산합니다" url="/tools/fire-calculator" />
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
                name: 'FIRE 달성에 필요한 자금은 얼마인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '4% Rule에 따라 연간 지출의 25배가 필요합니다. 예를 들어 연 지출이 3,000만원이면 7억 5천만원, 4,000만원이면 10억원이 FIRE Number입니다. 이 금액을 모으면 투자 수익만으로 생활비를 충당할 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '저축률이 높으면 왜 은퇴가 빨라지나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '저축률이 높으면 두 가지 효과가 동시에 작용합니다. 첫째, 저축액이 늘어 자산이 빠르게 증가합니다. 둘째, 지출이 줄어 필요한 은퇴 자금(FIRE Number) 자체가 감소합니다. 예를 들어 저축률 50%면 약 17년, 70%면 약 8.5년 만에 은퇴할 수 있습니다(연 7% 수익률 기준).',
                },
              },
              {
                '@type': 'Question',
                name: '4% Rule은 한국에서도 적용 가능한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '4% Rule은 미국 주식/채권 기준 연구이므로, 한국에서 그대로 적용하기는 어렵습니다. 한국은 국민연금, 건강보험, 물가상승률이 다르므로 3~3.5% 인출률을 적용하거나, 국민연금 수령 시기를 고려해 은퇴 계획을 세우는 것이 안전합니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 상세 가이드 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">FIRE 은퇴 계산 완벽 가이드</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">FIRE란?</h3>
            <p>FIRE(Financial Independence, Retire Early)는 경제적 자립을 통해 조기 은퇴를 달성하는 운동입니다. 핵심은 높은 저축률과 투자 수익을 통해 생활비의 25배를 모으는 것입니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4% 룰 (25배 법칙)</h3>
            <p>트리니티 연구(1998)에 따르면 포트폴리오에서 매년 4%씩 인출하면 30년간 자산이 고갈되지 않을 확률이 95% 이상입니다. 따라서 연간 생활비의 25배가 목표 자산입니다. 월 생활비 300만원이면 연 3,600만원, 목표 자산은 9억원입니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">FIRE 유형</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Fat FIRE</strong>: 현재 생활 수준 유지하며 은퇴. 목표 자산이 가장 큼</li>
              <li><strong>Lean FIRE</strong>: 최소한의 생활비로 은퇴. 월 150~200만원 수준</li>
              <li><strong>Barista FIRE</strong>: 파트타임 근무로 부족분 보충. 반(半)은퇴</li>
              <li><strong>Coast FIRE</strong>: 충분한 투자금을 모은 뒤 복리가 목표를 채울 때까지 기다림</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">한국형 FIRE 고려사항</h3>
            <p>한국에서 FIRE를 계획할 때는 미국과 다른 점을 고려해야 합니다. 국민연금 수령(65세부터), 건강보험료(지역가입자 전환 시 부담 증가), 자녀 교육비, 주거비(전세·월세 포함), 물가상승률(연 2~3%)이 핵심 변수입니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">저축률과 은퇴 시기</h3>
            <p>투자 수익률 연 5%, 인플레이션 연 2% 가정 시 저축률에 따른 은퇴까지 소요 기간: 저축률 10%면 약 51년, 20%면 약 37년, 30%면 약 28년, 50%면 약 17년, 70%면 약 8.5년입니다. 저축률이 FIRE 달성 속도의 핵심 변수입니다.</p>
          </div>
        </div>
      </div>

      {/* 사용 예시 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">FIRE 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">30세, 연소득 5,000만원, 연지출 3,000만원</p>
            <p className="text-sm text-gray-600">
              저축률 40%, 투자수익률 7% 기준 FIRE Number는 7.5억원이며, 약 52세에 경제적 자유를 달성할 수 있습니다.
              저축률을 50%로 올리면 47세로 5년 앞당겨집니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">35세, 자산 1억, 연소득 7,000만원, 연지출 4,000만원</p>
            <p className="text-sm text-gray-600">
              저축률 약 43%, FIRE Number 10억원. 기존 자산과 높은 소득 덕분에 약 49세에 은퇴 가능합니다.
              연 지출을 3,500만원으로 줄이면 FIRE Number가 8.75억원으로 낮아져 46세에 달성 가능합니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">28세, Lean FIRE 목표 (연지출 2,000만원)</p>
            <p className="text-sm text-gray-600">
              FIRE Number가 5억원으로 낮아져 저축률 50%, 수익률 7%면 약 45세에 Lean FIRE 달성 가능합니다.
              소비를 최소화하고 빠른 은퇴를 원하는 경우 적합한 전략입니다.
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
              FIRE 달성에 필요한 자금은 얼마인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              4% Rule에 따라 연간 지출의 25배가 필요합니다. 예를 들어 연 지출이 3,000만원이면 7억 5천만원,
              4,000만원이면 10억원이 FIRE Number입니다. 이 금액을 모으면 매년 4%씩 인출해도
              30년 이상 자산이 유지될 확률이 95% 이상입니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              저축률이 높으면 왜 은퇴가 빨라지나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              저축률이 높으면 두 가지 효과가 동시에 작용합니다. 첫째, 저축액이 늘어 자산이 빠르게 증가합니다.
              둘째, 지출이 줄어 필요한 은퇴 자금(FIRE Number) 자체가 감소합니다.
              예를 들어 저축률 50%면 약 17년, 70%면 약 8.5년 만에 은퇴할 수 있습니다(연 7% 수익률 기준).
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              4% Rule은 한국에서도 적용 가능한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              4% Rule은 미국 주식/채권 기준 연구이므로, 한국에서 그대로 적용하기는 어렵습니다.
              한국은 국민연금, 건강보험, 물가상승률이 다르므로 3~3.5% 인출률을 적용하거나,
              국민연금 수령 시기를 고려해 은퇴 계획을 세우는 것이 안전합니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/savings-interest-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">적금 이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">적금/예금 이자와 세후 실수령액 계산</p>
          </Link>
          <Link href="/tools/pension-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">국민연금 수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">예상 국민연금 월 수령액 계산</p>
          </Link>
          <Link href="/tools/salary-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
