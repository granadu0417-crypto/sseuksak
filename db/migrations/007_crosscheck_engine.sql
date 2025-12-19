-- Migration: 크로스체크 엔진
-- Date: 2025-12-17
-- Purpose: 다중 소스 데이터 비교 및 불일치 감지 시스템

-- =====================================
-- 1. 데이터 소스 마스터 테이블
-- 각 데이터 출처의 메타정보 관리
-- =====================================

CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- 소스명 (국회 열린데이터, OpenWatch 등)
  name_en TEXT,                          -- 영문명
  type TEXT NOT NULL,                    -- government, private, party, media
  authority_score REAL DEFAULT 0.5,      -- 신뢰도 기본 점수 (0.0 ~ 1.0)
  base_url TEXT,                         -- API 기본 URL
  description TEXT,                      -- 설명
  is_active INTEGER DEFAULT 1,           -- 활성화 여부
  last_sync_at TEXT,                     -- 마지막 동기화 시간
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 기본 데이터 소스 등록
INSERT OR IGNORE INTO data_sources (id, name, name_en, type, authority_score, base_url, description) VALUES
  ('src_assembly', '국회 열린데이터', 'National Assembly Open Data', 'government', 1.0, 'https://open.assembly.go.kr', '국회 공식 API - 가장 신뢰도 높음'),
  ('src_nec', '중앙선거관리위원회', 'National Election Commission', 'government', 1.0, 'http://apis.data.go.kr/9760000', '선관위 공식 API - 선거/당선 데이터'),
  ('src_openwatch', 'OpenWatch', 'OpenWatch', 'private', 0.8, 'https://openwatch.kr/api', '민간 감시 데이터 - 자산/후원금/표결'),
  ('src_popong', 'Popong', 'Popong', 'private', 0.7, 'https://data.popong.com', '민간 오픈소스 - 역대 의원/의안'),
  ('src_party_democratic', '더불어민주당', 'Democratic Party', 'party', 0.7, 'https://theminjoo.kr', '정당 공식 사이트'),
  ('src_party_ppp', '국민의힘', 'People Power Party', 'party', 0.7, 'https://peoplepowerparty.kr', '정당 공식 사이트'),
  ('src_party_rebuilding', '조국혁신당', 'Rebuilding Korea Party', 'party', 0.7, 'https://rebuildingkoreaparty.kr', '정당 공식 사이트'),
  ('src_party_reform', '개혁신당', 'Reform Party', 'party', 0.7, 'https://reformparty.kr', '정당 공식 사이트'),
  ('src_wiki', '나무위키', 'Namu Wiki', 'private', 0.5, 'https://namu.wiki', '위키 데이터 - 참고용');

-- =====================================
-- 2. 원본 데이터 저장 테이블
-- 각 소스에서 가져온 raw 데이터 보관
-- =====================================

