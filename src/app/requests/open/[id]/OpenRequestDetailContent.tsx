'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { RequestWithDetails, Service } from '@/types/database';

interface ContentProps {
  params: Promise<{ id: string }>;
}

export default function OpenRequestDetailContent({ params }: ContentProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const [request, setRequest] = useState<RequestWithDetails | null>(null);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [alreadyQuoted, setAlreadyQuoted] = useState(false);

  // 견적 폼 데이터
  const [quoteForm, setQuoteForm] = useState({
    service_id: '',
    price: '',
    description: '',
    estimated_duration: '',
    available_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 요청서 정보 가져오기
      const { data: requestData, error: requestError } = await supabase
        .from('requests' as 'profiles')
        .select(`
          *,
          category:categories(*),
          user:profiles(id, name, avatar_url)
        ` as '*')
        .eq('id', id)
        .single();

      if (requestError) {
        console.error('요청서 조회 실패:', requestError);
        setLoading(false);
        return;
      }

      setRequest(requestData as RequestWithDetails);

      // 내 서비스 목록 가져오기 (견적 연결용)
      if (user) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', user.id)
          .eq('is_active', true);

        if (servicesData) {
          setMyServices(servicesData);
        }

        // 이미 견적을 보냈는지 확인
        const { data: existingQuote } = await supabase
          .from('quotes' as 'profiles')
          .select('id' as '*')
          .eq('request_id', id)
          .eq('provider_id', user.id)
          .single();

        if (existingQuote) {
          setAlreadyQuoted(true);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [id, user, supabase]);

  const handleSubmitQuote = async () => {
    if (!user || !request) return;

    if (!quoteForm.price || !quoteForm.description) {
      alert('견적 금액과 설명을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('quotes' as 'profiles')
        .insert({
          request_id: request.id,
          provider_id: user.id,
          service_id: quoteForm.service_id || null,
          price: parseInt(quoteForm.price),
          description: quoteForm.description,
          estimated_duration: quoteForm.estimated_duration || null,
          available_date: quoteForm.available_date || null,
          status: 'pending',
          is_read: false,
        } as never);

      if (error) throw error;

      // 요청서의 견적 수 증가
      await supabase
        .from('requests' as 'profiles')
        .update({
          quote_count: (request.quote_count || 0) + 1,
          updated_at: new Date().toISOString()
        } as never)
        .eq('id', request.id);

      alert('견적이 성공적으로 전송되었습니다!');
      setShowQuoteModal(false);
      setAlreadyQuoted(true);
    } catch (error) {
      console.error('견적 전송 실패:', error);
      alert('견적 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
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

  const getRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

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
        <Link href="/requests/open" className="text-orange-500 font-medium">
          요청 목록으로
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === request.user_id;
  const canQuote = user && !isOwner && !alreadyQuoted && !isExpired(request.expires_at) && request.status === 'open';

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
          <h1 className="text-lg font-semibold">요청 상세</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* 남은 기간 배너 */}
      {!isExpired(request.expires_at) && request.status === 'open' && (
        <div className="bg-green-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🟢</span>
              <span className="font-medium text-green-700">견적 모집 중</span>
            </div>
            <span className="text-sm text-green-600 font-medium">
              D-{getRemainingDays(request.expires_at)}
            </span>
          </div>
        </div>
      )}

      {/* 요청서 내용 */}
      <div className="bg-white">
        {/* 카테고리 & 제목 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{request.category?.icon}</span>
            <span className="text-sm text-gray-500">{request.category?.name}</span>
          </div>
          <h2 className="text-xl font-bold">{request.title}</h2>
        </div>

        {/* 상세 내용 */}
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-2">상세 내용</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
        </div>

        {/* 정보 */}
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

      {/* 하단 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3">
        {!user ? (
          <Link
            href={`/auth/login?redirect=/requests/open/${id}`}
            className="block w-full bg-orange-500 text-white font-semibold py-4 rounded-lg text-center hover:bg-orange-600 transition-colors"
          >
            로그인하고 견적 보내기
          </Link>
        ) : isOwner ? (
          <Link
            href={`/requests/${id}`}
            className="block w-full bg-gray-200 text-gray-700 font-semibold py-4 rounded-lg text-center"
          >
            내 요청서 관리하기
          </Link>
        ) : alreadyQuoted ? (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 font-semibold py-4 rounded-lg cursor-not-allowed"
          >
            이미 견적을 보냈습니다
          </button>
        ) : isExpired(request.expires_at) || request.status !== 'open' ? (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 font-semibold py-4 rounded-lg cursor-not-allowed"
          >
            마감된 요청입니다
          </button>
        ) : (
          <button
            onClick={() => setShowQuoteModal(true)}
            className="w-full bg-orange-500 text-white font-semibold py-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            견적 보내기
          </button>
        )}
      </div>

      {/* 견적 작성 모달 */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuoteModal(false)} />

          <div className="relative w-full max-w-lg bg-white rounded-t-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* 핸들 바 */}
            <div className="sticky top-0 bg-white pt-3 pb-2 rounded-t-2xl">
              <div className="flex justify-center">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>

            {/* 헤더 */}
            <div className="px-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">견적 보내기</h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{request.title}</p>
            </div>

            {/* 폼 */}
            <div className="p-4 space-y-4">
              {/* 연결할 서비스 선택 (선택사항) */}
              {myServices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연결할 서비스 (선택)
                  </label>
                  <select
                    value={quoteForm.service_id}
                    onChange={(e) => setQuoteForm({ ...quoteForm, service_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">서비스 선택 안함</option>
                    {myServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 견적 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  견적 금액 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quoteForm.price}
                    onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                    placeholder="금액을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
                </div>
                {request.budget_min || request.budget_max ? (
                  <p className="text-xs text-gray-500 mt-1">
                    고객 예산: {request.budget_min && formatPrice(request.budget_min)}
                    {request.budget_min && request.budget_max && ' ~ '}
                    {request.budget_max && formatPrice(request.budget_max)}
                  </p>
                ) : null}
              </div>

              {/* 견적 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  견적 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={quoteForm.description}
                  onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                  placeholder="견적에 대한 상세 설명을 작성해주세요. 경력, 작업 방식, 포함 사항 등을 안내하면 좋습니다."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-right text-xs text-gray-400 mt-1">
                  {quoteForm.description.length}/500
                </p>
              </div>

              {/* 예상 소요시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예상 소요시간 (선택)
                </label>
                <input
                  type="text"
                  value={quoteForm.estimated_duration}
                  onChange={(e) => setQuoteForm({ ...quoteForm, estimated_duration: e.target.value })}
                  placeholder="예: 2시간, 1일, 1주일"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* 가능 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가능 날짜 (선택)
                </label>
                <input
                  type="date"
                  value={quoteForm.available_date}
                  onChange={(e) => setQuoteForm({ ...quoteForm, available_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* 제출 버튼 */}
              <button
                onClick={handleSubmitQuote}
                disabled={isSubmitting || !quoteForm.price || !quoteForm.description}
                className="w-full bg-orange-500 text-white font-semibold py-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '전송 중...' : '견적 보내기'}
              </button>
            </div>

            {/* 하단 안전 영역 */}
            <div className="h-safe-bottom" />
          </div>
        </div>
      )}
    </div>
  );
}
