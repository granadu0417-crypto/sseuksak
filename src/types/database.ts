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

// 서비스 + 관련 데이터 조합 타입
export interface ServiceWithDetails extends Service {
  category?: Category;
  provider?: Profile;
  reviews?: Review[];
  average_rating?: number;
  review_count?: number;
}
