'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  ChevronDown,
  Flame,
  Clock,
  TrendingUp,
  Quote,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 팩트체크 더미 데이터
const factChecksData = [
  { id: 1, claim: '"현 정부 들어 청년 실업률이 역대 최고치를 기록했다"', speaker: '김민수', party: '더불어민주당', date: '2024-12-15', verdict: 'mostly_false', explanation: '청년 실업률은 7.2%로 역대 최고치(2016년 9.8%)보다 낮습니다. 다만 체감 실업률은 상승했습니다.', sources: ['통계청', 'OECD'], agrees: 234, disagrees: 567, comments: 89 },
  { id: 2, claim: '"우리나라 GDP 대비 복지 지출은 OECD 최하위권이다"', speaker: '이정희', party: '국민의힘', date: '2024-12-14', verdict: 'true', explanation: '2023년 기준 GDP 대비 사회복지 지출 비율 12.3%로 OECD 38개국 중 35위입니다.', sources: ['OECD', '기획재정부'], agrees: 892, disagrees: 45, comments: 156 },
  { id: 3, claim: '"지난 5년간 부동산 가격이 2배 올랐다"', speaker: '박서준', party: '조국혁신당', date: '2024-12-13', verdict: 'half_true', explanation: '서울 아파트 기준 약 52% 상승했으나, 전국 평균은 34% 상승으로 2배는 과장된 표현입니다.', sources: ['KB부동산', '한국부동산원'], agrees: 445, disagrees: 312, comments: 234 },
  { id: 4, claim: '"현재 출산율은 세계 최저 수준이다"', speaker: '최영미', party: '더불어민주당', date: '2024-12-12', verdict: 'true', explanation: '2023년 합계출산율 0.72명으로 OECD 및 전 세계 최저 수준입니다.', sources: ['통계청', 'UN'], agrees: 1523, disagrees: 23, comments: 312 },
  { id: 5, claim: '"탄소 배출량을 30% 감축했다"', speaker: '정태우', party: '국민의힘', date: '2024-12-11', verdict: 'mostly_false', explanation: '공식 통계상 탄소 배출량 감축률은 8.2%입니다. 30%는 특정 산업 분야만 해당됩니다.', sources: ['환경부', 'IEA'], agrees: 123, disagrees: 678, comments: 145 },
  { id: 6, claim: '"최저임금 인상으로 고용이 감소했다"', speaker: '한소희', party: '개혁신당', date: '2024-12-10', verdict: 'unverifiable', explanation: '고용 변화는 다양한 요인의 복합 작용 결과로, 최저임금만의 영향을 분리하기 어렵습니다.', sources: ['고용노동부', '한국노동연구원'], agrees: 234, disagrees: 234, comments: 189 },
];

const verdictConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  true: { label: '사실', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
  mostly_true: { label: '대체로 사실', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/20' },
  half_true: { label: '절반의 사실', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  mostly_false: { label: '대체로 거짓', icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-500/20' },
  false: { label: '거짓', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20' },
  unverifiable: { label: '판단 불가', icon: HelpCircle, color: 'text-zinc-400', bg: 'bg-zinc-400/20' },
};

const partyColors: Record<string, string> = {
  '더불어민주당': 'text-[#0066ff]',
  '국민의힘': 'text-[#e61e2b]',
  '조국혁신당': 'text-[#00c4b4]',
  '개혁신당': 'text-[#ff6b00]',
};

export default function FactCheckPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // 통계
  const stats = {
    total: factChecksData.length,
    true: factChecksData.filter(f => f.verdict === 'true' || f.verdict === 'mostly_true').length,
    false: factChecksData.filter(f => f.verdict === 'false' || f.verdict === 'mostly_false').length,
    mixed: factChecksData.filter(f => f.verdict === 'half_true' || f.verdict === 'unverifiable').length,
  };

  // 필터링
  const filteredChecks = factChecksData.filter(f => {
    if (searchQuery && !f.claim.includes(searchQuery) && !f.speaker.includes(searchQuery)) return false;
    if (selectedVerdict !== 'all' && f.verdict !== selectedVerdict) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              팩트체크 아레나
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              정치인 발언을 검증하고 토론합니다
            </p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">전체 검증</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{stats.true}</p>
                <p className="text-xs text-muted-foreground">사실</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{stats.false}</p>
                <p className="text-xs text-muted-foreground">거짓</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.mixed}</p>
                <p className="text-xs text-muted-foreground">혼합/불가</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="발언, 정치인 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={selectedVerdict} onValueChange={setSelectedVerdict}>
                <TabsList className="bg-zinc-800/50 h-9">
                  <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
                  <TabsTrigger value="true" className="text-xs text-green-400">사실</TabsTrigger>
                  <TabsTrigger value="half_true" className="text-xs text-yellow-400">혼합</TabsTrigger>
                  <TabsTrigger value="mostly_false" className="text-xs text-red-400">거짓</TabsTrigger>
                </TabsList>
              </Tabs>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {sortBy === 'latest' ? '최신순' : '인기순'}
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('latest')}>최신순</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('popular')}>인기순</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* 팩트체크 리스트 */}
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {filteredChecks.map((check) => {
          const verdict = verdictConfig[check.verdict];
          const VerdictIcon = verdict.icon;
          const totalVotes = check.agrees + check.disagrees;
          const agreePercent = totalVotes > 0 ? Math.round((check.agrees / totalVotes) * 100) : 50;

          return (
            <Card key={check.id} className="bg-card border-border hover:border-zinc-600 transition-colors">
              <CardContent className="p-5">
                {/* 판정 배지 */}
                <div className="flex items-start justify-between mb-4">
                  <Badge className={`${verdict.bg} ${verdict.color} text-sm px-3 py-1`}>
                    <VerdictIcon className="h-4 w-4 mr-1" />
                    {verdict.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{check.date}</span>
                </div>

                {/* 발언 인용 */}
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 border-l-4 border-primary">
                  <Quote className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">{check.claim}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{check.speaker.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={`font-medium ${partyColors[check.party] || 'text-zinc-400'}`}>
                      {check.speaker}
                    </span>
                    <span className="text-muted-foreground">· {check.party}</span>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-muted-foreground mb-4">{check.explanation}</p>

                {/* 출처 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-muted-foreground">출처:</span>
                  {check.sources.map((source, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {source}
                    </Badge>
                  ))}
                </div>

                {/* 커뮤니티 투표 */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2">커뮤니티 평가</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800">
                        <div className="bg-green-500" style={{ width: `${agreePercent}%` }} />
                        <div className="bg-red-500" style={{ width: `${100 - agreePercent}%` }} />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-400">동의 {agreePercent}%</span>
                        <span className="text-red-400">반대 {100 - agreePercent}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {check.agrees}
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {check.disagrees}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {check.comments}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
