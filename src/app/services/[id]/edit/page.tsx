'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { uploadServiceImages, deleteServiceImage } from '@/lib/storage';
import { Category } from '@/types/database';
import ImageUpload from '@/components/ImageUpload';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditServicePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedLocationData = LOCATIONS.find(loc => loc.value === formData.location);
  const areas = selectedLocationData?.areas || [];

  // 서비스 데이터 로드
  const loadService = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.provider_id !== user?.id) {
        alert('수정 권한이 없습니다.');
        router.push('/mypage/services');
        return;
      }

      setFormData({
        category_id: data.category_id,
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        location: data.location,
        area: data.area || '',
      });
      setExistingImages(data.images || []);
    } catch (err) {
      console.error('서비스 로딩 실패:', err);
      setError('서비스 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [id, supabase, user?.id, router]);

  // 카테고리 로드
  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('카테고리 로딩 실패:', err);
    }
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadCategories();
      loadService();
    }
  }, [user, authLoading, router, loadCategories, loadService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'location' ? { area: '' } : {}),
    }));
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
    setImagesToDelete(prev => [...prev, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('서비스 제목을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      setError('서비스 설명을 입력해주세요.');
      return;
    }
    if (!formData.price || parseInt(formData.price) <= 0) {
      setError('올바른 가격을 입력해주세요.');
      return;
    }
    if (!formData.location) {
      setError('활동 지역을 선택해주세요.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. 삭제할 이미지 처리
      for (const url of imagesToDelete) {
        await deleteServiceImage(url);
      }

      // 2. 새 이미지 업로드
      let newImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        const { urls } = await uploadServiceImages(newImageFiles, user!.id);
        newImageUrls = urls;
      }

      // 3. 서비스 업데이트
      const allImages = [...existingImages, ...newImageUrls];

      const { error: updateError } = await supabase
        .from('services')
        .update({
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          location: formData.location,
          area: formData.area,
          images: allImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('provider_id', user?.id);

      if (updateError) throw updateError;

      alert('서비스가 수정되었습니다.');
      router.push('/mypage/services');
    } catch (err) {
      console.error('서비스 수정 실패:', err);
      setError('서비스 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">서비스 수정</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 카테고리 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">카테고리</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category_id: category.id }))}
                className={`p-3 rounded-lg border text-center text-sm transition-all ${
                  formData.category_id === category.id
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <span className="text-xl block mb-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">서비스 제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: 깔끔한 이사 청소 전문"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* 설명 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">서비스 설명</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="제공하는 서비스에 대해 자세히 설명해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* 이미지 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">서비스 이미지</label>
          <ImageUpload
            maxImages={5}
            onImagesChange={setNewImageFiles}
            existingImages={existingImages}
            onRemoveExisting={handleRemoveExistingImage}
          />
        </div>

        {/* 가격 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">시작 가격 (원)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* 지역 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">활동 지역</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">시/도 선택</option>
              {LOCATIONS.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.value}</option>
              ))}
            </select>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              disabled={!formData.location}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            >
              <option value="">구/군 선택</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-[#FF6B35] text-white font-semibold rounded-xl disabled:opacity-50 transition-opacity"
        >
          {saving ? '저장 중...' : '변경사항 저장'}
        </button>
      </form>
    </div>
  );
}
