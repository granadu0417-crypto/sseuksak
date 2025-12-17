import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  OpenWatchContributionClient,
  transformContributionTotalData,
  transformDonorData,
  generateContributionId,
  generateDonorId,
  generateContributionSummaryId,
} from '@/lib/openwatch-api';
import { generateSyncLogId } from '@/lib/assembly-api';

/**
 * POST /api/sync/contributions
 *
 * OpenWatch API에서 정치후원금 데이터를 가져와 DB와 동기화
 *
 * Query Parameters:
 * - includeDonors: 고액후원자 포함 (true/false) - 기본값: false
 * - sample: 샘플 모드 (true/false) - 기본값: false
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

    // URL 파라미터 확인
    const url = new URL(request.url);
    const includeDonors = url.searchParams.get('includeDonors') === 'true';
    const sampleMode = url.searchParams.get('sample') === 'true';

    // 동기화 로그 시작
    await db.prepare(`
      INSERT INTO assembly_sync_logs (id, sync_type, data_type, started_at, status)
      VALUES (?, 'full', 'contributions', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // 정치인 이름 → ID 매핑 가져오기
    const politiciansResult = await db.prepare(`
      SELECT id, name FROM politicians WHERE is_active = 1
    `).all<{ id: string; name: string }>();

    const politicianMap = new Map<string, string>();
    for (const p of politiciansResult.results || []) {
      politicianMap.set(p.name, p.id);
    }

    // OpenWatch API에서 후원금 총액 가져오기
    const client = new OpenWatchContributionClient();

    let rawTotals;
    if (sampleMode) {
      const { totals } = await client.getTotals('NATIONAL_ASSEMBLY', undefined, undefined, 1, 100);
      rawTotals = totals;
    } else {
      rawTotals = await client.getAllNationalAssemblyTotals();
    }

    // 동기화 통계
    let newContributionRecords = 0;
    let newDonorRecords = 0;
    let skippedRecords = 0;
    let matchedPoliticians = 0;
    const errors: string[] = [];

    // 후원금 총액 처리
    for (const raw of rawTotals) {
      try {
        const contribution = transformContributionTotalData(raw);

        // 정치인 매핑 (후보자명으로)
        const politicianId = politicianMap.get(contribution.candidateName);

        if (!politicianId) {
          skippedRecords++;
          continue;
        }

        matchedPoliticians++;

        // 중복 체크
        const existing = await db.prepare(`
          SELECT id FROM political_contributions
          WHERE politician_id = ? AND year = ? AND contribution_type = ?
        `).bind(politicianId, contribution.year, contribution.type).first();

        if (existing) {
          // 금액 업데이트
          await db.prepare(`
            UPDATE political_contributions
            SET total_amount = ?, updated_at = datetime('now')
            WHERE id = ?
          `).bind(contribution.totalAmount, (existing as { id: string }).id).run();
          continue;
        }

        // 새 기록 추가
        const id = generateContributionId();
        await db.prepare(`
          INSERT INTO political_contributions (
            id, politician_id, year, contribution_type,
            sido, sigungu, electoral_district, candidate_type,
            party_name, total_amount, openwatch_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          politicianId,
          contribution.year,
          contribution.type,
          contribution.sido,
          contribution.sigungu,
          contribution.electoralDistrict,
          contribution.candidateType,
          contribution.partyName,
          contribution.totalAmount,
          String(contribution.openwatchId)
        ).run();

        newContributionRecords++;

        // 고액후원자 동기화 (옵션)
        if (includeDonors) {
          try {
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));

            const donors = await client.getDonorsForCandidate(contribution.candidateName);

            for (const donorRaw of donors) {
              const donor = transformDonorData(donorRaw);

              // 중복 체크
              const existingDonor = await db.prepare(`
                SELECT id FROM contribution_donors
                WHERE politician_id = ? AND year = ? AND donor_name = ? AND amount = ?
              `).bind(politicianId, donor.year, donor.donorName, donor.amount).first();

              if (existingDonor) continue;

              const donorId = generateDonorId();
              await db.prepare(`
                INSERT INTO contribution_donors (
                  id, contribution_id, politician_id,
                  donor_name, amount, contribution_date,
                  address, job, donor_birthdate,
                  year, contribution_type, openwatch_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                donorId,
                id, // contribution_id
                politicianId,
                donor.donorName,
                donor.amount,
                donor.contributionDate,
                donor.address,
                donor.job,
                donor.donorBirthdate,
                donor.year,
                donor.type,
                String(donor.openwatchId)
              ).run();

              newDonorRecords++;
            }
          } catch (donorError) {
            const errMsg = donorError instanceof Error ? donorError.message : String(donorError);
            errors.push(`후원자(${contribution.candidateName}): ${errMsg}`);
          }
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`후원금 ${raw.candidate}: ${errMsg}`);
      }
    }

    // 후원금 요약 통계 업데이트
    await updateContributionSummaries(db);

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
      rawTotals.length,
      newContributionRecords + newDonorRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        totalRecords: rawTotals.length,
        newContributionRecords,
        newDonorRecords,
        matchedPoliticians,
        skippedRecords,
        sampleMode,
        includeDonors,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        dataSource: 'openwatch',
      },
    });
  } catch (error) {
    console.error('Contributions sync error:', error);

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
 * 후원금 요약 통계 업데이트
 */
