'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  BarChart3,
  Grid3X3,
  List,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { PoliticianCard } from '@/components/features/PoliticianCard';

// 더미 데이터 - 정치인 목록
const politiciansData = [
  { id: '1', name: '김민수', party: '더불어민주당', region: '서울 강남구', position: '국회의원', stats: { attendance: 92, bills: 78, promises: 65 }, tags: ['경제', '청년'], likes: 1523, comments: 234, trend: 'up' as const, rank: 1 },
  { id: '2', name: '이정희', party: '국민의힘', region: '부산 해운대구', position: '국회의원', stats: { attendance: 88, bills: 65, promises: 72 }, tags: ['복지', '교육'], likes: 1342, comments: 189, trend: 'up' as const, rank: 2 },
  { id: '3', name: '박서준', party: '조국혁신당', region: '서울 마포구', position: '국회의원', stats: { attendance: 95, bills: 82, promises: 58 }, tags: ['개혁', '사법'], likes: 1256, comments: 312, trend: 'stable' as const, rank: 3 },
  { id: '4', name: '최영미', party: '더불어민주당', region: '경기 성남시', position: '국회의원', stats: { attendance: 78, bills: 45, promises: 81 }, tags: ['환경', '여성'], likes: 987, comments: 156, trend: 'down' as const, rank: 4 },
  { id: '5', name: '정태우', party: '국민의힘', region: '대구 수성구', position: '국회의원', stats: { attendance: 91, bills: 71, promises: 69 }, tags: ['안보', '외교'], likes: 876, comments: 134, trend: 'up' as const, rank: 5 },
  { id: '6', name: '한소희', party: '개혁신당', region: '인천 남동구', position: '국회의원', stats: { attendance: 85, bills: 52, promises: 77 }, tags: ['청년', '주거'], likes: 823, comments: 198, trend: 'up' as const, rank: 6 },
  { id: '7', name: '윤재호', party: '더불어민주당', region: '광주 서구', position: '국회의원', stats: { attendance: 89, bills: 68, promises: 62 }, tags: ['지역', '문화'], likes: 756, comments: 145, trend: 'stable' as const, rank: 7 },
  { id: '8', name: '김태희', party: '국민의힘', region: '서울 송파구', position: '국회의원', stats: { attendance: 82, bills: 55, promises: 71 }, tags: ['경제', '금융'], likes: 698, comments: 112, trend: 'down' as const, rank: 8 },
  { id: '9', name: '이준혁', party: '조국혁신당', region: '경기 수원시', position: '국회의원', stats: { attendance: 94, bills: 79, promises: 55 }, tags: ['개혁', '노동'], likes: 645, comments: 167, trend: 'up' as const, rank: 9 },
  { id: '10', name: '박지현', party: '더불어민주당', region: '서울 영등포구', position: '국회의원', stats: { attendance: 87, bills: 61, promises: 68 }, tags: ['청년', '디지털'], likes: 612, comments: 143, trend: 'stable' as const, rank: 10 },
  { id: '11', name: '송민호', party: '국민의힘', region: '울산 남구', position: '국회의원', stats: { attendance: 79, bills: 42, promises: 74 }, tags: ['산업', '노동'], likes: 534, comments: 98, trend: 'down' as const, rank: 11 },
  { id: '12', name: '강다니엘', party: '무소속', region: '제주도', position: '국회의원', stats: { attendance: 96, bills: 85, promises: 82 }, tags: ['환경', '관광'], likes: 1876, comments: 423, trend: 'up' as const, rank: 12 },
];

const parties = [
  { id: 'all', name: '전체', color: 'bg-zinc-600' },
  { id: 'democratic', name: '더불어민주당', color: 'bg-[#0066ff]' },
  { id: 'ppp', name: '국민의힘', color: 'bg-[#e61e2b]' },
  { id: 'rebuild', name: '조국혁신당', color: 'bg-[#00c4b4]' },
  { id: 'reform', name: '개혁신당', color: 'bg-[#ff6b00]' },
  { id: 'independent', name: '무소속', color: 'bg-zinc-500' },
];

const regions = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const sortOptions = [
  { id: 'rank', label: '랭킹순' },
  { id: 'name', label: '이름순' },
  { id: 'attendance', label: '출석률순' },
  { id: 'bills', label: '법안발의순' },
  { id: 'promises', label: '공약이행순' },
  { id: 'likes', label: '인기순' },
];

