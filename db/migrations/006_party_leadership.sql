-- Migration: 정당 당직 및 지도부 정보
-- Date: 2025-12-17
-- Source: 정당 공식 사이트, 나무위키
-- Purpose: 정당 지도부/당직자 정보 관리

-- =====================================
-- 1. 당직 유형 정의 테이블
-- 당대표, 원내대표, 최고위원 등 직책 종류
-- =====================================

CREATE TABLE IF NOT EXISTS party_position_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- 직책명 (당대표, 원내대표 등)
  name_en TEXT,                          -- 영문명
  level INTEGER NOT NULL DEFAULT 99,     -- 직책 수준 (1: 최고위, 2: 고위, 3: 중견 등)
  category TEXT NOT NULL,                -- 분류 (leadership: 지도부, executive: 당무, floor: 원내)
  description TEXT,                      -- 직책 설명
  is_elected INTEGER DEFAULT 0,          -- 선출직 여부 (1: 전당대회 선출, 0: 임명)
  created_at TEXT DEFAULT (datetime('now'))
);

-- 기본 당직 유형 데이터
INSERT OR IGNORE INTO party_position_types (id, name, name_en, level, category, is_elected) VALUES
  -- 지도부 (선출직)
  ('pos_party_leader', '당대표', 'Party Leader', 1, 'leadership', 1),
  ('pos_floor_leader', '원내대표', 'Floor Leader', 2, 'leadership', 1),
  ('pos_supreme_member', '최고위원', 'Supreme Council Member', 3, 'leadership', 1),
  ('pos_senior_supreme', '수석최고위원', 'Senior Supreme Council Member', 3, 'leadership', 1),

  -- 당무 (임명직)
  ('pos_secretary_general', '사무총장', 'Secretary General', 4, 'executive', 0),
  ('pos_deputy_secretary', '사무부총장', 'Deputy Secretary General', 5, 'executive', 0),
  ('pos_policy_chair', '정책위의장', 'Policy Committee Chair', 4, 'executive', 0),
  ('pos_spokesperson', '대변인', 'Spokesperson', 5, 'executive', 0),
  ('pos_chief_spokesperson', '수석대변인', 'Chief Spokesperson', 5, 'executive', 0),

  -- 원내 (선출/임명 혼합)
  ('pos_floor_deputy', '원내수석부대표', 'Senior Floor Deputy Leader', 5, 'floor', 0),
  ('pos_floor_spokesperson', '원내대변인', 'Floor Spokesperson', 6, 'floor', 0),

  -- 지역 당직
  ('pos_regional_chair', '시도당위원장', 'Regional Party Chair', 6, 'regional', 1),

  -- 비상대책위원회 (임시)
  ('pos_emergency_chair', '비상대책위원장', 'Emergency Committee Chair', 1, 'emergency', 0),
  ('pos_emergency_member', '비상대책위원', 'Emergency Committee Member', 3, 'emergency', 0);

-- =====================================
-- 2. 정당 당직자 테이블
-- 현재 및 역대 당직자 기록
-- =====================================

CREATE TABLE IF NOT EXISTS party_positions (
  id TEXT PRIMARY KEY,

  -- 정당/정치인 연결
  party_id TEXT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  politician_id TEXT REFERENCES politicians(id) ON DELETE SET NULL,

  -- 당직 정보
  position_type_id TEXT NOT NULL REFERENCES party_position_types(id),
  position_name TEXT NOT NULL,           -- 실제 표시 직책명 (직책 유형과 다를 수 있음)

  -- 임기 정보
  start_date TEXT,                       -- 취임일
  end_date TEXT,                         -- 퇴임일 (NULL이면 현직)
  is_current INTEGER DEFAULT 1,          -- 현직 여부

  -- 선출/임명 정보
  appointment_type TEXT DEFAULT 'elected', -- elected: 선출, appointed: 임명, interim: 직무대행
  term_number INTEGER,                   -- 몇 대 (예: 제8대 당대표)

  -- 추가 정보
  region TEXT,                           -- 지역 (시도당위원장의 경우)
  notes TEXT,                            -- 비고

  -- 데이터 소스
  data_source TEXT DEFAULT 'manual',     -- manual, wiki, official
  source_url TEXT,                       -- 출처 URL

  -- 메타데이터
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  -- 복합 유니크 제약 (같은 정당, 같은 직책, 같은 사람은 한번만)
  UNIQUE(party_id, position_type_id, politician_id, start_date)
);

CREATE INDEX idx_position_party ON party_positions(party_id);
CREATE INDEX idx_position_politician ON party_positions(politician_id);
CREATE INDEX idx_position_type ON party_positions(position_type_id);
CREATE INDEX idx_position_current ON party_positions(is_current);
CREATE INDEX idx_position_dates ON party_positions(start_date DESC, end_date);

-- =====================================
-- 3. 당직 이력 뷰 (편의용)
-- =====================================

CREATE VIEW IF NOT EXISTS v_current_party_leadership AS
SELECT
  pp.id,
  p.name as party_name,
  p.color as party_color,
  p.logo_url as party_logo,
  ppt.name as position_type,
  ppt.level as position_level,
  ppt.category as position_category,
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
ORDER BY p.id, ppt.level, pp.position_name;

-- =====================================
-- 4. 정치인별 당직 요약 뷰
-- =====================================

CREATE VIEW IF NOT EXISTS v_politician_party_roles AS
SELECT
  pol.id as politician_id,
  pol.name as politician_name,
  p.name as party_name,
  GROUP_CONCAT(
    CASE WHEN pp.is_current = 1 THEN pp.position_name END,
    ', '
  ) as current_positions,
  COUNT(CASE WHEN pp.is_current = 1 THEN 1 END) as current_position_count,
  COUNT(*) as total_position_history
FROM politicians pol
LEFT JOIN party_positions pp ON pol.id = pp.politician_id
LEFT JOIN parties p ON pp.party_id = p.id
GROUP BY pol.id;

-- =====================================
-- 5. 동기화 로그용 데이터 타입 추가
-- =====================================

INSERT OR IGNORE INTO api_config (id, api_name, endpoint_url, sync_interval_hours)
VALUES
  ('api_party_wiki', 'party_wiki', 'https://namu.wiki/w/', 168),
  ('api_party_official', 'party_official', 'various', 168);

