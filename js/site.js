/* ===== 사이트 공통 콘텐츠: 광고바 · 팝업 · 공지사항 =====
   내용은 관리자 화면(콘텐츠 관리)에서 정하고 DB 에서 읽어 옵니다. DB 에 값이 없으면 index.html 에 적힌 기본 광고바를 그대로 씁니다. */
function goLink(l){
  if(!l) return;
  if(l.startsWith('https://')){ window.open(l, '_blank', 'noopener'); return; }
  const [r, tab] = l.split(':');
  if(PAGES[r] && PAGES[r][tab]){ $('#layer').innerHTML = ''; S.role = r; S.tab[r] = tab; S.sel = null; S.auth = null; render(); scrollTo(0, 0); }
}
const inPeriod = (a, s, e) => (!s || a >= s) && (!e || a <= e);

/* ----- 광고바 ----- */
function adbarOn(a){ return !!(a && a.active && a.text && inPeriod(TODAY, a.startsOn, a.endsOn)); }
function applyAdbar(){
  const a = SITE.adbar, bar = document.querySelector('.adbar'); if(!LIVE || !a || !bar) return;
  bar.hidden = !adbarOn(a);
  bar.style.background = a.bg; bar.style.color = a.fg;
  const msg = bar.querySelector('.ad-msg'); if(!msg) return;
  msg.replaceChildren();
  if(a.tag){ const tg = document.createElement('span'); tg.className = 'ad-tag'; tg.textContent = a.tag; msg.appendChild(tg); }
  const tx = document.createElement('span'); tx.textContent = a.text; msg.appendChild(tx);
  msg.removeAttribute('data-go'); if(a.link) msg.dataset.adlink = a.link; else delete msg.dataset.adlink;
  msg.style.cursor = a.link ? 'pointer' : 'default';
}

