'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  PenSquare,
  Eye,
  ThumbsUp,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePosts } from '@/lib/api/hooks';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const categories = [
  { id: 'all', label: '전체' },
  { id: 'free', label: '자유' },
  { id: 'debate', label: '토론' },
  { id: 'info', label: '정보' },
  { id: 'humor', label: '유머' },
];

const categoryColors: Record<string, string> = {
  free: 'bg-blue-500/20 text-blue-400',
  debate: 'bg-purple-500/20 text-purple-400',
  info: 'bg-green-500/20 text-green-400',
  humor: 'bg-orange-500/20 text-orange-400',
  notice: 'bg-red-500/20 text-red-400',
};

const categoryLabels: Record<string, string> = {
  free: '자유',
  debate: '토론',
  info: '정보',
  humor: '유머',
  notice: '공지',
};

const sortOptions = [
  { value: 'created_at', label: '최신순' },
  { value: 'like_count', label: '인기순' },
  { value: 'comment_count', label: '댓글순' },
  { value: 'view_count', label: '조회순' },
];

// 날짜 포맷팅 함수
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: false, locale: ko });
    }

    // 24시간 이상이면 날짜 표시
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  } catch {
    return dateString;
  }
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);

  // API 호출
  const { data, isLoading, isError, error } = usePosts({
    page: currentPage,
    limit: 20,
    category: selectedCategory,
    search: searchQuery || undefined,
    sort: sortBy,
    order: 'desc',
  });

  // 카테고리 변경 시 페이지 리셋
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // 정렬 변경
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // 페이지 버튼 생성
  const renderPagination = () => {
    if (!data) return null;

    const { page, totalPages } = data;
    const pages: (number | string)[] = [];

    // 시작 페이지들
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pages.push(i);
    }

    // 현재 페이지 주변
    if (page > 4) pages.push('...');
    for (let i = Math.max(4, page - 1); i <= Math.min(totalPages - 3, page + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    // 끝 페이지들
    if (page < totalPages - 3) pages.push('...');
    for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-zinc-900/50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">커뮤니티</h1>
            <Link href="/write">
              <Button className="bg-primary hover:bg-primary/90">
                <PenSquare className="h-4 w-4 mr-2" />
                글쓰기
              </Button>
            </Link>
          </div>

          {/* 카테고리 탭 */}
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
            <TabsList className="bg-zinc-800/50">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* 검색 및 정렬 */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색어를 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-800/50 border-zinc-700"
            />
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] bg-zinc-800/50 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>

        {/* 로딩 상태 */}
        {isLoading && (
          <Card className="bg-card border-border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/50 text-sm font-medium text-muted-foreground border-b border-border">
              <div className="col-span-1 text-center">분류</div>
              <div className="col-span-6">제목</div>
              <div className="col-span-2 text-center">작성자</div>
              <div className="col-span-1 text-center">조회</div>
              <div className="col-span-1 text-center">추천</div>
              <div className="col-span-1 text-center">날짜</div>
            </div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border">
                <div className="col-span-1">
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="col-span-6">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-5 w-16 mx-auto" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-5 w-10 mx-auto" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-5 w-8 mx-auto" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-5 w-12 mx-auto" />
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* 에러 상태 */}
        {isError && (
          <Card className="bg-card border-border p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : '게시글을 불러오는데 실패했습니다.'}
              </p>
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </Card>
        )}

        {/* 게시글 목록 */}
        {data && !isLoading && (
          <>
            <Card className="bg-card border-border overflow-hidden">
              {/* 테이블 헤더 */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/50 text-sm font-medium text-muted-foreground border-b border-border">
                <div className="col-span-1 text-center">분류</div>
                <div className="col-span-6">제목</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-1 text-center">추천</div>
                <div className="col-span-1 text-center">날짜</div>
              </div>

              {/* 게시글이 없는 경우 */}
              {data.items.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>게시글이 없습니다.</p>
                  <p className="text-sm mt-2">첫 번째 글을 작성해보세요!</p>
                </div>
              )}

              {/* 게시글 목록 */}
              {data.items.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-zinc-800/30 transition-colors border-b border-border last:border-0 ${
                    post.is_pinned ? 'bg-zinc-800/20' : ''
                  }`}
                >
                  <div className="col-span-12 md:col-span-1 flex md:justify-center">
                    <Badge variant="secondary" className={`text-xs ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </Badge>
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{post.title}</span>
                      {post.is_hot === 1 && (
                        <Badge className="shrink-0 bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1">
                          HOT
                        </Badge>
                      )}
                      {post.comment_count > 0 && (
                        <span className="text-xs text-primary shrink-0">[{post.comment_count}]</span>
                      )}
                    </div>
                    {/* 모바일: 추가 정보 */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground md:hidden">
                      <span>{post.author_nickname || '익명'}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {post.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {post.like_count}
                      </span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground truncate">
                    {post.author_nickname || '익명'}
                  </div>
                  <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                    {post.view_count.toLocaleString()}
                  </div>
                  <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                    {post.like_count}
                  </div>
                  <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                    {formatDate(post.created_at)}
                  </div>
                </Link>
              ))}
            </Card>

            {/* 페이지네이션 */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {renderPagination()?.map((page, i) => (
                  typeof page === 'number' ? (
                    <Button
                      key={i}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="icon"
                      className={page === currentPage ? 'bg-primary' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={i} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  )
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === data.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 결과 정보 */}
            <div className="text-center text-sm text-muted-foreground mt-4">
              총 {data.total.toLocaleString()}개의 게시글 중 {data.page} / {data.totalPages} 페이지
            </div>
          </>
        )}
      </div>
    </div>
  );
}
