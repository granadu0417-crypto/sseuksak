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
  Flame,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

// 더미 데이터 - 게시글 목록
const posts = [
  { id: 1, category: '자유', title: '오늘 국회 본회의 요약해드림', author: '정치워처', views: 15234, likes: 892, comments: 156, createdAt: '14:32', isHot: true, isNotice: false },
  { id: 2, category: '공지', title: '[공지] 커뮤니티 이용 규칙 안내', author: '운영자', views: 45123, likes: 234, comments: 12, createdAt: '12/15', isHot: false, isNotice: true },
  { id: 3, category: '토론', title: '이번 정책 찬반 의견 나눠봅시다', author: '토론러', views: 8921, likes: 445, comments: 234, createdAt: '14:28', isHot: true, isNotice: false },
  { id: 4, category: '정보', title: '각 정당별 공약 이행률 비교 (12월 업데이트)', author: '팩트체커', views: 12453, likes: 678, comments: 89, createdAt: '14:15', isHot: true, isNotice: false },
  { id: 5, category: '자유', title: '우리 지역구 국회의원 활동 어떻게 생각하세요?', author: '시민123', views: 3421, likes: 123, comments: 67, createdAt: '13:52', isHot: false, isNotice: false },
  { id: 6, category: '유머', title: '국회 속기록에서 발견한 웃긴 장면들', author: '웃음충전', views: 28934, likes: 1523, comments: 342, createdAt: '13:31', isHot: true, isNotice: false },
  { id: 7, category: '정보', title: '다음 주 국회 일정 정리', author: '국회알리미', views: 5623, likes: 234, comments: 45, createdAt: '12:45', isHot: false, isNotice: false },
  { id: 8, category: '토론', title: '청년 정책, 뭐가 제일 시급할까요?', author: '청년의소리', views: 7845, likes: 445, comments: 189, createdAt: '11:32', isHot: false, isNotice: false },
  { id: 9, category: '자유', title: '정치 입문자인데 뭐부터 봐야할까요', author: '뉴비정치', views: 2341, likes: 89, comments: 78, createdAt: '10:21', isHot: false, isNotice: false },
  { id: 10, category: '정보', title: '오늘 발의된 법안 목록 (12/16)', author: '법안추적기', views: 4523, likes: 234, comments: 34, createdAt: '09:45', isHot: false, isNotice: false },
  { id: 11, category: '유머', title: '역대 정치인 명언(?) 모음', author: '명언수집가', views: 18234, likes: 923, comments: 267, createdAt: '12/15', isHot: true, isNotice: false },
  { id: 12, category: '자유', title: '오늘 뉴스 보고 느낀 점', author: '일반시민', views: 1234, likes: 56, comments: 23, createdAt: '12/15', isHot: false, isNotice: false },
  { id: 13, category: '토론', title: '경제 정책 방향에 대한 의견', author: '경제전문가', views: 6789, likes: 345, comments: 156, createdAt: '12/15', isHot: false, isNotice: false },
  { id: 14, category: '정보', title: '이번 주 여론조사 결과 정리', author: '여론분석가', views: 9876, likes: 567, comments: 234, createdAt: '12/14', isHot: false, isNotice: false },
  { id: 15, category: '자유', title: '첫 글이에요 잘 부탁드립니다', author: '새내기', views: 876, likes: 34, comments: 45, createdAt: '12/14', isHot: false, isNotice: false },
];

const categories = [
  { id: 'all', label: '전체' },
  { id: 'free', label: '자유' },
  { id: 'debate', label: '토론' },
  { id: 'info', label: '정보' },
  { id: 'humor', label: '유머' },
];

const categoryColors: Record<string, string> = {
  '자유': 'bg-blue-500/20 text-blue-400',
  '토론': 'bg-purple-500/20 text-purple-400',
  '정보': 'bg-green-500/20 text-green-400',
  '유머': 'bg-orange-500/20 text-orange-400',
  '공지': 'bg-red-500/20 text-red-400',
};

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const notices = posts.filter(p => p.isNotice);
  const normalPosts = posts.filter(p => !p.isNotice);

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-zinc-900/50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">커뮤니티</h1>
            <Button className="bg-primary hover:bg-primary/90">
              <PenSquare className="h-4 w-4 mr-2" />
              글쓰기
            </Button>
          </div>
          
          {/* 카테고리 탭 */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색어를 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-800/50 border-zinc-700"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-zinc-800/50 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="comments">댓글순</SelectItem>
              <SelectItem value="views">조회순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 게시글 목록 */}
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

          {/* 공지사항 */}
          {notices.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-zinc-800/30 transition-colors border-b border-border bg-zinc-800/20"
            >
              <div className="col-span-12 md:col-span-1 flex md:justify-center">
                <Badge variant="secondary" className={categoryColors[post.category]}>
                  {post.category}
                </Badge>
              </div>
              <div className="col-span-12 md:col-span-6 flex items-center gap-2">
                <span className="font-medium">{post.title}</span>
                {post.comments > 0 && (
                  <span className="text-xs text-primary">[{post.comments}]</span>
                )}
              </div>
              <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground">
                {post.author}
              </div>
              <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                {post.views.toLocaleString()}
              </div>
              <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                {post.likes}
              </div>
              <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                {post.createdAt}
              </div>
            </Link>
          ))}

          {/* 일반 게시글 */}
          {normalPosts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-zinc-800/30 transition-colors border-b border-border last:border-0"
            >
              <div className="col-span-12 md:col-span-1 flex md:justify-center">
                <Badge variant="secondary" className={`text-xs ${categoryColors[post.category]}`}>
                  {post.category}
                </Badge>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{post.title}</span>
                  {post.isHot && (
                    <Badge className="shrink-0 bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1">
                      HOT
                    </Badge>
                  )}
                  {post.comments > 0 && (
                    <span className="text-xs text-primary shrink-0">[{post.comments}]</span>
                  )}
                </div>
                {/* 모바일: 추가 정보 */}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground md:hidden">
                  <span>{post.author}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {post.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {post.likes}
                  </span>
                  <span>{post.createdAt}</span>
                </div>
              </div>
              <div className="hidden md:block col-span-2 text-center text-sm text-muted-foreground truncate">
                {post.author}
              </div>
              <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                {post.views.toLocaleString()}
              </div>
              <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                {post.likes}
              </div>
              <div className="hidden md:block col-span-1 text-center text-sm text-muted-foreground">
                {post.createdAt}
              </div>
            </Link>
          ))}
        </Card>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[1, 2, 3, 4, 5].map((page) => (
            <Button
              key={page}
              variant={page === 1 ? 'default' : 'outline'}
              size="icon"
              className={page === 1 ? 'bg-primary' : ''}
            >
              {page}
            </Button>
          ))}
          <span className="px-2 text-muted-foreground">...</span>
          <Button variant="outline" size="icon">
            42
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 하단 검색 */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-2 max-w-md w-full">
            <Select defaultValue="title">
              <SelectTrigger className="w-[120px] bg-zinc-800/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="title">제목</SelectItem>
                <SelectItem value="content">내용</SelectItem>
                <SelectItem value="author">작성자</SelectItem>
                <SelectItem value="all">제목+내용</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="검색어 입력"
              className="bg-zinc-800/50 border-zinc-700"
            />
            <Button>검색</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
