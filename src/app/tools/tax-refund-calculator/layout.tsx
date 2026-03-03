import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026년 연말정산 환급금 계산기',
  description: '2026년 연말정산 예상 환급금을 미리 계산해보세요. 신용카드, 의료비, 교육비 공제를 반영한 예상 환급액 계산기입니다.',
  keywords: ['연말정산', '환급금', '세금환급', '소득공제', '세액공제', '2026년'],
  openGraph: {
    title: '2026년 연말정산 환급금 계산기',
    description: '연말정산 예상 환급금 미리 계산하기',
    type: 'website',
  },
};

export default function TaxRefundCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
