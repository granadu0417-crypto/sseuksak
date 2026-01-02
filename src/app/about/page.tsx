import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';

export const metadata: Metadata = genMeta({
  title: '소개',
  description: '쓱싹 블로그 소개 - 다양한 주제의 유용한 정보를 제공하는 블로그입니다.',
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
            쓱싹은 일상생활에 유용한 정보를 쉽고 빠르게 전달하는 것을 목표로
            하는 정보 블로그입니다. &apos;쓱싹&apos;이라는 이름처럼, 여러분이 필요로
            하는 정보를 빠르게 찾아볼 수 있도록 다양한 주제의 콘텐츠를
            제공합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            다루는 주제
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>금융/투자</strong>: 재테크, 주식, 신용카드 추천, 대출 정보
            </li>
            <li>
              <strong>보험/법률</strong>: 보험 비교, 법률 상담 정보
            </li>
            <li>
              <strong>건강/의료</strong>: 건강 관리, 다이어트, 영양 정보
            </li>
            <li>
              <strong>IT/테크</strong>: 최신 기술, 가젯 리뷰, 활용 팁
            </li>
            <li>
              <strong>교육/자격증</strong>: 학습 방법, 자격증 준비
            </li>
            <li>
              <strong>생활정보</strong>: 정부 지원금, 절약 팁, 생활 노하우
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            운영 철학
          </h2>
          <p className="text-gray-700 leading-relaxed">
            저희는 정확하고 신뢰할 수 있는 정보만을 제공하기 위해 노력합니다.
            모든 콘텐츠는 철저한 조사와 검증을 거쳐 작성되며, 최신 정보를
            반영하여 지속적으로 업데이트됩니다.
          </p>
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
