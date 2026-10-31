/* ===== 호스트 ===== */
function simCalc(){ const s=S.sim; const dayGross=s.chairs*s.days*s.dayPrice, mRent=s.mChairs*s.mPrice, mOps=s.mChairs*s.mOps, mGross=mRent+mOps;
  const r = k => CONFIG.fee[k];
  const fee = dayGross*r('day') + mGross*r('month'); return {dayGross,mRent,mOps,mGross,gross:dayGross+mGross,fee,net:dayGross+mGross-fee}; }
function hostDash(){
  const mySpaces = spaces.filter(s=>s.host===ME_HOST);
  const mine = bookings.filter(b=>{ const s=sp(b.spaceId); return s && s.host===ME_HOST; });
  const myL = leases.filter(l=>{ const s=sp(l.spaceId); return s && s.host===ME_HOST; });
  const mk = TODAY.slice(0,7), ml = `${+mk.slice(5)}월`, net = b => amountOf(b)-feeOf(b), leaseNet = l => (l.rent+(l.ops||0))*(1-rateOf(l));
  const dayM = mine.filter(b=>b.unit==='day' && (b.status==='확정'||b.status==='완료') && b.start.slice(0,7)===mk);
  const expected = dayM.reduce((a,b)=>a+net(b),0) + myL.reduce((a,l)=>a+leaseNet(l),0);
  const settled = mine.filter(b=>b.unit==='day' && b.status==='완료').reduce((a,b)=>a+net(b),0) + myL.filter(l=>l.settle==='지급 완료').reduce((a,l)=>a+leaseNet(l),0);
  const paid = myL.filter(l=>l.thisMonth==='결제 완료'), rentTotal = myL.reduce((a,l)=>a+l.rent,0), rentPaid = paid.reduce((a,l)=>a+l.rent,0);
  const totalSeats = mySpaces.reduce((a,s)=>a+s.seats,0), freeSeats = mySpaces.reduce((a,s)=>a+s.free,0), used = totalSeats-freeSeats;
  const reqs = mine.filter(b=>b.status==='요청'), late = myL.filter(l=>l.thisMonth==='미납');
  const noReply = reviews.filter(r=>{ const s=sp(r.spaceId); return s && s.host===ME_HOST && !r.reply; });
  const waiting = mySpaces.filter(s=>s.status==='검수 대기');
  const verified = LIVE ? ME_GUEST.verified : true;
  const opened = mySpaces.some(s=>s.status==='공개');
  const steps = [['국가자격·영업 인증', verified, verified?'완료':'관리자 검수 중'], ['공간 등록', mySpaces.length>0, mySpaces.length?`${mySpaces.length}곳`:'아직 없음'], ['검수 승인·공개', opened, opened?'공개 중':'승인 대기']];
  const todos = [[reqs.length,'답해야 할 입점·예약 요청','host:req'],[late.length,'미납 월세','host:lease'],[noReply.length,'답글을 달지 않은 후기','host:reviews'],[waiting.length,'관리자 승인을 기다리는 공간','host:register']].filter(t=>t[0]>0);
  const next14 = Array.from({length:14},(_,i)=>{ const d=addDays(TODAY,i); return {d, n:mine.filter(b=>b.status==='확정' && (b.unit==='day' ? d>=b.start && d<=addDays(b.start,b.qty-1) : d===b.start)).length}; });
  const upcoming = mine.filter(b=>b.status==='확정' && b.start>=TODAY).sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
  const recentReq = [...mine].sort((a,b)=>b.id-a.id).slice(0,5);
  const c = simCalc(); const s=S.sim;
  return `
  <div class="head"><div><p class="muted small">${TODAY}</p><h2>${esc(ME_HOST)} 원장님</h2></div>
    <div class="adm-actions"><button class="btn" data-go="host:lease">월세 관리</button><button class="btn pri" data-go="host:register">공간 등록</button></div></div>
  ${steps.every(x=>x[1]) ? '' : `<section class="panel stack"><h3>시작하기</h3><ol class="hd-steps">${steps.map(([l,ok,st],i)=>`<li class="${ok?'done':''}"><span class="n">${ok?'✓':i+1}</span><b>${l}</b><span class="small muted">${st}</span></li>`).join('')}</ol>${verified?'':'<p class="note">자격 검수가 끝나기 전에는 공간이 공개되지 않습니다.</p>'}</section>`}
  <div class="adm-kpis">
    <div class="panel kpi"><span class="lbl">${ml} 정산 예정액</span><span class="v acc num">${won(expected)}</span><span class="small muted num">수수료 차감 후 · 누적 지급 완료 ${won(settled)}</span></div>
    <div class="panel kpi"><span class="lbl">${ml} 월세 수납</span><span class="v num">${won(rentPaid)}</span><span class="small muted num">${myL.length?`전체 ${won(rentTotal)} 중 ${paid.length}/${myL.length}건 완료`:'입점 중인 디자이너 없음'}</span><div class="bar" aria-hidden="true"><i style="width:${rentTotal?rentPaid/rentTotal*100:0}%"></i></div></div>
    <div class="panel kpi"><span class="lbl">응답 대기 요청</span><span class="v num">${reqs.length}건</span><span class="small muted">${reqs.length?'빨리 응답할수록 예약이 잘 이어집니다':'새 요청이 없습니다'}</span></div>
    <div class="panel kpi"><span class="lbl">좌석 가동률</span><span class="v num">${totalSeats?Math.round(used/totalSeats*100):0}%</span><span class="small muted num">임대 가능 ${freeSeats} / 전체 ${totalSeats}석 · ${mySpaces.length}곳</span></div>
  </div>
  <div class="grid2" style="grid-template-columns:1.2fr .8fr">
    <section class="panel stack"><h3>처리할 일</h3>${todos.length?`<ul class="adm-todo">${todos.map(([n,l,go])=>`<li><button data-go="${go}"><b class="num">${n}</b><span>${l}</span><i aria-hidden="true">›</i></button></li>`).join('')}</ul>`:'<p class="muted small" style="margin:0">지금 처리할 일이 없습니다.</p>'}</section>
    <section class="panel stack"><h3>앞으로 일정</h3>${upcoming.length?`<ul class="hd-list">${upcoming.map(b=>`<li><b class="num">${b.start.slice(5)}</b><span>${esc(b.guest)} · ${esc(sp(b.spaceId).name)}</span><span class="small muted">${b.unit==='day'?unitLabel('day',b.qty)+' 이용':'입주 시작'}</span></li>`).join('')}</ul>`:'<p class="muted small" style="margin:0">확정된 일정이 없습니다.</p>'}</section>
  </div>
  <section class="panel stack"><h3>앞으로 14일 확정 일정</h3>${barChart(next14,'var(--accent)','확정된 이용 건수')}</section>
  <section class="panel stack"><h3>내 공간</h3><div class="tbl-wrap"><table class="num"><thead><tr><th>공간</th><th>상태</th><th class="r">임대 가능</th><th class="r">${ml} 예약</th><th class="r">평점</th><th>진행 중 할인</th></tr></thead><tbody>
  ${mySpaces.length?mySpaces.map(x=>{ const d=dealOf(x); return `<tr><td>${esc(x.name)}<br><span class="small muted">${esc(x.area)}</span></td><td><span class="pill ${statusPill(x.status)}">${x.status}</span></td><td class="r">${x.free} / ${x.seats}석</td><td class="r">${mine.filter(b=>b.spaceId===x.id && b.status!=='거절' && b.status!=='취소' && b.start.slice(0,7)===mk).length}건</td><td class="r">★ ${ratingTxt(x)}</td><td>${d?`${esc(d.label)} ${dealPct(x)}% · ~${d.until}`:'–'}</td></tr>`; }).join(''):'<tr><td colspan="6" class="muted" style="text-align:center;padding:20px">등록된 공간이 없습니다. 공간을 등록해 주세요.</td></tr>'}
  </tbody></table></div></section>
  <section class="panel stack"><h3>최근 요청</h3><div class="tbl-wrap"><table class="num"><thead><tr><th>시작일</th><th>디자이너</th><th>공간</th><th>단위</th><th class="r">결제액</th><th>상태</th></tr></thead><tbody>
  ${recentReq.length?recentReq.map(b=>`<tr><td>${b.start}</td><td>${esc(b.guest)}</td><td>${esc(sp(b.spaceId).name)}</td><td>${unitLabel(b.unit,b.qty)}</td><td class="r">${won(amountOf(b))}</td><td><span class="pill ${statusPill(b.status)}">${b.status}</span></td></tr>`).join(''):'<tr><td colspan="6" class="muted" style="text-align:center;padding:20px">아직 요청이 없습니다</td></tr>'}
  </tbody></table></div>${mine.length>5?'<div><button class="btn sm" data-go="host:req">전체 보기</button></div>':''}</section>
  <details class="panel hd-more"><summary><b>할인·특가 설정</b> <span class="small muted">설정하면 공간 카드에 라벨과 할인가가 표시됩니다</span></summary><div class="stack" style="margin-top:14px">
  <p class="small muted">종료일이 지나면 원가로 자동 복귀합니다. 수수료는 실제 결제금액(할인가) 기준입니다.</p>
  ${mySpaces.map(s=>{const d=s.deal||{label:'',day:0,month:0,until:''}; const on=!!dealOf(s); return `<div class="deal-row"><div class="deal-h"><b>${esc(s.name)}</b><span class="small muted num">원가 월 ${won(s.month)} · 일 ${won(s.day)}</span>${on?`<span class="pill p-acc">${esc(d.label)} ${dealPct(s)}% 진행 중</span>`:(s.deal&&s.deal.until<TODAY?'<span class="pill p-mut">기간 종료</span>':'')}</div>
    <div class="seg" role="group" aria-label="라벨 종류"><button type="button" data-dealset="${s.id}:label:" aria-pressed="${!d.label}">없음</button>${DEAL_LABELS.map(l=>`<button type="button" data-dealset="${s.id}:label:${l}" aria-pressed="${d.label===l}">${l}</button>`).join('')}</div>
    ${d.label?`<div class="row"><div class="field"><label for="dl-p${s.id}">할인율 (%)</label><input id="dl-p${s.id}" type="number" min="1" max="90" step="1" value="${d.pct||''}" data-deal="${s.id}:pct"></div>
    <div class="field"><label for="dl-u${s.id}">적용 종료일</label><input id="dl-u${s.id}" type="date" min="${TODAY}" value="${d.until||''}" data-deal="${s.id}:until"></div></div>
    <p class="small muted">일·월·년 요금에 같은 할인율이 적용됩니다. 일 ${won(s.day)} → ${won(d.day||s.day)} · 월 ${won(s.month)} → ${won(d.month||s.month)}</p>`:''}</div>`}).join('')||'<p class="small muted">등록된 공간이 없습니다.</p>'}
  </div></details>
  <details class="panel hd-more"><summary><b>수익 시뮬레이터</b> <span class="small muted">우리 매장 숫자를 넣어 예상 수익을 계산해 보세요</span></summary><div class="grid2" style="margin-top:14px">
    <div class="stack">
      <div class="lbl">샵인샵 월 임대</div>
      <div class="row">
        <div class="field"><label for="sim-mc">월 임대 의자 수</label><input id="sim-mc" type="number" min="0" max="20" value="${s.mChairs}" data-sim="mChairs"></div>
        <div class="field"><label for="sim-mp">월세 (원)</label><input id="sim-mp" type="number" step="50000" min="0" value="${s.mPrice}" data-sim="mPrice"></div>
        <div class="field"><label for="sim-mo">운영료 (원/월)</label><input id="sim-mo" type="number" step="10000" min="0" value="${s.mOps}" data-sim="mOps"></div>
      </div>
      <div class="lbl">일 단위 대여 (남는 의자)</div>
      <div class="row">
        <div class="field"><label for="sim-chairs">빈 의자 수</label><input id="sim-chairs" type="number" min="0" max="20" value="${s.chairs}" data-sim="chairs"></div>
        <div class="field"><label for="sim-days">의자당 월 대여 일수</label><input id="sim-days" type="number" min="0" max="31" value="${s.days}" data-sim="days"></div>
        <div class="field"><label for="sim-dp">1일 가격 (원)</label><input id="sim-dp" type="number" step="5000" min="0" value="${s.dayPrice}" data-sim="dayPrice"></div>
      </div>
    </div>
    <div class="stack" aria-live="polite">
      <div class="kpi"><span class="lbl">예상 월 정산액</span><span class="v acc num" id="sim-net">${won(c.net)}</span><span class="small muted num" id="sim-year">연 환산 ${won(c.net*12)}</span></div>
      <div class="sum num" id="sim-sum">${simSum(c)}</div>
      <p class="note">추가 인건비 없이 생기는 수익입니다. 수수료는 정산 시 자동 차감됩니다.</p>
    </div>
  </div></details>`;
}
function simSum(c){ return `<div><span>샵인샵 월세</span><span>${won(c.mRent)}</span></div><div><span>운영료 (전기·기기 사용)</span><span>${won(c.mOps)}</span></div><div><span>일 단위 매출</span><span>${won(c.dayGross)}</span></div><div><span>플랫폼 수수료</span><span>− ${won(c.fee)}</span></div><div class="tot"><span>정산액</span><span>${won(c.net)}</span></div>`; }
function leaseEnd(l){ const d=new Date(l.start); d.setMonth(d.getMonth()+l.months); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); }
function nextPay(l){ const m = l.thisMonth==='결제 예정' ? '10' : '11'; return `다음 결제 2026-${m}-${String(l.payDay).padStart(2,'0')}`; }
const leasePill = st => ({'결제 완료':'p-ok','결제 예정':'p-mut','미납':'p-bad','알림 발송':'p-warn'})[st];
function hostLease(){
  const myL = leases.filter(l=>sp(l.spaceId).host===ME_HOST);
  const tot=myL.reduce((a,l)=>a+l.rent+(l.ops||0),0), fee=myL.reduce((a,l)=>a+(l.rent+(l.ops||0))*rateOf(l),0), depHold=myL.filter(l=>l.first&&l.settle==='정산 보류').reduce((a,l)=>a+l.deposit,0);
  return `<div class="head"><div><h2>월세 관리</h2><p class="small muted">입점 디자이너의 월세와 운영료를 프로체어가 매월 받아 정산합니다.</p></div></div>
  <section class="panel"><div class="grid3" style="gap:20px">
    <div class="stack" style="gap:4px"><span class="pill p-acc" style="justify-self:start">1 · 결제</span><p class="small">계약한 결제일에 월세와 운영료가 청구됩니다. 디자이너는 카드 자동결제나 가상계좌 입금 중 하나를 고릅니다.</p></div>
    <div class="stack" style="gap:4px"><span class="pill p-acc" style="justify-self:start">2 · 미납 관리</span><p class="small">결제 실패 시 프로체어가 디자이너에게 납부 알림을 보내고 재결제를 시도합니다.</p></div>
    <div class="stack" style="gap:4px"><span class="pill p-acc" style="justify-self:start">3 · 정산</span><p class="small">첫 달은 입주 확인 후, 이후는 결제 확인 후 수수료를 뺀 금액을 지급합니다.</p></div>
  </div></section>
  <div class="grid3">
    <div class="panel kpi"><span class="lbl">월세+운영료 합계 (10월)</span><span class="v num">${won(tot)}</span><span class="small muted num">입점 ${myL.length}명</span></div>
    <div class="panel kpi"><span class="lbl">정산 예정액</span><span class="v acc num">${won(tot-fee)}</span><span class="small muted num">수수료 ${won(fee)} 차감</span></div>
    <div class="panel kpi"><span class="lbl">입주 확인 후 전달될 보증금</span><span class="v num">${won(depHold)}</span><span class="small muted">반환은 계약 종료 시 원장님이 직접</span></div>
  </div>
  <section class="panel"><div class="tbl-wrap"><table class="num"><thead><tr><th>디자이너</th><th>공간 · 업종</th><th>계약 기간</th><th class="r">월세</th><th class="r">운영료</th><th class="r">보증금</th><th>결제일</th><th>10월 상태</th><th class="r">처리</th></tr></thead><tbody>
  ${myL.map(l=>`<tr><td><b>${esc(l.guest)}</b></td><td>${esc(sp(l.spaceId).name)} · ${esc(l.gType)}</td><td>${l.start} ~ ${leaseEnd(l)}<br><span class="small muted">${l.months}개월</span></td><td class="r">${won(l.rent)}</td><td class="r">${won(l.ops||0)}</td><td class="r">${won(l.deposit)}${l.first&&l.settle==='정산 보류'?'<br><span class="small muted">입주 확인 대기</span>':''}</td><td>매월 ${l.payDay}일<br><span class="small muted">${nextPay(l)}</span></td><td><span class="pill ${leasePill(l.thisMonth)}">${l.thisMonth==='미납'?'미납 D+'+(30-l.payDay):l.thisMonth}</span></td><td class="r" style="white-space:nowrap">${l.thisMonth==='미납'?`<button class="btn pri sm payred" data-lact="remind" data-id="${l.id}">납부 알림 보내기</button>`:`<button class="btn sm" data-lact="extend" data-id="${l.id}">계약 연장 제안</button>`}</td></tr>`).join('')}
  </tbody></table></div></section>
  <p class="note">보증금은 ${CONFIG.depositMethod}로 받아 입주 확인 후 원장님께 전달하고, 반환은 원장님이 직접 합니다.</p>`;
}
function hostReq(){
  const list = bookings.filter(b=>sp(b.spaceId).host===ME_HOST && (b.status==='요청'||b.status==='확정')).sort((a,b)=>(a.status==='요청'?0:1)-(b.status==='요청'?0:1));
  return `<div class="head"><h2>입점·예약 요청</h2><p class="small muted">수락하면 게스트에게 확정 알림이 갑니다. 결제는 이미 완료된 상태입니다.</p></div>
  <section class="panel">${list.length?list.map(b=>{const s=sp(b.spaceId);return `
    <div class="req"><div class="stack" style="gap:4px">
      <div class="row" style="align-items:center;gap:8px;flex-wrap:wrap"><h3 style="flex:none">${esc(b.guest)} 디자이너</h3><span class="pill ${statusPill(b.status)}">${b.status}</span><span class="pill p-ok">국가자격 인증됨</span></div>
      <div class="meta"><span>${esc(s.name)}</span><span>·</span><span>${esc(b.gType)}</span><span>·</span><span class="num">${b.start} 시작 · ${unitLabel(b.unit,b.qty)}${b.unit==='day'?` · ${b.time}~${endOf(b.time,s.dayHours)}`:''}</span><span>·</span><span>${contractLabel(b.contract)}</span></div>
      <div class="small num">결제 ${won(amountOf(b))} → 정산 예정 <b>${won(amountOf(b)-feeOf(b))}</b></div></div>
      <div class="row" style="flex:none;gap:8px">${b.status==='요청'?`<button class="btn sm" data-act="reject" data-id="${b.id}">거절</button><button class="btn pri sm" data-act="accept" data-id="${b.id}">수락</button>`:'<span class="small muted">이용 대기</span>'}</div>
    </div>`}).join(''):'<div class="empty">새 예약 요청이 없습니다.</div>'}</section>
  <p class="note">요청은 가능한 빨리 수락하거나 거절해 주세요. 취소·환불 기준은 이용약관을 따릅니다.</p>`;
}
function hostSettle(){
  const list = bookings.filter(b=>sp(b.spaceId).host===ME_HOST && b.status!=='거절' && b.status!=='요청');
  let g=0,f=0; list.forEach(b=>{g+=amountOf(b);f+=feeOf(b);});
  return `<div class="head"><h2>정산 내역</h2><p class="small muted">월 입점은 결제액(월세+운영료) 기준, 첫 달은 입주 확인 후 지급합니다.</p></div>
  <section class="panel"><div class="tbl-wrap"><table class="num"><thead><tr><th>시작일</th><th>게스트</th><th>공간</th><th>단위</th><th class="r">결제액</th><th class="r">수수료</th><th class="r">정산액</th><th>상태</th></tr></thead><tbody>
  ${list.map(b=>`<tr><td>${b.start}</td><td>${esc(b.guest)}</td><td>${esc(sp(b.spaceId).name)}</td><td>${unitLabel(b.unit,b.qty)}</td><td class="r">${won(amountOf(b))}</td><td class="r">${CONFIG.feePublic?pct(CONFIG.fee[b.unit])+' · ':''}${won(feeOf(b))}</td><td class="r"><b>${won(amountOf(b)-feeOf(b))}</b></td><td><span class="pill ${statusPill(b.status)}">${b.status==='완료'?'정산 완료':'정산 예정'}</span></td></tr>`).join('')}
  </tbody><tfoot><tr><td colspan="4">합계</td><td class="r">${won(g)}</td><td class="r">${won(f)}</td><td class="r">${won(g-f)}</td><td></td></tr></tfoot></table></div></section>
  <p class="note">세금계산서·현금영수증 발행 방식은 PG사 정산 구조 확정 후 반영합니다.</p>`;
}
function hostRegister(){
  const r=S.reg; const preview={...r,name:r.name||'매장 이름',h:300,host:ME_HOST,status:'검수 대기',photos:r.photos.map(x=>x.url)};
  const hoursOk = accessOk(r);
  return `<div class="head"><h2>공간 등록</h2><p class="small muted">등록 후 관리자 검수(영업신고증 확인)를 거쳐 공개됩니다.</p></div>
  <div class="grid2">
    <form class="panel stack" id="regform">
      <div class="field"><label for="r-name">매장 이름</label><input id="r-name" type="text" value="${esc(r.name)}" placeholder="예: 결 헤어 스튜디오 2호점" data-reg="name"></div>
      <div class="row">
        <div class="field"><label for="r-area">지역</label><input id="r-area" type="text" readonly value="${esc(r.area)}" placeholder="우편번호로 자동 입력"></div>
        <div class="field"><label for="r-seats">전체 좌석</label><input id="r-seats" type="number" min="1" max="30" value="${r.seats}" data-reg="seats"></div>
        <div class="field"><label for="r-free">임대할 좌석</label><input id="r-free" type="number" min="1" max="30" value="${r.free}" data-reg="free"></div>
      </div>
      <div class="field"><label for="r-road">매장 주소</label><div class="row" style="gap:8px;flex-wrap:nowrap"><input id="r-road" type="text" readonly value="${esc(r.road?(r.zip?'('+r.zip+') ':'')+r.road:'')}" placeholder="우편번호 찾기를 눌러 주세요"><button type="button" class="btn" style="flex:0 0 auto" data-addr="reg">우편번호 찾기</button></div></div>
      <div class="field"><label for="r-addr">상세 주소</label><input id="r-addr" type="text" value="${esc(r.addr)}" placeholder="예: 2층 201호 (직접 입력)" data-reg="addr" ${r.road?'':'disabled'}><span class="small muted">게스트에게는 지역만 보이고, 상세 주소는 예약이 확정된 뒤에 공개됩니다.</span></div>
      <div class="row">
        <div class="field"><label for="r-pyeong">매장 면적 (평)</label><input id="r-pyeong" type="number" min="1" max="500" value="${r.pyeong}" data-reg="pyeong"></div>
        <div class="field"><label for="r-shampoo">샴푸대 (개)</label><input id="r-shampoo" type="number" min="0" max="30" value="${r.shampoo}" data-reg="shampoo"><span class="small muted">없으면 0</span></div>
        ${needsBed(r.types)?`<div class="field"><label for="r-beds">베드 (개)</label><input id="r-beds" type="number" min="0" max="30" value="${r.beds}" data-reg="beds"><span class="small muted">피부·반영구·SMP 시술용</span></div>`:''}
      </div>
      <div class="field"><span class="lbl">영업신고 업종 (게스트 시술 범위의 기준)</span><div class="chips">${TYPES.map(t=>`<button type="button" class="chip" data-regtype="${t}" aria-pressed="${r.types.includes(t)}">${t}${PENDING_TYPES.includes(t)?' *':''}</button>`).join('')}</div>
        <span class="small ${hasPending(r.types)?'':'muted'}" style="${hasPending(r.types)?'color:var(--warn)':''}">* 반영구·SMP는 문신사법 시행 전까지 비의료인 시술이 불가합니다. 선택 시 사전 접수로만 등록되고 검색에 노출되지 않습니다.</span></div>
      ${r.types.length?`<div class="field"><span class="lbl">선택한 업종의 이용 기준 (디자이너에게 안내됨)</span>${ruleTable(r.types)}</div>`:''}
      <div class="row">
        <div class="field"><label for="r-day">1일 가격 (원)</label><input id="r-day" type="number" step="5000" min="0" value="${r.day}" data-reg="day"></div>
        <div class="field"><label for="r-month">월세 (원)</label><input id="r-month" type="number" step="50000" min="0" value="${r.month}" data-reg="month"></div>
        <div class="field"><label for="r-deposit">보증금 (원)</label><input id="r-deposit" type="number" step="100000" min="0" value="${r.deposit}" data-reg="deposit"></div>
        <div class="field"><label for="r-year">연 임대료 (원)</label><input id="r-year" type="number" step="100000" min="0" value="${r.year}" data-reg="year"><span class="small muted">매월 1/12씩 분납 · 월세×12 = ${won(r.month*12)}</span></div>
        <div class="field"><label for="r-ops">운영료 (원/월)</label><input id="r-ops" type="number" step="10000" min="0" value="${r.ops}" data-reg="ops"><span class="small muted">전기·기기 사용료, 매월 정액</span></div>
      </div>
      <div class="field"><span class="lbl">제공 서비스 (임대료·운영료에 포함)</span><div class="chips">${SERVICES.map(v=>`<button type="button" class="chip" data-regsvc="${v}" aria-pressed="${r.svc.includes(v)}">${v}</button>`).join('')}</div><span class="small muted">${SELF_SUPPLY}</span></div>
      <fieldset class="panel stack" style="padding:16px;margin:0">
        <legend class="lbl" style="padding:0 6px">이용 시간 규칙</legend>
        <div class="row">
          <div class="field"><label for="r-open">매장 영업 시작 (참고)</label><input id="r-open" type="time" step="1800" value="${r.open}" data-reg="open"></div>
          <div class="field"><label for="r-close">매장 영업 종료 (참고)</label><input id="r-close" type="time" step="1800" value="${r.close}" data-reg="close"></div>
        </div>
        <label class="check"><input id="r-acc24" type="checkbox" ${r.acc24?'checked':''} data-reg="acc24"> 24시간 출입 가능 (새벽 메이크업·광고 촬영 대응)</label>
        ${r.acc24?'':`<div class="row">
          <div class="field"><label for="r-accFrom">출입 가능 시작</label><input id="r-accFrom" type="time" step="1800" value="${r.accFrom}" data-reg="accFrom"></div>
          <div class="field"><label for="r-accTo">출입 가능 종료</label><input id="r-accTo" type="time" step="1800" value="${r.accTo}" data-reg="accTo"></div>
        </div>`}
        <div class="field"><label for="r-dayHours">1일 기준 시간</label><select id="r-dayHours" data-reg="dayHours">${[4,6,8,10,12,14,16,24].map(h=>`<option value="${h}" ${h===r.dayHours?'selected':''}>연속 ${h}시간</option>`).join('')}</select></div>
        <span class="small ${hoursOk?'muted':''}" style="${hoursOk?'':'color:var(--bad)'}">${hoursOk?`게스트가 시작 시각을 고르면 그때부터 연속 ${r.dayHours}시간이 1일입니다. 예: 02:00 시작 → ${endOf('02:00',r.dayHours)} 종료${r.acc24?'':' (출입 가능 시간 안에서만 선택 가능)'}`:`출입 가능 시간이 1일 기준(${r.dayHours}시간)보다 짧습니다. 시간을 늘리거나 기준을 줄여 주세요.`}</span>
        <div class="field"><label for="r-code">출입 정보 (선택)</label><input id="r-code" type="text" value="${esc(r.code)}" placeholder="예: 도어락 1234#" data-reg="code"><span class="small muted">입력하면 예약이 확정된 게스트에게만 자동으로 보여집니다.</span></div>
      </fieldset>
      <div class="field"><span class="lbl">임대 가능 요일</span><div class="chips">${DAYS.map(d=>`<button type="button" class="chip" data-regday="${d}" aria-pressed="${r.days.includes(d)}">${d}</button>`).join('')}</div></div>
      <label class="check"><input id="r-share" type="checkbox" ${r.share?'checked':''} data-reg="share"> 본인 영업신고를 한 게스트도 받기 (공유미용실 요건 충족 매장만)</label>
      <div class="field"><label for="r-photos">매장 사진 <span class="muted num">${r.photos.length} / ${CONFIG.photo.max}장</span></label>
        ${r.photos.length<CONFIG.photo.max?`<input id="r-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple data-photos>`:''}
        <span class="small muted">최대 ${CONFIG.photo.max}장, 장당 ${CONFIG.photo.maxKB}KB 이하. 큰 사진은 올릴 때 자동으로 줄여 저장합니다. 첫 번째 사진이 대표 사진입니다.</span>
        ${r.photos.length?`<ul class="photo-list">${r.photos.map((ph,i)=>`<li><img src="${ph.url}" alt="매장 사진 ${i+1}"><span class="small num">${i===0?'대표 · ':''}${Math.round(ph.kb)}KB</span><button type="button" class="btn ghost sm" data-delphoto="${i}" aria-label="사진 ${i+1} 삭제">삭제</button></li>`).join('')}</ul>`:''}</div>
      <div class="field"><label for="r-file">미용업 영업신고증</label><input id="r-file" type="file" accept="image/*,.pdf" data-reg="file"><span class="small muted">${r.file?esc(r.file)+' 선택됨':(LIVE?'가입 후 관리자 검수에 쓰입니다. 본인과 관리자만 볼 수 있습니다.':'프로토타입에서는 파일이 저장되지 않습니다.')}</span></div>
      <div class="sum num"><div><span>1일 대여 시 정산액</span><span>${won(r.day*(1-CONFIG.fee.day))}</span></div><div><span>월 입점 1건 정산액 (월세+운영료)</span><span>${won((r.month+r.ops)*(1-CONFIG.fee.month))}</span></div><div><span>년 입점 매월 정산액 (분납+운영료)</span><span>${won((r.year/12+r.ops)*(1-CONFIG.fee.year))}</span></div><div class="muted small"><span>보증금 (수수료 없음)</span><span>입주 확인 후 ${won(r.deposit)} 전달</span></div></div>
      <button class="btn pri" type="submit" ${r.types.length&&r.days.length&&hoursOk?'':'disabled'}>검수 요청하기</button>
    </form>
    <div class="stack"><span class="lbl">게스트에게 보이는 모습</span><div id="regprev">${spaceCard(preview,false)}</div>
      <p class="note">매장 사진은 최대 ${CONFIG.photo.max}장, 장당 ${CONFIG.photo.maxKB}KB까지 올립니다. 올린 첫 사진이 카드에 보입니다. 사진 아래 아이콘은 임대 가능 좌석(밝음)과 사용 중 좌석(흐림)입니다.</p></div>
  </div>`;
}
function spaceCard(s,clickable){
  return `<${clickable?'button':'div'} class="card" ${clickable?`data-open="${s.id}"`:''} style="${clickable?'':'cursor:default'}">${ph(s)}
  <div class="card-b"><div class="card-title"><h3>${esc(s.name)}</h3>${s.status!=='공개'?`<span class="pill ${statusPill(s.status)}">${s.status}</span>`:`<span class="rate num">★ ${ratingTxt(s)}</span>`}</div>
  <p class="small muted">${esc(s.area)} · 임대 ${s.free}석 / 전체 ${s.seats}석</p>
  ${s.pyeong?`<p class="small num"><b>${s.shampoo?`샴푸대 ${s.shampoo}개`:'샴푸대 없음'}${s.beds?` · 베드 ${s.beds}개`:''}</b> <span class="muted">· ${s.pyeong}평</span></p>`:''}
  <div class="price num"><span>${S.filter.unit==='year'?`<b>${won(pYear(s))}</b> /년`:S.filter.unit==='month'?`${priceOf(pMonth(s),s.month)} /월`:`${priceOf(pDay(s),s.day)} /일`}</span></div>
  <p class="small muted num">1일 = 연속 ${s.dayHours}시간 · 출입 ${accLabel(s)}</p>
  <div class="chips">${s.share?'<span class="pill p-acc">각자 신고 가능</span>':''}<span class="pill p-mut">${s.days.join('')}</span></div></div></${clickable?'button':'div'}>`;
}

/* 화면 등록 */
PAGES.host.dash=()=>hostDash(); PAGES.host.lease=()=>hostLease(); PAGES.host.req=()=>hostReq(); PAGES.host.settle=()=>hostSettle(); PAGES.host.register=()=>hostRegister();
