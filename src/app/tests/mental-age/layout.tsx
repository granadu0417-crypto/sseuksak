import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '정신연령 테스트 - 나의 진짜 정신연령은?',
  description: '12개 질문으로 알아보는 나의 정신연령! 실제 나이와 다른 나의 정신연령은 몇 살일까요? 친구들과 결과를 비교해보세요.',
  keywords: ['정신연령 테스트', '심리테스트', '나이 테스트', '성격 테스트', 'MBTI', '재미있는 테스트'],
  openGraph: {
    title: '정신연령 테스트 - 나의 진짜 정신연령은?',
    description: '12개 질문으로 알아보는 나의 정신연령! 실제 나이와 다른 나의 정신연령은 몇 살일까요?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '정신연령 테스트 - 나의 진짜 정신연령은?',
    description: '12개 질문으로 알아보는 나의 정신연령! 실제 나이와 다른 나의 정신연령은 몇 살일까요?',
  },
};

export default function MentalAgeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
