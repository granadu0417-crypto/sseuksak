import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  AssemblyApiClient,
  extractCommitteeActivities,
  generateCommitteeActivityId,
  generateSyncLogId,
} from '@/lib/assembly-api';

/**
 * POST /api/sync/committees
 *
 * 국회 ALLNAMEMBER API에서 위원회 소속 정보를 추출하여 DB와 동기화
 * 각 의원별 상임위/특별위 소속 정보
 *
 * 데이터 소스: 국회 열린데이터 ALLNAMEMBER API
 * - CMIT_NM: 위원회명
 * - BLNG_CMIT_NM: 소속위원회명
 */
export async function POST(request: NextRequest) {
  const syncLogId = generateSyncLogId();
  const startedAt = new Date().toISOString();
  let db: ReturnType<typeof getDB>;

  try {
    // API 키 확인
    const apiKey = process.env.ASSEMBLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ASSEMBLY_API_KEY not configured' },
        { status: 500 }
      );
    }

    // 동기화 보안 키 확인
    const syncSecret = request.headers.get('x-sync-secret');
    const expectedSecret = process.env.SYNC_SECRET;
    if (expectedSecret && syncSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    db = getDB();

    // 동기화 로그 시작
    await db.prepare(`
      INSERT INTO assembly_sync_logs (id, sync_type, data_type, started_at, status)
      VALUES (?, 'full', 'committees', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // 국회 API에서 현역 의원 데이터 가져오기
    const client = new AssemblyApiClient(apiKey);
    const rawMembers = await client.getAllMembers();

    // 정치인 이름 → ID 매핑 가져오기
    const politiciansResult = await db.prepare(`
      SELECT id, name FROM politicians WHERE is_active = 1
    `).all<{ id: string; name: string }>();

    const politicianMap = new Map<string, string>();
    for (const p of politiciansResult.results || []) {
      politicianMap.set(p.name, p.id);
    }

    // 동기화 통계
    let newRecords = 0;
    let updatedRecords = 0;
    let skippedRecords = 0;
    const errors: string[] = [];
    const committeeCounts = new Map<string, number>();

    // 각 의원의 위원회 활동 처리
    for (const raw of rawMembers) {
      try {
        const activities = extractCommitteeActivities(raw);

        for (const activity of activities) {
          // 의원 이름으로 정치인 ID 찾기
          const politicianId = politicianMap.get(activity.politicianName);

          if (!politicianId) {
            skippedRecords++;
            continue;
          }

          // 위원회별 카운트
          const count = committeeCounts.get(activity.committeeName) || 0;
          committeeCounts.set(activity.committeeName, count + 1);

          // 중복 체크 (의원+위원회 조합)
          const existing = await db.prepare(`
            SELECT id, position FROM committee_activities
            WHERE politician_id = ? AND committee_name = ? AND assembly_age = 22
          `).bind(politicianId, activity.committeeName).first<{ id: string; position: string }>();

          if (existing) {
            // 기존 레코드가 있으면 직위 업데이트 필요한지 확인
            if (existing.position !== activity.position) {
              await db.prepare(`
                UPDATE committee_activities
                SET position = ?, updated_at = datetime('now')
                WHERE id = ?
              `).bind(activity.position, existing.id).run();
              updatedRecords++;
            }
            continue;
          }

          // 새 기록 추가
          const id = generateCommitteeActivityId();
          await db.prepare(`
            INSERT INTO committee_activities (
              id, politician_id, committee_name, committee_id,
              position, is_current, assembly_age, data_source
            ) VALUES (
              ?, ?, ?, NULL,
              ?, 1, 22, 'assembly_api'
            )
          `).bind(
            id,
            politicianId,
            activity.committeeName,
            activity.position
          ).run();

          newRecords++;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${raw.NAAS_NM}: ${errMsg}`);
      }
    }

    // 동기화 로그 완료
    const completedAt = new Date().toISOString();
    await db.prepare(`
      UPDATE assembly_sync_logs
      SET status = 'completed',
          completed_at = ?,
          total_records = ?,
          new_records = ?,
          error_message = ?
      WHERE id = ?
    `).bind(
      completedAt,
      rawMembers.length,
      newRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    // API 설정 업데이트
    await db.prepare(`
      UPDATE api_config
      SET last_sync_at = ?,
          next_sync_at = datetime(?, '+168 hours')
      WHERE api_name = 'assembly_committees'
    `).bind(completedAt, completedAt).run();

    // 위원회별 통계 정리
    const committeeStats = Array.from(committeeCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        totalMembers: rawMembers.length,
        newRecords,
        updatedRecords,
        skippedRecords,
        uniqueCommittees: committeeCounts.size,
        committeeStats: committeeStats.slice(0, 20), // 상위 20개
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        dataSource: 'assembly_api',
      },
    });
  } catch (error) {
    console.error('Committees sync error:', error);

    // 동기화 로그 실패 기록
    if (db!) {
      try {
        await db.prepare(`
          UPDATE assembly_sync_logs
          SET status = 'failed',
              completed_at = datetime('now'),
              error_message = ?
          WHERE id = ?
        `).bind(
          error instanceof Error ? error.message : String(error),
          syncLogId
        ).run();
      } catch (logError) {
        console.error('Failed to update sync log:', logError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        syncLogId,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/committees
 *
 * 위원회 동기화 상태 및 통계 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'committees'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 전체 위원회 활동 통계
    const stats = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT committee_name) as unique_committees,
        COUNT(DISTINCT politician_id) as unique_politicians,
        SUM(CASE WHEN position = '위원장' THEN 1 ELSE 0 END) as chairpersons,
        SUM(CASE WHEN position = '간사' THEN 1 ELSE 0 END) as secretaries,
        SUM(CASE WHEN position = '위원' THEN 1 ELSE 0 END) as members
      FROM committee_activities
      WHERE is_current = 1
    `).first();

    // 위원회별 위원 수
    const committeeBreakdown = await db.prepare(`
      SELECT
        committee_name,
        COUNT(*) as member_count,
        SUM(CASE WHEN position = '위원장' THEN 1 ELSE 0 END) as has_chair,
        SUM(CASE WHEN position = '간사' THEN 1 ELSE 0 END) as secretary_count
      FROM committee_activities
      WHERE is_current = 1
      GROUP BY committee_name
      ORDER BY member_count DESC
      LIMIT 20
    `).all();

    // 다중 위원회 소속 의원 (가장 많은 위원회 소속)
    const multiCommitteeMembers = await db.prepare(`
      SELECT
        p.name,
        COUNT(ca.id) as committee_count,
        GROUP_CONCAT(ca.committee_name, ', ') as committees
      FROM committee_activities ca
      JOIN politicians p ON ca.politician_id = p.id
      WHERE ca.is_current = 1
      GROUP BY ca.politician_id
      HAVING committee_count > 1
      ORDER BY committee_count DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        committeeBreakdown: committeeBreakdown.results || [],
        multiCommitteeMembers: multiCommitteeMembers.results || [],
        recentSyncs: recentLogs.results || [],
        dataSource: 'assembly_api',
      },
    });
  } catch (error) {
    console.error('GET /api/sync/committees error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
