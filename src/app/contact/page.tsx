import { Mail, MessageSquare, Github } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-full bg-indigo-500/20 p-3">
            <Mail className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">문의하기</h1>
        </div>

        <div className="space-y-8 text-gray-300">
          <p className="text-lg">
            정치커뮤니티에 대한 문의, 제안, 버그 신고 등을 환영합니다.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">이메일 문의</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                일반적인 문의사항, 제안, 협력 요청 등
              </p>
              <a
                href="mailto:contact@sseuksak.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                contact@sseuksak.com
              </a>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-orange-500/20 p-2">
                  <MessageSquare className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">버그 신고</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                서비스 이용 중 발생한 오류나 버그
              </p>
              <a
                href="mailto:bug@sseuksak.com"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                bug@sseuksak.com
              </a>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-purple-500/20 p-2">
                  <Github className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">오픈소스 기여</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                개발에 참여하고 싶으시다면
              </p>
              <span className="text-gray-500 text-sm">
                (준비 중)
              </span>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-red-500/20 p-2">
                  <Mail className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">신고/삭제 요청</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                부적절한 콘텐츠 신고, 개인정보 삭제 요청
              </p>
              <a
                href="mailto:report@sseuksak.com"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                report@sseuksak.com
              </a>
            </div>
          </div>

          <section className="bg-gray-800/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">문의 시 참고사항</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>문의 내용에 따라 답변까지 1-3 영업일이 소요될 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>버그 신고 시 발생 상황, 브라우저 정보를 함께 알려주시면 빠른 처리가 가능합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>개인정보 관련 문의는 privacy@sseuksak.com으로 보내주세요.</span>
              </li>
            </ul>
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
