'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface NotificationSettings {
  push_new_message: boolean;
  push_new_quote: boolean;
  push_quote_accepted: boolean;
  push_new_review: boolean;
  email_marketing: boolean;
  email_newsletter: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = getSupabaseClient();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    push_new_message: true,
    push_new_quote: true,
    push_quote_accepted: true,
    push_new_review: true,
    email_marketing: false,
    email_newsletter: false,
  });

  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/settings');
    }
  }, [user, authLoading, router]);

  // 설정 불러오기 (실제로는 DB에서 가져와야 함)
  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      setNotifications(JSON.parse(savedSettings));
    }
  }, []);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newSettings);

    // 로컬 스토리지에 저장
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== '탈퇴합니다') {
      alert('탈퇴 확인 문구를 정확히 입력해주세요.');
      return;
    }

    setDeleting(true);

    try {
      // 실제로는 서버에서 사용자 데이터를 삭제하는 API를 호출해야 함
      // 여기서는 로그아웃만 처리
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('계정 삭제 실패:', error);
      alert('계정 삭제에 실패했습니다. 고객센터에 문의해주세요.');
    } finally {
      setDeleting(false);
    }
  };

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
          <button onClick={() => router.back()}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">설정</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* 알림 설정 */}
      <div className="mt-2 bg-white">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">알림 설정</h2>
        </div>

        <div className="divide-y">
          <ToggleItem
            label="새 메시지 알림"
            description="채팅 메시지를 받으면 알림"
            checked={notifications.push_new_message}
            onChange={() => handleToggle('push_new_message')}
          />
          <ToggleItem
            label="새 견적 알림"
            description="내 요청서에 견적이 도착하면 알림"
            checked={notifications.push_new_quote}
            onChange={() => handleToggle('push_new_quote')}
          />
          <ToggleItem
            label="견적 수락 알림"
            description="보낸 견적이 수락되면 알림"
            checked={notifications.push_quote_accepted}
            onChange={() => handleToggle('push_quote_accepted')}
          />
          <ToggleItem
            label="새 리뷰 알림"
            description="내 서비스에 리뷰가 작성되면 알림"
            checked={notifications.push_new_review}
            onChange={() => handleToggle('push_new_review')}
          />
        </div>
      </div>

      {/* 마케팅 수신 */}
      <div className="mt-2 bg-white">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">마케팅 정보 수신</h2>
        </div>

        <div className="divide-y">
          <ToggleItem
            label="이메일 마케팅"
            description="이벤트, 프로모션 정보 수신"
            checked={notifications.email_marketing}
            onChange={() => handleToggle('email_marketing')}
          />
          <ToggleItem
            label="뉴스레터"
            description="쓱싹 소식 및 유용한 정보 수신"
            checked={notifications.email_newsletter}
            onChange={() => handleToggle('email_newsletter')}
          />
        </div>
      </div>

      {/* 계정 관리 */}
      <div className="mt-2 bg-white">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">계정 관리</h2>
        </div>

        <div className="divide-y">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50"
          >
            <span className="text-gray-700">로그아웃</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50"
          >
            <span className="text-red-500">계정 탈퇴</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="mt-2 bg-white">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">앱 정보</h2>
        </div>

        <div className="divide-y">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-gray-700">버전</span>
            <span className="text-gray-500">1.0.0</span>
          </div>

          <button
            onClick={() => window.open('https://www.notion.so/terms', '_blank')}
            className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50"
          >
            <span className="text-gray-700">이용약관</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          <button
            onClick={() => window.open('https://www.notion.so/privacy', '_blank')}
            className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50"
          >
            <span className="text-gray-700">개인정보처리방침</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          <button
            onClick={() => window.open('https://www.notion.so/licenses', '_blank')}
            className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50"
          >
            <span className="text-gray-700">오픈소스 라이센스</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* 계정 삭제 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-center mb-2">계정 탈퇴</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              탈퇴하시면 모든 데이터가 삭제되며 복구할 수 없습니다.
              정말 탈퇴하시려면 아래에 &quot;탈퇴합니다&quot;를 입력해주세요.
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="탈퇴합니다"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== '탈퇴합니다'}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium disabled:bg-gray-300"
              >
                {deleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 토글 아이템 컴포넌트
function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
