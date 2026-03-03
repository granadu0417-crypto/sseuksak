import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '인생 주간 달력 - Life in Weeks',
  description: '내 인생을 주 단위로 시각화합니다. 지금까지 살아온 시간과 앞으로 남은 시간을 한눈에 확인하세요.',
  keywords: ['인생달력', 'Life in Weeks', '시간관리', '인생시각화', '주간달력'],
  openGraph: {
    title: '인생 주간 달력',
    description: '내 인생을 주 단위로 시각화하기',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
