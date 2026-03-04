import Link from 'next/link';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '금융 계산기 모음',
  description: '대출이자, 연봉 실수령액, 적금이자, 증여세, 부가세, 실업급여, 퇴직금, 시급, 주휴수당, FIRE 조기은퇴 등 금융 계산기를 무료로 이용하세요.',
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
  {
    slug: 'health-insurance-calculator',
    title: '건강보험료 계산기',
    description: '직장가입자 건강보험료와 4월 정산 예상액을 계산해요',
  },
  {
    slug: 'pension-calculator',
    title: '국민연금 수령액 계산기',
    description: '가입 기간과 소득으로 예상 국민연금 월 수령액을 계산해요',
  },
  {
    slug: 'rent-conversion-calculator',
    title: '전월세 전환율 계산기',
    description: '전세↔월세 전환율과 적정 월세를 계산해요',
  },
  {
    slug: 'income-tax-calculator',
    title: '종합소득세 계산기',
    description: '프리랜서·사업자 종합소득세 예상 세액을 계산해요',
  },
  {
    slug: 'annual-leave-calculator',
    title: '연차 계산기',
    description: '입사일 기준 연차 발생일수와 잔여 연차를 계산합니다',
  },
];

const lifeTools = [
  {
    slug: 'pyeong-calculator',
    title: '평수 계산기',
    description: '평수↔제곱미터를 간편하게 변환해요 (부동산 거래 필수)',
  },
  {
    slug: 'age-calculator',
    title: '나이 계산기',
    description: '생년월일로 만 나이, 한국 나이를 확인해요 (보험·연금 기준)',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '도구' }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">금융 계산기 모음</h1>
        <p className="text-gray-600">연봉, 대출, 세금, 투자 등 금융 계산기를 무료로 이용하세요.</p>
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

      {/* 생활 계산기 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">생활 계산기</h2>
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
