import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '목돈 모으기 시뮬레이터 - 적금 vs 투자 전략 비교',
  description: '적금만, 적금+투자, 투자 중심 3가지 전략으로 목돈 모으기를 시뮬레이션합니다. 1억, 3억, 5억 목표에 맞는 최적의 저축 전략을 찾아보세요.',
  keywords: ['목돈모으기', '1억모으기', '적금vs투자', '목돈만들기', '저축시뮬레이터', '투자비교계산기'],
  openGraph: {
    title: '목돈 모으기 시뮬레이터',
    description: '적금 vs 투자 3가지 전략 비교 시뮬레이션',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
