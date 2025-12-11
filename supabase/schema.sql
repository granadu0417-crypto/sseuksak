-- =============================================
-- 쓱싹 (Sseuksak) 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- UUID 확장 활성화
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. 사용자 프로필 테이블
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  phone text,
  avatar_url text,
  is_provider boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 프로필 RLS (Row Level Security) 정책
alter table public.profiles enable row level security;

create policy "프로필은 누구나 조회 가능" on public.profiles
  for select using (true);

create policy "사용자는 자신의 프로필만 수정 가능" on public.profiles
  for update using (auth.uid() = id);

create policy "사용자는 자신의 프로필만 삽입 가능" on public.profiles
  for insert with check (auth.uid() = id);

-- 새 사용자 가입 시 프로필 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 2. 카테고리 테이블
-- =============================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  icon text not null,
  color text not null default '#FF6B35',
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 카테고리 RLS
alter table public.categories enable row level security;

create policy "카테고리는 누구나 조회 가능" on public.categories
  for select using (true);

-- =============================================
-- 3. 서비스 테이블
-- =============================================
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  title text not null,
  description text not null,
  price integer not null,
  original_price integer,
  discount_percent integer,
  location text not null,
  area text not null,
  images text[] default '{}',
  is_active boolean default true,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 서비스 RLS
alter table public.services enable row level security;

create policy "활성화된 서비스는 누구나 조회 가능" on public.services
  for select using (is_active = true);

create policy "전문가는 자신의 서비스 관리 가능" on public.services
  for all using (auth.uid() = provider_id);

-- 서비스 인덱스
create index services_category_id_idx on public.services(category_id);
create index services_provider_id_idx on public.services(provider_id);
create index services_location_idx on public.services(location);
create index services_created_at_idx on public.services(created_at desc);

-- =============================================
-- 4. 리뷰 테이블
-- =============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text not null,
  images text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 리뷰 RLS
alter table public.reviews enable row level security;

create policy "리뷰는 누구나 조회 가능" on public.reviews
  for select using (true);

create policy "사용자는 자신의 리뷰만 작성/수정 가능" on public.reviews
  for all using (auth.uid() = user_id);

-- 리뷰 인덱스
create index reviews_service_id_idx on public.reviews(service_id);
create index reviews_user_id_idx on public.reviews(user_id);

-- =============================================
-- 5. 찜하기 테이블
-- =============================================
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, service_id)
);

-- 찜하기 RLS
alter table public.favorites enable row level security;

create policy "사용자는 자신의 찜 목록만 관리 가능" on public.favorites
  for all using (auth.uid() = user_id);

-- =============================================
-- 6. 채팅방 테이블
-- =============================================
create table public.chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  last_message text,
  last_message_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(service_id, customer_id)
);

-- 채팅방 RLS
alter table public.chat_rooms enable row level security;

create policy "참여자만 채팅방 접근 가능" on public.chat_rooms
  for all using (auth.uid() = customer_id or auth.uid() = provider_id);

-- =============================================
-- 7. 채팅 메시지 테이블
-- =============================================
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 채팅 메시지 RLS
alter table public.chat_messages enable row level security;

create policy "채팅방 참여자만 메시지 접근 가능" on public.chat_messages
  for all using (
    exists (
      select 1 from public.chat_rooms
      where id = room_id
      and (customer_id = auth.uid() or provider_id = auth.uid())
    )
  );

-- 채팅 메시지 인덱스
create index chat_messages_room_id_idx on public.chat_messages(room_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at);

-- =============================================
-- 8. 서비스 통계 뷰 (평균 평점, 리뷰 수)
-- =============================================
create or replace view public.service_stats as
select
  s.id as service_id,
  coalesce(avg(r.rating), 0) as average_rating,
  count(r.id) as review_count
from public.services s
left join public.reviews r on s.id = r.service_id
group by s.id;

-- =============================================
-- updated_at 자동 업데이트 트리거
-- =============================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_services_updated_at
  before update on public.services
  for each row execute procedure public.update_updated_at_column();

create trigger update_reviews_updated_at
  before update on public.reviews
  for each row execute procedure public.update_updated_at_column();
