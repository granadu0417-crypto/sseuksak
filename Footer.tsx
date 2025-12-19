import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">서비스</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/politicians" className="hover:text-foreground">정치인 카드</Link></li>
              <li><Link href="/promises" className="hover:text-foreground">공약 추적기</Link></li>
              <li><Link href="/factcheck" className="hover:text-foreground">팩트체크</Link></li>
              <li><Link href="/live" className="hover:text-foreground">국회 LIVE</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">커뮤니티</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/debates" className="hover:text-foreground">토론장</Link></li>
              <li><Link href="/predictions" className="hover:text-foreground">예측 리그</Link></li>
              <li><Link href="/regions" className="hover:text-foreground">지역구 대항전</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">정보</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">서비스 소개</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">자주 묻는 질문</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">문의하기</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">법적 고지</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">개인정보처리방침</Link></li>
              <li><Link href="/disclaimer" className="hover:text-foreground">선거법 안내</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 폴리티카(Politica). All rights reserved.</p>
          <p className="mt-2">
            본 서비스는 공공데이터를 활용하며, 특정 정당이나 정치인을 지지하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
