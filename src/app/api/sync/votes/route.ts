import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  OpenWatchVoteClient,
  transformOpenWatchVote,
  generateVoteRecordId,
  generateSyncLogId,
} from '@/lib/assembly-api';

/**
 * POST /api/sync/votes
 *
 * OpenWatch API에서 표결 데이터를 가져와 DB와 동기화
 * 각 의원별 찬성/반대/기권/불참 기록
 *
 * 데이터 소스: OpenWatch (https://openwatch.kr)
 * - 국회 원본 데이터를 정제하여 제공하는 민간 서비스
 * - 다중 소스 크로스체크를 위해 활용
 */
export async function POST(request: NextRequest) {
  const syncLogId = generateSyncLogId();
  const startedAt = new Date().toISOString();
  let db: ReturnType<typeof getDB>;

  try {
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
      VALUES (?, 'full', 'votes', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // URL 파라미터 확인
    const url = new URL(request.url);
    const age = parseInt(url.searchParams.get('age') || '22');
    const sampleMode = url.searchParams.get('sample') === 'true';
    const maxPages = sampleMode ? 5 : 50;  // 샘플 모드: 5페이지만

    // OpenWatch API에서 표결정보 가져오기
    const client = new OpenWatchVoteClient();
    const rawVotes = await client.getAllVotes(age, maxPages);

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
    let skippedRecords = 0;
    const errors: string[] = [];

    // 각 표결 기록 처리
    for (const raw of rawVotes) {
      try {
        const vote = transformOpenWatchVote(raw);

        // 의원 이름으로 정치인 ID 찾기
        const politicianId = politicianMap.get(vote.politicianName);

        if (!politicianId) {
          // 현역 의원이 아닌 경우 건너뛰기
          skippedRecords++;
          continue;
        }

        // 중복 체크 (의원+의안 조합)
        const existing = await db.prepare(`
          SELECT id FROM voting_records
          WHERE politician_id = ? AND bill_id = ?
        `).bind(politicianId, vote.billId).first();

        if (existing) {
          // 이미 존재하면 스킵
          continue;
        }

        // 새 기록 추가
        const id = generateVoteRecordId();
        await db.prepare(`
          INSERT INTO voting_records (
            id, politician_id, bill_id, bill_no, bill_name,
            vote_result, vote_date, assembly_age, committee, data_source
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 'openwatch'
          )
        `).bind(
          id,
          politicianId,
          vote.billId,
          null,  // OpenWatch에서는 bill_no 제공 안함
          vote.billName,
          vote.voteResult,
          vote.voteDate || null,
          vote.assemblyAge,
          null,  // committee
        ).run();

        newRecords++;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${raw.id}: ${errMsg}`);
      }
    }

    // 표결 통계 업데이트
    await updateVoteStats(db);

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
      rawVotes.length,
      newRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    // API 설정 업데이트
    await db.prepare(`
      UPDATE api_config
      SET last_sync_at = ?,
          next_sync_at = datetime(?, '+24 hours')
      WHERE api_name = 'assembly_votes'
    `).bind(completedAt, completedAt).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        totalVotes: rawVotes.length,
        newRecords,
        skippedRecords,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        sampleMode,
        dataSource: 'openwatch',
      },
    });
  } catch (error) {
    console.error('Votes sync error:', error);

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
 * 의원별 표결 통계 업데이트
 */
async function updateVoteStats(db: ReturnType<typeof getDB>) {
  // 각 의원별 표결 통계 계산 및 업데이트
  await db.prepare(`
    INSERT OR REPLACE INTO politician_activity_stats (
      politician_id,
      total_votes,
      yes_votes,
      no_votes,
      abstain_votes,
      absent_votes,
      bills_sponsored,
      bills_cosponsored,
      bills_passed,
      last_calculated_at
    )
    SELECT
      p.id as politician_id,
      COALESCE(v.total_votes, 0) as total_votes,
      COALESCE(v.yes_votes, 0) as yes_votes,
      COALESCE(v.no_votes, 0) as no_votes,
      COALESCE(v.abstain_votes, 0) as abstain_votes,
      COALESCE(v.absent_votes, 0) as absent_votes,
      COALESCE(b.sponsored, 0) as bills_sponsored,
      COALESCE(b.cosponsored, 0) as bills_cosponsored,
      COALESCE(b.passed, 0) as bills_passed,
      datetime('now') as last_calculated_at
    FROM politicians p
    LEFT JOIN (
      SELECT
        politician_id,
        COUNT(*) as total_votes,
        SUM(CASE WHEN vote_result = '찬성' THEN 1 ELSE 0 END) as yes_votes,
        SUM(CASE WHEN vote_result = '반대' THEN 1 ELSE 0 END) as no_votes,
        SUM(CASE WHEN vote_result = '기권' THEN 1 ELSE 0 END) as abstain_votes,
        SUM(CASE WHEN vote_result = '불참' THEN 1 ELSE 0 END) as absent_votes
      FROM voting_records
      GROUP BY politician_id
    ) v ON p.id = v.politician_id
    LEFT JOIN (
      SELECT
        politician_id,
        SUM(CASE WHEN sponsor_type = '대표발의' THEN 1 ELSE 0 END) as sponsored,
        SUM(CASE WHEN sponsor_type = '공동발의' THEN 1 ELSE 0 END) as cosponsored,
        SUM(CASE WHEN proc_result IN ('원안가결', '수정가결', '대안반영폐기') THEN 1 ELSE 0 END) as passed
      FROM bill_sponsorships
      GROUP BY politician_id
    ) b ON p.id = b.politician_id
    WHERE p.is_active = 1
  `).run();
}

/**
 * GET /api/sync/votes
 *
 * 표결 동기화 상태 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'votes'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 전체 표결 통계
    const stats = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT bill_id) as unique_bills,
        COUNT(DISTINCT politician_id) as unique_politicians,
        SUM(CASE WHEN vote_result = '찬성' THEN 1 ELSE 0 END) as yes_votes,
        SUM(CASE WHEN vote_result = '반대' THEN 1 ELSE 0 END) as no_votes,
        SUM(CASE WHEN vote_result = '기권' THEN 1 ELSE 0 END) as abstain_votes,
        SUM(CASE WHEN vote_result = '불참' THEN 1 ELSE 0 END) as absent_votes
      FROM voting_records
    `).first();

    // 가장 활발하게 투표한 의원 (찬성+반대+기권)
    const topVoters = await db.prepare(`
      SELECT
        p.name,
        COUNT(*) as vote_count,
        SUM(CASE WHEN vr.vote_result = '찬성' THEN 1 ELSE 0 END) as yes_count,
        SUM(CASE WHEN vr.vote_result = '반대' THEN 1 ELSE 0 END) as no_count,
        SUM(CASE WHEN vr.vote_result = '기권' THEN 1 ELSE 0 END) as abstain_count
      FROM voting_records vr
      JOIN politicians p ON vr.politician_id = p.id
      GROUP BY vr.politician_id
      ORDER BY vote_count DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        topVoters: topVoters.results || [],
        recentSyncs: recentLogs.results || [],
        dataSource: 'openwatch',
      },
    });
  } catch (error) {
    console.error('GET /api/sync/votes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
