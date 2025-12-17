import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getCrosscheckEngine, type ConflictSeverity } from '@/lib/crosscheck-engine';

/**
 * GET /api/crosscheck/conflicts
 *
 * 불일치 목록 조회
 *
 * Query Parameters:
 * - politician_id: 특정 정치인의 불일치만 (선택)
 * - severity: critical, high, medium, low (선택)
 * - status: detected, reviewing, resolved, ignored (선택)
 * - limit: 결과 수 제한 (기본 50)
 * - offset: 페이지네이션 오프셋 (기본 0)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const url = new URL(request.url);
    const politicianId = url.searchParams.get('politician_id');
    const severity = url.searchParams.get('severity') as ConflictSeverity | null;
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 쿼리 빌드
    let query = `
      SELECT
        dc.id,
        dc.politician_id,
        p.name as politician_name,
        party.name as party_name,
        dc.data_type,
        dc.field_name,
        ds1.name as source1_name,
        ds1.authority_score as source1_authority,
        dc.source1_value,
        ds2.name as source2_name,
        ds2.authority_score as source2_authority,
        dc.source2_value,
        dc.severity,
        dc.status,
        dc.resolution,
        dc.resolved_value,
        dc.resolved_by,
        dc.resolved_at,
        dc.detected_at,
        dc.notes
      FROM data_conflicts dc
      JOIN politicians p ON dc.politician_id = p.id
      LEFT JOIN parties party ON p.party_id = party.id
      JOIN data_sources ds1 ON dc.source1_id = ds1.id
      JOIN data_sources ds2 ON dc.source2_id = ds2.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (politicianId) {
      query += ' AND dc.politician_id = ?';
      params.push(politicianId);
    }

    if (severity) {
      query += ' AND dc.severity = ?';
      params.push(severity);
    }

    if (status) {
      query += ' AND dc.status = ?';
      params.push(status);
    } else {
      // 기본적으로 미해결 불일치만
      query += " AND dc.status IN ('detected', 'reviewing')";
    }

    // 카운트 쿼리
    const countQuery = query.replace(
      /SELECT[\s\S]+?FROM data_conflicts/,
      'SELECT COUNT(*) as total FROM data_conflicts'
    );
    const totalResult = await db
      .prepare(countQuery)
      .bind(...params)
      .first<{ total: number }>();

    // 정렬 및 페이지네이션
    query += `
      ORDER BY
        CASE dc.severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        dc.detected_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const result = await db.prepare(query).bind(...params).all<{
      id: string;
      politician_id: string;
      politician_name: string;
      party_name: string | null;
      data_type: string;
      field_name: string;
      source1_name: string;
      source1_authority: number;
      source1_value: string | null;
      source2_name: string;
      source2_authority: number;
      source2_value: string | null;
      severity: ConflictSeverity;
      status: string;
      resolution: string | null;
      resolved_value: string | null;
      resolved_by: string | null;
      resolved_at: string | null;
      detected_at: string;
      notes: string | null;
    }>();

    // 통계 계산
    const statsResult = await db
      .prepare(
        `
      SELECT
        severity,
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('detected', 'reviewing') THEN 1 END) as unresolved
      FROM data_conflicts
      ${politicianId ? 'WHERE politician_id = ?' : ''}
      GROUP BY severity
    `
      )
      .bind(...(politicianId ? [politicianId] : []))
      .all<{ severity: ConflictSeverity; total: number; unresolved: number }>();

    return NextResponse.json({
      success: true,
      data: {
        conflicts: result.results || [],
        pagination: {
          total: totalResult?.total || 0,
          limit,
          offset,
          hasMore: offset + limit < (totalResult?.total || 0),
        },
        stats: statsResult.results || [],
        filters: {
          politician_id: politicianId,
          severity,
          status: status || 'unresolved',
        },
      },
    });
  } catch (error) {
    console.error('GET /api/crosscheck/conflicts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conflicts' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/crosscheck/conflicts
 *
 * 불일치 해결 처리
 *
 * Request Body:
 * - conflict_id: 불일치 ID (필수)
 * - resolution: source1_preferred, source2_preferred, manual, ignored (필수)
 * - resolved_value: 수동 해결 시 확정값 (선택)
 * - notes: 메모 (선택)
 */
export async function PUT(request: NextRequest) {
  try {
    // 보안 키 확인
    const syncSecret = request.headers.get('x-sync-secret');
    const expectedSecret = process.env.SYNC_SECRET;
    if (expectedSecret && syncSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    type ResolutionType = 'source1_preferred' | 'source2_preferred' | 'manual' | 'ignored';
    const body = await request.json() as {
      conflict_id?: string;
      resolution?: ResolutionType;
      resolved_value?: string;
      notes?: string;
    };
    const { conflict_id, resolution, resolved_value, notes } = body;

    if (!conflict_id) {
      return NextResponse.json(
        { success: false, error: 'conflict_id is required' },
        { status: 400 }
      );
    }

    if (
      !resolution ||
      !['source1_preferred', 'source2_preferred', 'manual', 'ignored'].includes(
        resolution
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'resolution must be one of: source1_preferred, source2_preferred, manual, ignored',
        },
        { status: 400 }
      );
    }

    const engine = getCrosscheckEngine();
    await engine.resolveConflict(
      conflict_id,
      resolution,
      resolved_value,
      'admin'
    );

    // 메모 업데이트
    if (notes) {
      const db = getDB();
      await db
        .prepare('UPDATE data_conflicts SET notes = ? WHERE id = ?')
        .bind(notes, conflict_id)
        .run();
    }

    // 관련 정치인의 크로스체크 결과 업데이트
    const db = getDB();
    const conflict = await db
      .prepare('SELECT politician_id FROM data_conflicts WHERE id = ?')
      .bind(conflict_id)
      .first<{ politician_id: string }>();

    if (conflict) {
      await engine.updateCrosscheckResult(conflict.politician_id);
    }

    return NextResponse.json({
      success: true,
      data: {
        conflictId: conflict_id,
        resolution,
        resolvedValue: resolved_value,
        resolvedBy: 'admin',
      },
    });
  } catch (error) {
    console.error('PUT /api/crosscheck/conflicts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve conflict' },
      { status: 500 }
    );
  }
}
