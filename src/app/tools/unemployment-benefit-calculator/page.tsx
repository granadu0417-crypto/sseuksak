'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

// 2026년 기준 실업급여 상·하한액
const DAILY_UPPER_LIMIT = 66000; // 1일 상한액
const DAILY_LOWER_LIMIT = 66048; // 1일 하한액 (2026 최저시급 10,320원 × 80% × 8h)

// 소정급여일수 테이블 (나이 × 고용보험 가입기간)
// [1년 미만, 1~3년, 3~5년, 5~10년, 10년 이상]
const BENEFIT_DAYS_UNDER_50: number[] = [120, 150, 180, 210, 240];
const BENEFIT_DAYS_50_OR_OVER: number[] = [120, 180, 210, 240, 270];
const BENEFIT_DAYS_DISABLED: number[] = [120, 180, 210, 240, 270];

function getInsurancePeriodIndex(years: number): number {
  if (years < 1) return 0;
  if (years < 3) return 1;
  if (years < 5) return 2;
  if (years < 10) return 3;
  return 4;
}

function getBenefitDays(age: number, insuranceYears: number, isDisabled: boolean): number {
  const idx = getInsurancePeriodIndex(insuranceYears);
  if (isDisabled) return BENEFIT_DAYS_DISABLED[idx];
  if (age >= 50) return BENEFIT_DAYS_50_OR_OVER[idx];
  return BENEFIT_DAYS_UNDER_50[idx];
}

const INSURANCE_PERIOD_LABELS = ['1년 미만', '1~3년', '3~5년', '5~10년', '10년 이상'];

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR');
}

interface BenefitResult {
  dailyWage: number;
  dailyBenefit: number;
  benefitDays: number;
  totalBenefit: number;
  monthlyBenefit: number;
  isUpperCapped: boolean;
  isLowerCapped: boolean;
}

