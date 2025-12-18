import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface PromiseWithPolitician {
  id: string;
  politician_id: string;
  category: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  progress: number;
  evidence_url: string | null;
  created_at: string;
  updated_at: string;
  politician_name: string;
  party_name: string | null;
  party_color: string | null;
}

/**
 * GET /api/promises
 * 공약 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const politicianId = searchParams.get('politician_id');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // 기본 쿼리
    let whereClause = 'WHERE pol.is_active = 1';
    const params: (string | number)[] = [];

    if (category && category !== 'all') {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }

    if (status && status !== 'all') {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (politicianId) {
      whereClause += ' AND p.politician_id = ?';
      params.push(politicianId);
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ? OR pol.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM promises p
      JOIN politicians pol ON p.politician_id = pol.id
      LEFT JOIN parties pa ON pol.party_id = pa.id
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // 공약 목록 조회
    const query = `
      SELECT
        p.*,
        pol.name as politician_name,
        pa.name as party_name,
        pa.color as party_color
      FROM promises p
      JOIN politicians pol ON p.politician_id = pol.id
      LEFT JOIN parties pa ON pol.party_id = pa.id
      ${whereClause}
      ORDER BY
        CASE p.status
          WHEN 'in_progress' THEN 1
          WHEN 'not_started' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'failed' THEN 4
        END,
        p.progress DESC,
        p.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.prepare(query).bind(...params, limit, offset).all<PromiseWithPolitician>();

    // 카테고리별 통계
    const statsQuery = `
      SELECT
        category,
        COUNT(*) as count,
        AVG(progress) as avg_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM promises p
      JOIN politicians pol ON p.politician_id = pol.id
      WHERE pol.is_active = 1
      GROUP BY category
    `;
    const statsResult = await db.prepare(statsQuery).all<{
      category: string;
      count: number;
      avg_progress: number;
      completed_count: number;
    }>();

    // 전체 통계
    const overallStats = await db.prepare(`
      SELECT
        COUNT(*) as total,
        AVG(progress) as avg_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM promises p
      JOIN politicians pol ON p.politician_id = pol.id
      WHERE pol.is_active = 1
    `).first<{
      total: number;
      avg_progress: number;
      completed: number;
      in_progress: number;
      not_started: number;
      failed: number;
    }>();

    return NextResponse.json({
      success: true,
      data: {
        items: result.results || [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          overall: overallStats,
          byCategory: statsResult.results || [],
        },
      },
    });
  } catch (error) {
    console.error('GET /api/promises error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promises' },
      { status: 500 }
    );
  }
}
