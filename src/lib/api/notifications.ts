'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Notification } from '@/types/database';

// 내 알림 목록 가져오기
export async function getMyNotifications(): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications' as 'profiles')
    .select('*' as '*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('알림 목록 조회 실패:', error);
    return [];
  }

  return (data || []) as Notification[];
}

// 읽지 않은 알림 개수
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications' as 'profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('읽지 않은 알림 개수 조회 실패:', error);
    return 0;
  }

  return count || 0;
}

// 알림 읽음 처리
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('notifications' as 'profiles')
    .update({ is_read: true } as never)
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('알림 읽음 처리 실패:', error);
    return false;
  }

  return true;
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('notifications' as 'profiles')
    .update({ is_read: true } as never)
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('전체 알림 읽음 처리 실패:', error);
    return false;
  }

  return true;
}

// 알림 삭제
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('notifications' as 'profiles')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('알림 삭제 실패:', error);
    return false;
  }

  return true;
}

// 알림 생성 (서버에서 호출)
export async function createNotification(params: {
  userId: string;
  type: 'quote' | 'message' | 'request_status' | 'review' | 'system';
  title: string;
  message: string;
  link?: string;
}): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('notifications' as 'profiles')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    } as never);

  if (error) {
    console.error('알림 생성 실패:', error);
    return false;
  }

  return true;
}
