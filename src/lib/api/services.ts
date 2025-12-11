import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Service, Category, ServiceWithDetails } from '@/types/database';

// 카테고리 목록 조회
export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('카테고리 조회 실패:', error);
    return [];
  }

  return data || [];
}

// 인기 서비스 목록 조회 (홈페이지용)
export async function getPopularServices(limit: number = 10): Promise<ServiceWithDetails[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      provider:profiles(*),
      reviews(rating)
    `)
    .eq('is_active', true)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('인기 서비스 조회 실패:', error);
    return [];
  }

  // 평균 평점 계산
  return (data || []).map((service: Record<string, unknown>) => ({
    ...(service as object),
    average_rating: Array.isArray(service.reviews) && service.reviews.length
      ? service.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / service.reviews.length
      : 0,
    review_count: Array.isArray(service.reviews) ? service.reviews.length : 0,
  })) as ServiceWithDetails[];
}

// 카테고리별 서비스 목록 조회
export async function getServicesByCategory(
  categorySlug: string,
  options?: {
    limit?: number;
    offset?: number;
    location?: string;
  }
): Promise<{ services: ServiceWithDetails[]; total: number }> {
  const supabase = await createServerSupabaseClient();
  const { limit = 20, offset = 0, location } = options || {};

  let query = supabase
    .from('services')
    .select(`
      *,
      category:categories!inner(*),
      provider:profiles(*),
      reviews(rating)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('categories.slug', categorySlug);

  if (location && location !== '전체') {
    query = query.eq('location', location);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('카테고리별 서비스 조회 실패:', error);
    return { services: [], total: 0 };
  }

  const services = (data || []).map((service: Record<string, unknown>) => ({
    ...(service as object),
    average_rating: Array.isArray(service.reviews) && service.reviews.length
      ? service.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / service.reviews.length
      : 0,
    review_count: Array.isArray(service.reviews) ? service.reviews.length : 0,
  })) as ServiceWithDetails[];

  return { services, total: count || 0 };
}

// 단일 서비스 상세 조회
export async function getServiceById(id: string): Promise<ServiceWithDetails | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      provider:profiles(*),
      reviews(
        *,
        user:profiles(name, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('서비스 상세 조회 실패:', error);
    return null;
  }

  // 조회수 증가 (비동기로 처리)
  const serviceData = data as Record<string, unknown>;
  supabase
    .from('services')
    .update({ view_count: ((serviceData.view_count as number) || 0) + 1 } as never)
    .eq('id', id)
    .then(() => {});

  const reviews = Array.isArray(serviceData.reviews) ? serviceData.reviews : [];
  return {
    ...(serviceData as object),
    average_rating: reviews.length
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0,
    review_count: reviews.length,
  } as ServiceWithDetails;
}

// 서비스 검색
export async function searchServices(
  keyword: string,
  options?: {
    limit?: number;
    offset?: number;
    categorySlug?: string;
    location?: string;
  }
): Promise<{ services: ServiceWithDetails[]; total: number }> {
  const supabase = await createServerSupabaseClient();
  const { limit = 20, offset = 0, categorySlug, location } = options || {};

  let query = supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      provider:profiles(*),
      reviews(rating)
    `, { count: 'exact' })
    .eq('is_active', true)
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);

  if (categorySlug) {
    query = query.eq('category.slug', categorySlug);
  }

  if (location && location !== '전체') {
    query = query.eq('location', location);
  }

  const { data, error, count } = await query
    .order('view_count', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('서비스 검색 실패:', error);
    return { services: [], total: 0 };
  }

  const services = (data || []).map((service: Record<string, unknown>) => ({
    ...(service as object),
    average_rating: Array.isArray(service.reviews) && service.reviews.length
      ? service.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / service.reviews.length
      : 0,
    review_count: Array.isArray(service.reviews) ? service.reviews.length : 0,
  })) as ServiceWithDetails[];

  return { services, total: count || 0 };
}

// 지역별 서비스 목록 조회
export async function getServicesByLocation(
  location: string,
  area?: string,
  limit: number = 20
): Promise<ServiceWithDetails[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      provider:profiles(*),
      reviews(rating)
    `)
    .eq('is_active', true)
    .eq('location', location);

  if (area && area !== '전체') {
    query = query.eq('area', area);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('지역별 서비스 조회 실패:', error);
    return [];
  }

  return (data || []).map((service: Record<string, unknown>) => ({
    ...(service as object),
    average_rating: Array.isArray(service.reviews) && service.reviews.length
      ? service.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / service.reviews.length
      : 0,
    review_count: Array.isArray(service.reviews) ? service.reviews.length : 0,
  })) as ServiceWithDetails[];
}
