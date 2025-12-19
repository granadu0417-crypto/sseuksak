'use client';

import { useState } from 'react';
import {
  Trophy,
  Target,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Flame,
  Medal,
  Crown,
  Zap,
  Calendar,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// 예측 이벤트 더미 데이터
const activePredictions = [
  { id: 1, title: '12월 국회 본회의 예산안 통과 여부', category: '국회', deadline: '2024-12-20', participants: 1523, options: [{ label: '통과', odds: 1.5, percent: 62 }, { label: '부결', odds: 2.8, percent: 38 }], prize: 50000 },
  { id: 2, title: '1월 대통령 지지율 40% 돌파 여부', category: '여론', deadline: '2025-01-15', participants: 2341, options: [{ label: '돌파', odds: 3.2, percent: 31 }, { label: '미달', odds: 1.3, percent: 69 }], prize: 30000 },
  { id: 3, title: '다음 국무총리 인선 정당', category: '인사', deadline: '2025-01-31', participants: 892, options: [{ label: '여당', odds: 1.8, percent: 55 }, { label: '야당', odds: 4.5, percent: 22 }, { label: '무소속', odds: 3.2, percent: 23 }], prize: 100000 },
  { id: 4, title: '연내 금리 인하 횟수', category: '경제', deadline: '2024-12-31', participants: 3421, options: [{ label: '0회', odds: 2.1, percent: 35 }, { label: '1회', odds: 1.6, percent: 48 }, { label: '2회 이상', odds: 5.0, percent: 17 }], prize: 20000 },
];

const pastPredictions = [
  { id: 101, title: '11월 보궐선거 결과', result: 'A당 승리', winners: 234, totalParticipants: 1892, accuracy: 68 },
  { id: 102, title: '3분기 GDP 성장률 범위', result: '0.5~1.0%', winners: 567, totalParticipants: 2341, accuracy: 24 },
  { id: 103, title: '국정감사 주요 쟁점', result: '경제정책', winners: 1234, totalParticipants: 1567, accuracy: 79 },
];

const leaderboard = [
  { rank: 1, nickname: '예측왕', level: 45, points: 125400, accuracy: 78, predictions: 234, streak: 12 },
  { rank: 2, nickname: '정치분석가', level: 42, points: 98700, accuracy: 72, predictions: 198, streak: 8 },
  { rank: 3, nickname: '데이터마스터', level: 38, points: 87600, accuracy: 75, predictions: 167, streak: 5 },
  { rank: 4, nickname: '트렌드헌터', level: 35, points: 76500, accuracy: 69, predictions: 189, streak: 3 },
  { rank: 5, nickname: '뉴스워처', level: 33, points: 65400, accuracy: 71, predictions: 145, streak: 7 },
  { rank: 6, nickname: '여론전문가', level: 31, points: 54300, accuracy: 67, predictions: 132, streak: 2 },
  { rank: 7, nickname: '시사평론가', level: 29, points: 43200, accuracy: 65, predictions: 121, streak: 4 },
  { rank: 8, nickname: '정책분석러', level: 27, points: 32100, accuracy: 63, predictions: 98, streak: 1 },
];

const myStats = { rank: 156, points: 12500, accuracy: 58, predictions: 23, streak: 2 };

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="border-b border-border bg-gradient-to-r from-zinc-900 via-purple-900/20 to-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                예측 리그
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                정치 이벤트를 예측하고 포인트를 획득하세요
              </p>
            </div>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">내 랭킹</p>
                  <p className="text-xl font-bold text-primary">#{myStats.rank}</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">포인트</p>
                  <p className="text-xl font-bold text-yellow-400">{myStats.points.toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">적중률</p>
                  <p className="text-xl font-bold text-green-400">{myStats.accuracy}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상단 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activePredictions.length}</p>
                  <p className="text-xs text-muted-foreground">진행중 예측</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8.2K</p>
                  <p className="text-xs text-muted-foreground">총 참여자</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">200K</p>
                  <p className="text-xs text-muted-foreground">총 상금 풀</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">67%</p>
                  <p className="text-xs text-muted-foreground">평균 적중률</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 예측 이벤트 */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-zinc-800/50 mb-4">
                <TabsTrigger value="active" className="gap-1">
                  <Flame className="h-4 w-4" /> 진행중
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-1">
                  <CheckCircle className="h-4 w-4" /> 종료됨
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activePredictions.map((pred) => (
                  <Card key={pred.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge variant="outline" className="mb-2">{pred.category}</Badge>
                          <h3 className="font-semibold text-lg">{pred.title}</h3>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          <Trophy className="h-3 w-3 mr-1" />
                          {pred.prize.toLocaleString()}P
                        </Badge>
                      </div>

                      {/* 옵션 버튼 */}
                      <div className="space-y-2 mb-4">
                        {pred.options.map((opt, idx) => (
                          <button
                            key={idx}
                            className="w-full p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-border hover:border-primary/50 transition-all flex items-center justify-between group"
                          >
                            <span className="font-medium">{opt.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">{opt.percent}%</span>
                              <Badge variant="secondary">x{opt.odds}</Badge>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* 하단 정보 */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {pred.participants.toLocaleString()}명 참여
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          마감: {pred.deadline}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastPredictions.map((pred) => (
                  <Card key={pred.id} className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{pred.title}</h3>
                        <Badge className="bg-green-500/20 text-green-400">종료</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">결과</p>
                          <p className="font-bold text-primary">{pred.result}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">적중자</p>
                          <p className="font-bold">{pred.winners} / {pred.totalParticipants}명 ({pred.accuracy}%)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* 오른쪽: 리더보드 */}
          <div>
            <Card className="bg-card border-border sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  리더보드
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {leaderboard.map((user, idx) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 ${
                      idx < 3 ? 'bg-zinc-800/30' : ''
                    }`}
                  >
                    <div className="w-8 text-center">
                      {idx === 0 ? <Crown className="h-5 w-5 text-yellow-500 mx-auto" /> :
                       idx === 1 ? <Medal className="h-5 w-5 text-zinc-400 mx-auto" /> :
                       idx === 2 ? <Medal className="h-5 w-5 text-amber-600 mx-auto" /> :
                       <span className="text-muted-foreground">{user.rank}</span>}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-zinc-800">
                        {user.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.nickname}</p>
                      <p className="text-xs text-muted-foreground">Lv.{user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-yellow-400">{user.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{user.accuracy}% 적중</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-primary/10 border-t border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center font-bold text-primary">#{myStats.rank}</div>
                    <Avatar className="h-8 w-8 ring-2 ring-primary">
                      <AvatarFallback className="text-xs bg-primary/20">나</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">내 순위</p>
                      <p className="text-xs text-muted-foreground">{myStats.predictions}회 참여</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-yellow-400">{myStats.points.toLocaleString()}</p>
                      <p className="text-xs text-green-400">{myStats.accuracy}% 적중</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 시즌 정보 */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold">시즌 1</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">2024.12.01 ~ 2025.02.28</p>
                <div className="flex items-center justify-between text-sm">
                  <span>남은 기간</span>
                  <span className="font-bold text-purple-400">74일</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
