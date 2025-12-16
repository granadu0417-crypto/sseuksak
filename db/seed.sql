-- Politica D1 Database Seed Data
-- 초기 데이터

-- =====================================
-- 정당 데이터
-- =====================================

INSERT INTO parties (id, name, short_name, color, description, member_count) VALUES
('party_democratic', '더불어민주당', '민주당', '#004EA2', '대한민국의 진보 성향 정당', 169),
('party_ppp', '국민의힘', '국힘', '#E61E2B', '대한민국의 보수 성향 정당', 114),
('party_rebuild', '조국혁신당', '혁신당', '#FF6B35', '2024년 창당된 진보 정당', 12),
('party_reform', '개혁신당', '개혁', '#00C4B3', '중도 개혁 성향 정당', 3),
('party_justice', '정의당', '정의', '#FFCC00', '진보 정당', 6),
('party_independent', '무소속', '무소속', '#808080', '정당에 소속되지 않은 의원', 0);

-- =====================================
-- 정치인 데이터
-- =====================================

INSERT INTO politicians (id, name, party_id, region, position, attendance_rate, bill_count, promise_count, promise_completed, approval_rating, is_trending) VALUES
('pol_lee_jaemyung', '이재명', 'party_democratic', '인천', '당대표', 94.5, 127, 15, 5, 42.3, 1),
('pol_han_donghoon', '한동훈', 'party_ppp', '서울', '당대표', 89.2, 45, 12, 3, 38.7, 1),
('pol_cho_kuk', '조국', 'party_rebuild', '서울', '당대표', 91.8, 23, 8, 2, 35.2, 1),
('pol_lee_junseok', '이준석', 'party_reform', '서울', '당대표', 87.3, 34, 10, 4, 28.9, 0),
('pol_park_jiho', '박지호', 'party_justice', '경기', '원내대표', 92.1, 56, 11, 6, 31.5, 0),
('pol_kim_minsoo', '김민수', 'party_democratic', '부산', '의원', 88.7, 78, 9, 3, 25.8, 0);

-- 정치인 태그
INSERT INTO politician_tags (id, politician_id, tag) VALUES
('tag_1', 'pol_lee_jaemyung', '경제'),
('tag_2', 'pol_lee_jaemyung', '복지'),
('tag_3', 'pol_lee_jaemyung', '부동산'),
('tag_4', 'pol_han_donghoon', '법치'),
('tag_5', 'pol_han_donghoon', '검찰개혁'),
('tag_6', 'pol_cho_kuk', '검찰개혁'),
('tag_7', 'pol_cho_kuk', '민주주의'),
('tag_8', 'pol_lee_junseok', '청년'),
('tag_9', 'pol_lee_junseok', '개혁'),
('tag_10', 'pol_park_jiho', '노동'),
('tag_11', 'pol_park_jiho', '환경');

-- =====================================
-- 공약 데이터
-- =====================================

INSERT INTO promises (id, politician_id, category, title, description, status, progress, target_date) VALUES
('promise_1', 'pol_lee_jaemyung', '경제', '기본소득 도입', '전 국민 기본소득 단계적 도입', 'in_progress', 25, '2027-12-31'),
('promise_2', 'pol_lee_jaemyung', '부동산', '부동산 투기 근절', '다주택자 규제 강화 및 공급 확대', 'in_progress', 40, '2026-06-30'),
('promise_3', 'pol_han_donghoon', '경제', '규제 혁파', '기업 규제 대폭 완화', 'in_progress', 55, '2026-12-31'),
('promise_4', 'pol_han_donghoon', '안보', '한미동맹 강화', '한미 군사협력 확대', 'completed', 100, '2025-12-31'),
('promise_5', 'pol_cho_kuk', '사법', '검찰개혁 완수', '검찰 권한 분산 및 민주적 통제', 'in_progress', 30, '2027-06-30'),
('promise_6', 'pol_lee_junseok', '청년', '청년 일자리 창출', '청년 맞춤형 일자리 100만개', 'not_started', 0, '2028-12-31');

-- =====================================
-- 팩트체크 데이터
-- =====================================

INSERT INTO factchecks (id, claim, claim_source, claim_date, politician_id, verdict, explanation, agree_count, disagree_count, view_count) VALUES
('fc_1', '현 정부 출범 이후 부동산 가격이 30% 상승했다', '국회 대정부질문', '2024-11-15', 'pol_lee_jaemyung', 'mostly_false', '실제 통계에 따르면 전국 평균 주택가격은 약 12% 상승했습니다. 30%는 과장된 수치입니다.', 234, 89, 1520),
('fc_2', '검찰 수사권 폐지로 범죄가 증가했다', 'TV토론', '2024-10-20', 'pol_han_donghoon', 'unverifiable', '검찰 수사권 조정 이후 범죄율 변화에 대한 공식 통계가 아직 발표되지 않았습니다.', 156, 203, 890),
('fc_3', '최저임금 인상으로 자영업자 폐업이 급증했다', '기자회견', '2024-09-10', NULL, 'half_true', '폐업 증가는 사실이나, 최저임금 외에 경기침체, 코로나19 여파 등 복합적 요인이 있습니다.', 312, 178, 2340);

