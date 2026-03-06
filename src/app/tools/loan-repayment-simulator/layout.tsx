import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대출 상환 전략 비교 시뮬레이터 - 3가지 상환방식 차트 비교',
  description: '원리금균등, 원금균등, 만기일시 3가지 대출 상환 전략을 차트로 비교합니다. 잔금 추이, 월납입금, 총이자 차이를 시각적으로 확인하세요.',
  keywords: ['대출상환비교', '원리금균등vs원금균등', '대출상환시뮬레이터', '대출이자비교', '상환전략', '대출계산기'],
  openGraph: {
    title: '대출 상환 전략 비교 시뮬레이터',
    description: '3가지 상환방식의 장기 비용을 차트로 비교',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
