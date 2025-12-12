'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null);

  // 클라이언트 사이드에서만 Supabase 클라이언트 초기화
  const getSupabase = () => {
    if (!supabaseRef.current && typeof window !== 'undefined') {
      const { getSupabaseClient } = require('@/lib/supabase');
      supabaseRef.current = getSupabaseClient();
    }
    return supabaseRef.current;
  };

  const refreshUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const { count, error } = await supabase
      .from('notifications' as 'profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  // 초기 로드
  useEffect(() => {
    refreshUnreadCount();
  }, [user]);

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('notification-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