export default function UnemploymentBenefitCalculatorPage() {
  const [age, setAge] = useState('35');
  const [insuranceYears, setInsuranceYears] = useState('3');
  const [monthlySalary, setMonthlySalary] = useState('3000000');
  const [isDisabled, setIsDisabled] = useState(false);

  const result = useMemo<BenefitResult | null>(() => {
    const ageNum = parseInt(age);
    const yearsNum = parseFloat(insuranceYears);
    const salaryNum = parseFloat(monthlySalary);

    if (!ageNum || ageNum < 18 || ageNum > 80) return null;
    if (isNaN(yearsNum) || yearsNum < 0) return null;
    if (!salaryNum || salaryNum <= 0) return null;

    // 1일 평균임금 = 퇴직 전 3개월 급여 총액 / 90일
    const dailyWage = (salaryNum * 3) / 90;

    // 구직급여일액 = 1일 평균임금 × 60%
    let dailyBenefit = Math.round(dailyWage * 0.6);

    let isUpperCapped = false;
    let isLowerCapped = false;

    // 상한액/하한액 적용
    if (dailyBenefit > DAILY_UPPER_LIMIT) {
      dailyBenefit = DAILY_UPPER_LIMIT;
      isUpperCapped = true;
    }
    if (dailyBenefit < DAILY_LOWER_LIMIT) {
      dailyBenefit = DAILY_LOWER_LIMIT;
      isLowerCapped = true;
    }

    // 소정급여일수
    const benefitDays = getBenefitDays(ageNum, yearsNum, isDisabled);

    // 총 수령액
    const totalBenefit = dailyBenefit * benefitDays;

    // 월 환산액 (30일 기준)
    const monthlyBenefit = dailyBenefit * 30;

    return {
      dailyWage,
      dailyBenefit,
      benefitDays,
      totalBenefit,
      monthlyBenefit,
      isUpperCapped,
      isLowerCapped,
    };
  }, [age, insuranceYears, monthlySalary, isDisabled]);

  const QUICK_SALARY = [
    { label: '200만', value: '2000000' },
    { label: '250만', value: '2500000' },
    { label: '300만', value: '3000000' },
    { label: '350만', value: '3500000' },
    { label: '400만', value: '4000000' },
    { label: '500만', value: '5000000' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="실업급여 계산기" description="실업급여(구직급여) 예상 수령액과 수급 기간을 계산합니다" url="/tools/unemployment-benefit-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">실업급여 계산기</h1>
        <p className="text-gray-600">
          퇴직 전 급여 기준으로 실업급여 예상 수령액을 계산해요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">기본 정보 입력</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">만 나이</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                min={18}
                max={80}
              />
              <span className="text-gray-600 whitespace-nowrap">세</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고용보험 가입기간</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={insuranceYears}
                onChange={(e) => setInsuranceYears(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                min={0}
                max={40}
                step={0.5}
              />
              <span className="text-gray-600 whitespace-nowrap">년</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">퇴직 전 월 평균 급여 (세전)</label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              placeholder="월 급여를 입력하세요"
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={0}
              step={100000}
            />
            <span className="text-gray-600 font-medium">원</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SALARY.map((item) => (
              <button
                key={item.value}
                onClick={() => setMonthlySalary(item.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  monthlySalary === item.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="disabled"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="disabled" className="text-sm text-gray-700">장애인 해당</label>
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">예상 총 수령액</p>
            <p className="text-4xl font-bold text-blue-600">{formatMoney(result.totalBenefit)}원</p>
            <p className="text-sm text-gray-500 mt-1">
              약 {Math.round(result.benefitDays / 30)}개월간 수급
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="text-gray-700 font-medium">1일 평균임금</span>
              <span className="text-lg font-bold text-gray-900">{formatMoney(result.dailyWage)}원</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <div>
                <span className="text-gray-700 font-medium">1일 구직급여액</span>
                {result.isUpperCapped && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">상한 적용</span>
                )}
                {result.isLowerCapped && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">하한 적용</span>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900">{formatMoney(result.dailyBenefit)}원</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="text-gray-700 font-medium">소정급여일수</span>
              <span className="text-lg font-bold text-gray-900">{result.benefitDays}일</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="text-gray-700 font-medium">월 환산액 (30일)</span>
              <span className="text-lg font-bold text-gray-900">{formatMoney(result.monthlyBenefit)}원</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-900 font-bold text-lg">예상 총 수령액</span>
              <span className="text-2xl font-bold text-blue-600">{formatMoney(result.totalBenefit)}원</span>
            </div>
          </div>
        </div>
      )}

      {/* 소정급여일수 표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">소정급여일수 (수급 기간)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">구분</th>
                {INSURANCE_PERIOD_LABELS.map((label) => (
                  <th key={label} className="text-center py-2 px-1 text-gray-600 font-medium text-xs">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-900">50세 미만</td>
                {BENEFIT_DAYS_UNDER_50.map((days, i) => (
                  <td key={i} className="text-center py-2 px-1 text-gray-700">{days}일</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-2 px-2 font-medium text-blue-600">50세 이상</td>
                {BENEFIT_DAYS_50_OR_OVER.map((days, i) => (
                  <td key={i} className="text-center py-2 px-1 text-gray-700">{days}일</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium text-gray-900">장애인</td>
                {BENEFIT_DAYS_DISABLED.map((days, i) => (
                  <td key={i} className="text-center py-2 px-1 text-gray-700">{days}일</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2026년 기준 상/하한액 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">2026년 실업급여 기준</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-600 mb-1">1일 상한액</p>
                <p className="text-lg font-bold text-gray-900">{formatMoney(DAILY_UPPER_LIMIT)}원</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">1일 하한액</p>
                <p className="text-lg font-bold text-gray-900">{formatMoney(DAILY_LOWER_LIMIT)}원</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">급여 산정 비율</p>
                <p className="text-lg font-bold text-gray-900">퇴직 전 평균임금의 60%</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">최소 가입기간</p>
                <p className="text-lg font-bold text-gray-900">180일 이상</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 수급 요건 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">실업급여 수급 요건</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <strong className="text-gray-900">고용보험 가입기간</strong>
              <p>이직일 이전 18개월 중 고용보험 피보험 단위기간이 합산 180일 이상</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <strong className="text-gray-900">비자발적 퇴직</strong>
              <p>경영상 해고, 계약만료, 권고사직 등 비자발적 사유로 퇴직</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <strong className="text-gray-900">재취업 의사와 능력</strong>
              <p>근로 의사와 능력이 있으나 취업하지 못한 상태에서 적극적 구직활동 필요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <strong className="text-gray-900">신청 기한</strong>
              <p>퇴직일 다음 날부터 12개월 이내에 신청 (기한 경과 시 소멸)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 계산 공식 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">계산 공식</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">1일 평균임금</p>
            <p className="font-mono">퇴직 전 3개월 급여 총액 / 90일</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">1일 구직급여액</p>
            <p className="font-mono">1일 평균임금 x 60%</p>
            <p className="text-gray-500 mt-1">상한: {formatMoney(DAILY_UPPER_LIMIT)}원 / 하한: {formatMoney(DAILY_LOWER_LIMIT)}원</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">총 수령액</p>
            <p className="font-mono">1일 구직급여액 x 소정급여일수</p>
          </div>
        </div>
      </div>

      {/* 신청 절차 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">실업급여 신청 절차</h3>
        <div className="space-y-3 text-sm text-gray-700">
          {[
            { step: '이직확인서 처리', desc: '회사에서 고용센터에 이직확인서 제출 (퇴직일로부터 10일 이내)' },
            { step: '워크넷 구직등록', desc: '워크넷(work.go.kr)에서 구직등록 및 수급자격 신청' },
            { step: '수급자격 교육', desc: '고용센터 방문 또는 온라인으로 수급자격 인정 교육 이수' },
            { step: '실업인정 신청', desc: '1~4주 단위로 고용센터에 실업인정 신청 (구직활동 보고)' },
            { step: '급여 수령', desc: '실업인정일로부터 2주 이내 지정 계좌로 입금' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <strong className="text-gray-900">{item.step}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 자발적 퇴직(자진 퇴사)은 원칙적으로 실업급여 수급 대상이 아닙니다.</li>
          <li>* 다만, 이직 사유가 정당한 경우(임금체불, 근로조건 위반 등)는 자발적 퇴직도 수급 가능합니다.</li>
          <li>* 상한액/하한액은 매년 변경되며, 본 계산기는 2026년 기준입니다.</li>
          <li>* 정확한 수급액과 자격 여부는 고용센터(1350)에 문의하세요.</li>
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
                name: '실업급여는 얼마나 받을 수 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '퇴직 전 3개월 평균임금의 60%를 1일 구직급여액으로 받습니다. 2026년 기준 1일 상한액은 66,000원(월 약 198만원), 하한액은 66,048원입니다. 수급 기간은 나이와 고용보험 가입기간에 따라 120~270일입니다.',
                },
              },
              {
                '@type': 'Question',
                name: '자발적 퇴직(자진 퇴사)도 실업급여를 받을 수 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '원칙적으로 자발적 퇴직은 실업급여 대상이 아닙니다. 다만 임금체불, 근로조건 위반, 직장 내 괴롭힘, 통근 곤란(왕복 3시간 이상) 등 정당한 이직 사유가 인정되면 수급 가능합니다. 고용센터(1350)에서 개별 상담을 받아보세요.',
                },
              },
              {
                '@type': 'Question',
                name: '실업급여 신청 방법과 기한은 어떻게 되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '퇴직일 다음 날부터 12개월 이내에 관할 고용센터에 신청해야 합니다. 워크넷(work.go.kr)에서 구직등록 후 고용센터를 방문하여 수급자격 인정 신청을 하면 됩니다. 기한이 지나면 수급권이 소멸되므로 빠른 신청이 중요합니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 상세 가이드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">실업급여 계산 완벽 가이드</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">실업급여 수급 요건</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>고용보험 피보험기간</strong>: 퇴직 전 18개월 중 180일 이상 근무</li>
              <li><strong>비자발적 퇴직</strong>: 권고사직, 계약만료, 정리해고 등 (자발적 퇴사는 원칙적 불가)</li>
              <li><strong>구직활동 의사</strong>: 워크넷 구직등록 후 적극적 구직활동 필요</li>
              <li><strong>재취업 능력</strong>: 근로 능력이 있고 취업 의사가 있어야 함</li>
            </ul>
            <p className="mt-2">자발적 퇴사라도 임금체불, 근로조건 위반, 직장 내 괴롭힘, 통근 곤란(왕복 3시간 이상) 등 정당한 사유가 있으면 수급 가능합니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">지급액 계산</h3>
            <p>1일 구직급여 = 퇴직 전 3개월 평균임금의 60%. 단, 상한액은 1일 66,000원(2025년), 하한액은 최저임금의 80%(1일 64,192원)입니다. 상한과 하한이 거의 비슷하여 대부분의 수급자가 1일 64,000~66,000원 구간에서 받게 됩니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">수급 기간 (나이·가입기간별)</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>50세 미만, 1~3년</strong>: 120일</li>
              <li><strong>50세 미만, 3~5년</strong>: 150일</li>
              <li><strong>50세 미만, 5~10년</strong>: 180일</li>
              <li><strong>50세 미만, 10년 이상</strong>: 210일</li>
              <li><strong>50세 이상 또는 장애인</strong>: 각 구간에서 30일씩 추가 (최대 270일)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">수급 절차</h3>
            <p>퇴직 → 워크넷 구직등록 → 고용센터 방문(수급자격인정 신청) → 수급자격인정 교육(1일) → 1~4주 대기기간 → 2주마다 실업인정(구직활동 보고) → 급여 지급. 실업인정은 온라인으로도 가능합니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">부정수급 주의</h3>
            <p>구직활동을 하지 않으면서 실업급여를 받거나, 취업 사실을 숨기고 수급하면 부정수급에 해당합니다. 적발 시 지급받은 금액 반환 + 추가 2배 징수(총 3배)의 제재를 받습니다. 일용직이나 프리랜서로 일하면서 미신고하는 것도 부정수급입니다.</p>
          </div>
        </div>
      </div>

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">실업급여 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">30세, 월급 300만원, 고용보험 3년 가입</p>
            <p className="text-sm text-gray-600">
              1일 평균임금 10만원, 구직급여 60% = 6만원. 상한액(66,000원) 이내이므로 그대로 적용.
              50세 미만 / 3~5년 가입 = 180일 수급. 총 예상 수령액 약 1,080만원 (월 약 180만원).
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">52세, 월급 400만원, 고용보험 12년 가입</p>
            <p className="text-sm text-gray-600">
              1일 평균임금 약 13.3만원, 60% = 약 8만원이지만 상한액 66,000원 적용.
              50세 이상 / 10년 이상 가입 = 270일(9개월) 수급. 총 예상 수령액 약 1,782만원.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">25세, 월급 220만원, 고용보험 1년 미만</p>
            <p className="text-sm text-gray-600">
              1일 평균임금 약 7.3만원, 60% = 약 4.4만원이지만 하한액 66,048원 적용.
              50세 미만 / 1년 미만 = 120일(4개월) 수급. 총 예상 수령액 약 792만원.
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
              실업급여는 얼마나 받을 수 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              퇴직 전 3개월 평균임금의 60%를 1일 구직급여액으로 받습니다.
              2026년 기준 1일 상한액은 66,000원(월 약 198만원), 하한액은 66,048원입니다.
              수급 기간은 나이와 고용보험 가입기간에 따라 120~270일이며,
              50세 이상이거나 장애인인 경우 더 긴 수급 기간이 적용됩니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              자발적 퇴직(자진 퇴사)도 실업급여를 받을 수 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              원칙적으로 자발적 퇴직은 실업급여 대상이 아닙니다.
              다만 임금체불, 근로조건 위반, 직장 내 괴롭힘, 통근 곤란(왕복 3시간 이상),
              건강 악화 등 정당한 이직 사유가 인정되면 수급 가능합니다.
              고용센터(1350)에서 개별 상담을 받아보세요.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              실업급여 신청 방법과 기한은 어떻게 되나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              퇴직일 다음 날부터 12개월 이내에 관할 고용센터에 신청해야 합니다.
              워크넷(work.go.kr)에서 구직등록 후 고용센터를 방문하여 수급자격 인정 신청을 하면 됩니다.
              온라인으로 수급자격 교육을 이수할 수도 있으며, 1~4주 단위로 실업인정(구직활동 보고)을 해야 급여가 지급됩니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link
            href="/tools/severance-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">퇴직금 계산기</span>
            <p className="text-sm text-gray-500 mt-1">근속기간과 급여로 예상 퇴직금 계산</p>
          </Link>
          <Link
            href="/tools/annual-leave-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">연차 계산기</span>
            <p className="text-sm text-gray-500 mt-1">입사일 기준 연차 발생일수 계산</p>
          </Link>
          <Link
            href="/tools/salary-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
