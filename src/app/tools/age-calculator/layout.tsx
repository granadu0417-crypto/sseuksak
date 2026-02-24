import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나이 계산기 - 만 나이, 한국 나이 변환',
  description: '생년월일을 입력하면 만 나이, 한국 나이(세는 나이), 연 나이를 한눈에 확인합니다. 2023년 만 나이 통일법 반영.',
  keywords: ['나이계산기', '만나이', '한국나이', '세는나이', '연나이', '만나이계산', '나이변환'],
  openGraph: {
    title: '나이 계산기 - 만 나이 / 한국 나이 변환 | 쓱싹',
    description: '생년월일로 만 나이, 한국 나이, 연 나이를 한눈에 확인',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
