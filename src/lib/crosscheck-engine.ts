/**
 * 크로스체크 엔진
 *
 * 다중 데이터 소스 비교 및 불일치 감지 시스템
 *
 * 주요 기능:
 * - 소스별 raw_data 저장
 * - 데이터 비교 알고리즘 (exact, fuzzy, numeric, date)
 * - 불일치 감지 및 기록
 * - 크로스체크 결과 집계
 */

import { getDB } from './db';
import crypto from 'crypto';

// =====================================
// 타입 정의
// =====================================

export type DataSourceType = 'government' | 'private' | 'party' | 'media';
export type ComparisonType = 'exact' | 'fuzzy' | 'numeric_tolerance' | 'date';
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ConflictStatus = 'detected' | 'reviewing' | 'resolved' | 'ignored';
export type VerificationStatus = 'verified' | 'has_conflicts' | 'needs_review' | 'insufficient_data';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  authorityScore: number;
}

export interface RawPoliticianInfo {
  politicianId: string;
  sourceId: string;
  name: string;
  nameHanja?: string;
  nameEn?: string;
  birthDate?: string;
  gender?: string;
  partyName?: string;
  region?: string;
  position?: string;
  email?: string;
  phone?: string;
  rawJson?: object;
}

export interface RawVoteInfo {
  politicianId: string;
  sourceId: string;
  billId: string;
  billName?: string;
  voteDate?: string;
  voteResult: string;
  rawJson?: object;
}

export interface RawAssetInfo {
  politicianId: string;
  sourceId: string;
  reportYear: number;
  totalAssets?: number;
  realEstate?: number;
  securities?: number;
  deposits?: number;
  debts?: number;
  rawJson?: object;
}

export interface DataConflict {
  id: string;
  politicianId: string;
  dataType: string;
  fieldName: string;
  source1Id: string;
  source1Value: string | null;
  source2Id: string;
  source2Value: string | null;
  severity: ConflictSeverity;
  status: ConflictStatus;
  detectedAt: string;
}

export interface CrosscheckResult {
  politicianId: string;
  totalSources: number;
  sourceIds: string[];
  matchRate: number;
  conflictCount: number;
  criticalConflicts: number;
  unresolvedConflicts: number;
  reliabilityScore?: number;
}

export interface ComparisonRule {
  id: string;
  dataType: string;
  fieldName: string;
  comparisonType: ComparisonType;
  tolerance?: number;
  fuzzyThreshold?: number;
  weight: number;
  severity: ConflictSeverity;
}

// =====================================
// ID 생성 유틸리티
// =====================================

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateHash(data: object): string {
  const str = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('md5').update(str).digest('hex');
}

// =====================================
// 비교 알고리즘
// =====================================

/**
 * 정확한 일치 비교
 */
export function compareExact(value1: string | null, value2: string | null): boolean {
  if (value1 === null && value2 === null) return true;
  if (value1 === null || value2 === null) return false;
  return value1.trim().toLowerCase() === value2.trim().toLowerCase();
}

/**
 * 퍼지 문자열 비교 (Levenshtein 기반 유사도)
 */
export function compareFuzzy(
  value1: string | null,
  value2: string | null,
  threshold: number = 0.9
): boolean {
  if (value1 === null && value2 === null) return true;
  if (value1 === null || value2 === null) return false;

  const s1 = value1.trim().toLowerCase();
  const s2 = value2.trim().toLowerCase();

  if (s1 === s2) return true;

  const similarity = calculateSimilarity(s1, s2);
  return similarity >= threshold;
}

/**
 * Levenshtein 거리 기반 유사도 계산
 */
function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
}

/**
 * 숫자 비교 (허용 오차 포함)
 */
export function compareNumeric(
  value1: number | null,
  value2: number | null,
  tolerance: number = 0.01
): boolean {
  if (value1 === null && value2 === null) return true;
  if (value1 === null || value2 === null) return false;
  if (value1 === 0 && value2 === 0) return true;

  const maxVal = Math.max(Math.abs(value1), Math.abs(value2));
  if (maxVal === 0) return true;

  const diff = Math.abs(value1 - value2);
  return diff / maxVal <= tolerance;
}

/**
 * 날짜 비교
 */
export function compareDate(value1: string | null, value2: string | null): boolean {
  if (value1 === null && value2 === null) return true;
  if (value1 === null || value2 === null) return false;

  // YYYY-MM-DD 또는 YYYYMMDD 형식 정규화
  const normalize = (d: string) => d.replace(/[-\/]/g, '').slice(0, 8);
  return normalize(value1) === normalize(value2);
}

/**
 * 비교 규칙에 따른 값 비교
 */
