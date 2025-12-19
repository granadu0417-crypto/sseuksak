'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  MapPin,
  Building,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  ThumbsUp,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// 더미 데이터
const politicianDetail = {
  id: '1',
  name: '김민수',
  party: '더불어민주당',
  region: '서울 강남구',
  position: '국회의원 (22대)',
  imageUrl: null,
  bio: '서울대학교 법학과 졸업. 검사 출신으로 15년간 법조계에서 활동 후 정치에 입문. 청년 정책과 경제 민주화를 주요 공약으로 내세우고 있습니다.',
  contact: {
    office: '국회의원회관 512호',
    phone: '02-784-1234',
    email: 'kimms@assembly.go.kr',
    website: 'https://kimms.or.kr',
  },
  stats: {
    attendance: 92,
    bills: 78,
    promises: 65,
    billsProposed: 45,
    billsPassed: 12,
    speechCount: 89,
  },
  trend: 'up' as 'up' | 'down' | null,
  rank: 1,
  likes: 1523,
  followers: 12500,
  tags: ['경제', '청년', '법률', '민생'],
};

const promisesList = [
  { id: 1, title: '청년 주거 지원금 확대', status: 'completed', progress: 100, category: '복지' },
  { id: 2, title: '중소기업 세금 감면', status: 'in_progress', progress: 65, category: '경제' },
  { id: 3, title: '디지털 교육 인프라 구축', status: 'in_progress', progress: 40, category: '교육' },
  { id: 4, title: '환경 규제 강화', status: 'pending', progress: 10, category: '환경' },
  { id: 5, title: '의료 접근성 개선', status: 'in_progress', progress: 55, category: '복지' },
];

const recentActivities = [
  { id: 1, type: 'bill', title: '청년기본법 일부개정법률안 발의', date: '2024-12-15', status: '심사중' },
  { id: 2, type: 'speech', title: '예산결산특별위원회 질의', date: '2024-12-12', status: '완료' },
  { id: 3, type: 'attendance', title: '본회의 출석', date: '2024-12-10', status: '출석' },
  { id: 4, type: 'bill', title: '중소기업지원법 개정안 공동발의', date: '2024-12-08', status: '심사중' },
  { id: 5, type: 'speech', title: '정치분야 대정부질문', date: '2024-12-05', status: '완료' },
];

const partyColors: Record<string, string> = {
  '더불어민주당': 'bg-[#0066ff]',
  '국민의힘': 'bg-[#e61e2b]',
  '조국혁신당': 'bg-[#00c4b4]',
  '개혁신당': 'bg-[#ff6b00]',
  '무소속': 'bg-zinc-600',
};

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20', label: '완료' },
  in_progress: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: '진행중' },
  pending: { icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-500/20', label: '대기' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: '무산' },
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function PoliticianDetailPage() {
  const params = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const politician = politicianDetail;
  const partyColor = partyColors[politician.party] || 'bg-zinc-600';

  return (
    <div className="min-h-screen">
      {/* 상단 바 */}
      <div className="border-b border-border bg-zinc-900/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/politicians" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              공유
            </Button>
            <Button variant={isLiked ? 'default' : 'outline'} size="sm" onClick={() => setIsLiked(!isLiked)}>
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {politician.likes + (isLiked ? 1 : 0)}
            </Button>
          </div>
        </div>
      </div>

      {/* 프로필 헤더 */}
      <div className="border-b border-border bg-gradient-to-b from-zinc-900 to-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 프로필 이미지 */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-zinc-700">
                <AvatarImage src={politician.imageUrl || undefined} />
                <AvatarFallback className="text-4xl bg-zinc-800">{politician.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {politician.rank}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{politician.name}</h1>
                {politician.trend === 'up' && <TrendingUp className="h-6 w-6 text-green-500" />}
                {politician.trend === 'down' && <TrendingDown className="h-6 w-6 text-red-500" />}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`${partyColor} text-white`}>{politician.party}</Badge>
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {politician.region}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building className="h-4 w-4" /> {politician.position}
                </span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-2xl">{politician.bio}</p>
              <div className="flex flex-wrap gap-2">
                {politician.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-zinc-800/50">#{tag}</Badge>
                ))}
              </div>
            </div>

            {/* 핵심 스탯 */}
            <div className="flex md:flex-col gap-4 md:gap-2 md:min-w-[140px]">
              <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                <p className="text-2xl font-bold text-green-400">{politician.stats.attendance}%</p>
                <p className="text-xs text-muted-foreground">출석률</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                <p className="text-2xl font-bold text-blue-400">{politician.stats.billsProposed}</p>
                <p className="text-xs text-muted-foreground">발의 법안</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                <p className="text-2xl font-bold text-purple-400">{politician.stats.promises}%</p>
                <p className="text-xs text-muted-foreground">공약 이행</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="max-w-5xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-800/50 mb-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="promises">공약</TabsTrigger>
            <TabsTrigger value="activities">활동</TabsTrigger>
            <TabsTrigger value="stats">상세 통계</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 활동 지표 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    활동 지표
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatBar label="출석률" value={politician.stats.attendance} color="bg-green-500" />
                  <StatBar label="법안 활동" value={politician.stats.bills} color="bg-blue-500" />
                  <StatBar label="공약 이행" value={politician.stats.promises} color="bg-purple-500" />
                </CardContent>
              </Card>

              {/* 연락처 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    연락처
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">사무실</span>
                    <span>{politician.contact.office}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">전화</span>
                    <span>{politician.contact.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이메일</span>
                    <span className="text-primary">{politician.contact.email}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <a href={politician.contact.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      공식 홈페이지
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 최근 활동 */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/30">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant="secondary">{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 공약 탭 */}
          <TabsContent value="promises">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  공약 이행 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {promisesList.map((promise) => {
                  const status = statusConfig[promise.status as keyof typeof statusConfig];
                  return (
                    <div key={promise.id} className="p-4 rounded-lg bg-zinc-800/30 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{promise.title}</h4>
                            <Badge variant="outline">{promise.category}</Badge>
                          </div>
                        </div>
                        <Badge className={`${status.bg} ${status.color}`}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">진행률</span>
                          <span className="font-medium">{promise.progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              promise.status === 'completed' ? 'bg-green-500' :
                              promise.status === 'in_progress' ? 'bg-yellow-500' : 'bg-zinc-600'
                            }`}
                            style={{ width: `${promise.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 활동 탭 */}
          <TabsContent value="activities">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  전체 활동 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant="secondary">{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 상세 통계 탭 */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">의정 활동</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground">발의 법안</span>
                    <span className="text-2xl font-bold text-blue-400">{politician.stats.billsProposed}건</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground">통과 법안</span>
                    <span className="text-2xl font-bold text-green-400">{politician.stats.billsPassed}건</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground">발언 횟수</span>
                    <span className="text-2xl font-bold text-purple-400">{politician.stats.speechCount}회</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground">출석률</span>
                    <span className="text-2xl font-bold text-orange-400">{politician.stats.attendance}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">커뮤니티 반응</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" /> 좋아요
                    </span>
                    <span className="text-2xl font-bold text-red-400">{politician.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" /> 팔로워
                    </span>
                    <span className="text-2xl font-bold text-primary">{politician.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> 관련 게시글
                    </span>
                    <span className="text-2xl font-bold text-yellow-400">234</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Award className="h-4 w-4" /> 커뮤니티 랭킹
                    </span>
                    <span className="text-2xl font-bold text-cyan-400">#{politician.rank}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
