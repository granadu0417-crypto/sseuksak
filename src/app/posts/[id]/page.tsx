'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Bookmark,
  Flag,
  MoreHorizontal,
  Clock,
  ChevronUp,
  ChevronDown,
  Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 더미 데이터
const postData = {
  id: 1,
  category: '자유',
  title: '오늘 국회 본회의 요약해드림',
  content: `오늘 국회 본회의에서 있었던 주요 내용 정리해봤습니다.

## 1. 예산안 관련
- 내년도 예산안 심의가 진행됨
- 여야 간 주요 쟁점은 복지 예산과 국방 예산 배분
- 최종 표결은 다음 주로 예정

## 2. 법안 처리
- 총 15개 법안이 상정됨
- 그 중 8개가 통과, 7개는 계류
- 주목할 법안: 청년 주거 지원법, 디지털 플랫폼 규제법

## 3. 대정부 질문
- 경제 현안에 대한 질의가 주를 이룸
- 물가 안정 대책, 부동산 정책 관련 공방

본회의 영상은 국회 홈페이지에서 다시보기 가능합니다.
질문 있으시면 댓글 남겨주세요!`,
  author: {
    nickname: '정치워처',
    level: 15,
    badge: '팩트체커',
  },
  createdAt: '2024-12-16 14:32',
  views: 15234,
  likes: 892,
  dislikes: 23,
  comments: 156,
  isBookmarked: false,
};

const commentsData = [
  {
    id: 1,
    author: { nickname: '시민A', level: 8 },
    content: '정리 감사합니다! 청년 주거 지원법 통과됐으면 좋겠네요.',
    createdAt: '14:45',
    likes: 45,
    dislikes: 2,
    replies: [
      {
        id: 11,
        author: { nickname: '정치워처', level: 15, isOP: true },
        content: '저도 그 법안 주목하고 있어요. 다음 주 표결 예정이라고 합니다!',
        createdAt: '14:52',
        likes: 23,
        dislikes: 0,
      },
    ],
  },
  {
    id: 2,
    author: { nickname: '분석가', level: 12, badge: '베스트 댓글러' },
    content: '예산안 관련해서 여야 입장 차이가 꽤 크던데, 합의가 될지 모르겠네요. 작년에도 비슷한 상황이었는데 결국 수정안으로 통과됐었죠.',
    createdAt: '15:03',
    likes: 67,
    dislikes: 5,
    replies: [],
  },
  {
    id: 3,
    author: { nickname: '뉴비정치', level: 2 },
    content: '국회 홈페이지 다시보기는 어디서 볼 수 있나요?',
    createdAt: '15:21',
    likes: 12,
    dislikes: 0,
    replies: [
      {
        id: 31,
        author: { nickname: '국회알리미', level: 10 },
        content: 'assembly.go.kr 에서 "의사중계" 메뉴로 가시면 됩니다!',
        createdAt: '15:28',
        likes: 18,
        dislikes: 0,
      },
    ],
  },
  {
    id: 4,
    author: { nickname: '열혈시민', level: 6 },
    content: '디지털 플랫폼 규제법은 좀 우려되는 부분이 있는데... 세부 내용 아시는 분?',
    createdAt: '15:45',
    likes: 34,
    dislikes: 3,
    replies: [],
  },
];

