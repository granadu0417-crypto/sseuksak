import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '퇴직금 계산기 - 근속기간별 퇴직금 자동 계산',
  description: '근속기간과 평균임금으로 예상 퇴직금을 계산합니다. 퇴직소득세 공제 후 실수령액까지 한번에 확인. 근로기준법 기준 정확한 퇴직금 계산기.',
  keywords: ['퇴직금계산기', '퇴직금계산', '퇴직소득세', '퇴직금실수령액', '근속기간퇴직금', '퇴직금산정'],
  openGraph: {
    title: '퇴직금 계산기',
    description: '근속기간별 퇴직금 및 실수령액 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
