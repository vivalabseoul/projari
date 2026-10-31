function myPage(){
  if(!S.user) return `<div class="head"><h2>마이</h2></div><section class="panel empty">로그인하면 찜한 공간, 최근 본 공간, 예약을 모아볼 수 있습니다.<div style="margin-top:12px"><button class="btn pri sm" data-auth="login">로그인</button></div></section>`;
  const mine=bookings.filter(b=>b.guest===ME_GUEST.name).length;
  return `<div class="head"><div><h2>마이</h2><p class="small muted">${S.user?esc(S.user.name)+'님의 ':''}찜한 공간, 최근 본 공간, 예약을 한곳에서 확인합니다.</p></div></div>
  <section class="stack" style="gap:12px"><div class="row-head"><h2>최근 본 공간</h2></div>${spaceGrid(S.recent,'아직 본 공간이 없습니다. 홈에서 공간을 둘러보세요.')}</section>
  <section class="stack" style="gap:12px"><div class="row-head"><h2>찜한 공간</h2></div>${spaceGrid([...S.fav],'찜한 공간이 없습니다. 공간 카드의 하트를 눌러 담아보세요.')}</section>
  <section class="panel row" style="align-items:center;justify-content:space-between"><p class="small" style="flex:1 1 220px;margin:0">내 예약 <b class="num">${mine}건</b></p><button class="btn pri sm" data-go="guest:mine">내 예약 보기</button></section>`;
}
const FAQ = [
  ['수수료는 얼마인가요? (가안)',()=>`등록비와 월 이용료는 없고 거래가 생길 때만 원장님 정산금에서 차감됩니다. 일 단위 ${pct(CONFIG.fee.day)}, 월 입점 ${pct(CONFIG.fee.month)}(월세+운영료 기준)이며, 가입 후 첫 ${CONFIG.promoMonths}개월은 수수료를 ${pct(CONFIG.promoRate)} 할인합니다. 보증금에는 수수료가 없습니다. 디자이너는 수수료를 내지 않습니다. 수치는 확정 전입니다.`],
  ['월세는 어떻게 받나요?','계약 시 첫 달 월세, 운영료, 보증금을 결제합니다. 월세와 운영료는 카드나 가상계좌로, 보증금은 가상계좌로만 받습니다. 이후 매월 계약한 날짜에 청구되고, 미납되면 프로체어가 납부 알림과 재결제를 진행합니다.'],
  ['보증금은 누가 보관하나요?','프로체어가 받아 디자이너 입주가 확인되면 원장님께 전달합니다. 계약이 끝나면 원장님이 디자이너에게 직접 반환합니다.'],
  ['약제와 소모품은 누가 준비하나요?',SELF_SUPPLY],
  ['프로체어케어는 무엇인가요?','계약에 기본 포함되는 보험입니다. 시술 중 고객 사고와 매장 시설 파손을 보장하는 방향으로 보험사와 협의 중이며, 보장 범위는 확정 후 안내합니다. (준비 중)'],
  ['정산은 언제 되나요?','첫 달은 디자이너 입주가 확인된 뒤, 이후는 결제가 확인된 뒤 수수료를 뺀 금액을 원장님 계좌로 지급합니다. 정확한 지급 일정은 PG사 확정 후 안내합니다. 정산 내역은 원장님 화면에서 확인할 수 있습니다.'],
  ['가입에 자격증이 꼭 필요한가요?','원장님과 디자이너 모두 미용사 국가기술자격증이 필요합니다. 가입 시 자격 인증을 거치며, 시술 가능한 업종은 보유한 자격 종목 범위 안에서만 선택할 수 있습니다.'],
  ['반영구·SMP는 이용할 수 있나요?','문신사법 시행 전까지는 사전 접수로만 등록되며 검색에는 노출되지 않습니다. 시행 후 문신사 면허 확인을 거쳐 공개됩니다.'],
  ['새벽 시간에도 예약할 수 있나요?','원장님이 출입 가능 시간과 1일 이용 시간(연속 N시간)을 정하고, 디자이너가 시작 시간을 고릅니다. 메이크업 새벽 콜처럼 익일에 걸치는 시간도 설정할 수 있습니다.'],
  ['출입 코드는 언제 알 수 있나요?','예약이 확정된 디자이너에게만 공개됩니다.'],
  ['취소·환불 기준은요?','정식 버전에서 약관과 함께 안내합니다. (프로토타입 단계: 미정)']
];
function faqPage(){
  return `<div class="head"><div><h2>고객센터 · 자주 묻는 질문</h2><p class="small muted">프로토타입 기준 안내이며, 수치와 정책은 확정 전 가안입니다.</p></div></div>
  <section class="panel faq">${FAQ.map(([q,a])=>`<details><summary>${q}</summary><p class="small">${typeof a==='function'?a():a}</p></details>`).join('')}</section>
  <section class="panel row" style="align-items:center;justify-content:space-between"><p class="small muted" style="flex:1 1 260px;margin:0">원하는 답이 없다면 입점 문의를 남겨주세요. (1:1 문의는 정식 버전에서 제공)</p><button class="btn pri sm" data-go="intro:hostcenter">입점 문의</button></section>`;
}
function siteFooter(){ return `
  <footer class="foot">
    <nav><button>회사소개</button><button data-go="intro:guide">이용 안내</button><button>이용약관</button><button><b>개인정보처리방침</b></button><button data-go="intro:faq">고객센터·FAQ</button><button data-go="intro:hostcenter">입점문의</button></nav>
    <dl class="biz"><div><dt>상호</dt><dd>문가코퍼레이션</dd></div><div><dt>대표</dt><dd>문정하</dd></div><div><dt>사업자등록번호</dt><dd class="num">274-19-02203</dd></div><div><dt>개인정보보호책임자</dt><dd>문정하</dd></div></dl>
    <p>${esc(CONFIG.name)}는 통신판매중개자로서 거래 당사자가 아니며, 공간 정보와 거래에 대한 책임은 각 호스트에게 있습니다. (문구 가안)</p>
    <p>© 2026 문가코퍼레이션. All rights reserved. · 프로토타입 · 예시 데이터</p>
  </footer>
`; }
function homePage(){
  const pub=spaces.filter(s=>s.status==='공개');
  const rows=[
    {t:'새벽 콜도 OK, 24시간 출입 공간',more:'flag:acc24',list:pub.filter(s=>s.acc24)},
    {t:'지금 입점 가능한 샵인샵',more:'unit:month',list:[...pub].sort((a,b)=>b.rating-a.rating)},
    {t:'일 단위로 가볍게 써보기',more:'unit:day',list:[...pub].sort((a,b)=>pDay(a)-pDay(b))}
  ];
  const catT = S.homeCat||'type';
  const allIc = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>';
  const allBtn = (b)=>`<button class="cat" ${b}><span class="ic">${allIc}</span>전체</button>`;
  const cats = catT==='type'
    ? allBtn('data-cat="전체"') + TYPES.map(t=>`<button class="cat" data-cat="${t}">${t==='메이크업'?'<span class="hot">HOT</span>':''}<span class="ic">${ic(t)}</span>${t}</button>`).join('')
    : allBtn('data-browse="all:all"') + [['month','샵인샵 월','unit:month'],['day','일 단위','unit:day'],['acc24','24시간 출입','flag:acc24'],['share','각자 신고 가능','flag:share']].map(([k,l,b])=>`<button class="cat" data-browse="${b}">${k==='acc24'?'<span class="hot">HOT</span>':''}<span class="ic">${ic(k)}</span>${l}</button>`).join('');
  return `<div class="home">
  <section class="banner">
    <div class="slide" style="--pos:60% 50%;cursor:default"><small>SHOP IN SHOP</small><b>검증된 프로의 빈 자리,<br>오늘 바로 찾기</b><p>자격 검증 · 월세 자동 수납 · 새벽 시간 예약</p>
      <div class="hero-links"><button class="solid" data-browse="unit:month">샵인샵 월 단위 ›</button><button data-browse="unit:day">일 단위 ›</button><button data-browse="flag:acc24">24시간 출입 ›</button></div></div>
  </section>
  <form class="search" id="homesearch" role="search"><label for="home-q" class="vh">공간 검색</label><input id="home-q" type="text" placeholder="지역 / 업종 / 매장 이름으로 찾기"><button type="submit" aria-label="검색"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg></button></form>
  <section class="stack" style="gap:18px">
    <div class="cat-tabs"><button data-hcat="type" aria-pressed="${catT==='type'}">업종</button><i></i><button data-hcat="use" aria-pressed="${catT==='use'}">이용 형태</button></div>
    <div class="cats${catT==='use'?' use':''}">${cats}</div>
  </section>
  <button class="band" data-go="intro:hostcenter"><div style="display:grid;gap:4px"><b>원장님, 비어 있는 의자가 있으신가요?</b><span>국가자격 검증 디자이너 입점 · 월세 자동 수납까지</span></div><em>호스트센터 바로가기 →</em></button>
  ${rows.map((r,i)=>{ const n=8*(S.more[i]||1), shown=r.list.slice(0,n), rest=r.list.length-shown.length;
    return `<section class="${i===1?'tint':'stack'}" style="${i===1?'':'gap:16px'}"><div class="row-head"><h2>${r.t}</h2><button class="more" data-browse="${r.more}">전체 보기 →</button></div><div class="hscroll c${Math.min(shown.length,4)}">${shown.map(mcard).join('')}</div>${rest>0?`<div style="text-align:center"><button class="btn" data-more="${i}">더보기 (${Math.min(8,rest)}개 더 · 남은 ${rest}개)</button></div>`:''}</section>`; }).join('')}
  </div>`;
}

/* 화면 등록 */
PAGES.intro.home=()=>homePage(); PAGES.intro.my=()=>myPage(); PAGES.intro.faq=()=>faqPage();
