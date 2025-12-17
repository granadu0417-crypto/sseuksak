'use client';

import Link from 'next/link';
import { Menu, Search, Bell, User, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@/stores/useStore';
import { useCurrentUser, useLogout } from '@/lib/api/hooks';

export function Header() {
  const { toggleSidebar } = useStore();
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* 좌측: 메뉴 버튼 + 로고 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline gradient-text">
              폴리티카
            </span>
          </Link>
        </div>

        {/* 중앙: 검색바 */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="정치인, 정당, 공약 검색..."
              className="pl-9 bg-zinc-800/50 border-zinc-700 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 우측: 알림 + 프로필 */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border border-zinc-700">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm">
                        {user?.nickname?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                  <div className="px-3 py-2">
                    <p className="font-medium">{user?.nickname || '사용자'}</p>
                    <p className="text-xs text-muted-foreground">Lv.{user?.level || 1} · {user?.points?.toLocaleString() || 0} 포인트</p>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    내 프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    마이 배지
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    예측 기록
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400"
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      시작하기
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