-- 정치인 기본정보 원본
CREATE TABLE IF NOT EXISTS raw_politician_info (
  id TEXT PRIMARY KEY,
  politician_id TEXT REFERENCES politicians(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES data_sources(id),

  -- 기본 정보
  name TEXT NOT NULL,                    -- 이름
  name_hanja TEXT,                       -- 한자명
  name_en TEXT,                          -- 영문명
  birth_date TEXT,                       -- 생년월일
  gender TEXT,                           -- 성별

  -- 소속 정보
  party_name TEXT,                       -- 정당명
  region TEXT,                           -- 선거구/지역
  position TEXT,                         -- 직책

  -- 연락처
  email TEXT,
  phone TEXT,
  office_address TEXT,

  -- 원본 JSON (전체 데이터 백업)
  raw_json TEXT,

  -- 메타데이터
  fetched_at TEXT DEFAULT (datetime('now')),
  hash TEXT,                             -- 데이터 해시 (변경 감지용)

  UNIQUE(politician_id, source_id)
);

CREATE INDEX idx_raw_politician_source ON raw_politician_info(source_id);
CREATE INDEX idx_raw_politician_hash ON raw_politician_info(hash);

-- 표결 정보 원본
CREATE TABLE IF NOT EXISTS raw_vote_info (
  id TEXT PRIMARY KEY,
  politician_id TEXT REFERENCES politicians(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES data_sources(id),

  -- 표결 정보
  bill_id TEXT,                          -- 의안 ID
  bill_name TEXT,                        -- 의안명
  vote_date TEXT,                        -- 표결일
  vote_result TEXT,                      -- 찬성/반대/기권/불참

  -- 원본 JSON
  raw_json TEXT,

  -- 메타데이터
  fetched_at TEXT DEFAULT (datetime('now')),
  hash TEXT,

  UNIQUE(politician_id, source_id, bill_id)
);

CREATE INDEX idx_raw_vote_source ON raw_vote_info(source_id);
CREATE INDEX idx_raw_vote_bill ON raw_vote_info(bill_id);

-- 자산 정보 원본
CREATE TABLE IF NOT EXISTS raw_asset_info (
  id TEXT PRIMARY KEY,
  politician_id TEXT REFERENCES politicians(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES data_sources(id),

  -- 자산 정보
  report_year INTEGER,                   -- 신고 연도
  total_assets INTEGER,                  -- 총 자산
  real_estate INTEGER,                   -- 부동산
  securities INTEGER,                    -- 증권
  deposits INTEGER,                      -- 예금
  debts INTEGER,                         -- 부채

  -- 원본 JSON
  raw_json TEXT,

  -- 메타데이터
  fetched_at TEXT DEFAULT (datetime('now')),
  hash TEXT,

  UNIQUE(politician_id, source_id, report_year)
);

CREATE INDEX idx_raw_asset_source ON raw_asset_info(source_id);
CREATE INDEX idx_raw_asset_year ON raw_asset_info(report_year);

-- =====================================
-- 3. 불일치 감지 테이블
-- 소스 간 데이터 불일치 기록
-- =====================================

CREATE TABLE IF NOT EXISTS data_conflicts (
  id TEXT PRIMARY KEY,
  politician_id TEXT REFERENCES politicians(id) ON DELETE CASCADE,

  -- 불일치 정보
  data_type TEXT NOT NULL,               -- politician_info, vote, asset, contribution
  field_name TEXT NOT NULL,              -- 불일치 필드명

  -- 소스별 값
  source1_id TEXT NOT NULL REFERENCES data_sources(id),
  source1_value TEXT,
  source2_id TEXT NOT NULL REFERENCES data_sources(id),
  source2_value TEXT,

  -- 상태
  status TEXT DEFAULT 'detected',        -- detected, reviewing, resolved, ignored
  resolution TEXT,                       -- 해결 방법 (source1_preferred, source2_preferred, manual, merged)
  resolved_value TEXT,                   -- 최종 확정 값
  resolved_by TEXT,                      -- 해결자 (system, admin)
  resolved_at TEXT,

  -- 심각도
  severity TEXT DEFAULT 'medium',        -- low, medium, high, critical

  -- 메타데이터
  detected_at TEXT DEFAULT (datetime('now')),
  notes TEXT,

  UNIQUE(politician_id, data_type, field_name, source1_id, source2_id)
);

CREATE INDEX idx_conflict_politician ON data_conflicts(politician_id);
CREATE INDEX idx_conflict_status ON data_conflicts(status);
CREATE INDEX idx_conflict_severity ON data_conflicts(severity);
CREATE INDEX idx_conflict_type ON data_conflicts(data_type);

-- =====================================
-- 4. 크로스체크 결과 캐시
-- 정치인별 크로스체크 요약
-- =====================================

CREATE TABLE IF NOT EXISTS crosscheck_results (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,

  -- 소스 커버리지
  total_sources INTEGER DEFAULT 0,       -- 데이터 소스 수
  source_ids TEXT,                       -- JSON 배열 ["src_assembly", "src_openwatch"]

  -- 일치율
  match_rate REAL DEFAULT 0,             -- 전체 일치율 (0.0 ~ 1.0)
  field_match_rates TEXT,                -- JSON {"name": 1.0, "party": 0.8}

  -- 불일치 요약
  conflict_count INTEGER DEFAULT 0,      -- 총 불일치 수
  critical_conflicts INTEGER DEFAULT 0,  -- 심각한 불일치
  unresolved_conflicts INTEGER DEFAULT 0, -- 미해결 불일치

  -- 신뢰도 점수 (Phase 6에서 확장)
  reliability_score REAL,                -- 종합 신뢰도 (0.0 ~ 1.0)

  -- 메타데이터
  last_checked_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  UNIQUE(politician_id)
);

CREATE INDEX idx_crosscheck_reliability ON crosscheck_results(reliability_score DESC);
CREATE INDEX idx_crosscheck_conflicts ON crosscheck_results(unresolved_conflicts DESC);

-- =====================================
-- 5. 크로스체크 실행 로그
-- 비교 작업 이력 관리
-- =====================================

CREATE TABLE IF NOT EXISTS crosscheck_logs (
  id TEXT PRIMARY KEY,

  -- 실행 정보
  check_type TEXT NOT NULL,              -- full, incremental, single_politician
  target_politician_id TEXT,             -- 단일 정치인 체크 시

  -- 비교 대상
  source1_id TEXT REFERENCES data_sources(id),
  source2_id TEXT REFERENCES data_sources(id),
  data_types TEXT,                       -- JSON 배열 ["politician_info", "vote"]

  -- 결과
  total_compared INTEGER DEFAULT 0,      -- 비교 건수
  matches_found INTEGER DEFAULT 0,       -- 일치 건수
  conflicts_found INTEGER DEFAULT 0,     -- 불일치 건수
  new_conflicts INTEGER DEFAULT 0,       -- 신규 불일치

  -- 상태
  status TEXT DEFAULT 'running',         -- running, completed, failed
  error_message TEXT,

  -- 시간
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  duration_seconds INTEGER,

  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_crosscheck_log_status ON crosscheck_logs(status);
CREATE INDEX idx_crosscheck_log_type ON crosscheck_logs(check_type);

-- =====================================
-- 6. 필드 비교 규칙 테이블
-- 어떤 필드를 어떻게 비교할지 정의
-- =====================================

CREATE TABLE IF NOT EXISTS comparison_rules (
  id TEXT PRIMARY KEY,
  data_type TEXT NOT NULL,               -- politician_info, vote, asset
  field_name TEXT NOT NULL,              -- 비교할 필드명

  -- 비교 방법
  comparison_type TEXT DEFAULT 'exact',  -- exact, fuzzy, numeric_tolerance, date
  tolerance REAL,                        -- numeric_tolerance 시 허용 오차
  fuzzy_threshold REAL DEFAULT 0.9,      -- fuzzy 시 유사도 임계값

  -- 중요도
  weight REAL DEFAULT 1.0,               -- 신뢰도 계산 시 가중치
  severity TEXT DEFAULT 'medium',        -- 불일치 시 심각도

  -- 활성화
  is_active INTEGER DEFAULT 1,

  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 기본 비교 규칙
INSERT OR IGNORE INTO comparison_rules (id, data_type, field_name, comparison_type, weight, severity, description) VALUES
  -- 정치인 기본정보
  ('rule_name', 'politician_info', 'name', 'exact', 1.0, 'critical', '이름 일치 - 핵심'),
  ('rule_name_hanja', 'politician_info', 'name_hanja', 'exact', 0.8, 'high', '한자명 일치'),
  ('rule_birth', 'politician_info', 'birth_date', 'date', 0.9, 'high', '생년월일 일치'),
  ('rule_party', 'politician_info', 'party_name', 'fuzzy', 0.7, 'medium', '소속정당 - 유사도 비교'),
  ('rule_region', 'politician_info', 'region', 'fuzzy', 0.6, 'medium', '선거구 - 유사도 비교'),

  -- 표결 정보
  ('rule_vote_result', 'vote', 'vote_result', 'exact', 1.0, 'high', '표결 결과 일치'),
  ('rule_vote_date', 'vote', 'vote_date', 'date', 0.8, 'medium', '표결일 일치'),

  -- 자산 정보
  ('rule_total_assets', 'asset', 'total_assets', 'numeric_tolerance', 1.0, 'high', '총자산 - 1% 오차 허용'),
  ('rule_real_estate', 'asset', 'real_estate', 'numeric_tolerance', 0.9, 'medium', '부동산 - 1% 오차 허용'),
  ('rule_securities', 'asset', 'securities', 'numeric_tolerance', 0.8, 'medium', '증권 - 1% 오차 허용');

-- tolerance 값 업데이트 (numeric_tolerance인 경우)
UPDATE comparison_rules SET tolerance = 0.01 WHERE comparison_type = 'numeric_tolerance';

-- =====================================
-- 7. 뷰: 미해결 불일치 목록
-- =====================================

CREATE VIEW IF NOT EXISTS v_unresolved_conflicts AS
SELECT
  dc.id,
  dc.politician_id,
  p.name as politician_name,
  dc.data_type,
  dc.field_name,
  ds1.name as source1_name,
  dc.source1_value,
  ds2.name as source2_name,
  dc.source2_value,
  dc.severity,
  dc.detected_at
FROM data_conflicts dc
JOIN politicians p ON dc.politician_id = p.id
JOIN data_sources ds1 ON dc.source1_id = ds1.id
JOIN data_sources ds2 ON dc.source2_id = ds2.id
WHERE dc.status IN ('detected', 'reviewing')
ORDER BY
  CASE dc.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  dc.detected_at DESC;

-- =====================================
-- 8. 뷰: 정치인별 크로스체크 요약
-- =====================================

CREATE VIEW IF NOT EXISTS v_politician_crosscheck_summary AS
SELECT
  p.id as politician_id,
  p.name as politician_name,
  party.name as party_name,
  COALESCE(cr.total_sources, 0) as total_sources,
  COALESCE(cr.match_rate, 0) as match_rate,
  COALESCE(cr.conflict_count, 0) as conflict_count,
  COALESCE(cr.unresolved_conflicts, 0) as unresolved_conflicts,
  cr.reliability_score,
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
ORDER BY cr.unresolved_conflicts DESC NULLS LAST, p.name;

