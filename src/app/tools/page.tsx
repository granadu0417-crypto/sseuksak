import Link from 'next/link';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '유용한 도구 모음',
  description: '대출이자 계산기, 시급 계산기, 퇴직금 계산기, 주휴수당 계산기, BMI 계산기, 연봉 실수령액 계산기, 연말정산 환급액 계산기, 적금이자 계산기, 실업급여 계산기, 부가세 계산기, 나이 계산기, 평수 계산기 등 생활에 유용한 도구들을 무료로 이용하세요.',
};

const financeTools = [
  {
    slug: 'loan-calculator',
    title: '대출이자 계산기',
    description: '대출 조건별 월 상환금과 총 이자를 비교 계산해요',
  },
  {
    slug: 'hourly-wage-calculator',
    title: '시급 계산기',
    description: '시급↔월급↔연봉 변환, 2026년 최저시급 비교',
  },
  {
    slug: 'severance-calculator',
    title: '퇴직금 계산기',
    description: '근속기간과 급여로 예상 퇴직금과 실수령액을 계산해요',
  },
  {
    slug: 'weekly-holiday-pay-calculator',
    title: '주휴수당 계산기',
    description: '주 15시간 이상 근무 시 받는 주휴수당을 계산해요',
  },
  {
    slug: 'tax-refund-calculator',
    title: '연말정산 환급액 계산기',
    description: '2025년 귀속 연말정산 예상 환급액을 계산해요',
  },
  {
    slug: 'salary-calculator',
    title: '연봉 실수령액 계산기',
    description: '4대보험, 소득세 공제 후 실제 받는 월급을 계산해요',
  },
  {
    slug: 'true-hourly-wage',
    title: '진짜 시급 계산기',
    description: '출퇴근, 야근 포함한 실제 시급을 계산해요',
  },
  {
    slug: 'subscription-audit',
    title: '구독 서비스 총액 계산기',
    description: '내가 쓰는 구독 서비스 총액이 얼마인지 확인해요',
  },
  {
    slug: 'fire-calculator',
    title: 'FIRE 조기은퇴 계산기',
    description: '저축률과 투자수익률로 몇 살에 은퇴 가능한지 계산해요',
  },
  {
    slug: 'livelihood-benefit-calculator',
    title: '생계급여 계산기',
    description: '2026년 기준 소득인정액과 예상 생계급여를 계산해요',
  },
  {
    slug: 'gift-tax-calculator',
    title: '증여세 계산기',
    description: '증여금액과 관계에 따른 증여세를 계산해요',
  },
  {
    slug: 'vat-calculator',
    title: '부가세 계산기',
    description: '공급가액에서 부가세를 계산하거나 합계금액에서 역산해요',
  },
  {
    slug: 'savings-interest-calculator',
    title: '적금 이자 계산기',
    description: '적금/예금 이자와 세후 실수령액을 계산해요',
  },
  {
    slug: 'unemployment-benefit-calculator',
    title: '실업급여 계산기',
    description: '실업급여 예상 수령액과 수급 기간을 계산해요',
  },
];

const lifeTools = [
  {
    slug: 'bmi-calculator',
    title: 'BMI 계산기',
    description: '키와 체중으로 비만도를 측정하고 건강 위험을 확인해요',
  },
  {
    slug: 'alcohol-calculator',
    title: '알코올 분해 시간 계산기',
    description: '음주 후 운전 가능 시간을 계산해요',
  },
  {
    slug: 'sleep-calculator',
    title: '수면 사이클 계산기',
    description: '몇 시에 자면 몇 시에 일어나야 개운한지 알려드려요',
  },
  {
    slug: 'life-in-weeks',
    title: 'Life in Weeks',
    description: '당신의 인생을 주 단위로 시각화해요',
  },
  {
    slug: 'pyeong-calculator',
    title: '평수 계산기',
    description: '평수↔제곱미터를 간편하게 변환해요',
  },
  {
    slug: 'age-calculator',
    title: '나이 계산기',
    description: '생년월일로 만 나이, 한국 나이, 띠, 별자리를 확인해요',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '도구' }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">유용한 도구 모음</h1>
        <p className="text-gray-600">생활에 도움이 되는 계산기와 도구들을 무료로 이용하세요.</p>
      </div>

      {/* 금융 계산기 */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">금융 계산기</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {financeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 라이프 도구 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">라이프 도구</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {lifeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
