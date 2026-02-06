import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연애스타일 테스트 - 나는 어떤 연애 유형? | 쓱싹',
  description: '12개 질문으로 알아보는 나의 연애스타일! 로맨티스트, 현실주의자, 자유영혼, 올인헌신파, 신중탐색가 중 나는 어떤 타입일까요?',
  keywords: ['연애스타일 테스트', '연애유형', '사랑테스트', '커플테스트', '심리테스트', '연애심리'],
  openGraph: {
    title: '연애스타일 테스트 - 나는 어떤 연애 유형?',
    description: '12개 질문으로 알아보는 나의 연애스타일! 로맨티스트, 현실주의자, 자유영혼, 올인헌신파 중 나는?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '연애스타일 테스트 - 나는 어떤 연애 유형?',
    description: '12개 질문으로 알아보는 나의 연애스타일! 로맨티스트, 현실주의자, 자유영혼, 올인헌신파 중 나는?',
  },
};

export default function LoveStyleTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
