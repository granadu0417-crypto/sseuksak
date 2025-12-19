-- =====================================================
-- 폴리티카 (Politica) D1 데이터베이스 스키마
-- =====================================================

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  region TEXT,
  is_verified INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 사용자 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  is_hot INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 게시글 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_hot ON posts(is_hot);

-- 게시글 태그 테이블
CREATE TABLE IF NOT EXISTS post_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  parent_id INTEGER,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 정당 테이블
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  logo_url TEXT,
  seats INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 정치인 테이블
CREATE TABLE IF NOT EXISTS politicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  party_id TEXT,
  region TEXT,
  position TEXT,
  bio TEXT,
  image_url TEXT,
  office_address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  attendance_rate REAL DEFAULT 0,
  bills_proposed INTEGER DEFAULT 0,
  bills_passed INTEGER DEFAULT 0,
  speech_count INTEGER DEFAULT 0,
  promise_rate REAL DEFAULT 0,
  likes INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  rank INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (party_id) REFERENCES parties(id)
);

CREATE INDEX IF NOT EXISTS idx_politicians_party_id ON politicians(party_id);
CREATE INDEX IF NOT EXISTS idx_politicians_region ON politicians(region);
CREATE INDEX IF NOT EXISTS idx_politicians_rank ON politicians(rank);

-- 정치인 태그
CREATE TABLE IF NOT EXISTS politician_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  politician_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (politician_id) REFERENCES politicians(id) ON DELETE CASCADE
);

-- 공약 테이블
CREATE TABLE IF NOT EXISTS promises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  politician_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  start_date TEXT,
  target_date TEXT,
  evidence TEXT,
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (politician_id) REFERENCES politicians(id)
);

CREATE INDEX IF NOT EXISTS idx_promises_politician_id ON promises(politician_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_category ON promises(category);

-- 팩트체크 테이블
CREATE TABLE IF NOT EXISTS factchecks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  claim TEXT NOT NULL,
  speaker_id TEXT,
  speaker_name TEXT,
  party_name TEXT,
  verdict TEXT NOT NULL,
  explanation TEXT NOT NULL,
  sources TEXT,
  agrees INTEGER DEFAULT 0,
  disagrees INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  checked_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (speaker_id) REFERENCES politicians(id)
);

CREATE INDEX IF NOT EXISTS idx_factchecks_verdict ON factchecks(verdict);
CREATE INDEX IF NOT EXISTS idx_factchecks_speaker_id ON factchecks(speaker_id);

-- 예측 이벤트 테이블
CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  deadline TEXT NOT NULL,
  result TEXT,
  prize_pool INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_deadline ON predictions(deadline);

-- 예측 선택지 테이블
CREATE TABLE IF NOT EXISTS prediction_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prediction_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  odds REAL DEFAULT 1.0,
  vote_count INTEGER DEFAULT 0,
  is_correct INTEGER DEFAULT 0,
  FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prediction_options_prediction_id ON prediction_options(prediction_id);

-- 예측 참여 테이블
CREATE TABLE IF NOT EXISTS prediction_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prediction_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  points_bet INTEGER DEFAULT 0,
  points_won INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (prediction_id) REFERENCES predictions(id),
  FOREIGN KEY (option_id) REFERENCES prediction_options(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(prediction_id, user_id)
);

-- 투표/좋아요 테이블 (통합)
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  vote_type TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);

-- 북마크 테이블
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- 정치인 활동 로그
CREATE TABLE IF NOT EXISTS politician_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  politician_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  activity_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (politician_id) REFERENCES politicians(id)
);

CREATE INDEX IF NOT EXISTS idx_politician_activities_politician_id ON politician_activities(politician_id);
CREATE INDEX IF NOT EXISTS idx_politician_activities_date ON politician_activities(activity_date DESC);

-- 사용자 뱃지 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 세션 테이블 (인증용)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