export function compareValues(
  value1: string | number | null,
  value2: string | number | null,
  rule: ComparisonRule
): boolean {
  switch (rule.comparisonType) {
    case 'exact':
      return compareExact(String(value1 ?? ''), String(value2 ?? ''));
    case 'fuzzy':
      return compareFuzzy(
        String(value1 ?? ''),
        String(value2 ?? ''),
        rule.fuzzyThreshold ?? 0.9
      );
    case 'numeric_tolerance':
      return compareNumeric(
        value1 as number,
        value2 as number,
        rule.tolerance ?? 0.01
      );
    case 'date':
      return compareDate(String(value1 ?? ''), String(value2 ?? ''));
    default:
      return compareExact(String(value1 ?? ''), String(value2 ?? ''));
  }
}

// =====================================
// 크로스체크 엔진 클래스
// =====================================

export class CrosscheckEngine {
  private db: ReturnType<typeof getDB>;

  constructor() {
    this.db = getDB();
  }

  // =====================================
  // Raw Data 저장
  // =====================================

  /**
   * 정치인 기본정보 raw 데이터 저장
   */
  async saveRawPoliticianInfo(data: RawPoliticianInfo): Promise<string> {
    const id = generateId('raw_pol');
    const hash = generateHash({
      name: data.name,
      nameHanja: data.nameHanja,
      birthDate: data.birthDate,
      partyName: data.partyName,
      region: data.region,
    });

    await this.db
      .prepare(
        `
      INSERT INTO raw_politician_info (
        id, politician_id, source_id, name, name_hanja, name_en,
        birth_date, gender, party_name, region, position,
        email, phone, raw_json, hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(politician_id, source_id) DO UPDATE SET
        name = excluded.name,
        name_hanja = excluded.name_hanja,
        birth_date = excluded.birth_date,
        party_name = excluded.party_name,
        region = excluded.region,
        raw_json = excluded.raw_json,
        hash = excluded.hash,
        fetched_at = datetime('now')
    `
      )
      .bind(
        id,
        data.politicianId,
        data.sourceId,
        data.name,
        data.nameHanja || null,
        data.nameEn || null,
        data.birthDate || null,
        data.gender || null,
        data.partyName || null,
        data.region || null,
        data.position || null,
        data.email || null,
        data.phone || null,
        data.rawJson ? JSON.stringify(data.rawJson) : null,
        hash
      )
      .run();

    return id;
  }

  /**
   * 표결 정보 raw 데이터 저장
   */
  async saveRawVoteInfo(data: RawVoteInfo): Promise<string> {
    const id = generateId('raw_vote');
    const hash = generateHash({
      billId: data.billId,
      voteDate: data.voteDate,
      voteResult: data.voteResult,
    });

    await this.db
      .prepare(
        `
      INSERT INTO raw_vote_info (
        id, politician_id, source_id, bill_id, bill_name,
        vote_date, vote_result, raw_json, hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(politician_id, source_id, bill_id) DO UPDATE SET
        bill_name = excluded.bill_name,
        vote_date = excluded.vote_date,
        vote_result = excluded.vote_result,
        raw_json = excluded.raw_json,
        hash = excluded.hash,
        fetched_at = datetime('now')
    `
      )
      .bind(
        id,
        data.politicianId,
        data.sourceId,
        data.billId,
        data.billName || null,
        data.voteDate || null,
        data.voteResult,
        data.rawJson ? JSON.stringify(data.rawJson) : null,
        hash
      )
      .run();

    return id;
  }

  /**
   * 자산 정보 raw 데이터 저장
   */
  async saveRawAssetInfo(data: RawAssetInfo): Promise<string> {
    const id = generateId('raw_asset');
    const hash = generateHash({
      reportYear: data.reportYear,
      totalAssets: data.totalAssets,
      realEstate: data.realEstate,
    });

    await this.db
      .prepare(
        `
      INSERT INTO raw_asset_info (
        id, politician_id, source_id, report_year, total_assets,
        real_estate, securities, deposits, debts, raw_json, hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(politician_id, source_id, report_year) DO UPDATE SET
        total_assets = excluded.total_assets,
        real_estate = excluded.real_estate,
        securities = excluded.securities,
        deposits = excluded.deposits,
        debts = excluded.debts,
        raw_json = excluded.raw_json,
        hash = excluded.hash,
        fetched_at = datetime('now')
    `
      )
      .bind(
        id,
        data.politicianId,
        data.sourceId,
        data.reportYear,
        data.totalAssets || null,
        data.realEstate || null,
        data.securities || null,
        data.deposits || null,
        data.debts || null,
        data.rawJson ? JSON.stringify(data.rawJson) : null,
        hash
      )
      .run();

    return id;
  }

  // =====================================
  // 불일치 감지
  // =====================================

