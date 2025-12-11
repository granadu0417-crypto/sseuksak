import Link from 'next/link';
import { ServiceWithDetails } from '@/types/database';

// 폴백 서비스 데이터 (데이터베이스 연결 전 또는 오류 시 사용)
const fallbackServices: ServiceWithDetails[] = [
  {
    id: '1',
    provider_id: '1',
    category_id: '1',
    title: '프리미엄 홈클리닝 서비스',
    description: '',
    location: '서울',
    area: '강남구',
    price: 80000,
    original_price: 100000,
    discount_percent: 20,
    images: [],
    is_active: true,
    view_count: 128,
    created_at: '',
    updated_at: '',
    average_rating: 4.9,
    review_count: 128,
  },
  {
    id: '2',
    provider_id: '2',
    category_id: '2',
    title: '1:1 맞춤 영어회화 레슨',
    description: '',
    location: '서울',
    area: '서초구',
    price: 50000,
    original_price: null,
    discount_percent: null,
    images: [],
    is_active: true,
    view_count: 89,
    created_at: '',
    updated_at: '',
    average_rating: 4.8,
    review_count: 89,
  },
  {
    id: '3',
    provider_id: '3',
    category_id: '3',
    title: '웨딩 스냅 촬영 패키지',
    description: '',
    location: '서울',
    area: '마포구',
    price: 200000,
    original_price: 250000,
    discount_percent: 20,
    images: [],
    is_active: true,
    view_count: 45,
    created_at: '',
    updated_at: '',
    average_rating: 5.0,
    review_count: 45,
  },
  {
    id: '4',
    provider_id: '4',
    category_id: '4',
    title: '피아노 개인레슨 (초급~중급)',
    description: '',
    location: '서울',
    area: '송파구',
    price: 60000,
    original_price: null,
    discount_percent: null,
    images: [],
    is_active: true,
    view_count: 67,
    created_at: '',
    updated_at: '',
    average_rating: 4.7,
    review_count: 67,
  },
];

const fallbackNewServices: ServiceWithDetails[] = [
  {
    id: '5',
    provider_id: '5',
    category_id: '5',
    title: '인테리어 컨설팅 서비스',
    description: '',
    location: '서울',
    area: '용산구',
    price: 150000,
    original_price: null,
    discount_percent: null,
    images: [],
    is_active: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: '',
    average_rating: 0,
    review_count: 0,
  },
  {
    id: '6',
    provider_id: '6',
    category_id: '6',
    title: '요가 & 필라테스 1:1 레슨',
    description: '',
    location: '서울',
    area: '강서구',
    price: 70000,
    original_price: null,
    discount_percent: null,
    images: [],
    is_active: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: '',
    average_rating: 0,
    review_count: 0,
  },
  {
    id: '7',
    provider_id: '7',
    category_id: '7',
    title: '반려동물 미용 서비스',
    description: '',
    location: '서울',
    area: '영등포구',
    price: 45000,
    original_price: null,
    discount_percent: null,
    images: [],
    is_active: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: '',
    average_rating: 0,
    review_count: 0,
  },
];

interface ServiceCardListProps {
  services?: ServiceWithDetails[];
  isNew?: boolean;
}

export default function ServiceCardList({ services, isNew = false }: ServiceCardListProps) {
  // 데이터베이스에서 가져온 서비스가 없으면 폴백 사용
  const displayServices = services && services.length > 0
    ? services
    : (isNew ? fallbackNewServices : fallbackServices);

  return (
    <div className="scroll-x -mx-4 px-4">
      {displayServices.map((service) => (
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
