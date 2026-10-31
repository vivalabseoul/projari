/* ===== 후기 ===== */
function reviewSection(s){
  const l=rvOf(s), avg=l.length?(l.reduce((a,r)=>a+r.rating,0)/l.length).toFixed(1):null;
  return `<section class="panel stack"><div class="row" style="align-items:center;gap:8px"><h3 style="flex:1 1 auto">이용 후기</h3>${avg?`<span class="num"><b class="stars-txt">★</b> <b>${avg}</b> <span class="small muted">· ${l.length}개</span></span>`:''}</div>
    ${l.length?l.map(r=>`<div class="rv"><div class="row" style="align-items:center;gap:8px"><b>${esc(maskName(r.guest))}</b><span class="stars-txt small" aria-label="별점 ${r.rating}점">${starTxt(r.rating)}</span><span class="small muted num" style="margin-left:auto">${r.date}</span></div>
      <p class="small" style="margin:6px 0 0">${esc(r.text)}</p>
      ${r.reply?`<div class="rv-reply"><b class="small">원장님 답글</b><p class="small" style="margin:2px 0 0">${esc(r.reply)}</p></div>`:''}</div>`).join(''):'<p class="small muted">아직 후기가 없습니다. 이용을 마친 디자이너만 후기를 남길 수 있습니다.</p>'}
    <p class="small muted">후기는 이용을 완료한 예약에 한해 작성할 수 있습니다.</p></section>`;
}
function reviewAction(b){
  const done=reviews.find(r=>r.bid===b.id);
  return done ? `<span class="pill p-ok" style="justify-self:start">후기 작성 완료 ${starTxt(done.rating)}</span>`
              : `<div><button class="btn sm" data-rv="open" data-id="${b.id}">후기 작성</button></div>`;
}
function reviewDialog(){
  const R=S.rv, b=bookings.find(x=>x.id===R.bid), s=sp(b.spaceId);
  $('#layer').innerHTML=`<div class="ovl" role="dialog" aria-modal="true" aria-labelledby="rvh"><div class="dlg">
    <h3 id="rvh">후기 작성</h3><p class="small muted">${esc(s.name)} · ${b.start} 이용</p>
    <div class="stars" role="group" aria-label="별점 선택">${[1,2,3,4,5].map(n=>`<button type="button" data-rv="star" data-n="${n}" class="${n<=R.rating?'on':''}" aria-label="${n}점" aria-pressed="${n<=R.rating}">★</button>`).join('')}</div>
    <div class="field"><label for="rv-text">이용 후기 (10자 이상)</label><textarea id="rv-text" rows="4" maxlength="300" placeholder="공간 상태, 시설, 원장님 응대 등 실제 이용 경험을 적어주세요">${esc(R.text)}</textarea></div>
    <p class="small muted">작성한 후기는 공간 상세에 공개되며, 이름은 일부 가려서 표시됩니다.</p>
    <div class="row"><button class="btn" data-rv="cancel">취소</button><button class="btn pri" data-rv="submit">등록</button></div></div></div>`;
}
function hostReviews(){
  const my=reviews.filter(r=>sp(r.spaceId).host===ME_HOST).sort((a,b)=>(a.reply?1:0)-(b.reply?1:0)||b.date.localeCompare(a.date));
  return `<div class="head"><h2>후기 관리</h2><p class="small muted">우리 공간에 남겨진 후기입니다. 답글은 공간 상세에 함께 노출됩니다.</p></div>
  <section class="panel">${my.length?my.map(r=>`<div class="req"><div class="stack" style="gap:6px;flex:1 1 auto">
    <div class="row" style="align-items:center;gap:8px"><b>${esc(sp(r.spaceId).name)}</b><span class="stars-txt small">${starTxt(r.rating)}</span><span class="small muted">${esc(maskName(r.guest))} · ${r.date}</span>${r.reply?'':'<span class="pill p-warn">답글 대기</span>'}</div>
    <p class="small" style="margin:0">${esc(r.text)}</p>
    ${r.reply?`<div class="rv-reply"><b class="small">내 답글</b><p class="small" style="margin:2px 0 0">${esc(r.reply)}</p></div>`
    :`<div class="field"><label class="vh" for="rp-${r.id}">답글</label><textarea id="rp-${r.id}" rows="2" maxlength="200" placeholder="디자이너에게 남길 답글"></textarea><div><button class="btn pri sm" data-rv="reply" data-id="${r.id}">답글 등록</button></div></div>`}
  </div></div>`).join(''):'<div class="empty">아직 받은 후기가 없습니다.</div>'}</section>`;
}
function accessInfo(b,s){
  const addr=(s.addr&&(b.status==='확정'||b.status==='완료'))?`<p class="small">주소 <b>${esc(s.addr)}</b> <span class="muted">· 확정된 예약에만 공개</span></p>`:'';
  return addr+accessInfo0(b,s);
}
function accessInfo0(b,s){
  if(!s.code) return '<p class="small muted">출입은 원장님과 직접 협의합니다</p>';
  return (b.status==='확정'||b.status==='완료') ? `<p class="small">출입 정보 <b class="num">${esc(s.code)}</b> <span class="muted">· 확정된 예약에만 공개</span></p>` : '<p class="small muted">출입 정보는 예약이 확정되면 공개됩니다</p>';
}
/* 내 예약 달력 */
function bookingRange(b){
  const [y,m,d]=b.start.split('-').map(Number); const a=Date.UTC(y,m-1,d);
  const e = b.unit==='day' ? Date.UTC(y,m-1,d+b.qty-1) : Date.UTC(y,m-1+b.qty*MONTHS[b.unit],d-1);
  return [a,e];
}
function mineCal(list){
  const now=new Date(); const ym=S.mineMonth||(list.length?list.map(b=>b.start).sort().slice(-1)[0].slice(0,7):`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
  const [Y,M]=ym.split('-').map(Number); const first=Date.UTC(Y,M-1,1), dim=new Date(Y,M,0).getDate(), lead=new Date(Y,M-1,1).getDay();
  const ranges=list.filter(b=>b.status!=='거절').map(b=>({b,r:bookingRange(b)}));
  const cells=[]; for(let i=0;i<lead;i++) cells.push('<div class="cd off"></div>');
  for(let d=1;d<=dim;d++){
    const t=Date.UTC(Y,M-1,d); const ev=ranges.filter(x=>x.r[0]<=t&&t<=x.r[1]);
    cells.push(`<div class="cd${ev.length?' has':''}"><span class="n">${d}</span>${ev.slice(0,2).map(x=>`<i class="ev e-${x.b.status}">${esc(sp(x.b.spaceId).name)}</i>`).join('')}${ev.length>2?`<em>+${ev.length-2}</em>`:''}</div>`);
  }
  const prev=new Date(Date.UTC(Y,M-2,1)).toISOString().slice(0,7), next=new Date(Date.UTC(Y,M,1)).toISOString().slice(0,7);
  return `<section class="panel cal"><div class="cal-h"><button class="btn sm" data-mmonth="${prev}" aria-label="이전 달">‹</button><b>${Y}년 ${M}월</b><button class="btn sm" data-mmonth="${next}" aria-label="다음 달">›</button></div>
  <div class="cal-g">${['일','월','화','수','목','금','토'].map(w=>`<div class="wd">${w}</div>`).join('')}${cells.join('')}</div>
  <div class="cal-l"><span><i class="ev e-요청"></i>호스트 확인 중</span><span><i class="ev e-확정"></i>확정</span><span><i class="ev e-완료"></i>이용 완료</span></div></section>`;
}
function guestMine(){
  const list=bookings.filter(b=>b.guest===ME_GUEST.name);
  const view=S.mineView||'list';
  return `<div class="head"><h2>내 예약</h2><div class="seg"><button data-mview="list" aria-pressed="${view==='list'}">목록</button><button data-mview="cal" aria-pressed="${view==='cal'}">달력</button></div></div>
  ${view==='cal'?mineCal(list):''}
  <section class="panel">${list.length?list.map(b=>{const s=sp(b.spaceId);return `<div class="req"><div class="stack" style="gap:4px"><div class="row" style="align-items:center;gap:8px"><h3 style="flex:none">${esc(s.name)}</h3><span class="pill ${statusPill(b.status)}">${b.status==='요청'?'호스트 확인 중':b.status}</span></div><div class="meta num"><span>${b.start} 시작 · ${unitLabel(b.unit,b.qty)}${b.unit==='day'?` · ${b.time}~${endOf(b.time,s.dayHours)}`:''}</span><span>·</span><span>${esc(b.gType)}</span><span>·</span><span>${contractLabel(b.contract)}</span>${b.unit!=='day'?`<span>·</span><span>${b.unit==='year'?'매월 분납 결제':'매월 월세 결제'}</span>`:''}</div>${accessInfo(b,s)}${b.status==='완료'?reviewAction(b):''}</div><b class="num">${won(amountOf(b))}</b></div>`}).join(''):'<div class="empty">아직 예약이 없습니다. 공간 찾기에서 첫 예약을 해보세요.<div style="margin-top:12px"><button class="btn pri sm" data-go="guest:search">공간 찾기</button></div></div>'}</section>`;
}

/* 화면 등록 */
PAGES.host.reviews=()=>hostReviews();
