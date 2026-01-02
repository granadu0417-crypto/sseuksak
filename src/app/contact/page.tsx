import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';

export const metadata: Metadata = genMeta({
  title: '연락처',
  description: '쓱싹 블로그 연락처 - 문의사항이나 제안이 있으시면 연락해 주세요.',
  url: '/contact',
});

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">연락처</h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            문의하기
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            쓱싹 블로그에 대한 문의사항, 제안, 협업 요청 등이 있으시면
            아래 이메일로 연락해 주세요.
          </p>
        </section>

        <section className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            이메일
          </h3>
          <p className="text-gray-700">
            <a
              href="mailto:granadu0417@gmail.com"
              className="text-blue-600 hover:underline"
            >
              granadu0417@gmail.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            문의 유형
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>콘텐츠 관련</strong>: 글 내용에 대한 질문이나 수정 요청
            </li>
            <li>
              <strong>제휴/협업</strong>: 광고 및 협업 제안
            </li>
            <li>
              <strong>기술 문의</strong>: 사이트 이용 중 발생한 기술적 문제
            </li>
            <li>
              <strong>기타</strong>: 그 외 모든 문의사항
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            응답 안내
          </h2>
          <p className="text-gray-700 leading-relaxed">
            문의하신 내용은 확인 후 영업일 기준 1~3일 이내에 답변 드리겠습니다.
            빠른 답변을 위해 문의 내용을 구체적으로 작성해 주시면 감사하겠습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
