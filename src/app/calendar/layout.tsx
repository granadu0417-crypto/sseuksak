import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026년 주요 일정 캘린더',
  description: '2026년 세금 납부, 자격증 시험, 공휴일, 지원금 신청 등 놓치면 안 되는 중요한 일정을 한눈에 확인하세요.',
  keywords: ['2026년달력', '2026일정', '세금납부일', '자격증시험일정', '공휴일', '지원금신청'],
  openGraph: {
    title: '2026년 주요 일정 캘린더',
    description: '세금, 자격증, 공휴일 등 놓치면 안 되는 2026년 일정',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026년 주요 일정 캘린더',
    description: '세금, 자격증, 공휴일 등 놓치면 안 되는 2026년 일정',
  },
};

// JSON-LD for calendar collection
const calendarJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '2026년 주요 일정 캘린더',
  description: '2026년 세금 납부, 자격증 시험, 공휴일, 지원금 신청 등 놓치면 안 되는 중요한 일정',
  url: 'https://sseuksak.com/calendar',
  provider: {
    '@type': 'Organization',
    name: '쓱싹',
    url: 'https://sseuksak.com',
  },
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  numberOfItems: 12,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '1월 주요 일정' },
    { '@type': 'ListItem', position: 2, name: '2월 주요 일정' },
    { '@type': 'ListItem', position: 3, name: '3월 주요 일정' },
    { '@type': 'ListItem', position: 4, name: '4월 주요 일정' },
    { '@type': 'ListItem', position: 5, name: '5월 주요 일정' },
    { '@type': 'ListItem', position: 6, name: '6월 주요 일정' },
    { '@type': 'ListItem', position: 7, name: '7월 주요 일정' },
    { '@type': 'ListItem', position: 8, name: '8월 주요 일정' },
    { '@type': 'ListItem', position: 9, name: '9월 주요 일정' },
    { '@type': 'ListItem', position: 10, name: '10월 주요 일정' },
    { '@type': 'ListItem', position: 11, name: '11월 주요 일정' },
    { '@type': 'ListItem', position: 12, name: '12월 주요 일정' },
  ],
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calendarJsonLd) }}
      />
      {children}
    </>
  );
}
