-- 관리자 콘텐츠·수수료 기능 (schema.sql 을 먼저 실행한 뒤, SQL Editor 에서 이 파일 전체를 실행하세요)
-- 여러 번 실행해도 되도록 작성되어 있습니다.
--
-- 포함: 광고바 · 공지사항 · 팝업 · 수수료율 설정 · 프로모션 · 예약별 수수료율 기록 · 관리 이력
--
-- 수수료 원칙
--  1) 요율은 서버에서만 정합니다. 화면(클라이언트)이 보낸 값은 쓰지 않습니다.
--  2) 예약이 만들어지는 순간의 요율을 booking_fees 에 고정해 둡니다.
--     이후 기본 요율이나 프로모션을 바꿔도 이미 만들어진 예약·월 계약의 요율은 바뀌지 않습니다.
--  3) 진행 중인 프로모션이 여러 개 겹치면 가장 낮은 요율 하나만 적용합니다. (합산하지 않습니다)
--  4) 요율표(fee_config, promotions)는 관리자만 읽을 수 있습니다. 호스트는 자기 예약에 적용된 요율만 읽을 수 있습니다.

create or replace function kst_today() returns date language sql stable as $$
  select (now() at time zone 'Asia/Seoul')::date $$;

-- ===== 수수료율 =====
create table if not exists fee_config (
  id int primary key default 1 check (id = 1),
  rate numeric(5,4) not null check (rate >= 0 and rate <= 1),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
insert into fee_config(id, rate) values (1, 0.15) on conflict (id) do nothing;

create table if not exists promotions (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 60),
  rate numeric(5,4) not null check (rate >= 0 and rate <= 1),     -- 프로모션 기간 중 적용되는 수수료율 (할인율이 아니라 '요율' 자체)
  starts_on date not null,
  ends_on date not null,
  units text[] not null default '{day,month,year}',                -- 적용 이용 단위
  target text not null default 'all' check (target in ('all','new_host')),
  new_days int not null default 90 check (new_days between 1 and 3650),   -- target 이 new_host 일 때: 가입 후 N일 이내 원장님
  active boolean not null default true,
  memo text not null default '',
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (cardinality(units) > 0 and units <@ array['day','month','year'])
);

-- 예약 한 건에 적용된 요율 (예약 생성 시 서버가 기록, 이후 수정 불가)
create table if not exists booking_fees (
  booking_id bigint primary key references bookings(id) on delete cascade,
  host_id uuid not null references profiles(id) on delete cascade,
  rate numeric(5,4) not null,
  promo_id bigint references promotions(id) on delete set null,
  promo_name text not null default '',
  created_at timestamptz not null default now()
);

-- 지금 이 원장님·이용 단위에 적용되는 요율 (프로모션 중 최저, 없으면 기본 요율)
create or replace function fee_for(hid uuid, u text, d date default kst_today())
returns table(rate numeric, promo_id bigint, promo_name text)
language plpgsql stable security definer set search_path = public as $$
begin
  return query
    select p.rate, p.id, p.name
    from promotions p join profiles h on h.id = hid
    where p.active and d between p.starts_on and p.ends_on and u = any(p.units)
      and (p.target = 'all' or (p.target = 'new_host' and d <= (h.created_at at time zone 'Asia/Seoul')::date + p.new_days))
    order by p.rate asc, p.id desc
    limit 1;
  if not found then
    return query select c.rate, null::bigint, ''::text from fee_config c where c.id = 1;
  end if;
end $$;

create or replace function bookings_fee_snapshot() returns trigger language plpgsql security definer set search_path = public as $$
declare hid uuid; f record;
begin
  select host_id into hid from spaces where id = new.space_id;
  select * into f from fee_for(hid, new.unit);
  insert into booking_fees(booking_id, host_id, rate, promo_id, promo_name) values (new.id, hid, f.rate, f.promo_id, f.promo_name);
  return new;
end $$;
drop trigger if exists bookings_fee on bookings;
create trigger bookings_fee after insert on bookings for each row execute function bookings_fee_snapshot();

-- 이미 있는 예약에는 기본 요율을 기록합니다 (한 번만 채워지고, 다시 실행해도 덮어쓰지 않습니다)
insert into booking_fees(booking_id, host_id, rate)
select b.id, s.host_id, (select rate from fee_config where id = 1)
from bookings b join spaces s on s.id = b.space_id
on conflict (booking_id) do nothing;

-- 관리자가 요율을 바꿔 보기 전에 '지금 이 조건이면 몇 %가 적용되는지' 미리 확인하는 함수 (관리자 전용)
create or replace function fee_preview(u text, new_host boolean default false)
returns table(rate numeric, promo_id bigint, promo_name text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception '관리자만 사용할 수 있습니다'; end if;
  return query
    select p.rate, p.id, p.name from promotions p
    where p.active and kst_today() between p.starts_on and p.ends_on and u = any(p.units)
      and (p.target = 'all' or (p.target = 'new_host' and new_host))
    order by p.rate asc, p.id desc limit 1;
  if not found then
    return query select c.rate, null::bigint, ''::text from fee_config c where c.id = 1;
  end if;
end $$;

-- ===== 광고바 · 공지사항 · 팝업 =====
create table if not exists adbar (
  id int primary key default 1 check (id = 1),
  text text not null default '' check (char_length(text) <= 120),
  tag text not null default 'AD' check (char_length(tag) <= 8),
  link text not null default '' check (link = '' or link ~ '^(https://|intro:|guest:)'),
  bg text not null default '#141414' check (bg ~ '^#[0-9a-fA-F]{6}$'),
  fg text not null default '#f0f0f0' check (fg ~ '^#[0-9a-fA-F]{6}$'),
  active boolean not null default true,
  starts_on date,
  ends_on date,
  updated_at timestamptz not null default now()
);

create table if not exists notices (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 100),
  body text not null default '' check (char_length(body) <= 5000),
  pinned boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists popups (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 60),
  body text not null default '' check (char_length(body) <= 500),
  image text not null default '' check (image = '' or image ~ '^https://'),
  link text not null default '' check (link = '' or link ~ '^(https://|intro:|guest:)'),
  link_label text not null default '자세히 보기' check (char_length(link_label) <= 12),
  starts_on date not null,
  ends_on date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- ===== 관리 이력 (누가 언제 무엇을 바꿨는지) =====
create table if not exists admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid,
  admin_name text not null default '',
  target text not null,
  action text not null,
  before jsonb,
  after jsonb
);

