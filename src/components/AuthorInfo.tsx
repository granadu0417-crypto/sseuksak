interface AuthorInfoProps {
  publishedDate: string;
  updatedDate?: string;
}

// 저자 정보 (E-E-A-T 향상을 위한 상수)
const AUTHOR = {
  name: '쓱싹 에디터',
  role: '콘텐츠 에디터',
  bio: '정확하고 신뢰할 수 있는 정보를 제공하기 위해 공식 자료를 바탕으로 콘텐츠를 작성합니다. 모든 글은 최신 정보를 반영하여 지속적으로 업데이트됩니다.',
  email: 'granadu0417@gmail.com',
};

export default function AuthorInfo({ publishedDate, updatedDate }: AuthorInfoProps) {
  const formattedPublished = new Date(publishedDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedUpdated = updatedDate
    ? new Date(updatedDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="border-t border-b border-gray-200 py-6 my-8">
      <div className="flex items-start gap-4">
        {/* 프로필 이니셜 */}
        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">쓱싹</span>
        </div>

        {/* 저자 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{AUTHOR.name}</span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-600">{AUTHOR.role}</span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {AUTHOR.bio}
          </p>

          {/* 날짜 정보 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>작성: {formattedPublished}</span>
            </div>
            {formattedUpdated && formattedUpdated !== formattedPublished && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>수정: {formattedUpdated}</span>
              </div>
            )}
            <a
              href={`mailto:${AUTHOR.email}`}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>문의하기</span>
            </a>
          </div>
        </div>
      </div>

      {/* 신뢰도 배지 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          공식 자료 기반
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" clipRule="evenodd" />
          </svg>
          정기 업데이트
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          팩트체크 완료
        </span>
      </div>
    </div>
  );
}

// JSON-LD용 저자 정보 내보내기
export const AUTHOR_INFO = {
  name: AUTHOR.name,
  email: AUTHOR.email,
  url: 'https://sseuksak.com/about',
};
