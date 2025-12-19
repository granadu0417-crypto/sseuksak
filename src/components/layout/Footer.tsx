import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-zinc-950/50 mt-auto">
      <div className="container py-6 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              서비스 소개
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              문의하기
            </Link>
          </div>
          
          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p>© {new Date().getFullYear()} 폴리티카(Politica). 시민을 위한 정치 정보 플랫폼</p>
            <p className="mt-1">본 서비스는 특정 정당이나 정치인을 지지하지 않습니다.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
