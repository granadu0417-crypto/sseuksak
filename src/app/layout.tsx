import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '폴리티카 | 시민을 위한 정치 정보 플랫폼',
  description: '정치인 스탯, 공약 추적, 팩트체크, 예측 리그까지. 게이미피케이션으로 즐기는 정치 참여 플랫폼',
  keywords: ['정치', '정치인', '공약', '팩트체크', '국회', '선거', '폴리티카'],
  authors: [{ name: '폴리티카' }],
  openGraph: {
    title: '폴리티카',
    description: '시민을 위한 정치 정보 플랫폼',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 overflow-auto lg:ml-0">
              {children}
            </main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
