import Link from 'next/link';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '금융 계산기 모음',
  description: '대출이자, 연봉 실수령액, 적금이자, 증여세, 부가세, 실업급여, 퇴직금, 시급, 주휴수당, FIRE 조기은퇴 등 금융 계산기를 무료로 이용하세요.',
};

const simulators = [
  {
    slug: 'housing-cost-simulator',
    title: '전세 vs 월세 vs 매매 비교',
    description: '장기 주거비용을 차트로 비교해 가장 유리한 선택을 확인해요',
    tag: '시뮬레이터',
  },
  {
    slug: 'loan-repayment-simulator',
    title: '대출 상환 전략 비교',
    description: '원리금균등·원금균등·만기일시 3가지 상환방식을 차트로 비교해요',
    tag: '시뮬레이터',
  },
  {
    slug: 'car-cost-simulator',
    title: '자동차 구매 vs 리스 vs 장기렌트 비교',
    description: '구매·리스·장기렌트 3가지 방식의 장기 비용을 차트로 비교해요',
    tag: '시뮬레이터',
  },
  {
    slug: 'savings-goal-simulator',
    title: '목돈 모으기 시뮬레이터',
    description: '적금만·적금+투자·투자 중심 3가지 전략으로 목돈 모으기를 비교해요',
    tag: '시뮬레이터',
  },
];

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
    slug: 'dsr-calculator',
    title: 'DSR 계산기',
    description: '총부채원리금상환비율(DSR)과 추가 대출 가능 금액을 계산해요',
  },
  {
    slug: 'income-tax-calculator',
    title: '종합소득세 계산기',
    description: '프리랜서·사업자 종합소득세 예상 세액을 계산해요',
  },
  {
    slug: 'acquisition-tax-calculator',
    title: '취득세 계산기',
    description: '1주택·다주택 취득세를 자동 계산, 감면 혜택까지 반영해요',
  },
  {
    slug: 'annual-leave-calculator',
    title: '연차 계산기',
    description: '입사일 기준 연차 발생일수와 잔여 연차를 계산합니다',
  },
];

const lifeTools = [
  {
    slug: 'electricity-calculator',
    title: '전기세 계산기',
    description: '누진제 구간별 전기요금을 간편하게 계산해요',
  },
  {
    slug: 'car-tax-calculator',
    title: '자동차세 계산기',
    description: '배기량과 연식으로 연간 자동차세를 계산해요',
  },
  {
    slug: 'compound-interest-calculator',
    title: '복리 계산기',
    description: '복리 효과로 자산이 얼마나 불어나는지 시뮬레이션해요',
  },
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

      {/* 시뮬레이터 */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">시뮬레이터</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {simulators.map((sim) => (
            <Link
              key={sim.slug}
              href={`/tools/${sim.slug}`}
              className="block p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{sim.title}</h3>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{sim.tag}</span>
              </div>
              <p className="text-sm text-gray-600">{sim.description}</p>
            </Link>
          ))}
        </div>
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
