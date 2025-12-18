import { AlertCircle, Radio } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LivePage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-red-500/20 p-6 mb-6">
          <Radio className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">국회 LIVE</h1>
        <p className="text-gray-400 max-w-md mb-8">
          국회 본회의와 위원회 회의를 실시간으로 시청하고 토론하는 기능입니다.
          <br />현재 준비 중입니다.
        </p>
        <div className="flex items-center gap-2 text-yellow-500 mb-8">
          <AlertCircle className="h-5 w-5" />
          <span>Coming Soon</span>
        </div>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
