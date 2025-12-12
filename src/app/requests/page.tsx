'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { RequestWithDetails } from '@/types/database';

const STATUS_MAP = {
  open: { label: '견적 대기중', color: 'bg-green-100 text-green-700' },
  in_progress: { label: '진행중', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료', color: 'bg-gray-100 text-gray-700' },
  cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700' },
};

export default function MyRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/requests');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('requests' as 'profiles')
        .select(`
          *,
          category:categories(*)
        ` as '*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // 각 요청서의 견적 수 가져오기
        const requestsWithQuotes = await Promise.all(
          (data as { id: string }[]).map(async (request) => {
            const { count } = await supabase
              .from('quotes' as 'profiles')
              .select('*', { count: 'exact', head: true })
              .eq('request_id', request.id);

            return {
              ...request,
              quote_count: count || 0,
            };
          })
        );
        setRequests(requestsWithQuotes as RequestWithDetails[]);
      }
      setLoading(false);
    }

    if (user) {
      fetchRequests();
    }
  }, [user, supabase]);

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

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
          <h1 className="text-lg font-semibold">내 요청서</h1>
          <Link
            href="/requests/new"
            className="text-orange-500 font-medium text-sm"
          >
            새 요청
          </Link>
        </div>
      </header>

      {/* 필터 탭 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2">
          {[
            { key: 'all', label: '전체' },
            { key: 'open', label: '견적대기' },
            { key: 'in_progress', label: '진행중' },
            { key: 'completed', label: '완료' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 요청서 목록 */}
      <div className="p-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 mb-2">
              {filter === 'all' ? '아직 요청서가 없어요' : `${STATUS_MAP[filter as keyof typeof STATUS_MAP]?.label || ''} 요청서가 없어요`}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              필요한 서비스를 요청하고 견적을 받아보세요
            </p>
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              요청서 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 상단: 카테고리 & 상태 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{request.category?.icon}</span>
                    <span className="text-sm text-gray-500">{request.category?.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isExpired(request.expires_at) && request.status === 'open'
                      ? 'bg-gray-100 text-gray-500'
                      : STATUS_MAP[request.status]?.color
                  }`}>
                    {isExpired(request.expires_at) && request.status === 'open'
                      ? '마감됨'
                      : STATUS_MAP[request.status]?.label}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {request.title}
                </h3>

                {/* 정보 */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {request.location} {request.area}
                  </span>
                  <span>·</span>
                  <span>{formatDate(request.created_at)}</span>
                </div>

                {/* 하단: 견적 수 */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-500">
                    받은 견적
                  </span>
                  <span className={`font-semibold ${
                    request.quote_count > 0 ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {request.quote_count}건
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 버튼 */}
      {filteredRequests.length > 0 && (
        <Link
          href="/requests/new"
          className="fixed bottom-20 right-4 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  );
}
