import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '평수 계산기 - 평을 제곱미터(㎡)로 변환',
  description: '평수를 제곱미터(㎡)로, 제곱미터를 평수로 간편하게 변환합니다. 아파트, 오피스텔, 상가 면적 환산에 활용하세요. 1평 = 3.3058㎡ 기준.',
  keywords: ['평수계산기', '평수변환', '제곱미터', '평방미터', '㎡', '평', '면적계산', '아파트평수'],
  openGraph: {
    title: '평수 계산기 - 평 ↔ ㎡ 변환 | 쓱싹',
    description: '평수를 제곱미터로, 제곱미터를 평수로 간편하게 변환',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
