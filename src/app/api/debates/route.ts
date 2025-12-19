import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface DebatePost {
  id: string;
  author_id: string;
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
  author_nickname: string;
  author_avatar: string | null;
  tags: string[];
}

/**
 * GET /api/debates
 * 토론 게시글 목록 조회 (category = 'debate')
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';
    const search = searchParams.get('search');
    const hot = searchParams.get('hot');

    const offset = (page - 1) * limit;

    // WHERE 조건
    let whereClause = "WHERE p.category = 'debate'";
    const params: (string | number)[] = [];

    if (hot === 'true') {
      whereClause += ' AND p.is_hot = 1';
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // 정렬 필드 검증
    const allowedSorts = ['created_at', 'view_count', 'like_count', 'comment_count'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';

    // 게시글 목록 조회
    const query = `
      SELECT
        p.*,
        u.nickname as author_nickname,
        u.avatar_url as author_avatar
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.is_pinned DESC, p.${sortField} ${order}
      LIMIT ? OFFSET ?
    `;

    const postsResult = await db.prepare(query).bind(...params, limit, offset).all<{
      id: string;
      author_id: string;
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
      author_nickname: string;
      author_avatar: string | null;
    }>();

    // 각 게시글의 태그 조회
    const postsWithTags = await Promise.all(
      (postsResult.results || []).map(async (post) => {
        const tagsResult = await db.prepare(
          "SELECT tag FROM post_tags WHERE post_id = ?"
        ).bind(post.id).all<{ tag: string }>();

        return {
          ...post,
          tags: (tagsResult.results || []).map(t => t.tag),
        };
      })
    );

    // 통계
    const statsQuery = `
      SELECT
        COUNT(*) as total_debates,
        SUM(view_count) as total_views,
        SUM(comment_count) as total_comments,
        SUM(CASE WHEN is_hot = 1 THEN 1 ELSE 0 END) as hot_debates
      FROM posts
      WHERE category = 'debate'
    `;
    const stats = await db.prepare(statsQuery).first<{
      total_debates: number;
      total_views: number;
      total_comments: number;
      hot_debates: number;
    }>();

    return NextResponse.json({
      success: true,
      data: {
        items: postsWithTags,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          totalDebates: stats?.total_debates || 0,
          totalViews: stats?.total_views || 0,
          totalComments: stats?.total_comments || 0,
          hotDebates: stats?.hot_debates || 0,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/debates error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debates' },
      { status: 500 }
    );
  }
}
