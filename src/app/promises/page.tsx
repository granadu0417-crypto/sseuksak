'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Target,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Promise {
  id: string;
  politician_id: string;
  category: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  progress: number;
  evidence_url: string | null;
  politician_name: string;
  party_name: string | null;
  party_color: string | null;
}

interface PromisesResponse {
  items: Promise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    overall: {
      total: number;
      avg_progress: number;
      completed: number;
      in_progress: number;
      not_started: number;
      failed: number;
    };
    byCategory: {
      category: string;
      count: number;
      avg_progress: number;
      completed_count: number;
    }[];
  };
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/20', label: '이행 완료' },
  in_progress: { icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: '진행 중' },
  not_started: { icon: AlertCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: '미착수' },
  failed: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20', label: '이행 실패' },
};

const categories = [
  { value: 'all', label: '전체 분야' },
  { value: '경제', label: '경제' },
  { value: '부동산', label: '부동산' },
  { value: '정치', label: '정치' },
  { value: '안보', label: '안보' },
  { value: '사법', label: '사법' },
  { value: '청년', label: '청년' },
  { value: '디지털', label: '디지털' },
  { value: '복지', label: '복지' },
  { value: '환경', label: '환경' },
];

const statuses = [
  { value: 'all', label: '전체 상태' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'completed', label: '이행 완료' },
  { value: 'not_started', label: '미착수' },
  { value: 'failed', label: '이행 실패' },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

export default function PromisesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['promises', { page, category, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (category !== 'all') params.set('category', category);
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/promises?${params.toString()}`);
      const json = await res.json() as { success: boolean; data?: PromisesResponse; error?: string };
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      return json.data as PromisesResponse;
    },
  });

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const stats = data?.stats.overall;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-blue-500/20 p-3">
            <Target className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">공약 추적기</h1>
            <p className="text-muted-foreground">정치인들의 공약 이행 현황을 추적합니다</p>
          </div>
        </div>

        {/* 전체 통계 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">전체 공약</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {Math.round(stats.avg_progress || 0)}%
                </div>
                <div className="text-sm text-muted-foreground">평균 이행률</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">이행 완료</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.in_progress}</div>
                <div className="text-sm text-muted-foreground">진행 중</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">이행 실패</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 필터 */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="공약, 정치인 검색..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10 bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <Select value={category} onValueChange={(v) => handleFilterChange(setCategory, v)}>
                <SelectTrigger className="w-full md:w-40 bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => handleFilterChange(setStatus, v)}>
                <SelectTrigger className="w-full md:w-40 bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 공약 목록 */}
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
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">공약이 없습니다</h3>
              <p className="text-muted-foreground">검색 조건을 변경해보세요.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.items.map((promise) => {
              const config = statusConfig[promise.status] || statusConfig.not_started;
              const StatusIcon = config.icon;

              return (
                <Card key={promise.id} className="bg-card border-border hover:border-zinc-600 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* 왼쪽: 정치인 정보 */}
                      <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: promise.party_color || '#808080' }}
                        >
                          {promise.politician_name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/politicians/${promise.politician_id}`}
                            className="font-medium hover:text-primary"
                          >
                            {promise.politician_name}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {promise.party_name || '무소속'}
                          </div>
                        </div>
                      </div>

                      {/* 중앙: 공약 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {promise.category}
                          </Badge>
                          <span className={`flex items-center text-xs ${config.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{promise.title}</h3>
                        {promise.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {promise.description}
                          </p>
                        )}
                        {promise.target_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            목표일: {promise.target_date}
                          </p>
                        )}
                      </div>

                      {/* 오른쪽: 진행률 */}
                      <div className="md:w-32 flex-shrink-0">
                        <div className="text-right mb-2">
                          <span className="text-2xl font-bold">{promise.progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              promise.status === 'completed'
                                ? 'bg-green-500'
                                : promise.status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-primary'
                            }`}
                            style={{ width: `${promise.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {data && data.totalPages > 1 && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
