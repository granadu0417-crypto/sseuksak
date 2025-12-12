'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { ServiceWithDetails } from '@/types/database';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [favorites, setFavorites] = useState<ServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/favorites');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('favorites' as 'profiles')
        .select(`
          id,
          service:services(
            *,
            category:categories(*),
            provider:profiles(*),
            reviews(rating)
          )
        ` as '*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const servicesWithDetails = (data as { service: ServiceWithDetails }[])
          .map(item => item.service)
          .filter(Boolean)
          .map((service: ServiceWithDetails) => {
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
        setFavorites(servicesWithDetails as ServiceWithDetails[]);
      }

      setLoading(false);
    }

    if (user) {
      fetchFavorites();
    }
  }, [user, supabase]);

  const handleRemoveFavorite = async (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    const { error } = await supabase
      .from('favorites' as 'profiles')
      .delete()
      .eq('user_id', user.id)
      .eq('service_id', serviceId);

    if (!error) {
      setFavorites(favorites.filter(f => f.id !== serviceId));
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
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
          <h1 className="text-lg font-semibold">찜한 서비스</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* 서비스 목록 */}
      <div className="p-4">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💝</div>
            <p className="text-gray-500 mb-2">아직 찜한 서비스가 없어요</p>
            <p className="text-gray-400 text-sm mb-6">
              마음에 드는 서비스를 찜해보세요
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              서비스 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((service) => (
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
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      {/* 카테고리 */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <span>{service.category?.icon}</span>
                        <span>{service.category?.name}</span>
                      </div>

                      {/* 제목 */}
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">
                        {service.title}
                      </h3>

                      {/* 평점 */}
                      <div className="flex items-center gap-1 text-xs">
                        <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="font-medium">
                          {service.average_rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-gray-400">
                          ({service.review_count || 0})
                        </span>
                      </div>
                    </div>

                    {/* 가격 & 찜 버튼 */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-orange-500">
                        {formatPrice(service.price)}
                      </span>
                      <button
                        onClick={(e) => handleRemoveFavorite(service.id, e)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
