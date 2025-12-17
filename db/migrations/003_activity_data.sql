-- Migration: 국회의원 활동 데이터 (표결, 법안발의, 위원회활동)
-- Date: 2025-12-17

-- =====================================
-- 1. 표결 정보 테이블
-- 국회의원별 본회의 표결 기록
-- =====================================

CREATE TABLE IF NOT EXISTS voting_records (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  bill_id TEXT NOT NULL,              -- 의안ID
  bill_no TEXT,                       -- 의안번호
  bill_name TEXT,                     -- 의안명
  vote_result TEXT CHECK (vote_result IN ('찬성', '반대', '기권', '불참')),
  vote_date TEXT,                     -- 표결일
  assembly_age INTEGER DEFAULT 22,    -- 국회 대수
  committee TEXT,                     -- 소관위원회
  data_source TEXT DEFAULT 'api',     -- 데이터 출처
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(politician_id, bill_id)      -- 의원+의안 조합 중복 방지
);

CREATE INDEX idx_voting_politician ON voting_records(politician_id);
CREATE INDEX idx_voting_bill ON voting_records(bill_id);
CREATE INDEX idx_voting_date ON voting_records(vote_date DESC);
CREATE INDEX idx_voting_result ON voting_records(vote_result);
CREATE INDEX idx_voting_age ON voting_records(assembly_age);

-- =====================================
-- 2. 법안 발의 테이블
-- 국회의원 발의/공동발의 법안
-- =====================================

CREATE TABLE IF NOT EXISTS bill_sponsorships (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  bill_id TEXT NOT NULL,              -- 의안ID
  bill_no TEXT,                       -- 의안번호
  bill_name TEXT NOT NULL,            -- 법률안명
  sponsor_type TEXT CHECK (sponsor_type IN ('대표발의', '공동발의')),
  propose_date TEXT,                  -- 제안일
  committee TEXT,                     -- 소관위원회
  committee_id TEXT,                  -- 소관위원회ID
  proc_result TEXT,                   -- 처리상태 (원안가결, 수정가결, 폐기 등)
  assembly_age INTEGER DEFAULT 22,    -- 국회 대수
  detail_link TEXT,                   -- 상세페이지 링크
  data_source TEXT DEFAULT 'api',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(politician_id, bill_id)      -- 의원+의안 조합 중복 방지
);

CREATE INDEX idx_bill_politician ON bill_sponsorships(politician_id);
CREATE INDEX idx_bill_type ON bill_sponsorships(sponsor_type);
CREATE INDEX idx_bill_date ON bill_sponsorships(propose_date DESC);
CREATE INDEX idx_bill_result ON bill_sponsorships(proc_result);
CREATE INDEX idx_bill_committee ON bill_sponsorships(committee);
CREATE INDEX idx_bill_age ON bill_sponsorships(assembly_age);

-- =====================================
-- 3. 위원회 활동 테이블
-- 국회의원 상임위/특별위 활동
-- =====================================

CREATE TABLE IF NOT EXISTS committee_activities (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  committee_name TEXT NOT NULL,       -- 위원회명
  committee_id TEXT,                  -- 위원회ID
  position TEXT,                      -- 위원회 직위 (위원장, 간사, 위원 등)
  is_current INTEGER DEFAULT 1,       -- 현재 소속 여부
  start_date TEXT,                    -- 활동 시작일
  end_date TEXT,                      -- 활동 종료일
  assembly_age INTEGER DEFAULT 22,    -- 국회 대수
  data_source TEXT DEFAULT 'api',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(politician_id, committee_id, assembly_age)
);

CREATE INDEX idx_committee_politician ON committee_activities(politician_id);
CREATE INDEX idx_committee_name ON committee_activities(committee_name);
CREATE INDEX idx_committee_current ON committee_activities(is_current);
CREATE INDEX idx_committee_age ON committee_activities(assembly_age);

-- =====================================
-- 4. 출석 정보 테이블
-- 국회의원 본회의/위원회 출석
-- =====================================

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  meeting_type TEXT CHECK (meeting_type IN ('본회의', '상임위', '특별위', '소위')),
  meeting_date TEXT NOT NULL,
  meeting_name TEXT,                  -- 회의명
  attendance_status TEXT CHECK (attendance_status IN ('출석', '결석', '청가', '출장')),
  assembly_age INTEGER DEFAULT 22,
  data_source TEXT DEFAULT 'api',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(politician_id, meeting_type, meeting_date, meeting_name)
);

CREATE INDEX idx_attendance_politician ON attendance_records(politician_id);
CREATE INDEX idx_attendance_type ON attendance_records(meeting_type);
CREATE INDEX idx_attendance_date ON attendance_records(meeting_date DESC);
CREATE INDEX idx_attendance_status ON attendance_records(attendance_status);

-- =====================================
-- 5. 활동 통계 캐시 테이블
-- 정치인별 활동 통계 (빠른 조회용)
-- =====================================

CREATE TABLE IF NOT EXISTS politician_activity_stats (
  politician_id TEXT PRIMARY KEY REFERENCES politicians(id) ON DELETE CASCADE,

  -- 표결 통계
  total_votes INTEGER DEFAULT 0,
  yes_votes INTEGER DEFAULT 0,        -- 찬성
  no_votes INTEGER DEFAULT 0,         -- 반대
  abstain_votes INTEGER DEFAULT 0,    -- 기권
  absent_votes INTEGER DEFAULT 0,     -- 불참

  -- 법안 통계
  bills_sponsored INTEGER DEFAULT 0,       -- 대표발의 수
  bills_cosponsored INTEGER DEFAULT 0,     -- 공동발의 수
  bills_passed INTEGER DEFAULT 0,          -- 통과된 법안 수

  -- 출석 통계
  plenary_attendance_rate REAL DEFAULT 0,  -- 본회의 출석률
  committee_attendance_rate REAL DEFAULT 0, -- 위원회 출석률

  -- 메타데이터
  assembly_age INTEGER DEFAULT 22,
  last_calculated_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================
-- 6. 동기화 상태 테이블 확장
-- 각 데이터 유형별 동기화 상태 추적
-- =====================================

ALTER TABLE assembly_sync_logs ADD COLUMN data_type TEXT DEFAULT 'members';
-- data_type: 'members', 'votes', 'bills', 'committees', 'attendance'

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_sync_logs_data_type ON assembly_sync_logs(data_type);

-- =====================================
-- 7. 초기 데이터
-- =====================================

-- API 설정 추가 (표결, 법안 API)
INSERT OR IGNORE INTO api_config (id, api_name, endpoint_url, sync_interval_hours)
VALUES
  ('api_votes', 'assembly_votes', 'https://open.assembly.go.kr/portal/openapi', 24),
  ('api_bills', 'assembly_bills', 'https://open.assembly.go.kr/portal/openapi', 24),
  ('api_committees', 'assembly_committees', 'https://open.assembly.go.kr/portal/openapi', 168);
