/* ===== 운영 모드: Supabase 연결 =====
   화면은 기존처럼 spaces·bookings·leases·verifs·reviews 배열을 그립니다.
   운영 모드에서는 이 배열을 DB에서 채우고, 바뀌는 내용은 DB에 먼저 저장한 뒤 다시 불러옵니다. (LIVE 가 아니면 이 파일은 아무것도 하지 않습니다) */
let sb = null;
const FILES = {};   /* 가입·등록 화면에서 고른 원본 파일 (키: 'qfile' | 'file' | 'reg:file') */
const dbErr = e => { console.error(e); toast((e && e.message) || '처리하지 못했습니다. 잠시 후 다시 시도해 주세요'); };
const day10 = d => String(d || '').slice(0, 10);

/* ---------- DB 행 ↔ 화면 객체 ---------- */
const toSpace = r => ({ id:r.id, hostId:r.host_id, host:r.host, name:r.name, area:r.area, types:r.types||[], seats:r.seats, free:r.free,
  day:r.day, month:r.month, year:r.year, deposit:r.deposit, ops:r.ops, share:r.share, days:r.days||[], svc:r.svc||[], pyeong:r.pyeong||0,
  shampoo:r.shampoo||0, beds:r.beds||0, open:r.open_t, close:r.close_t, acc24:r.acc24, accFrom:r.acc_from, accTo:r.acc_to, dayHours:r.day_hours,
  photos:r.photos||[], deal:r.deal||null, status:r.status, h:300, rating:'-', addr:'', code:'' });
const toBooking = r => ({ id:r.id, spaceId:r.space_id, guestId:r.guest_id, guest:r.guest, gType:r.g_type, unit:r.unit, qty:r.qty, start:day10(r.start),
  time:r.time, contract:r.contract, price:r.price, status:r.status, created:day10(r.created_at) });
const toLease = r => ({ id:r.id, spaceId:r.space_id, bookingId:r.booking_id, guestId:r.guest_id, guest:r.guest, gType:r.g_type, unit:r.unit, rent:r.rent,
  deposit:r.deposit, ops:r.ops, start:day10(r.start), months:r.months, payDay:r.pay_day, thisMonth:r.this_month, method:r.method,
  paidAt:r.paid_at, settle:r.settle, settleAt:r.settle_at, first:r.first });
const toReview = r => ({ id:r.id, bid:r.booking_id, spaceId:r.space_id, guest:r.guest, rating:r.rating, text:r.text, date:day10(r.date), reply:r.reply });
const toVerif = r => ({ id:r.id, userId:r.user_id, spaceId:r.space_id, who:r.who, kind:r.kind, doc:r.doc, types:r.types||[], target:r.target,
  files:r.files||[], status:r.status, reason:r.reason, date:day10(r.date) });
const fill = (arr, rows) => arr.splice(0, arr.length, ...rows);

/* 관리자 콘텐츠·수수료 (supabase/admin_content.sql 을 실행하기 전에는 비어 있고, 사이트는 기본값으로 동작합니다) */
const SITE = { adbar:null, notices:[], popups:[], ready:false };
const FEE = { base:CONFIG.fee.month, promos:[], log:[], ready:false };
const soft = p => Promise.resolve(p).then(r => (r && r.error) ? { data:null, error:r.error } : r, () => ({ data:null }));
const toPromo = r => ({ id:r.id, name:r.name, rate:+r.rate, startsOn:day10(r.starts_on), endsOn:day10(r.ends_on), units:r.units || [], target:r.target,
  newDays:r.new_days, active:r.active, memo:r.memo || '' });
const toNotice = r => ({ id:r.id, title:r.title, body:r.body, pinned:r.pinned, published:r.published, date:day10(r.created_at) });
const toPopup = r => ({ id:r.id, title:r.title, body:r.body, image:r.image, link:r.link, linkLabel:r.link_label, startsOn:day10(r.starts_on),
  endsOn:day10(r.ends_on), active:r.active });
