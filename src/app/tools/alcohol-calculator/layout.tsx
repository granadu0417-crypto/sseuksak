import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '음주 계산기 - 혈중 알코올 농도',
  description: '음주량에 따른 예상 혈중 알코올 농도와 해독 시간을 계산합니다. 음주운전 기준과 숙취 해소 예상 시간을 확인하세요.',
  keywords: ['음주계산기', '혈중알코올', '음주운전', '알코올농도', '숙취', '해독시간'],
  openGraph: {
    title: '음주 계산기 | 쓱싹',
    description: '혈중 알코올 농도 및 해독 시간 계산',
    type: 'website',
  },
};

export default function AlcoholCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
