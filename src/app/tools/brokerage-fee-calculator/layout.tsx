import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '부동산 중개수수료 계산기 - 매매·전세·월세 수수료 자동 계산',
  description: '부동산 중개수수료를 자동 계산합니다. 매매·전세·월세 거래 유형별 수수료율, 상한요율, 부가세 포함 실제 부담 금액까지 한번에 확인.',
  openGraph: {
    title: '부동산 중개수수료 계산기 - 매매·전세·월세 수수료 자동 계산',
    description: '부동산 중개수수료를 자동 계산합니다. 매매·전세·월세 거래 유형별 수수료율과 실제 부담 금액.',
    url: 'https://sseuksak.com/tools/brokerage-fee-calculator',
  },
  alternates: {
    canonical: 'https://sseuksak.com/tools/brokerage-fee-calculator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
