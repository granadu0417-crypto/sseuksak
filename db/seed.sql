-- =====================================================
-- 초기 데이터 (Seed Data)
-- =====================================================

-- 정당 데이터
INSERT INTO parties (id, name, color, seats) VALUES
('democratic', '더불어민주당', '#0066ff', 170),
('ppp', '국민의힘', '#e61e2b', 108),
('rebuild', '조국혁신당', '#00c4b4', 12),
('reform', '개혁신당', '#ff6b00', 3),
('justice', '정의당', '#ffcc00', 1),
('independent', '무소속', '#666666', 6);

-- 정치인 데이터
INSERT INTO politicians (id, name, party_id, region, position, bio, attendance_rate, bills_proposed, bills_passed, promise_rate, rank) VALUES
('pol_001', '김민수', 'democratic', '서울 강남구', '국회의원 (22대)', '서울대학교 법학과 졸업. 검사 출신.', 92, 45, 12, 65, 1),
('pol_002', '이정희', 'ppp', '부산 해운대구', '국회의원 (22대)', '고려대학교 경영학과 졸업. 기업인 출신.', 88, 38, 8, 72, 2),
('pol_003', '박서준', 'rebuild', '서울 마포구', '국회의원 (22대)', '연세대학교 정치외교학과 졸업.', 95, 52, 15, 58, 3),
('pol_004', '최영미', 'democratic', '경기 성남시', '국회의원 (22대)', '이화여대 사회학과 졸업. 시민운동가 출신.', 78, 28, 5, 81, 4),
('pol_005', '정태우', 'ppp', '대구 수성구', '국회의원 (22대)', '서강대학교 법학과 졸업. 변호사 출신.', 91, 42, 10, 69, 5),
('pol_006', '한소희', 'reform', '인천 남동구', '국회의원 (22대)', 'KAIST 졸업. IT 기업 창업자 출신.', 85, 31, 7, 77, 6);

-- 정치인 태그
INSERT INTO politician_tags (politician_id, tag) VALUES
('pol_001', '경제'), ('pol_001', '청년'), ('pol_001', '법률'),
('pol_002', '복지'), ('pol_002', '교육'),
('pol_003', '개혁'), ('pol_003', '사법'),
('pol_004', '환경'), ('pol_004', '여성'),
('pol_005', '안보'), ('pol_005', '외교'),
('pol_006', '청년'), ('pol_006', '주거');

-- 공약 데이터
INSERT INTO promises (politician_id, title, category, status, progress, start_date, target_date) VALUES
('pol_001', '청년 주거 지원금 50만원 확대', '복지', 'completed', 100, '2024-06', '2024-12'),
('pol_001', '중소기업 법인세 10% 감면', '경제', 'in_progress', 72, '2024-07', '2025-06'),
('pol_002', '전국 초등학교 디지털 교육 인프라 구축', '교육', 'in_progress', 45, '2024-05', '2025-12'),
('pol_003', '탄소중립 2050 로드맵 수립', '환경', 'in_progress', 38, '2024-08', '2025-12'),
('pol_004', '국민연금 개혁안 마련', '복지', 'pending', 15, '2024-09', '2026-06'),
('pol_005', '청년 창업 지원금 2배 확대', '경제', 'completed', 100, '2024-03', '2024-09');

-- 팩트체크 데이터
INSERT INTO factchecks (claim, speaker_id, speaker_name, party_name, verdict, explanation, sources, agrees, disagrees) VALUES
('"현 정부 들어 청년 실업률이 역대 최고치를 기록했다"', 'pol_001', '김민수', '더불어민주당', 'mostly_false', '청년 실업률은 7.2%로 역대 최고치(2016년 9.8%)보다 낮습니다.', '["통계청", "OECD"]', 234, 567),
('"우리나라 GDP 대비 복지 지출은 OECD 최하위권이다"', 'pol_002', '이정희', '국민의힘', 'true', '2023년 기준 GDP 대비 사회복지 지출 비율 12.3%로 OECD 38개국 중 35위입니다.', '["OECD", "기획재정부"]', 892, 45),
('"지난 5년간 부동산 가격이 2배 올랐다"', 'pol_003', '박서준', '조국혁신당', 'half_true', '서울 아파트 기준 약 52% 상승했으나, 전국 평균은 34% 상승입니다.', '["KB부동산", "한국부동산원"]', 445, 312);

-- 예측 이벤트 데이터
INSERT INTO predictions (title, category, status, deadline, prize_pool, participant_count) VALUES
('12월 국회 본회의 예산안 통과 여부', '국회', 'active', '2024-12-20', 50000, 1523),
('1월 대통령 지지율 40% 돌파 여부', '여론', 'active', '2025-01-15', 30000, 2341),
('다음 국무총리 인선 정당', '인사', 'active', '2025-01-31', 100000, 892);

-- 예측 선택지
INSERT INTO prediction_options (prediction_id, label, odds, vote_count) VALUES
(1, '통과', 1.5, 944), (1, '부결', 2.8, 579),
(2, '돌파', 3.2, 726), (2, '미달', 1.3, 1615),
(3, '여당', 1.8, 490), (3, '야당', 4.5, 196), (3, '무소속', 3.2, 206);
