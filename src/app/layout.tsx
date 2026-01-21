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
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: '쓱싹 - 유용한 정보 블로그',
    template: '%s | 쓱싹',
  },
  description: '다양한 주제의 유용한 정보를 제공하는 블로그. 금융, 건강, IT, 생활정보 등 쉽게 알려드립니다.',
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
    description: '다양한 주제의 유용한 정보를 제공하는 블로그',
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
    description: '다양한 주제의 유용한 정보를 제공하는 블로그',
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
    <html lang="ko">
      <head>
        {/* 외부 도메인 preconnect - 초기 연결 시간 단축 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CMZF467RLD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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
      <body className={`${notoSansKR.className} antialiased bg-white`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <ScrollToTopWrapper />
      </body>
    </html>
  );
}
