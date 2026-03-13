'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 기준중위소득 32% (생계급여 선정기준)
const BENEFIT_STANDARDS: Record<number, number> = {
  1: 820556,
  2: 1343773,
  3: 1714892,
  4: 2078316,
  5: 2418150,
  6: 2738305,
};

// 2026년 기준중위소득 (참고용)
const MEDIAN_INCOME: Record<number, number> = {
  1: 2564238,
  2: 4199292,
  3: 5359036,
  4: 6494738,
  5: 7556719,
  6: 8555952,
};

// 지역별 기본재산액 공제
const BASIC_PROPERTY_DEDUCTION: Record<string, number> = {
  seoul: 99000000,      // 서울: 9,900만원
  gyeonggi: 80000000,   // 경기: 8,000만원
  metro: 77000000,      // 광역시·세종·창원: 7,700만원
  other: 53000000,      // 그 외: 5,300만원
};

// 소득환산율 (월)
const CONVERSION_RATES = {
  housing: 0.0104,      // 주거용 재산: 1.04%
  general: 0.0417,      // 일반재산: 4.17%
  financial: 0.0626,    // 금융재산: 6.26%
  car: 1.0,             // 자동차: 100%
};

interface CalculationResult {
  incomeEvaluation: number;
  propertyConversion: number;
  totalRecognizedIncome: number;
  benefitStandard: number;
  expectedBenefit: number;
  isEligible: boolean;
  medianIncomePercent: number;
}

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

