'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { RequestWithDetails, QuoteWithProvider } from '@/types/database';

// 내 요청서 목록 가져오기
export async function getMyRequests(): Promise<RequestWithDetails[]> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('requests' as 'profiles')
    .select(`
      *,
      category:categories(*),
      quotes:quotes(count)
    ` as '*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('요청서 목록 조회 실패:', error);
    return [];
  }

  return ((data || []) as { quotes?: { count: number }[] }[]).map(request => ({
    ...request,
    quote_count: request.quotes?.[0]?.count || 0,
  })) as RequestWithDetails[];
}

// 요청서 상세 정보 가져오기
export async function getRequestDetail(requestId: string): Promise<RequestWithDetails | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('requests' as 'profiles')
    .select(`
      *,
      category:categories(*),
      user:profiles(*)
    ` as '*')
    .eq('id', requestId)
    .single();

  if (error) {
    console.error('요청서 상세 조회 실패:', error);
    return null;
  }

  return data as RequestWithDetails;
}

// 요청서에 대한 견적서 목록 가져오기
export async function getQuotesForRequest(requestId: string): Promise<QuoteWithProvider[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('quotes' as 'profiles')
    .select(`
      *,
      provider:profiles(*),
      service:services(*)
    ` as '*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('견적서 목록 조회 실패:', error);
    return [];
  }

  return (data || []) as QuoteWithProvider[];
}

// 전문가가 볼 수 있는 열린 요청서 목록 (카테고리별)
export async function getOpenRequests(categoryId?: string): Promise<RequestWithDetails[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('requests' as 'profiles')
    .select(`
      *,
      category:categories(*),
      user:profiles(id, name, avatar_url)
    ` as '*')
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('열린 요청서 목록 조회 실패:', error);
    return [];
  }

  return (data || []) as RequestWithDetails[];
}

// 요청서 상태 업데이트
export async function updateRequestStatus(
  requestId: string,
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('requests' as 'profiles')
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq('id', requestId)
    .eq('user_id', user.id);

  if (error) {
    console.error('요청서 상태 업데이트 실패:', error);
    return false;
  }

  return true;
}
