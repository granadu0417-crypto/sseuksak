import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FIRE 조기은퇴 계산기',
  description: 'FIRE(Financial Independence, Retire Early) 목표 달성까지 필요한 자금과 기간을 계산합니다. 4% 룰 기반 은퇴자금 계산기입니다.',
  keywords: ['FIRE', '조기은퇴', '은퇴자금', '재정독립', '4% 룰', '투자계산기'],
  openGraph: {
    title: 'FIRE 조기은퇴 계산기',
    description: '조기은퇴까지 필요한 자금과 기간 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
