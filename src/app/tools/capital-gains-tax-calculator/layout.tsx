import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '양도소득세 계산기 - 부동산 매도 시 세금 자동 계산',
  description: '부동산 양도소득세를 자동 계산합니다. 1세대 1주택 비과세(12억), 장기보유특별공제, 다주택 중과세율, 조정대상지역까지 반영한 정확한 양도세 계산.',
  openGraph: {
    title: '양도소득세 계산기 - 부동산 매도 시 세금 자동 계산',
    description: '부동산 양도소득세를 자동 계산합니다. 1세대 1주택 비과세, 장기보유특별공제, 다주택 중과세율까지 반영.',
    url: 'https://sseuksak.com/tools/capital-gains-tax-calculator',
  },
  alternates: {
    canonical: 'https://sseuksak.com/tools/capital-gains-tax-calculator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
