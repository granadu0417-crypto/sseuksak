'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Image,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Send,
  Loader2,
  LogIn,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreatePost, useCurrentUser } from '@/lib/api/hooks';

const categories = [
  { id: 'free', label: '자유', description: '자유롭게 이야기 나눠요' },
  { id: 'debate', label: '토론', description: '정책/이슈 토론' },
  { id: 'info', label: '정보', description: '유용한 정보 공유' },
  { id: 'humor', label: '유머', description: '재미있는 글' },
];

const rules = [
  '타인을 비방하거나 욕설을 사용하지 마세요.',
  '허위 정보나 가짜 뉴스를 퍼뜨리지 마세요.',
  '특정 정당/정치인 비하 목적의 글은 삭제될 수 있습니다.',
  '광고, 홍보성 글은 금지됩니다.',
  '선거법을 준수해주세요.',
];

export default function WritePage() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  const createPost = useCreatePost();

  // 로그인 체크 - 로딩 중이거나 로그인되지 않은 경우 처리
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-6">
              글을 작성하려면 먼저 로그인해주세요.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login?returnUrl=/write">
                <Button>로그인</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">회원가입</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!category || !title.trim() || !content.trim()) {
      alert('카테고리, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createPost.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagArray.length > 0 ? tagArray : undefined,
      },
      {
        onSuccess: (data) => {
          router.push(`/posts/${data.id}`);
        },
        onError: (error) => {
          alert(error instanceof Error ? error.message : '글 작성에 실패했습니다.');
        },
      }
    );
  };

  const insertMarkdown = (syntax: string, wrap = false) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText;
    if (wrap && selectedText) {
      newText = content.substring(0, start) + syntax + selectedText + syntax + content.substring(end);
    } else {
      newText = content.substring(0, start) + syntax + content.substring(end);
    }
    
    setContent(newText);
  };

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/community" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold text-lg">글쓰기</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {isPreview ? '편집' : '미리보기'}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={createPost.isPending || !category || !title.trim() || !content.trim()}
            >
              {createPost.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              {createPost.isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* 메인: 글쓰기 폼 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 카테고리 선택 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <label className="block text-sm font-medium mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        category === cat.id
                          ? 'border-primary bg-primary/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <span className="font-medium text-sm">{cat.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.description}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 제목 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <label className="block text-sm font-medium mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-lg"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {title.length}/100
                </p>
              </CardContent>
            </Card>

            {/* 내용 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  {/* 툴바 */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown('**', true)}
                      title="굵게"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown('*', true)}
                      title="기울임"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown('\n- ')}
                      title="목록"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown('\n> ')}
                      title="인용"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertMarkdown('`', true)}
                      title="코드"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-zinc-700 mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="이미지"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="링크"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isPreview ? (
                  <div className="min-h-[300px] p-4 rounded-lg bg-zinc-800/30 prose prose-invert prose-sm max-w-none">
                    {content.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx} className="ml-4">{line.replace('- ', '')}</li>;
                      }
                      if (line.startsWith('> ')) {
                        return <blockquote key={idx} className="border-l-2 border-primary pl-4 italic">{line.replace('> ', '')}</blockquote>;
                      }
                      if (line === '') {
                        return <br key={idx} />;
                      }
                      return <p key={idx} className="mb-2">{line}</p>;
                    })}
                    {!content && <p className="text-muted-foreground">미리보기할 내용이 없습니다.</p>}
                  </div>
                ) : (
                  <Textarea
                    placeholder="내용을 입력하세요. 마크다운 문법을 지원합니다."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] bg-zinc-800/50 border-zinc-700 resize-none"
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {content.length}자
                </p>
              </CardContent>
            </Card>

            {/* 태그 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <label className="block text-sm font-medium mb-2">
                  태그 <span className="text-muted-foreground text-xs">(선택, 쉼표로 구분)</span>
                </label>
                <Input
                  placeholder="예: 국회, 예산, 정책"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                />
                {tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.split(',').filter(t => t.trim()).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-zinc-800">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드: 안내 */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">작성 안내</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 마크다운 문법을 사용할 수 있습니다.</p>
                <p>• <code className="bg-zinc-800 px-1 rounded">**굵게**</code>, <code className="bg-zinc-800 px-1 rounded">*기울임*</code></p>
                <p>• <code className="bg-zinc-800 px-1 rounded">## 제목</code></p>
                <p>• <code className="bg-zinc-800 px-1 rounded">- 목록</code></p>
                <p>• <code className="bg-zinc-800 px-1 rounded">&gt; 인용</code></p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-yellow-500">커뮤니티 규칙</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {rules.map((rule, idx) => (
                  <p key={idx} className="flex gap-2">
                    <span className="text-yellow-500">•</span>
                    <span className="text-muted-foreground">{rule}</span>
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