create or replace function log_change() returns trigger language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  select name into nm from profiles where id = auth.uid();
  if tg_op = 'INSERT' then
    insert into admin_log(admin_id, admin_name, target, action, after) values (auth.uid(), coalesce(nm,''), tg_table_name, tg_op, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into admin_log(admin_id, admin_name, target, action, before, after) values (auth.uid(), coalesce(nm,''), tg_table_name, tg_op, to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into admin_log(admin_id, admin_name, target, action, before) values (auth.uid(), coalesce(nm,''), tg_table_name, tg_op, to_jsonb(old));
    return old;
  end if;
end $$;

drop trigger if exists log_fee_config on fee_config;
create trigger log_fee_config after insert or update or delete on fee_config for each row execute function log_change();
drop trigger if exists log_promotions on promotions;
create trigger log_promotions after insert or update or delete on promotions for each row execute function log_change();
drop trigger if exists log_adbar on adbar;
create trigger log_adbar after insert or update or delete on adbar for each row execute function log_change();
drop trigger if exists log_notices on notices;
create trigger log_notices after insert or update or delete on notices for each row execute function log_change();
drop trigger if exists log_popups on popups;
create trigger log_popups after insert or update or delete on popups for each row execute function log_change();

-- ===== 행 단위 보안(RLS) =====
alter table fee_config enable row level security;
alter table promotions enable row level security;
alter table booking_fees enable row level security;
alter table adbar enable row level security;
alter table notices enable row level security;
alter table popups enable row level security;
alter table admin_log enable row level security;

drop policy if exists fee_config_admin on fee_config;
create policy fee_config_admin on fee_config for all using (is_admin()) with check (is_admin());
drop policy if exists promotions_admin on promotions;
create policy promotions_admin on promotions for all using (is_admin()) with check (is_admin());

-- booking_fees: 쓰기 정책이 없으므로 서버 트리거만 기록할 수 있습니다. 읽기는 관리자와 해당 공간의 호스트만.
drop policy if exists booking_fees_select on booking_fees;
create policy booking_fees_select on booking_fees for select using (is_admin() or host_id = auth.uid());

drop policy if exists adbar_select on adbar;
create policy adbar_select on adbar for select using (true);
drop policy if exists adbar_admin on adbar;
create policy adbar_admin on adbar for all using (is_admin()) with check (is_admin());

drop policy if exists notices_select on notices;
create policy notices_select on notices for select using (published or is_admin());
drop policy if exists notices_admin on notices;
create policy notices_admin on notices for all using (is_admin()) with check (is_admin());

drop policy if exists popups_select on popups;
create policy popups_select on popups for select using (active or is_admin());
drop policy if exists popups_admin on popups;
create policy popups_admin on popups for all using (is_admin()) with check (is_admin());

drop policy if exists admin_log_select on admin_log;
create policy admin_log_select on admin_log for select using (is_admin());

grant execute on function fee_preview(text, boolean) to authenticated;

-- ===== 사이트 이미지 저장소 (팝업 이미지): 누구나 보기, 관리자만 올리기 =====
insert into storage.buckets(id, name, public) values ('site','site',true) on conflict (id) do nothing;
drop policy if exists site_read on storage.objects;
create policy site_read on storage.objects for select using (bucket_id = 'site');
drop policy if exists site_write on storage.objects;
create policy site_write on storage.objects for insert to authenticated with check (bucket_id = 'site' and is_admin());
drop policy if exists site_delete on storage.objects;
create policy site_delete on storage.objects for delete to authenticated using (bucket_id = 'site' and is_admin());

-- 첫 광고바 (지금 사이트에 있는 문구)
insert into adbar(id, text, tag, link) values (1, '원장님, 비어 있는 의자로 월세 받아보세요 · 등록비 없음', 'AD', 'intro:hostcenter') on conflict (id) do nothing;

-- 첫 공지사항 (공지가 하나도 없을 때만 들어갑니다)
insert into notices(title, body, pinned)
select * from (values
  ('프로체어에 오신 것을 환영합니다', E'프로체어는 국가자격을 확인한 원장님과 디자이너를 연결하는 미용 샵인샵 공간 임대 서비스입니다.\n\n원장님은 비어 있는 의자를 등록하고, 디자이너는 일·월·년 단위로 원하는 공간을 예약할 수 있습니다.', true),
  ('예약 이용 안내', E'예약 요청을 보내면 원장님이 수락한 뒤 확정되고, 입금 방법은 확정 후 안내해 드립니다.\n\n원장님과 디자이너 모두 국가자격 검수가 끝나야 공간 공개와 예약이 가능합니다.', false)
) v(title, body, pinned)
where not exists (select 1 from notices);
