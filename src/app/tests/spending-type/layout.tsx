import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소비유형 테스트 - 나는 어떤 소비 스타일? | 쓱싹',
  description: '12개 질문으로 알아보는 나의 소비유형! 플렉서, 가치투자자, 계획달인, 철벽세이버, 무드쇼퍼 중 나는 어떤 타입일까요?',
  keywords: ['소비유형 테스트', '소비습관', '돈관리', '재테크 성향', '심리테스트', '재미있는 테스트'],
  openGraph: {
    title: '소비유형 테스트 - 나는 어떤 소비 스타일?',
    description: '12개 질문으로 알아보는 나의 소비유형! 플렉서, 가치투자자, 계획달인, 철벽세이버, 무드쇼퍼 중 나는?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '소비유형 테스트 - 나는 어떤 소비 스타일?',
    description: '12개 질문으로 알아보는 나의 소비유형! 플렉서, 가치투자자, 계획달인, 철벽세이버, 무드쇼퍼 중 나는?',
  },
};

export default function SpendingTypeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