async function loadSite(){
  const [a, n, p] = await Promise.all([soft(sb.from('adbar').select('*').eq('id', 1).maybeSingle()),
    soft(sb.from('notices').select('*').order('pinned', { ascending:false }).order('id', { ascending:false })),
    soft(sb.from('popups').select('*').order('id', { ascending:false }))]);
  SITE.ready = !n.error;
  SITE.adbar = a.data ? { text:a.data.text, tag:a.data.tag, link:a.data.link, bg:a.data.bg, fg:a.data.fg, active:a.data.active,
    startsOn:a.data.starts_on ? day10(a.data.starts_on) : '', endsOn:a.data.ends_on ? day10(a.data.ends_on) : '' } : null;
  SITE.notices = (n.data || []).map(toNotice);
  SITE.popups = (p.data || []).map(toPopup);
}
/* 관리자만: 기본 수수료율·프로모션·변경 이력 */
async function loadFee(){
  const [c, p, l] = await Promise.all([soft(sb.from('fee_config').select('rate').eq('id', 1).maybeSingle()),
    soft(sb.from('promotions').select('*').order('starts_on', { ascending:false }).order('id', { ascending:false })),
    soft(sb.from('admin_log').select('*').order('id', { ascending:false }).limit(40))]);
  FEE.ready = !!c.data;
  if(c.data) FEE.base = +c.data.rate;
  FEE.promos = (p.data || []).map(toPromo);
  FEE.log = l.data || [];
}

/* ---------- 불러오기 ---------- */
async function loadPublic(){
  const [s, r, b] = await Promise.all([sb.from('spaces').select('*').order('id'), sb.from('reviews').select('*').order('id'), sb.rpc('busy_slots'), loadSite()]);
  if(s.error) throw s.error;
  const keep = new Map(spaces.map(x => [x.id, x]));   /* 이미 받아 둔 주소·출입코드는 유지 */
  fill(spaces, s.data.map(row => { const n = toSpace(row), o = keep.get(n.id); if(o){ n.addr = o.addr; n.code = o.code; } return n; }));
  fill(reviews, (r.data || []).map(toReview));
  busy = (b.data || []).map(x => ({ id:x.id, spaceId:x.space_id, unit:'day', qty:x.qty, start:day10(x.start), time:x.time, status:'확정' }));
}
async function loadUser(skipSync){
  if(!skipSync) await sb.rpc('sync_completed');
  const [b, l, v, p, f] = await Promise.all([sb.from('bookings').select('*').order('id'), sb.from('leases').select('*').order('id'),
    sb.from('verifications').select('*').order('id', { ascending:false }), sb.from('space_private').select('*'), soft(sb.from('booking_fees').select('*')),
    S.user.type === 'admin' ? loadFee() : null]);
  [b, l, v, p].forEach(x => { if(x.error) throw x.error; });
  /* 예약 시점에 서버가 고정한 수수료율. 월 계약은 처음 예약의 요율을 그대로 따릅니다. */
  const rate = new Map((f.data || []).map(x => [x.booking_id, +x.rate]));
  fill(bookings, b.data.map(r => ({ ...toBooking(r), feeRate:rate.get(r.id) })));
  fill(leases, l.data.map(r => ({ ...toLease(r), feeRate:rate.get(r.booking_id) })));
  fill(verifs, v.data.map(toVerif));
  p.data.forEach(x => { const s = sp(x.space_id); if(s){ s.addr = x.addr; s.code = x.code; } });
}
async function reloadAll(){ await loadPublic(); if(S.user) await loadUser(); }
async function refresh(msg){ try{ await reloadAll(); }catch(e){ dbErr(e); } render(); if(msg) toast(msg); }

