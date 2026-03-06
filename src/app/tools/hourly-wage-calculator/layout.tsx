import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '시급 계산기 - 최저시급 비교 및 월급 환산',
  description: '시급을 월급, 연봉으로 환산하고 2026년 최저시급과 비교합니다. 주휴수당 포함 실제 시급 계산, 아르바이트 급여 계산에 활용하세요.',
  keywords: ['시급계산기', '최저시급2026', '시급월급환산', '알바시급', '주휴수당계산', '최저임금'],
  openGraph: {
    title: '시급 계산기',
    description: '시급↔월급↔연봉 환산, 최저시급 비교',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
