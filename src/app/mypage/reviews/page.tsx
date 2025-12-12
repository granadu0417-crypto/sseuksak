'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface ReviewWithService {
  id: string;
  rating: number;
  content: string;
  images: string[];
  created_at: string;
  service: {
    id: string;
    title: string;
    images: string[];
    provider: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  };
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [reviews, setReviews] = useState<ReviewWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/mypage/reviews');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchReviews() {
      if (!user) return;

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          images,
          created_at,
          service:services (
            id,
            title,
            images,
            provider:profiles (
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const typedData = data as unknown as ReviewWithService[];
        setReviews(typedData);
      }

      setLoading(false);
    }

    if (user) {
      fetchReviews();
    }
  }, [user, supabase]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;

    setDeletingId(reviewId);

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제에 실패했습니다.');
    } else {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }

    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
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
          <h1 className="text-lg font-semibold">내가 쓴 리뷰</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* 리뷰 수 */}
      <div className="bg-white px-4 py-3 border-b">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-orange-500">{reviews.length}</span>개의 리뷰
        </p>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-500 mb-2">작성한 리뷰가 없습니다</p>
          <p className="text-sm text-gray-400">서비스를 이용한 후 리뷰를 남겨보세요</p>
        </div>
      ) : (
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4">
              {/* 서비스 정보 */}
              <Link
                href={`/services/${review.service?.id}`}
                className="flex gap-3 mb-3"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {review.service?.images?.[0] ? (
                    <Image
                      src={review.service.images[0]}
                      alt={review.service?.title || '서비스'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {review.service?.title || '서비스 정보 없음'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {review.service?.provider?.name || '전문가'}
                  </p>
                </div>
              </Link>

              {/* 별점과 날짜 */}
              <div className="flex items-center justify-between mb-2">
                {renderStars(review.rating)}
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
              </div>

              {/* 리뷰 내용 */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {review.content}
              </p>

              {/* 리뷰 이미지 */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={img}
                        alt={`리뷰 이미지 ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 수정/삭제 버튼 */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === review.id ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
