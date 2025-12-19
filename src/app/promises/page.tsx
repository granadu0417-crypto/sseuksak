'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  BarChart3,
  PieChart,
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
} from '@/components/ui/dropdown-menu';

// 공약 더미 데이터
const promisesData = [
  { id: 1, title: '청년 주거 지원금 50만원 확대', politician: '김민수', party: '더불어민주당', category: '복지', status: 'completed', progress: 100, startDate: '2024-06', targetDate: '2024-12', likes: 1234, comments: 89 },
  { id: 2, title: '중소기업 법인세 10% 감면', politician: '이정희', party: '국민의힘', category: '경제', status: 'in_progress', progress: 72, startDate: '2024-07', targetDate: '2025-06', likes: 892, comments: 156 },
  { id: 3, title: '전국 초등학교 디지털 교육 인프라 구축', politician: '박서준', party: '조국혁신당', category: '교육', status: 'in_progress', progress: 45, startDate: '2024-05', targetDate: '2025-12', likes: 2341, comments: 234 },
  { id: 4, title: '탄소중립 2050 로드맵 수립', politician: '최영미', party: '더불어민주당', category: '환경', status: 'in_progress', progress: 38, startDate: '2024-08', targetDate: '2025-12', likes: 1567, comments: 178 },
  { id: 5, title: '국민연금 개혁안 마련', politician: '정태우', party: '국민의힘', category: '복지', status: 'pending', progress: 15, startDate: '2024-09', targetDate: '2026-06', likes: 3421, comments: 567 },
  { id: 6, title: '청년 창업 지원금 2배 확대', politician: '한소희', party: '개혁신당', category: '경제', status: 'completed', progress: 100, startDate: '2024-03', targetDate: '2024-09', likes: 987, comments: 123 },
  { id: 7, title: '지방 의료원 확충', politician: '윤재호', party: '더불어민주당', category: '복지', status: 'in_progress', progress: 55, startDate: '2024-04', targetDate: '2025-08', likes: 1876, comments: 234 },
  { id: 8, title: '반도체 산업 지원 특별법', politician: '김태희', party: '국민의힘', category: '경제', status: 'completed', progress: 100, startDate: '2024-02', targetDate: '2024-08', likes: 2134, comments: 189 },
  { id: 9, title: '공공임대주택 10만호 건설', politician: '이준혁', party: '조국혁신당', category: '주거', status: 'in_progress', progress: 28, startDate: '2024-06', targetDate: '2027-12', likes: 4523, comments: 456 },
  { id: 10, title: '최저임금 1만5천원 달성', politician: '박지현', party: '더불어민주당', category: '노동', status: 'failed', progress: 0, startDate: '2024-01', targetDate: '2024-12', likes: 5678, comments: 892 },
];

const categories = ['전체', '복지', '경제', '교육', '환경', '주거', '노동', '안보'];
const parties = ['전체', '더불어민주당', '국민의힘', '조국혁신당', '개혁신당'];
const statuses = [
  { id: 'all', label: '전체', icon: BarChart3 },
  { id: 'completed', label: '완료', icon: CheckCircle },
  { id: 'in_progress', label: '진행중', icon: Clock },
  { id: 'pending', label: '대기', icon: AlertCircle },
  { id: 'failed', label: '무산', icon: XCircle },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20', label: '완료' },
  in_progress: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: '진행중' },
  pending: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/20', label: '대기' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: '무산' },
};

const partyColors: Record<string, string> = {
  '더불어민주당': 'text-[#0066ff]',
  '국민의힘': 'text-[#e61e2b]',
  '조국혁신당': 'text-[#00c4b4]',
  '개혁신당': 'text-[#ff6b00]',
};

export default function PromisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedParty, setSelectedParty] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 통계 계산
  const stats = {
    total: promisesData.length,
    completed: promisesData.filter(p => p.status === 'completed').length,
    inProgress: promisesData.filter(p => p.status === 'in_progress').length,
    failed: promisesData.filter(p => p.status === 'failed').length,
    avgProgress: Math.round(promisesData.reduce((acc, p) => acc + p.progress, 0) / promisesData.length),
  };

  // 필터링
  const filteredPromises = promisesData.filter(p => {
    if (searchQuery && !p.title.includes(searchQuery) && !p.politician.includes(searchQuery)) return false;
    if (selectedCategory !== '전체' && p.category !== selectedCategory) return false;
    if (selectedParty !== '전체' && p.party !== selectedParty) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              공약 추적기
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              정치인들의 공약 이행 현황을 실시간으로 추적합니다
            </p>
          </div>

          {/* 통계 대시보드 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">전체 공약</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">완료</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">진행중</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">무산</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-primary/20 to-purple-600/20 border-primary/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats.avgProgress}%</p>
                <p className="text-xs text-muted-foreground">평균 이행률</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            {/* 검색 */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공약, 정치인 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700"
              />
            </div>

            {/* 필터들 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 상태 탭 */}
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList className="bg-zinc-800/50 h-9">
                  {statuses.map((s) => (
                    <TabsTrigger key={s.id} value={s.id} className="text-xs h-7 px-2">
                      <s.icon className="h-3 w-3 mr-1" />
                      {s.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* 분야 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    분야: {selectedCategory}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 정당 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    정당: {selectedParty === '전체' ? '전체' : selectedParty.slice(0, 4) + '...'}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {parties.map((party) => (
                    <DropdownMenuItem key={party} onClick={() => setSelectedParty(party)}>
                      {party}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* 공약 리스트 */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            총 <span className="text-foreground font-medium">{filteredPromises.length}</span>개 공약
          </p>
        </div>

        <div className="space-y-4">
          {filteredPromises.map((promise) => {
            const status = statusConfig[promise.status];
            const StatusIcon = status.icon;

            return (
              <Card key={promise.id} className="bg-card border-border hover:border-zinc-600 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* 메인 콘텐츠 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${status.bg}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{promise.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className={`font-medium ${partyColors[promise.party] || 'text-zinc-400'}`}>
                              {promise.politician}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{promise.party}</span>
                            <Badge variant="outline">{promise.category}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* 진행률 바 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {promise.startDate} → {promise.targetDate}
                          </span>
                          <span className="font-bold">{promise.progress}%</span>
                        </div>
                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              promise.status === 'completed' ? 'bg-green-500' :
                              promise.status === 'failed' ? 'bg-red-500' :
                              promise.status === 'in_progress' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${promise.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 사이드 정보 */}
                    <div className="flex md:flex-col items-center gap-4 md:gap-2 md:min-w-[100px]">
                      <Badge className={`${status.bg} ${status.color}`}>
                        {status.label}
                      </Badge>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {promise.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {promise.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPromises.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-muted-foreground">다른 필터를 사용해보세요</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