  /**
   * 정치인 기본정보 크로스체크
   */
  async crosscheckPoliticianInfo(politicianId: string): Promise<DataConflict[]> {
    // 해당 정치인의 모든 소스 데이터 조회
    const rawDataResult = await this.db
      .prepare(
        `
      SELECT * FROM raw_politician_info
      WHERE politician_id = ?
      ORDER BY source_id
    `
      )
      .bind(politicianId)
      .all<{
        source_id: string;
        name: string;
        name_hanja: string | null;
        birth_date: string | null;
        party_name: string | null;
        region: string | null;
      }>();

    const rawData = rawDataResult.results || [];
    if (rawData.length < 2) return []; // 비교할 소스가 2개 미만

    // 비교 규칙 조회
    const rulesResult = await this.db
      .prepare(
        `
      SELECT * FROM comparison_rules
      WHERE data_type = 'politician_info' AND is_active = 1
    `
      )
      .all<ComparisonRule>();
    const rules = rulesResult.results || [];

    const conflicts: DataConflict[] = [];

    // 모든 소스 쌍에 대해 비교
    for (let i = 0; i < rawData.length; i++) {
      for (let j = i + 1; j < rawData.length; j++) {
        const data1 = rawData[i];
        const data2 = rawData[j];

        // 각 필드별 비교
        for (const rule of rules) {
          const fieldMap: Record<string, string> = {
            name: 'name',
            name_hanja: 'name_hanja',
            birth_date: 'birth_date',
            party_name: 'party_name',
            region: 'region',
          };

          const dbField = fieldMap[rule.fieldName];
          if (!dbField) continue;

          const value1 = (data1 as Record<string, unknown>)[dbField] as string | null;
          const value2 = (data2 as Record<string, unknown>)[dbField] as string | null;

          // 둘 다 null이면 스킵
          if (value1 === null && value2 === null) continue;

          const isMatch = compareValues(value1, value2, rule as ComparisonRule);

          if (!isMatch) {
            const conflict = await this.recordConflict({
              politicianId,
              dataType: 'politician_info',
              fieldName: rule.fieldName,
              source1Id: data1.source_id,
              source1Value: value1,
              source2Id: data2.source_id,
              source2Value: value2,
              severity: rule.severity as ConflictSeverity,
            });
            if (conflict) conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * 불일치 기록
   */
  async recordConflict(params: {
    politicianId: string;
    dataType: string;
    fieldName: string;
    source1Id: string;
    source1Value: string | null;
    source2Id: string;
    source2Value: string | null;
    severity: ConflictSeverity;
  }): Promise<DataConflict | null> {
    const id = generateId('conflict');

    try {
      await this.db
        .prepare(
          `
        INSERT INTO data_conflicts (
          id, politician_id, data_type, field_name,
          source1_id, source1_value, source2_id, source2_value,
          severity, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'detected')
        ON CONFLICT(politician_id, data_type, field_name, source1_id, source2_id)
        DO UPDATE SET
          source1_value = excluded.source1_value,
          source2_value = excluded.source2_value,
          severity = excluded.severity,
          detected_at = datetime('now')
          WHERE status != 'resolved'
      `
        )
        .bind(
          id,
          params.politicianId,
          params.dataType,
          params.fieldName,
          params.source1Id,
          params.source1Value,
          params.source2Id,
          params.source2Value,
          params.severity
        )
        .run();

      return {
        id,
        politicianId: params.politicianId,
        dataType: params.dataType,
        fieldName: params.fieldName,
        source1Id: params.source1Id,
        source1Value: params.source1Value,
        source2Id: params.source2Id,
        source2Value: params.source2Value,
        severity: params.severity,
        status: 'detected',
        detectedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  // =====================================
  // 크로스체크 결과 집계
  // =====================================

  /**
   * 정치인별 크로스체크 결과 업데이트
   */
  async updateCrosscheckResult(politicianId: string): Promise<CrosscheckResult> {
    // 소스 수 및 목록
    const sourcesResult = await this.db
      .prepare(
        `
      SELECT DISTINCT source_id FROM raw_politician_info WHERE politician_id = ?
      UNION
      SELECT DISTINCT source_id FROM raw_vote_info WHERE politician_id = ?
      UNION
      SELECT DISTINCT source_id FROM raw_asset_info WHERE politician_id = ?
    `
      )
      .bind(politicianId, politicianId, politicianId)
      .all<{ source_id: string }>();

    const sourceIds = (sourcesResult.results || []).map((r) => r.source_id);

    // 불일치 통계
    const conflictStats = await this.db
      .prepare(
        `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN status IN ('detected', 'reviewing') THEN 1 ELSE 0 END) as unresolved
      FROM data_conflicts
      WHERE politician_id = ?
    `
      )
      .bind(politicianId)
      .first<{ total: number; critical: number; unresolved: number }>();

    // 일치율 계산 (간단한 버전 - 추후 개선)
    const totalFields = 5; // name, name_hanja, birth_date, party_name, region
    const matchRate =
      sourceIds.length < 2
        ? 0
        : Math.max(0, 1 - (conflictStats?.total || 0) / (totalFields * sourceIds.length));

    const result: CrosscheckResult = {
      politicianId,
      totalSources: sourceIds.length,
      sourceIds,
      matchRate: Math.round(matchRate * 100) / 100,
      conflictCount: conflictStats?.total || 0,
      criticalConflicts: conflictStats?.critical || 0,
      unresolvedConflicts: conflictStats?.unresolved || 0,
    };

    // DB 업데이트
    const id = generateId('ccr');
    await this.db
      .prepare(
        `
      INSERT INTO crosscheck_results (
        id, politician_id, total_sources, source_ids, match_rate,
        conflict_count, critical_conflicts, unresolved_conflicts,
        last_checked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(politician_id) DO UPDATE SET
        total_sources = excluded.total_sources,
        source_ids = excluded.source_ids,
        match_rate = excluded.match_rate,
        conflict_count = excluded.conflict_count,
        critical_conflicts = excluded.critical_conflicts,
        unresolved_conflicts = excluded.unresolved_conflicts,
        last_checked_at = datetime('now'),
        updated_at = datetime('now')
    `
      )
      .bind(
        id,
        politicianId,
        result.totalSources,
        JSON.stringify(result.sourceIds),
        result.matchRate,
        result.conflictCount,
        result.criticalConflicts,
        result.unresolvedConflicts
      )
      .run();

    return result;
  }

  // =====================================
  // 조회 메서드
  // =====================================

  /**
   * 미해결 불일치 목록 조회
   */
  async getUnresolvedConflicts(
    options: {
      politicianId?: string;
      severity?: ConflictSeverity;
      limit?: number;
    } = {}
  ): Promise<DataConflict[]> {
    let query = `
      SELECT * FROM data_conflicts
      WHERE status IN ('detected', 'reviewing')
    `;
    const params: (string | number)[] = [];

    if (options.politicianId) {
      query += ' AND politician_id = ?';
      params.push(options.politicianId);
    }

    if (options.severity) {
      query += ' AND severity = ?';
      params.push(options.severity);
    }

    query += ` ORDER BY
      CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      detected_at DESC
    `;

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<{
        id: string;
        politician_id: string;
        data_type: string;
        field_name: string;
        source1_id: string;
        source1_value: string | null;
        source2_id: string;
        source2_value: string | null;
        severity: ConflictSeverity;
        status: ConflictStatus;
        detected_at: string;
      }>();

    return (result.results || []).map((r) => ({
      id: r.id,
      politicianId: r.politician_id,
      dataType: r.data_type,
      fieldName: r.field_name,
      source1Id: r.source1_id,
      source1Value: r.source1_value,
      source2Id: r.source2_id,
      source2Value: r.source2_value,
      severity: r.severity,
      status: r.status,
      detectedAt: r.detected_at,
    }));
  }

  /**
   * 정치인별 크로스체크 결과 조회
   */
  async getCrosscheckResult(politicianId: string): Promise<CrosscheckResult | null> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM crosscheck_results WHERE politician_id = ?
    `
      )
      .bind(politicianId)
      .first<{
        politician_id: string;
        total_sources: number;
        source_ids: string;
        match_rate: number;
        conflict_count: number;
        critical_conflicts: number;
        unresolved_conflicts: number;
        reliability_score: number | null;
      }>();

    if (!result) return null;

    return {
      politicianId: result.politician_id,
      totalSources: result.total_sources,
      sourceIds: JSON.parse(result.source_ids || '[]'),
      matchRate: result.match_rate,
      conflictCount: result.conflict_count,
      criticalConflicts: result.critical_conflicts,
      unresolvedConflicts: result.unresolved_conflicts,
      reliabilityScore: result.reliability_score ?? undefined,
    };
  }

  /**
   * 불일치 해결 처리
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'source1_preferred' | 'source2_preferred' | 'manual' | 'ignored',
    resolvedValue?: string,
    resolvedBy: string = 'system'
  ): Promise<boolean> {
    const status = resolution === 'ignored' ? 'ignored' : 'resolved';

    await this.db
      .prepare(
        `
      UPDATE data_conflicts
      SET status = ?,
          resolution = ?,
          resolved_value = ?,
          resolved_by = ?,
          resolved_at = datetime('now')
      WHERE id = ?
    `
      )
      .bind(status, resolution, resolvedValue || null, resolvedBy, conflictId)
      .run();

    return true;
  }
}

// 싱글톤 인스턴스
let engineInstance: CrosscheckEngine | null = null;

export function getCrosscheckEngine(): CrosscheckEngine {
  if (!engineInstance) {
    engineInstance = new CrosscheckEngine();
  }
  return engineInstance;
}
