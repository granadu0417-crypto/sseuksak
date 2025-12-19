-- Migration: OpenWatch 크로스체크 데이터 (자산정보, 정치후원금)
-- Date: 2025-12-17
-- Source: OpenWatch API (https://openwatch.kr/api)
-- Purpose: 다중 소스 크로스체크를 위한 민간 데이터 연동

-- =====================================
-- 1. 국회의원 자산정보 테이블
-- 재산 신고 내역 (건물, 토지, 증권, 예금 등)
-- =====================================

CREATE TABLE IF NOT EXISTS politician_assets (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,

  -- 자산 정보
  report_date TEXT NOT NULL,              -- 신고 기준일 (YYYYMM 형식, 예: 202303)
  asset_type TEXT NOT NULL,               -- 자산 유형 (건물, 토지, 증권, 예금, 채무 등)
  relation TEXT NOT NULL,                 -- 관계인 (본인, 배우자, 부, 모 등)
  kind TEXT,                              -- 상세 종류 (아파트, 대지, 주식 등)
  detail TEXT,                            -- 위치/상세 정보

  -- 금액 정보 (단위: 천원)
  origin_valuation INTEGER,               -- 종전가액
  increased_amount INTEGER,               -- 증감액
  current_valuation INTEGER,              -- 현재가액
  change_reason TEXT,                     -- 변동 사유

  -- 메타데이터
  openwatch_id TEXT,                      -- OpenWatch 원본 ID
  data_source TEXT DEFAULT 'openwatch',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  UNIQUE(politician_id, report_date, asset_type, relation, detail)
);

CREATE INDEX idx_asset_politician ON politician_assets(politician_id);
CREATE INDEX idx_asset_date ON politician_assets(report_date DESC);
CREATE INDEX idx_asset_type ON politician_assets(asset_type);
CREATE INDEX idx_asset_relation ON politician_assets(relation);

-- =====================================
-- 2. 자산 요약 테이블
-- 의원별 총 자산 집계 (캐시용)
-- =====================================

CREATE TABLE IF NOT EXISTS politician_asset_summary (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL UNIQUE REFERENCES politicians(id) ON DELETE CASCADE,

  -- 최신 신고 기준
  latest_report_date TEXT,

  -- 자산 총액 (단위: 천원)
  total_assets INTEGER DEFAULT 0,         -- 총 자산
  total_real_estate INTEGER DEFAULT 0,    -- 부동산 합계
  total_securities INTEGER DEFAULT 0,     -- 증권 합계
  total_deposits INTEGER DEFAULT 0,       -- 예금 합계
  total_debts INTEGER DEFAULT 0,          -- 채무 합계

  -- 변동 정보
  prev_total_assets INTEGER,              -- 이전 총 자산
  asset_change INTEGER,                   -- 변동액
  asset_change_rate REAL,                 -- 변동률 (%)

  -- 메타데이터
  data_source TEXT DEFAULT 'openwatch',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_asset_summary_politician ON politician_asset_summary(politician_id);
CREATE INDEX idx_asset_summary_total ON politician_asset_summary(total_assets DESC);

-- =====================================
-- 3. 정치후원금 총액 테이블
-- 연도별 후원금 모금 총액
-- =====================================

CREATE TABLE IF NOT EXISTS political_contributions (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,

  -- 후원금 정보
  year INTEGER NOT NULL,                  -- 연도
  contribution_type TEXT NOT NULL,        -- 유형 (NATIONAL_ASSEMBLY, LOCAL_ASSEMBLY, PRESIDENT)
  sido TEXT,                              -- 시도
  sigungu TEXT,                           -- 시군구
  electoral_district TEXT,                -- 선거구
  candidate_type TEXT,                    -- 후보자 유형
  party_name TEXT,                        -- 정당명

  -- 금액 정보
  total_amount INTEGER NOT NULL,          -- 총 모금액 (원)

  -- 메타데이터
  openwatch_id TEXT,
  data_source TEXT DEFAULT 'openwatch',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  UNIQUE(politician_id, year, contribution_type)
);

CREATE INDEX idx_contribution_politician ON political_contributions(politician_id);
CREATE INDEX idx_contribution_year ON political_contributions(year DESC);
CREATE INDEX idx_contribution_amount ON political_contributions(total_amount DESC);

-- =====================================
-- 4. 고액후원자 테이블
-- 연간 300만원 초과 기부자
-- =====================================

CREATE TABLE IF NOT EXISTS contribution_donors (
  id TEXT PRIMARY KEY,
  contribution_id TEXT REFERENCES political_contributions(id) ON DELETE CASCADE,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,

  -- 후원자 정보
  donor_name TEXT NOT NULL,               -- 후원자명
  amount INTEGER NOT NULL,                -- 후원금액 (원)
  contribution_date TEXT,                 -- 후원일
  address TEXT,                           -- 주소 (시도 수준)
  job TEXT,                               -- 직업
  donor_birthdate TEXT,                   -- 생년월일

  -- 후원 정보
  year INTEGER NOT NULL,
  contribution_type TEXT,                 -- 유형

  -- 메타데이터
  openwatch_id TEXT,
  data_source TEXT DEFAULT 'openwatch',
  created_at TEXT DEFAULT (datetime('now')),

  UNIQUE(politician_id, year, donor_name, amount)
);

CREATE INDEX idx_donor_politician ON contribution_donors(politician_id);
CREATE INDEX idx_donor_year ON contribution_donors(year DESC);
CREATE INDEX idx_donor_amount ON contribution_donors(amount DESC);
CREATE INDEX idx_donor_name ON contribution_donors(donor_name);

-- =====================================
-- 5. 정치후원금 요약 테이블
-- 의원별 후원금 통계 (캐시용)
-- =====================================

CREATE TABLE IF NOT EXISTS politician_contribution_summary (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL UNIQUE REFERENCES politicians(id) ON DELETE CASCADE,

  -- 총계
  total_contributions INTEGER DEFAULT 0,   -- 누적 후원금 총액
  total_donors INTEGER DEFAULT 0,          -- 누적 후원자 수

  -- 최근 연도
  latest_year INTEGER,                     -- 가장 최근 연도
  latest_amount INTEGER,                   -- 최근 연도 후원금

  -- 통계
  avg_yearly_amount INTEGER,               -- 연평균 후원금
  max_single_donation INTEGER,             -- 최대 단일 후원금

  -- 메타데이터
  data_source TEXT DEFAULT 'openwatch',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_contrib_summary_politician ON politician_contribution_summary(politician_id);
CREATE INDEX idx_contrib_summary_total ON politician_contribution_summary(total_contributions DESC);

-- =====================================
-- 6. API 설정 추가
-- =====================================

INSERT OR IGNORE INTO api_config (id, api_name, endpoint_url, sync_interval_hours)
VALUES
  ('api_openwatch_assets', 'openwatch_assets', 'https://openwatch.kr/api/national-assembly/assets', 168),
  ('api_openwatch_contributions', 'openwatch_contributions', 'https://openwatch.kr/api/political-contributions', 168),
  ('api_openwatch_totals', 'openwatch_contribution_totals', 'https://openwatch.kr/api/political-contributions/totals', 168);
