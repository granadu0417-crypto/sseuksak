'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostWithAuthor, CommentWithAuthor, PaginatedResponse, ApiResponse, PoliticianWithParty, Party } from '@/lib/types';

const API_BASE = '/api';

// 게시글 목록 조회 파라미터
interface GetPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 게시글 목록 조회
export function usePosts(params: GetPostsParams = {}) {
  const queryString = new URLSearchParams();

  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.category && params.category !== 'all') queryString.set('category', params.category);
  if (params.search) queryString.set('search', params.search);
  if (params.sort) queryString.set('sort', params.sort);
  if (params.order) queryString.set('order', params.order);

  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const url = `${API_BASE}/posts?${queryString.toString()}`;
      const res = await fetch(url);
      const data = await res.json() as ApiResponse<PaginatedResponse<PostWithAuthor>>;

      if (!data.success) {
        throw new Error(data.error || '게시글을 불러오는데 실패했습니다.');
      }

      return data.data!;
    },
  });
}

// 게시글 상세 조회
export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/posts/${id}`);
      const data = await res.json() as ApiResponse<PostWithAuthor>;

      if (!data.success) {
        throw new Error(data.error || '게시글을 찾을 수 없습니다.');
      }

      return data.data!;
    },
    enabled: !!id,
  });
}

// 게시글 작성
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      title: string;
      content: string;
      category: string;
      tags?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as ApiResponse<{ id: string }>;

      if (!data.success) {
        throw new Error(data.error || '게시글 작성에 실패했습니다.');
      }

      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 게시글 수정
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      content?: string;
      category?: string;
      tags?: string[];
    }) => {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as ApiResponse<void>;

      if (!data.success) {
        throw new Error(data.error || '게시글 수정에 실패했습니다.');
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}

// 게시글 삭제
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json() as ApiResponse<void>;

      if (!data.success) {
        throw new Error(data.error || '게시글 삭제에 실패했습니다.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 게시글 투표
export function useVotePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      voteType
    }: {
      postId: string;
      voteType: 'like' | 'dislike';
    }) => {
      const res = await fetch(`${API_BASE}/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });
      const data = await res.json() as ApiResponse<{
        like_count: number;
        dislike_count: number;
        user_vote: string | null;
        action: string;
      }>;

      if (!data.success) {
        throw new Error(data.error || '투표에 실패했습니다.');
      }

      return data.data!;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 댓글 목록 조회
export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
      const data = await res.json() as ApiResponse<CommentWithAuthor[]>;

      if (!data.success) {
        throw new Error(data.error || '댓글을 불러오는데 실패했습니다.');
      }

      return data.data!;
    },
    enabled: !!postId,
  });
}

// 댓글 작성
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      parentId,
    }: {
      postId: string;
      content: string;
      parentId?: string;
    }) => {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parent_id: parentId }),
      });
      const data = await res.json() as ApiResponse<{ id: string }>;

      if (!data.success) {
        throw new Error(data.error || '댓글 작성에 실패했습니다.');
      }

      return data.data!;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

// ============================================
// 인증 관련 hooks
// ============================================

