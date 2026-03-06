import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대출이자 계산기 - 원리금균등 원금균등 만기일시 비교',
  description: '대출 조건별 월 상환금과 총 이자를 비교 계산합니다. 원리금균등, 원금균등, 만기일시상환 3가지 방식의 상환 스케줄을 한눈에 확인하세요.',
  keywords: ['대출이자계산기', '원리금균등', '원금균등', '만기일시상환', '대출상환금', '이자계산'],
  openGraph: {
    title: '대출이자 계산기',
    description: '상환방식별 월 상환금과 총 이자 비교',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