/* ---------- 세션 ---------- */
function clearUser(){
  S.user = null; ME_HOST = '';
  Object.assign(ME_GUEST, { name:'', licenses:[], ownReport:false, verified:false });
  fill(bookings, []); fill(leases, []); fill(verifs, []);
}
async function applySession(){
  const { data:{ session } } = await sb.auth.getSession();   /* 저장된 로그인 정보를 바로 읽습니다 (서버 왕복 없음). 권한은 DB 규칙이 다시 확인합니다 */
  const user = session && session.user;
  if(!user){ clearUser(); return null; }
  const { data:p, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
  if(error) throw error;
  S.user = { id:p.id, name:p.name || user.email, type:p.role, email:user.email, phone:p.phone || '' };
  ME_HOST = p.store || p.name;
  Object.assign(ME_GUEST, { name:p.name, licenses:p.licenses || [], ownReport:p.own_report, verified:p.verified });
  return p;
}
async function liveBoot(){
  sb = supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  document.body.classList.add('live');
  fill(spaces, []); fill(bookings, []); fill(leases, []); fill(verifs, []); fill(reviews, []); S.fav.clear(); S.recent = [];
  clearUser();
  try{
    /* 로그인 확인·공개 데이터·완료 처리를 동시에 시작해서 첫 화면이 뜨는 시간을 줄입니다 */
    await Promise.all([applySession(), loadPublic(), sb.auth.getSession().then(r => r.data.session ? sb.rpc('sync_completed') : null)]);
    if(S.user) await loadUser(true);
  }catch(e){ dbErr(e); }
}

/* ---------- 파일 ---------- */
async function uploadDoc(file, uid){
  if(!file) return '';
  const path = `${uid}/${Date.now()}-${file.name.replace(/[^\w.\-가-힣]/g, '_')}`;
  const { error } = await sb.storage.from('docs').upload(path, file, { contentType:file.type || undefined });
  if(error) throw error;
  return path;
}
async function uploadPhotos(photos, uid){
  const urls = [];
  for(let i = 0; i < photos.length; i++){
    const blob = await (await fetch(photos[i].url)).blob();
    const path = `${uid}/${Date.now()}-${i}.jpg`;
    const { error } = await sb.storage.from('space-photos').upload(path, blob, { contentType:blob.type || 'image/jpeg' });
    if(error) throw error;
    urls.push(sb.storage.from('space-photos').getPublicUrl(path).data.publicUrl);
  }
  return urls;
}
async function openDoc(verifId){
  const v = verifs.find(x => x.id === verifId);
  if(!v || !v.files.length){ toast('제출된 파일이 없습니다'); return; }
  for(const f of v.files){
    const { data, error } = await sb.storage.from('docs').createSignedUrl(f, 300);
    if(error){ dbErr(error); return; }
    window.open(data.signedUrl, '_blank', 'noopener');
  }
}

/* ---------- 로그인·가입 ---------- */
function goHome(){
  const r = S.user.type; S.role = r;
  S.tab[r] = r === 'host' ? 'dash' : r === 'admin' ? 'dash' : 'search';
}
async function liveLogin(A){
  const { error } = await sb.auth.signInWithPassword({ email:A.email.trim(), password:A.pw });
  if(error){ A.err = error.message.includes('Invalid login') ? '이메일 또는 비밀번호가 맞지 않습니다.' : error.message; return render(); }
  await applySession(); await reloadAll();
  S.auth = null; S.sel = null;
  if(!(window.START && S.user.type === 'admin')) goHome(); else S.role = 'admin';
  render(); scrollTo(0, 0); toast(`${S.user.name}님, 로그인했습니다`);
}
async function liveSignup(A){
  const meta = { role:A.type, name:A.name.trim(), phone:digits(A.phone), store:A.type === 'host' ? A.store.trim() : '', area:A.type === 'host' ? A.area : '' };
  const { data, error } = await sb.auth.signUp({ email:A.email.trim(), password:A.pw, options:{ data:meta } });
  if(error){ A.err = /already/i.test(error.message) ? '이미 가입된 이메일입니다. 로그인해 주세요.' : error.message; return render(); }
  if(!data.session){ A.err = '가입은 되었지만 로그인 상태가 아닙니다. 운영자 설정에서 이메일 확인을 꺼야 가입이 끝까지 진행됩니다. (README 참고)'; return render(); }
  await applySession();
  const uid = S.user.id;
  const files = [];
  try{
    const qf = await uploadDoc(FILES.qfile, uid), lf = await uploadDoc(FILES.file, uid);
    files.push(...[qf, lf].filter(Boolean));
  }catch(e){ dbErr(e); }
  const qdoc = `국가기술자격 ${qualLabels(A.quals).join('·')} (${A.qform === 'book' ? '수첩형 · 번호 ' + A.qno.trim() + ' · 생년월일 ' + A.birth + ' · 발급일 ' + A.qdate + ' · 내지 ' + A.qpage.trim() : '상장형 · 관리번호 ' + A.qmng.trim()})`;
  const { error:ve } = await sb.from('verifications').insert({ user_id:uid, who:A.type === 'host' ? `${A.store.trim()} (${A.name.trim()})` : A.name.trim(),
    kind:A.type === 'host' ? '호스트' : '게스트', doc:qdoc + (A.type === 'host' ? ' · 미용업 영업신고증' : (A.own ? ' · 본인 영업신고증' : '')),
    types:A.type === 'host' ? A.types : qualTypes(A.quals), target:'회원가입', files });
  if(ve) dbErr(ve);
  if(A.type === 'guest' && A.own) await sb.from('profiles').update({ own_report:true }).eq('id', uid);
  await applySession(); await reloadAll();
  Object.keys(FILES).forEach(k => delete FILES[k]);
  A.step++; render();
}
async function liveLogout(){
  await sb.auth.signOut(); clearUser(); S.role = 'intro'; S.sel = null;
  try{ await loadPublic(); }catch(e){ dbErr(e); }
  render(); toast('로그아웃했습니다');
}

/* ---------- 쓰기 ---------- */
async function liveCreateSpace(r){
  if(!r.area || !r.road) throw new Error('우편번호 찾기로 매장 주소를 입력해 주세요');
  const uid = S.user.id;
  const photos = await uploadPhotos(r.photos, uid);
  const { data, error } = await sb.from('spaces').insert({ host_id:uid, host:ME_HOST, name:r.name || '새 공간', area:r.area, types:r.types, seats:r.seats,
    free:Math.min(r.free, r.seats), day:r.day, month:r.month, year:r.year, deposit:r.deposit, ops:r.ops, share:r.share, days:r.days, svc:r.svc,
    pyeong:r.pyeong, shampoo:r.shampoo, beds:needsBed(r.types) ? r.beds : 0, open_t:r.open, close_t:r.close, acc24:r.acc24, acc_from:r.accFrom,
    acc_to:r.accTo, day_hours:r.dayHours, photos }).select('id').single();
  if(error) throw error;
  const pe = await sb.from('space_private').insert({ space_id:data.id, addr:[r.road, r.addr.trim()].filter(Boolean).join(' '), code:r.code });
  if(pe.error) throw pe.error;
  const f = await uploadDoc(FILES['reg:file'], uid);
  const ve = await sb.from('verifications').insert({ user_id:uid, space_id:data.id, who:r.name || '새 공간', kind:'호스트',
    doc:'미용업 영업신고증' + (r.file ? ` (${r.file})` : ''), types:r.types, target:'공간 등록', files:f ? [f] : [] });
  if(ve.error) throw ve.error;
  delete FILES['reg:file'];
}
async function liveBook(F, spaceId){
  const { error } = await sb.from('bookings').insert({ space_id:spaceId, guest_id:S.user.id, g_type:F.gType, unit:F.unit, qty:F.qty, start:F.start, time:F.time, contract:F.contract });
  if(error) throw error;
}
async function liveBookingAct(id, ok){
  const b = bookings.find(x => x.id === id);
  const { error } = await sb.from('bookings').update({ status:ok ? '확정' : '거절' }).eq('id', id);
  if(error) throw error;
  if(ok && b.unit !== 'day'){
    const s = sp(b.spaceId);
    const le = await sb.from('leases').insert({ space_id:b.spaceId, booking_id:b.id, guest_id:b.guestId, guest:b.guest, g_type:b.gType, unit:b.unit,
      rent:b.unit === 'year' ? Math.round(b.price / 12) : b.price, deposit:s.deposit, ops:s.ops || 0, start:b.start, months:b.qty * MONTHS[b.unit],
      pay_day:+b.start.slice(8), this_month:'결제 예정', settle:'정산 보류', first:true });
    if(le.error) throw le.error;
  }
}
const saveDeal = s => sb.from('spaces').update({ deal:s.deal }).eq('id', s.id).then(({ error }) => { if(error) dbErr(error); });
async function liveVerifAct(id, status, reason){
  const { error } = await sb.from('verifications').update({ status, reason:reason || '' }).eq('id', id);
  if(error) throw error;
}
async function liveLeaseAct(id, patch){
  const { error } = await sb.from('leases').update(patch).eq('id', id);
  if(error) throw error;
}
async function liveReview(bid, rating, text){ const { error } = await sb.from('reviews').insert({ booking_id:bid, rating, text }); if(error) throw error; }
async function liveReply(id, reply){ const { error } = await sb.from('reviews').update({ reply }).eq('id', id); if(error) throw error; }
