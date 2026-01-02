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
              다양한 주제의 유용한 정보를 제공하는 블로그입니다.
              금융, 건강, IT 등 생활에 도움이 되는 정보를 쉽게 알려드립니다.
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
                  href="/category/health"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  건강/의료
                </Link>
              </li>
              <li>
                <Link
                  href="/category/tech"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  IT/테크
                </Link>
              </li>
              <li>
                <Link
                  href="/category/lifestyle"
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  생활정보
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 쓱싹. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
