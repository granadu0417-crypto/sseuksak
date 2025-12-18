import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-full bg-green-500/20 p-3">
            <Lock className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">개인정보처리방침</h1>
        </div>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="leading-relaxed text-sm">
              정치커뮤니티(이하 "서비스")는 다음의 목적을 위하여 개인정보를 수집합니다:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
              <li>회원 가입 및 관리</li>
              <li>서비스 제공 및 개선</li>
              <li>민원사무 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. 수집하는 개인정보 항목</h2>
            <p className="leading-relaxed text-sm">
              서비스는 최소한의 개인정보만 수집합니다:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
              <li>필수항목: 이메일 주소, 닉네임</li>
              <li>자동수집: 접속 IP, 방문 일시, 서비스 이용 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="leading-relaxed text-sm">
              회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.
              단, 관계 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="leading-relaxed text-sm">
              서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. 개인정보의 파기</h2>
            <p className="leading-relaxed text-sm">
              수집 목적이 달성되거나 보유 기간이 만료된 경우 지체 없이 파기합니다.
              전자적 파일은 복구가 불가능한 방법으로, 출력물은 분쇄하여 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. 이용자의 권리</h2>
            <p className="leading-relaxed text-sm">
              이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다.
              개인정보 열람, 정정, 삭제 요구 시 지체 없이 처리합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. 쿠키 사용</h2>
            <p className="leading-relaxed text-sm">
              서비스는 이용자에게 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.
              이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. 개인정보 보호책임자</h2>
            <p className="leading-relaxed text-sm">
              개인정보 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              이메일: privacy@sseuksak.com
            </p>
          </section>

          <section className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500">
              본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.
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
