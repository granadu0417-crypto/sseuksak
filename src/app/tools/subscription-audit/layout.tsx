import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '구독 서비스 점검기',
  description: '사용 중인 구독 서비스를 점검하고 월/연간 지출을 계산합니다. 불필요한 구독을 찾아 절약하세요.',
  keywords: ['구독관리', '구독서비스', '월정액', '절약', '가계부', '지출관리'],
  openGraph: {
    title: '구독 서비스 점검기',
    description: '구독 서비스 점검 및 지출 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
