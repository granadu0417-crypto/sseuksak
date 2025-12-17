import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  BillApiClient,
  transformBillToSponsorships,
  generateBillSponsorshipId,
  generateSyncLogId,
} from '@/lib/assembly-api';

/**
 * POST /api/sync/bills
 *
 * 국회 API에서 발의법률안 데이터를 가져와 DB와 동기화
 * 각 의원별 대표발의/공동발의 법안 기록
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
      VALUES (?, 'full', 'bills', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // 국회 API에서 발의법률안 가져오기
    const client = new BillApiClient(apiKey);

    // URL 파라미터에서 대수 확인 (기본값: 22대)
    const url = new URL(request.url);
    const age = parseInt(url.searchParams.get('age') || '22');

    // 샘플 모드 (테스트용)
    const sampleMode = url.searchParams.get('sample') === 'true';

    let rawBills;
    if (sampleMode) {
      // 샘플 모드: 처음 100건만 가져오기
      rawBills = await client.getBillList(age, 1, 100);
    } else {
      // 전체 가져오기
      rawBills = await client.getAllBills(age);
    }

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
    let totalSponsorships = 0;
    const errors: string[] = [];

    // 각 법안 처리
    for (const bill of rawBills) {
      try {
        const sponsorships = transformBillToSponsorships(bill);
        totalSponsorships += sponsorships.length;

        for (const sponsorship of sponsorships) {
          // 발의자 이름으로 정치인 ID 찾기
          const politicianId = politicianMap.get(sponsorship.sponsorName);

          if (!politicianId) {
            // 현역 의원이 아닌 경우 건너뛰기
            skippedRecords++;
            continue;
          }

          // 중복 체크 (의원+의안 조합)
          const existing = await db.prepare(`
            SELECT id FROM bill_sponsorships
            WHERE politician_id = ? AND bill_id = ?
          `).bind(politicianId, sponsorship.billId).first();

          if (existing) {
            // 이미 존재하면 스킵
            continue;
          }

          // 새 기록 추가
          const id = generateBillSponsorshipId();
          await db.prepare(`
            INSERT INTO bill_sponsorships (
              id, politician_id, bill_id, bill_no, bill_name,
              sponsor_type, propose_date, committee, committee_id,
              proc_result, assembly_age, detail_link, data_source
            ) VALUES (
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?,
              ?, ?, ?, 'api'
            )
          `).bind(
            id,
            politicianId,
            sponsorship.billId,
            sponsorship.billNo,
            sponsorship.billName,
            sponsorship.sponsorType,
            sponsorship.proposeDate || null,
            sponsorship.committee || null,
            sponsorship.committeeId || null,
            sponsorship.procResult || null,
            sponsorship.assemblyAge,
            sponsorship.detailLink || null
          ).run();

          newRecords++;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${bill.BILL_ID}: ${errMsg}`);
      }
    }

    // 활동 통계 업데이트
    await updateBillStats(db);

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
      rawBills.length,
      newRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    // API 설정 업데이트
    await db.prepare(`
      UPDATE api_config
      SET last_sync_at = ?,
          next_sync_at = datetime(?, '+24 hours')
      WHERE api_name = 'assembly_bills'
    `).bind(completedAt, completedAt).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        totalBills: rawBills.length,
        totalSponsorships,
        newRecords,
        skippedRecords,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        sampleMode,
      },
    });
  } catch (error) {
    console.error('Bills sync error:', error);

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
 * 의원별 법안 발의 통계 업데이트
 */
async function updateBillStats(db: ReturnType<typeof getDB>) {
  // 각 의원별 법안 발의 통계 계산
  await db.prepare(`
    INSERT OR REPLACE INTO politician_activity_stats (
      politician_id,
      bills_sponsored,
      bills_cosponsored,
      bills_passed,
      last_calculated_at
    )
    SELECT
      p.id as politician_id,
      COALESCE(lead.cnt, 0) as bills_sponsored,
      COALESCE(co.cnt, 0) as bills_cosponsored,
      COALESCE(passed.cnt, 0) as bills_passed,
      datetime('now') as last_calculated_at
    FROM politicians p
    LEFT JOIN (
      SELECT politician_id, COUNT(*) as cnt
      FROM bill_sponsorships
      WHERE sponsor_type = '대표발의'
      GROUP BY politician_id
    ) lead ON p.id = lead.politician_id
    LEFT JOIN (
      SELECT politician_id, COUNT(*) as cnt
      FROM bill_sponsorships
      WHERE sponsor_type = '공동발의'
      GROUP BY politician_id
    ) co ON p.id = co.politician_id
    LEFT JOIN (
      SELECT politician_id, COUNT(*) as cnt
      FROM bill_sponsorships
      WHERE proc_result IN ('원안가결', '수정가결', '대안반영폐기')
      GROUP BY politician_id
    ) passed ON p.id = passed.politician_id
    WHERE p.is_active = 1
  `).run();
}

/**
 * GET /api/sync/bills
 *
 * 발의법률안 동기화 상태 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'bills'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 전체 법안 발의 통계
    const stats = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT bill_id) as unique_bills,
        COUNT(DISTINCT politician_id) as unique_politicians,
        SUM(CASE WHEN sponsor_type = '대표발의' THEN 1 ELSE 0 END) as lead_sponsorships,
        SUM(CASE WHEN sponsor_type = '공동발의' THEN 1 ELSE 0 END) as co_sponsorships
      FROM bill_sponsorships
    `).first();

    // 상위 발의자 (대표발의 기준)
    const topSponsors = await db.prepare(`
      SELECT
        p.name,
        COUNT(*) as bill_count
      FROM bill_sponsorships bs
      JOIN politicians p ON bs.politician_id = p.id
      WHERE bs.sponsor_type = '대표발의'
      GROUP BY bs.politician_id
      ORDER BY bill_count DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        topSponsors: topSponsors.results || [],
        recentSyncs: recentLogs.results || [],
      },
    });
  } catch (error) {
    console.error('GET /api/sync/bills error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
