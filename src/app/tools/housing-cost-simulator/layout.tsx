import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '전세 vs 월세 vs 매매 비교 시뮬레이터 - 장기 주거비용 계산',
  description: '전세, 월세, 매매 3가지 주거 방식의 장기 비용을 차트로 비교합니다. 대출이자, 취득세, 기회비용까지 반영한 정확한 주거비용 시뮬레이션.',
  keywords: ['전세vs월세', '매매vs전세', '주거비용비교', '전세대출이자', '월세vs매매', '주거비용시뮬레이터'],
  openGraph: {
    title: '전세 vs 월세 vs 매매 비교 시뮬레이터',
    description: '장기 주거비용을 차트로 비교해보세요',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
