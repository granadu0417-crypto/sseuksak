import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DSR 계산기 - 총부채원리금상환비율 계산 및 추가 대출 한도',
  description: '총부채원리금상환비율(DSR)을 계산하고 추가 대출 가능 금액을 확인하세요. 2026년 스트레스 DSR 3단계 반영, 주담대·신용대출·카드론 유형별 환산, 청년 장래소득 인정까지 한번에 계산합니다.',
  keywords: ['DSR계산기', '총부채원리금상환비율', '대출한도계산', '스트레스DSR', '추가대출가능금액', 'DSR40', '대출규제', '주택담보대출한도'],
  openGraph: {
    title: 'DSR 계산기 - 총부채원리금상환비율 계산',
    description: '2026년 스트레스 DSR 반영, 대출 유형별 DSR 계산 및 추가 대출 가능 금액 확인',
    type: 'website',
  },
};

export default function DsrCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
