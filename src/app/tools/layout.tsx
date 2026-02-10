import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | 쓱싹',
    default: '유용한 계산기 모음 | 쓱싹',
  },
  description: '연봉 실수령액, 연말정산 환급금, FIRE 은퇴자금, 수면시간, 음주량 등 생활에 필요한 다양한 계산기를 무료로 제공합니다.',
  keywords: ['계산기', '연봉계산기', '실수령액', '연말정산', 'FIRE', '수면계산기', '음주계산기'],
  openGraph: {
    title: '유용한 계산기 모음 | 쓱싹',
    description: '연봉 실수령액, 연말정산 환급금, FIRE 은퇴자금 등 생활에 필요한 다양한 계산기',
    type: 'website',
    siteName: '쓱싹',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '유용한 계산기 모음 | 쓱싹',
    description: '연봉, 세금, 건강 등 생활에 필요한 다양한 계산기',
  },
};

// JSON-LD for tools collection
const toolsCollectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '유용한 계산기 모음',
  description: '연봉 실수령액, 연말정산 환급금, FIRE 은퇴자금 등 생활에 필요한 다양한 계산기',
  url: 'https://sseuksak.com/tools',
  provider: {
    '@type': 'Organization',
    name: '쓱싹',
    url: 'https://sseuksak.com',
  },
  hasPart: [
    { '@type': 'WebApplication', name: '대출이자 계산기', url: 'https://sseuksak.com/tools/loan-calculator' },
    { '@type': 'WebApplication', name: '시급 계산기', url: 'https://sseuksak.com/tools/hourly-wage-calculator' },
    { '@type': 'WebApplication', name: '퇴직금 계산기', url: 'https://sseuksak.com/tools/severance-calculator' },
    { '@type': 'WebApplication', name: '주휴수당 계산기', url: 'https://sseuksak.com/tools/weekly-holiday-pay-calculator' },
    { '@type': 'WebApplication', name: '연말정산 환급액 계산기', url: 'https://sseuksak.com/tools/tax-refund-calculator' },
    { '@type': 'WebApplication', name: '연봉 실수령액 계산기', url: 'https://sseuksak.com/tools/salary-calculator' },
    { '@type': 'WebApplication', name: '진짜 시급 계산기', url: 'https://sseuksak.com/tools/true-hourly-wage' },
    { '@type': 'WebApplication', name: '구독 서비스 총액 계산기', url: 'https://sseuksak.com/tools/subscription-audit' },
    { '@type': 'WebApplication', name: 'FIRE 조기은퇴 계산기', url: 'https://sseuksak.com/tools/fire-calculator' },
    { '@type': 'WebApplication', name: '생계급여 계산기', url: 'https://sseuksak.com/tools/livelihood-benefit-calculator' },
    { '@type': 'WebApplication', name: '증여세 계산기', url: 'https://sseuksak.com/tools/gift-tax-calculator' },
    { '@type': 'WebApplication', name: 'BMI 계산기', url: 'https://sseuksak.com/tools/bmi-calculator' },
    { '@type': 'WebApplication', name: '알코올 분해 시간 계산기', url: 'https://sseuksak.com/tools/alcohol-calculator' },
    { '@type': 'WebApplication', name: '수면 사이클 계산기', url: 'https://sseuksak.com/tools/sleep-calculator' },
    { '@type': 'WebApplication', name: 'Life in Weeks', url: 'https://sseuksak.com/tools/life-in-weeks' },
  ],
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionJsonLd) }}
      />
      {children}
    </>
  );
}
