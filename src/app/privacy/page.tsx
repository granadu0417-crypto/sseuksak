import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/metadata';

export const metadata: Metadata = genMeta({
  title: '개인정보처리방침',
  description: '쓱싹 블로그의 개인정보처리방침입니다.',
  url: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="mb-6">
          쓱싹(이하 &apos;본 사이트&apos;)은 이용자의 개인정보를 중요시하며,
          개인정보보호법을 준수하고 있습니다. 본 개인정보처리방침은 본 사이트가
          제공하는 서비스 이용과 관련하여 수집하는 개인정보의 처리에 관한 사항을
          규정합니다.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. 수집하는 개인정보
          </h2>
          <p className="mb-4">본 사이트는 다음과 같은 개인정보를 수집할 수 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>방문 기록, 접속 IP 주소, 쿠키, 서비스 이용 기록</li>
            <li>문의 시 제공되는 이메일 주소 및 문의 내용</li>
            <li>기기 정보, 브라우저 정보</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. 개인정보의 수집 및 이용 목적
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>서비스 제공 및 개선</li>
            <li>이용자 문의에 대한 응답</li>
            <li>통계 분석 및 서비스 품질 향상</li>
            <li>법적 의무 이행</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. 쿠키의 사용
          </h2>
          <p className="mb-4">
            본 사이트는 서비스 제공을 위해 쿠키를 사용합니다. 쿠키는 웹사이트
            운영에 필요한 정보를 저장하며, 이용자는 브라우저 설정을 통해
            쿠키 저장을 거부할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. 제3자 서비스
          </h2>
          <p className="mb-4">
            본 사이트는 다음과 같은 제3자 서비스를 사용합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google Analytics</strong>: 방문자 통계 분석
            </li>
            <li>
              <strong>Google AdSense</strong>: 광고 서비스 제공
            </li>
          </ul>
          <p className="mt-4">
            이러한 서비스는 각자의 개인정보처리방침에 따라 정보를 처리합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Google AdSense 안내
          </h2>
          <p className="mb-4">
            본 사이트는 Google AdSense를 통해 광고를 게재합니다. Google은
            이용자의 관심사에 맞는 광고를 표시하기 위해 쿠키를 사용할 수 있습니다.
          </p>
          <p>
            광고 개인 최적화를 원하지 않는 경우{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google 광고 설정
            </a>
            에서 설정을 변경할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. 개인정보의 보안
          </h2>
          <p>
            본 사이트는 개인정보 보호를 위해 SSL 암호화 통신을 사용하며,
            개인정보에 대한 접근을 제한하고 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. 이용자의 권리
          </h2>
          <p className="mb-4">이용자는 다음과 같은 권리를 가집니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>개인정보 열람 요청</li>
            <li>개인정보 정정 또는 삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
          <p className="mt-4">
            위 권리 행사를 원하시면{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              연락처 페이지
            </a>
            를 통해 요청해 주세요.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. 개인정보처리방침의 변경
          </h2>
          <p>
            본 개인정보처리방침은 법령의 변경이나 서비스 변경에 따라 수정될 수
            있으며, 변경 시 본 페이지를 통해 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. 문의처
          </h2>
          <p>
            개인정보 처리에 관한 문의사항은{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              연락처 페이지
            </a>
            를 통해 문의해 주세요.
          </p>
        </section>

        <p className="mt-8 text-sm text-gray-500">
          시행일자: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
}