export default function LivelihoodBenefitCalculator() {
  // 가구 정보
  const [householdSize, setHouseholdSize] = useState(1);
  const [region, setRegion] = useState('other');

  // 소득 정보
  const [earnedIncome, setEarnedIncome] = useState(0); // 근로소득
  const [otherIncome, setOtherIncome] = useState(0);   // 기타소득
  const [isYouth, setIsYouth] = useState(false);       // 34세 이하 청년
  const [age, setAge] = useState(30);

  // 재산 정보
  const [housingProperty, setHousingProperty] = useState(0);   // 주거용 재산
  const [generalProperty, setGeneralProperty] = useState(0);   // 일반재산
  const [financialProperty, setFinancialProperty] = useState(0); // 금융재산
  const [carValue, setCarValue] = useState(0);                  // 자동차
  const [debt, setDebt] = useState(0);                          // 부채

  const result = useMemo<CalculationResult>(() => {
    // 1. 소득평가액 계산
    let incomeEvaluation = 0;

    // 근로소득 공제 (30%)
    let earnedIncomeAfterDeduction = earnedIncome * 0.7;

    // 청년 추가 공제 (34세 이하: 60만원 + 나머지의 30%)
    if (isYouth && age <= 34) {
      const afterBasicDeduction = Math.max(earnedIncome - 600000, 0);
      earnedIncomeAfterDeduction = afterBasicDeduction * 0.7;
    }

    incomeEvaluation = earnedIncomeAfterDeduction + otherIncome;

    // 2. 재산의 소득환산액 계산
    const basicDeduction = BASIC_PROPERTY_DEDUCTION[region];
    const totalProperty = housingProperty + generalProperty + financialProperty + carValue;

    // 재산 종류별 환산
    const housingConversion = Math.max(housingProperty - basicDeduction, 0) * CONVERSION_RATES.housing;
    const generalConversion = generalProperty * CONVERSION_RATES.general;
    const financialConversion = financialProperty * CONVERSION_RATES.financial;
    const carConversion = carValue * CONVERSION_RATES.car;

    // 부채 공제 적용 (일반재산에서 우선 공제)
    let remainingDebt = debt;
    let adjustedGeneralConversion = generalConversion;
    if (remainingDebt > 0 && generalProperty > 0) {
      const debtDeduction = Math.min(remainingDebt, generalProperty);
      adjustedGeneralConversion = Math.max(generalProperty - debtDeduction, 0) * CONVERSION_RATES.general;
      remainingDebt -= debtDeduction;
    }

    const propertyConversion = housingConversion + adjustedGeneralConversion + financialConversion + carConversion;

    // 3. 소득인정액 계산
    const totalRecognizedIncome = incomeEvaluation + propertyConversion;

    // 4. 생계급여 선정기준
    const benefitStandard = BENEFIT_STANDARDS[householdSize] || BENEFIT_STANDARDS[6];
    const medianIncome = MEDIAN_INCOME[householdSize] || MEDIAN_INCOME[6];

    // 5. 수급 자격 및 예상 급여
    const isEligible = totalRecognizedIncome <= benefitStandard;
    const expectedBenefit = isEligible ? Math.max(benefitStandard - totalRecognizedIncome, 0) : 0;
    const medianIncomePercent = (totalRecognizedIncome / medianIncome) * 100;

    return {
      incomeEvaluation,
      propertyConversion,
      totalRecognizedIncome,
      benefitStandard,
      expectedBenefit,
      isEligible,
      medianIncomePercent,
    };
  }, [householdSize, region, earnedIncome, otherIncome, isYouth, age, housingProperty, generalProperty, financialProperty, carValue, debt]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ToolJsonLd name="생계급여 계산기" description="2026년 기준 소득인정액과 예상 생계급여를 계산합니다" url="/tools/livelihood-benefit-calculator" />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">&gt;</span>
        <Link href="/tools" className="hover:text-blue-600">도구</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">생계급여 계산기</span>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">2026년 생계급여 계산기</h1>
        <p className="text-gray-600">
          소득인정액을 계산하고 생계급여 수급 자격을 확인해보세요
        </p>
      </div>

      {/* 가구 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">가구 정보</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가구원 수
            </label>
            <select
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}인 가구</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              거주 지역
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="seoul">서울 (공제 9,900만원)</option>
              <option value="gyeonggi">경기 (공제 8,000만원)</option>
              <option value="metro">광역시·세종·창원 (공제 7,700만원)</option>
              <option value="other">그 외 지역 (공제 5,300만원)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 소득 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">월 소득 정보</h3>

        <div className="mb-4">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={isYouth}
              onChange={(e) => setIsYouth(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              34세 이하 청년 (추가 60만원 + 30% 공제)
            </span>
          </label>
          {isYouth && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                나이
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={19}
                max={34}
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 근로소득
            </label>
            <input
              type="number"
              value={earnedIncome || ''}
              onChange={(e) => setEarnedIncome(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">30% 자동 공제됨</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 기타소득 (연금, 이자 등)
            </label>
            <input
              type="number"
              value={otherIncome || ''}
              onChange={(e) => setOtherIncome(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 재산 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">재산 정보 (현재 시가)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주거용 재산 (자가 주택)
            </label>
            <input
              type="number"
              value={housingProperty || ''}
              onChange={(e) => setHousingProperty(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">환산율 1.04%/월</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              일반재산 (토지, 상가 등)
            </label>
            <input
              type="number"
              value={generalProperty || ''}
              onChange={(e) => setGeneralProperty(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">환산율 4.17%/월</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              금융재산 (예금, 보험 등)
            </label>
            <input
              type="number"
              value={financialProperty || ''}
              onChange={(e) => setFinancialProperty(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">환산율 6.26%/월</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자동차 (시가)
            </label>
            <input
              type="number"
              value={carValue || ''}
              onChange={(e) => setCarValue(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">환산율 100%/월 (예외 있음)</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부채 (대출금 등)
            </label>
            <input
              type="number"
              value={debt || ''}
              onChange={(e) => setDebt(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">재산에서 공제됨</p>
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className={`rounded-xl border p-6 mb-6 ${
        result.isEligible
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
      }`}>
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-1">예상 월 생계급여</p>
          <p className={`text-4xl font-bold ${result.isEligible ? 'text-green-600' : 'text-red-600'}`}>
            {result.isEligible ? formatMoney(result.expectedBenefit) : '수급 불가'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            소득인정액: {formatMoney(result.totalRecognizedIncome)} (기준중위소득의 {result.medianIncomePercent.toFixed(1)}%)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">소득평가액</span>
              <span className="font-bold text-gray-900">{formatMoney(result.incomeEvaluation)}</span>
            </div>
            <p className="text-xs text-gray-500">근로소득 공제 후 금액 + 기타소득</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">재산의 소득환산액</span>
              <span className="font-bold text-gray-900">{formatMoney(result.propertyConversion)}</span>
            </div>
            <p className="text-xs text-gray-500">
              (재산 - 기본재산액 {formatMoney(BASIC_PROPERTY_DEDUCTION[region])} - 부채) × 환산율
            </p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">소득인정액</span>
              <span className="font-bold text-gray-900">{formatMoney(result.totalRecognizedIncome)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{householdSize}인 가구 선정기준</span>
              <span className="font-bold text-blue-600">{formatMoney(result.benefitStandard)}</span>
            </div>
          </div>
        </div>

        {result.isEligible ? (
          <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
            <p className="text-sm text-green-800">
              소득인정액이 선정기준 이하로 <strong>생계급여 수급 가능</strong>합니다.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-red-100 rounded-lg text-center">
            <p className="text-sm text-red-800">
              소득인정액이 선정기준을 초과하여 <strong>생계급여 수급이 어렵습니다</strong>.
            </p>
          </div>
        )}
      </div>

      {/* 2026년 선정기준표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">2026년 급여별 선정기준 (기준중위소득 대비)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">가구원</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">생계급여 (32%)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">의료급여 (40%)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">주거급여 (48%)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">교육급여 (50%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4].map((size) => {
                const median = MEDIAN_INCOME[size];
                const isSelected = size === householdSize;
                return (
                  <tr key={size} className={isSelected ? 'bg-blue-50' : ''}>
                    <td className={`px-3 py-2 ${isSelected ? 'font-bold text-blue-600' : ''}`}>{size}인</td>
                    <td className="px-3 py-2 text-right">{formatMoney(Math.round(median * 0.32))}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(Math.round(median * 0.40))}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(Math.round(median * 0.48))}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(Math.round(median * 0.50))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2026년 변경사항 */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">2026년 주요 변경사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">1.</span>
            <span><strong>부양의무자 기준 폐지</strong>: 본인 가구의 소득·재산만으로 심사</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">2.</span>
            <span><strong>청년 소득공제 확대</strong>: 대상 연령 29세 → 34세, 공제금 40만원 → 60만원</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">3.</span>
            <span><strong>기준중위소득 6.51% 인상</strong>: 역대 최대 인상률</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">4.</span>
            <span><strong>자동차 기준 완화</strong>: 500만원 미만 소형차는 일반재산 환산</span>
          </li>
        </ul>
      </div>

      {/* 참고 사항 */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <h3 className="font-semibold text-amber-800 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>* 본 계산기는 참고용이며, 실제 수급 여부는 주민센터 상담을 통해 확인하세요.</li>
          <li>* 가구특성별 지출비용, 장애인/노인 공제 등은 반영되지 않았습니다.</li>
          <li>* 자동차 예외 조건(생업용, 장애인 차량 등)은 별도 확인이 필요합니다.</li>
          <li>* 상담 전화: 보건복지상담센터 <strong>129</strong></li>
        </ul>
        <div className="mt-4 flex gap-3">
          <a
            href="https://www.bokjiro.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-800 hover:text-amber-900 underline"
          >
            복지로 바로가기
          </a>
          <a
            href="https://www.mohw.go.kr/menu.es?mid=a10708010300"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-800 hover:text-amber-900 underline"
          >
            보건복지부 수급자 선정기준
          </a>
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
                name: '생계급여 수급 조건은 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '2026년 기준 소득인정액이 기준중위소득의 32% 이하인 가구가 대상입니다. 1인 가구 약 82만원, 4인 가구 약 208만원 이하입니다. 소득인정액은 소득평가액(근로소득 30% 공제 후)과 재산의 소득환산액을 합산하여 계산합니다.',
                },
              },
              {
                '@type': 'Question',
                name: '생계급여는 얼마나 받을 수 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '생계급여 = 선정기준액 - 소득인정액입니다. 예를 들어 1인 가구 소득인정액이 30만원이면, 선정기준 82만원 - 30만원 = 월 52만원을 받습니다. 소득이 전혀 없는 1인 가구는 최대 월 약 82만원을 받을 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '부양의무자 기준이 폐지되었나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '2026년 현재 생계급여의 부양의무자 기준은 사실상 폐지되었습니다. 본인 가구의 소득과 재산만으로 수급 자격을 심사합니다. 단, 부양의무자 가구에 연 1억원 이상 고소득자나 9억원 이상 재산 보유자가 있는 경우는 예외적으로 제한될 수 있습니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">생계급여 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">무소득 1인 가구 (지방 거주)</p>
            <p className="text-sm text-gray-600">
              근로소득 0원, 재산 없음. 소득인정액 0원으로 1인 가구 선정기준 약 82만원 전액 수급 가능.
              의료급여, 주거급여, 교육급여도 함께 신청할 수 있습니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">28세 청년, 월 근로소득 100만원 (서울 거주)</p>
            <p className="text-sm text-gray-600">
              청년 추가공제 적용: (100만원 - 60만원) x 70% = 28만원 소득평가액.
              재산이 적으면 소득인정액이 선정기준(82만원) 이하로 차액만큼 수급 가능합니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">4인 가구, 월 소득 150만원, 전세 8,000만원 (경기)</p>
            <p className="text-sm text-gray-600">
              근로소득 공제 후 소득평가액 105만원. 주거재산 8,000만원에서 기본재산액 8,000만원 공제 = 0원.
              소득인정액 약 105만원, 4인 가구 선정기준 약 208만원. 차액 약 103만원 수급 가능합니다.
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
              생계급여 수급 조건은 무엇인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              2026년 기준 소득인정액이 기준중위소득의 32% 이하인 가구가 대상입니다.
              1인 가구 약 82만원, 4인 가구 약 208만원 이하입니다.
              소득인정액은 소득평가액(근로소득 30% 공제 후)과 재산의 소득환산액을 합산하여 계산합니다.
              주민센터에서 신청하면 약 30일 내에 결과를 통보받습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              생계급여는 얼마나 받을 수 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              생계급여 = 선정기준액 - 소득인정액입니다.
              예를 들어 1인 가구 소득인정액이 30만원이면, 선정기준 82만원 - 30만원 = 월 52만원을 받습니다.
              소득이 전혀 없는 1인 가구는 최대 월 약 82만원을 받을 수 있습니다.
              생계급여 외에도 의료급여(40%), 주거급여(48%), 교육급여(50%) 등도 함께 신청 가능합니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              부양의무자 기준이 폐지되었나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              2026년 현재 생계급여의 부양의무자 기준은 사실상 폐지되었습니다.
              본인 가구의 소득과 재산만으로 수급 자격을 심사합니다.
              단, 부양의무자 가구에 연 1억원 이상 고소득자나 9억원 이상 재산 보유자가 있는 경우는
              예외적으로 제한될 수 있습니다. 자세한 사항은 보건복지상담센터(129)에 문의하세요.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
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
          <Link href="/tools/pension-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">국민연금 수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">예상 국민연금 월 수령액 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
