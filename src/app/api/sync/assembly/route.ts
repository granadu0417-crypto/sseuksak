import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  AssemblyApiClient,
  transformMemberData,
  mapPartyNameToId,
  generatePoliticianId,
  generateSyncLogId,
  type PoliticianSyncData,
} from '@/lib/assembly-api';

/**
 * POST /api/sync/assembly
 *
 * 국회 API에서 의원 데이터를 가져와 DB와 동기화
 * 보안: 관리자 전용 또는 Cron 호출
 */
export async function POST(request: NextRequest) {
  const syncLogId = generateSyncLogId();
  const startedAt = new Date().toISOString();
  let db: ReturnType<typeof getDB>;

  try {
    // API 키 확인 (환경변수 또는 요청 헤더)
    const apiKey = process.env.ASSEMBLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ASSEMBLY_API_KEY not configured' },
        { status: 500 }
      );
    }

    // 동기화 보안 키 확인 (Cron 또는 관리자 호출)
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
      INSERT INTO assembly_sync_logs (id, sync_type, started_at, status)
      VALUES (?, 'full', ?, 'running')
    `).bind(syncLogId, startedAt).run();

    // 국회 API에서 데이터 가져오기
    const client = new AssemblyApiClient(apiKey);
    const rawMembers = await client.getAllMembers();

    // 데이터 변환
    const members = rawMembers.map(transformMemberData);

    // 기존 의원 데이터 조회
    const existingResult = await db.prepare(`
      SELECT id, unique_key, sync_hash FROM politicians WHERE data_source = 'api'
    `).all<{ id: string; unique_key: string; sync_hash: string }>();
    const existingMap = new Map(
      (existingResult.results || []).map(p => [p.unique_key, p])
    );

    // 동기화 통계
    let newRecords = 0;
    let updatedRecords = 0;
    const errors: string[] = [];
    const processedKeys = new Set<string>();

    // 각 의원 처리
    for (const member of members) {
      try {
        processedKeys.add(member.uniqueKey);
        const existing = existingMap.get(member.uniqueKey);

        if (!existing) {
          // 새 의원 추가
          await insertNewPolitician(db, member, syncLogId);
          newRecords++;
        } else if (existing.sync_hash !== member.syncHash) {
          // 변경된 의원 업데이트
          await updatePolitician(db, existing.id, member, syncLogId);
          updatedRecords++;
        }
        // 해시가 같으면 변경 없음 - 스킵
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${member.name}: ${errMsg}`);
      }
    }

    // 더 이상 API에 없는 의원 비활성화
    let deactivatedCount = 0;
    for (const [uniqueKey, existing] of existingMap) {
      if (!processedKeys.has(uniqueKey)) {
        await db.prepare(`
          UPDATE politicians
          SET is_active = 0, updated_at = datetime('now')
          WHERE id = ?
        `).bind(existing.id).run();

        await db.prepare(`
          INSERT INTO politician_change_history
          (id, politician_id, change_type, sync_log_id)
          VALUES (?, ?, 'deactivated', ?)
        `).bind(
          `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          existing.id,
          syncLogId
        ).run();

        deactivatedCount++;
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
          updated_records = ?,
          deleted_records = ?,
          error_message = ?
      WHERE id = ?
    `).bind(
      completedAt,
      members.length,
      newRecords,
      updatedRecords,
      deactivatedCount,
      errors.length > 0 ? errors.join('; ') : null,
      syncLogId
    ).run();

    // API 설정 업데이트
    await db.prepare(`
      UPDATE api_config
      SET last_sync_at = ?,
          next_sync_at = datetime(?, '+24 hours')
      WHERE api_name = 'national_assembly'
    `).bind(completedAt, completedAt).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        totalRecords: members.length,
        newRecords,
        updatedRecords,
        deactivatedRecords: deactivatedCount,
        errors: errors.length > 0 ? errors : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
      },
    });
  } catch (error) {
    console.error('Assembly sync error:', error);

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
 * 새 정치인 추가
 */
async function insertNewPolitician(
  db: ReturnType<typeof getDB>,
  member: PoliticianSyncData,
  syncLogId: string
) {
  const id = generatePoliticianId();
  const partyId = mapPartyNameToId(member.partyName);

  await db.prepare(`
    INSERT INTO politicians (
      id, name, party_id, region, position,
      birth_date, contact_email, contact_phone, website_url,
      assembly_id, hj_nm, eng_nm, elect_gbn_nm, reele_gbn_nm,
      unique_key, data_source, last_synced_at, sync_hash, is_active
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, 'api', datetime('now'), ?, 1
    )
  `).bind(
    id,
    member.name,
    partyId,
    member.region,
    member.position,
    member.birthDate || null,
    member.contactEmail || null,
    member.contactPhone || null,
    member.websiteUrl || null,
    member.assemblyId,
    member.hjNm || null,
    member.engNm || null,
    member.electGbnNm || null,
    member.reeleGbnNm || null,
    member.uniqueKey,
    member.syncHash
  ).run();

  // 변경 이력 기록
  await db.prepare(`
    INSERT INTO politician_change_history
    (id, politician_id, change_type, sync_log_id)
    VALUES (?, ?, 'created', ?)
  `).bind(
    `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    id,
    syncLogId
  ).run();
}

/**
 * 정치인 정보 업데이트
 */
async function updatePolitician(
  db: ReturnType<typeof getDB>,
  existingId: string,
  member: PoliticianSyncData,
  syncLogId: string
) {
  const partyId = mapPartyNameToId(member.partyName);

  // 기존 데이터 조회 (변경 이력용)
  const existing = await db.prepare(`
    SELECT party_id, region, position FROM politicians WHERE id = ?
  `).bind(existingId).first<{ party_id: string; region: string; position: string }>();

  await db.prepare(`
    UPDATE politicians
    SET party_id = ?,
        region = ?,
        position = ?,
        contact_email = ?,
        contact_phone = ?,
        website_url = ?,
        elect_gbn_nm = ?,
        reele_gbn_nm = ?,
        sync_hash = ?,
        last_synced_at = datetime('now'),
        updated_at = datetime('now'),
        is_active = 1
    WHERE id = ?
  `).bind(
    partyId,
    member.region,
    member.position,
    member.contactEmail || null,
    member.contactPhone || null,
    member.websiteUrl || null,
    member.electGbnNm || null,
    member.reeleGbnNm || null,
    member.syncHash,
    existingId
  ).run();

  // 변경 이력 기록 (주요 필드만)
  if (existing) {
    if (existing.party_id !== partyId) {
      await recordChange(db, existingId, 'party_id', existing.party_id, partyId, syncLogId);
    }
    if (existing.region !== member.region) {
      await recordChange(db, existingId, 'region', existing.region, member.region, syncLogId);
    }
    if (existing.position !== member.position) {
      await recordChange(db, existingId, 'position', existing.position, member.position, syncLogId);
    }
  }
}

async function recordChange(
  db: ReturnType<typeof getDB>,
  politicianId: string,
  fieldName: string,
  oldValue: string | null,
  newValue: string | null,
  syncLogId: string
) {
  await db.prepare(`
    INSERT INTO politician_change_history
    (id, politician_id, change_type, field_name, old_value, new_value, sync_log_id)
    VALUES (?, ?, 'updated', ?, ?, ?, ?)
  `).bind(
    `ch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    politicianId,
    fieldName,
    oldValue,
    newValue,
    syncLogId
  ).run();
}

/**
 * GET /api/sync/assembly
 *
 * 최근 동기화 상태 조회
 */
export async function GET() {
  try {
    const db = getDB();

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // API 설정 조회
    const apiConfig = await db.prepare(`
      SELECT * FROM api_config WHERE api_name = 'national_assembly'
    `).first();

    // 총 의원 수 조회
    const stats = await db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN data_source = 'api' THEN 1 ELSE 0 END) as from_api
      FROM politicians
    `).first<{ total: number; active: number; from_api: number }>();

    return NextResponse.json({
      success: true,
      data: {
        config: apiConfig,
        stats,
        recentSyncs: recentLogs.results || [],
      },
    });
  } catch (error) {
    console.error('GET /api/sync/assembly error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
