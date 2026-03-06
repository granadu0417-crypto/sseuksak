import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '종합소득세 계산기 - 소득세율 자동 계산',
  description: '2026년 종합소득세를 자동으로 계산합니다. 과세표준 구간별 세율, 누진공제, 지방소득세까지 한번에 확인. 프리랜서, 사업자 소득세 계산에 활용하세요.',
  keywords: ['종합소득세계산기', '소득세율', '과세표준', '프리랜서세금', '사업소득세', '2026년소득세'],
  openGraph: {
    title: '종합소득세 계산기',
    description: '소득세율 구간별 자동 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
