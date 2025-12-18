'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePoliticians, useParties } from '@/lib/api/hooks';
import type { PoliticianWithParty } from '@/lib/types';

// 지역 목록
const regions = [
  { id: 'all', label: '전체 지역' },
  { id: '서울', label: '서울' },
  { id: '경기', label: '경기' },
  { id: '인천', label: '인천' },
  { id: '부산', label: '부산' },
  { id: '대구', label: '대구' },
  { id: '광주', label: '광주' },
  { id: '대전', label: '대전' },
  { id: '울산', label: '울산' },
  { id: '세종', label: '세종' },
  { id: '강원', label: '강원' },
  { id: '충북', label: '충북' },
  { id: '충남', label: '충남' },
  { id: '전북', label: '전북' },
  { id: '전남', label: '전남' },
  { id: '경북', label: '경북' },
  { id: '경남', label: '경남' },
  { id: '제주', label: '제주' },
];

function PoliticianCard({ politician }: { politician: PoliticianWithParty }) {
  const promiseRate = politician.promise_count > 0
    ? Math.round((politician.promise_completed / politician.promise_count) * 100)
    : 0;

  return (
    <Link href={`/politicians/${politician.id}`}>
      <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2" style={{ borderColor: politician.party_color || '#808080' }}>
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {politician.name}
                </h3>
                {politician.is_trending === 1 && (
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    HOT
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: politician.party_color || '#808080',
                    color: politician.party_color || '#808080',
                  }}
                >
                  {politician.party_name || '무소속'}
                </Badge>
                {politician.region && <span>{politician.region}</span>}
                {politician.position && <span>· {politician.position}</span>}
              </div>
              {politician.tags && politician.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {politician.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-zinc-800">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{politician.attendance_rate}%</div>
              <div className="text-xs text-muted-foreground">출석률</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{politician.bill_count}</div>
              <div className="text-xs text-muted-foreground">법안</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{promiseRate}%</div>
              <div className="text-xs text-muted-foreground">공약이행</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{politician.approval_rating}%</div>
              <div className="text-xs text-muted-foreground">지지율</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PoliticianListItem({ politician }: { politician: PoliticianWithParty }) {
  const promiseRate = politician.promise_count > 0
    ? Math.round((politician.promise_completed / politician.promise_count) * 100)
    : 0;

  return (
    <Link href={`/politicians/${politician.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all cursor-pointer">
        <Avatar className="h-12 w-12 border-2" style={{ borderColor: politician.party_color || '#808080' }}>
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">{politician.name}</span>
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
            {politician.is_trending === 1 && (
              <TrendingUp className="h-4 w-4 text-orange-400" />
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {politician.region} · {politician.position}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="font-bold text-primary">{politician.attendance_rate}%</div>
            <div className="text-xs text-muted-foreground">출석</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{politician.bill_count}</div>
            <div className="text-xs text-muted-foreground">법안</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-400">{promiseRate}%</div>
            <div className="text-xs text-muted-foreground">공약</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PoliticiansPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [party, setParty] = useState('all');
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState('name');
  const [showTrending, setShowTrending] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: parties } = useParties();
  const { data, isLoading, isError } = usePoliticians({
    page,
    limit,
    party: party !== 'all' ? party : undefined,
    region: region !== 'all' ? region : undefined,
    search: search || undefined,
    trending: showTrending || undefined,
    sort,
    order: sort === 'name' ? 'asc' : 'desc',
  });

  // 필터 변경 시 페이지 리셋
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                정치인 카드
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                국회의원들의 활동과 공약 이행률을 확인하세요
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 지역, 직위 검색..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <Select value={party} onValueChange={(v) => handleFilterChange(setParty, v)}>
              <SelectTrigger className="w-[140px] bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="정당" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">전체 정당</SelectItem>
                {parties?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.short_name || p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={(v) => handleFilterChange(setRegion, v)}>
              <SelectTrigger className="w-[130px] bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="지역" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => handleFilterChange(setSort, v)}>
              <SelectTrigger className="w-[130px] bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="attendance_rate">출석률순</SelectItem>
                <SelectItem value="bill_count">법안수순</SelectItem>
                <SelectItem value="approval_rating">지지율순</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showTrending ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setShowTrending(!showTrending); setPage(1); }}
              className={showTrending ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              HOT
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 로딩 */}
        {isLoading && <LoadingSkeleton viewMode={viewMode} />}

        {/* 에러 */}
        {isError && (
          <Card className="bg-card border-border p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">정치인 목록을 불러올 수 없습니다</h3>
              <p className="text-muted-foreground">잠시 후 다시 시도해주세요.</p>
            </div>
          </Card>
        )}

        {/* 결과 없음 */}
        {!isLoading && !isError && data?.items.length === 0 && (
          <Card className="bg-card border-border p-8">
            <div className="flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          </Card>
        )}

        {/* 정치인 목록 */}
        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                총 {data.total}명의 정치인
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.items.map((politician) => (
                  <PoliticianCard key={politician.id} politician={politician} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {data.items.map((politician) => (
                  <PoliticianListItem key={politician.id} politician={politician} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-zinc-800/50 border-zinc-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>

                <div className="flex items-center gap-1">
                  {/* 첫 페이지 */}
                  {page > 3 && (
                    <>
                      <Button
                        variant={page === 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(1)}
                        className="w-9 bg-zinc-800/50 border-zinc-700"
                      >
                        1
                      </Button>
                      {page > 4 && <span className="px-2 text-muted-foreground">...</span>}
                    </>
                  )}

                  {/* 현재 페이지 주변 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null;
                    if (page > 3 && pageNum === 1) return null;
                    if (page < totalPages - 2 && pageNum === totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`w-9 ${page === pageNum ? '' : 'bg-zinc-800/50 border-zinc-700'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {/* 마지막 페이지 */}
                  {page < totalPages - 2 && totalPages > 5 && (
                    <>
                      {page < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                      <Button
                        variant={page === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        className="w-9 bg-zinc-800/50 border-zinc-700"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-zinc-800/50 border-zinc-700"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 페이지 정보 */}
            {totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {page} / {totalPages} 페이지
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
