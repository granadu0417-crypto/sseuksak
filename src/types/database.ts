// Supabase 데이터베이스 타입 정의

export interface Database {
  public: {
    Tables: {
      // 사용자 프로필
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_provider: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_provider?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_provider?: boolean;
          updated_at?: string;
        };
      };

      // 카테고리
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          icon?: string;
          color?: string;
          order_index?: number;
        };
      };

      // 서비스
      services: {
        Row: {
          id: string;
          provider_id: string;
          category_id: string;
          title: string;
          description: string;
          price: number;
          original_price: number | null;
          discount_percent: number | null;
          location: string;
          area: string;
          images: string[];
          is_active: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category_id: string;
          title: string;
          description: string;
          price: number;
          original_price?: number | null;
          discount_percent?: number | null;
          location: string;
          area: string;
          images?: string[];
          is_active?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          title?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          discount_percent?: number | null;
          location?: string;
          area?: string;
          images?: string[];
          is_active?: boolean;
          view_count?: number;
          updated_at?: string;
        };
      };

      // 리뷰
      reviews: {
        Row: {
          id: string;
          service_id: string;
          user_id: string;
          rating: number;
          content: string;
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          user_id: string;
          rating: number;
          content: string;
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          content?: string;
          images?: string[];
          updated_at?: string;
        };
      };

      // 찜하기
      favorites: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          created_at?: string;
        };
        Update: never;
      };

      // 채팅방
      chat_rooms: {
        Row: {
          id: string;
          service_id: string;
          customer_id: string;
          provider_id: string;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          customer_id: string;
          provider_id: string;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          last_message?: string | null;
          last_message_at?: string | null;
        };
      };

      // 채팅 메시지
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };

      // 요청서 (고객이 서비스 요청)
      requests: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string;
          budget_min: number | null;
          budget_max: number | null;
          location: string;
          area: string;
          preferred_date: string | null;
          preferred_time: string | null;
          images: string[];
          status: 'open' | 'in_progress' | 'completed' | 'cancelled';
          quote_count: number;
          created_at: string;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string;
          budget_min?: number | null;
          budget_max?: number | null;
          location: string;
          area: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          images?: string[];
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          quote_count?: number;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          budget_min?: number | null;
          budget_max?: number | null;
          location?: string;
          area?: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          images?: string[];
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
          quote_count?: number;
          updated_at?: string;
          expires_at?: string;
        };
      };

      // 견적서 (전문가가 요청서에 응답)
      quotes: {
        Row: {
          id: string;
          request_id: string;
          provider_id: string;
          service_id: string | null;
          price: number;
          description: string;
          estimated_duration: string | null;
          available_date: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'expired';
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          provider_id: string;
          service_id?: string | null;
          price: number;
          description: string;
          estimated_duration?: string | null;
          available_date?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'expired';
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          price?: number;
          description?: string;
          estimated_duration?: string | null;
          available_date?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'expired';
          is_read?: boolean;
          updated_at?: string;
        };
      };

      // 알림
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'new_quote' | 'quote_accepted' | 'new_message' | 'new_review' | 'request_expired' | 'system';
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'new_quote' | 'quote_accepted' | 'new_message' | 'new_review' | 'request_expired' | 'system';
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 편의를 위한 타입 별칭
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type Request = Database['public']['Tables']['requests']['Row'];
export type Quote = Database['public']['Tables']['quotes']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// 서비스 + 관련 데이터 조합 타입
export interface ServiceWithDetails extends Service {
  category?: Category;
  provider?: Profile;
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
}

// 요청서 + 관련 데이터 조합 타입
export interface RequestWithDetails extends Request {
  category?: Category;
  user?: Profile;
  quotes?: QuoteWithProvider[];
}

// 견적서 + 관련 데이터 조합 타입
export interface QuoteWithProvider extends Quote {
  provider?: Profile;
  service?: Service;
}

// 알림 타입
export type NotificationType = Database['public']['Tables']['notifications']['Row']['type'];
