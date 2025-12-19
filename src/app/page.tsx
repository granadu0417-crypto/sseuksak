'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  TrendingUp,
  MessageSquare,
  Eye,
  ThumbsUp,
  Clock,
  ChevronRight,
  Zap,
  Users,
  PenSquare,
  Trophy,
  CheckCircle,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 더미 데이터 - 실시간 글 목록
const realtimePosts = [
  { id: 1, category: '자유', title: '오늘 국회 본회의 요약해드림', author: '정치워처', views: 15234, likes: 892, comments: 156, timeAgo: '방금 전', isHot: true, isNew: true },
  { id: 2, category: '토론', title: '이번 정책 찬반 의견 나눠봅시다', author: '토론러', views: 8921, likes: 445, comments: 234, timeAgo: '3분 전', isHot: true },
  { id: 3, category: '정보', title: '각 정당별 공약 이행률 비교 (12월 업데이트)', author: '팩트체커', views: 12453, likes: 678, comments: 89, timeAgo: '7분 전', isHot: true },
  { id: 4, category: '자유', title: '우리 지역구 국회의원 활동 어떻게 생각하세요?', author: '시민123', views: 3421, likes: 123, comments: 67, timeAgo: '12분 전' },
  { id: 5, category: '유머', title: '국회 속기록에서 발견한 웃긴 장면들', author: '웃음충전', views: 28934, likes: 1523, comments: 342, timeAgo: '15분 전', isHot: true },
  { id: 6, category: '정보', title: '다음 주 국회 일정 정리', author: '국회알리미', views: 5623, likes: 234, comments: 45, timeAgo: '23분 전' },
  { id: 7, category: '토론', title: '청년 정책, 뭐가 제일 시급할까요?', author: '청년의소리', views: 7845, likes: 445, comments: 189, timeAgo: '31분 전' },
  { id: 8, category: '자유', title: '정치 입문자인데 뭐부터 봐야할까요', author: '뉴비정치', views: 2341, likes: 89, comments: 78, timeAgo: '45분 전', isNew: true },
  { id: 9, category: '정보', title: '오늘 발의된 법안 목록 (12/16)', author: '법안추적기', views: 4523, likes: 234, comments: 34, timeAgo: '52분 전' },
  { id: 10, category: '유머', title: '역대 정치인 명언(?) 모음', author: '명언수집가', views: 18234, likes: 923, comments: 267, timeAgo: '1시간 전', isHot: true },
];

// 인기글 (베스트)
const bestPosts = [
  { id: 1, title: '이번 주 팩트체크 결과 총정리', author: '팩트체커', views: 45234, likes: 2341, comments: 456, category: '정보' },
  { id: 2, title: '정치인 출석률 랭킹 TOP 20', author: '데이터분석가', views: 38921, likes: 1892, comments: 234, category: '정보' },
  { id: 3, title: '예측 리그 시즌1 결과 발표!', author: '운영자', views: 32453, likes: 1567, comments: 567, category: '공지' },
  { id: 4, title: '각 정당 지지율 변화 그래프', author: '여론분석가', views: 28934, likes: 1234, comments: 345, category: '정보' },
  { id: 5, title: '국정감사 하이라이트 모음', author: '국회알리미', views: 25623, likes: 1123, comments: 289, category: '정보' },
];

// 실시간 활동
const realtimeActivity = {
  onlineUsers: 1247,
  todayPosts: 342,
  todayComments: 2891,
  newMembers: 47,
};

// 카테고리
const categories = [
  { id: 'all', label: '전체', count: 1523 },
  { id: 'free', label: '자유', count: 892 },
  { id: 'debate', label: '토론', count: 234 },
  { id: 'info', label: '정보', count: 456 },
  { id: 'humor', label: '유머', count: 312 },
];

