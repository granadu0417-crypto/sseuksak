-- 복구 코드 컬럼 추가
ALTER TABLE users ADD COLUMN recovery_code TEXT;

-- email을 nullable하게 변경은 SQLite에서 불가능하므로
-- 빈 문자열을 허용하는 방식으로 유지
