import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">쓱싹</h3>
            <p className="text-gray-600 text-sm">
              금융 계산기와 보험·투자·세금 가이드를 공식 자료 기반으로 제공합니다.
              연봉, 대출, 적금, 증여세 등 생활 금융 정보를 쉽게 알려드립니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              바로가기
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  연락처
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              카테고리
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/finance"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  금융/투자
                </Link>
              </li>
              <li>
                <Link
                  href="/category/insurance"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  보험/법률
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  금융 계산기
                </Link>
              </li>
              <li>
                <Link
                  href="/tests"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  금융 테스트
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 space-y-2">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 쓱싹. All rights reserved.
          </p>
          <p className="text-center text-gray-400 text-xs">
            본 사이트의 정보는 참고용이며, 정확한 내용은 관련 기관 공식 사이트를 확인하시기 바랍니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
