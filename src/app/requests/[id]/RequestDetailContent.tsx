'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { RequestWithDetails, QuoteWithProvider } from '@/types/database';

const STATUS_MAP = {
  open: { label: '견적 대기중', color: 'bg-green-100 text-green-700', icon: '🟢' },
  in_progress: { label: '진행중', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  completed: { label: '완료', color: 'bg-gray-100 text-gray-700', icon: '⚪' },
  cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700', icon: '🔴' },
};

const QUOTE_STATUS_MAP = {
  pending: { label: '검토중', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: '수락됨', color: 'bg-green-100 text-green-700' },
  rejected: { label: '거절됨', color: 'bg-gray-100 text-gray-500' },
  expired: { label: '만료됨', color: 'bg-gray-100 text-gray-500' },
};

interface ContentProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetailContent({ params }: ContentProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const [request, setRequest] = useState<RequestWithDetails | null>(null);
  const [quotes, setQuotes] = useState<QuoteWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (isSuccess) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      window.history.replaceState({}, '', `/requests/${id}`);
    }
  }, [isSuccess, id]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .select(`
          *,
          category:categories(*),
          user:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (requestError) {
        console.error('요청서 조회 실패:', requestError);
        setLoading(false);
        return;
      }

      setRequest(requestData as RequestWithDetails);

      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          provider:profiles(*),
          service:services(*)
        `)
        .eq('request_id', id)
        .order('created_at', { ascending: false });

      if (!quotesError && quotesData) {
        setQuotes(quotesData as QuoteWithProvider[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [id, supabase]);

  const handleCancel = async () => {
    if (!request || !user) return;

    const { error } = await supabase
      .from('requests' as 'profiles')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() } as never)
      .eq('id', request.id)
      .eq('user_id', user.id);

    if (error) {
      alert('요청서 취소에 실패했습니다.');
      return;
    }

    setRequest({ ...request, status: 'cancelled' });
    setShowCancelModal(false);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!request || !user) return;

    const { error: quoteError } = await supabase
      .from('quotes' as 'profiles')
      .update({ status: 'accepted', updated_at: new Date().toISOString() } as never)
      .eq('id', quoteId);

    if (quoteError) {
      alert('견적 수락에 실패했습니다.');
      return;
    }

    await supabase
      .from('quotes' as 'profiles')
      .update({ status: 'rejected', updated_at: new Date().toISOString() } as never)
      .eq('request_id', request.id)
      .neq('id', quoteId)
      .eq('status', 'pending');

    const { error: requestError } = await supabase
      .from('requests' as 'profiles')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() } as never)
      .eq('id', request.id);

    if (!requestError) {
      setRequest({ ...request, status: 'in_progress' });
      setQuotes(quotes.map(q =>
        q.id === quoteId
          ? { ...q, status: 'accepted' }
          : q.status === 'pending'
            ? { ...q, status: 'rejected' }
            : q
      ));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isOwner = user && request && user.id === request.user_id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-gray-500 mb-4">요청서를 찾을 수 없습니다</p>
        <Link
          href="/requests"
          className="text-orange-500 font-medium"
        >
          내 요청서 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 성공 토스트 */}
      {showSuccessToast && (
        <div className="fixed top-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">요청서가 등록되었습니다!</span>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">요청서 상세</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* 상태 배너 */}
      <div className={`px-4 py-3 ${
        request.status === 'open' && !isExpired(request.expires_at)
          ? 'bg-green-50'
          : request.status === 'in_progress'
            ? 'bg-blue-50'
            : 'bg-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{STATUS_MAP[request.status].icon}</span>
            <span className="font-medium">
              {isExpired(request.expires_at) && request.status === 'open'
                ? '마감됨'
                : STATUS_MAP[request.status].label}
            </span>
          </div>
          {request.status === 'open' && !isExpired(request.expires_at) && (
            <span className="text-sm text-gray-500">
              {getRemainingDays(request.expires_at)}일 남음
            </span>
          )}
        </div>
      </div>

      {/* 요청서 내용 */}
      <div className="bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{request.category?.icon}</span>
            <span className="text-sm text-gray-500">{request.category?.name}</span>
          </div>
          <h2 className="text-xl font-bold">{request.title}</h2>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-semibold mb-2">상세 내용</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{request.location} {request.area}</span>
          </div>

          {(request.budget_min || request.budget_max) && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                예산: {request.budget_min && formatPrice(request.budget_min)}
                {request.budget_min && request.budget_max && ' ~ '}
                {request.budget_max && formatPrice(request.budget_max)}
              </span>
            </div>
          )}

          {request.preferred_date && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>희망 날짜: {formatDate(request.preferred_date)}</span>
            </div>
          )}

          {request.preferred_time && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>희망 시간: {request.preferred_time}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>등록일: {formatDate(request.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 받은 견적 섹션 */}
      <div className="mt-3 bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">받은 견적</h3>
            <span className="text-orange-500 font-medium">{quotes.length}건</span>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500">아직 받은 견적이 없어요</p>
            <p className="text-sm text-gray-400 mt-1">
              전문가들이 견적을 보내면 알려드릴게요
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {quotes.map((quote) => (
              <div key={quote.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {quote.provider?.avatar_url ? (
                      <Image
                        src={quote.provider.avatar_url}
                        alt={quote.provider.name || '전문가'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{quote.provider?.name || '전문가'}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${QUOTE_STATUS_MAP[quote.status].color}`}>
                        {QUOTE_STATUS_MAP[quote.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(quote.created_at)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">견적 금액</span>
                    <span className="text-lg font-bold text-orange-500">{formatPrice(quote.price)}</span>
                  </div>
                  {quote.estimated_duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">예상 소요시간</span>
                      <span>{quote.estimated_duration}</span>
                    </div>
                  )}
                  {quote.available_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">가능 날짜</span>
                      <span>{formatDate(quote.available_date)}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-3">{quote.description}</p>

                {isOwner && quote.status === 'pending' && request.status === 'open' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptQuote(quote.id)}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      견적 수락
                    </button>
                    <Link
                      href={`/chat?provider=${quote.provider_id}&service=${quote.service_id || ''}`}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                      채팅하기
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 액션 버튼 */}
      {isOwner && request.status === 'open' && !isExpired(request.expires_at) && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3">
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full border border-red-500 text-red-500 font-semibold py-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            요청 취소하기
          </button>
        </div>
      )}

      {/* 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-2">요청을 취소하시겠어요?</h3>
            <p className="text-gray-500 text-sm mb-6">
              취소된 요청서는 복구할 수 없으며, 받은 견적도 함께 취소됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                아니오
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
