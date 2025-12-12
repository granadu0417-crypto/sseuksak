'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/mypage/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        const profile = data as { name?: string; phone?: string; bio?: string; avatar_url?: string };
        setName(profile.name || '');
        setPhone(profile.phone || '');
        setBio(profile.bio || '');
        setAvatarUrl(profile.avatar_url || null);
      }

      setLoading(false);
    }

    if (user) {
      fetchProfile();
    }
  }, [user, supabase]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);

    try {
      // 파일명 생성
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('아바타 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', user.id);

    if (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 저장에 실패했습니다.');
    } else {
      alert('프로필이 저장되었습니다.');
      router.push('/mypage');
    }

    setSaving(false);
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
          <h1 className="text-lg font-semibold">프로필 편집</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        {/* 프로필 이미지 */}
        <div className="bg-white px-4 py-8 flex flex-col items-center">
          <div
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center cursor-pointer overflow-hidden group"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            ) : avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="프로필"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-4xl text-orange-500 font-bold">
                {name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
              </span>
            )}

            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleAvatarClick}
            className="mt-3 text-sm text-orange-500 font-medium"
          >
            사진 변경
          </button>
        </div>

        {/* 기본 정보 */}
        <div className="mt-2 bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">기본 정보</h2>

          {/* 이메일 (읽기 전용) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">이메일</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500"
            />
          </div>

          {/* 이름 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* 전화번호 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* 소개 */}
        <div className="mt-2 bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">소개</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">자기소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해주세요. 전문가로 활동하시는 경우 경력, 강점 등을 작성하면 고객에게 신뢰감을 줄 수 있어요."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {bio.length}/500
            </p>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="p-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:bg-gray-300"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
