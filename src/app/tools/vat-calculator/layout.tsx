import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '부가세 계산기 - VAT 10% 자동 계산',
  description: '공급가액에서 부가가치세(VAT 10%)를 계산하거나, 합계금액에서 부가세를 역산합니다. 세금계산서 발행, 사업자 부가세 신고에 활용하세요.',
  keywords: ['부가세계산기', 'VAT계산기', '부가가치세', '공급가액', '세금계산서', '부가세역산', '10%'],
  openGraph: {
    title: '부가세 계산기 - VAT 10% 자동 계산',
    description: '공급가액 → 부가세, 합계금액 → 부가세 역산 간편 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
