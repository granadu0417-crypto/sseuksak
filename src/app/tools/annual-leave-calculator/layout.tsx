import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연차 계산기 - 연차 발생일수 자동 계산',
  description: '입사일 기준 연차 발생일수를 자동으로 계산합니다. 2026년 근로기준법에 따른 연차유급휴가 일수, 1년 미만 월차, 3년 이상 가산 연차까지 한번에 확인하세요.',
  keywords: ['연차계산기', '연차발생일수', '연차유급휴가', '월차계산', '근로기준법연차', '2026년연차'],
  openGraph: {
    title: '연차 계산기',
    description: '입사일 기준 연차 발생일수 자동 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
