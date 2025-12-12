'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { Category } from '@/types/database';

const LOCATIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

const AREAS: { [key: string]: string[] } = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
};

const TIME_OPTIONS = [
  '오전 (09:00-12:00)',
  '오후 (12:00-18:00)',
  '저녁 (18:00-21:00)',
  '시간 협의 가능',
];

export default function NewRequestPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    location: '',
    area: '',
    preferred_date: '',
    preferred_time: '',
  });

  // 카테고리 로드
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/requests/new');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // 만료일 설정 (7일 후)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('requests' as 'profiles')
        .insert({
          user_id: user.id,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          location: formData.location,
          area: formData.area,
          preferred_date: formData.preferred_date || null,
          preferred_time: formData.preferred_time || null,
          images: [],
          status: 'open',
          quote_count: 0,
          expires_at: expiresAt.toISOString(),
        } as never)
        .select()
        .single();

      if (error) throw error;

      router.push(`/requests/${(data as { id: string }).id}?success=true`);
    } catch (error) {
      console.error('요청서 작성 실패:', error);
      alert('요청서 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category_id !== '';
      case 2:
        return formData.title.trim().length >= 5 && formData.description.trim().length >= 20;
      case 3:
        return formData.location !== '' && formData.area !== '';
      case 4:
        return true; // 예산과 일정은 선택사항
      default:
        return false;
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category_id);

  if (authLoading) {
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
          <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">요청서 작성</h1>
          <div className="w-6"></div>
        </div>
        {/* 진행률 */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </header>

      {/* Step 1: 카테고리 선택 */}
      {currentStep === 1 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">어떤 서비스가 필요하세요?</h2>
          <p className="text-gray-500 mb-6">카테고리를 선택해주세요</p>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFormData({ ...formData, category_id: category.id })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.category_id === category.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-2">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: 상세 내용 */}
      {currentStep === 2 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">어떤 도움이 필요하세요?</h2>
          <p className="text-gray-500 mb-6">구체적으로 작성할수록 맞춤 견적을 받을 수 있어요</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 원룸 이사 도움 필요합니다"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={50}
              />
              <p className="text-right text-xs text-gray-400 mt-1">{formData.title.length}/50</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={`예시:\n- 이사 날짜: 1월 15일\n- 현재 주소: 서울 강남구\n- 이사 갈 주소: 서울 서초구\n- 짐 양: 원룸 기준 보통\n- 특이사항: 엘리베이터 없음`}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <p className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/1000</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 위치 선택 */}
      {currentStep === 3 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">어디서 서비스가 필요하세요?</h2>
          <p className="text-gray-500 mb-6">서비스 받을 지역을 선택해주세요</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value, area: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">지역 선택</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {formData.location && AREAS[formData.location] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 지역 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">상세 지역 선택</option>
                  {AREAS[formData.location].map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.location && !AREAS[formData.location] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 지역 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="상세 지역을 입력해주세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: 예산 및 일정 */}
      {currentStep === 4 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">예산과 일정을 알려주세요</h2>
          <p className="text-gray-500 mb-6">선택사항이에요. 나중에 수정할 수 있어요.</p>

          <div className="space-y-6">
            {/* 예산 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예상 예산 (선택)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  placeholder="최소"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  placeholder="최대"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="text-gray-600">원</span>
              </div>
            </div>

            {/* 희망 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                희망 날짜 (선택)
              </label>
              <input
                type="date"
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* 희망 시간대 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                희망 시간대 (선택)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferred_time: time })}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      formData.preferred_time === time
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 요약 */}
            <div className="bg-gray-100 rounded-xl p-4">
              <h3 className="font-semibold mb-3">요청 내용 확인</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">카테고리</span>
                  <span>{selectedCategory?.icon} {selectedCategory?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">제목</span>
                  <span className="text-right max-w-[200px] truncate">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">지역</span>
                  <span>{formData.location} {formData.area}</span>
                </div>
                {(formData.budget_min || formData.budget_max) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">예산</span>
                    <span>
                      {formData.budget_min && `${parseInt(formData.budget_min).toLocaleString()}원`}
                      {formData.budget_min && formData.budget_max && ' ~ '}
                      {formData.budget_max && `${parseInt(formData.budget_max).toLocaleString()}원`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3">
        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="w-full bg-orange-500 text-white font-semibold py-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white font-semibold py-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '등록 중...' : '요청서 등록하기'}
          </button>
        )}
      </div>
    </div>
  );
}
