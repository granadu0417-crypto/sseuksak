-- =============================================
-- 쓱싹 (Sseuksak) Storage 설정
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- =============================================

-- =============================================
-- 1. 서비스 이미지 버킷 생성
-- =============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-images',
  'service-images',
  true,  -- 공개 버킷 (URL로 직접 접근 가능)
  5242880,  -- 5MB 제한
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =============================================
-- 2. 프로필 이미지 버킷 생성
-- =============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,  -- 공개 버킷
  2097152,  -- 2MB 제한
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- =============================================
-- 3. 리뷰 이미지 버킷 생성
-- =============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,  -- 공개 버킷
  5242880,  -- 5MB 제한
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =============================================
-- 4. Storage RLS 정책 - service-images
-- =============================================

-- 누구나 서비스 이미지 조회 가능
create policy "서비스 이미지 공개 조회"
on storage.objects for select
using (bucket_id = 'service-images');

-- 인증된 사용자만 업로드 가능
create policy "인증된 사용자 서비스 이미지 업로드"
on storage.objects for insert
with check (
  bucket_id = 'service-images'
  and auth.role() = 'authenticated'
);

-- 본인이 업로드한 이미지만 삭제 가능 (폴더 구조: user_id/filename)
create policy "본인 서비스 이미지 삭제"
on storage.objects for delete
using (
  bucket_id = 'service-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- 5. Storage RLS 정책 - avatars
-- =============================================

-- 누구나 프로필 이미지 조회 가능
create policy "프로필 이미지 공개 조회"
on storage.objects for select
using (bucket_id = 'avatars');

-- 인증된 사용자만 업로드 가능
create policy "인증된 사용자 프로필 이미지 업로드"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 본인 프로필 이미지만 수정/삭제 가능
create policy "본인 프로필 이미지 수정"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "본인 프로필 이미지 삭제"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- 6. Storage RLS 정책 - review-images
-- =============================================

-- 누구나 리뷰 이미지 조회 가능
create policy "리뷰 이미지 공개 조회"
on storage.objects for select
using (bucket_id = 'review-images');

-- 인증된 사용자만 업로드 가능
create policy "인증된 사용자 리뷰 이미지 업로드"
on storage.objects for insert
with check (
  bucket_id = 'review-images'
  and auth.role() = 'authenticated'
);

-- 본인이 업로드한 리뷰 이미지만 삭제 가능
create policy "본인 리뷰 이미지 삭제"
on storage.objects for delete
using (
  bucket_id = 'review-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
