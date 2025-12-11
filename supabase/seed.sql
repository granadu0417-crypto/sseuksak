-- =============================================
-- 쓱싹 (Sseuksak) 초기 데이터 (시드)
-- schema.sql 실행 후 이 파일을 실행하세요
-- =============================================

-- =============================================
-- 카테고리 데이터
-- =============================================
insert into public.categories (name, slug, icon, color, order_index) values
  ('청소', 'cleaning', '🧹', '#4CAF50', 1),
  ('이사', 'moving', '📦', '#2196F3', 2),
  ('인테리어', 'interior', '🏠', '#FF9800', 3),
  ('수리', 'repair', '🔧', '#795548', 4),
  ('레슨', 'lesson', '📚', '#9C27B0', 5),
  ('뷰티', 'beauty', '💄', '#E91E63', 6),
  ('반려동물', 'pet', '🐕', '#FF5722', 7),
  ('건강', 'health', '💪', '#00BCD4', 8),
  ('IT/개발', 'it', '💻', '#607D8B', 9),
  ('디자인', 'design', '🎨', '#673AB7', 10),
  ('촬영', 'photo', '📷', '#F44336', 11),
  ('행사', 'event', '🎉', '#FFEB3B', 12);

-- =============================================
-- 테스트용 전문가 프로필 (실제 운영시에는 삭제)
-- 주의: 실제 auth.users가 없으므로 임시 UUID 사용
-- =============================================

-- 테스트 전문가 1
insert into public.profiles (id, email, name, phone, avatar_url, is_provider) values
  ('11111111-1111-1111-1111-111111111111', 'provider1@test.com', '김청소', '010-1234-5678', null, true),
  ('22222222-2222-2222-2222-222222222222', 'provider2@test.com', '이이사', '010-2345-6789', null, true),
  ('33333333-3333-3333-3333-333333333333', 'provider3@test.com', '박수리', '010-3456-7890', null, true),
  ('44444444-4444-4444-4444-444444444444', 'provider4@test.com', '최레슨', '010-4567-8901', null, true),
  ('55555555-5555-5555-5555-555555555555', 'provider5@test.com', '정뷰티', '010-5678-9012', null, true);

-- =============================================
-- 샘플 서비스 데이터
-- =============================================

-- 청소 서비스
insert into public.services (provider_id, category_id, title, description, price, original_price, discount_percent, location, area, images, is_active, view_count) values
(
  '11111111-1111-1111-1111-111111111111',
  (select id from public.categories where slug = 'cleaning'),
  '꼼꼼한 가정집 입주청소',
  '이사 전/후 입주청소 전문입니다. 10년 경력의 전문 청소팀이 꼼꼼하게 청소해드립니다. 욕실, 주방, 베란다 등 구석구석 깨끗하게!',
  150000,
  200000,
  25,
  '서울',
  '강남구',
  '{}',
  true,
  128
),
(
  '11111111-1111-1111-1111-111111111111',
  (select id from public.categories where slug = 'cleaning'),
  '사무실 정기 청소 서비스',
  '사무실, 상가 정기 청소 서비스입니다. 주 1~3회 방문하여 깨끗한 업무 환경을 만들어 드립니다.',
  80000,
  null,
  null,
  '서울',
  '강남구',
  '{}',
  true,
  85
);

-- 이사 서비스
insert into public.services (provider_id, category_id, title, description, price, original_price, discount_percent, location, area, images, is_active, view_count) values
(
  '22222222-2222-2222-2222-222222222222',
  (select id from public.categories where slug = 'moving'),
  '원룸/투룸 소형이사 전문',
  '원룸, 투룸, 오피스텔 소형 이사 전문입니다. 포장부터 운반, 정리까지 원스톱 서비스!',
  250000,
  300000,
  17,
  '서울',
  '전체',
  '{}',
  true,
  256
),
(
  '22222222-2222-2222-2222-222222222222',
  (select id from public.categories where slug = 'moving'),
  '가정집 포장이사',
  '아파트, 빌라 가정집 포장이사 전문입니다. 꼼꼼한 포장과 안전한 운반을 약속드립니다.',
  500000,
  null,
  null,
  '서울',
  '전체',
  '{}',
  true,
  189
);

