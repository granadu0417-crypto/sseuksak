'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostWithAuthor, PaginatedResponse, ApiResponse } from '@/lib/types';

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
