import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '재테크 성향 테스트 - 나는 어떤 투자 스타일? | 쓱삭',
  description: '12개 질문으로 알아보는 나의 재테크 성향! 월가의 늑대, 든든한 거북이, 현명한 올빼미, 땅부자 두더지, 기회의 매 중 나는 어떤 타입일까요?',
  keywords: ['재테크 성향 테스트', '투자 성향', '주식 투자', '부동산 투자', '심리테스트', '재테크 테스트'],
  openGraph: {
    title: '재테크 성향 테스트 - 나는 어떤 투자 스타일?',
    description: '12개 질문으로 알아보는 나의 재테크 성향! 월가의 늑대, 든든한 거북이, 현명한 올빼미 중 나는?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱삭',
  },
  twitter: {
    card: 'summary_large_image',
    title: '재테크 성향 테스트 - 나는 어떤 투자 스타일?',
    description: '12개 질문으로 알아보는 나의 재테크 성향! 월가의 늑대, 든든한 거북이, 현명한 올빼미 중 나는?',
  },
};

export default function InvestmentStyleTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
