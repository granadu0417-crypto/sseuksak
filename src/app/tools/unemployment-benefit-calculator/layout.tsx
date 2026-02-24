import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '실업급여 계산기 - 예상 수령액 및 수급 기간 조회',
  description: '실업급여(구직급여) 예상 수령액과 수급 기간을 계산합니다. 나이, 근속기간, 퇴직 전 급여 기준으로 2026년 최신 기준 반영.',
  keywords: ['실업급여계산기', '구직급여계산기', '실업급여수령액', '실업급여기간', '고용보험', '퇴직후실업급여'],
  openGraph: {
    title: '실업급여 계산기 - 예상 수령액 조회 | 쓱싹',
    description: '실업급여 예상 수령액과 수급 기간을 간편하게 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
