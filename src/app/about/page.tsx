import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';

export const metadata: Metadata = genMeta({
  title: '소개',
  description: '쓱싹 소개 - 금융 계산기와 보험·투자·세금 가이드를 공식 자료 기반으로 제공합니다.',
  url: '/about',
});

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">소개</h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            쓱싹에 오신 것을 환영합니다
          </h2>
          <p className="text-gray-700 leading-relaxed">
            쓱싹은 생활 금융 정보를 쉽고 정확하게 전달하는 금융 가이드
            사이트입니다. &apos;쓱싹&apos;이라는 이름처럼, 복잡한 금융 정보를
            빠르게 계산하고 이해할 수 있도록 금융 계산기와 실용 가이드를
            제공합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            주요 서비스
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>금융 계산기</strong>: 연봉 실수령액, 대출 이자, 적금 이자, 증여세, 부가세, 실업급여 등 20여 개 계산 도구
            </li>
            <li>
              <strong>금융/투자 가이드</strong>: 적금 금리 비교, ETF 투자, 재테크 전략, 신용점수 관리 등 공식 자료 기반 정보
            </li>
            <li>
              <strong>보험/법률 가이드</strong>: 자동차보험, 건강보험, 여행자보험 비교 및 가입 가이드
            </li>
            <li>
              <strong>금융 테스트</strong>: 재테크 성향, 소비유형 등 자신의 금융 습관을 알아보는 테스트
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            운영 철학
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            쓱싹은 정확하고 신뢰할 수 있는 금융 정보만을 제공하기 위해
            노력합니다. 모든 콘텐츠는 국세청, 금융감독원, 국민건강보험공단 등
            공식 기관 자료를 기반으로 작성되며, 법령 및 제도 변경 시
            지속적으로 업데이트됩니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            금융 계산기는 실제 세율과 공제 기준을 반영하여 정확한 결과를
            제공하며, 가이드 글은 공식 출처와 함께 팩트체크를 거쳐 게시됩니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            운영자 정보
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <dl className="space-y-3">
              <div className="flex">
                <dt className="w-24 font-medium text-gray-900">운영자</dt>
                <dd className="text-gray-700">쓱싹</dd>
              </div>
              <div className="flex">
                <dt className="w-24 font-medium text-gray-900">설립일</dt>
                <dd className="text-gray-700">2026년 1월</dd>
              </div>
              <div className="flex">
                <dt className="w-24 font-medium text-gray-900">연락처</dt>
                <dd className="text-gray-700">
                  <a href="/contact" className="text-blue-600 hover:underline">
                    문의하기
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            문의하기
          </h2>
          <p className="text-gray-700 leading-relaxed">
            쓱싹에 대해 궁금한 점이나 제안 사항이 있으시면 언제든지{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              연락처 페이지
            </a>
            를 통해 문의해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
