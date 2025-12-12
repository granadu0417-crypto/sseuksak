'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  work_date: string | null;
  created_at: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [workDate, setWorkDate] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/mypage/portfolio');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchPortfolios() {
      if (!user) return;

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPortfolios(data as Portfolio[]);
      }

      setLoading(false);
    }

    if (user) {
      fetchPortfolios();
    }
  }, [user, supabase]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImages([]);
    setWorkDate('');
    setEditingId(null);
  };

  const openModal = (portfolio?: Portfolio) => {
    if (portfolio) {
      setEditingId(portfolio.id);
      setTitle(portfolio.title);
      setDescription(portfolio.description || '');
      setImages(portfolio.images || []);
      setWorkDate(portfolio.work_date || '');
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('portfolios')
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
    }

    setImages([...images, ...uploadedUrls]);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setSaving(true);

    const portfolioData = {
      title: title.trim(),
      description: description.trim() || null,
      images,
      work_date: workDate || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      // 수정
      const { error } = await supabase
        .from('portfolios')
        .update(portfolioData as never)
        .eq('id', editingId);

      if (!error) {
        setPortfolios(portfolios.map(p =>
          p.id === editingId ? { ...p, ...portfolioData } : p
        ));
      }
    } else {
      // 새로 추가
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          ...portfolioData,
          provider_id: user.id,
        } as never)
        .select()
        .single();

      if (!error && data) {
        setPortfolios([data as Portfolio, ...portfolios]);
      }
    }

    setSaving(false);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('포트폴리오를 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (!error) {
      setPortfolios(portfolios.filter(p => p.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
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
          <h1 className="text-lg font-semibold">포트폴리오</h1>
          <button
            onClick={() => openModal()}
            className="text-orange-500 font-medium"
          >
            추가
          </button>
        </div>
      </header>

      {/* 포트폴리오 수 */}
      <div className="bg-white px-4 py-3 border-b">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-orange-500">{portfolios.length}</span>개의 포트폴리오
        </p>
      </div>

      {/* 포트폴리오 목록 */}
      {portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 mb-2">포트폴리오가 없습니다</p>
          <p className="text-sm text-gray-400 mb-4">작업 사례를 추가해 신뢰도를 높이세요</p>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-orange-500 text-white rounded-xl font-medium"
          >
            첫 포트폴리오 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              {/* 대표 이미지 */}
              <div className="relative aspect-square bg-gray-100">
                {portfolio.images?.[0] ? (
                  <Image
                    src={portfolio.images[0]}
                    alt={portfolio.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {portfolio.images && portfolio.images.length > 1 && (
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    +{portfolio.images.length - 1}
                  </span>
                )}
              </div>

              {/* 정보 */}
              <div className="p-3">
                <h3 className="font-medium text-gray-900 truncate">{portfolio.title}</h3>
                {portfolio.work_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(portfolio.work_date)}
                  </p>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openModal(portfolio)}
                    className="flex-1 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(portfolio.id)}
                    className="flex-1 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 py-4 border-b flex items-center justify-between">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500"
              >
                취소
              </button>
              <h2 className="font-semibold">
                {editingId ? '포트폴리오 수정' : '포트폴리오 추가'}
              </h2>
              <button
                onClick={handleSubmit}
                disabled={saving || !title.trim()}
                className="text-orange-500 font-medium disabled:text-gray-300"
              >
                {saving ? '저장 중...' : '완료'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지
                </label>
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <Image
                        src={img}
                        alt={`이미지 ${idx + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs mt-1">추가</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="작업 제목을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="작업에 대한 설명을 입력하세요"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* 작업 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작업 날짜
                </label>
                <input
                  type="month"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
