'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { Category } from '@/types/database';

// 지역 데이터
const LOCATIONS = [
  { value: '서울', areas: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'] },
  { value: '경기', areas: ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '이천시', '오산시', '하남시'] },
  { value: '인천', areas: ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'] },
  { value: '부산', areas: ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'] },
  { value: '대구', areas: ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'] },
  { value: '대전', areas: ['동구', '중구', '서구', '유성구', '대덕구'] },
  { value: '광주', areas: ['동구', '서구', '남구', '북구', '광산구'] },
  { value: '울산', areas: ['중구', '남구', '동구', '북구', '울주군'] },
  { value: '세종', areas: ['세종시'] },
  { value: '강원', areas: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시'] },
  { value: '충북', areas: ['청주시', '충주시', '제천시'] },
  { value: '충남', areas: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시'] },
  { value: '전북', areas: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'] },
  { value: '전남', areas: ['목포시', '여수시', '순천시', '나주시', '광양시'] },
  { value: '경북', areas: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시'] },
  { value: '경남', areas: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'] },
  { value: '제주', areas: ['제주시', '서귀포시'] },
];

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  area: string;
  images: string[];
  created_at: string;
  provider: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

type SortOption = 'latest' | 'price_low' | 'price_high';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // URL 파라미터에서 초기값 가져오기
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '');
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'latest');

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const selectedLocationData = LOCATIONS.find(loc => loc.value === selectedLocation);
  const areas = selectedLocationData?.areas || [];

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (data) setCategories(data);
    };
    loadCategories();
  }, [supabase]);

  // 서비스 검색
  const searchServices = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          provider:profiles(id, name, avatar_url),
          category:categories(id, name, icon)
        `)
        .eq('is_active', true);

      // 검색어 필터
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // 카테고리 필터
      if (selectedCategory) {
        const category = categories.find(c => c.name === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // 지역 필터
      if (selectedLocation) {
        query = query.eq('location', selectedLocation);
        if (selectedArea) {
          query = query.eq('area', selectedArea);
        }
      }

      // 정렬
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('검색 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, searchQuery, selectedCategory, selectedLocation, selectedArea, sortBy, categories]);

  // URL 파라미터 업데이트
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedArea) params.set('area', selectedArea);
    if (sortBy !== 'latest') params.set('sort', sortBy);

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : '/search', { scroll: false });
  }, [router, searchQuery, selectedCategory, selectedLocation, selectedArea, sortBy]);

  // 검색 실행 (URL 업데이트 + 검색)
  const handleSearch = useCallback(() => {
    updateURL();
    searchServices();
  }, [updateURL, searchServices]);

  // URL 파라미터가 있으면 초기 검색 실행
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (searchParams.toString()) {
        searchServices();
      }
    }
  }, [searchParams, searchServices]);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? '' : categoryName);
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedArea('');
    setSortBy('latest');
    setShowFilters(false);
  };

  // 가격 포맷
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 활성 필터 개수
  const activeFilterCount = [
    selectedCategory,
    selectedLocation,
    sortBy !== 'latest',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-20">
        <h1 className="text-xl font-bold mb-3">서비스 찾기</h1>

        {/* 검색창 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="어떤 서비스를 찾으세요?"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-medium"
          >
            검색
          </button>
        </div>

        {/* 필터 버튼들 */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
              activeFilterCount > 0
                ? 'bg-orange-50 border-[#FF6B35] text-[#FF6B35]'
                : 'bg-white border-gray-200'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
            필터
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#FF6B35] text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* 카테고리 빠른 필터 */}
          {categories.slice(0, 5).map(category => (
            <button
              key={category.id}
              onClick={() => {
                handleCategoryClick(category.name);
                setTimeout(handleSearch, 0);
              }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
                selectedCategory === category.name
                  ? 'bg-orange-50 border-[#FF6B35] text-[#FF6B35]'
                  : 'bg-white border-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4 space-y-4">
          {/* 카테고리 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    selectedCategory === category.name
                      ? 'bg-orange-50 border-[#FF6B35] text-[#FF6B35]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">지역</h3>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setSelectedArea('');
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="">시/도 전체</option>
                {LOCATIONS.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.value}</option>
                ))}
              </select>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={!selectedLocation}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:bg-gray-100"
              >
                <option value="">구/군 전체</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">정렬</h3>
            <div className="flex gap-2">
              {[
                { value: 'latest', label: '최신순' },
                { value: 'price_low', label: '가격 낮은순' },
                { value: 'price_high', label: '가격 높은순' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as SortOption)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    sortBy === option.value
                      ? 'bg-orange-50 border-[#FF6B35] text-[#FF6B35]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={resetFilters}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
            >
              초기화
            </button>
            <button
              onClick={() => {
                setShowFilters(false);
                handleSearch();
              }}
              className="flex-1 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium"
            >
              적용하기
            </button>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="p-4">
        {loading ? (
          // 로딩 스켈레톤
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          services.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {services.length}개의 서비스를 찾았습니다
              </p>
              <div className="space-y-4">
                {services.map(service => (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex gap-4">
                        {/* 썸네일 */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {service.images && service.images.length > 0 ? (
                            <img
                              src={service.images[0]}
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              {service.category?.icon || '🛠️'}
                            </div>
                          )}
                        </div>

                        {/* 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {service.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {service.category?.icon} {service.category?.name}
                          </p>
                          <p className="text-[#FF6B35] font-semibold mt-1">
                            {formatPrice(service.price)}원~
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            📍 {service.location} {service.area}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            // 검색 결과 없음
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                검색 결과가 없습니다
              </h2>
              <p className="text-gray-500 mb-4">
                다른 검색어나 필터를 사용해보세요
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-[#FF6B35] border border-[#FF6B35] rounded-lg"
              >
                필터 초기화
              </button>
            </div>
          )
        ) : (
          // 초기 상태
          <>
            {/* 인기 카테고리 */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-600 mb-3">인기 카테고리</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setTimeout(handleSearch, 0);
                    }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <div className="text-left">
                      <p className="font-medium">{category.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 최근 검색어 (임시) */}
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3">추천 검색어</h2>
              <div className="flex flex-wrap gap-2">
                {['청소', '이사', '인테리어', '레슨', '뷰티'].map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSearchQuery(keyword);
                      setTimeout(handleSearch, 0);
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-20">
        <div className="h-7 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
        <div className="flex gap-2">
          <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
          <div className="w-16 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
