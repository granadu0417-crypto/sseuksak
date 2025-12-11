import Link from 'next/link';
import { ServiceWithDetails } from '@/types/database';

interface ServiceCardListProps {
  services?: ServiceWithDetails[];
  isNew?: boolean;
}

export default function ServiceCardList({ services, isNew = false }: ServiceCardListProps) {
  // 서비스가 없으면 빈 상태 표시
  if (!services || services.length === 0) {
    return (
      <div className="mx-4 py-8 text-center bg-gray-50 rounded-xl">
        <div className="text-4xl mb-3">{isNew ? '🆕' : '⭐'}</div>
        <p className="text-gray-500 text-sm">
          {isNew ? '아직 새로 등록된 서비스가 없어요' : '아직 등록된 서비스가 없어요'}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          첫 번째 서비스를 등록해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-x -mx-4 px-4">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.id}`}
          className="block w-[200px] bg-white rounded-xl overflow-hidden card-shadow tap-feedback"
        >
          {/* 이미지 */}
          <div className="relative w-full h-[140px] bg-gray-200">
            {/* placeholder 이미지 (나중에 실제 이미지로 교체) */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl">🖼️</span>
            </div>
            {/* 할인 뱃지 */}
            {service.discount_percent && (
              <div className="absolute top-2 left-2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-1 rounded">
                {service.discount_percent}%
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="p-3">
            {/* 위치 */}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 6.9 8 11.7z" />
              </svg>
              {service.area}
            </p>

            {/* 제목 */}
            <h3 className="text-sm font-medium mt-1 line-clamp-2 leading-tight">
              {service.title}
            </h3>

            {/* 가격 */}
            <div className="mt-2 flex items-baseline gap-1">
              {service.original_price && (
                <span className="text-xs text-gray-400 line-through">
                  {service.original_price.toLocaleString()}원
                </span>
              )}
              <span className="text-base font-bold text-[#FF6B35]">
                {service.price.toLocaleString()}원
              </span>
            </div>

            {/* 평점 & 리뷰 */}
            {(service.review_count ?? 0) > 0 && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                <span className="text-yellow-500">★</span>
                <span className="font-medium text-gray-700">{(service.average_rating ?? 0).toFixed(1)}</span>
                <span>({service.review_count})</span>
              </div>
            )}

            {/* 뱃지들 */}
            <div className="mt-2 flex flex-wrap gap-1">
              {service.discount_percent && (
                <span className="badge badge-discount">즉시할인</span>
              )}
              {(service.view_count ?? 0) > 100 && (
                <span className="badge badge-event">인기</span>
              )}
              {isNew && (
                <span className="badge badge-new">신규</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
