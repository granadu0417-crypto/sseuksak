'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

interface AnnualLeaveResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  isUnderOneYear: boolean;
  monthlyLeave: number; // 1년 미만: 매월 개근 시 발생 일수
  annualLeave: number; // 올해 발생 연차
  seniorityBonus: number; // 근속 추가분
  usedLeave: number;
  remainingLeave: number;
  nextYearLeave: number;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculateAnnualLeave(
  startDate: Date,
  baseDate: Date,
  usedLeave: number
): AnnualLeaveResult {
  // 근속기간 계산
  const diffTime = baseDate.getTime() - startDate.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  let years = baseDate.getFullYear() - startDate.getFullYear();
  let months = baseDate.getMonth() - startDate.getMonth();
  let days = baseDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const isUnderOneYear = totalDays < 365;

  // 1년 미만: 매월 개근 시 1일 (최대 11일)
  const monthlyLeave = isUnderOneYear ? Math.min(years * 12 + months, 11) : 0;

  // 1년 이상: 근속연수 기반 연차
  // 근로기준법 제60조: 1년 이상 시 15일, 3년 이상부터 매 2년마다 1일 추가, 최대 25일
  let annualLeave = 0;
  let seniorityBonus = 0;

  if (!isUnderOneYear) {
    // 근속연수 계산 (만 N년)
    const serviceYears = years;

    if (serviceYears >= 1) {
      annualLeave = 15;
      // 3년차부터 매 2년마다 1일 추가 (최대 25일)
      seniorityBonus = Math.max(0, Math.floor((serviceYears - 1) / 2));
      annualLeave = Math.min(annualLeave + seniorityBonus, 25);
      seniorityBonus = annualLeave - 15;
    }
  }

  const totalLeave = isUnderOneYear ? monthlyLeave : annualLeave;
  const remainingLeave = totalLeave - usedLeave;

  // 내년 예상 연차
  const nextServiceYears = years + 1;
  let nextYearLeave = 15;
  if (nextServiceYears >= 1) {
    const nextBonus = Math.max(0, Math.floor((nextServiceYears - 1) / 2));
    nextYearLeave = Math.min(15 + nextBonus, 25);
  }

  return {
    years,
    months,
    days,
    totalDays,
    isUnderOneYear,
    monthlyLeave,
    annualLeave,
    seniorityBonus,
    usedLeave,
    remainingLeave,
    nextYearLeave,
  };
}

// 빠른 선택 버튼
const QUICK_DATES = [
  { label: '1년 전', years: 1 },
  { label: '3년 전', years: 3 },
  { label: '5년 전', years: 5 },
  { label: '10년 전', years: 10 },
];

// 근속연수별 연차 비교 데이터
function getAnnualLeaveByYear(serviceYears: number): number {
  if (serviceYears < 1) return 0;
  return Math.min(15 + Math.floor(Math.max(serviceYears - 1, 0) / 2), 25);
}

