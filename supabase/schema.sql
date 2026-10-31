-- ProChair 운영 DB 스키마 (Supabase SQL Editor에 통째로 붙여넣어 실행)
-- 여러 번 실행해도 되도록 작성되어 있습니다.

create extension if not exists btree_gist;

-- ===== 회원 =====
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'guest' check (role in ('host','guest','admin')),
  name text not null default '',
  phone text not null default '',
  store text not null default '',            -- 호스트: 매장(상호) 이름. spaces.host 값으로 쓰임
  area text not null default '',
  licenses text[] not null default '{}',     -- 인증된 시술 가능 업종
  own_report boolean not null default false, -- 게스트: 본인 영업신고 보유
  verified boolean not null default false,   -- 관리자가 자격 진위확인을 마쳤는가
  created_at timestamptz not null default now()
);

-- 가입 시 role 은 host/guest 만 허용. admin 은 SQL 로만 부여합니다. (README 참고)
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'role','guest');
begin
  if r not in ('host','guest') then r := 'guest'; end if;
  insert into profiles(id, role, name, phone, store, area)
  values (new.id, r, left(regexp_replace(coalesce(new.raw_user_meta_data->>'name',''), '[<>]', '', 'g'), 30), coalesce(new.raw_user_meta_data->>'phone',''),
          left(regexp_replace(coalesce(new.raw_user_meta_data->>'store',''), '[<>]', '', 'g'), 30), coalesce(new.raw_user_meta_data->>'area',''));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- ===== 공간 =====
create table if not exists spaces (
  id bigint generated always as identity primary key,
  host_id uuid not null references profiles(id) on delete cascade,
  host text not null,                         -- 호스트 상호 (화면 표시·소유 판별용)
  name text not null,
  area text not null,
  types text[] not null default '{}',
  seats int not null default 1 check (seats between 1 and 30),
  free int not null default 1 check (free between 0 and 30),
  day int not null default 0 check (day >= 0),
  month int not null default 0 check (month >= 0),
  year int not null default 0 check (year >= 0),
  deposit int not null default 0 check (deposit >= 0),
  ops int not null default 0 check (ops >= 0),
  share boolean not null default false,
  days text[] not null default '{}',
  svc text[] not null default '{}',
  pyeong int, shampoo int not null default 0, beds int not null default 0,
  open_t text not null default '10:00', close_t text not null default '22:00',
  acc24 boolean not null default false,
  acc_from text not null default '06:00', acc_to text not null default '23:00',
  day_hours int not null default 12 check (day_hours between 1 and 24),
  photos text[] not null default '{}',
  deal jsonb,
  status text not null default '검수 대기' check (status in ('검수 대기','공개','사전 접수','비공개')),
  created_at timestamptz not null default now(),
  check (free <= seats)
);
create index if not exists spaces_status_idx on spaces(status);

-- 상세 주소·출입 코드: 호스트 본인, 관리자, 확정된 예약의 게스트만 읽을 수 있습니다.
create table if not exists space_private (
  space_id bigint primary key references spaces(id) on delete cascade,
  addr text not null default '',
  code text not null default ''
);

-- ===== 예약 =====
create table if not exists bookings (
  id bigint generated always as identity primary key,
  space_id bigint not null references spaces(id) on delete cascade,
  guest_id uuid not null references profiles(id) on delete cascade,
  guest text not null,
  g_type text not null,
  unit text not null check (unit in ('day','month','year')),
  qty int not null check (qty >= 1),
  start date not null,
  time text not null default '10:00',
  contract text not null default 'freelance' check (contract in ('freelance','own')),
  price int not null default 0,               -- 서버(트리거)가 계산합니다. 클라이언트 값은 무시됩니다.
  status text not null default '요청' check (status in ('요청','확정','거절','완료','취소')),
  created_at timestamptz not null default now()
);
create index if not exists bookings_space_idx on bookings(space_id);
create index if not exists bookings_guest_idx on bookings(guest_id);

