'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Calendar,
  Mail,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Target,
  Award,
  Users,
  Vote,
  Gavel,
  Building,
  Banknote,
  History,
  Briefcase,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Minus,
  UserX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePolitician } from '@/lib/api/hooks';

// 공약 상태 아이콘 및 색상
const promiseStatusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-green-400', label: '이행 완료' },
  in_progress: { icon: Clock, color: 'text-yellow-400', label: '진행 중' },
  not_started: { icon: Target, color: 'text-gray-400', label: '미착수' },
  failed: { icon: XCircle, color: 'text-red-400', label: '이행 실패' },
};

// 활동 유형 라벨
const activityTypeLabels: Record<string, string> = {
  bill: '법안 발의',
  speech: '의정 발언',
  vote: '표결 참여',
  committee: '위원회 활동',
  media: '언론 활동',
  event: '행사 참여',
};

// 표결 결과 색상
const voteResultConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  yes: { color: 'text-green-400', icon: ThumbsUp, label: '찬성' },
  no: { color: 'text-red-400', icon: ThumbsDown, label: '반대' },
  abstain: { color: 'text-yellow-400', icon: Minus, label: '기권' },
  absent: { color: 'text-gray-400', icon: UserX, label: '불참' },
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  return amount.toLocaleString();
}

