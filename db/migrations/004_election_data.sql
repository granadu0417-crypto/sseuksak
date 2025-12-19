-- Migration: 선관위 선거 데이터 (당선이력, 공약)
-- Date: 2025-12-17
-- Source: 중앙선거관리위원회 공공데이터 API

-- =====================================
-- 1. 선거 이력 테이블
-- 국회의원 당선 기록
-- =====================================

CREATE TABLE IF NOT EXISTS election_history (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,

  -- 선거 정보
  election_id TEXT NOT NULL,           -- 선관위 선거ID (예: 20240410)
  election_type TEXT NOT NULL,          -- 선거종류 (국회의원, 지방선거 등)
  election_date TEXT NOT NULL,          -- 선거일

  -- 당선 정보
  constituency TEXT,                    -- 선거구명
  sido_name TEXT,                       -- 시도명
  party_name TEXT,                      -- 당시 소속 정당
  vote_count INTEGER,                   -- 득표수
  vote_rate REAL,                       -- 득표율 (%)
  rank_no INTEGER,                      -- 순위
  is_elected INTEGER DEFAULT 0,         -- 당선 여부 (1=당선, 0=낙선)

  -- 후보자 정보 (선거 당시)
  candidate_id TEXT,                    -- 선관위 후보자ID
  candidate_no INTEGER,                 -- 기호
  job TEXT,                             -- 직업
  education TEXT,                       -- 학력
  career TEXT,                          -- 경력

  -- 메타데이터
  assembly_age INTEGER,                 -- 국회 대수 (22 = 제22대)
  data_source TEXT DEFAULT 'nec_api',   -- 데이터 출처
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  UNIQUE(politician_id, election_id)    -- 의원+선거 조합 중복 방지
);

CREATE INDEX idx_election_politician ON election_history(politician_id);
CREATE INDEX idx_election_date ON election_history(election_date DESC);
CREATE INDEX idx_election_type ON election_history(election_type);
CREATE INDEX idx_election_elected ON election_history(is_elected);
CREATE INDEX idx_election_constituency ON election_history(constituency);

-- =====================================
-- 2. 선거 공약 테이블
-- 후보자별 선거 공약
-- =====================================

CREATE TABLE IF NOT EXISTS election_promises (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  election_history_id TEXT REFERENCES election_history(id) ON DELETE CASCADE,

  -- 공약 정보
  promise_no INTEGER,                   -- 공약 순번
  category TEXT,                        -- 공약 분야 (경제, 복지, 교육 등)
  title TEXT NOT NULL,                  -- 공약 제목
  content TEXT,                         -- 공약 내용

  -- 이행 상태 (향후 팩트체크용)
  status TEXT DEFAULT 'unknown' CHECK (status IN ('unknown', 'in_progress', 'completed', 'failed', 'modified')),
  progress INTEGER DEFAULT 0,           -- 이행률 (0-100)
  verification_note TEXT,               -- 검증 메모
  verified_at TEXT,                     -- 검증일

  -- 메타데이터
  election_id TEXT,                     -- 선관위 선거ID
  data_source TEXT DEFAULT 'nec_api',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  UNIQUE(politician_id, election_id, promise_no)
);

CREATE INDEX idx_promise_politician ON election_promises(politician_id);
CREATE INDEX idx_promise_election ON election_promises(election_history_id);
CREATE INDEX idx_promise_category ON election_promises(category);
CREATE INDEX idx_promise_status ON election_promises(status);

-- =====================================
-- 3. 선거 목록 테이블
-- 선거 마스터 데이터
-- =====================================

CREATE TABLE IF NOT EXISTS elections (
  id TEXT PRIMARY KEY,                  -- 선관위 선거ID (예: 20240410)
  name TEXT NOT NULL,                   -- 선거명
  type TEXT NOT NULL,                   -- 선거종류코드 (2=국회의원)
  type_name TEXT,                       -- 선거종류명
  election_date TEXT NOT NULL,          -- 선거일
  assembly_age INTEGER,                 -- 해당 국회 대수
  created_at TEXT DEFAULT (datetime('now'))
);

-- 기본 선거 데이터 삽입
INSERT OR IGNORE INTO elections (id, name, type, type_name, election_date, assembly_age)
VALUES
  ('20240410', '제22대 국회의원선거', '2', '국회의원', '2024-04-10', 22),
  ('20200415', '제21대 국회의원선거', '2', '국회의원', '2020-04-15', 21),
  ('20160413', '제20대 국회의원선거', '2', '국회의원', '2016-04-13', 20),
  ('20120411', '제19대 국회의원선거', '2', '국회의원', '2012-04-11', 19),
  ('20080409', '제18대 국회의원선거', '2', '국회의원', '2008-04-09', 18);

-- =====================================
-- 4. API 설정 추가
-- =====================================

INSERT OR IGNORE INTO api_config (id, api_name, endpoint_url, sync_interval_hours)
VALUES
  ('api_nec_winners', 'nec_winners', 'http://apis.data.go.kr/9760000/WinnerInfoInqireService2', 720),
  ('api_nec_promises', 'nec_promises', 'http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService', 720);
