/* ===== 게스트 ===== */
function guestSearch(){
  const f=S.filter; const q=f.q.trim(); const list=spaces.filter(s=>s.status==='공개'&&(f.area==='전체'||s.area===f.area)&&(f.type==='전체'||s.types.includes(f.type))&&(!f.flag||s[f.flag])&&(!+f.shampoo||(s.shampoo||0)>=+f.shampoo)&&(!+f.bed||(s.beds||0)>=+f.bed)&&(!q||[s.name,s.area,...s.types].join(' ').includes(q))).sort((a,b)=>unitPrice(a,f.unit)-unitPrice(b,f.unit));
  return `<div class="head"><div>${S.user&&S.user.type==='guest'||!LIVE?`<p class="muted small">${esc(ME_GUEST.name)} 디자이너 · ${ME_GUEST.licenses.map(esc).join('·')} 자격 ${ME_GUEST.verified?'인증 완료':'검수 중'}</p>`:''}<h2>내 샵인샵 자리를 찾아보세요</h2></div></div>
  <section class="panel row" style="align-items:end">
    <div class="field"><label for="f-area">지역</label><select id="f-area" data-filter="area"><option>전체</option>${areaOptions().map(a=>`<option ${a===f.area?'selected':''}>${esc(a)}</option>`).join('')}</select></div>
    <div class="field"><label for="f-type">업종</label><select id="f-type" data-filter="type"><option>전체</option>${TYPES.map(t=>`<option ${t===f.type?'selected':''}>${t}</option>`).join('')}</select></div>
    <div class="field"><label for="f-sh">샴푸대</label><select id="f-sh" data-filter="shampoo">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${+f.shampoo===n?'selected':''}>${n?n+'개 이상':'전체'}</option>`).join('')}</select></div>
    <div class="field"><label for="f-bed">베드</label><select id="f-bed" data-filter="bed">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${+f.bed===n?'selected':''}>${n?n+'개 이상':'전체'}</option>`).join('')}</select></div>
    <div class="field" style="flex:0 0 auto"><span class="lbl">가격 기준</span><div class="seg">${['day','month','year'].map(u=>`<button data-unit="${u}" aria-pressed="${f.unit===u}">${UNIT_NAME[u]}</button>`).join('')}</div></div>
    <div class="field" style="flex:1 1 100%"><span class="lbl">조건</span><div class="chips"><button class="chip" data-flag="acc24" aria-pressed="${f.flag==='acc24'}">24시간 출입</button><button class="chip" data-flag="share" aria-pressed="${f.flag==='share'}">각자 신고 가능</button>${q?`<button class="chip" data-clearq aria-pressed="true">검색어: ${esc(q)} ✕</button>`:''}</div></div>
  </section>
  <p class="small muted">${list.length}곳 · ${UNIT_NAME[f.unit]} 가격 낮은 순</p>
  ${list.length?`<div class="cards">${list.map(s=>spaceCard(s,true)).join('')}</div>`:'<div class="panel empty">조건에 맞는 공간이 없습니다. 지역이나 업종을 바꿔 보세요.</div>'}`;
}
function guestDetail(){
  const s=sp(S.sel), F=S.form; const unitP = unitPrice(s,F.unit); const total=unitP*F.qty;
  if(!s.types.includes(F.gType)) F.gType=s.types[0];
  if(F.contract==='own'&&!s.share) F.contract='freelance';
  const hasLic = ME_GUEST.verified && ME_GUEST.licenses.includes(F.gType);
  const ownOk = F.contract!=='own' || ME_GUEST.ownReport;
  const opts = startOptions(s); if(!opts.includes(F.time)) F.time = opts.includes('10:00')?'10:00':opts[0];
  const used = F.unit==='day' ? overlapCount(s.id,F.start,F.qty,F.time,s.dayHours) : 0;
  const clash = F.unit==='day' && used >= s.free;
  const minDate = LIVE ? TODAY : '2026-10-31';
  const dayName = d => DAYS[(new Date(d+'T00:00:00Z').getUTCDay()+6)%7];
  const badDays = F.unit==='day' ? Array.from({length:F.qty},(_,i)=>addDays(F.start,i)).filter(d=>!s.days.includes(dayName(d))) : [];
  const pastStart = !F.start || F.start < minDate;
  const badInput = pastStart || badDays.length>0 || !Number.isInteger(F.qty);
  const reason = pastStart ? `지난 날짜는 예약할 수 없습니다. ${minDate} 이후 날짜를 선택해 주세요.`
    : badDays.length ? `임대 가능 요일은 ${s.days.join('·')}입니다. 선택한 기간에 이용할 수 없는 날이 있습니다 (${badDays.map(d=>d.slice(5)+'('+dayName(d)+')').join(', ')}).` : '';
  const reasonP = reason ? `<p class="small" style="color:var(--bad)" role="alert">${reason}</p>` : '';
  const beyond = F.unit==='day' && (toMin(F.time)<toMin(s.open) || toMin(F.time)+s.dayHours*60>toMin(s.close));
  const outside = s.acc24 || toMin(s.accFrom)<toMin(s.open) || toMin(s.accTo)>toMin(s.close);
  return `<div><button class="btn ghost sm" data-back>← 목록으로</button></div>
  <div class="grid2">
    <div class="stack">${ph(s,true)}
      <div class="row" style="align-items:center;gap:8px"><h2 style="flex:1 1 auto">${esc(s.name)}</h2><span class="small muted num">★ ${ratingTxt(s)}</span></div>
      <p class="muted">${esc(s.area)} · 임대 ${s.free}석 / 전체 ${s.seats}석 · 영업신고 업종 ${s.types.map(esc).join(', ')}</p>
      <section class="panel"><div class="grid3 num" style="gap:12px">
        <div class="kpi"><span class="lbl">1일 기준</span><b>연속 ${s.dayHours}시간</b><span class="small muted">시작 시각은 직접 선택</span></div>
        <div class="kpi"><span class="lbl">출입 가능</span><b>${accLabel(s)}</b><span class="small muted">${s.acc24?'새벽 콜 가능':'이 시간 안에서 이용'}</span></div>
        <div class="kpi"><span class="lbl">매장 영업시간</span><b>${s.open}~${s.close}</b><span class="small muted">${outside?'영업 시간 밖에도 출입 가능 시간 안에서 이용할 수 있습니다':'영업 시간 안에서 이용합니다'}</span></div>
      </div></section>
      ${s.pyeong?`<section class="panel stack"><h3>매장 규모</h3><div class="num" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px">
        <div class="kpi"><span class="lbl">샴푸대</span><b>${s.shampoo?s.shampoo+'개':'없음'}</b><span class="small muted">${s.shampoo?'사용 가능 (제공 서비스 확인)':'샴푸 서비스가 필요 없는 업종'}</span></div>
        ${s.beds?`<div class="kpi"><span class="lbl">베드</span><b>${s.beds}개</b><span class="small muted">피부·반영구·SMP 시술용</span></div>`:''}
        <div class="kpi"><span class="lbl">매장 면적</span><b>${s.pyeong}평</b><span class="small muted">전체 좌석 ${s.seats}석</span></div>
        <div class="kpi"><span class="lbl">임대 가능</span><b>${s.free}석</b><span class="small muted">위치 ${esc(s.area)}</span></div>
      </div><p class="small muted">상세 주소는 예약이 확정된 뒤 공개됩니다.</p></section>`:''}
      <section class="panel stack"><h3>제공 서비스</h3>
        <div class="svc-grid">${SERVICES.map(v=>{const on=s.svc.includes(v);return `<div class="svc ${on?'on':''}"><span aria-hidden="true">${on?'✓':'–'}</span><span>${esc(v)}</span><span class="vh">${on?'포함':'미포함'}</span></div>`}).join('')}</div>
        <p class="small muted">포함 ${s.svc.length}개 · 미포함 항목은 원장님과 별도 협의</p></section>
      <section class="panel stack"><h3>${esc(F.gType)} 이용 기준</h3>
        ${TYPE_RULES[F.gType]?`<dl class="rule-dl"><div><dt>매장 기기 (운영료)</dt><dd>${esc(TYPE_RULES[F.gType].rent)}</dd></div><div><dt>직접 준비</dt><dd>${esc(TYPE_RULES[F.gType].own)}</dd></div><div><dt>유의사항</dt><dd>${esc(TYPE_RULES[F.gType].note)}</dd></div></dl>`:''}
        <p class="small muted">시술 업종을 바꾸면 기준도 바뀝니다.</p></section>
      <section class="panel stack"><h3>이용 규칙</h3>
        <p class="small">${SELF_SUPPLY} 이용 종료 시각까지 자리 정리. 고객 응대·결제는 디자이너 본인이 진행.</p>
        <p class="small muted">임대 가능 요일: ${s.days.join(', ')}</p></section>
      ${reviewSection(s)}
    </div>
    <form class="panel stack" id="bookform">
      <div class="seg" role="group" aria-label="임대 기준">${['day','month','year'].map(u=>`<button type="button" data-funit="${u}" aria-pressed="${F.unit===u}">${u==='day'?'일':u==='month'?'월':'년'} ${won(unitPrice(s,u))}</button>`).join('')}</div>
      <div class="row">
        <div class="field"><label for="b-start">시작일</label><input id="b-start" type="date" value="${F.start}" min="${LIVE?TODAY:'2026-10-31'}" data-form="start"></div>
        <div class="field"><label for="b-qty">${F.unit==='day'?'이용 일수':F.unit==='year'?'이용 년수':'이용 개월'}</label><input id="b-qty" type="number" min="1" max="${QTY_MAX[F.unit]}" value="${F.qty}" data-form="qty"></div>
        ${F.unit==='day'?`<div class="field"><label for="b-time">시작 시각</label><select id="b-time" data-form="time">${opts.map(t=>`<option ${t===F.time?'selected':''}>${t}</option>`).join('')}</select></div>`:''}
      </div>
      ${F.unit==='day'?`<div class="note num">이용 시간 <b>${F.time} ~ ${endOf(F.time,s.dayHours)}</b> (연속 ${s.dayHours}시간)${F.qty>1?`, ${F.qty}일 동안 매일 같은 시간`:''}${beyond?`<br><span class="small muted">매장 영업시간(${s.open}~${s.close}) 밖의 시간이 포함됩니다. 영업 외 시간은 출입 가능 시간(${accLabel(s)}) 안에서 이용합니다.</span>`:''}</div>
      ${reasonP}${clash?`<p class="small" style="color:var(--bad)">이 시간대는 임대 좌석 ${s.free}석이 모두 예약되어 있습니다. 시작 시각이나 날짜를 바꿔 주세요.</p>`:(badInput?'':`<span class="pill p-ok" style="justify-self:start">예약 가능 · 같은 시간대 ${used}/${s.free}석 사용 중</span>`)}`
      :`<div class="note">${F.unit==='year'?'년':'월'} 단위는 출입 가능 시간(${accLabel(s)}) 안에서 자유롭게 이용합니다.</div>${reasonP}`}
      <div class="field"><label for="b-type">시술 업종</label><select id="b-type" data-form="gType">${s.types.map(t=>`<option ${t===F.gType?'selected':''}>${t}</option>`).join('')}</select>
        ${hasLic?'<span class="pill p-ok" style="justify-self:start">보유 국가자격과 업종 일치</span>':`<span class="pill ${ME_GUEST.verified?'p-bad':'p-warn'}" style="justify-self:start">${ME_GUEST.verified?'이 업종의 국가자격이 없습니다':'국가자격 검수가 끝나면 예약할 수 있습니다'}</span>`}</div>
      <div class="field"><span class="lbl">계약 유형</span>
        <label class="radio"><input type="radio" name="ct" value="freelance" ${F.contract==='freelance'?'checked':''} data-form="contract"><span><b>호스트 소속 프리랜서</b><br><span class="small muted">매장의 영업신고 아래에서 시술합니다. 매장 업종 안에서만 가능합니다.</span></span></label>
        <label class="radio ${s.share?'':'dis'}"><input type="radio" name="ct" value="own" ${F.contract==='own'?'checked':''} ${s.share?'':'disabled'} data-form="contract"><span><b>각자 영업신고</b><br><span class="small muted">${s.share?'본인 명의 영업신고증이 필요합니다.':'이 매장은 각자 영업신고 게스트를 받지 않습니다.'}</span></span></label>
        ${!ownOk?'<p class="small" style="color:var(--bad)">본인 영업신고증이 등록되지 않았습니다. 인증 후 선택할 수 있습니다.</p>':''}</div>
      ${F.unit!=='day'?`<div class="sum num">${F.unit==='year'?`<div><span>연 임대료</span><span>${won(pYear(s))} /년</span></div><div><span>매월 분납 (연 임대료 ÷ 12)</span><span>${won(monthlyOf(s,'year'))} /월</span></div>`:`<div><span>월세${dealOf(s)&&pMonth(s)<s.month?` (${esc(s.deal.label)})`:''}</span><span>${won(pMonth(s))} /월</span></div>`}<div><span>운영료 (전기·기기 사용)</span><span>${won(s.ops||0)} /월</span></div><div><span>보증금 (${CONFIG.depositMethod} 결제)</span><span>${won(s.deposit)}</span></div><div class="muted small"><span>보증금은 입주 확인 후 원장님께 전달, 계약 종료 시 원장님이 반환</span><span></span></div><div class="muted small"><span>2개월째부터 매월 ${F.start.slice(8)}일 결제 (카드 또는 가상계좌)</span><span>수수료 게스트 부담 0원</span></div><div class="tot"><span>오늘 결제 (첫 달 ${F.unit==='year'?'분납액':'월세'} + 운영료 + 보증금)</span><span>${won(firstPay(s,F.unit))}</span></div></div>`
      :`<div class="sum num"><div><span>${won(unitP)} × ${unitLabel(F.unit,F.qty)}</span><span>${won(total)}</span></div><div class="muted small"><span>이용 시간</span><span>${F.time} ~ ${endOf(F.time,s.dayHours)}</span></div><div class="muted small"><span>플랫폼 수수료는 호스트 정산에서 차감</span><span>게스트 부담 0원</span></div><div class="tot"><span>결제 금액</span><span>${won(total)}</span></div></div>`}
      <button class="btn pri payred" type="submit" ${!badInput&&((LIVE&&!S.user&&!clash)||(hasLic&&ownOk&&!clash))?'':'disabled'}>${LIVE?(F.unit!=='day'?'입점 신청하기':'예약 요청하기'):(F.unit!=='day'?'입점 신청하고 첫 달 결제':'결제하고 예약 요청')}</button>
      <p class="small muted">${LIVE?'원장님이 수락하면 확정되고, 입금 방법은 따로 안내드립니다.':'원장님이 수락하면 확정됩니다. 거절 시 전액 환불됩니다.'}</p>
    </form>
  </div>`;
}

/* 화면 등록 */
PAGES.guest.search=()=>S.sel?guestDetail():guestSearch(); PAGES.guest.mine=()=>guestMine();
