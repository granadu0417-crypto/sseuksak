'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Target,
  CheckCircle,
  Swords,
  Trophy,
  BarChart3,
  Tv,
  MapPin,
  Home,
  Flame,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores/useStore';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  {
    category: '메인',
    items: [
      { icon: Home, label: '홈', href: '/' },
      { icon: Flame, label: '트렌딩', href: '/trending', badge: 'HOT' },
    ],
  },
  {
    category: '정치 정보',
    items: [
      { icon: Users, label: '정치인 카드', href: '/politicians' },
      { icon: Target, label: '공약 추적기', href: '/promises' },
      { icon: CheckCircle, label: '팩트체크', href: '/factcheck' },
      { icon: Wallet, label: '예산 비교', href: '/budget', badge: 'NEW' },
      { icon: Tv, label: '국회 LIVE', href: '/live', badge: 'LIVE' },
    ],
  },
  {
    category: '커뮤니티',
    items: [
      { icon: Swords, label: '토론 아레나', href: '/debates' },
      { icon: Trophy, label: '예측 리그', href: '/predictions' },
      { icon: BarChart3, label: '여론 조사', href: '/polls' },
      { icon: MapPin, label: '지역구 대항전', href: '/regions' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useStore();

  return (
    <>
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          'fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-sidebar border-r border-border',
          'transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="h-full overflow-y-auto scrollbar-thin p-4 space-y-6">
          {menuItems.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                {group.category}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-zinc-800/50'
                      )}
                    >
                      <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-1.5 py-0',
                            item.badge === 'LIVE' && 'bg-red-500/20 text-red-400 border-red-500/30',
                            item.badge === 'HOT' && 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                            item.badge === 'NEW' && 'bg-green-500/20 text-green-400 border-green-500/30'
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 하단 프로모션 카드 */}
          <div className="mt-auto pt-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20">
              <p className="font-medium text-sm mb-1">예측 리그 시즌 1</p>
              <p className="text-xs text-muted-foreground mb-3">
                지금 참여하고 포인트 2배 획득!
              </p>
              <Link
                href="/predictions"
                className="inline-flex items-center text-xs font-medium text-primary hover:underline"
              >
                참여하기 →
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