const categoryColors: Record<string, string> = {
  '자유': 'bg-blue-500/20 text-blue-400',
  '토론': 'bg-purple-500/20 text-purple-400',
  '정보': 'bg-green-500/20 text-green-400',
  '유머': 'bg-orange-500/20 text-orange-400',
  '공지': 'bg-red-500/20 text-red-400',
};

function PostRow({ post }: { post: typeof realtimePosts[0] }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors border-b border-border last:border-0"
    >
      {/* 카테고리 */}
      <Badge variant="secondary" className={`shrink-0 text-xs ${categoryColors[post.category] || 'bg-zinc-700'}`}>
        {post.category}
      </Badge>

      {/* 제목 + 배지 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="truncate font-medium">{post.title}</span>
        {post.isHot && (
          <Badge className="shrink-0 bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1">
            HOT
          </Badge>
        )}
        {post.isNew && (
          <Badge className="shrink-0 bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1">
            NEW
          </Badge>
        )}
        {post.comments > 100 && (
          <span className="text-xs text-orange-400">[{post.comments}]</span>
        )}
      </div>

      {/* 작성자 */}
      <span className="hidden sm:block text-sm text-muted-foreground w-24 truncate">
        {post.author}
      </span>

      {/* 통계 */}
      <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 w-16">
          <Eye className="h-3 w-3" /> {post.views.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 w-12">
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

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen">
      {/* 실시간 활동 바 */}
      <div className="border-b border-border bg-zinc-900/50 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full pulse-live" />
              {realtimeActivity.onlineUsers.toLocaleString()}명 접속중
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <PenSquare className="h-3.5 w-3.5" />
              오늘 {realtimeActivity.todayPosts}개 글
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              오늘 {realtimeActivity.todayComments.toLocaleString()}개 댓글
            </span>
          </div>
          <Link href="/write">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <PenSquare className="h-4 w-4 mr-1" />
              글쓰기
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 좌측: 실시간 글 목록 (메인) */}
          <div className="lg:col-span-2 space-y-4">
            {/* 카테고리 탭 */}
            <div className="flex items-center justify-between">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="bg-zinc-800/50">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-sm">
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">
                전체 게시판 →
              </Link>
            </div>

            {/* 글 목록 */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-border bg-zinc-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    실시간 글
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    자동 새로고침 ON
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {realtimePosts.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </CardContent>
              <div className="p-3 border-t border-border text-center">
                <Link href="/community" className="text-sm text-primary hover:underline">
                  더 많은 글 보기
                </Link>
              </div>
            </Card>
          </div>

          {/* 우측: 사이드바 */}
          <div className="space-y-4">
            
            {/* 인기글 베스트 */}
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  실시간 인기글
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {bestPosts.map((post, idx) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors border-b border-border last:border-0"
                  >
                    <span className={`text-lg font-bold ${idx < 3 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {(post.views / 1000).toFixed(1)}K
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {post.likes}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* 빠른 메뉴 */}
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  바로가기
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Users, label: '정치인 카드', href: '/politicians', color: 'text-blue-400' },
                    { icon: Target, label: '공약 추적', href: '/promises', color: 'text-green-400' },
                    { icon: CheckCircle, label: '팩트체크', href: '/factcheck', color: 'text-orange-400' },
                    { icon: Trophy, label: '예측 리그', href: '/predictions', color: 'text-purple-400' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 커뮤니티 통계 */}
            <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  오늘의 커뮤니티
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-zinc-900/50">
                    <p className="text-2xl font-bold text-primary">{realtimeActivity.todayPosts}</p>
                    <p className="text-xs text-muted-foreground">새 글</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/50">
                    <p className="text-2xl font-bold text-green-400">{realtimeActivity.todayComments.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">댓글</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/50">
                    <p className="text-2xl font-bold text-orange-400">{realtimeActivity.onlineUsers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">접속자</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900/50">
                    <p className="text-2xl font-bold text-purple-400">+{realtimeActivity.newMembers}</p>
                    <p className="text-xs text-muted-foreground">신규 가입</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
