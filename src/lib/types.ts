// 사용자
export interface User {
  id: string;
  email: string;
  username: string;
  nickname: string;
  avatar_url: string | null;
  level: number;
  exp: number;
  points: number;
  role: 'user' | 'moderator' | 'admin';
  is_verified: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

// 게시글
export interface Post {
  id: string;
  author_id: string;
  category: 'free' | 'debate' | 'info' | 'humor' | 'notice';
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  is_pinned: number;
  is_hot: number;
  created_at: string;
  updated_at: string;
}

// 게시글 + 작성자 정보
export interface PostWithAuthor extends Post {
  author_nickname: string;
  author_avatar: string | null;
  author_level: number;
  tags: string[];
}

// 댓글
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  dislike_count: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

// 댓글 + 작성자 정보
export interface CommentWithAuthor extends Comment {
  author_nickname: string;
  author_avatar: string | null;
  author_level: number;
  replies?: CommentWithAuthor[];
}

// 투표
export interface Vote {
  id: string;
  user_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  vote_type: 'like' | 'dislike';
  created_at: string;
}

// 정당
export interface Party {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  logo_url: string | null;
  description: string | null;
  member_count: number;
}

// 정치인
export interface Politician {
  id: string;
  name: string;
  party_id: string | null;
  region: string | null;
  position: string | null;
  avatar_url: string | null;
  attendance_rate: number;
  bill_count: number;
  promise_count: number;
  promise_completed: number;
  approval_rating: number;
  is_trending: number;
}

// 정치인 + 정당 정보
export interface PoliticianWithParty extends Politician {
  party_name: string | null;
  party_color: string | null;
  tags: string[];
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Cloudflare Env 타입
export interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
}