export default function PoliticianDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: politician, isLoading, isError } = usePolitician(id);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !politician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-card border-border p-8 max-w-md">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">정치인을 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">요청하신 정치인 정보가 존재하지 않습니다.</p>
            <Link href="/politicians">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const promiseRate = politician.promise_count > 0
    ? Math.round((politician.promise_completed / politician.promise_count) * 100)
    : 0;

  const activityStats = politician.activity_stats;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 뒤로가기 */}
        <Link href="/politicians" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          정치인 목록
        </Link>

        {/* 기본 정보 카드 */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-4" style={{ borderColor: politician.party_color || '#808080' }}>
                {politician.avatar_url && (
                  <AvatarImage src={politician.avatar_url} alt={politician.name} />
                )}
                <AvatarFallback
                  className="text-3xl font-bold text-white"
                  style={{ backgroundColor: politician.party_color || '#808080' }}
                >
                  {politician.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{politician.name}</h1>
                  {politician.is_trending === 1 && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      HOT
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{
                      borderColor: politician.party_color || '#808080',
                      color: politician.party_color || '#808080',
                    }}
                  >
                    {politician.party_name || '무소속'}
                  </Badge>
                  {politician.region && (
                    <span className="text-muted-foreground">{politician.region}</span>
                  )}
                  {politician.position && (
                    <span className="text-muted-foreground">· {politician.position}</span>
                  )}
                </div>

                {/* 당직 정보 */}
                {politician.party_positions && politician.party_positions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {politician.party_positions.map((pos) => (
                      <Badge key={pos.id} className="bg-primary/20 text-primary">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {pos.position_name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 태그 */}
                {politician.tags && politician.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {politician.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-zinc-800">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* SNS 링크 */}
                <div className="flex items-center gap-3">
                  {politician.website_url && (
                    <a href={politician.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {politician.sns_twitter && (
                    <a href={politician.sns_twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-400">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {politician.sns_facebook && (
                    <a href={politician.sns_facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {politician.sns_instagram && (
                    <a href={politician.sns_instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {politician.contact_email && (
                    <a href={`mailto:${politician.contact_email}`} className="text-muted-foreground hover:text-primary">
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{politician.attendance_rate}%</div>
              <div className="text-sm text-muted-foreground">출석률</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{politician.bill_count}</div>
              <div className="text-sm text-muted-foreground">발의 법안</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{promiseRate}%</div>
              <div className="text-sm text-muted-foreground">공약 이행률</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{politician.approval_rating}%</div>
              <div className="text-sm text-muted-foreground">지지율</div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-zinc-800">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="activities">의정활동</TabsTrigger>
            <TabsTrigger value="promises">공약</TabsTrigger>
            <TabsTrigger value="votes">표결</TabsTrigger>
            <TabsTrigger value="assets">재산</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 의정활동 통계 */}
              {activityStats && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-5 w-5" />
                      의정활동 통계
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">본회의 출석률</span>
                      <span className="font-medium">{activityStats.plenary_attendance_rate}%</span>
                    </div>
                    <Progress value={activityStats.plenary_attendance_rate} className="h-2" />

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-muted-foreground">위원회 출석률</span>
                      <span className="font-medium">{activityStats.committee_attendance_rate}%</span>
                    </div>
                    <Progress value={activityStats.committee_attendance_rate} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{activityStats.bills_sponsored}</div>
                        <div className="text-xs text-muted-foreground">대표발의</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{activityStats.bills_cosponsored}</div>
                        <div className="text-xs text-muted-foreground">공동발의</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{activityStats.bills_passed}</div>
                        <div className="text-xs text-muted-foreground">가결</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{activityStats.total_votes}</div>
                        <div className="text-xs text-muted-foreground">표결 참여</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 위원회 활동 */}
              {politician.committee_activities && politician.committee_activities.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building className="h-5 w-5" />
                      소속 위원회
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {politician.committee_activities.map((committee) => (
                        <div key={committee.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                          <span className="font-medium">{committee.committee_name}</span>
                          {committee.position && (
                            <Badge variant="outline" className={
                              committee.position === '위원장' ? 'border-yellow-500 text-yellow-500' :
                              committee.position === '간사' ? 'border-blue-500 text-blue-500' :
                              ''
                            }>
                              {committee.position}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 선거 이력 */}
              {politician.election_history && politician.election_history.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <History className="h-5 w-5" />
                      선거 이력
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {politician.election_history.map((election) => (
                        <div key={election.id} className="p-3 rounded-lg bg-zinc-800/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{election.election_type}</span>
                            <Badge variant={election.is_elected ? "default" : "secondary"}>
                              {election.is_elected ? '당선' : '낙선'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {election.constituency && <span>{election.constituency}</span>}
                            {election.vote_rate && <span className="ml-2">득표율 {election.vote_rate}%</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {election.election_date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 후원금 요약 */}
              {politician.contribution_summary && politician.contribution_summary.total_contributions > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Banknote className="h-5 w-5" />
                      후원금 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">총 후원금</span>
                        <span className="font-bold text-lg">{formatMoney(politician.contribution_summary.total_contributions)}원</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">후원자 수</span>
                        <span className="font-medium">{politician.contribution_summary.total_donors}명</span>
                      </div>
                      {politician.contribution_summary.avg_yearly_amount && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">연평균</span>
                          <span className="font-medium">{formatMoney(politician.contribution_summary.avg_yearly_amount)}원</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 의정활동 탭 */}
          <TabsContent value="activities">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 최근 발의 법안 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Gavel className="h-5 w-5" />
                    최근 발의 법안
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {politician.recent_bills && politician.recent_bills.length > 0 ? (
                    <div className="space-y-3">
                      {politician.recent_bills.map((bill) => (
                        <div key={bill.id} className="p-3 rounded-lg bg-zinc-800/50">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm line-clamp-2">{bill.bill_name}</h4>
                            <Badge variant="outline" className="flex-shrink-0 text-xs">
                              {bill.sponsor_type === 'representative' ? '대표' : '공동'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {bill.propose_date && <span>{bill.propose_date}</span>}
                            {bill.committee && <span>· {bill.committee}</span>}
                          </div>
                          {bill.proc_result && (
                            <Badge
                              variant="secondary"
                              className={`mt-2 text-xs ${
                                bill.proc_result.includes('가결') ? 'bg-green-500/20 text-green-400' :
                                bill.proc_result.includes('폐기') ? 'bg-red-500/20 text-red-400' :
                                ''
                              }`}
                            >
                              {bill.proc_result}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      등록된 발의 법안이 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 최근 활동 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5" />
                    최근 활동
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {politician.activities && politician.activities.length > 0 ? (
                    <div className="space-y-3">
                      {politician.activities.map((activity) => (
                        <div key={activity.id} className="p-3 rounded-lg bg-zinc-800/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {activityTypeLabels[activity.activity_type] || activity.activity_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{activity.activity_date}</span>
                          </div>
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
                          )}
                          {activity.source_url && (
                            <a
                              href={activity.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                            >
                              자세히 보기
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      등록된 활동 내역이 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 공약 탭 */}
          <TabsContent value="promises">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  공약 현황
                  <span className="text-sm font-normal text-muted-foreground">
                    ({politician.promise_completed}/{politician.promise_count} 이행)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {politician.promises && politician.promises.length > 0 ? (
                  <div className="space-y-4">
                    {politician.promises.map((promise) => {
                      const statusConfig = promiseStatusConfig[promise.status] || promiseStatusConfig.not_started;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div key={promise.id} className="p-4 rounded-lg bg-zinc-800/50">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {promise.category}
                                </Badge>
                                <span className={`flex items-center text-xs ${statusConfig.color}`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </span>
                              </div>
                              <h4 className="font-medium">{promise.title}</h4>
                              {promise.description && (
                                <p className="text-sm text-muted-foreground mt-1">{promise.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{promise.progress}%</div>
                              {promise.target_date && (
                                <div className="text-xs text-muted-foreground">목표: {promise.target_date}</div>
                              )}
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                promise.status === 'completed' ? 'bg-green-500' :
                                promise.status === 'failed' ? 'bg-red-500' : 'bg-primary'
                              }`}
                              style={{ width: `${promise.progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    등록된 공약이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 표결 탭 */}
          <TabsContent value="votes">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 표결 통계 */}
              {activityStats && activityStats.total_votes > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Vote className="h-5 w-5" />
                      표결 통계
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-green-500/10">
                        <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
                        <div className="text-2xl font-bold text-green-400">{activityStats.yes_votes}</div>
                        <div className="text-xs text-muted-foreground">찬성</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-red-500/10">
                        <ThumbsDown className="h-6 w-6 mx-auto mb-2 text-red-400" />
                        <div className="text-2xl font-bold text-red-400">{activityStats.no_votes}</div>
                        <div className="text-xs text-muted-foreground">반대</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                        <Minus className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                        <div className="text-2xl font-bold text-yellow-400">{activityStats.abstain_votes}</div>
                        <div className="text-xs text-muted-foreground">기권</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-zinc-500/10">
                        <UserX className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <div className="text-2xl font-bold text-gray-400">{activityStats.absent_votes}</div>
                        <div className="text-xs text-muted-foreground">불참</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 최근 표결 기록 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5" />
                    최근 표결 기록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {politician.recent_votes && politician.recent_votes.length > 0 ? (
                    <div className="space-y-3">
                      {politician.recent_votes.map((vote) => {
                        const config = voteResultConfig[vote.vote_result] || voteResultConfig.absent;
                        const VoteIcon = config.icon;

                        return (
                          <div key={vote.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                            <div className={`p-2 rounded-full ${config.color} bg-current/10`}>
                              <VoteIcon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-1">{vote.bill_name || '안건명 없음'}</h4>
                              {vote.vote_date && (
                                <span className="text-xs text-muted-foreground">{vote.vote_date}</span>
                              )}
                            </div>
                            <Badge variant="outline" className={`text-xs ${config.color}`}>
                              {config.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      등록된 표결 기록이 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 재산 탭 */}
          <TabsContent value="assets">
            {politician.asset_summary && politician.asset_summary.total_assets > 0 ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    재산 현황
                    {politician.asset_summary.latest_report_date && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({politician.asset_summary.latest_report_date} 기준)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 총 자산 */}
                    <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="text-sm text-muted-foreground mb-1">총 자산</div>
                      <div className="text-3xl font-bold">{formatMoney(politician.asset_summary.total_assets)}원</div>
                      {politician.asset_summary.asset_change_rate !== null && (
                        <div className={`text-sm mt-2 ${
                          politician.asset_summary.asset_change_rate > 0 ? 'text-green-400' :
                          politician.asset_summary.asset_change_rate < 0 ? 'text-red-400' : 'text-muted-foreground'
                        }`}>
                          전년 대비 {politician.asset_summary.asset_change_rate > 0 ? '+' : ''}
                          {politician.asset_summary.asset_change_rate.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    {/* 자산 구성 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">부동산</span>
                        <span className="font-medium">{formatMoney(politician.asset_summary.total_real_estate)}원</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">유가증권</span>
                        <span className="font-medium">{formatMoney(politician.asset_summary.total_securities)}원</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">예금</span>
                        <span className="font-medium">{formatMoney(politician.asset_summary.total_deposits)}원</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                        <span className="text-red-400">부채</span>
                        <span className="font-medium text-red-400">-{formatMoney(politician.asset_summary.total_debts)}원</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border p-8">
                <div className="flex flex-col items-center text-center">
                  <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">재산 정보가 없습니다</h3>
                  <p className="text-muted-foreground">등록된 재산 신고 정보가 없습니다.</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
