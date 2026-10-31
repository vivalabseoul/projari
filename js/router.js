/* ===== 네비게이션 ===== */
const NAV = {
  intro:[],   /* 홈 하위 메뉴 숨김 (호스트센터는 우측 상단, 이용 안내는 푸터) */
  host:[['dash','대시보드'],['lease','월세 관리'],['req','입점 요청'],['settle','정산 내역'],['reviews','후기 관리'],['register','공간 등록']],
  guest:[['search','공간 찾기'],['mine','내 예약']],
  admin:[]   /* 관리자는 위 상단 메뉴 대신 왼쪽 메뉴(js/pages/admin/shell.js)를 씁니다 */
};
function renderNav(){
  if(BOOTING){ $('#authbar').innerHTML=''; $('.sub').hidden=true; return; }
  document.body.classList.toggle('adm-on', S.role==='admin' && !S.auth && !gateMsg());
  if(typeof applyAdbar==='function') applyAdbar();
  document.querySelectorAll('.roles button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.role===S.role));
  const pend = {req: bookings.filter(b=>sp(b.spaceId).host===ME_HOST && b.status==='요청').length, verify: verifs.filter(v=>v.status==='대기').length, pay: leases.filter(l=>payRow(l).recon!=='일치').length, lease: leases.filter(l=>sp(l.spaceId).host===ME_HOST && l.thisMonth==='미납').length, reviews: reviews.filter(r=>sp(r.spaceId).host===ME_HOST && !r.reply).length};
  /* 로그인한 원장님·디자이너는 홈·마이·고객센터 같은 공개 화면에서도 자기 메뉴가 보입니다 (원장님이 마이에서 관리 메뉴를 잃지 않도록) */
  const nr = (S.role==='intro' && S.user && NAV[S.user.type] && NAV[S.user.type].length) ? S.user.type : S.role;
  $('.sub').hidden = !!S.auth || !NAV[nr].length || !!gateMsg();
  $('#authbar').innerHTML = (S.user
    ? `<div class="who"><span class="avatar" aria-hidden="true">${esc(S.user.name.slice(0,1))}</span><span>${esc(S.user.name)} <span class="muted small">${S.user.type==='host'?'원장님':S.user.type==='admin'?'관리자':'디자이너'}</span></span>${S.user.type==='admin'?'<button class="btn point sm" data-go="admin:dash">관리자</button>':''}<button class="btn ghost sm" data-go="intro:my">마이</button><button class="btn ghost sm" data-auth="logout">로그아웃</button></div>`
    : `<div class="auth-btns"><button class="btn ghost sm" data-auth="login">로그인</button><button class="btn point sm" data-auth="signup">회원가입</button></div>`);
  document.querySelectorAll('.bnav button').forEach(b=>b.setAttribute('aria-current', b.dataset.go===`${S.role}:${S.tab[S.role]}`?'page':'false'));
  $('#subnav').innerHTML = NAV[nr].map(([k,l])=>`<button ${nr===S.role?'data-tab="'+k+'"':'data-go="'+nr+':'+k+'"'} ${nr===S.role&&S.tab[S.role]===k?'aria-current="page"':''}>${l}${pend[k]?`<span class="cnt">${pend[k]}</span>`:''}</button>`).join('');
}
/* 화면 등록: 각 화면 파일이 PAGES[역할][탭] = 함수 로 스스로 등록합니다.
   관리자 화면 추가 = js/pages/admin/ 에 파일 하나 + NAV.admin 에 메뉴 한 줄 + admin.html·index.html 에 script 한 줄 */
const PAGES = { intro:{}, host:{}, guest:{}, admin:{} };
/* 운영 모드: 원장님·관리자 화면과 내 예약은 해당 계정으로 로그인해야 열립니다 (데이터 자체는 DB 권한으로도 막혀 있음) */
function gateMsg(){
  if(!LIVE) return '';
  const need = S.role==='host' ? 'host' : S.role==='admin' ? 'admin' : (S.role==='guest'&&S.tab.guest==='mine') ? 'any' : '';
  if(!need || (S.user && (need==='any' || S.user.type===need))) return '';
  const label = {host:'원장님',admin:'관리자',any:'회원'}[need];
  return `<section class="panel empty">${S.user?`${label} 계정으로 로그인해야 볼 수 있는 화면입니다.`:`로그인이 필요한 화면입니다.`}<div style="margin-top:12px">${S.user?'<button class="btn sm" data-auth="logout">로그아웃</button>':'<button class="btn pri sm" data-auth="login">로그인</button> <button class="btn sm" data-auth="signup">회원가입</button>'} ${window.START?'<a class="btn sm" href="index.html">사이트 홈으로</a>':'<button class="btn sm" data-go="intro:home">홈으로</button>'}</div></section>`;
}
function render(){ renderNav(); const v=$('#view'); const t=S.tab[S.role];
  if(BOOTING){ v.innerHTML=bootView(); return; }
  if(S.auth){ v.innerHTML = authView()+'<div style="margin-top:48px">'+siteFooter()+'</div>'; return; }
  const gate = gateMsg(); if(gate){ v.innerHTML = gate+'<div style="margin-top:48px">'+siteFooter()+'</div>'; syncHash(); return; }
  const page = PAGES[S.role][t] || (S.role==='admin' ? PAGES.admin.dash : PAGES.intro.home);
  v.innerHTML = S.role==='admin' ? adminShell(page()) : page() + '<div style="margin-top:48px">'+siteFooter()+'</div>';
  syncHash();
}
/* 주소(#역할-탭)로 화면을 바로 열 수 있습니다. 예: index.html#admin-pay */
const TITLES = { 'intro:my':'마이','intro:faq':'고객센터·자주 묻는 질문','intro:hostcenter':'호스트센터','intro:guide':'이용 안내','intro:notices':'공지사항','intro:about':'회사소개','intro:terms':'이용약관','intro:privacy':'개인정보처리방침',
  'host:dash':'대시보드','host:lease':'월세 관리','host:req':'입점 요청','host:settle':'정산 내역','host:reviews':'후기 관리','host:register':'공간 등록','guest:search':'공간 찾기','guest:mine':'내 예약',
  'admin:dash':'대시보드','admin:verify':'자격·신고증 인증','admin:pay':'입금·정산','admin:ops':'운영 현황','admin:content':'콘텐츠 관리','admin:promo':'수수료·프로모션' };
function setTitle(){
  const brand = S.role==='admin' ? CONFIG.name+' 관리자' : CONFIG.name;
  if(S.role==='intro' && S.tab.intro==='home'){ document.title = S.role==='admin' ? brand : CONFIG.name+' - 검증된 프로의 빈 자리, 오늘 바로 찾기'; return; }
  let t = TITLES[S.role+':'+S.tab[S.role]] || ''; if(S.role==='guest' && S.sel){ const s=sp(S.sel); if(s) t=s.name; }
  document.title = t ? t+' · '+brand : brand;
}
/* 화면을 옮길 때마다 브라우저 기록에 쌓아서 뒤로가기가 직전 화면(공간 상세 포함)으로 돌아갑니다 */
let _hk = null;
function syncHash(){
  setTitle();
  const h = `#${S.role}-${S.tab[S.role]}`, k = h+'|'+(S.sel||''); if(k===_hk) return;
  const st = { r:S.role, t:S.tab[S.role], sel:S.sel||null };
  if(_hk===null) history.replaceState(st,'',h); else history.pushState(st,'',h);
  _hk = k;
}
/* 주소(#역할-탭)로 화면을 바로 열 수 있습니다. 예: index.html#admin-pay. 관리자 화면(admin.html)은 관리자 주소만 받습니다 */
function openFromHash(){ const m=location.hash.match(/^#(intro|host|guest|admin)-([a-z]+)$/); if(m && PAGES[m[1]][m[2]] && !(window.START && m[1]!=='admin')){ S.role=m[1]; S.tab[m[1]]=m[2]; S.sel=null; return true; } return false; }
window.addEventListener('popstate',e=>{
  const st = e.state;
  if(st && PAGES[st.r] && PAGES[st.r][st.t]){ S.role=st.r; S.tab[st.r]=st.t; S.sel=st.sel; _hk = `#${st.r}-${st.t}|${st.sel||''}`; }
  else if(openFromHash()) _hk = `#${S.role}-${S.tab[S.role]}|`;
  else _hk = null;   /* 잘못된 주소는 현재 화면 주소로 바로잡습니다 */
  S.auth = null; $('#layer').innerHTML=''; render();
});
