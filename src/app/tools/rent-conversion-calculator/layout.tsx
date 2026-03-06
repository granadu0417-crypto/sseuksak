import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '전월세 전환율 계산기 - 보증금 월세 환산',
  description: '전세 보증금과 월세를 상호 전환합니다. 2026년 전월세 전환율 기준으로 보증금을 월세로, 월세를 보증금으로 환산해보세요.',
  keywords: ['전월세전환율', '보증금월세환산', '전세월세변환', '전환율계산기', '월세보증금', '전월세계산기'],
  openGraph: {
    title: '전월세 전환율 계산기',
    description: '보증금↔월세 상호 전환 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
