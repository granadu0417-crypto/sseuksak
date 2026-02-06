import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '번아웃 위험도 테스트 - 나의 에너지 레벨 체크 | 쓱싹',
  description: '12개 질문으로 알아보는 번아웃 위험도 테스트! 안전, 주의, 경계, 위험, 응급 중 나의 현재 상태는? 직장인 멘탈 건강 체크리스트로 자가진단해보세요.',
  keywords: ['번아웃 테스트', '직장인 스트레스 테스트', '멘탈 건강 체크', '번아웃 자가진단', '업무 스트레스 테스트', '직장인 심리테스트'],
  openGraph: {
    title: '번아웃 위험도 테스트 - 나의 에너지 레벨 체크',
    description: '12개 질문으로 알아보는 번아웃 위험도 테스트! 안전, 주의, 경계, 위험, 응급 중 나는?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '번아웃 위험도 테스트 - 나의 에너지 레벨 체크',
    description: '12개 질문으로 알아보는 번아웃 위험도 테스트! 안전, 주의, 경계, 위험, 응급 중 나는?',
  },
};

export default function BurnoutRiskTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