-- 수리 서비스
insert into public.services (provider_id, category_id, title, description, price, original_price, discount_percent, location, area, images, is_active, view_count) values
(
  '33333333-3333-3333-3333-333333333333',
  (select id from public.categories where slug = 'repair'),
  '에어컨 설치/수리 전문',
  '에어컨 설치, 이전, 수리 전문입니다. 벽걸이, 스탠드, 시스템에어컨 모두 가능합니다.',
  50000,
  null,
  null,
  '서울',
  '전체',
  '{}',
  true,
  312
),
(
  '33333333-3333-3333-3333-333333333333',
  (select id from public.categories where slug = 'repair'),
  '수도/보일러 수리',
  '수도 누수, 보일러 고장 등 긴급 수리 서비스입니다. 당일 방문 가능!',
  30000,
  null,
  null,
  '서울',
  '전체',
  '{}',
  true,
  445
);

-- 레슨 서비스
insert into public.services (provider_id, category_id, title, description, price, original_price, discount_percent, location, area, images, is_active, view_count) values
(
  '44444444-4444-4444-4444-444444444444',
  (select id from public.categories where slug = 'lesson'),
  '1:1 영어회화 레슨',
  '미국 유학파 출신 강사의 1:1 영어회화 레슨입니다. 비즈니스 영어, 일상 회화 모두 가능합니다.',
  40000,
  50000,
  20,
  '서울',
  '강남구',
  '{}',
  true,
  567
),
(
  '44444444-4444-4444-4444-444444444444',
  (select id from public.categories where slug = 'lesson'),
  '피아노 레슨 (성인/아동)',
  '음대 출신 전문 강사의 피아노 레슨입니다. 취미반, 입시반 모두 가능합니다.',
  35000,
  null,
  null,
  '서울',
  '서초구',
  '{}',
  true,
  234
);

-- 뷰티 서비스
insert into public.services (provider_id, category_id, title, description, price, original_price, discount_percent, location, area, images, is_active, view_count) values
(
  '55555555-5555-5555-5555-555555555555',
  (select id from public.categories where slug = 'beauty'),
  '출장 헤어&메이크업',
  '결혼식, 파티, 촬영 등 출장 헤어&메이크업 서비스입니다. 10년 경력의 전문 아티스트가 방문합니다.',
  100000,
  150000,
  33,
  '서울',
  '전체',
  '{}',
  true,
  389
),
(
  '55555555-5555-5555-5555-555555555555',
  (select id from public.categories where slug = 'beauty'),
  '네일아트 출장 서비스',
  '집에서 편하게 받는 네일아트 서비스입니다. 젤네일, 케어 모두 가능합니다.',
  45000,
  null,
  null,
  '서울',
  '전체',
  '{}',
  true,
  178
);

-- =============================================
-- 샘플 리뷰 데이터
-- =============================================

-- 테스트 고객 프로필
insert into public.profiles (id, email, name, phone, avatar_url, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'customer1@test.com', '테스트고객1', '010-1111-1111', null, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'customer2@test.com', '테스트고객2', '010-2222-2222', null, false);

-- 리뷰 추가
insert into public.reviews (service_id, user_id, rating, content) values
(
  (select id from public.services where title = '꼼꼼한 가정집 입주청소' limit 1),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  5,
  '정말 꼼꼼하게 청소해주셨어요! 특히 욕실이 새것처럼 깨끗해졌습니다. 강추합니다!'
),
(
  (select id from public.services where title = '꼼꼼한 가정집 입주청소' limit 1),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  4,
  '전반적으로 만족스러웠어요. 다음에도 이용할 예정입니다.'
),
(
  (select id from public.services where title = '원룸/투룸 소형이사 전문' limit 1),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  5,
  '빠르고 안전하게 이사해주셨어요. 물건 하나도 안 깨졌어요!'
),
(
  (select id from public.services where title = '1:1 영어회화 레슨' limit 1),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  5,
  '선생님이 친절하시고 수업이 재미있어요. 실력이 많이 늘었습니다!'
),
(
  (select id from public.services where title = '출장 헤어&메이크업' limit 1),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  5,
  '결혼식 메이크업 받았는데 정말 예쁘게 해주셨어요. 사진도 잘 받았습니다!'
);
