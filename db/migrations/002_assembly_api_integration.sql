-- Migration: 국회 열린데이터 API 연동을 위한 스키마 확장
-- Date: 2025-12-17

-- =====================================
-- politicians 테이블 확장
-- =====================================

-- 국회 API 원본 데이터 필드
ALTER TABLE politicians ADD COLUMN assembly_id TEXT;           -- 국회 API num (식별코드)
ALTER TABLE politicians ADD COLUMN dept_cd TEXT;               -- 부서코드
ALTER TABLE politicians ADD COLUMN hj_nm TEXT;                 -- 한자이름
ALTER TABLE politicians ADD COLUMN eng_nm TEXT;                -- 영문이름
ALTER TABLE politicians ADD COLUMN elect_gbn_nm TEXT;          -- 당선구분 (지역구/비례대표)
ALTER TABLE politicians ADD COLUMN reele_gbn_nm TEXT;          -- 당선횟수 (초선/재선/3선...)

-- 자체 관리용 필드
ALTER TABLE politicians ADD COLUMN unique_key TEXT;            -- 이름+선거구 조합 고유키
ALTER TABLE politicians ADD COLUMN data_source TEXT DEFAULT 'manual';  -- 데이터 출처 (api/manual)
ALTER TABLE politicians ADD COLUMN last_synced_at TEXT;        -- 마지막 API 동기화 시간
ALTER TABLE politicians ADD COLUMN sync_hash TEXT;             -- 동기화 해시 (변경 감지용)
ALTER TABLE politicians ADD COLUMN is_active INTEGER DEFAULT 1; -- 현역 여부

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_politicians_assembly_id ON politicians(assembly_id);
CREATE INDEX IF NOT EXISTS idx_politicians_unique_key ON politicians(unique_key);
CREATE INDEX IF NOT EXISTS idx_politicians_active ON politicians(is_active);

-- =====================================
-- 국회의원 동기화 로그 테이블
-- =====================================

CREATE TABLE IF NOT EXISTS assembly_sync_logs (
  id TEXT PRIMARY KEY,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  total_records INTEGER DEFAULT 0,
  new_records INTEGER DEFAULT 0,
  updated_records INTEGER DEFAULT 0,
  deleted_records INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sync_logs_status ON assembly_sync_logs(status);
CREATE INDEX idx_sync_logs_created ON assembly_sync_logs(created_at DESC);

-- =====================================
-- 국회의원 변경 이력 테이블
-- =====================================

CREATE TABLE IF NOT EXISTS politician_change_history (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deactivated', 'reactivated')),
  field_name TEXT,                -- 변경된 필드명 (updated일 경우)
  old_value TEXT,                 -- 이전 값
  new_value TEXT,                 -- 새 값
  sync_log_id TEXT REFERENCES assembly_sync_logs(id),
  detected_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_change_history_politician ON politician_change_history(politician_id);
CREATE INDEX idx_change_history_type ON politician_change_history(change_type);
CREATE INDEX idx_change_history_detected ON politician_change_history(detected_at DESC);

-- =====================================
-- 지방자치단체장 테이블 (확장용)
-- =====================================

CREATE TABLE IF NOT EXISTS local_officials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,         -- 시장, 구청장, 도지사 등
  region TEXT NOT NULL,           -- 관할 지역
  party_id TEXT REFERENCES parties(id) ON DELETE SET NULL,
  avatar_url TEXT,
  term_start TEXT,                -- 임기 시작
  term_end TEXT,                  -- 임기 종료
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  unique_key TEXT,                -- 이름+지역+직위 조합
  data_source TEXT DEFAULT 'manual',
  last_synced_at TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_local_officials_position ON local_officials(position);
CREATE INDEX idx_local_officials_region ON local_officials(region);
CREATE INDEX idx_local_officials_party ON local_officials(party_id);
CREATE INDEX idx_local_officials_active ON local_officials(is_active);

-- =====================================
-- API 설정 테이블
-- =====================================

CREATE TABLE IF NOT EXISTS api_config (
  id TEXT PRIMARY KEY,
  api_name TEXT NOT NULL UNIQUE,
  endpoint_url TEXT NOT NULL,
  api_key_encrypted TEXT,         -- 암호화된 API 키
  is_enabled INTEGER DEFAULT 1,
  sync_interval_hours INTEGER DEFAULT 24,
  last_sync_at TEXT,
  next_sync_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 초기 API 설정 (키는 환경변수에서)
INSERT OR IGNORE INTO api_config (id, api_name, endpoint_url, sync_interval_hours)
VALUES (
  'api_assembly',
  'national_assembly',
  'https://open.assembly.go.kr/portal/openapi',
  24
);