-- =====================================
-- 예측 데이터
-- =====================================

INSERT INTO predictions (id, title, description, category, end_date, status, total_participants, total_points) VALUES
('pred_1', '2025년 4월 재보궐선거 결과', '서울 종로구 재보궐선거 승자 예측', '선거', '2025-04-01', 'active', 1234, 567000),
('pred_2', '검찰개혁 법안 통과 여부', '검찰개혁 특별법 연내 통과 가능성', '정책', '2025-12-31', 'active', 892, 234000),
('pred_3', '대통령 지지율 예측', '12월 마지막 주 대통령 지지율 구간 예측', '여론', '2024-12-31', 'active', 2156, 890000);

INSERT INTO prediction_options (id, prediction_id, option_text, odds, bet_count, total_points) VALUES
('opt_1_1', 'pred_1', '더불어민주당 후보 승리', 1.8, 456, 234000),
('opt_1_2', 'pred_1', '국민의힘 후보 승리', 2.1, 389, 189000),
('opt_1_3', 'pred_1', '제3후보 승리', 5.5, 89, 44000),
('opt_2_1', 'pred_2', '연내 통과', 2.3, 234, 89000),
('opt_2_2', 'pred_2', '연내 통과 실패', 1.7, 458, 145000),
('opt_3_1', 'pred_3', '30% 미만', 3.2, 234, 120000),
('opt_3_2', 'pred_3', '30-35%', 2.1, 567, 280000),
('opt_3_3', 'pred_3', '35-40%', 2.5, 789, 340000),
('opt_3_4', 'pred_3', '40% 이상', 4.1, 366, 150000);

-- =====================================
-- 테스트 사용자
-- =====================================

INSERT INTO users (id, email, username, password_hash, nickname, level, exp, points, role) VALUES
('user_admin', 'admin@politica.kr', 'admin', '$2b$10$dummyhash', '관리자', 99, 999999, 999999, 'admin'),
('user_test1', 'test1@example.com', 'testuser1', '$2b$10$dummyhash', '정치워치러', 15, 12500, 8500, 'user'),
('user_test2', 'test2@example.com', 'testuser2', '$2b$10$dummyhash', '팩트체커', 12, 8900, 5600, 'user');

-- 예측 통계
INSERT INTO user_prediction_stats (user_id, total_predictions, correct_predictions, total_points_bet, total_points_won, current_streak, best_streak, rank) VALUES
('user_test1', 45, 28, 15000, 22000, 3, 7, 156),
('user_test2', 32, 19, 9800, 12500, 1, 5, 289);

-- =====================================
-- 샘플 게시글
-- =====================================

INSERT INTO posts (id, author_id, category, title, content, view_count, like_count, comment_count, is_hot) VALUES
('post_1', 'user_test1', 'debate', '이번 정국에 대한 의견 나눠봅시다', '최근 정치 상황에 대해 여러분의 의견이 궁금합니다. 서로 존중하며 토론해요!', 1523, 89, 45, 1),
('post_2', 'user_test2', 'info', '[정리] 2024년 주요 법안 통과 현황', '올해 국회에서 통과된 주요 법안들을 정리해봤습니다.', 2341, 156, 23, 1),
('post_3', 'user_test1', 'free', '오늘 뉴스 보셨나요?', '오늘 아침 뉴스에 나온 내용 충격적이네요...', 456, 23, 12, 0);

INSERT INTO post_tags (id, post_id, tag) VALUES
('ptag_1', 'post_1', '정국'),
('ptag_2', 'post_1', '토론'),
('ptag_3', 'post_2', '법안'),
('ptag_4', 'post_2', '국회');

-- =====================================
-- 샘플 댓글
-- =====================================

INSERT INTO comments (id, post_id, author_id, content, like_count) VALUES
('comment_1', 'post_1', 'user_test2', '좋은 토론 주제네요. 저는 이렇게 생각합니다...', 12),
('comment_2', 'post_1', 'user_test1', '의견 감사합니다. 다른 분들 생각도 궁금하네요.', 5),
('comment_3', 'post_2', 'user_test1', '정리 감사합니다! 유익한 정보예요.', 23);
