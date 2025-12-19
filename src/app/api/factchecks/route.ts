import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface FactcheckWithPolitician {
  id: string;
  claim: string;
  claim_source: string | null;
  claim_date: string | null;
  politician_id: string | null;
  verdict: string;
  explanation: string;
  sources: string | null;
  checker_id: string | null;
  agree_count: number;
  disagree_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  politician_name: string | null;
  party_name: string | null;
  party_color: string | null;
}

/**
 * GET /api/factchecks
 * 팩트체크 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const verdict = searchParams.get('verdict');
    const politicianId = searchParams.get('politician_id');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // 기본 쿼리
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (verdict && verdict !== 'all') {
      whereClause += ' AND f.verdict = ?';
      params.push(verdict);
    }

    if (politicianId) {
      whereClause += ' AND f.politician_id = ?';
      params.push(politicianId);
    }

    if (search) {
      whereClause += ' AND (f.claim LIKE ? OR f.explanation LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM factchecks f
      LEFT JOIN politicians pol ON f.politician_id = pol.id
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // 팩트체크 목록 조회
    const query = `
      SELECT
        f.*,
        pol.name as politician_name,
        pa.name as party_name,
        pa.color as party_color
      FROM factchecks f
      LEFT JOIN politicians pol ON f.politician_id = pol.id
      LEFT JOIN parties pa ON pol.party_id = pa.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.prepare(query).bind(...params, limit, offset).all<FactcheckWithPolitician>();

    // verdict별 통계
    const statsQuery = `
      SELECT
        verdict,
        COUNT(*) as count
      FROM factchecks
      GROUP BY verdict
    `;
    const statsResult = await db.prepare(statsQuery).all<{
      verdict: string;
      count: number;
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
          byVerdict: statsResult.results || [],
        },
      },
    });
  } catch (error) {
    console.error('GET /api/factchecks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch factchecks' },
      { status: 500 }
    );
  }
}
