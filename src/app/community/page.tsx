'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Clock,
  Flame,
  MessageSquare,
  Eye,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  TrendingUp,
  SlidersHorizontal,
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

// 더미 데이터 - 전체 게시글
const allPosts = [
  { id: 1, category: '자유', title: '오늘 국회 본회의 요약해드림', author: '정치워처', views: 15234, likes: 892, comments: 156, timeAgo: '방금 전', isHot: true, isNew: true, isPinned: false },
  { id: 2, category: '공지', title: '[필독] 커뮤니티 이용규칙 안내', author: '운영자', views: 52341, likes: 1234, comments: 89, timeAgo: '1일 전', isHot: false, isNew: false, isPinned: true },
  { id: 3, category: '토론', title: '이번 정책 찬반 의견 나눠봅시다', author: '토론러', views: 8921, likes: 445, comments: 234, timeAgo: '3분 전', isHot: true, isNew: false, isPinned: false },
  { id: 4, category: '정보', title: '각 정당별 공약 이행률 비교 (12월 업데이트)', author: '팩트체커', views: 12453, likes: 678, comments: 89, timeAgo: '7분 전', isHot: true, isNew: false, isPinned: false },
  { id: 5, category: '자유', title: '우리 지역구 국회의원 활동 어떻게 생각하세요?', author: '시민123', views: 3421, likes: 123, comments: 67, timeAgo: '12분 전', isHot: false, isNew: false, isPinned: false },
  { id: 6, category: '유머', title: '국회 속기록에서 발견한 웃긴 장면들', author: '웃음충전', views: 28934, likes: 1523, comments: 342, timeAgo: '15분 전', isHot: true, isNew: false, isPinned: false },
  { id: 7, category: '정보', title: '다음 주 국회 일정 정리', author: '국회알리미', views: 5623, likes: 234, comments: 45, timeAgo: '23분 전', isHot: false, isNew: false, isPinned: false },
  { id: 8, category: '토론', title: '청년 정책, 뭐가 제일 시급할까요?', author: '청년의소리', views: 7845, likes: 445, comments: 189, timeAgo: '31분 전', isHot: false, isNew: false, isPinned: false },
  { id: 9, category: '자유', title: '정치 입문자인데 뭐부터 봐야할까요', author: '뉴비정치', views: 2341, likes: 89, comments: 78, timeAgo: '45분 전', isHot: false, isNew: true, isPinned: false },
  { id: 10, category: '정보', title: '오늘 발의된 법안 목록 (12/16)', author: '법안추적기', views: 4523, likes: 234, comments: 34, timeAgo: '52분 전', isHot: false, isNew: false, isPinned: false },
  { id: 11, category: '유머', title: '역대 정치인 명언(?) 모음', author: '명언수집가', views: 18234, likes: 923, comments: 267, timeAgo: '1시간 전', isHot: true, isNew: false, isPinned: false },
  { id: 12, category: '자유', title: '요즘 정치 뉴스 보기 힘드네요', author: '피로한시민', views: 1892, likes: 156, comments: 123, timeAgo: '1시간 전', isHot: false, isNew: false, isPinned: false },
  { id: 13, category: '토론', title: '지방분권 어디까지 해야할까요?', author: '지방러', views: 3421, likes: 234, comments: 156, timeAgo: '2시간 전', isHot: false, isNew: false, isPinned: false },
  { id: 14, category: '정보', title: '국회의원 재산 신고 현황', author: '투명워치', views: 9823, likes: 567, comments: 234, timeAgo: '2시간 전', isHot: true, isNew: false, isPinned: false },
  { id: 15, category: '자유', title: '첫 투표 후기입니다', author: '새내기유권자', views: 4521, likes: 345, comments: 89, timeAgo: '3시간 전', isHot: false, isNew: false, isPinned: false },
];

const categories = [
  { id: 'all', label: '전체', count: 1523, icon: '📋' },
  { id: 'free', label: '자유', count: 892, icon: '💬' },
  { id: 'debate', label: '토론', count: 234, icon: '⚔️' },
  { id: 'info', label: '정보', count: 456, icon: '📊' },
  { id: 'humor', label: '유머', count: 312, icon: '😂' },
  { id: 'notice', label: '공지', count: 12, icon: '📢' },
];

