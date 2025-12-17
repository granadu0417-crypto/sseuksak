import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import {
  CURRENT_LEADERSHIP,
  generatePartyPositionId,
  getPartyDbId,
  PartyPosition,
  PARTY_CODES,
} from '@/lib/party-scraper';
import { generateSyncLogId } from '@/lib/assembly-api';

/**
 * POST /api/sync/leadership
 *
 * 정당 지도부/당직자 정보를 DB에 동기화
 *
 * Query Parameters:
 * - party: 특정 정당만 동기화 (democratic, ppp, rebuilding, reform)
 * - mode: 동기화 모드 (full: 전체 교체, update: 업데이트만)
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
    const partyFilter = url.searchParams.get('party');
    const mode = url.searchParams.get('mode') || 'full';

    // 동기화 로그 시작
    await db.prepare(`
      INSERT INTO assembly_sync_logs (id, sync_type, data_type, started_at, status)
      VALUES (?, ?, 'leadership', ?, 'running')
    `).bind(syncLogId, mode, startedAt).run();

    // 정치인 이름 → ID 매핑 가져오기
    const politiciansResult = await db.prepare(`
      SELECT id, name FROM politicians
    `).all<{ id: string; name: string }>();

    const politicianMap = new Map<string, string>();
    for (const p of politiciansResult.results || []) {
      politicianMap.set(p.name, p.id);
    }

    // 정당 ID 매핑 확인
    const partiesResult = await db.prepare(`
      SELECT id, name FROM parties
    `).all<{ id: string; name: string }>();

    const partyMap = new Map<string, string>();
    for (const p of partiesResult.results || []) {
      partyMap.set(p.id, p.name);
    }

    // 필터링된 지도부 데이터
    let leadershipData = CURRENT_LEADERSHIP;
    if (partyFilter) {
      const partyCode = `party_${partyFilter}` as keyof typeof PARTY_CODES;
      leadershipData = CURRENT_LEADERSHIP.filter(p =>
        p.partyId === partyCode || p.partyId.includes(partyFilter)
      );
    }

    // 통계
    let newRecords = 0;
    let updatedRecords = 0;
    let matchedPoliticians = 0;
    let unmatchedPoliticians: string[] = [];
    const errors: string[] = [];

    // 전체 교체 모드일 경우 기존 현직 데이터 비활성화
    if (mode === 'full') {
      if (partyFilter) {
        await db.prepare(`
          UPDATE party_positions
          SET is_current = 0, end_date = date('now'), updated_at = datetime('now')
          WHERE party_id LIKE ? AND is_current = 1
        `).bind(`%${partyFilter}%`).run();
      } else {
        await db.prepare(`
          UPDATE party_positions
          SET is_current = 0, end_date = date('now'), updated_at = datetime('now')
          WHERE is_current = 1
        `).run();
      }
    }

    // 당직자 데이터 처리
    for (const position of leadershipData) {
      try {
        // 정당 ID 확인
        const partyId = getPartyDbId(position.partyId as any);
        if (!partyMap.has(partyId)) {
          errors.push(`정당 없음: ${position.partyId}`);
          continue;
        }

        // 정치인 매핑
        const politicianId = politicianMap.get(position.politicianName);
        if (politicianId) {
          matchedPoliticians++;
        } else {
          unmatchedPoliticians.push(position.politicianName);
        }

        // 중복 체크 (같은 정당, 같은 직책 유형, 같은 사람, 같은 시작일)
        const existing = await db.prepare(`
          SELECT id FROM party_positions
          WHERE party_id = ?
            AND position_type_id = ?
            AND (politician_id = ? OR (politician_id IS NULL AND ? IS NULL))
            AND (start_date = ? OR (start_date IS NULL AND ? IS NULL))
        `).bind(
          partyId,
          position.positionTypeId,
          politicianId || null,
          politicianId || null,
          position.startDate || null,
          position.startDate || null
        ).first<{ id: string }>();

        if (existing) {
          // 기존 레코드 업데이트
          await db.prepare(`
            UPDATE party_positions
            SET position_name = ?,
                is_current = ?,
                end_date = ?,
                appointment_type = ?,
                term_number = ?,
                region = ?,
                data_source = ?,
                source_url = ?,
                updated_at = datetime('now')
            WHERE id = ?
          `).bind(
            position.positionName,
            position.isCurrent ? 1 : 0,
            position.endDate || null,
            position.appointmentType,
            position.termNumber || null,
            position.region || null,
            position.dataSource,
            position.sourceUrl || null,
            existing.id
          ).run();
          updatedRecords++;
        } else {
          // 새 레코드 삽입
          const id = generatePartyPositionId();
          await db.prepare(`
            INSERT INTO party_positions (
              id, party_id, politician_id, position_type_id, position_name,
              start_date, end_date, is_current, appointment_type, term_number,
              region, data_source, source_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            partyId,
            politicianId || null,
            position.positionTypeId,
            position.positionName,
            position.startDate || null,
            position.endDate || null,
            position.isCurrent ? 1 : 0,
            position.appointmentType,
            position.termNumber || null,
            position.region || null,
            position.dataSource,
            position.sourceUrl || null
          ).run();
          newRecords++;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${position.politicianName}(${position.positionName}): ${errMsg}`);
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
      leadershipData.length,
      newRecords + updatedRecords,
      errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
      syncLogId
    ).run();

    return NextResponse.json({
      success: true,
      data: {
        syncLogId,
        mode,
        partyFilter: partyFilter || 'all',
        totalRecords: leadershipData.length,
        newRecords,
        updatedRecords,
        matchedPoliticians,
        unmatchedPoliticians: unmatchedPoliticians.length > 0 ? unmatchedPoliticians : undefined,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        duration: `${(Date.now() - new Date(startedAt).getTime()) / 1000}s`,
        dataSource: 'wiki',
      },
    });
  } catch (error) {
    console.error('Leadership sync error:', error);

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
 * GET /api/sync/leadership
 *
 * 정당 지도부 동기화 상태 및 현재 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const url = new URL(request.url);
    const partyFilter = url.searchParams.get('party');

    // 최근 동기화 로그 조회
    const recentLogs = await db.prepare(`
      SELECT * FROM assembly_sync_logs
      WHERE data_type = 'leadership'
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 현재 지도부 통계
    let statsQuery = `
      SELECT
        COUNT(*) as total_positions,
        COUNT(DISTINCT party_id) as unique_parties,
        COUNT(DISTINCT politician_id) as unique_politicians,
        COUNT(CASE WHEN politician_id IS NOT NULL THEN 1 END) as matched_politicians,
        COUNT(CASE WHEN politician_id IS NULL THEN 1 END) as unmatched_politicians
      FROM party_positions
      WHERE is_current = 1
    `;

    if (partyFilter) {
      statsQuery += ` AND party_id LIKE '%${partyFilter}%'`;
    }

    const stats = await db.prepare(statsQuery).first();

    // 정당별 현재 지도부
    let leadershipQuery = `
      SELECT
        pp.id,
        p.name as party_name,
        p.color as party_color,
        ppt.name as position_type,
        ppt.level as position_level,
        pp.position_name,
        pp.term_number,
        pp.appointment_type,
        pp.start_date,
        pol.id as politician_id,
        pol.name as politician_name,
        pol.avatar_url as politician_avatar,
        pp.region
      FROM party_positions pp
      JOIN parties p ON pp.party_id = p.id
      JOIN party_position_types ppt ON pp.position_type_id = ppt.id
      LEFT JOIN politicians pol ON pp.politician_id = pol.id
      WHERE pp.is_current = 1
    `;

    if (partyFilter) {
      leadershipQuery += ` AND pp.party_id LIKE '%${partyFilter}%'`;
    }

    leadershipQuery += ` ORDER BY p.id, ppt.level, pp.position_name`;

    const currentLeadership = await db.prepare(leadershipQuery).all();

    // 당대표 목록
    const partyLeaders = await db.prepare(`
      SELECT
        p.name as party_name,
        p.color as party_color,
        pp.position_name,
        pol.name as politician_name,
        pol.avatar_url
      FROM party_positions pp
      JOIN parties p ON pp.party_id = p.id
      LEFT JOIN politicians pol ON pp.politician_id = pol.id
      WHERE pp.is_current = 1
        AND pp.position_type_id = 'pos_party_leader'
      ORDER BY p.name
    `).all();

    // 원내대표 목록
    const floorLeaders = await db.prepare(`
      SELECT
        p.name as party_name,
        p.color as party_color,
        pp.position_name,
        pol.name as politician_name,
        pol.avatar_url
      FROM party_positions pp
      JOIN parties p ON pp.party_id = p.id
      LEFT JOIN politicians pol ON pp.politician_id = pol.id
      WHERE pp.is_current = 1
        AND pp.position_type_id = 'pos_floor_leader'
      ORDER BY p.name
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        partyLeaders: partyLeaders.results || [],
        floorLeaders: floorLeaders.results || [],
        currentLeadership: currentLeadership.results || [],
        recentSyncs: recentLogs.results || [],
        dataSource: 'wiki',
        filter: partyFilter || 'all',
      },
    });
  } catch (error) {
    console.error('GET /api/sync/leadership error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get leadership data' },
      { status: 500 }
    );
  }
}
