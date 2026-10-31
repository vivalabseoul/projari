/* ===== 네비게이션 ===== */
const NAV = {
  intro:[],   /* 홈 하위 메뉴 숨김 (호스트센터는 우측 상단, 이용 안내는 푸터) */
  host:[['dash','대시보드'],['lease','월세 관리'],['req','입점 요청'],['settle','정산 내역'],['reviews','후기 관리'],['register','공간 등록']],
  guest:[['search','공간 찾기'],['mine','내 예약']],
  admin:[['verify','자격·신고증 인증'],['pay','입금·정산'],['ops','운영 현황']]
};
function renderNav(){
  document.querySelectorAll('.roles button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.role===S.role));
  const pend = {req: bookings.filter(b=>sp(b.spaceId).host===ME_HOST && b.status==='요청').length, verify: verifs.filter(v=>v.status==='대기').length, pay: leases.filter(l=>payRow(l).recon!=='일치').length, lease: leases.filter(l=>sp(l.spaceId).host===ME_HOST && l.thisMonth==='미납').length, reviews: reviews.filter(r=>sp(r.spaceId).host===ME_HOST && !r.reply).length};
  $('.sub').hidden = !!S.auth || !NAV[S.role].length;
  $('#authbar').innerHTML = (S.user
    ? `<div class="who"><span class="avatar" aria-hidden="true">${esc(S.user.name.slice(0,1))}</span><span>${esc(S.user.name)} <span class="muted small">${S.user.type==='host'?'원장님':'디자이너'}</span></span><button class="btn ghost sm" data-go="intro:my">마이</button><button class="btn ghost sm" data-auth="logout">로그아웃</button></div>`
    : `<div class="auth-btns"><button class="btn ghost sm" data-auth="login">로그인</button><button class="btn point sm" data-auth="signup">회원가입</button></div>`);
  document.querySelectorAll('.bnav button').forEach(b=>b.setAttribute('aria-current', b.dataset.go===`${S.role}:${S.tab[S.role]}`?'page':'false'));
  $('#subnav').innerHTML = NAV[S.role].map(([k,l])=>`<button data-tab="${k}" ${S.tab[S.role]===k?'aria-current="page"':''}>${l}${pend[k]?`<span class="cnt">${pend[k]}</span>`:''}</button>`).join('');
}
/* 화면 등록: 각 화면 파일이 PAGES[역할][탭] = 함수 로 스스로 등록합니다.
   관리자 화면 추가 = js/pages/admin/ 에 파일 하나 + NAV.admin 에 메뉴 한 줄 + admin.html·index.html 에 script 한 줄 */
const PAGES = { intro:{}, host:{}, guest:{}, admin:{} };
function render(){ renderNav(); const v=$('#view'); const t=S.tab[S.role];
  if(S.auth){ v.innerHTML = authView()+'<div style="margin-top:48px">'+siteFooter()+'</div>'; return; }
  const page = PAGES[S.role][t] || PAGES.intro.home;
  v.innerHTML = page() + '<div style="margin-top:48px">'+siteFooter()+'</div>';
  syncHash();
}
/* 주소(#역할-탭)로 화면을 바로 열 수 있습니다. 예: index.html#admin-pay */
function syncHash(){ const h=`#${S.role}-${S.tab[S.role]}`; if(location.hash!==h) history.replaceState(null,'',h); }
function openFromHash(){ const m=location.hash.match(/^#(intro|host|guest|admin)-([a-z]+)$/); if(m && PAGES[m[1]][m[2]]){ S.role=m[1]; S.tab[m[1]]=m[2]; S.sel=null; return true; } return false; }
window.addEventListener('hashchange',()=>{ if(openFromHash()) render(); });
