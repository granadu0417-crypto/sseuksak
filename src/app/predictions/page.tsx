'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Coins,
  Calendar,
  AlertCircle,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface PredictionOption {
  id: string;
  option_text: string;
  odds: number;
  bet_count: number;
  total_points: number;
}

interface Prediction {
  id: string;
  title: string;
  description: string | null;
  category: string;
  end_date: string;
  status: string;
  result_option_id: string | null;
  total_participants: number;
  total_points: number;
  created_at: string;
  resolved_at: string | null;
  options: PredictionOption[];
}

interface PredictionsResponse {
  items: Prediction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    byStatus: { status: string; count: number }[];
  };
  categories: string[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  active: { icon: Clock, color: 'text-green-400', bgColor: 'bg-green-500/20', label: '진행 중' },
  closed: { icon: XCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: '마감' },
  resolved: { icon: CheckCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: '결과 발표' },
};

const statuses = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '진행 중' },
  { value: 'closed', label: '마감' },
  { value: 'resolved', label: '결과 발표' },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  );
}

function formatTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return '마감됨';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}일 ${hours}시간 남음`;
  if (hours > 0) return `${hours}시간 남음`;
  return '곧 마감';
}

export default function PredictionsPage() {
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['predictions', { page, status, category }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (status !== 'all') params.set('status', status);
      if (category !== 'all') params.set('category', category);

      const res = await fetch(`/api/predictions?${params.toString()}`);
      const json = await res.json() as { success: boolean; data?: PredictionsResponse; error?: string };
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      return json.data as PredictionsResponse;
    },
  });

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const activeCount = data?.stats.byStatus.find(s => s.status === 'active')?.count || 0;
  const resolvedCount = data?.stats.byStatus.find(s => s.status === 'resolved')?.count || 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-purple-500/20 p-3">
            <Trophy className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">예측 리그</h1>
            <p className="text-muted-foreground">정치 이벤트를 예측하고 포인트를 얻으세요</p>
          </div>
        </div>

        {/* 전체 통계 */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{data.total}</div>
                <div className="text-sm text-muted-foreground">전체 예측</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{activeCount}</div>
                <div className="text-sm text-muted-foreground">진행 중</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{resolvedCount}</div>
                <div className="text-sm text-muted-foreground">결과 발표</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {data.items.reduce((sum, p) => sum + p.total_participants, 0)}
                </div>
                <div className="text-sm text-muted-foreground">총 참여자</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 필터 */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={status} onValueChange={(v) => handleFilterChange(setStatus, v)}>
                <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data?.categories && data.categories.length > 0 && (
                <Select value={category} onValueChange={(v) => handleFilterChange(setCategory, v)}>
                  <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    {data.categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 예측 목록 */}
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
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">예측이 없습니다</h3>
              <p className="text-muted-foreground">새로운 예측이 곧 등록됩니다.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.items.map((prediction) => {
              const config = statusConfig[prediction.status] || statusConfig.active;
              const StatusIcon = config.icon;
              const totalBets = prediction.options.reduce((sum, o) => sum + o.bet_count, 0);

              return (
                <Card key={prediction.id} className="bg-card border-border hover:border-purple-500/50 transition-colors">
                  <CardContent className="p-5">
                    {/* 상단: 제목 및 상태 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {prediction.category}
                          </Badge>
                          <span className={`flex items-center text-xs ${config.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{prediction.title}</h3>
                        {prediction.description && (
                          <p className="text-sm text-muted-foreground mt-1">{prediction.description}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className={`font-medium ${prediction.status === 'active' ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {prediction.status === 'active' ? formatTimeRemaining(prediction.end_date) : prediction.end_date}
                        </div>
                        <div className="text-muted-foreground text-xs mt-1 flex items-center justify-end gap-1">
                          <Users className="h-3 w-3" />
                          {prediction.total_participants}명 참여
                        </div>
                      </div>
                    </div>

                    {/* 선택지 */}
                    <div className="space-y-2">
                      {prediction.options.map((option) => {
                        const percentage = totalBets > 0 ? (option.bet_count / totalBets) * 100 : 0;
                        const isWinner = prediction.result_option_id === option.id;

                        return (
                          <div
                            key={option.id}
                            className={`relative rounded-lg p-3 ${
                              isWinner
                                ? 'bg-green-500/20 border border-green-500/50'
                                : 'bg-zinc-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-medium ${isWinner ? 'text-green-400' : ''}`}>
                                {option.option_text}
                                {isWinner && <CheckCircle className="inline h-4 w-4 ml-2 text-green-400" />}
                              </span>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-muted-foreground">
                                  {option.bet_count}명
                                </span>
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                                  x{option.odds.toFixed(2)}
                                </Badge>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* 하단: 액션 버튼 */}
                    {prediction.status === 'active' && (
                      <div className="mt-4 flex justify-end">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Coins className="h-4 w-4 mr-2" />
                          예측 참여하기
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-zinc-800/50 border-zinc-700"
            >
              이전
            </Button>
            <span className="px-4 text-sm text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="bg-zinc-800/50 border-zinc-700"
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
