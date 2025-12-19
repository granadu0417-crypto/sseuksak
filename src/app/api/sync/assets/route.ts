import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  OpenWatchAssetClient,
  transformAssetData,
  generateAssetId,
  generateAssetSummaryId,
  categorizeAssetType,
} from '@/lib/openwatch-api';
import { generateSyncLogId } from '@/lib/assembly-api';

/**
 * POST /api/sync/assets
 *
 * OpenWatch API에서 국회의원 자산정보를 가져와 DB와 동기화
 *
 * Query Parameters:
 * - date: 신고 기준일 (YYYYMM 형식, 예: 202303) - 선택
 * - sample: 샘플 모드 (true/false) - 기본값: false
 *
 * Note: OpenWatch 자산 API는 의원별 필터가 없어 전체 데이터를 가져온 후
 *       의원명으로 매칭합니다.
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
    const reportDate = url.searchParams.get('date') || undefined;
    const sampleMode = url.searchParams.get('sample') === 'true';

    // 동기화 로그 시작
    await db.prepare(`
      INSERT INTO assembly_sync_logs (id, sync_type, data_type, started_at, status)
      VALUES (?, 'full', 'assets', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // 정치인 이름 → ID 매핑 가져오기
    const politiciansResult = await db.prepare(`
      SELECT id, name FROM politicians WHERE is_active = 1
    `).all<{ id: string; name: string }>();

    const politicianMap = new Map<string, string>();
    for (const p of politiciansResult.results || []) {
      politicianMap.set(p.name, p.id);
    }

    // OpenWatch API에서 자산정보 가져오기
    const client = new OpenWatchAssetClient();

    let rawAssets;
    if (sampleMode) {
      // 샘플 모드: 첫 페이지만
      const { assets } = await client.getAssets(reportDate, undefined, undefined, 1, 100);
      rawAssets = assets;
    } else {
      // 전체 조회
      rawAssets = await client.getAllAssets(reportDate);
    }

    // 동기화 통계
    let newRecords = 0;
    let skippedRecords = 0;
    const errors: string[] = [];
    const assetsByPolitician = new Map<string, typeof rawAssets>();

    // 자산을 정치인별로 그룹화 (API에서 memberName이 있다면)
    // Note: OpenWatch API 응답에 memberName이 있다고 가정
    for (const raw of rawAssets) {
      try {
        const asset = transformAssetData(raw, reportDate || new Date().toISOString().slice(0, 7).replace('-', ''));

        // TODO: OpenWatch API 응답에서 의원명 필드 확인 필요
        // 현재는 detail 필드에서 추출하거나 별도 API 호출 필요

        // 임시: 모든 자산을 저장 (의원 매핑은 추후 개선)
        const id = generateAssetId();

        // 중복 체크 (openwatch_id 기준)
        const existing = await db.prepare(`
          SELECT id FROM politician_assets WHERE openwatch_id = ?
        `).bind(String(raw.id)).first();

        if (existing) {
          skippedRecords++;
          continue;
        }

        // Note: 실제 구현에서는 의원명을 API 응답에서 가져와야 함
        // 현재는 자산 데이터만 저장 (politician_id는 NULL)

        await db.prepare(`
          INSERT INTO politician_assets (
            id, politician_id, report_date, asset_type, relation,
            kind, detail, origin_valuation, increased_amount,
            current_valuation, change_reason, openwatch_id
          ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          asset.reportDate,
          asset.assetType,
          asset.relation,
          asset.kind,
          asset.detail,
          asset.originValuation,
          asset.increasedAmount,
          asset.currentValuation,
          asset.changeReason,
          String(asset.openwatchId)
        ).run();

        newRecords++;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`자산 ${raw.id}: ${errMsg}`);
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
      rawAssets.length,
      newRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        totalAssets: rawAssets.length,
        newRecords,
        skippedRecords,
        sampleMode,
        reportDate: reportDate || 'latest',
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        note: 'OpenWatch 자산 API는 의원별 필터가 없어 매핑 작업이 필요합니다. 추후 개선 예정.',
      },
    });
  } catch (error) {
    console.error('Assets sync error:', error);

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
 * GET /api/sync/assets
 *
 * 자산정보 동기화 상태 및 통계 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'assets'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 자산정보 통계
    const assetStats = await db.prepare(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT politician_id) as unique_politicians,
        COUNT(DISTINCT report_date) as unique_dates,
        COUNT(DISTINCT asset_type) as asset_types
      FROM politician_assets
    `).first();

    // 자산 유형별 통계
    const byType = await db.prepare(`
      SELECT
        asset_type,
        COUNT(*) as count,
        SUM(current_valuation) as total_value
      FROM politician_assets
      GROUP BY asset_type
      ORDER BY count DESC
    `).all();

    // 자산 요약 통계 (캐시된 데이터)
    const summaryStats = await db.prepare(`
      SELECT
        COUNT(*) as politicians_with_assets,
        AVG(total_assets) as avg_total_assets,
        MAX(total_assets) as max_total_assets,
        SUM(total_assets) as sum_total_assets
      FROM politician_asset_summary
    `).first();

    return NextResponse.json({
      success: true,
      data: {
        assetStats,
        byType: byType.results || [],
        summaryStats,
        recentSyncs: recentLogs.results || [],
        dataSource: 'openwatch',
      },
    });
  } catch (error) {
    console.error('GET /api/sync/assets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
