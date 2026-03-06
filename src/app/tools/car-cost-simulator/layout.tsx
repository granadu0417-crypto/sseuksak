import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '자동차 구매 vs 리스 vs 장기렌트 비교 시뮬레이터',
  description: '자동차를 구매, 리스, 장기렌트 중 어떤 방식이 유리한지 장기 비용을 차트로 비교합니다. 차량가격, 대출조건, 보험료까지 반영한 정확한 비용 시뮬레이션.',
  keywords: ['자동차리스비교', '장기렌트비교', '자동차구매비용', '리스vs렌트', '차량유지비', '자동차비용계산'],
  openGraph: {
    title: '자동차 구매 vs 리스 vs 장기렌트 비교',
    description: '3가지 방식의 장기 비용을 차트로 비교해보세요',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
