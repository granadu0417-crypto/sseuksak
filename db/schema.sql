-- Politica D1 Database Schema
-- 정치 커뮤니티 플랫폼 데이터베이스

-- =====================================
-- 사용자 관련 테이블
-- =====================================

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 사용자 뱃지 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- 세션 테이블
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- =====================================
-- 게시판 관련 테이블
-- =====================================

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('free', 'debate', 'info', 'humor', 'notice')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  is_hot INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_hot ON posts(is_hot, created_at DESC);

-- 게시글 태그 테이블
CREATE TABLE IF NOT EXISTS post_tags (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- 투표 테이블 (좋아요/싫어요)
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_votes_target ON votes(target_type, target_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- 북마크 테이블
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post ON bookmarks(post_id);

-- =====================================
-- 정당 및 정치인 테이블
-- =====================================

-- 정당 테이블
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  color TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  founded_at TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 정치인 테이블
CREATE TABLE IF NOT EXISTS politicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  party_id TEXT REFERENCES parties(id) ON DELETE SET NULL,
  region TEXT,
  position TEXT,
  avatar_url TEXT,
  birth_date TEXT,
  education TEXT,
  career TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  sns_twitter TEXT,
  sns_facebook TEXT,
  sns_instagram TEXT,
  attendance_rate REAL DEFAULT 0,
  bill_count INTEGER DEFAULT 0,
  promise_count INTEGER DEFAULT 0,
  promise_completed INTEGER DEFAULT 0,
  approval_rating REAL DEFAULT 0,
  is_trending INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_politicians_party ON politicians(party_id);
CREATE INDEX idx_politicians_region ON politicians(region);
CREATE INDEX idx_politicians_trending ON politicians(is_trending);

-- 정치인 태그 테이블
CREATE TABLE IF NOT EXISTS politician_tags (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

CREATE INDEX idx_politician_tags_politician ON politician_tags(politician_id);

-- 정치인 활동 테이블
CREATE TABLE IF NOT EXISTS politician_activities (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('bill', 'speech', 'vote', 'event', 'media')),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  activity_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_politician_activities_politician ON politician_activities(politician_id);
CREATE INDEX idx_politician_activities_date ON politician_activities(activity_date DESC);

-- =====================================
-- 공약 관련 테이블
-- =====================================

-- 공약 테이블
CREATE TABLE IF NOT EXISTS promises (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'modified')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  evidence_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_promises_politician ON promises(politician_id);
CREATE INDEX idx_promises_status ON promises(status);
CREATE INDEX idx_promises_category ON promises(category);

-- =====================================
-- 팩트체크 관련 테이블
-- =====================================

-- 팩트체크 테이블
CREATE TABLE IF NOT EXISTS factchecks (
  id TEXT PRIMARY KEY,
  claim TEXT NOT NULL,
  claim_source TEXT,
  claim_date TEXT,
  politician_id TEXT REFERENCES politicians(id) ON DELETE SET NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('true', 'mostly_true', 'half_true', 'mostly_false', 'false', 'unverifiable')),
  explanation TEXT NOT NULL,
  sources TEXT, -- JSON array of sources
  checker_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  agree_count INTEGER DEFAULT 0,
  disagree_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_factchecks_politician ON factchecks(politician_id);
CREATE INDEX idx_factchecks_verdict ON factchecks(verdict);
CREATE INDEX idx_factchecks_created ON factchecks(created_at DESC);

-- 팩트체크 투표 테이블
CREATE TABLE IF NOT EXISTS factcheck_votes (
  id TEXT PRIMARY KEY,
  factcheck_id TEXT NOT NULL REFERENCES factchecks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('agree', 'disagree')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(factcheck_id, user_id)
);

CREATE INDEX idx_factcheck_votes_factcheck ON factcheck_votes(factcheck_id);

-- =====================================
-- 예측 게임 관련 테이블
-- =====================================

-- 예측 테이블
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved')),
  result_option_id TEXT,
  total_participants INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_end_date ON predictions(end_date);

-- 예측 선택지 테이블
CREATE TABLE IF NOT EXISTS prediction_options (
  id TEXT PRIMARY KEY,
  prediction_id TEXT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  odds REAL DEFAULT 1.0,
  bet_count INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0
);

CREATE INDEX idx_prediction_options_prediction ON prediction_options(prediction_id);

-- 예측 참여 테이블
CREATE TABLE IF NOT EXISTS prediction_entries (
  id TEXT PRIMARY KEY,
  prediction_id TEXT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL REFERENCES prediction_options(id) ON DELETE CASCADE,
  points_bet INTEGER NOT NULL CHECK (points_bet > 0),
  points_won INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(prediction_id, user_id)
);

CREATE INDEX idx_prediction_entries_prediction ON prediction_entries(prediction_id);
CREATE INDEX idx_prediction_entries_user ON prediction_entries(user_id);

-- 사용자 예측 통계 테이블
CREATE TABLE IF NOT EXISTS user_prediction_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_points_bet INTEGER DEFAULT 0,
  total_points_won INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================
-- 알림 테이블
-- =====================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
