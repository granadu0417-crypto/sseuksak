'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Loader2,
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
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
                    <a
                      href={politician.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {politician.sns_twitter && (
                    <a
                      href={politician.sns_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-blue-400"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {politician.sns_facebook && (
                    <a
                      href={politician.sns_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-blue-600"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {politician.sns_instagram && (
                    <a
                      href={politician.sns_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-pink-500"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {politician.contact_email && (
                    <a
                      href={`mailto:${politician.contact_email}`}
                      className="text-muted-foreground hover:text-primary"
                    >
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

        {/* 탭: 활동 내역, 공약 */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="activities">활동 내역</TabsTrigger>
            <TabsTrigger value="promises">공약</TabsTrigger>
          </TabsList>

          {/* 활동 내역 탭 */}
          <TabsContent value="activities">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                {politician.activities && politician.activities.length > 0 ? (
                  <div className="space-y-4">
                    {politician.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/50"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {activityTypeLabels[activity.activity_type] || activity.activity_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {activity.activity_date}
                            </span>
                          </div>
                          <h4 className="font-medium mb-1">{activity.title}</h4>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
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
                        <div
                          key={promise.id}
                          className="p-4 rounded-lg bg-zinc-800/50"
                        >
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
                                <p className="text-sm text-muted-foreground mt-1">
                                  {promise.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{promise.progress}%</div>
                              {promise.target_date && (
                                <div className="text-xs text-muted-foreground">
                                  목표: {promise.target_date}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* 진행률 바 */}
                          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                promise.status === 'completed'
                                  ? 'bg-green-500'
                                  : promise.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-primary'
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
        </Tabs>
      </div>
    </div>
  );
}
