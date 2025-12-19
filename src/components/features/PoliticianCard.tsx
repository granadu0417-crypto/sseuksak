'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

interface PoliticianStats {
  attendance: number;
  bills: number;
  promises: number;
}

interface PoliticianCardProps {
  name: string;
  party: string;
  region: string;
  position: string;
  imageUrl?: string;
  stats: PoliticianStats;
  tags?: string[];
  likes?: number;
  comments?: number;
  trend?: 'up' | 'down' | 'stable';
  rank?: number;
}

const partyColors: Record<string, string> = {
  '더불어민주당': 'bg-[#0066ff]',
  '국민의힘': 'bg-[#e61e2b]',
  '조국혁신당': 'bg-[#00c4b4]',
  '개혁신당': 'bg-[#ff6b00]',
  '정의당': 'bg-[#ffcc00] text-black',
  '무소속': 'bg-zinc-600',
};

const partyTextColors: Record<string, string> = {
  '더불어민주당': 'text-[#0066ff]',
  '국민의힘': 'text-[#e61e2b]',
  '조국혁신당': 'text-[#00c4b4]',
  '개혁신당': 'text-[#ff6b00]',
  '정의당': 'text-[#ffcc00]',
  '무소속': 'text-zinc-400',
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full progress-animated ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function PoliticianCard({
  name,
  party,
  region,
  position,
  imageUrl,
  stats,
  tags = [],
  likes = 0,
  comments = 0,
  trend,
  rank,
}: PoliticianCardProps) {
  const partyColor = partyColors[party] || 'bg-zinc-600';
  const partyText = partyTextColors[party] || 'text-zinc-400';

  return (
    <Card className="card-hover bg-card border-border overflow-hidden">
      <CardContent className="p-4">
        {/* 헤더: 프로필 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-zinc-700">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className="bg-zinc-800 text-lg">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {rank && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                {rank}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg truncate">{name}</h3>
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={`${partyColor} text-white text-xs`}>
                {party}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {region} · {position}
              </span>
            </div>
          </div>
        </div>

        {/* 스탯 바 */}
        <div className="space-y-3 mb-4">
          <StatBar label="출석률" value={stats.attendance} color="bg-green-500" />
          <StatBar label="법안 발의" value={stats.bills} color="bg-blue-500" />
          <StatBar label="공약 이행" value={stats.promises} color="bg-purple-500" />
        </div>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-zinc-800/50">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 푸터: 반응 */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span>{likes.toLocaleString()}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.toLocaleString()}</span>
          </button>
          <button className={`ml-auto text-sm font-medium ${partyText} hover:underline`}>
            상세보기
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