-- 월 단위 계약 (예약 수락 시 생성)
create table if not exists leases (
  id bigint generated always as identity primary key,
  space_id bigint not null references spaces(id) on delete cascade,
  booking_id bigint references bookings(id) on delete set null,
  guest_id uuid not null references profiles(id) on delete cascade,
  guest text not null,
  g_type text not null,
  unit text not null default 'month',
  rent int not null, deposit int not null, ops int not null default 0,
  start date not null, months int not null, pay_day int not null,
  this_month text not null default '결제 예정' check (this_month in ('결제 완료','결제 예정','미납','알림 발송')),
  method text not null default '가상계좌',
  paid_at text not null default '',
  settle text not null default '정산 보류' check (settle in ('정산 보류','지급 대기','지급 완료','청구 대기')),
  settle_at text not null default '',
  first boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id bigint generated always as identity primary key,
  booking_id bigint not null unique references bookings(id) on delete cascade,
  space_id bigint not null references spaces(id) on delete cascade,
  guest_id uuid not null references profiles(id) on delete cascade,
  guest text not null,
  rating int not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 300),
  reply text not null default '',
  date date not null default current_date
);

-- 자격·영업신고증 검수 요청
create table if not exists verifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  space_id bigint references spaces(id) on delete cascade,
  who text not null,
  kind text not null check (kind in ('호스트','게스트')),
  doc text not null default '',
  types text[] not null default '{}',
  target text not null default '',
  files text[] not null default '{}',         -- docs 버킷 안의 파일 경로
  status text not null default '대기' check (status in ('대기','승인','반려')),
  reason text not null default '',
  date date not null default current_date
);

-- ===== 서버 측 검증 =====
create or replace function deal_price(s spaces, u text) returns int language sql stable as $$
  select case
    when s.deal is not null and (s.deal->>'until') >= to_char((now() at time zone 'Asia/Seoul')::date,'YYYY-MM-DD')
         and u = 'day' and coalesce((s.deal->>'day')::int,0) > 0 and (s.deal->>'day')::int < s.day then (s.deal->>'day')::int
    when s.deal is not null and (s.deal->>'until') >= to_char((now() at time zone 'Asia/Seoul')::date,'YYYY-MM-DD')
         and u = 'month' and coalesce((s.deal->>'month')::int,0) > 0 and (s.deal->>'month')::int < s.month then (s.deal->>'month')::int
    -- 년 요금은 월 할인과 같은 비율로 내립니다 (월 단위보다 비싸지는 일이 없도록)
    when s.deal is not null and (s.deal->>'until') >= to_char((now() at time zone 'Asia/Seoul')::date,'YYYY-MM-DD')
         and u = 'year' and s.month > 0 and coalesce((s.deal->>'month')::int,0) > 0 and (s.deal->>'month')::int < s.month
      then (round(coalesce(nullif(s.year,0), s.month*12) * (s.deal->>'month')::numeric / s.month / 100) * 100)::int
    when u = 'day' then s.day
    when u = 'year' then coalesce(nullif(s.year,0), s.month*12)
    else s.month end $$;

