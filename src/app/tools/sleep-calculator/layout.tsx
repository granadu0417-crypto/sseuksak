import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '수면 시간 계산기 - 최적의 기상 시간',
  description: '수면 주기(90분)를 고려한 최적의 기상 시간을 계산합니다. 개운하게 일어날 수 있는 시간을 알려드립니다.',
  keywords: ['수면계산기', '기상시간', '수면주기', '렘수면', '숙면', '수면시간'],
  openGraph: {
    title: '수면 시간 계산기 | 쓱싹',
    description: '수면 주기 기반 최적의 기상 시간 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
