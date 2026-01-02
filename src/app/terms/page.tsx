import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';

export const metadata: Metadata = genMeta({
  title: '이용약관',
  description: '쓱싹 블로그의 이용약관입니다.',
  url: '/terms',
});

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="mb-6">
          본 이용약관(이하 &apos;약관&apos;)은 쓱싹(이하 &apos;본 사이트&apos;)이
          제공하는 서비스의 이용과 관련하여 본 사이트와 이용자 간의 권리,
          의무 및 책임사항을 규정합니다.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제1조 (목적)
          </h2>
          <p>
            본 약관은 본 사이트가 제공하는 콘텐츠 및 서비스의 이용에 관한
            조건과 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제2조 (정의)
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>&apos;이용자&apos;</strong>: 본 사이트에 접속하여 본 약관에 따라
              서비스를 이용하는 자
            </li>
            <li>
              <strong>&apos;콘텐츠&apos;</strong>: 본 사이트에 게시된 글, 이미지,
              동영상 등 모든 정보
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제3조 (서비스의 제공)
          </h2>
          <p className="mb-4">본 사이트는 다음과 같은 서비스를 제공합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>정보성 콘텐츠 제공</li>
            <li>검색 서비스</li>
            <li>기타 본 사이트가 정하는 서비스</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제4조 (이용자의 의무)
          </h2>
          <p className="mb-4">이용자는 다음 행위를 하여서는 안 됩니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>본 사이트의 콘텐츠를 무단으로 복제, 배포, 전송하는 행위</li>
            <li>본 사이트의 운영을 방해하는 행위</li>
            <li>타인의 명예를 훼손하거나 권리를 침해하는 행위</li>
            <li>법령에 위배되는 행위</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제5조 (저작권)
          </h2>
          <p>
            본 사이트에 게시된 모든 콘텐츠에 대한 저작권은 본 사이트 또는
            원저작자에게 있습니다. 이용자는 본 사이트의 사전 동의 없이
            콘텐츠를 상업적 목적으로 사용할 수 없습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제6조 (면책조항)
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              본 사이트는 정보 제공 목적으로 운영되며, 콘텐츠의 정확성,
              신뢰성에 대해 보증하지 않습니다.
            </li>
            <li>
              이용자가 본 사이트의 콘텐츠를 참고하여 행한 결정에 대해
              본 사이트는 책임을 지지 않습니다.
            </li>
            <li>
              본 사이트에 포함된 외부 링크에 대해서는 책임을 지지 않습니다.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제7조 (서비스 중단)
          </h2>
          <p>
            본 사이트는 시스템 점검, 교체, 고장 등 불가피한 사유가 발생한
            경우 서비스 제공을 일시적으로 중단할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제8조 (약관의 변경)
          </h2>
          <p>
            본 약관은 필요한 경우 변경될 수 있으며, 변경된 약관은 본 사이트에
            공지함으로써 효력이 발생합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            제9조 (기타)
          </h2>
          <p>
            본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는
            관련 법령 및 상관례에 따릅니다.
          </p>
        </section>

        <p className="mt-8 text-sm text-gray-500">
          시행일자: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
}