create or replace function bookings_before_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare s spaces; p profiles; used int; i int; a timestamp; e timestamp;
begin
  select * into p from profiles where id = new.guest_id;
  select * into s from spaces where id = new.space_id;
  if p.id is distinct from auth.uid() then raise exception '본인 명의로만 예약할 수 있습니다'; end if;
  if p.role <> 'guest' then raise exception '디자이너 계정만 예약할 수 있습니다'; end if;
  if not p.verified then raise exception '국가자격 검수가 끝나야 예약할 수 있습니다'; end if;
  if not (new.g_type = any(p.licenses)) then raise exception '이 업종의 국가자격이 없습니다'; end if;
  if s.status <> '공개' then raise exception '예약할 수 없는 공간입니다'; end if;
  if not (new.g_type = any(s.types)) then raise exception '매장 신고 업종에 없는 시술입니다'; end if;
  if new.contract = 'own' and not (s.share and p.own_report) then raise exception '각자 영업신고 계약을 할 수 없습니다'; end if;
  if new.start < (now() at time zone 'Asia/Seoul')::date then raise exception '지난 날짜는 예약할 수 없습니다'; end if;
  if new.unit = 'day' and new.qty > 30 then raise exception '일 단위는 최대 30일입니다'; end if;
  if new.unit = 'month' and new.qty > 12 then raise exception '월 단위는 최대 12개월입니다'; end if;
  if new.unit = 'year' and new.qty > 3 then raise exception '년 단위는 최대 3년입니다'; end if;
  if new.unit = 'day' then
    -- 임대 가능 요일과 출입 가능 시간을 서버에서도 확인합니다
    for i in 0..new.qty-1 loop
      if not ((array['일','월','화','수','목','금','토'])[extract(dow from (new.start + i))::int + 1] = any(s.days)) then
        raise exception '임대 가능 요일이 아닙니다 (가능: %)', array_to_string(s.days, '·'); end if;
    end loop;
    if not s.acc24 and (extract(epoch from new.time::time)/60 < extract(epoch from s.acc_from::time)/60
       or extract(epoch from new.time::time)/60 + s.day_hours*60 > extract(epoch from s.acc_to::time)/60) then
      raise exception '출입 가능 시간(% ~ %) 안에서만 예약할 수 있습니다', s.acc_from, s.acc_to; end if;
  end if;
  new.guest := p.name;
  new.status := '요청';
  new.price := deal_price(s, new.unit);
  if new.unit = 'day' then
    -- 같은 시간대에 이미 예약된 건수가 임대 좌석 수 이상이면 거절 (JS overlapCount 와 같은 규칙)
    select count(*) into used from bookings b
      where b.space_id = new.space_id and b.unit = 'day' and b.status in ('요청','확정')
        and exists (
          select 1 from generate_series(0, b.qty-1) bi, generate_series(0, new.qty-1) ni
          where (b.start + bi + b.time::time) < (new.start + ni + new.time::time) + make_interval(hours => s.day_hours)
            and (new.start + ni + new.time::time) < (b.start + bi + b.time::time) + make_interval(hours => s.day_hours));
    if used >= s.free then raise exception '이 시간대는 임대 좌석이 모두 예약되어 있습니다'; end if;
  end if;
  return new;
end $$;
drop trigger if exists bookings_bi on bookings;
create trigger bookings_bi before insert on bookings for each row execute function bookings_before_insert();

-- 호스트는 요청 상태의 예약을 확정/거절만, 게스트는 본인 요청을 취소만 할 수 있습니다.
create or replace function bookings_before_update() returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if is_admin() or current_setting('app.sync', true) = '1' then return new; end if;
  select host_id into owner from spaces where id = old.space_id;
  if new.space_id <> old.space_id or new.guest_id <> old.guest_id or new.price <> old.price or new.qty <> old.qty
     or new.start <> old.start or new.unit <> old.unit then raise exception '예약 내용은 바꿀 수 없습니다'; end if;
  if auth.uid() = owner then
    if old.status <> '요청' or new.status not in ('확정','거절') then raise exception '요청 상태의 예약만 수락·거절할 수 있습니다'; end if;
  elsif auth.uid() = old.guest_id then
    if old.status <> '요청' or new.status <> '취소' then raise exception '호스트 확인 전 요청만 취소할 수 있습니다'; end if;
  else raise exception '권한이 없습니다'; end if;
  return new;
end $$;
drop trigger if exists bookings_bu on bookings;
create trigger bookings_bu before update on bookings for each row execute function bookings_before_update();