export default function PoliticiansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [sortBy, setSortBy] = useState('rank');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 필터링
  const filteredPoliticians = politiciansData.filter((p) => {
    if (searchQuery && !p.name.includes(searchQuery) && !p.region.includes(searchQuery)) {
      return false;
    }
    if (selectedParty !== 'all') {
      const partyMap: Record<string, string> = {
        democratic: '더불어민주당',
        ppp: '국민의힘',
        rebuild: '조국혁신당',
        reform: '개혁신당',
        independent: '무소속',
      };
      if (p.party !== partyMap[selectedParty]) return false;
    }
    if (selectedRegion !== '전체' && !p.region.includes(selectedRegion)) {
      return false;
    }
    return true;
  });

  // 정렬
  const sortedPoliticians = [...filteredPoliticians].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'attendance': return b.stats.attendance - a.stats.attendance;
      case 'bills': return b.stats.bills - a.stats.bills;
      case 'promises': return b.stats.promises - a.stats.promises;
      case 'likes': return b.likes - a.likes;
      default: return a.rank - b.rank;
    }
  });

  // 통계
  const stats = {
    total: politiciansData.length,
    avgAttendance: Math.round(politiciansData.reduce((acc, p) => acc + p.stats.attendance, 0) / politiciansData.length),
    avgBills: Math.round(politiciansData.reduce((acc, p) => acc + p.stats.bills, 0) / politiciansData.length),
    trending: politiciansData.filter((p) => p.trend === 'up').length,
  };

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                정치인 카드
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                국회의원들의 활동을 한눈에 확인하세요
              </p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">전체 의원</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
                  <p className="text-xs text-muted-foreground">평균 출석률</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgBills}%</p>
                  <p className="text-xs text-muted-foreground">평균 법안활동</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.trending}</p>
                  <p className="text-xs text-muted-foreground">상승세 의원</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            {/* 검색 */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 지역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700"
              />
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 정당 필터 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    {parties.find((p) => p.id === selectedParty)?.name || '정당'}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {parties.map((party) => (
                    <DropdownMenuItem
                      key={party.id}
                      onClick={() => setSelectedParty(party.id)}
                      className={selectedParty === party.id ? 'bg-primary/20' : ''}
                    >
                      <span className={`w-3 h-3 rounded-full mr-2 ${party.color}`} />
                      {party.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 지역 필터 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    지역: {selectedRegion}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                  {regions.map((region) => (
                    <DropdownMenuItem
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={selectedRegion === region ? 'bg-primary/20' : ''}
                    >
                      {region}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 정렬 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {sortOptions.find((s) => s.id === sortBy)?.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {sortOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={sortBy === opt.id ? 'bg-primary/20' : ''}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-border mx-1 hidden md:block" />

              {/* 보기 모드 */}
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 px-2 rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 px-2 rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            총 <span className="text-foreground font-medium">{sortedPoliticians.length}</span>명
          </p>
        </div>

        {sortedPoliticians.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-muted-foreground">
                다른 검색어나 필터를 사용해보세요
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedPoliticians.map((politician) => (
              <Link key={politician.id} href={`/politicians/${politician.id}`}>
                <PoliticianCard
                  name={politician.name}
                  party={politician.party}
                  region={politician.region}
                  position={politician.position}
                  stats={politician.stats}
                  tags={politician.tags}
                  likes={politician.likes}
                  comments={politician.comments}
                  trend={politician.trend}
                  rank={politician.rank}
                />
              </Link>
            ))}
          </div>
        ) : (
          /* 리스트 뷰 */
          <Card className="bg-card border-border overflow-hidden">
            <div className="divide-y divide-border">
              {sortedPoliticians.map((politician) => (
                <Link
                  key={politician.id}
                  href={`/politicians/${politician.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-lg font-bold text-muted-foreground w-8">
                    {politician.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{politician.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {politician.party}
                      </Badge>
                      {politician.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {politician.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{politician.region}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-green-400">{politician.stats.attendance}%</p>
                      <p className="text-xs text-muted-foreground">출석률</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-blue-400">{politician.stats.bills}%</p>
                      <p className="text-xs text-muted-foreground">법안</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-purple-400">{politician.stats.promises}%</p>
                      <p className="text-xs text-muted-foreground">공약</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
