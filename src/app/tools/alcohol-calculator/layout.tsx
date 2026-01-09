import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '알코올 분해 시간 계산기 - 음주 후 운전 가능 시간 | 쓱싹',
  description: '위드마크 공식으로 혈중 알코올 농도와 분해 시간을 계산하세요. 소주, 맥주, 와인 등 음주 후 운전 가능 시간을 확인할 수 있습니다.',
  keywords: ['알코올 분해 시간', '음주 계산기', '혈중 알코올 농도', '위드마크 공식', '음주운전', '운전 가능 시간'],
};

export default function AlcoholCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