-- 종료일이 지난 확정 예약을 '완료'로 바꿉니다. 로그인한 사용자가 접속할 때 호출됩니다.
create or replace function sync_completed() returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.sync','1',true);   -- bookings_before_update 가 이 호출은 통과시킵니다
  update bookings set status = '완료'
  where status = '확정' and (
    (unit = 'day'   and start + qty - 1 < current_date) or
    (unit = 'month' and (start + make_interval(months => qty))::date <= current_date) or
    (unit = 'year'  and (start + make_interval(years => qty))::date <= current_date));
end $$;

-- 게스트에게는 다른 사람의 예약 정보를 주지 않고, 시간대 점유 정보만 줍니다. (예약 가능 여부 표시용)
create or replace function busy_slots() returns table(id bigint, space_id bigint, qty int, start date, "time" text)
language sql stable security definer set search_path = public as $$
  select id, space_id, qty, start, time from bookings where unit = 'day' and status in ('요청','확정') and start + qty >= current_date $$;

-- 후기: 본인의 완료된 예약에만
create or replace function reviews_before_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare b bookings;
begin
  select * into b from bookings where id = new.booking_id;
  if b.guest_id is distinct from auth.uid() or b.status <> '완료' then raise exception '이용을 완료한 예약에만 후기를 남길 수 있습니다'; end if;
  new.space_id := b.space_id; new.guest_id := b.guest_id; new.guest := b.guest; new.reply := ''; new.date := current_date;
  return new;
end $$;
drop trigger if exists reviews_bi on reviews;
create trigger reviews_bi before insert on reviews for each row execute function reviews_before_insert();

-- 호스트는 답글(reply)만 바꿀 수 있습니다.
create or replace function reviews_before_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if is_admin() then return new; end if;
  if new.rating <> old.rating or new.text <> old.text or new.booking_id <> old.booking_id or new.space_id <> old.space_id then
    raise exception '후기 내용은 바꿀 수 없습니다'; end if;
  return new;
end $$;
drop trigger if exists reviews_bu on reviews;
create trigger reviews_bu before update on reviews for each row execute function reviews_before_update();

-- 호스트가 공간 status 를 직접 '공개'로 못 올리게 하고, 관리자 승인 결과만 반영합니다.
create or replace function spaces_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := case when new.types && array['반영구','SMP'] then '사전 접수' else '검수 대기' end;
  else
    new.status := old.status; new.host_id := old.host_id; new.host := old.host;
  end if;
  return new;
end $$;
drop trigger if exists spaces_g on spaces;
create trigger spaces_g before insert or update on spaces for each row execute function spaces_guard();

-- 가입자가 profiles 의 권한 컬럼(role, verified, licenses)을 스스로 바꾸지 못하게 막습니다.
create or replace function profiles_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if is_admin() or auth.uid() is null then return new; end if;
  new.role := old.role; new.verified := old.verified; new.licenses := old.licenses;
  return new;
end $$;
drop trigger if exists profiles_g on profiles;
create trigger profiles_g before update on profiles for each row execute function profiles_guard();

-- ===== 행 단위 보안(RLS) =====
alter table profiles enable row level security;
alter table spaces enable row level security;
alter table space_private enable row level security;
alter table bookings enable row level security;
alter table leases enable row level security;
alter table reviews enable row level security;
alter table verifications enable row level security;

drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select using (id = auth.uid() or is_admin());
drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update using (id = auth.uid() or is_admin());

-- RLS 재귀를 피하려고 security definer 로 '내가 예약한 공간인가'를 확인합니다.
create or replace function i_booked(sid bigint) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from bookings where space_id = sid and guest_id = auth.uid()) $$;

drop policy if exists spaces_select on spaces;
create policy spaces_select on spaces for select using (status in ('공개') or host_id = auth.uid() or is_admin() or i_booked(id));
drop policy if exists spaces_insert on spaces;
create policy spaces_insert on spaces for insert with check (host_id = auth.uid() and exists(select 1 from profiles where id = auth.uid() and role = 'host'));
drop policy if exists spaces_update on spaces;
create policy spaces_update on spaces for update using (host_id = auth.uid() or is_admin());
drop policy if exists spaces_delete on spaces;
create policy spaces_delete on spaces for delete using (host_id = auth.uid() or is_admin());

