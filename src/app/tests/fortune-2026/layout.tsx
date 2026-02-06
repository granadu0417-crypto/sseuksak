import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 나의 운세 키워드 - 병오년 운세 테스트 | 쓱싹',
  description: '12개 질문으로 알아보는 2026년 나의 운세 키워드! 도약, 풍요, 사랑, 성장, 안정 중 올해 나를 이끌어줄 키워드는? 병오년(丙午年) 붉은 말의 해 운세를 확인하세요.',
  keywords: ['2026년 운세', '병오년 운세', '신년 운세 테스트', '2026 운세 키워드', '운세 심리테스트', '말띠 운세'],
  openGraph: {
    title: '2026 나의 운세 키워드 - 병오년 운세 테스트',
    description: '12개 질문으로 알아보는 2026년 나의 운세 키워드! 도약, 풍요, 사랑, 성장, 안정 중 나는?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 나의 운세 키워드 - 병오년 운세 테스트',
    description: '12개 질문으로 알아보는 2026년 나의 운세 키워드! 도약, 풍요, 사랑, 성장, 안정 중 나는?',
  },
};

export default function Fortune2026TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
