'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePost, useComments, useVotePost, useCreateComment } from '@/lib/api/hooks';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { CommentWithAuthor } from '@/lib/types';

const categoryColors: Record<string, string> = {
  free: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  debate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  info: 'bg-green-500/20 text-green-400 border-green-500/30',
  humor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  notice: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const categoryLabels: Record<string, string> = {
  free: '자유',
  debate: '토론',
  info: '정보',
  humor: '유머',
  notice: '공지',
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  } catch {
    return dateString;
  }
}

interface CommentProps {
  comment: CommentWithAuthor;
  postId: string;
  postAuthorId?: string;
  isReply?: boolean;
}

function Comment({ comment, postId, postAuthorId, isReply = false }: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const createComment = useCreateComment();

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    createComment.mutate(
      { postId, content: replyText, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyText('');
          setShowReplyInput(false);
        },
      }
    );
  };

  const isOP = comment.author_id === postAuthorId;

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className={`p-4 rounded-lg ${isReply ? 'bg-zinc-800/30' : 'bg-zinc-800/50'}`}>
        {/* 댓글 헤더 */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-zinc-700">
              {comment.author_nickname?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{comment.author_nickname || '익명'}</span>
          {isOP && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary">
              작성자
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">Lv.{comment.author_level || 1}</span>
          <span className="text-xs text-muted-foreground ml-auto">{formatDate(comment.created_at)}</span>
        </div>

        {/* 댓글 내용 */}
        <p className="text-sm leading-relaxed mb-3">{comment.content}</p>

        {/* 댓글 액션 */}
        <div className="flex items-center gap-4 text-xs">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{comment.like_count}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{comment.dislike_count}</span>
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
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] bg-zinc-900 border-zinc-700 text-sm"
            />
            <Button
              size="sm"
              className="shrink-0"
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || createComment.isPending}
            >
              {createComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '등록'}
            </Button>
          </div>
        )}
      </div>

      {/* 대댓글 */}
      {comment.replies?.map((reply) => (
        <Comment key={reply.id} comment={reply} postId={postId} postAuthorId={postAuthorId} isReply />
      ))}
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');

  // API 호출
  const { data: post, isLoading: postLoading, isError: postError } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);
  const votePost = useVotePost();
  const createComment = useCreateComment();

  const handleVote = (voteType: 'like' | 'dislike') => {
    votePost.mutate({ postId, voteType });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    createComment.mutate(
      { postId, content: commentText },
      {
        onSuccess: () => {
          setCommentText('');
        },
      }
    );
  };

  // 로딩 상태
  if (postLoading) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (postError || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-card border-border p-8 max-w-md">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">게시글을 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">삭제되었거나 존재하지 않는 게시글입니다.</p>
            <Button onClick={() => router.push('/community')}>목록으로</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/community" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Badge variant="outline" className={categoryColors[post.category]}>
            {categoryLabels[post.category]}
          </Badge>
          <span className="text-sm text-muted-foreground">{categoryLabels[post.category]}게시판</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 글 본문 */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {/* 제목 */}
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

            {/* 작성자 정보 */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600">
                  {post.author_nickname?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author_nickname || '익명'}</span>
                  <span className="text-xs text-muted-foreground">Lv.{post.author_level || 1}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.view_count.toLocaleString()}
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
              {post.content.split('\n').map((line, idx) => {
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

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* 추천/비추천 */}
            <div className="flex items-center justify-center gap-4 py-6 border-t border-b border-border">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleVote('like')}
                disabled={votePost.isPending}
                className="hover:bg-blue-600 hover:border-blue-600"
              >
                <ChevronUp className="h-5 w-5 mr-1" />
                추천 {post.like_count}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleVote('dislike')}
                disabled={votePost.isPending}
                className="hover:bg-red-600 hover:border-red-600"
              >
                <ChevronDown className="h-5 w-5 mr-1" />
                비추천 {post.dislike_count}
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
                <Link href="/community">
                  <Button variant="outline" size="sm">목록</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              댓글 {post.comment_count}
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
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || createComment.isPending}
                >
                  {createComment.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  댓글 등록
                </Button>
              </div>
            </div>

            {/* 댓글 로딩 */}
            {commentsLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* 댓글 목록 */}
            {!commentsLoading && comments && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    postAuthorId={post.author_id}
                  />
                ))}
              </div>
            )}

            {/* 댓글 없음 */}
            {!commentsLoading && (!comments || comments.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>첫 번째 댓글을 작성해보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