drop policy if exists sp_private_select on space_private;
create policy sp_private_select on space_private for select using (
  is_admin()
  or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid())
  or exists(select 1 from bookings b where b.space_id = space_private.space_id and b.guest_id = auth.uid() and b.status in ('확정','완료')));
drop policy if exists sp_private_write on space_private;
create policy sp_private_write on space_private for all
  using (exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()) or is_admin())
  with check (exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()) or is_admin());

drop policy if exists bookings_select on bookings;
create policy bookings_select on bookings for select using (
  guest_id = auth.uid() or is_admin() or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()));
drop policy if exists bookings_insert on bookings;
create policy bookings_insert on bookings for insert with check (guest_id = auth.uid());
drop policy if exists bookings_update on bookings;
create policy bookings_update on bookings for update using (
  guest_id = auth.uid() or is_admin() or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()));

drop policy if exists leases_select on leases;
create policy leases_select on leases for select using (
  guest_id = auth.uid() or is_admin() or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()));
drop policy if exists leases_insert on leases;
create policy leases_insert on leases for insert with check (
  is_admin() or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()));
drop policy if exists leases_update on leases;
create policy leases_update on leases for update using (
  is_admin() or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()));

drop policy if exists reviews_select on reviews;
create policy reviews_select on reviews for select using (true);
drop policy if exists reviews_insert on reviews;
create policy reviews_insert on reviews for insert with check (guest_id = auth.uid());
drop policy if exists reviews_update on reviews;
create policy reviews_update on reviews for update using (
  is_admin() or exists(select 1 from spaces s where s.id = space_id and s.host_id = auth.uid()));

drop policy if exists verif_select on verifications;
create policy verif_select on verifications for select using (user_id = auth.uid() or is_admin());
drop policy if exists verif_insert on verifications;
create policy verif_insert on verifications for insert with check (user_id = auth.uid() and status = '대기');
drop policy if exists verif_update on verifications;
create policy verif_update on verifications for update using (is_admin());

-- 관리자가 검수를 승인하면 프로필/공간 상태를 함께 반영합니다.
create or replace function verifications_after_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = '승인' and old.status <> '승인' then
    if new.space_id is not null then
      update spaces set status = case when types && array['반영구','SMP'] then '사전 접수' else '공개' end where id = new.space_id;
    end if;
    if new.target = '회원가입' then
      update profiles set verified = true, licenses = new.types where id = new.user_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists verif_au on verifications;
create trigger verif_au after update on verifications for each row execute function verifications_after_update();

grant execute on function busy_slots() to authenticated, anon;
grant execute on function sync_completed() to authenticated;

-- ===== 파일 저장소 =====
-- 매장 사진: 누구나 볼 수 있음 / 증빙 서류(자격증·영업신고증): 본인과 관리자만
insert into storage.buckets(id, name, public) values ('space-photos','space-photos',true) on conflict (id) do nothing;
insert into storage.buckets(id, name, public) values ('docs','docs',false) on conflict (id) do nothing;

drop policy if exists photos_read on storage.objects;
create policy photos_read on storage.objects for select using (bucket_id = 'space-photos');
drop policy if exists photos_write on storage.objects;
create policy photos_write on storage.objects for insert to authenticated
  with check (bucket_id = 'space-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists photos_delete on storage.objects;
create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'space-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists docs_read on storage.objects;
create policy docs_read on storage.objects for select to authenticated
  using (bucket_id = 'docs' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
drop policy if exists docs_write on storage.objects;
create policy docs_write on storage.objects for insert to authenticated
  with check (bucket_id = 'docs' and (storage.foldername(name))[1] = auth.uid()::text);
