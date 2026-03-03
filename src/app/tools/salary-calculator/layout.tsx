import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026년 연봉 실수령액 계산기',
  description: '2026년 4대보험, 소득세 기준으로 연봉 실수령액을 계산합니다. 국민연금, 건강보험, 고용보험, 소득세를 반영한 정확한 월급 계산기입니다.',
  keywords: ['연봉계산기', '실수령액', '월급계산기', '4대보험', '소득세', '2026년'],
  openGraph: {
    title: '2026년 연봉 실수령액 계산기',
    description: '4대보험, 소득세 반영 정확한 실수령액 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
