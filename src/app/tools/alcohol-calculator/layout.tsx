import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '알콜 해독 시간 계산기 - 위드마크 공식 기반 혈중 알코올 농도',
  description: '알콜 해독 시간과 혈중 알코올 농도를 위드마크 공식으로 계산합니다. 음주 후 운전 가능 시간, 숙취 해소 예상 시간, 음주운전 단속 기준(0.03%)까지 확인하세요.',
  keywords: ['알콜해독시간계산기', '위드마크계산기', '혈중알코올농도', '음주운전기준', '알코올분해시간', '숙취해소시간', '음주계산기'],
  openGraph: {
    title: '알콜 해독 시간 계산기',
    description: '위드마크 공식 기반 혈중 알코올 농도 및 해독 시간 계산',
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
