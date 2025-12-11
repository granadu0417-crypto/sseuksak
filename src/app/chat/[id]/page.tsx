'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatRoomDetails {
  id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  created_at: string;
  service: {
    id: string;
    title: string;
    price: number;
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
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChatRoomPage({ params }: PageProps) {
  const { id: roomId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();

  const [room, setRoom] = useState<ChatRoomDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 채팅방 정보 로드
  const loadRoom = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          service:services(id, title, price, images),
          customer:profiles!chat_rooms_customer_id_fkey(id, name, avatar_url),
          provider:profiles!chat_rooms_provider_id_fkey(id, name, avatar_url)
        `)
        .eq('id', roomId)
        .single();

      if (fetchError) throw fetchError;

      // 참여자인지 확인
      if (data.customer_id !== user?.id && data.provider_id !== user?.id) {
        router.push('/chat');
        return;
      }

      setRoom(data);
    } catch (err) {
      console.error('채팅방 로딩 실패:', err);
      setError('채팅방을 불러오는데 실패했습니다.');
    }
  }, [roomId, supabase, user?.id, router]);

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages(data || []);

      // 읽음 처리
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_id', user?.id)
        .eq('is_read', false);

    } catch (err) {
      console.error('메시지 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, supabase, user?.id]);

  // 초기 로드
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/chat');
      return;
    }

    if (user) {
      loadRoom();
      loadMessages();
    }
  }, [user, authLoading, router, loadRoom, loadMessages]);

  // 실시간 메시지 구독
  useEffect(() => {
    if (!user || !roomId) return;

    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          setMessages((prev) => {
            // 중복 방지
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // 상대방이 보낸 메시지면 읽음 처리
          if (newMsg.sender_id !== user.id) {
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, roomId, supabase]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // 메시지 삽입
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content: messageContent,
        });

      if (insertError) throw insertError;

      // 채팅방 마지막 메시지 업데이트
      await supabase
        .from('chat_rooms')
        .update({
          last_message: messageContent,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      inputRef.current?.focus();
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      setNewMessage(messageContent); // 실패 시 메시지 복원
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 날짜별 그룹핑
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const getOtherUser = () => {
    if (!room) return null;
    return room.customer_id === user?.id ? room.provider : room.customer;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <span className="text-6xl mb-4">😢</span>
        <p className="text-gray-600">{error || '채팅방을 찾을 수 없습니다.'}</p>
        <Link href="/chat" className="mt-4 text-[#FF6B35] font-medium">
          채팅 목록으로
        </Link>
      </div>
    );
  }

  const otherUser = getOtherUser();
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.push('/chat')} className="p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.name || '사용자'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                👤
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{otherUser?.name || '익명'}</h1>
            <p className="text-xs text-gray-500 truncate">{room.service?.title}</p>
          </div>

          <Link
            href={`/services/${room.service_id}`}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </Link>
        </div>

        {/* 서비스 정보 배너 */}
        <Link
          href={`/services/${room.service_id}`}
          className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-t border-gray-100"
        >
          {room.service?.images && room.service.images.length > 0 && (
            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                src={room.service.images[0]}
                alt={room.service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{room.service?.title}</p>
            <p className="text-sm text-[#FF6B35]">
              {new Intl.NumberFormat('ko-KR').format(room.service?.price || 0)}원~
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-5xl mb-3">👋</span>
            <p className="text-center">
              {otherUser?.name || '상대방'}님과의 대화를 시작해보세요!
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* 날짜 구분선 */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  {formatDate(group.date)}
                </span>
              </div>

              {/* 메시지들 */}
              {group.messages.map((message) => {
                const isMine = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-1 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-[#FF6B35] text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isMine && message.is_read && (
                          <span className="text-xs text-gray-400">읽음</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 pb-6">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 bg-[#FF6B35] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
