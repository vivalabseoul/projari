function adminOps(){
  const all=bookings.filter(b=>b.status!=='거절'); const g=all.reduce((a,b)=>a+amountOf(b),0), f=all.reduce((a,b)=>a+feeOf(b),0);
  const byType=TYPES.map(t=>({t,n:spaces.filter(s=>s.status==='공개'&&s.types.includes(t)).length}));
  const max=Math.max(...byType.map(x=>x.n),1);
  return `<div class="head"><h2>운영 현황</h2><p class="small muted">예시 데이터 기준</p></div>
  <div class="grid3">
    <div class="panel kpi"><span class="lbl">총 거래액</span><span class="v num">${won(g)}</span></div>
    <div class="panel kpi"><span class="lbl">플랫폼 수수료 수익</span><span class="v acc num">${won(f)}</span><span class="small muted num">평균 ${g?(f/g*100).toFixed(1):0}%</span></div>
    <div class="panel kpi"><span class="lbl">공개 공간 / 인증 대기</span><span class="v num">${spaces.filter(s=>s.status==='공개').length}곳 / ${verifs.filter(v=>v.status==='대기').length}건</span></div>
  </div>
  <section class="panel stack"><h3>업종별 공개 공간 수</h3>${byType.map(x=>`<div class="row" style="align-items:center;gap:12px"><span style="flex:0 0 120px" class="small">${x.t}</span><div class="bar" style="flex:1 1 auto"><i style="width:${x.n/max*100}%"></i></div><span class="num small" style="flex:0 0 32px;text-align:right">${x.n}</span></div>`).join('')}</section>`;
}

/* ===== 홈 (둘러보기형 메인) ===== */
const ICONS = {
  '헤어':'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M8.2 15 18 4M15.8 15 6 4"/>',
  '네일':'<path d="M8 21V10a4 4 0 0 1 8 0v11"/><path d="M10 10.5a2 2 0 0 1 4 0V14h-4z"/>',
  '피부':'<circle cx="12" cy="12" r="8"/><path d="M9 10h.01M15 10h.01M9 15c1.7 1.3 4.3 1.3 6 0"/>',
  '속눈썹':'<path d="M3 13c3-5 15-5 18 0M3 13c3 4 15 4 18 0"/><circle cx="12" cy="13" r="2"/><path d="M6 9 5 7M12 7.500V5M18 9l1-2"/>',
  '메이크업':'<path d="M3 12c2.5-1 5-3 6.5-3.5 1 .8 1.6 1 2.5 1s1.500-.2 2.500-1c1.500.5 4 2.500 6.500 3.500-2.500 5-6 7-9 7s-6.500-2-9-7z"/><path d="M3 12c4 1.500 14 1.500 18 0"/>',
  '반영구':'<path d="M3 14c3-6 11-8 18-3-6-1-12 0-18 3z"/><path d="M8 12l1-2.5M12 11.2l.5-2.6M16 11.6l1.2-2"/>',
  'SMP':'<path d="M6 20v-2a6 6 0 0 1 12 0v2"/><circle cx="12" cy="8" r="5"/><path d="M10 5h.01M13 4.5h.01M14.5 7h.01M11 7.5h.01"/>',
  'month':'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  'day':'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  'acc24':'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  'share':'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'
};
const ic = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
function mcard(s){
  const facts=[s.shampoo?`<i class="f hi">샴푸대 ${s.shampoo}</i>`:'',s.beds?`<i class="f hi">베드 ${s.beds}</i>`:'',s.pyeong?`<i class="f">${s.pyeong}평</i>`:'',`<i class="f">${s.free}석 가능</i>`].join('');
  return `<div class="mc"><button class="mc-main" data-open="${s.id}">
    <div class="mc-img" style="--img:url(${imgOf(s)})"><span class="tag">${s.types.map(esc).join(' · ')}</span>${s.acc24?'<span class="tag t2">24시간</span>':''}${dealTag(s)}</div>
    <div class="mc-b"><div class="mc-t"><b class="nm">${esc(s.name)}</b><span class="rate num">★ ${ratingTxt(s)}</span></div>
      <span class="small muted">${esc(s.area)}</span>
      <span class="mc-price num">${priceOf(pDay(s),s.day)}<small>/일</small></span>
      <span class="facts">${facts}</span></div></button>
    <button class="heart" data-fav="${s.id}" aria-pressed="${S.fav.has(s.id)}" aria-label="${esc(s.name)} 찜하기">${HEART}</button></div>`;
}

function spaceGrid(ids,empty){
  const list=ids.map(id=>spaces.find(s=>s.id===id)).filter(s=>s&&s.status==='공개');
  return list.length?`<div class="hscroll c${Math.min(list.length,4)}">${list.map(mcard).join('')}</div>`:`<div class="empty">${empty}</div>`;
}

/* 화면 등록 */
PAGES.admin.ops=()=>adminOps();