const categoryColors: Record<string, string> = {
  '자유': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '토론': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '정보': 'bg-green-500/20 text-green-400 border-green-500/30',
  '유머': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '공지': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const sortOptions = [
  { id: 'latest', label: '최신순', icon: Clock },
  { id: 'popular', label: '인기순', icon: Flame },
  { id: 'views', label: '조회순', icon: Eye },
  { id: 'comments', label: '댓글순', icon: MessageSquare },
];

function PostRow({ post, index }: { post: typeof allPosts[0]; index: number }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/50 transition-colors border-b border-border ${
        post.isPinned ? 'bg-zinc-800/30' : ''
      }`}
    >
      {/* 번호 */}
      <span className="hidden sm:block w-12 text-center text-sm text-muted-foreground">
        {post.isPinned ? '📌' : index + 1}
      </span>

      {/* 카테고리 */}
      <Badge 
        variant="outline" 
        className={`shrink-0 text-xs ${categoryColors[post.category] || 'bg-zinc-700 border-zinc-600'}`}
      >
        {post.category}
      </Badge>

      {/* 제목 + 배지 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={`truncate ${post.isPinned ? 'font-semibold text-primary' : 'font-medium'}`}>
          {post.title}
        </span>
        {post.isHot && (
          <Badge className="shrink-0 bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5">
            HOT
          </Badge>
        )}
        {post.isNew && (
          <Badge className="shrink-0 bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5">
            NEW
          </Badge>
        )}
        {post.comments > 50 && (
          <span className="text-xs text-orange-400 font-medium">[{post.comments}]</span>
        )}
      </div>

      {/* 작성자 */}
      <span className="hidden md:block text-sm text-muted-foreground w-24 truncate text-center">
        {post.author}
      </span>

      {/* 통계 */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 w-16 justify-end">
          <Eye className="h-3 w-3" /> {post.views.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 w-12 justify-end">
          <ThumbsUp className="h-3 w-3" /> {post.likes}
        </span>
      </div>

      {/* 시간 */}
      <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
        {post.timeAgo}
      </span>
    </Link>
  );
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const selectedSort = sortOptions.find((s) => s.id === sortBy) || sortOptions[0];

  // 필터링된 게시글
  const filteredPosts = allPosts.filter((post) => {
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        free: '자유', debate: '토론', info: '정보', humor: '유머', notice: '공지',
      };
      if (post.category !== categoryMap[selectedCategory]) return false;
    }
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 고정글 먼저, 나머지는 정렬
  const pinnedPosts = filteredPosts.filter((p) => p.isPinned);
  const normalPosts = filteredPosts.filter((p) => !p.isPinned);

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">커뮤니티</h1>
              <p className="text-sm text-muted-foreground mt-1">
                자유롭게 의견을 나누는 공간입니다
              </p>
            </div>
            <Link href="/write">
              <Button className="bg-primary hover:bg-primary/90">
                <PenSquare className="h-4 w-4 mr-2" />
                글쓰기
              </Button>
            </Link>
          </div>

          {/* 검색 */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="게시글 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 좌측 사이드바: 카테고리 */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-4">
              <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  카테고리
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-zinc-800/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </span>
                    <span className="text-xs">{cat.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 메인: 게시글 목록 */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border overflow-hidden">
              {/* 정렬 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-zinc-800/30">
                <div className="flex items-center gap-2">
                  <Tabs value={sortBy} onValueChange={setSortBy}>
                    <TabsList className="bg-zinc-800/50 h-8">
                      {sortOptions.map((opt) => (
                        <TabsTrigger key={opt.id} value={opt.id} className="text-xs h-7 px-3">
                          <opt.icon className="h-3 w-3 mr-1" />
                          {opt.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <span className="text-xs text-muted-foreground">
                  총 {filteredPosts.length}개
                </span>
              </div>

              {/* 테이블 헤더 */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-b border-border bg-zinc-900/50 text-xs text-muted-foreground">
                <span className="w-12 text-center">번호</span>
                <span className="w-14">분류</span>
                <span className="flex-1">제목</span>
                <span className="hidden md:block w-24 text-center">작성자</span>
                <span className="hidden lg:flex items-center gap-4">
                  <span className="w-16 text-right">조회</span>
                  <span className="w-12 text-right">추천</span>
                </span>
                <span className="w-16 text-right">작성일</span>
              </div>

              {/* 게시글 목록 */}
              <div>
                {/* 고정글 */}
                {pinnedPosts.map((post, idx) => (
                  <PostRow key={`pinned-${post.id}`} post={post} index={idx} />
                ))}
                {/* 일반글 */}
                {normalPosts.map((post, idx) => (
                  <PostRow key={post.id} post={post} index={idx + 1} />
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="flex items-center justify-center gap-1 p-4 border-t border-border">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <span className="px-2 text-muted-foreground">...</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  42
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
