'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Flame,
  AlertCircle,
  ChevronRight,
  Target,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Politician {
  id: string;
  name: string;
  party_id: string | null;
  party_name: string | null;
  party_color: string | null;
  region: string | null;
  position: string | null;
  avatar_url: string | null;
  attendance_rate: number;
  bill_count: number;
  approval_rating: number;
  is_trending: number;
  tags: string[];
}

interface PoliticiansResponse {
  items: Politician[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-black font-bold text-lg">
        🥇
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-black font-bold text-lg">
        🥈
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-400 text-black font-bold text-lg">
        🥉
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-700 text-white font-bold text-sm">
      {rank}
    </div>
  );
}

export default function TrendingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trending-politicians'],
    queryFn: async () => {
      const res = await fetch('/api/politicians?trending=true&limit=20');
      const json = await res.json() as { success: boolean; data?: PoliticiansResponse; error?: string };
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      return json.data as PoliticiansResponse;
    },
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-orange-500/20 p-3">
            <TrendingUp className="h-8 w-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">트렌딩</h1>
            <p className="text-muted-foreground">실시간 화제의 정치인 순위</p>
          </div>
        </div>

        {/* 설명 카드 */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame className="h-5 w-5" />
              <span className="font-medium">HOT 정치인</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              현재 가장 주목받고 있는 정치인들입니다. 뉴스 언급, 활동량, 사용자 관심도를 기반으로 선정됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 트렌딩 목록 */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <Card className="bg-card border-border p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">데이터를 불러올 수 없습니다</h3>
              <p className="text-muted-foreground">잠시 후 다시 시도해주세요.</p>
            </div>
          </Card>
        ) : data?.items.length === 0 ? (
          <Card className="bg-card border-border p-8">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">트렌딩 정치인이 없습니다</h3>
              <p className="text-muted-foreground">현재 화제의 정치인이 없습니다.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.items.map((politician, index) => (
              <Link key={politician.id} href={`/politicians/${politician.id}`}>
                <Card className={`bg-card border-border hover:border-orange-500/50 transition-all cursor-pointer ${
                  index < 3 ? 'bg-gradient-to-r from-orange-500/5 to-transparent' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* 순위 */}
                      <RankBadge rank={index + 1} />

                      {/* 프로필 */}
                      <Avatar className="h-14 w-14 border-2" style={{ borderColor: politician.party_color || '#808080' }}>
                        {politician.avatar_url && (
                          <AvatarImage src={politician.avatar_url} alt={politician.name} />
                        )}
                        <AvatarFallback
                          className="text-lg font-bold text-white"
                          style={{ backgroundColor: politician.party_color || '#808080' }}
                        >
                          {politician.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{politician.name}</span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: politician.party_color || '#808080',
                              color: politician.party_color || '#808080',
                            }}
                          >
                            {politician.party_name || '무소속'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {politician.region && <span>{politician.region}</span>}
                          {politician.position && <span> · {politician.position}</span>}
                        </div>
                        {/* 태그 */}
                        {politician.tags && politician.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {politician.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-zinc-800">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 통계 */}
                      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="text-center">
                          <div className="font-semibold text-foreground">{politician.attendance_rate}%</div>
                          <div className="text-xs">출석률</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-foreground">{politician.bill_count}</div>
                          <div className="text-xs">법안</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-400">{politician.approval_rating}%</div>
                          <div className="text-xs">지지율</div>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 하단 링크 */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link href="/politicians">
            <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-primary/20 p-2">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">전체 정치인</div>
                  <div className="text-xs text-muted-foreground">모든 정치인 보기</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/promises">
            <Card className="bg-card border-border hover:border-blue-500 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-500/20 p-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">공약 추적</div>
                  <div className="text-xs text-muted-foreground">공약 이행 현황</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