/* ----- 팝업: 접속할 때 한 번, 닫으면 같은 세션에서는 다시 열리지 않습니다. "오늘 하루 안 보기"는 이 브라우저에 저장합니다. ----- */
const popKey = id => 'prochair-pop-' + id;
function popHidden(id){ try{ return localStorage.getItem(popKey(id)) === TODAY; }catch(e){ return false; } }
function showPopups(){
  if(!LIVE || window.START) return;
  const p = SITE.popups.find(x => x.active && inPeriod(TODAY, x.startsOn, x.endsOn) && !popHidden(x.id)); if(!p) return;
  $('#layer').innerHTML = `<div class="ovl" role="dialog" aria-modal="true" aria-labelledby="pph"><div class="dlg">
    ${p.image ? `<img src="${esc(p.image)}" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:10px">` : ''}
    <h3 id="pph">${esc(p.title)}</h3>${p.body ? `<p class="small" style="white-space:pre-wrap;margin:0">${esc(p.body)}</p>` : ''}
    <div class="row">${p.link ? `<button class="btn pri" data-pop="go" data-id="${p.id}">${esc(p.linkLabel || '자세히 보기')}</button>` : ''}<button class="btn" data-pop="close">닫기</button></div>
    <button class="btn ghost sm" data-pop="today" data-id="${p.id}">오늘 하루 안 보기</button></div></div>`;
}
document.addEventListener('click', e => {
  const ad = e.target.closest('[data-adlink]'); if(ad){ goLink(ad.dataset.adlink); return; }
  const t = e.target.closest('button[data-pop]'); if(!t) return;
  const id = +t.dataset.id, p = SITE.popups.find(x => x.id === id);
  if(t.dataset.pop === 'today'){ try{ localStorage.setItem(popKey(id), TODAY); }catch(err){} }
  if(t.dataset.pop === 'go' && p){ goLink(p.link); return; }
  $('#layer').innerHTML = '';
});

/* ----- 공지사항 ----- */
function noticePage(){
  const list = SITE.notices.filter(n => n.published);
  return `<div class="head"><div><h2>공지사항</h2><p class="small muted">프로체어의 새 소식과 안내입니다.</p></div></div>
  <section class="panel faq">${list.length ? list.map(n => `<details><summary>${n.pinned ? '<span class="pill p-acc" style="margin-right:6px">고정</span>' : ''}${esc(n.title)} <span class="small muted">${n.date}</span></summary><p class="small" style="white-space:pre-wrap">${esc(n.body)}</p></details>`).join('')
    : '<div class="empty">등록된 공지사항이 없습니다.</div>'}</section>`;
}
PAGES.intro.notices = () => noticePage();

/* ----- 주소 찾기 (다음 우편번호 서비스: 키·가입 없이 사용) -----
   검색 결과의 시도·시군구를 '서울 마포구' 형태의 지역으로 만들어 가입·공간 등록·검색 필터에 씁니다. */
const POSTCODE_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
let postcodeLoading = null;
/* 주소 검색 스크립트: 페이지에 없으면 이때 불러옵니다 (index.html 이 캐시된 낡은 버전이어도 동작) */
function loadPostcode(){
  if(window.daum && daum.Postcode) return Promise.resolve();
  if(!postcodeLoading) postcodeLoading = new Promise((ok, fail) => {
    const sc = document.createElement('script'); sc.src = POSTCODE_URL; sc.async = true;
    sc.onload = () => (window.daum && daum.Postcode) ? ok() : fail(new Error('load'));
    sc.onerror = () => fail(new Error('net'));
    document.head.appendChild(sc);
  }).catch(e => { postcodeLoading = null; throw e; });
  return postcodeLoading;
}
function pickAddress(cb){
  loadPostcode().then(() => {
    new daum.Postcode({ oncomplete:d => {
      const road = d.roadAddress || d.jibunAddress || d.address;
      cb({ area:(d.sido + ' ' + d.sigungu).trim(), zip:d.zonecode, addr:road + (d.buildingName ? ' (' + d.buildingName + ')' : '') });
    } }).open();
  }).catch(() => toast('주소 검색을 불러오지 못했습니다. 인터넷 연결을 확인하고, 광고 차단 프로그램이 있으면 이 사이트에서 꺼 주세요'));
}
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-addr]'); if(!b) return;
  pickAddress(a => {
    if(b.dataset.addr === 'auth' && S.auth){ Object.assign(S.auth, { area:a.area, zip:a.zip, addr:a.addr, err:'' }); }
    else if(b.dataset.addr === 'reg'){ Object.assign(S.reg, { area:a.area, zip:a.zip, road:a.addr }); }
    render();
    const f = document.getElementById('r-addr'); if(f && b.dataset.addr === 'reg') f.focus();
  });
});

/* ----- 찜한 공간·최근 본 공간: 이 브라우저에 저장합니다 (계정에 저장되지는 않습니다) ----- */
const LOCAL_KEY = 'prochair-local';
function saveLocal(){ try{ localStorage.setItem(LOCAL_KEY, JSON.stringify({ fav:[...S.fav], recent:S.recent })); }catch(e){} }
function loadLocal(){ try{ const d = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'); if(d){ S.fav = new Set((d.fav||[]).map(Number)); S.recent = (d.recent||[]).map(Number).slice(0, 8); } }catch(e){} }

/* ----- 마이: 연락처·비밀번호 변경 ----- */
document.addEventListener('click', async e => {
  const b = e.target.closest('button[data-my]'); if(!b || !LIVE || !S.user) return;
  try{
    if(b.dataset.my === 'phone'){
      const v = $('#my-phone').value; if(!phoneOk(v)) return toast('휴대폰 번호를 확인해 주세요. 예: 010-1234-5678');
      const { error } = await sb.from('profiles').update({ phone:digits(v) }).eq('id', S.user.id); if(error) throw error;
      S.user.phone = digits(v); toast('연락처를 저장했습니다');
    }
    if(b.dataset.my === 'pw'){
      const a = $('#my-pw1').value, c = $('#my-pw2').value;
      if(a.length < 8) return toast('비밀번호는 8자 이상이어야 합니다');
      if(a !== c) return toast('새 비밀번호가 서로 다릅니다');
      const { error } = await sb.auth.updateUser({ password:a }); if(error) throw error;
      $('#my-pw1').value = ''; $('#my-pw2').value = ''; toast('비밀번호를 변경했습니다');
    }
  }catch(err){ dbErr(err); }
});
