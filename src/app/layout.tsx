import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateWebsiteJsonLd } from '@/lib/metadata';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
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
        url: '/og-image.png',
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
    images: ['/og-image.png'],
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
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
  other: {
    'google-adsense-account': 'ca-pub-XXXXXXXXXX',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateWebsiteJsonLd();

  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${notoSansKR.className} antialiased bg-white`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
