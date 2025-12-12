'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { Notification } from '@/types/database';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/notifications');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('notifications' as 'profiles')
        .select('*' as '*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }

      setLoading(false);
    }

    if (user) {
      fetchNotifications();
    }
  }, [user, supabase]);

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.is_read) {
      await supabase
        .from('notifications' as 'profiles')
        .update({ is_read: true } as never)
        .eq('id', notification.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, is_read: true }
            : n
        )
      );
    }

    // 링크가 있으면 이동
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications' as 'profiles')
      .update({ is_read: true } as never)
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    await supabase
      .from('notifications' as 'profiles')
      .delete()
      .eq('id', id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return { icon: '💰', color: 'bg-green-100 text-green-600' };
      case 'message':
        return { icon: '💬', color: 'bg-blue-100 text-blue-600' };
      case 'request_status':
        return { icon: '📋', color: 'bg-purple-100 text-purple-600' };
      case 'review':
        return { icon: '⭐', color: 'bg-yellow-100 text-yellow-600' };
      case 'system':
        return { icon: '🔔', color: 'bg-gray-100 text-gray-600' };
      default:
        return { icon: '📢', color: 'bg-orange-100 text-orange-600' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">알림</h1>
          {unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-orange-500 font-medium"
            >
              모두 읽음
            </button>
          ) : (
            <div className="w-16"></div>
          )}
        </div>
      </header>

      {/* 읽지 않은 알림 개수 */}
      {unreadCount > 0 && (
        <div className="bg-orange-50 px-4 py-3 border-b">
          <p className="text-sm text-orange-600">
            <span className="font-semibold">{unreadCount}개</span>의 새로운 알림이 있습니다
          </p>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="divide-y">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-500 mb-2">알림이 없습니다</p>
            <p className="text-gray-400 text-sm">
              새로운 소식이 있으면 알려드릴게요
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const { icon, color } = getNotificationIcon(notification.type);
            const isUnread = !notification.is_read;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isUnread ? 'bg-orange-50/50' : 'bg-white'
                }`}
              >
                {/* 아이콘 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <span className="text-lg">{icon}</span>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.link && (
                    <p className="text-xs text-orange-500 mt-2">
                      자세히 보기 →
                    </p>
                  )}
                </div>

                {/* 읽지 않음 표시 & 삭제 버튼 */}
                <div className="flex items-center gap-2">
                  {isUnread && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
