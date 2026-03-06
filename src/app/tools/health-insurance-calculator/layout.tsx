import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '건강보험료 계산기 - 직장가입자 보험료 계산',
  description: '2026년 건강보험료를 계산합니다. 직장가입자 기준 건강보험료, 장기요양보험료를 월급에서 자동 계산. 사업주 부담분까지 확인하세요.',
  keywords: ['건강보험료계산기', '직장가입자보험료', '장기요양보험료', '4대보험', '건강보험요율', '2026년건강보험'],
  openGraph: {
    title: '건강보험료 계산기',
    description: '직장가입자 건강보험료 자동 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
