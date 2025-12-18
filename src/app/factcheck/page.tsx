'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Search,
  AlertCircle,
  XCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
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

interface Factcheck {
  id: string;
  claim: string;
  claim_source: string | null;
  claim_date: string | null;
  politician_id: string | null;
  verdict: string;
  explanation: string;
  sources: string | null;
  agree_count: number;
  disagree_count: number;
  view_count: number;
  created_at: string;
  politician_name: string | null;
  party_name: string | null;
  party_color: string | null;
}

interface FactchecksResponse {
  items: Factcheck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    byVerdict: { verdict: string; count: number }[];
  };
}

const verdictConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  true: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20', label: '사실' },
  mostly_true: { icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: '대체로 사실' },
  half_true: { icon: HelpCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: '절반의 사실' },
  mostly_false: { icon: XCircle, color: 'text-orange-400', bgColor: 'bg-orange-500/20', label: '대체로 거짓' },
  false: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20', label: '거짓' },
  unverifiable: { icon: HelpCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: '검증 불가' },
};

const verdicts = [
  { value: 'all', label: '전체 판정' },
  { value: 'true', label: '사실' },
  { value: 'mostly_true', label: '대체로 사실' },
  { value: 'half_true', label: '절반의 사실' },
  { value: 'mostly_false', label: '대체로 거짓' },
  { value: 'false', label: '거짓' },
  { value: 'unverifiable', label: '검증 불가' },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}

export default function FactcheckPage() {
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['factchecks', { page, verdict, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (verdict !== 'all') params.set('verdict', verdict);
      if (search) params.set('search', search);

      const res = await fetch(`/api/factchecks?${params.toString()}`);
      const json = await res.json() as { success: boolean; data?: FactchecksResponse; error?: string };
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      return json.data as FactchecksResponse;
    },
  });

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  // 통계 계산
  const totalTrue = data?.stats.byVerdict.filter(s => ['true', 'mostly_true'].includes(s.verdict))
    .reduce((sum, s) => sum + s.count, 0) || 0;
  const totalFalse = data?.stats.byVerdict.filter(s => ['false', 'mostly_false'].includes(s.verdict))
    .reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-green-500/20 p-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">팩트체크</h1>
            <p className="text-muted-foreground">정치인 발언과 뉴스의 사실 여부를 검증합니다</p>
          </div>
        </div>

        {/* 전체 통계 */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{data.total}</div>
                <div className="text-sm text-muted-foreground">전체 검증</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{totalTrue}</div>
                <div className="text-sm text-muted-foreground">사실/대체로 사실</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{totalFalse}</div>
                <div className="text-sm text-muted-foreground">거짓/대체로 거짓</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {data?.stats.byVerdict.find(s => s.verdict === 'half_true')?.count || 0}
                </div>
                <div className="text-sm text-muted-foreground">절반의 사실</div>
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
                  placeholder="발언, 정치인 검색..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10 bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <Select value={verdict} onValueChange={(v) => handleFilterChange(setVerdict, v)}>
                <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {verdicts.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 팩트체크 목록 */}
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
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">팩트체크가 없습니다</h3>
              <p className="text-muted-foreground">검색 조건을 변경해보세요.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.items.map((factcheck) => {
              const config = verdictConfig[factcheck.verdict] || verdictConfig.unverifiable;
              const VerdictIcon = config.icon;

              return (
                <Card key={factcheck.id} className="bg-card border-border hover:border-zinc-600 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* 왼쪽: 판정 */}
                      <div className="flex-shrink-0 md:w-32">
                        <div className={`rounded-lg p-4 ${config.bgColor} text-center`}>
                          <VerdictIcon className={`h-8 w-8 mx-auto mb-2 ${config.color}`} />
                          <div className={`font-bold ${config.color}`}>{config.label}</div>
                        </div>
                      </div>

                      {/* 중앙: 내용 */}
                      <div className="flex-1 min-w-0">
                        {/* 발언자 정보 */}
                        {factcheck.politician_name && (
                          <div className="flex items-center gap-2 mb-2">
                            <Link
                              href={`/politicians/${factcheck.politician_id}`}
                              className="font-medium hover:text-primary"
                            >
                              {factcheck.politician_name}
                            </Link>
                            {factcheck.party_name && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: factcheck.party_color || '#808080',
                                  color: factcheck.party_color || '#808080',
                                }}
                              >
                                {factcheck.party_name}
                              </Badge>
                            )}
                            {factcheck.claim_date && (
                              <span className="text-xs text-muted-foreground">{factcheck.claim_date}</span>
                            )}
                          </div>
                        )}

                        {/* 주장 */}
                        <blockquote className="text-lg font-medium border-l-4 border-zinc-700 pl-4 mb-3">
                          "{factcheck.claim}"
                        </blockquote>

                        {/* 출처 */}
                        {factcheck.claim_source && (
                          <div className="text-sm text-muted-foreground mb-2">
                            출처: {factcheck.claim_source}
                          </div>
                        )}

                        {/* 설명 */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {factcheck.explanation}
                        </p>
                      </div>

                      {/* 오른쪽: 통계 */}
                      <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 md:w-24 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{factcheck.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{factcheck.agree_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-400">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{factcheck.disagree_count}</span>
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
