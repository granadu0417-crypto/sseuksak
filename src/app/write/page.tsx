'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Quote,
  Code,
  Table,
  Eye,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const categories = [
  { id: 'free', label: '자유', icon: '💬', description: '자유롭게 이야기하는 공간' },
  { id: 'debate', label: '토론', icon: '⚔️', description: '찬반 의견을 나누는 공간' },
  { id: 'info', label: '정보', icon: '📊', description: '정치 정보 공유 공간' },
  { id: 'humor', label: '유머', icon: '😂', description: '재미있는 정치 이야기' },
];

const toolbarButtons = [
  { icon: Bold, label: '굵게', action: 'bold' },
  { icon: Italic, label: '기울임', action: 'italic' },
  { icon: Underline, label: '밑줄', action: 'underline' },
  { type: 'divider' },
  { icon: List, label: '목록', action: 'list' },
  { icon: ListOrdered, label: '번호 목록', action: 'ordered-list' },
  { icon: Quote, label: '인용', action: 'quote' },
  { type: 'divider' },
  { icon: LinkIcon, label: '링크', action: 'link' },
  { icon: Image, label: '이미지', action: 'image' },
  { icon: Table, label: '표', action: 'table' },
  { icon: Code, label: '코드', action: 'code' },
];

const writingTips = [
  '제목은 내용을 명확히 나타내주세요',
  '출처가 있는 정보는 출처를 함께 적어주세요',
  '상대방을 존중하는 표현을 사용해주세요',
  '허위사실 유포는 법적 책임이 따를 수 있어요',
];

export default function WritePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isValid = selectedCategory && title.trim().length >= 2 && content.trim().length >= 10;

  const handleSubmit = () => {
    if (!isValid) return;
    // TODO: API 연동
    alert('글이 등록되었습니다!');
    router.push('/community');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 바 */}
      <div className="border-b border-border bg-zinc-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/community"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            취소
          </Link>
          <h1 className="font-semibold">글쓰기</h1>
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
              disabled={!isValid}
              onClick={handleSubmit}
            >
              <Send className="h-4 w-4 mr-1" />
              등록
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 에디터 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 카테고리 선택 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <label className="text-sm font-medium mb-3 block">카테고리 선택 *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedCategory === cat.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border hover:border-zinc-600 bg-zinc-800/30'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 제목 입력 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Input
                  placeholder="제목을 입력하세요 (최소 2자)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium bg-transparent border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {title.length}/100
                </div>
              </CardContent>
            </Card>

            {/* 본문 에디터 */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {/* 툴바 */}
                <div className="flex items-center gap-1 p-2 border-b border-border bg-zinc-800/30 flex-wrap">
                  {toolbarButtons.map((btn, idx) =>
                    btn.type === 'divider' ? (
                      <div key={idx} className="w-px h-6 bg-border mx-1" />
                    ) : (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title={btn.label}
                      >
                        {btn.icon && <btn.icon className="h-4 w-4" />}
                      </Button>
                    )
                  )}
                </div>

                {/* 에디터/미리보기 영역 */}
                {isPreview ? (
                  <div className="p-4 min-h-[400px] prose prose-invert prose-sm max-w-none">
                    <h2>{title || '제목 없음'}</h2>
                    <div className="whitespace-pre-wrap">{content || '내용 없음'}</div>
                  </div>
                ) : (
                  <textarea
                    placeholder="내용을 입력하세요 (최소 10자)&#10;&#10;마크다운 문법을 지원합니다:&#10;- **굵게** / *기울임*&#10;- ## 제목&#10;- > 인용&#10;- - 목록"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                )}

                {/* 글자 수 */}
                <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex justify-between">
                  <span>마크다운 문법 지원</span>
                  <span>{content.length}자</span>
                </div>
              </CardContent>
            </Card>

            {/* 태그 입력 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <label className="text-sm font-medium mb-3 block">
                  태그 (선택, 최대 5개)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="태그 입력 후 Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-zinc-800/50 border-zinc-700"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={tags.length >= 5 || !tagInput.trim()}
                  >
                    추가
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 작성 팁 */}
            {showTips && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      작성 시 유의사항
                    </h3>
                    <button
                      onClick={() => setShowTips(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {writingTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 작성 상태 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">작성 상태</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">카테고리</span>
                    <span className={selectedCategory ? 'text-green-400' : 'text-red-400'}>
                      {selectedCategory ? '✓ 선택됨' : '✗ 필수'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">제목</span>
                    <span className={title.length >= 2 ? 'text-green-400' : 'text-red-400'}>
                      {title.length >= 2 ? '✓ 입력됨' : '✗ 최소 2자'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">내용</span>
                    <span className={content.length >= 10 ? 'text-green-400' : 'text-red-400'}>
                      {content.length >= 10 ? '✓ 입력됨' : '✗ 최소 10자'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">태그</span>
                    <span className="text-muted-foreground">
                      {tags.length}/5 (선택)
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    className="w-full"
                    disabled={!isValid}
                    onClick={handleSubmit}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    글 등록하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
