import { AlertCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DebatesPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-pink-500/20 p-6 mb-6">
          <MessageCircle className="h-16 w-16 text-pink-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">토론 아레나</h1>
        <p className="text-gray-400 max-w-md mb-8">
          정치 이슈에 대해 찬반 토론을 펼치는 공간입니다.
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
