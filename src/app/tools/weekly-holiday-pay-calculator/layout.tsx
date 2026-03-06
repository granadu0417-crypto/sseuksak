import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주휴수당 계산기 - 주휴수당 자동 계산',
  description: '주 15시간 이상 근무 시 발생하는 주휴수당을 계산합니다. 2026년 최저시급 기준 주휴수당 포함 실제 시급과 월급을 확인하세요.',
  keywords: ['주휴수당계산기', '주휴수당', '주휴수당포함시급', '알바주휴수당', '주15시간', '2026년주휴수당'],
  openGraph: {
    title: '주휴수당 계산기',
    description: '주휴수당 포함 실제 시급과 월급 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
