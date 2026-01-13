import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | 쓱싹 테스트',
    default: '재미있는 심리테스트 모음 | 쓱싹',
  },
  description: '정신연령, 소비유형, 번아웃 위험도, 연애스타일 등 다양한 심리테스트를 무료로 즐겨보세요. 친구들과 결과를 공유해보세요!',
  keywords: ['심리테스트', '성격테스트', '정신연령', '소비유형', '번아웃', 'MBTI'],
  openGraph: {
    title: '재미있는 심리테스트 모음 | 쓱싹',
    description: '정신연령, 소비유형, 번아웃 위험도 등 다양한 심리테스트',
    type: 'website',
    siteName: '쓱싹',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '재미있는 심리테스트 모음 | 쓱싹',
    description: '정신연령, 소비유형, 번아웃 위험도 등 다양한 심리테스트',
  },
};

// JSON-LD for tests collection
const testsCollectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '재미있는 심리테스트 모음',
  description: '정신연령, 소비유형, 번아웃 위험도 등 다양한 심리테스트를 무료로 즐겨보세요',
  url: 'https://sseuksak.com/tests',
  provider: {
    '@type': 'Organization',
    name: '쓱싹',
    url: 'https://sseuksak.com',
  },
  hasPart: [
    { '@type': 'Quiz', name: '정신연령 테스트', url: 'https://sseuksak.com/tests/mental-age' },
    { '@type': 'Quiz', name: '소비유형 테스트', url: 'https://sseuksak.com/tests/spending-type' },
    { '@type': 'Quiz', name: '번아웃 위험도 테스트', url: 'https://sseuksak.com/tests/burnout-risk' },
    { '@type': 'Quiz', name: '투자 성향 테스트', url: 'https://sseuksak.com/tests/investment-style' },
    { '@type': 'Quiz', name: '연애 스타일 테스트', url: 'https://sseuksak.com/tests/love-style' },
    { '@type': 'Quiz', name: '직장 동물 테스트', url: 'https://sseuksak.com/tests/office-animal' },
    { '@type': 'Quiz', name: '2026년 신년운세 테스트', url: 'https://sseuksak.com/tests/fortune-2026' },
  ],
};

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(testsCollectionJsonLd) }}
      />
      {children}
    </>
  );
}