async function updateContributionSummaries(db: ReturnType<typeof getDB>) {
  // 정치인별 후원금 요약 계산
  const summaries = await db.prepare(`
    SELECT
      politician_id,
      SUM(total_amount) as total_contributions,
      COUNT(*) as total_years,
      MAX(year) as latest_year,
      AVG(total_amount) as avg_yearly_amount
    FROM political_contributions
    GROUP BY politician_id
  `).all<{
    politician_id: string;
    total_contributions: number;
    total_years: number;
    latest_year: number;
    avg_yearly_amount: number;
  }>();

  for (const summary of summaries.results || []) {
    // 최근 연도 후원금
    const latestAmount = await db.prepare(`
      SELECT total_amount FROM political_contributions
      WHERE politician_id = ? AND year = ?
    `).bind(summary.politician_id, summary.latest_year).first<{ total_amount: number }>();

    // 후원자 수
    const donorCount = await db.prepare(`
      SELECT COUNT(DISTINCT donor_name) as count
      FROM contribution_donors
      WHERE politician_id = ?
    `).bind(summary.politician_id).first<{ count: number }>();

    // 최대 단일 후원금
    const maxDonation = await db.prepare(`
      SELECT MAX(amount) as max_amount
      FROM contribution_donors
      WHERE politician_id = ?
    `).bind(summary.politician_id).first<{ max_amount: number }>();

    // UPSERT
    const existing = await db.prepare(`
      SELECT id FROM politician_contribution_summary WHERE politician_id = ?
    `).bind(summary.politician_id).first();

    if (existing) {
      await db.prepare(`
        UPDATE politician_contribution_summary
        SET total_contributions = ?,
            total_donors = ?,
            latest_year = ?,
            latest_amount = ?,
            avg_yearly_amount = ?,
            max_single_donation = ?,
            updated_at = datetime('now')
        WHERE politician_id = ?
      `).bind(
        summary.total_contributions,
        donorCount?.count || 0,
        summary.latest_year,
        latestAmount?.total_amount || 0,
        Math.round(summary.avg_yearly_amount),
        maxDonation?.max_amount || 0,
        summary.politician_id
      ).run();
    } else {
      const id = generateContributionSummaryId();
      await db.prepare(`
        INSERT INTO politician_contribution_summary (
          id, politician_id, total_contributions, total_donors,
          latest_year, latest_amount, avg_yearly_amount, max_single_donation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        summary.politician_id,
        summary.total_contributions,
        donorCount?.count || 0,
        summary.latest_year,
        latestAmount?.total_amount || 0,
        Math.round(summary.avg_yearly_amount),
        maxDonation?.max_amount || 0
      ).run();
    }
  }
}

/**
 * GET /api/sync/contributions
 *
 * 정치후원금 동기화 상태 및 통계 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'contributions'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 후원금 통계
    const contributionStats = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT politician_id) as unique_politicians,
        COUNT(DISTINCT year) as unique_years,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount
      FROM political_contributions
    `).first();

    // 연도별 통계
    const byYear = await db.prepare(`
      SELECT
        year,
        COUNT(*) as politician_count,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount
      FROM political_contributions
      GROUP BY year
      ORDER BY year DESC
      LIMIT 10
    `).all();

    // 고액후원자 통계
    const donorStats = await db.prepare(`
      SELECT
        COUNT(*) as total_donors,
        COUNT(DISTINCT politician_id) as politicians_with_donors,
        SUM(amount) as total_donated,
        AVG(amount) as avg_donation
      FROM contribution_donors
    `).first();

    // 상위 후원금 수령자
    const topRecipients = await db.prepare(`
      SELECT
        p.name,
        pcs.total_contributions,
        pcs.total_donors,
        pcs.latest_year,
        pcs.latest_amount
      FROM politician_contribution_summary pcs
      JOIN politicians p ON pcs.politician_id = p.id
      ORDER BY pcs.total_contributions DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        contributionStats,
        byYear: byYear.results || [],
        donorStats,
        topRecipients: topRecipients.results || [],
        recentSyncs: recentLogs.results || [],
        dataSource: 'openwatch',
      },
    });
  } catch (error) {
    console.error('GET /api/sync/contributions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