// 현재 사용자 정보
interface UserInfo {
  id: string;
  nickname: string;
  avatar_url: string | null;
  level: number;
  exp: number;
  points: number;
  role: string;
  created_at: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/auth/me`);
      const data = await res.json() as ApiResponse<{ user: UserInfo }>;

      if (!data.success) {
        return null;
      }

      return data.data!.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 회원가입
export function useRegister() {
  return useMutation({
    mutationFn: async (body: {
      nickname: string;
      password: string;
      passwordConfirm: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as ApiResponse<{
        userId: string;
        recoveryCode: string;
      }>;

      if (!data.success) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      return data.data!;
    },
  });
}

// 로그인
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      nickname: string;
      password: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as ApiResponse<{
        user: { id: string; nickname: string; level: number; role: string };
      }>;

      if (!data.success) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// 로그아웃
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
      });
      const data = await res.json() as ApiResponse<null>;

      if (!data.success) {
        throw new Error(data.error || '로그아웃에 실패했습니다.');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// 비밀번호 복구
export function useRecoverPassword() {
  return useMutation({
    mutationFn: async (body: {
      nickname: string;
      recoveryCode: string;
      newPassword: string;
      newPasswordConfirm: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as ApiResponse<{ newRecoveryCode: string }>;

      if (!data.success) {
        throw new Error(data.error || '비밀번호 복구에 실패했습니다.');
      }

      return data.data!;
    },
  });
}

// ============================================
// 정치인 관련 hooks
// ============================================

// 정치인 상세 정보 타입
interface ActivityStats {
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  absent_votes: number;
  bills_sponsored: number;
  bills_cosponsored: number;
  bills_passed: number;
  plenary_attendance_rate: number;
  committee_attendance_rate: number;
}

interface BillSponsorship {
  id: string;
  bill_name: string;
  sponsor_type: string;
  propose_date: string | null;
  committee: string | null;
  proc_result: string | null;
}

interface VotingRecord {
  id: string;
  bill_name: string | null;
  vote_result: string;
  vote_date: string | null;
}

interface CommitteeActivity {
  id: string;
  committee_name: string;
  position: string | null;
  is_current: number;
}

interface ElectionHistory {
  id: string;
  election_id: string;
  election_type: string;
  election_date: string;
  constituency: string | null;
  party_name: string | null;
  vote_count: number | null;
  vote_rate: number | null;
  is_elected: number;
  assembly_age: number | null;
}

interface ElectionPromise {
  id: string;
  promise_no: number;
  category: string | null;
  title: string;
  content: string | null;
  status: string;
  progress: number;
}

interface AssetSummary {
  total_assets: number;
  total_real_estate: number;
  total_securities: number;
  total_deposits: number;
  total_debts: number;
  asset_change: number | null;
  asset_change_rate: number | null;
  latest_report_date: string | null;
}

interface ContributionSummary {
  total_contributions: number;
  total_donors: number;
  latest_year: number | null;
  latest_amount: number | null;
  avg_yearly_amount: number | null;
  max_single_donation: number | null;
}

interface PartyPosition {
  id: string;
  party_name: string;
  party_color: string | null;
  position_type: string;
  position_level: number;
  position_name: string;
  term_number: number | null;
  appointment_type: string;
  start_date: string | null;
  region: string | null;
}

interface PoliticianDetail extends PoliticianWithParty {
  birth_date: string | null;
  education: string | null;
  career: string | null;
  contact_email: string | null;
  website_url: string | null;
  sns_twitter: string | null;
  sns_facebook: string | null;
  sns_instagram: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  activities: {
    id: string;
    activity_type: string;
    title: string;
    description: string | null;
    source_url: string | null;
    activity_date: string;
  }[];
  promises: {
    id: string;
    category: string;
    title: string;
    description: string | null;
    status: string;
    progress: number;
    target_date: string | null;
  }[];
  activity_stats: ActivityStats;
  recent_bills: BillSponsorship[];
  recent_votes: VotingRecord[];
  committee_activities: CommitteeActivity[];
  election_history: ElectionHistory[];
  election_promises: ElectionPromise[];
  asset_summary: AssetSummary | null;
  contribution_summary: ContributionSummary | null;
  party_positions: PartyPosition[];
}

// 정치인 목록 조회 파라미터
interface GetPoliticiansParams {
  page?: number;
  limit?: number;
  party?: string;
  region?: string;
  search?: string;
  trending?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 정치인 목록 조회
export function usePoliticians(params: GetPoliticiansParams = {}) {
  const queryString = new URLSearchParams();

  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.party && params.party !== 'all') queryString.set('party', params.party);
  if (params.region && params.region !== 'all') queryString.set('region', params.region);
  if (params.search) queryString.set('search', params.search);
  if (params.trending) queryString.set('trending', 'true');
  if (params.sort) queryString.set('sort', params.sort);
  if (params.order) queryString.set('order', params.order);

  return useQuery({
    queryKey: ['politicians', params],
    queryFn: async () => {
      const url = `${API_BASE}/politicians?${queryString.toString()}`;
      const res = await fetch(url);
      const data = await res.json() as ApiResponse<PaginatedResponse<PoliticianWithParty>>;

      if (!data.success) {
        throw new Error(data.error || '정치인 목록을 불러오는데 실패했습니다.');
      }

      return data.data!;
    },
  });
}

// 정치인 상세 조회
export function usePolitician(id: string) {
  return useQuery({
    queryKey: ['politician', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/politicians/${id}`);
      const data = await res.json() as ApiResponse<PoliticianDetail>;

      if (!data.success) {
        throw new Error(data.error || '정치인을 찾을 수 없습니다.');
      }

      return data.data!;
    },
    enabled: !!id,
  });
}

// ============================================
// 정당 관련 hooks
// ============================================

// 정당 목록 조회
export function useParties() {
  return useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/parties`);
      const data = await res.json() as ApiResponse<Party[]>;

      if (!data.success) {
        throw new Error(data.error || '정당 목록을 불러오는데 실패했습니다.');
      }

      return data.data!;
    },
    staleTime: 10 * 60 * 1000, // 10분 캐시
  });
}
