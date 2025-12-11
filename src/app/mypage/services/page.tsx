'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  area: string;
  status: string;
  created_at: string;
  images: string[];
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

export default function MyServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyServices = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(id, name, icon)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('서비스 목록 로딩 실패:', err);
      setError('서비스 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/mypage/services');
      return;
    }

    if (user) {
      fetchMyServices();
    }
  }, [user, authLoading, router, fetchMyServices]);

  const handleDelete = async (serviceId: string) => {
    if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return;

    setDeletingId(serviceId);
    try {
      const supabase = getSupabaseClient();
      if (!user?.id) return;
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('provider_id', user.id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err) {
      console.error('서비스 삭제 실패:', err);
      alert('서비스 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">활성</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">검토중</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">비활성</span>;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-4 px-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">내 서비스</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 px-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">내 서비스</h1>
        </div>
        <Link
          href="/services/new"
          className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg"
        >
          + 새 서비스
        </Link>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchMyServices}
            className="mt-2 text-sm text-red-600 underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 서비스 목록 */}
      {services.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            등록된 서비스가 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            전문 서비스를 등록하고 고객을 만나보세요
          </p>
          <Link
            href="/services/new"
            className="inline-block px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-xl"
          >
            첫 서비스 등록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
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
                      {getStatusBadge(service.status)}
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

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/services/${service.id}`}
                    className="flex-1 py-2 text-center text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    보기
                  </Link>
                  <Link
                    href={`/services/${service.id}/edit`}
                    className="flex-1 py-2 text-center text-sm text-[#FF6B35] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={deletingId === service.id}
                    className="flex-1 py-2 text-center text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === service.id ? '삭제중...' : '삭제'}
                  </button>
                </div>
              </div>

              {/* 등록일 */}
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
                등록일: {formatDate(service.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 서비스 개수 */}
      {services.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          총 {services.length}개의 서비스
        </p>
      )}
    </div>
  );
}
