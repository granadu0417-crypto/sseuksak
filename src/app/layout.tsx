import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export const metadata: Metadata = {
  title: "쓱싹 - 내 주변 전문가 찾기",
  description: "무료로 전문가와 연결하세요. 숨은 전문가를 쓱싹 찾아드립니다.",
  keywords: ["전문가", "서비스", "매칭", "쓱싹", "숨고", "크몽"],
  authors: [{ name: "쓱싹" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "쓱싹",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <NotificationProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <BottomNav />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
