import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  getCrosscheckEngine,
  generateId,
  type ConflictSeverity,
} from '@/lib/crosscheck-engine';

/**
 * POST /api/crosscheck
 *
 * 크로스체크 실행
 *
 * Query Parameters:
 * - politician_id: 특정 정치인만 체크 (선택)
 * - data_type: politician_info, vote, asset (선택)
 */
export async function POST(request: NextRequest) {
  const logId = generateId('cclog');
  const startedAt = new Date().toISOString();

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

    const db = getDB();
    const engine = getCrosscheckEngine();
    const url = new URL(request.url);
    const politicianId = url.searchParams.get('politician_id');
    const dataType = url.searchParams.get('data_type') || 'politician_info';

    // 로그 시작
    await db
      .prepare(
        `
      INSERT INTO crosscheck_logs (id, check_type, target_politician_id, data_types, status, started_at)
      VALUES (?, ?, ?, ?, 'running', ?)
    `
      )
      .bind(
        logId,
        politicianId ? 'single_politician' : 'full',
        politicianId || null,
        JSON.stringify([dataType]),
        startedAt
      )
      .run();

    let totalCompared = 0;
    let conflictsFound = 0;
    const errors: string[] = [];

    if (politicianId) {
      // 단일 정치인 체크
      try {
        const conflicts = await engine.crosscheckPoliticianInfo(politicianId);
        conflictsFound = conflicts.length;
        totalCompared = 1;
        await engine.updateCrosscheckResult(politicianId);
      } catch (error) {
        errors.push(
          `${politicianId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } else {
      // 전체 정치인 체크
      const politiciansResult = await db
        .prepare('SELECT id FROM politicians LIMIT 100')
        .all<{ id: string }>();

      const politicians = politiciansResult.results || [];

      for (const pol of politicians) {
        try {
          const conflicts = await engine.crosscheckPoliticianInfo(pol.id);
          conflictsFound += conflicts.length;
          totalCompared++;
          await engine.updateCrosscheckResult(pol.id);
        } catch (error) {
          errors.push(
            `${pol.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    // 로그 완료
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.round(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );

    await db
      .prepare(
        `
      UPDATE crosscheck_logs
      SET status = 'completed',
          completed_at = ?,
          duration_seconds = ?,
          total_compared = ?,
          conflicts_found = ?,
          error_message = ?
      WHERE id = ?
    `
      )
      .bind(
        completedAt,
        durationSeconds,
        totalCompared,
        conflictsFound,
        errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
        logId
      )
      .run();

    return NextResponse.json({
      success: true,
      data: {
        logId,
        checkType: politicianId ? 'single_politician' : 'full',
        dataType,
        totalCompared,
        conflictsFound,
        duration: `${durationSeconds}s`,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      },
    });
  } catch (error) {
    console.error('Crosscheck error:', error);

    // 로그 실패 기록
    try {
      const db = getDB();
      await db
        .prepare(
          `
        UPDATE crosscheck_logs
        SET status = 'failed',
            completed_at = datetime('now'),
            error_message = ?
        WHERE id = ?
      `
        )
        .bind(error instanceof Error ? error.message : String(error), logId)
        .run();
    } catch {
      // 로그 업데이트 실패는 무시
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Crosscheck failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crosscheck
 *
 * 크로스체크 현황 조회
 *
 * Query Parameters:
 * - status: verified, has_conflicts, needs_review, insufficient_data (선택)
 * - limit: 결과 수 제한 (기본 50)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // 전체 통계
    const statsResult = await db
      .prepare(
        `
      SELECT
        COUNT(*) as total_politicians,
        COUNT(CASE WHEN cr.id IS NOT NULL THEN 1 END) as checked_politicians,
        SUM(COALESCE(cr.conflict_count, 0)) as total_conflicts,
        SUM(COALESCE(cr.unresolved_conflicts, 0)) as unresolved_conflicts,
        AVG(cr.match_rate) as avg_match_rate,
        COUNT(CASE WHEN cr.total_sources >= 2 THEN 1 END) as multi_source_politicians
      FROM politicians p
      LEFT JOIN crosscheck_results cr ON p.id = cr.politician_id
    `
      )
      .first<{
        total_politicians: number;
        checked_politicians: number;
        total_conflicts: number;
        unresolved_conflicts: number;
        avg_match_rate: number | null;
        multi_source_politicians: number;
      }>();

    // 데이터 소스별 현황
    const sourcesResult = await db
      .prepare(
        `
      SELECT
        ds.id,
        ds.name,
        ds.type,
        ds.authority_score,
        COUNT(DISTINCT rp.politician_id) as politician_count
      FROM data_sources ds
      LEFT JOIN raw_politician_info rp ON ds.id = rp.source_id
      WHERE ds.is_active = 1
      GROUP BY ds.id
      ORDER BY ds.authority_score DESC
    `
      )
      .all<{
        id: string;
        name: string;
        type: string;
        authority_score: number;
        politician_count: number;
      }>();

    // 정치인별 크로스체크 결과
    let resultsQuery = `
      SELECT
        p.id as politician_id,
        p.name as politician_name,
        party.name as party_name,
        COALESCE(cr.total_sources, 0) as total_sources,
        COALESCE(cr.match_rate, 0) as match_rate,
        COALESCE(cr.conflict_count, 0) as conflict_count,
        COALESCE(cr.unresolved_conflicts, 0) as unresolved_conflicts,
        cr.last_checked_at,
        CASE
          WHEN cr.unresolved_conflicts > 5 THEN 'needs_review'
          WHEN cr.unresolved_conflicts > 0 THEN 'has_conflicts'
          WHEN cr.total_sources < 2 THEN 'insufficient_data'
          ELSE 'verified'
        END as verification_status
      FROM politicians p
      LEFT JOIN parties party ON p.party_id = party.id
      LEFT JOIN crosscheck_results cr ON p.id = cr.politician_id
    `;

    if (status) {
      const statusConditions: Record<string, string> = {
        verified:
          "cr.unresolved_conflicts = 0 AND cr.total_sources >= 2",
        has_conflicts:
          "cr.unresolved_conflicts > 0 AND cr.unresolved_conflicts <= 5",
        needs_review: "cr.unresolved_conflicts > 5",
        insufficient_data:
          "cr.total_sources IS NULL OR cr.total_sources < 2",
      };
      if (statusConditions[status]) {
        resultsQuery += ` WHERE ${statusConditions[status]}`;
      }
    }

    resultsQuery += `
      ORDER BY cr.unresolved_conflicts DESC NULLS LAST, p.name
      LIMIT ?
    `;

    const resultsData = await db.prepare(resultsQuery).bind(limit).all<{
      politician_id: string;
      politician_name: string;
      party_name: string | null;
      total_sources: number;
      match_rate: number;
      conflict_count: number;
      unresolved_conflicts: number;
      last_checked_at: string | null;
      verification_status: string;
    }>();

    // 최근 실행 로그
    const recentLogsResult = await db
      .prepare(
        `
      SELECT * FROM crosscheck_logs
      ORDER BY created_at DESC
      LIMIT 5
    `
      )
      .all();

    // 심각도별 불일치 통계
    const severityStatsResult = await db
      .prepare(
        `
      SELECT
        severity,
        COUNT(*) as count,
        COUNT(CASE WHEN status IN ('detected', 'reviewing') THEN 1 END) as unresolved
      FROM data_conflicts
      GROUP BY severity
    `
      )
      .all<{ severity: ConflictSeverity; count: number; unresolved: number }>();

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPoliticians: statsResult?.total_politicians || 0,
          checkedPoliticians: statsResult?.checked_politicians || 0,
          totalConflicts: statsResult?.total_conflicts || 0,
          unresolvedConflicts: statsResult?.unresolved_conflicts || 0,
          avgMatchRate: statsResult?.avg_match_rate
            ? Math.round(statsResult.avg_match_rate * 100) / 100
            : null,
          multiSourcePoliticians: statsResult?.multi_source_politicians || 0,
        },
        sources: sourcesResult.results || [],
        severityStats: severityStatsResult.results || [],
        politicians: resultsData.results || [],
        recentLogs: recentLogsResult.results || [],
        filter: status || 'all',
      },
    });
  } catch (error) {
    console.error('GET /api/crosscheck error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get crosscheck data' },
      { status: 500 }
    );
  }
}
