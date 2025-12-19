'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle,
  Search,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare,
  Flame,
  Pin,
  Plus,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface DebatePost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  is_pinned: number;
  is_hot: number;
  created_at: string;
  author_nickname: string;
  author_avatar: string | null;
  tags: string[];
}

interface DebatesResponse {
  items: DebatePost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalDebates: number;
    totalViews: number;
    totalComments: number;
    hotDebates: number;
  };
}

const sortOptions = [
  { value: 'created_at', label: '최신순' },
  { value: 'comment_count', label: '댓글순' },
  { value: 'like_count', label: '추천순' },
  { value: 'view_count', label: '조회순' },
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function DebatesPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [showHot, setShowHot] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['debates', { page, sort, search, showHot }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', sort);
      params.set('order', 'desc');
      if (showHot) params.set('hot', 'true');
      if (search) params.set('search', search);

      const res = await fetch(`/api/debates?${params.toString()}`);
      const json = await res.json() as { success: boolean; data?: DebatesResponse; error?: string };
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      return json.data as DebatesResponse;
    },
  });

  const handleFilterChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-pink-500/20 p-3">
              <MessageCircle className="h-8 w-8 text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">토론 아레나</h1>
              <p className="text-muted-foreground">정치 이슈에 대해 자유롭게 토론하세요</p>
            </div>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            새 토론 시작
          </Button>
        </div>

        {/* 전체 통계 */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{data.stats.totalDebates}</div>
                <div className="text-sm text-muted-foreground">전체 토론</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-pink-400">{data.stats.hotDebates}</div>
                <div className="text-sm text-muted-foreground">HOT 토론</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{data.stats.totalComments}</div>
                <div className="text-sm text-muted-foreground">총 댓글</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{data.stats.totalViews}</div>
                <div className="text-sm text-muted-foreground">총 조회</div>
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
                  placeholder="토론 검색..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10 bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <Button
                variant={showHot ? "default" : "outline"}
                onClick={() => { setShowHot(!showHot); setPage(1); }}
                className={showHot ? "bg-orange-600 hover:bg-orange-700" : "bg-zinc-800/50 border-zinc-700"}
              >
                <Flame className="h-4 w-4 mr-2" />
                HOT
              </Button>
              <Select value={sort} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full md:w-40 bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 토론 목록 */}
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
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">토론이 없습니다</h3>
              <p className="text-muted-foreground mb-4">첫 번째 토론을 시작해보세요!</p>
              <Button className="bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                새 토론 시작
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.items.map((post) => (
              <Card
                key={post.id}
                className={`bg-card border-border hover:border-pink-500/50 transition-colors cursor-pointer ${
                  post.is_pinned ? 'bg-gradient-to-r from-pink-500/5 to-transparent border-pink-500/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* 작성자 아바타 */}
                    <Avatar className="h-10 w-10">
                      {post.author_avatar && (
                        <AvatarImage src={post.author_avatar} alt={post.author_nickname} />
                      )}
                      <AvatarFallback className="bg-pink-500/20 text-pink-400">
                        {post.author_nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.is_pinned === 1 && (
                          <Badge variant="secondary" className="bg-pink-500/20 text-pink-400 text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            고정
                          </Badge>
                        )}
                        {post.is_hot === 1 && (
                          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-xs">
                            <Flame className="h-3 w-3 mr-1" />
                            HOT
                          </Badge>
                        )}
                        {post.tags && post.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{post.title}</h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{post.author_nickname}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* 통계 */}
                    <div className="hidden md:flex flex-col items-end gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-green-400">
                          <ThumbsUp className="h-4 w-4" />
                          {post.like_count}
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <ThumbsDown className="h-4 w-4" />
                          {post.dislike_count}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-pink-400">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comment_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
