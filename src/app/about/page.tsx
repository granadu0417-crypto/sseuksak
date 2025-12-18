import { Info, Users, Target, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-full bg-blue-500/20 p-3">
            <Info className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">서비스 소개</h1>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              우리의 목표
            </h2>
            <p className="leading-relaxed">
              정치커뮤니티는 대한민국 시민들이 정치에 더 쉽게 참여하고,
              정확한 정보를 바탕으로 민주주의를 실천할 수 있도록 돕는 플랫폼입니다.
              복잡한 정치 정보를 쉽게 이해할 수 있도록 정리하고,
              시민들 간의 건전한 토론 문화를 만들어가고자 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              주요 기능
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong className="text-white">정치인 정보:</strong> 국회의원, 정당 대표 등 주요 정치인들의 프로필과 활동 정보</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong className="text-white">게시판:</strong> 자유로운 정치 토론과 의견 교환</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong className="text-white">팩트체크:</strong> 정치 관련 주장들의 사실 여부 검증 (준비 중)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong className="text-white">공약 추적:</strong> 정치인들의 공약 이행 현황 추적 (준비 중)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              운영 원칙
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">정치적 중립:</strong> 특정 정당이나 정치인을 지지하거나 비방하지 않습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">사실 기반:</strong> 공식 데이터와 검증된 정보만을 제공합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">투명성:</strong> 정보의 출처를 명확히 밝힙니다.</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800/50 rounded-lg p-6">
            <p className="text-sm text-gray-400">
              본 서비스는 비영리 목적으로 운영되며, 국회 열린데이터 포털 등
              공공 데이터를 활용하여 정보를 제공합니다.
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
