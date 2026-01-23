import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '쓱싹 개인정보처리방침 - 개인정보 수집, 이용, 보호에 관한 안내입니다.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 브레드크럼 */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-blue-600">
              홈
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">개인정보처리방침</li>
        </ol>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <p className="text-gray-600 mb-8">
          쓱싹(이하 &quot;사이트&quot;)은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.
          본 개인정보처리방침은 사이트가 수집하는 개인정보의 항목, 수집 및 이용 목적, 보유 및 이용 기간 등을 안내합니다.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          시행일자: 2026년 1월 23일 | 최종 수정일: 2026년 1월 23일
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            1. 수집하는 개인정보 항목
          </h2>
          <p className="text-gray-700 mb-4">
            사이트는 서비스 제공을 위해 다음과 같은 정보를 자동으로 수집할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>접속 기기 정보 (기기 유형, 운영체제, 브라우저 종류)</li>
            <li>접속 로그 (접속 일시, 방문 페이지, 체류 시간)</li>
            <li>IP 주소</li>
            <li>쿠키 정보</li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            * 본 사이트는 회원가입 기능이 없으며, 이름, 이메일 등 직접 입력하는 개인정보는 수집하지 않습니다.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            2. 개인정보 수집 및 이용 목적
          </h2>
          <p className="text-gray-700 mb-4">
            수집된 정보는 다음의 목적으로 이용됩니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>사이트 이용 통계 분석 및 서비스 개선</li>
            <li>콘텐츠 및 광고 맞춤화</li>
            <li>부정 이용 방지 및 보안 강화</li>
            <li>사이트 오류 진단 및 해결</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            3. 개인정보 보유 및 이용 기간
          </h2>
          <p className="text-gray-700 mb-4">
            수집된 개인정보는 수집 목적이 달성되면 지체 없이 파기합니다.
            단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>접속 로그: 최대 3개월 (통신비밀보호법)</li>
            <li>쿠키 정보: 브라우저 종료 시 또는 설정에 따른 만료 시점</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            4. 제3자 제공 및 외부 서비스
          </h2>
          <p className="text-gray-700 mb-4">
            사이트는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
            다만, 다음의 외부 서비스를 사용하고 있으며, 해당 서비스의 개인정보처리방침이 적용됩니다:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
            <p className="text-gray-700 text-sm mb-2">
              사이트 이용 통계 분석을 위해 Google Analytics를 사용합니다.
              Google Analytics는 쿠키를 통해 익명화된 이용 정보를 수집합니다.
            </p>
            <p className="text-gray-600 text-sm">
              Google 개인정보처리방침:{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://policies.google.com/privacy
              </a>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Google AdSense</h3>
            <p className="text-gray-700 text-sm mb-2">
              광고 제공을 위해 Google AdSense를 사용합니다.
              Google AdSense는 쿠키를 사용하여 이용자의 관심사에 기반한 광고를 표시합니다.
            </p>
            <p className="text-gray-600 text-sm">
              Google 광고 설정:{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://adssettings.google.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            5. 쿠키(Cookie) 사용
          </h2>
          <p className="text-gray-700 mb-4">
            사이트는 이용자에게 더 나은 서비스를 제공하기 위해 쿠키를 사용합니다.
          </p>

          <h3 className="font-semibold text-gray-900 mb-2">쿠키란?</h3>
          <p className="text-gray-700 mb-4">
            쿠키는 웹사이트가 이용자의 브라우저에 저장하는 작은 텍스트 파일로,
            사이트 이용 환경을 개선하고 맞춤형 서비스를 제공하는 데 사용됩니다.
          </p>

          <h3 className="font-semibold text-gray-900 mb-2">쿠키 사용 목적</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>이용자 환경 설정 저장</li>
            <li>사이트 이용 통계 분석</li>
            <li>맞춤형 광고 제공</li>
          </ul>

          <h3 className="font-semibold text-gray-900 mb-2">쿠키 거부 방법</h3>
          <p className="text-gray-700">
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
            다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            6. 이용자의 권리
          </h2>
          <p className="text-gray-700 mb-4">
            이용자는 언제든지 다음의 권리를 행사할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>개인정보 수집 및 이용에 대한 동의 철회</li>
            <li>쿠키 저장 거부 (브라우저 설정)</li>
            <li>Google 맞춤 광고 비활성화 (Google 광고 설정)</li>
            <li>개인정보 관련 문의 및 민원 제기</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            7. 개인정보 보호책임자
          </h2>
          <p className="text-gray-700 mb-4">
            개인정보 처리에 관한 업무를 총괄하고 관련 민원을 처리하기 위해
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <span className="font-semibold">담당:</span> 쓱싹 운영팀
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">이메일:</span> contact@sseuksak.com
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            8. 개인정보처리방침 변경
          </h2>
          <p className="text-gray-700">
            본 개인정보처리방침은 법령 및 정책 변경에 따라 수정될 수 있으며,
            변경 사항은 사이트 공지를 통해 안내합니다.
            변경된 방침은 공지 후 7일이 경과한 시점부터 효력이 발생합니다.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            9. 권익침해 구제방법
          </h2>
          <p className="text-gray-700 mb-4">
            개인정보 침해에 대한 피해 구제 및 상담은 아래 기관에 문의하실 수 있습니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              개인정보침해신고센터:{' '}
              <a
                href="https://privacy.kisa.or.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                privacy.kisa.or.kr
              </a>{' '}
              / 118
            </li>
            <li>
              개인정보분쟁조정위원회:{' '}
              <a
                href="https://www.kopico.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.kopico.go.kr
              </a>{' '}
              / 1833-6972
            </li>
            <li>
              대검찰청 사이버수사과:{' '}
              <a
                href="https://www.spo.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.spo.go.kr
              </a>{' '}
              / 1301
            </li>
            <li>
              경찰청 사이버수사국:{' '}
              <a
                href="https://ecrm.police.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ecrm.police.go.kr
              </a>{' '}
              / 182
            </li>
          </ul>
        </section>

        {/* 하단 네비게이션 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              홈으로 돌아가기
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              이용약관 보기
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
