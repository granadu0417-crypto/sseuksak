'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('별점을 선택해주세요');
      return;
    }

    if (content.trim().length < 10) {
      setError('리뷰는 최소 10자 이상 작성해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('로그인이 필요합니다');
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          service_id: serviceId,
          user_id: user.id,
          rating,
          content: content.trim(),
          images: [],
        });

      if (insertError) {
        throw insertError;
      }

      // 성공 시 초기화 및 콜백
      setRating(0);
      setContent('');
      onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error('리뷰 작성 실패:', err);
      setError('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl animate-slide-up">
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">리뷰 작성</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{serviceName}</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* 별점 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              서비스는 어떠셨나요?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                {rating === 1 && '별로예요'}
                {rating === 2 && '그저 그래요'}
                {rating === 3 && '보통이에요'}
                {rating === 4 && '좋아요'}
                {rating === 5 && '최고예요!'}
              </p>
            )}
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세한 리뷰를 남겨주세요
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="서비스 이용 경험을 자세히 알려주세요. 다른 고객님들에게 도움이 됩니다!"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {content.length}/500
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white font-semibold py-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
          </button>
        </form>

        {/* 하단 안전 영역 */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
