import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  NecWinnerApiClient,
  NecPromiseApiClient,
  transformWinnerData,
  extractPromises,
  generateElectionHistoryId,
  generateElectionPromiseId,
  ELECTIONS,
} from '@/lib/nec-api';
import { generateSyncLogId } from '@/lib/assembly-api';

/**
 * POST /api/sync/elections
 *
 * 선관위 API에서 당선인 정보 및 공약을 가져와 DB와 동기화
 *
 * 데이터 소스: 중앙선거관리위원회 공공데이터 API
 * - 당선인 정보: WinnerInfoInqireService2
 * - 선거공약 정보: ElecPrmsInfoInqireService
 *
 * Query Parameters:
 * - election: 선거 (22대, 21대 등) - 기본값: 22대
 * - includePromises: 공약 포함 여부 (true/false) - 기본값: false
 */
export async function POST(request: NextRequest) {
  const syncLogId = generateSyncLogId();
  const startedAt = new Date().toISOString();
  let db: ReturnType<typeof getDB>;

  try {
    // API 키 확인
    const apiKey = process.env.NEC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'NEC_API_KEY not configured',
          message: '선관위 API 키가 설정되지 않았습니다. 공공데이터포털에서 API 키를 발급받아 NEC_API_KEY 환경변수로 설정해주세요.',
          apiUrl: 'https://www.data.go.kr/data/15000864/openapi.do',
        },
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

    // URL 파라미터 확인
    const url = new URL(request.url);
    const electionParam = url.searchParams.get('election') || '22대';
    const includePromises = url.searchParams.get('includePromises') === 'true';

    // 선거 정보 조회
    const electionInfo = ELECTIONS[electionParam as keyof typeof ELECTIONS];
    if (!electionInfo) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown election: ${electionParam}`,
          availableElections: Object.keys(ELECTIONS),
        },
        { status: 400 }
      );
    }

    // 동기화 로그 시작
    await db.prepare(`
      INSERT INTO assembly_sync_logs (id, sync_type, data_type, started_at, status)
      VALUES (?, 'full', 'elections', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // 정치인 이름 → ID 매핑 가져오기
    const politiciansResult = await db.prepare(`
      SELECT id, name, region FROM politicians WHERE is_active = 1
    `).all<{ id: string; name: string; region: string }>();

    const politicianMap = new Map<string, string>();
    const politicianByRegion = new Map<string, string>();
    for (const p of politiciansResult.results || []) {
      politicianMap.set(p.name, p.id);
      // 이름+선거구로도 매핑 (동명이인 대응)
      if (p.region) {
        politicianByRegion.set(`${p.name}_${p.region}`, p.id);
      }
    }

    // 선관위 API에서 당선인 정보 가져오기
    const winnerClient = new NecWinnerApiClient(apiKey);
    const rawWinners = await winnerClient.getAllWinners(electionInfo.sgId, '2');

    // 동기화 통계
    let newHistoryRecords = 0;
    let newPromiseRecords = 0;
    let skippedRecords = 0;
    const errors: string[] = [];
    const candidateIds: { politicianId: string; candidateId: string; name: string }[] = [];

    // 각 당선인 처리
    for (const raw of rawWinners) {
      try {
        const winner = transformWinnerData(raw, electionInfo.date, electionInfo.assemblyAge);

        // 의원 이름으로 정치인 ID 찾기 (이름+선거구 우선)
        let politicianId = politicianByRegion.get(`${winner.name}_${winner.constituency}`);
        if (!politicianId) {
          politicianId = politicianMap.get(winner.name);
        }

        if (!politicianId) {
          // 현역 의원이 아닌 경우 (재선되지 않은 전 의원 등)
          skippedRecords++;
          continue;
        }

        // 후보자 ID 저장 (공약 조회용)
        candidateIds.push({
          politicianId,
          candidateId: winner.candidateId,
          name: winner.name,
        });

        // 중복 체크
        const existing = await db.prepare(`
          SELECT id FROM election_history
          WHERE politician_id = ? AND election_id = ?
        `).bind(politicianId, winner.electionId).first();

        if (existing) {
          continue;
        }

        // 새 기록 추가
        const id = generateElectionHistoryId();
        await db.prepare(`
          INSERT INTO election_history (
            id, politician_id, election_id, election_type, election_date,
            constituency, sido_name, party_name, vote_count, vote_rate,
            is_elected, candidate_id, candidate_no, job, education, career,
            assembly_age, data_source
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, 'nec_api'
          )
        `).bind(
          id,
          politicianId,
          winner.electionId,
          winner.electionType,
          winner.electionDate,
          winner.constituency,
          winner.sidoName,
          winner.partyName,
          winner.voteCount,
          winner.voteRate,
          winner.isElected ? 1 : 0,
          winner.candidateId,
          winner.candidateNo,
          winner.job,
          winner.education,
          winner.career,
          winner.assemblyAge
        ).run();

        newHistoryRecords++;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${raw.name}: ${errMsg}`);
      }
    }

    // 공약 동기화 (옵션)
    if (includePromises && candidateIds.length > 0) {
      const promiseClient = new NecPromiseApiClient(apiKey);

      for (const { politicianId, candidateId, name } of candidateIds) {
        try {
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));

          const rawPromise = await promiseClient.getPromises(
            electionInfo.sgId,
            '2',
            candidateId
          );

          if (!rawPromise) continue;

          const promises = extractPromises(rawPromise);

          // election_history_id 조회
          const electionHistory = await db.prepare(`
            SELECT id FROM election_history
            WHERE politician_id = ? AND election_id = ?
          `).bind(politicianId, electionInfo.sgId).first<{ id: string }>();

          for (const promise of promises) {
            // 중복 체크
            const existingPromise = await db.prepare(`
              SELECT id FROM election_promises
              WHERE politician_id = ? AND election_id = ? AND promise_no = ?
            `).bind(politicianId, electionInfo.sgId, promise.promiseNo).first();

            if (existingPromise) continue;

            const id = generateElectionPromiseId();
            await db.prepare(`
              INSERT INTO election_promises (
                id, politician_id, election_history_id, promise_no,
                category, title, content, election_id, data_source
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'nec_api')
            `).bind(
              id,
              politicianId,
              electionHistory?.id || null,
              promise.promiseNo,
              promise.category,
              promise.title,
              promise.content,
              electionInfo.sgId
            ).run();

            newPromiseRecords++;
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          errors.push(`공약(${name}): ${errMsg}`);
        }
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
      rawWinners.length,
      newHistoryRecords + newPromiseRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        election: electionParam,
        electionId: electionInfo.sgId,
        totalWinners: rawWinners.length,
        newHistoryRecords,
        newPromiseRecords,
        skippedRecords,
        promisesIncluded: includePromises,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        dataSource: 'nec_api',
      },
    });
  } catch (error) {
    console.error('Elections sync error:', error);

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
 * GET /api/sync/elections
 *
 * 선거 데이터 동기화 상태 및 통계 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'elections'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 선거 이력 통계
    const historyStats = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT politician_id) as unique_politicians,
        COUNT(DISTINCT election_id) as unique_elections,
        SUM(CASE WHEN is_elected = 1 THEN 1 ELSE 0 END) as elected_count,
        AVG(vote_rate) as avg_vote_rate
      FROM election_history
    `).first();

    // 선거별 당선인 수
    const byElection = await db.prepare(`
      SELECT
        e.name as election_name,
        eh.election_id,
        COUNT(*) as winner_count,
        AVG(eh.vote_rate) as avg_vote_rate
      FROM election_history eh
      JOIN elections e ON eh.election_id = e.id
      GROUP BY eh.election_id
      ORDER BY eh.election_date DESC
    `).all();

    // 공약 통계
    const promiseStats = await db.prepare(`
      SELECT
        COUNT(*) as total_promises,
        COUNT(DISTINCT politician_id) as politicians_with_promises,
        COUNT(DISTINCT category) as unique_categories
      FROM election_promises
    `).first();

    // 공약 분야별 통계
    const promisesByCategory = await db.prepare(`
      SELECT
        category,
        COUNT(*) as count
      FROM election_promises
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        historyStats,
        byElection: byElection.results || [],
        promiseStats,
        promisesByCategory: promisesByCategory.results || [],
        recentSyncs: recentLogs.results || [],
        dataSource: 'nec_api',
        apiKeyConfigured: !!process.env.NEC_API_KEY,
      },
    });
  } catch (error) {
    console.error('GET /api/sync/elections error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
