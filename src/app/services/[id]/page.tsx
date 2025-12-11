'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { ServiceWithDetails, Profile, Review } from '@/types/database';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceWithDetails | null>(null);
  const [provider, setProvider] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 서비스 및 관련 데이터 불러오기
  useEffect(() => {
    async function fetchServiceData() {
      try {
        // 서비스 정보 가져오기
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;
        if (!serviceData) {
          setError('서비스를 찾을 수 없습니다.');
          return;
        }

        const typedServiceData = serviceData as ServiceWithDetails;
        setService(typedServiceData);

        // 제공자 정보 가져오기
        const { data: providerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', typedServiceData.provider_id)
          .single();

        if (providerData) {
          setProvider(providerData);
        }

        // 리뷰 가져오기
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            *,
            user:profiles(name, avatar_url)
          `)
          .eq('service_id', serviceId)
          .order('created_at', { ascending: false });

        if (reviewsData) {
          setReviews(reviewsData);
        }

        // 조회수 증가
        await supabase
          .from('services')
          .update({ view_count: (typedServiceData.view_count || 0) + 1 } as never)
          .eq('id', serviceId);

        // 찜 여부 확인
        if (user) {
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('service_id', serviceId)
            .single();

          setIsFavorite(!!favoriteData);
        }
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError('서비스 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId, supabase, user]);

  // 찜하기 토글
  const toggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, service_id: serviceId } as never);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 채팅 시작
  const startChat = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!service) return;

    // 이미 존재하는 채팅방 확인
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('service_id', serviceId)
      .eq('customer_id', user.id)
      .single();

    if (existingRoom) {
      const roomData = existingRoom as { id: string };
      router.push(`/chat/${roomData.id}`);
      return;
    }

    // 새 채팅방 생성
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        service_id: serviceId,
        customer_id: user.id,
        provider_id: service.provider_id,
      } as never)
      .select()
      .single();

    if (newRoom) {
      const roomData = newRoom as { id: string };
      router.push(`/chat/${roomData.id}`);
    } else if (error) {
      console.error('Error creating chat room:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  // 평균 평점 계산
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // 가격 포맷
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">{error || '서비스를 찾을 수 없습니다.'}</p>
        <Link href="/" className="text-orange-500 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="p-2"
          >
            <svg
              className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 이미지 갤러리 */}
      <div className="relative bg-gray-200 h-72">
        {service.images && service.images.length > 0 ? (
          <>
            <img
              src={service.images[currentImageIndex]}
              alt={`${service.title} - 이미지 ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* 이전/다음 버튼 (이미지가 2개 이상일 때만) */}
            {service.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev =>
                    prev === 0 ? service.images!.length - 1 : prev - 1
                  )}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev =>
                    prev === service.images!.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 이미지 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {service.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* 이미지 카운터 */}
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {service.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🖼️</span>
          </div>
        )}
      </div>

      {/* 서비스 정보 */}
      <div className="bg-white px-4 py-6">
        {/* 카테고리 & 할인 */}
        <div className="flex items-center gap-2 mb-2">
          {service.category && (
            <span className="text-sm text-orange-500 font-medium">
              {service.category.icon} {service.category.name}
            </span>
          )}
          {service.discount_percent && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
              {service.discount_percent}% 할인
            </span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h1>

        {/* 평점 & 리뷰 수 */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          {averageRating && (
            <>
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{averageRating}</span>
              <span>리뷰 {reviews.length}개</span>
              <span>·</span>
            </>
          )}
          <span>조회 {service.view_count || 0}</span>
        </div>

        {/* 가격 */}
        <div className="flex items-baseline gap-2 mb-4">
          {service.original_price && service.original_price > service.price && (
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(service.original_price)}원
            </span>
          )}
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(service.price)}원
          </span>
        </div>

        {/* 위치 */}
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{service.location} {service.area}</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-2 bg-gray-100"></div>

      {/* 서비스 설명 */}
      <div className="bg-white px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">서비스 소개</h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* 구분선 */}
      <div className="h-2 bg-gray-100"></div>

      {/* 전문가 정보 */}
      {provider && (
        <div className="bg-white px-4 py-6">
          <h2 className="text-lg font-semibold mb-4">전문가 정보</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.name || '프로필'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-orange-500">
                  {provider.name?.charAt(0) || provider.email.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {provider.name || '전문가'}
              </p>
              <p className="text-sm text-gray-500">
                가입일: {new Date(provider.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 구분선 */}
      <div className="h-2 bg-gray-100"></div>

      {/* 리뷰 섹션 */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            리뷰 {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {averageRating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-lg">★</span>
              <span className="font-bold text-lg">{averageRating}</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">아직 리뷰가 없습니다.</p>
        ) : (
          <div className="space-y-6">
            {reviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {review.user?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.user?.name || '익명'}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{review.content}</p>
              </div>
            ))}
            {reviews.length > 3 && (
              <button className="w-full py-3 text-orange-500 font-medium hover:bg-orange-50 rounded-lg transition-colors">
                리뷰 더보기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3 flex gap-3">
        <button
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className={`flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center ${
            isFavorite ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-600'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {user?.id !== service.provider_id ? (
          <button
            onClick={startChat}
            className="flex-1 bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            채팅으로 문의하기
          </button>
        ) : (
          <Link
            href={`/services/${serviceId}/edit`}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            서비스 수정하기
          </Link>
        )}
      </div>
    </div>
  );
}
