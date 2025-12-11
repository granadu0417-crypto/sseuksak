'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { uploadServiceImages } from '@/lib/storage';
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

export default function NewServicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  // 단계 상태
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // 폼 데이터
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const isMountedRef = useRef(true);

  // 선택된 지역의 상세 지역 목록
  const selectedLocationData = LOCATIONS.find(loc => loc.value === formData.location);
  const areas = selectedLocationData?.areas || [];

  // 카테고리 불러오기 함수
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(false);

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('order_index');

      if (!isMountedRef.current) return;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setCategories(data);
      } else {
        setCategoriesError(true);
      }
    } catch (err) {
      console.error('카테고리 로딩 실패:', err);
      if (isMountedRef.current) {
        setCategoriesError(true);
      }
    } finally {
      if (isMountedRef.current) {
        setCategoriesLoading(false);
      }
    }
  }, []);

  // 컴포넌트 마운트 시 카테고리 로드
  useEffect(() => {
    isMountedRef.current = true;
    fetchCategories();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCategories]);

  // 로그인 체크 - authLoading이 끝난 후에만 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/services/new');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // 지역 변경 시 상세 지역 초기화
      ...(name === 'location' ? { area: '' } : {}),
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.category_id) {
          setError('카테고리를 선택해주세요.');
          return false;
        }
        break;
      case 2:
        if (!formData.title.trim()) {
          setError('서비스 제목을 입력해주세요.');
          return false;
        }
        if (formData.title.length < 5) {
          setError('서비스 제목은 5자 이상 입력해주세요.');
          return false;
        }
        if (!formData.description.trim()) {
          setError('서비스 설명을 입력해주세요.');
          return false;
        }
        if (formData.description.length < 20) {
          setError('서비스 설명은 20자 이상 입력해주세요.');
          return false;
        }
        break;
      case 3:
        if (!formData.price || parseInt(formData.price) <= 0) {
          setError('올바른 가격을 입력해주세요.');
          return false;
        }
        if (!formData.location) {
          setError('지역을 선택해주세요.');
          return false;
        }
        if (!formData.area) {
          setError('상세 지역을 선택해주세요.');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) return;
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress('');

    try {
      // 1. 이미지 업로드 (있는 경우)
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadProgress('이미지 업로드 중...');
        const { urls, errors } = await uploadServiceImages(imageFiles, user.id);

        if (errors.length > 0) {
          console.warn('일부 이미지 업로드 실패:', errors);
        }
        imageUrls = urls;
      }

      // 2. 서비스 등록
      setUploadProgress('서비스 등록 중...');
      const { data, error: insertError } = await supabase
        .from('services')
        .insert({
          provider_id: user.id,
          category_id: formData.category_id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseInt(formData.price),
          location: formData.location,
          area: formData.area,
          images: imageUrls,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. 프로필을 전문가로 업데이트
      await supabase
        .from('profiles')
        .update({ is_provider: true })
        .eq('id', user.id);

      alert('서비스가 등록되었습니다!');
      router.push(`/services/${data.id}`);
    } catch (err: any) {
      console.error('서비스 등록 오류:', err);
      setError(err.message || '서비스 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 로딩 중이거나 유저가 없으면 로딩 화면 표시
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">
            {authLoading ? '인증 확인 중...' : '로그인 페이지로 이동 중...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">서비스 등록</h1>
          <p className="text-gray-600 mt-1">나의 전문 서비스를 등록하고 고객을 만나보세요</p>
        </div>

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-24 sm:w-32 h-1 mx-2 ${
                      step > num ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>카테고리</span>
            <span>서비스 정보</span>
            <span>가격 및 지역</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {/* Step 1: 카테고리 선택 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">어떤 서비스를 제공하시나요?</h2>
              {categoriesLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-500">카테고리 불러오는 중...</p>
                </div>
              ) : categoriesError || categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 mb-4">카테고리를 불러오지 못했습니다</p>
                  <button
                    type="button"
                    onClick={() => fetchCategories()}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    🔄 다시 시도
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category_id: category.id }))}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.category_id === category.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: 서비스 정보 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">서비스 정보를 입력해주세요</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="예: 10년 경력 피아노 레슨"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.title.length}/50</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 설명 *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="제공하는 서비스에 대해 자세히 설명해주세요. 경력, 수업 방식, 특징 등을 포함하면 좋습니다."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/1000</p>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  서비스 이미지 (선택)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  서비스를 잘 보여주는 이미지를 추가하면 고객의 관심을 끌 수 있어요
                </p>
                <ImageUpload
                  maxImages={5}
                  onImagesChange={setImageFiles}
                />
              </div>
            </div>
          )}

          {/* Step 3: 가격 및 지역 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">가격과 서비스 지역을 설정해주세요</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (원) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="예: 50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.price && `${parseInt(formData.price).toLocaleString()}원`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    지역 *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">선택</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 지역 *
                  </label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={!formData.location}
                  >
                    <option value="">선택</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                이전
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {uploadProgress || '등록 중...'}
                  </>
                ) : (
                  '서비스 등록하기'
                )}
              </button>
            )}
          </div>
        </form>

        {/* 도움말 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">💡 서비스 등록 팁</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 구체적인 제목과 설명이 더 많은 고객을 끌어옵니다</li>
            <li>• 경력과 자격사항을 포함하면 신뢰도가 올라갑니다</li>
            <li>• 적정한 가격 설정이 중요합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
