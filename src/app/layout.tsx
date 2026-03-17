import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTopWrapper from '@/components/ScrollToTopWrapper';
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from '@/lib/metadata';
import './globals.css';

// 폰트 웨이트 최적화: 400(본문), 600(제목), 700(강조)만 로드
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: '쓱싹 - 생활 금융 계산기 & 가이드',
    template: '%s',
  },
  description: '연봉 실수령액, 대출이자, 적금이자, 증여세 등 금융 계산기와 보험·투자·세금 가이드를 공식 자료 기반으로 제공합니다.',
  keywords: '금융 계산기, 연봉 계산기, 대출 이자 계산기, 적금 금리 비교, 증여세 계산기, 보험 비교, 투자 가이드, 세금 정보',
  authors: [{ name: '쓱싹' }],
  creator: '쓱싹',
  publisher: '쓱싹',
  metadataBase: new URL('https://sseuksak.com'),
  alternates: {
    canonical: 'https://sseuksak.com',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://sseuksak.com',
    siteName: '쓱싹',
    title: '쓱싹 - 생활 금융 계산기 & 가이드',
    description: '연봉 실수령액, 대출이자, 적금이자, 증여세 등 금융 계산기와 보험·투자·세금 가이드를 공식 자료 기반으로 제공합니다.',
    images: [{
      url: 'https://sseuksak.com/og-image.png',
      width: 1200,
      height: 630,
      alt: '쓱싹 - 생활 금융 계산기 & 가이드',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '쓱싹 - 생활 금융 계산기 & 가이드',
    description: '연봉 실수령액, 대출이자, 적금이자, 증여세 등 금융 계산기와 보험·투자·세금 가이드를 공식 자료 기반으로 제공합니다.',
    images: ['https://sseuksak.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '05uSSCwIsJLxLnMlswVBzMSOwEeGCOkpMhx9YJMZcng',
    other: {
      'naver-site-verification': 'f82b9ef52a15379f29a3f6d9ffe4dd6b9d6cc43b',
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-3591490977493759',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = generateWebsiteJsonLd();
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 외부 도메인 preconnect - next/font이 폰트를 셀프호스팅하므로 Google Fonts preconnect 불필요 */}
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Google Analytics - lazyOnload로 렌더링 차단 방지 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CMZF467RLD"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CMZF467RLD');
          `}
        </Script>

        {/* AdSense - lazyOnload로 렌더링 차단 방지 */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3591490977493759"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${notoSansKR.className} antialiased bg-white`} suppressHydrationWarning>
        {/* 접근성: 본문으로 건너뛰기 링크 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none"
        >
          본문으로 건너뛰기
        </a>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-grow">{children}</main>
          <Footer />
        </div>
        <ScrollToTopWrapper />
      </body>
    </html>
  );
}
