-- 샘플 공간 6곳 (프로헤어·프로네일·프로메이크업·프로살롱·프로24[24시간]·프로할인[할인 적용]). Supabase SQL Editor에서 실행하세요.
-- 소유자는 최고관리자 계정(vivalabseoul@gmail.com)이고, 다시 실행해도 중복되지 않습니다.
-- 지우고 싶으면 맨 아래 주석의 delete 문을 실행하세요.

do $$
declare uid uuid; sid bigint;
begin
  select id into uid from auth.users where email = 'vivalabseoul@gmail.com';
  if uid is null then raise exception '최고관리자 계정을 찾을 수 없습니다'; end if;

  update profiles set store = '프로체어' where id = uid;

  -- 서버 규칙(승인 전에는 비공개)을 샘플 입력 동안만 끕니다
  alter table spaces disable trigger spaces_g;
  delete from spaces where host_id = uid and name in ('프로헤어','프로네일','프로메이크업','프로살롱','프로24','프로할인');

  insert into spaces(host_id, host, name, area, types, seats, free, day, month, year, deposit, ops, share, days, svc,
                     pyeong, shampoo, beds, open_t, close_t, acc24, acc_from, acc_to, day_hours, status)
  values (uid, '프로체어', '프로헤어', '서울 마포구', '{헤어}', 6, 2, 60000, 900000, 10260000, 1000000, 100000, false,
          '{화,수,목,금,토}', '{"샴푸대 사용","펌·열기구 사용","타월·가운 세탁","기본 재료 (샴푸·린스)","카드 단말기","와이파이"}',
          24, 3, 0, '10:00', '22:00', false, '06:00', '23:30', 12, '공개')
  returning id into sid;
  insert into space_private values (sid, '서울 마포구 서교동 000-0, 2층', '2580#');

  insert into spaces(host_id, host, name, area, types, seats, free, day, month, year, deposit, ops, share, days, svc,
                     pyeong, shampoo, beds, open_t, close_t, acc24, acc_from, acc_to, day_hours, status)
  values (uid, '프로체어', '프로네일', '서울 성동구', '{네일}', 4, 2, 35000, 500000, 5700000, 300000, 50000, true,
          '{화,수,목,금,토}', '{"소독·위생 관리","카드 단말기","와이파이","개인 수납함"}',
          14, 0, 0, '11:00', '21:00', false, '10:00', '22:00', 10, '공개')
  returning id into sid;
  insert into space_private values (sid, '서울 성동구 성수동 000-0, 2층', '');

  insert into spaces(host_id, host, name, area, types, seats, free, day, month, year, deposit, ops, share, days, svc,
                     pyeong, shampoo, beds, open_t, close_t, acc24, acc_from, acc_to, day_hours, status)
  values (uid, '프로체어', '프로메이크업', '서울 강남구', '{메이크업,속눈썹}', 4, 2, 80000, 1250000, 14250000, 1500000, 120000, true,
          '{월,화,수,목,금,토}', '{"개별 룸","소독·위생 관리","타월·가운 세탁","개인 수납함","와이파이"}',
          18, 0, 3, '10:30', '20:30', true, '00:00', '23:30', 12, '공개')
  returning id into sid;
  insert into space_private values (sid, '서울 강남구 논현동 000-0, 4층', '4826#');

  insert into spaces(host_id, host, name, area, types, seats, free, day, month, year, deposit, ops, share, days, svc,
                     pyeong, shampoo, beds, open_t, close_t, acc24, acc_from, acc_to, day_hours, status)
  values (uid, '프로체어', '프로살롱', '서울 송파구', '{헤어,피부}', 8, 3, 75000, 1100000, 12540000, 1500000, 120000, false,
          '{수,목,금,토,일}', '{"샴푸대 사용","펌·열기구 사용","타월·가운 세탁","고객 대기 라운지","예약 데스크 응대","와이파이"}',
          40, 5, 2, '10:00', '21:00', false, '08:00', '22:00', 12, '공개')
  returning id into sid;
  insert into space_private values (sid, '서울 송파구 잠실동 000-0, 1~2층', '');

  -- 24시간 출입 (새벽 콜 가능)
  insert into spaces(host_id, host, name, area, types, seats, free, day, month, year, deposit, ops, share, days, svc,
                     pyeong, shampoo, beds, open_t, close_t, acc24, acc_from, acc_to, day_hours, status)
  values (uid, '프로체어', '프로24', '서울 강남구', '{헤어,메이크업}', 6, 3, 70000, 1000000, 11400000, 1000000, 100000, false,
          '{월,화,수,목,금,토,일}', '{"샴푸대 사용","펌·열기구 사용","타월·가운 세탁","카드 단말기","와이파이","개인 수납함"}',
          22, 3, 1, '09:00', '23:00', true, '00:00', '23:30', 12, '공개')
  returning id into sid;
  insert into space_private values (sid, '서울 강남구 역삼동 000-0, 3층', '1357#');

  -- 할인 적용 (일·월 요금 할인, 종료일까지)
  insert into spaces(host_id, host, name, area, types, seats, free, day, month, year, deposit, ops, share, days, svc,
                     pyeong, shampoo, beds, open_t, close_t, acc24, acc_from, acc_to, day_hours, deal, status)
  values (uid, '프로체어', '프로할인', '서울 마포구', '{헤어,네일}', 5, 2, 60000, 900000, 10260000, 500000, 80000, false,
          '{화,수,목,금,토}', '{"샴푸대 사용","소독·위생 관리","카드 단말기","와이파이"}',
          20, 2, 0, '10:00', '21:00', false, '09:00', '22:00', 12,
          jsonb_build_object('label', '오픈 특가', 'pct', 25, 'day', 45000, 'month', 675000, 'until', to_char(current_date + 60, 'YYYY-MM-DD')), '공개')
  returning id into sid;
  insert into space_private values (sid, '서울 마포구 합정동 000-0, 2층', '');

  alter table spaces enable trigger spaces_g;
end $$;

-- 샘플 삭제:
-- delete from spaces where host = '프로체어' and name in ('프로헤어','프로네일','프로메이크업','프로살롱','프로24','프로할인');
