'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { Profile, ServiceWithDetails } from '@/types/database';

interface Review {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  service: {
    id: string;
    title: string;
  };
}

interface ProProfileContentProps {
  params: Promise<{ id: string }>;
}

export default function ProProfileContent({ params }: ProProfileContentProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');

  useEffect(() => {
    async function fetchProProfile() {
      setLoading(true);

      // 전문가 프로필 가져오기
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profileData) {
        console.error('프로필 조회 실패:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 전문가의 서비스 목록 가져오기
      const { data: servicesData } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          reviews(rating)
        `)
        .eq('provider_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (servicesData) {
        const servicesWithRating = (servicesData as { reviews?: { rating: number }[] }[]).map((service) => {
          const reviews = service.reviews || [];
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
            : 0;
          return {
            ...service,
            average_rating: avgRating,
            review_count: reviews.length,
          };
        });
        setServices(servicesWithRating as ServiceWithDetails[]);
      }

      // 전문가의 리뷰 목록 가져오기
      const serviceIds = (servicesData as { id: string }[] | null)?.map(s => s.id) || [];
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          created_at,
          user:profiles!reviews_user_id_fkey(id, name, avatar_url),
          service:services!reviews_service_id_fkey(id, title)
        `)
        .in('service_id', serviceIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reviewsData) {
        setReviews(reviewsData as unknown as Review[]);
      }

      setLoading(false);
    }

    fetchProProfile();
  }, [id, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  // 전체 평균 평점 계산
  const totalReviews = services.reduce((sum, s) => sum + (s.review_count || 0), 0);
  const avgRating = totalReviews > 0
    ? services.reduce((sum, s) => sum + (s.average_rating || 0) * (s.review_count || 0), 0) / totalReviews
    : 0;

  const handleStartChat = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/pro/${id}`);
      return;
    }

    if (user.id === id) {
      alert('자신에게는 채팅을 보낼 수 없습니다.');
      return;
    }

    // 기존 채팅방 확인 또는 새로 생성
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`)
      .single();

    if (existingRoom) {
      router.push(`/chat/${(existingRoom as { id: string }).id}`);
    } else {
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          user1_id: user.id,
          user2_id: id,
        } as never)
        .select()
        .single();

      if (!error && newRoom) {
        router.push(`/chat/${(newRoom as { id: string }).id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-5xl mb-4">😔</div>
        <p className="text-gray-500 mb-4">전문가를 찾을 수 없습니다</p>
        <button
          onClick={() => router.back()}
          className="text-orange-500 font-medium"
        >
          돌아가기
        </button>
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
          <h1 className="text-lg font-semibold">전문가 프로필</h1>
          <button className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 프로필 헤더 */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-start gap-4">
          {/* 프로필 이미지 */}
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name || '프로필'}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <span className="text-3xl text-orange-500 font-bold">
                {profile.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              {profile.is_provider && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                  전문가
                </span>
              )}
            </div>

            {/* 평점 & 리뷰 */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-sm">리뷰 {totalReviews}개</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-sm">서비스 {services.length}개</span>
            </div>

            {/* 가입일 */}
            <p className="text-sm text-gray-400 mt-1">
              {formatDate(profile.created_at)} 가입
            </p>
          </div>
        </div>

        {/* 소개글 */}
        {profile.bio && (
          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* 연락하기 버튼 */}
        {user?.id !== id && (
          <button
            onClick={handleStartChat}
            className="w-full mt-4 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            채팅으로 문의하기
          </button>
        )}
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white border-b sticky top-14 z-10">
        <div className="flex">
          {[
            { key: 'services', label: `서비스 ${services.length}` },
            { key: 'reviews', label: `리뷰 ${totalReviews}` },
            { key: 'about', label: '소개' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-4">
        {/* 서비스 탭 */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500">등록된 서비스가 없습니다</p>
              </div>
            ) : (
              services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    {/* 이미지 */}
                    <div className="w-28 h-28 bg-gray-200 flex-shrink-0 relative">
                      {service.images && service.images[0] ? (
                        <Image
                          src={service.images[0]}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <span>{service.category?.icon}</span>
                        <span>{service.category?.name}</span>
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs mb-2">
                        <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="font-medium">{service.average_rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-400">({service.review_count || 0})</span>
                      </div>
                      <span className="font-bold text-orange-500">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* 리뷰 탭 */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-gray-500">아직 리뷰가 없습니다</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
                  {/* 작성자 정보 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {review.user?.avatar_url ? (
                        <Image
                          src={review.user.avatar_url}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {review.user?.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{review.user?.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 서비스 정보 */}
                  <Link
                    href={`/services/${review.service?.id}`}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mb-2 hover:bg-gray-200"
                  >
                    {review.service?.title}
                  </Link>

                  {/* 리뷰 내용 */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 소개 탭 */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">전문가 소개</h3>
            {profile.bio ? (
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            ) : (
              <p className="text-gray-400 text-sm">등록된 소개글이 없습니다.</p>
            )}

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold mb-3">활동 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">가입일</span>
                  <span>{formatDate(profile.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">등록 서비스</span>
                  <span>{services.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">받은 리뷰</span>
                  <span>{totalReviews}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">평균 평점</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
