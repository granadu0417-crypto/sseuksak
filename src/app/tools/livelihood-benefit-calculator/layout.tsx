import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '생계급여 계산기 - 기초생활수급 자격 확인',
  description: '2026년 생계급여 수급 자격과 예상 급여액을 계산합니다. 가구원 수, 소득인정액 기준으로 기초생활보장 수급 가능 여부를 확인하세요.',
  keywords: ['생계급여계산기', '기초생활수급자', '생계급여자격', '소득인정액', '기준중위소득', '2026년생계급여'],
  openGraph: {
    title: '생계급여 계산기',
    description: '기초생활수급 자격 및 예상 급여액 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
