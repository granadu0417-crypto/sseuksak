import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '증여세 계산기 - 증여세율 자동 계산',
  description: '2026년 증여세를 자동으로 계산합니다. 증여재산가액, 면제한도, 세율구간별 누진공제까지 반영한 정확한 증여세 계산기입니다. 부모자녀 증여, 부부 증여 한도 확인.',
  keywords: ['증여세계산기', '증여세율', '증여세면제한도', '부모자녀증여', '증여세신고', '2026년증여세'],
  openGraph: {
    title: '증여세 계산기',
    description: '증여재산가액 기준 증여세 자동 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
