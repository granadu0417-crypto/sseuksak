import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '진짜 시급 계산기',
  description: '출퇴근 시간, 야근, 업무 준비 시간까지 포함한 실제 시급을 계산합니다. 내 시간의 진짜 가치를 알아보세요.',
  keywords: ['시급계산기', '진짜시급', '시간가치', '출퇴근시간', '야근', '워라밸'],
  openGraph: {
    title: '진짜 시급 계산기',
    description: '출퇴근, 야근 포함 실제 시급 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