export default function AnnualLeaveCalculatorPage() {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [startDate, setStartDate] = useState(formatDate(oneYearAgo));
  const [baseDate, setBaseDate] = useState(formatDate(today));
  const [usedLeave, setUsedLeave] = useState(0);

  const result = useMemo(() => {
    const start = new Date(startDate);
    const base = new Date(baseDate);
    if (start >= base) return null;
    return calculateAnnualLeave(start, base, usedLeave);
  }, [startDate, baseDate, usedLeave]);

  const handleQuickDate = (yearsAgo: number) => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - yearsAgo);
    setStartDate(formatDate(d));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd
        name="연차 계산기"
        description="입사일 기준 연차 발생일수와 잔여 연차를 계산합니다"
        url="/tools/annual-leave-calculator"
      />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">연차 계산기</h1>
        <p className="text-gray-600">
          입사일을 입력하면 올해 발생 연차와 잔여 연차를 계산해드려요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">근무 정보 입력</h3>

        {/* 입사일 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            입사일
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {/* 빠른 선택 버튼 */}
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_DATES.map((item) => (
              <button
                key={item.years}
                onClick={() => handleQuickDate(item.years)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 기준일 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            기준일 (기본: 오늘)
          </label>
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 사용 연차 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            올해 사용한 연차 (일)
          </label>
          <input
            type="number"
            value={usedLeave}
            onChange={(e) => setUsedLeave(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={0}
            max={25}
          />
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <>
          {/* 핵심 결과 */}
          <div className="rounded-xl border p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">올해 발생 연차</p>
                <p className="text-4xl font-bold text-green-600">
                  {result.isUnderOneYear ? result.monthlyLeave : result.annualLeave}일
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">잔여 연차</p>
                <p className={`text-4xl font-bold ${result.remainingLeave >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {result.remainingLeave}일
                </p>
              </div>
            </div>

            {/* 근속기간 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">근속기간</h4>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {result.years}년 {result.months}개월 {result.days}일
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (총 {result.totalDays.toLocaleString()}일)
                </p>
              </div>
            </div>

            {/* 연차 상세 계산 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">연차 상세 계산</h4>
              <div className="space-y-2 text-sm">
                {result.isUnderOneYear ? (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>근무 개월수</span>
                      <span>{result.years * 12 + result.months}개월</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>월차 (매월 개근 시 1일)</span>
                      <span>{result.monthlyLeave}일</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>기본 연차</span>
                      <span>15일</span>
                    </div>
                    {result.seniorityBonus > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>근속 추가분</span>
                        <span className="text-green-600">+{result.seniorityBonus}일</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                      <span>올해 총 연차</span>
                      <span className="text-green-600">{result.annualLeave}일</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>사용 연차</span>
                  <span className="text-red-500">-{result.usedLeave}일</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                  <span>잔여 연차</span>
                  <span className={result.remainingLeave >= 0 ? 'text-blue-600' : 'text-red-600'}>
                    {result.remainingLeave}일
                  </span>
                </div>
              </div>
            </div>

            {/* 내년 예상 연차 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">내년 예상 연차</span>
                <span className="text-2xl font-bold text-blue-700">{result.nextYearLeave}일</span>
              </div>
              {result.nextYearLeave > result.annualLeave && !result.isUnderOneYear && (
                <p className="text-sm text-blue-600 mt-1">
                  올해 대비 +{result.nextYearLeave - result.annualLeave}일 증가
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* 근속연수별 연차 비교표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">근속연수별 연차일수</h3>
        <p className="text-sm text-gray-500 mb-4">근로기준법 제60조 기준</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">근속연수</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">연차일수</th>
                <th className="text-right py-2 px-2 text-gray-600 font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              {[
                { year: 0, label: '1년 미만', note: '매월 1일 (최대 11일)' },
                { year: 1, label: '1~2년' },
                { year: 3, label: '3~4년' },
                { year: 5, label: '5~6년' },
                { year: 7, label: '7~8년' },
                { year: 9, label: '9~10년' },
                { year: 11, label: '11~12년' },
                { year: 13, label: '13~14년' },
                { year: 15, label: '15~16년' },
                { year: 17, label: '17~18년' },
                { year: 19, label: '19~20년' },
                { year: 21, label: '21년 이상' },
              ].map((item) => {
                const leave = item.year === 0 ? 11 : getAnnualLeaveByYear(item.year);
                const isCurrentRange = result && !result.isUnderOneYear && item.year > 0
                  ? result.years >= item.year && result.years < item.year + 2
                  : result?.isUnderOneYear && item.year === 0;
                return (
                  <tr
                    key={item.year}
                    className={`border-b border-gray-100 ${isCurrentRange ? 'bg-blue-50' : ''}`}
                  >
                    <td className={`py-2 px-2 ${isCurrentRange ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                      {item.label}
                      {isCurrentRange && ' (현재)'}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-green-600">
                      {item.year === 0 ? '최대 11일' : `${leave}일`}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-500 text-xs">
                      {item.note || (item.year >= 21 ? '상한' : item.year >= 3 ? `+${Math.floor((item.year - 1) / 2)}일` : '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* <strong>1년 미만</strong>: 1개월 개근 시 1일의 유급휴가 발생 (최대 11일, 근로기준법 제60조 2항)</li>
          <li>* <strong>1년 이상</strong>: 80% 이상 출근 시 15일의 유급휴가 (근로기준법 제60조 1항)</li>
          <li>* <strong>3년 이상</strong>: 최초 1년을 초과한 매 2년마다 1일 추가, 최대 25일 (제60조 4항)</li>
          <li>* 연차를 사용하지 않으면 <strong>연차수당</strong>으로 전환 가능합니다.</li>
          <li>* 회사가 <strong>연차촉진제도</strong>를 시행하면 미사용 연차수당 지급 의무가 면제될 수 있습니다.</li>
          <li>* 실제 연차는 회사의 회계연도 기준, 취업규칙 등에 따라 달라질 수 있습니다.</li>
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
                name: '연차는 몇 개 발생하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '근로기준법 제60조에 따라 1년 미만 근무자는 매월 개근 시 1일(최대 11일), 1년 이상 근무 시 80% 이상 출근하면 15일이 발생합니다. 3년 이상부터 매 2년마다 1일씩 추가되어 최대 25일까지 늘어납니다.',
                },
              },
              {
                '@type': 'Question',
                name: '사용하지 않은 연차는 어떻게 되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '미사용 연차는 연차수당으로 전환하여 금전 보상을 받을 수 있습니다. 다만, 회사가 연차촉진제도를 시행한 경우(사용 시기를 정해달라는 서면 통보 등)에는 미사용 연차수당 지급 의무가 면제될 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '입사 첫 해에도 연차를 쓸 수 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '네. 2018년 근로기준법 개정으로 입사 1년 미만 근로자도 1개월 개근 시 1일의 유급휴가가 발생합니다. 최대 11일까지 사용할 수 있으며, 이 월차는 1년 차에 발생하는 15일에서 차감되지 않습니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">연차 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">2024년 1월 입사, 현재 2년 2개월 근무</p>
            <p className="text-sm text-gray-600">
              만 2년 이상이므로 올해 연차는 15일. 아직 3년 미만이라 근속 추가분은 없습니다.
              5일 사용했다면 잔여 연차는 10일이며, 내년에도 15일이 발생합니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">2018년 3월 입사, 8년차 직장인</p>
            <p className="text-sm text-gray-600">
              근속 8년이므로 기본 15일 + 근속 추가 3일 = 총 18일의 연차가 발생합니다.
              3년 이상부터 매 2년마다 1일이 추가되므로, 10년차에는 19일이 됩니다.
            </p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">입사 6개월 차 신입사원</p>
            <p className="text-sm text-gray-600">
              1년 미만이므로 매월 개근 시 1일씩 발생, 현재까지 최대 6일 사용 가능.
              1년이 되면 15일의 연차가 새로 발생하며, 이전에 사용한 월차와 별도입니다.
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
              연차는 몇 개 발생하나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              근로기준법 제60조에 따라 1년 미만 근무자는 매월 개근 시 1일(최대 11일),
              1년 이상 근무 시 80% 이상 출근하면 15일이 발생합니다.
              3년 이상부터 매 2년마다 1일씩 추가되어 최대 25일까지 늘어납니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              사용하지 않은 연차는 어떻게 되나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              미사용 연차는 연차수당으로 전환하여 금전 보상을 받을 수 있습니다.
              다만, 회사가 연차촉진제도를 시행한 경우(사용 시기를 정해달라는 서면 통보 등)에는
              미사용 연차수당 지급 의무가 면제될 수 있습니다. 연차촉진 절차가 적법하게 이뤄졌는지 확인해보세요.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              입사 첫 해에도 연차를 쓸 수 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              네. 2018년 근로기준법 개정으로 입사 1년 미만 근로자도 1개월 개근 시 1일의 유급휴가가 발생합니다.
              최대 11일까지 사용할 수 있으며, 이 월차는 1년 차에 발생하는 15일에서 차감되지 않습니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구/글 링크 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 계산기</h3>
        <div className="space-y-2">
          <Link
            href="/tools/severance-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">퇴직금 계산기</span>
            <p className="text-sm text-gray-500 mt-1">근속기간과 급여로 예상 퇴직금을 계산해요</p>
          </Link>
          <Link
            href="/tools/weekly-holiday-pay-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">주휴수당 계산기</span>
            <p className="text-sm text-gray-500 mt-1">주 15시간 이상 근무 시 받는 주휴수당을 계산해요</p>
          </Link>
          <Link
            href="/tools/unemployment-benefit-calculator"
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">실업급여 계산기</span>
            <p className="text-sm text-gray-500 mt-1">실업급여 예상 수령액과 수급 기간을 계산해요</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
