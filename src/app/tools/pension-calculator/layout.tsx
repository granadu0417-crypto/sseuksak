import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '국민연금 예상 수령액 계산기',
  description: '국민연금 예상 수령액을 계산합니다. 가입기간, 평균소득월액 기준으로 노령연금 예상 월액을 확인하세요. 조기수령, 연기수령 금액도 비교할 수 있습니다.',
  keywords: ['국민연금계산기', '국민연금수령액', '노령연금', '국민연금예상액', '연금수령나이', '2026년국민연금'],
  openGraph: {
    title: '국민연금 예상 수령액 계산기',
    description: '가입기간 기준 국민연금 예상 월액 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
