'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface ChatRoomWithDetails {
  id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  service: {
    id: string;
    title: string;
    images: string[];
  };
  customer: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  provider: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  unread_count?: number;
}

export default function ChatListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatRooms = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // 내가 참여한 채팅방 조회 (고객 또는 전문가로서)
      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          service:services(id, title, images),
          customer:profiles!chat_rooms_customer_id_fkey(id, name, avatar_url),
          provider:profiles!chat_rooms_provider_id_fkey(id, name, avatar_url)
        `)
        .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (fetchError) throw fetchError;

      // 각 채팅방의 읽지 않은 메시지 수 조회
      const roomsWithUnread = await Promise.all(
        (data || []).map(async (room) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...room,
            unread_count: count || 0,
          };
        })
      );

      setChatRooms(roomsWithUnread);
    } catch (err) {
      console.error('채팅방 목록 로딩 실패:', err);
      setError('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/chat');
      return;
    }

    if (user) {
      fetchChatRooms();
    }
  }, [user, authLoading, router, fetchChatRooms]);

  // 실시간 채팅방 업데이트 구독
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseClient();

    const subscription = supabase
      .channel('chat_rooms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          fetchChatRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `provider_id=eq.${user.id}`,
        },
        () => {
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchChatRooms]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getOtherUser = (room: ChatRoomWithDetails) => {
    // 내가 고객이면 상대방은 전문가, 내가 전문가면 상대방은 고객
    return room.customer_id === user?.id ? room.provider : room.customer;
  };

  if (authLoading || loading) {
    return (
      <div className="pt-4 px-4 pb-20">
        <h1 className="text-xl font-bold mb-4">채팅</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-4 bg-white rounded-xl animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <h1 className="text-xl font-bold">채팅</h1>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchChatRooms}
            className="mt-2 text-sm text-red-600 underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 채팅방 목록 */}
      {chatRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
          <span className="text-6xl block mb-4">💬</span>
          <p className="text-lg font-medium text-gray-600">아직 채팅이 없습니다</p>
          <p className="text-sm mt-2">전문가와 상담을 시작해보세요</p>
          <Link
            href="/search"
            className="mt-6 px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-medium"
          >
            서비스 둘러보기
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {chatRooms.map((room) => {
            const otherUser = getOtherUser(room);
            const isCustomer = room.customer_id === user?.id;

            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex gap-3 p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                {/* 프로필 이미지 */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {otherUser?.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.name || '사용자'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  {/* 읽지 않은 메시지 배지 */}
                  {room.unread_count && room.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </span>
                    </div>
                  )}
                </div>

                {/* 채팅 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherUser?.name || '익명'}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTime(room.last_message_at)}
                    </span>
                  </div>

                  {/* 서비스 정보 */}
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {isCustomer ? '🛠️' : '📩'} {room.service?.title || '서비스'}
                  </p>

                  {/* 마지막 메시지 */}
                  <p className={`text-sm truncate mt-1 ${
                    room.unread_count && room.unread_count > 0
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}>
                    {room.last_message || '새로운 대화를 시작하세요'}
                  </p>
                </div>

                {/* 서비스 썸네일 */}
                {room.service?.images && room.service.images.length > 0 && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={room.service.images[0]}
                      alt={room.service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
