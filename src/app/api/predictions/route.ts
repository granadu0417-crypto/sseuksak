import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface PredictionWithOptions {
  id: string;
  title: string;
  description: string | null;
  category: string;
  end_date: string;
  status: string;
  result_option_id: string | null;
  total_participants: number;
  total_points: number;
  created_at: string;
  resolved_at: string | null;
  options: {
    id: string;
    option_text: string;
    odds: number;
    bet_count: number;
    total_points: number;
  }[];
}

/**
 * GET /api/predictions
 * 예측 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const offset = (page - 1) * limit;

    // 기본 쿼리
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM predictions
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // 예측 목록 조회
    const query = `
      SELECT *
      FROM predictions
      ${whereClause}
      ORDER BY
        CASE status
          WHEN 'active' THEN 1
          WHEN 'closed' THEN 2
          WHEN 'resolved' THEN 3
        END,
        end_date ASC
      LIMIT ? OFFSET ?
    `;

    const predictionsResult = await db.prepare(query).bind(...params, limit, offset).all<{
      id: string;
      title: string;
      description: string | null;
      category: string;
      end_date: string;
      status: string;
      result_option_id: string | null;
      total_participants: number;
      total_points: number;
      created_at: string;
      resolved_at: string | null;
    }>();

    // 각 예측의 선택지 조회
    const predictionsWithOptions = await Promise.all(
      (predictionsResult.results || []).map(async (prediction) => {
        const optionsResult = await db.prepare(`
          SELECT id, option_text, odds, bet_count, total_points
          FROM prediction_options
          WHERE prediction_id = ?
          ORDER BY bet_count DESC
        `).bind(prediction.id).all<{
          id: string;
          option_text: string;
          odds: number;
          bet_count: number;
          total_points: number;
        }>();

        return {
          ...prediction,
          options: optionsResult.results || [],
        };
      })
    );

    // 통계
    const statsQuery = `
      SELECT
        status,
        COUNT(*) as count
      FROM predictions
      GROUP BY status
    `;
    const statsResult = await db.prepare(statsQuery).all<{
      status: string;
      count: number;
    }>();

    // 카테고리 목록
    const categoriesQuery = `
      SELECT DISTINCT category
      FROM predictions
      ORDER BY category
    `;
    const categoriesResult = await db.prepare(categoriesQuery).all<{ category: string }>();

    return NextResponse.json({
      success: true,
      data: {
        items: predictionsWithOptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          byStatus: statsResult.results || [],
        },
        categories: (categoriesResult.results || []).map(c => c.category),
      },
    });
  } catch (error) {
    console.error('GET /api/predictions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