const categoryColors: Record<string, string> = {
  '자유': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '토론': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '정보': 'bg-green-500/20 text-green-400 border-green-500/30',
  '유머': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

interface CommentProps {
  comment: typeof commentsData[0];
  isReply?: boolean;
}

function Comment({ comment, isReply = false }: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className={`p-4 rounded-lg ${isReply ? 'bg-zinc-800/30' : 'bg-zinc-800/50'}`}>
        {/* 댓글 헤더 */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-zinc-700">
              {comment.author.nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{comment.author.nickname}</span>
          {(comment.author as { isOP?: boolean }).isOP && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary">
              작성자
            </Badge>
          )}
          {(comment.author as { badge?: string }).badge && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {(comment.author as { badge?: string }).badge}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">Lv.{comment.author.level}</span>
          <span className="text-xs text-muted-foreground ml-auto">{comment.createdAt}</span>
        </div>

        {/* 댓글 내용 */}
        <p className="text-sm leading-relaxed mb-3">{comment.content}</p>

        {/* 댓글 액션 */}
        <div className="flex items-center gap-4 text-xs">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{comment.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{comment.dislikes}</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-muted-foreground hover:text-foreground"
            >
              답글
            </button>
          )}
          <button className="text-muted-foreground hover:text-foreground">신고</button>
        </div>

        {/* 답글 입력 */}
        {showReplyInput && (
          <div className="mt-3 flex gap-2">
            <Textarea
              placeholder="답글을 입력하세요..."
              className="min-h-[60px] bg-zinc-900 border-zinc-700 text-sm"
            />
            <Button size="sm" className="shrink-0">등록</Button>
          </div>
        )}
      </div>

      {/* 대댓글 */}
      {'replies' in comment && comment.replies.map((reply: any) => (
        <Comment key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(postData.isBookmarked);
  const [commentText, setCommentText] = useState('');

  return (
    <div className="min-h-screen">
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Badge variant="outline" className={categoryColors[postData.category]}>
            {postData.category}
          </Badge>
          <span className="text-sm text-muted-foreground">자유게시판</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 글 본문 */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {/* 제목 */}
            <h1 className="text-2xl font-bold mb-4">{postData.title}</h1>

            {/* 작성자 정보 */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600">
                  {postData.author.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{postData.author.nickname}</span>
                  <Badge variant="outline" className="text-xs">
                    {postData.author.badge}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Lv.{postData.author.level}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {postData.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {postData.views.toLocaleString()}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    신고하기
                  </DropdownMenuItem>
                  <DropdownMenuItem>URL 복사</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 본문 내용 */}
            <div className="prose prose-invert prose-sm max-w-none mb-6">
              {postData.content.split('\n').map((line, idx) => {
                if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-lg font-bold mt-6 mb-2">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('- ')) {
                  return <li key={idx} className="ml-4">{line.replace('- ', '')}</li>;
                }
                if (line === '') {
                  return <br key={idx} />;
                }
                return <p key={idx} className="mb-2">{line}</p>;
              })}
            </div>

            {/* 추천/비추천 */}
            <div className="flex items-center justify-center gap-4 py-6 border-t border-b border-border">
              <Button
                variant={liked ? 'default' : 'outline'}
                size="lg"
                onClick={() => { setLiked(!liked); setDisliked(false); }}
                className={liked ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <ChevronUp className="h-5 w-5 mr-1" />
                추천 {postData.likes + (liked ? 1 : 0)}
              </Button>
              <Button
                variant={disliked ? 'default' : 'outline'}
                size="lg"
                onClick={() => { setDisliked(!disliked); setLiked(false); }}
                className={disliked ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <ChevronDown className="h-5 w-5 mr-1" />
                비추천 {postData.dislikes + (disliked ? 1 : 0)}
              </Button>
            </div>

            {/* 하단 액션 */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  공유
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
                  className={bookmarked ? 'text-yellow-500' : ''}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${bookmarked ? 'fill-current' : ''}`} />
                  저장
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">목록</Button>
                <Button variant="outline" size="sm">이전글</Button>
                <Button variant="outline" size="sm">다음글</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              댓글 {postData.comments}
            </h2>

            {/* 댓글 입력 */}
            <div className="mb-6">
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] bg-zinc-800/50 border-zinc-700 mb-2"
              />
              <div className="flex justify-end">
                <Button disabled={!commentText.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  댓글 등록
                </Button>
              </div>
            </div>

            {/* 댓글 정렬 */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <button className="text-primary font-medium">추천순</button>
              <span className="text-muted-foreground">|</span>
              <button className="text-muted-foreground hover:text-foreground">최신순</button>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {commentsData.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </div>

            {/* 더보기 */}
            <div className="text-center mt-6">
              <Button variant="outline">댓글 더보기</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
