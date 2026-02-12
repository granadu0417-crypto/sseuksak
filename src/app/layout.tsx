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
    default: '쓱싹 - 유용한 정보 블로그',
    template: '%s | 쓱싹',
  },
  description: '금융, 세금, 복지, 생활 정보를 공식 자료 기반으로 쉽게 정리해드립니다.',
  keywords: '금융, 투자, 건강, IT, 테크, 생활정보, 자격증, 보험',
  authors: [{ name: '쓱싹' }],
  creator: '쓱싹',
  publisher: '쓱싹',
  metadataBase: new URL('https://sseuksak.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://sseuksak.com',
    siteName: '쓱싹',
    title: '쓱싹 - 유용한 정보 블로그',
    description: '금융, 세금, 복지, 생활 정보를 공식 자료 기반으로 쉽게 정리해드립니다',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: '쓱싹',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '쓱싹 - 유용한 정보 블로그',
    description: '금융, 세금, 복지, 생활 정보를 공식 자료 기반으로 쉽게 정리해드립니다',
    images: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop&q=80'],
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
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
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
