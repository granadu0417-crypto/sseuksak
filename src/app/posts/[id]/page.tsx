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
  MoreHorizontal,
  Flag,
  Clock,
  ChevronUp,
  ChevronDown,
  Send,
  Heart,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 더미 데이터
const postData = {
  id: 1,
  category: '정보',
  title: '각 정당별 공약 이행률 비교 (12월 업데이트)',
  content: `안녕하세요, 팩트체커입니다.

매월 업데이트하는 정당별 공약 이행률 현황을 공유드립니다.

## 📊 2024년 12월 기준 공약 이행률

| 정당 | 총 공약 | 완료 | 진행중 | 미착수 | 이행률 |
|------|---------|------|--------|--------|--------|
| A당 | 120개 | 45개 | 38개 | 37개 | 37.5% |
| B당 | 98개 | 32개 | 41개 | 25개 | 32.7% |
| C당 | 85개 | 28개 | 35개 | 22개 | 32.9% |

## 🔍 주요 변동 사항

### 이번 달 완료된 주요 공약
1. **A당** - 중소기업 지원금 확대 (예산 5000억 편성 완료)
2. **B당** - 청년 주거 지원 정책 시행
3. **C당** - 디지털 교육 인프라 구축 1단계 완료

### 진행 중인 핵심 공약
- 연금 개혁안 국회 계류 중 (모든 정당)
- 의료 시스템 개선안 심의 중
- 환경 정책 로드맵 수립 중

## 📈 월별 추이

11월 대비 전체 이행률이 약 2.3%p 상승했습니다.
특히 A당의 경우 3개 공약을 추가 이행하여 가장 큰 상승폭을 보였습니다.

---

**데이터 출처**: 국회 입법처, 각 정당 홈페이지, 정부 보도자료
**다음 업데이트**: 2025년 1월 중순 예정

질문이나 수정 요청 있으시면 댓글로 남겨주세요!`,
  author: {
    id: 'user123',
    nickname: '팩트체커',
    level: 42,
    profileImage: null,
    isVerified: true,
  },
  createdAt: '2024-12-16 14:32',
  views: 12453,
  likes: 678,
  dislikes: 23,
  comments: 89,
  isBookmarked: false,
};

const commentsData = [
  {
    id: 1,
    author: { nickname: '정치관심러', level: 15, profileImage: null },
    content: '매번 정리해주셔서 감사합니다! 이런 자료가 정말 도움이 많이 됩니다.',
    createdAt: '1시간 전',
    likes: 45,
    isLiked: false,
    replies: [
      {
        id: 11,
        author: { nickname: '팩트체커', level: 42, profileImage: null, isAuthor: true },
        content: '읽어주셔서 감사합니다! 다음 달에도 업데이트할게요 😊',
        createdAt: '45분 전',
        likes: 12,
      },
    ],
  },
  {
    id: 2,
    author: { nickname: '비판적시민', level: 8, profileImage: null },
    content: 'A당 이행률이 제일 높다고 하지만 실질적인 체감은 다른 것 같아요. 공약의 질도 같이 분석해주시면 좋겠습니다.',
    createdAt: '52분 전',
    likes: 28,
    isLiked: true,
    replies: [],
  },
  {
    id: 3,
    author: { nickname: '데이터분석가', level: 31, profileImage: null },
    content: '출처가 명확해서 좋네요. 혹시 원본 데이터 스프레드시트 공유 가능할까요?',
    createdAt: '30분 전',
    likes: 15,
    isLiked: false,
    replies: [],
  },
];

const categoryColors: Record<string, string> = {
  '자유': 'bg-blue-500/20 text-blue-400',
  '토론': 'bg-purple-500/20 text-purple-400',
  '정보': 'bg-green-500/20 text-green-400',
  '유머': 'bg-orange-500/20 text-orange-400',
  '공지': 'bg-red-500/20 text-red-400',
};

function Comment({ comment, isReply = false }: { comment: typeof commentsData[0]; isReply?: boolean }) {
  const [showReplies, setShowReplies] = useState(true);
  const [isLiked, setIsLiked] = useState(comment.isLiked);

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : 'py-4 border-b border-border'}`}>
      <div className="flex gap-3">
        <Avatar className={isReply ? 'h-8 w-8' : 'h-10 w-10'}>
          <AvatarFallback className="bg-zinc-800 text-sm">
            {comment.author.nickname.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${isReply ? 'text-sm' : ''}`}>
              {comment.author.nickname}
            </span>
            {(comment.author as { isAuthor?: boolean }).isAuthor && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary">
                작성자
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">Lv.{comment.author.level}</span>
            <span className="text-xs text-muted-foreground">· {comment.createdAt}</span>
          </div>
          <p className={`text-foreground ${isReply ? 'text-sm' : ''}`}>{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked ? 'text-red-400' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {comment.likes + (isLiked && !comment.isLiked ? 1 : 0)}
            </button>
            {!isReply && (
              <button className="text-xs text-muted-foreground hover:text-foreground">
                답글
              </button>
            )}
            <button className="text-xs text-muted-foreground hover:text-foreground">
              신고
            </button>
          </div>

          {/* 대댓글 */}
          {'replies' in comment && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {!showReplies && (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-xs text-primary hover:underline"
                >
                  답글 {comment.replies.length}개 보기
                </button>
              )}
              {showReplies && (
                <>
                  {comment.replies.map((reply: any) => (
                    <Comment key={reply.id} comment={reply} isReply />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(postData.isBookmarked);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    if (disliked) setDisliked(false);
    setLiked(!liked);
  };

  const handleDislike = () => {
    if (liked) setLiked(false);
    setDisliked(!disliked);
  };

  return (
    <div className="min-h-screen">
      {/* 상단 네비게이션 */}
      <div className="border-b border-border bg-zinc-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/community"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" /> 공유하기
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" /> 신고하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* 게시글 본문 */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            {/* 헤더 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={categoryColors[postData.category]}>
                  {postData.category}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-4">{postData.title}</h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-zinc-800">
                      {postData.author.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{postData.author.nickname}</span>
                      {postData.author.isVerified && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-400">
                          인증됨
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">Lv.{postData.author.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{postData.createdAt}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {postData.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 본문 */}
            <div className="prose prose-invert prose-sm max-w-none mb-8">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {postData.content}
              </div>
            </div>

            {/* 좋아요/싫어요/북마크 버튼 */}
            <div className="flex items-center justify-center gap-4 py-6 border-t border-b border-border">
              <Button
                variant={liked ? 'default' : 'outline'}
                size="lg"
                onClick={handleLike}
                className={liked ? 'bg-primary' : ''}
              >
                <ThumbsUp className={`h-5 w-5 mr-2 ${liked ? 'fill-current' : ''}`} />
                추천 {postData.likes + (liked ? 1 : 0)}
              </Button>
              <Button
                variant={disliked ? 'destructive' : 'outline'}
                size="lg"
                onClick={handleDislike}
              >
                <ThumbsDown className={`h-5 w-5 mr-2 ${disliked ? 'fill-current' : ''}`} />
                비추 {postData.dislikes + (disliked ? 1 : 0)}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setBookmarked(!bookmarked)}
                className={bookmarked ? 'text-yellow-500 border-yellow-500/50' : ''}
              >
                <Bookmark className={`h-5 w-5 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              댓글 {postData.comments}개
            </h2>

            {/* 댓글 입력 */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-border">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-zinc-800">나</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                />
                <Button disabled={!commentText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div>
              {commentsData.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </div>

            {/* 더보기 */}
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                댓글 더보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
