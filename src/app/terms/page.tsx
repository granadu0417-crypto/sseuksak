import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-full bg-amber-500/20 p-3">
            <FileText className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">이용약관</h1>
        </div>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제1조 (목적)</h2>
            <p className="leading-relaxed text-sm">
              이 약관은 정치커뮤니티(이하 "서비스")의 이용조건 및 절차,
              이용자와 서비스 제공자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제2조 (서비스의 제공)</h2>
            <p className="leading-relaxed text-sm">
              서비스는 다음과 같은 기능을 제공합니다:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
              <li>정치인 및 정당 정보 제공</li>
              <li>게시판을 통한 커뮤니티 서비스</li>
              <li>정치 관련 뉴스 및 정보 제공</li>
              <li>기타 서비스가 정하는 업무</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제3조 (이용자의 의무)</h2>
            <p className="leading-relaxed text-sm">
              이용자는 다음 행위를 하여서는 안 됩니다:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
              <li>타인의 명예를 손상시키거나 불이익을 주는 행위</li>
              <li>허위 정보를 유포하는 행위</li>
              <li>서비스의 운영을 방해하는 행위</li>
              <li>법령에 위반되는 행위</li>
              <li>특정 정치인/정당에 대한 근거 없는 비방</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제4조 (게시물 관리)</h2>
            <p className="leading-relaxed text-sm">
              서비스는 다음에 해당하는 게시물을 사전 통지 없이 삭제할 수 있습니다:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
              <li>명예훼손, 모욕, 허위사실 유포 등 타인의 권리를 침해하는 내용</li>
              <li>음란물 또는 청소년에게 유해한 내용</li>
              <li>상업적 광고 및 스팸</li>
              <li>서비스 운영 목적에 맞지 않는 내용</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제5조 (면책조항)</h2>
            <p className="leading-relaxed text-sm">
              서비스는 이용자가 게재한 정보, 자료의 정확성 등에 대해 책임을 지지 않습니다.
              이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 대해 서비스는 개입할 의무가 없으며,
              이로 인한 손해를 배상할 책임도 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">제6조 (저작권)</h2>
            <p className="leading-relaxed text-sm">
              서비스가 작성한 저작물에 대한 저작권은 서비스에 귀속됩니다.
              이용자가 서비스 내에 게시한 게시물의 저작권은 해당 이용자에게 귀속됩니다.
            </p>
          </section>

          <section className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500">
              본 약관은 2024년 1월 1일부터 시행됩니다.
              <br />
              최종 수정일: 2024년 12월
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
