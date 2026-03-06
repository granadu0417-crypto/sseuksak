import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMI 계산기 - 체질량지수 측정 및 비만도 확인',
  description: '키와 체중으로 BMI(체질량지수)를 계산합니다. 저체중, 정상, 과체중, 비만 단계를 확인하고 건강한 체중 범위를 알아보세요. 대한비만학회 기준 적용.',
  keywords: ['BMI계산기', '체질량지수', '비만도측정', '체중관리', '표준체중', '비만기준'],
  openGraph: {
    title: 'BMI 계산기 - 체질량지수 측정',
    description: 'BMI 계산으로 비만도를 확인하세요',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
