import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연말정산 환급액 계산기 - 2025년 귀속 예상 환급액 계산 | 쓱싹',
  description: '2025년 귀속 연말정산 예상 환급액을 계산해보세요. 국세청 공식 세율과 공제율을 적용한 정확한 계산기입니다. 근로소득공제, 인적공제, 세액공제를 반영하여 환급액을 미리 확인하세요.',
  keywords: ['연말정산 계산기', '환급액 계산', '2025년 연말정산', '세금 계산기', '근로소득세', '세액공제', '소득공제'],
};

export default function TaxRefundCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
