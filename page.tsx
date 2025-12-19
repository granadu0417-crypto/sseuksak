import Link from 'next/link';
import {
  Users,
  Target,
  CheckCircle,
  Trophy,
  Tv,
  ArrowRight,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Users,
    title: '정치인 스탯 카드',
    description: '출석률, 법안 발의, 공약 이행률을 한눈에',
    href: '/politicians',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Target,
    title: '공약 추적기',
    description: '선거 공약의 실제 이행 현황 추적',
    href: '/promises',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: CheckCircle,
    title: '팩트체크',
    description: '시민이 함께 검증하는 정치 발언',
    href: '/factcheck',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    icon: Trophy,
    title: '예측 리그',
    description: '정치 이벤트 예측하고 포인트 획득',
    href: '/predictions',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: Tv,
    title: '국회 LIVE',
    description: '실시간 국회 중계와 하이라이트',
    href: '/live',
    color: 'bg-red-500/10 text-red-500',
  },
  {
    icon: MessageSquare,
    title: '토론장',
    description: '정책 기반 건전한 토론 공간',
    href: '/debates',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
];

const stats = [
  { label: '등록 정치인', value: '300+' },
  { label: '추적 중인 공약', value: '1,200+' },
  { label: '팩트체크 완료', value: '500+' },
  { label: '활성 사용자', value: '10K+' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🎮 게이미피케이션 정치 참여
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            정치, 이제는{' '}
            <span className="text-primary">즐겁게</span> 참여하세요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            정치인 스탯 카드, 공약 추적, 팩트체크까지.
            <br />
            시민이 만들어가는 투명한 정치 정보 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/politicians">
                둘러보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">서비스 소개</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">주요 기능</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              데이터 기반의 정치 정보와 게이미피케이션을 결합한 새로운 참여 방식
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary flex items-center">
                      자세히 보기 <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                실시간 트렌드
              </h2>
              <p className="text-muted-foreground mt-1">
                지금 가장 주목받는 정치 이슈
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/trending">전체 보기</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    #{i} 트렌딩
                  </Badge>
                  <CardTitle className="text-lg mt-2">
                    데이터 로딩 중...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    실제 데이터가 연결되면 표시됩니다
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            정치 참여, 지금 시작하세요
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            회원가입 없이도 대부분의 기능을 이용할 수 있습니다.
            <br />
            가입하면 예측 리그, 배지 수집 등 더 많은 기능을 즐길 수 있어요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">무료로 시작하기</Button>
            <Button size="lg" variant="outline">
              게스트로 둘러보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
