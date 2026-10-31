/* ===== 이벤트 ===== */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-open]'); if(!t) return;
  if(t.dataset.auth){ const a=t.dataset.auth;
    if(a==='login'||a==='signup'){ S.auth=newAuth(a,t.dataset.type); render(); scrollTo(0,0); return; }
    if(a==='logout'){ S.user=null; S.role='intro'; render(); toast('로그아웃했습니다'); return; }
    if(a==='cancel'){ S.auth=null; render(); return; }
    if(a==='back'){ S.auth.err=''; S.auth.step=Math.max(0,S.auth.step-1); render(); return; }
    if(a==='send'){ const A=S.auth; if(!phoneOk(A.phone)){ A.err='휴대폰 번호를 확인해 주세요. 예: 010-1234-5678'; } else { A.err=''; A.sent=true; toast('인증번호를 보냈습니다 (예시: '+DEMO_CODE+')'); } render(); const c=document.getElementById('a-code'); if(c) c.focus(); return; }
    if(a==='kakao'){ S.auth.err='카카오 로그인은 정식 버전에서 연결합니다. 시연 계정을 이용해 주세요.'; render(); return; }
    if(a==='start'){ const A=S.auth; S.user={name:A.name.trim(),type:A.type}; S.auth=null; S.role=A.type; S.tab[A.type]=A.type==='host'?'register':'search';
      if(A.type==='host'){ S.reg.name=A.store.trim(); S.reg.area=A.area; S.reg.types=[...A.types]; } render(); scrollTo(0,0); return; }
  }
  if(t.dataset.ap){ S.auth.type=t.dataset.ap; S.auth.err=''; render(); return; }
  if(t.dataset.aq){ const q=S.auth.quals, v=t.dataset.aq; S.auth.quals=q.includes(v)?q.filter(x=>x!==v):QUALS.map(x=>x.k).filter(k=>q.includes(k)||k===v); render(); return; }
  if(t.dataset.aqf){ S.auth.qform=t.dataset.aqf; S.auth.err=''; render(); return; }
  if(t.dataset.alic){ const k=t.dataset.alic, v=t.dataset.v, arr=S.auth[k]; S.auth[k]=arr.includes(v)?arr.filter(x=>x!==v):TYPES.filter(x=>arr.includes(x)||x===v); render(); return; }
  if(t.dataset.demo){ Object.assign(S.auth,{phone:t.dataset.demo,sent:true,code:DEMO_CODE,err:''}); authSubmit(); return; }
  if(t.dataset.demotoggle){ const m=$('#demomenu'); m.hidden=!m.hidden; t.setAttribute('aria-expanded',String(!m.hidden)); return; }
  if(t.dataset.role){ const dm=$('#demomenu'); if(dm){dm.hidden=true; const f=$('.demo-fab'); if(f) f.setAttribute('aria-expanded','false');} S.role=t.dataset.role; if(S.role==='intro') S.tab.intro='home'; S.sel=null; S.auth=null; render(); scrollTo(0,0); return; }
  if(t.dataset.tab){ S.tab[S.role]=t.dataset.tab; S.sel=null; render(); return; }
  if(t.dataset.go){ const [r,tab]=t.dataset.go.split(':'); S.role=r; S.tab[r]=tab; S.sel=null; S.auth=null; render(); scrollTo(0,0); return; }
  if(t.dataset.open){ S.recent=[+t.dataset.open,...S.recent.filter(x=>x!==+t.dataset.open)].slice(0,8); S.role='guest'; S.tab.guest='search'; S.sel=+t.dataset.open; S.form.unit='day'; S.form.qty=1; render(); scrollTo(0,0); return; }   /* 상세 진입 시 기본은 일 단위 */
  if('back' in t.dataset){ S.sel=null; render(); return; }
  if(t.dataset.unit){ S.filter.unit=t.dataset.unit; render(); return; }
  if(t.dataset.flag){ S.filter.flag = S.filter.flag===t.dataset.flag?'':t.dataset.flag; render(); return; }
  if('clearq' in t.dataset){ S.filter.q=''; render(); return; }
  if(t.dataset.fav){ const id=+t.dataset.fav; S.fav.has(id)?S.fav.delete(id):S.fav.add(id); t.setAttribute('aria-pressed',S.fav.has(id)); toast(S.fav.has(id)?'찜한 공간에 담았습니다':'찜을 해제했습니다'); return; }
  if(t.dataset.cat){ Object.assign(S.filter,{type:t.dataset.cat,flag:'',q:''}); S.role='guest'; S.tab.guest='search'; S.sel=null; render(); scrollTo(0,0); return; }
  if(t.dataset.browse){ const [k,v]=t.dataset.browse.split(':'); Object.assign(S.filter,{type:'전체',flag:'',q:''}); if(k==='flag') S.filter.flag=v; if(k==='unit') S.filter.unit=v; S.role='guest'; S.tab.guest='search'; S.sel=null; render(); scrollTo(0,0); return; }
  if(t.dataset.hcat){ S.homeCat=t.dataset.hcat; render(); return; }
  if(t.dataset.funit){ S.form.unit=t.dataset.funit; S.form.qty=t.dataset.funit==='day'?3:t.dataset.funit==='year'?1:6; render(); return; }
  if(t.dataset.dealset){ const [id,k,v]=t.dataset.dealset.split(':'); const s=sp(+id); s.deal=s.deal||{label:'',day:0,month:0,until:''}; s.deal.label=v; if(v&&!s.deal.until) s.deal.until='2026-11-30'; if(!v) s.deal=null; render(); return; }
  if(t.dataset.mview){ S.mineView=t.dataset.mview; render(); return; }
  if(t.dataset.mmonth){ S.mineMonth=t.dataset.mmonth; render(); return; }
  if(t.dataset.atab){ S.adminTab=t.dataset.atab; render(); return; }
  if(t.dataset.delphoto!=null){ S.reg.photos.splice(+t.dataset.delphoto,1); render(); return; }
  if(t.dataset.regtype){ const r=S.reg.types; const v=t.dataset.regtype; S.reg.types=r.includes(v)?r.filter(x=>x!==v):[...r,v]; render(); return; }
  if(t.dataset.regday){ const r=S.reg.days; const v=t.dataset.regday; S.reg.days=r.includes(v)?r.filter(x=>x!==v):DAYS.filter(d=>r.includes(d)||d===v); render(); return; }
  if(t.dataset.regsvc){ const r=S.reg.svc; const v=t.dataset.regsvc; S.reg.svc=r.includes(v)?r.filter(x=>x!==v):SERVICES.filter(d=>r.includes(d)||d===v); render(); return; }
  if(t.dataset.act){ const b=bookings.find(x=>x.id===+t.dataset.id); const ok=t.dataset.act==='accept'; b.status=ok?'확정':'거절';
    if(ok && b.unit!=='day'){ const s=sp(b.spaceId); leases.push({id:Date.now(),spaceId:b.spaceId,guest:b.guest,gType:b.gType,unit:b.unit,rent:b.unit==='year'?Math.round((b.price??pYear(s))/12):(b.price??s.month),deposit:s.deposit,ops:s.ops||0,start:b.start,months:b.qty*MONTHS[b.unit],payDay:+b.start.slice(8),thisMonth:'결제 완료',method:'가상계좌',paidAt:TODAY+' (예시)',settle:'정산 보류',settleAt:'입주 확인 후',first:true}); }
    toast(ok?(b.unit!=='day'?`${b.guest} 디자이너 입점을 확정했습니다. 월세 관리에 추가됐습니다`:`${b.guest} 디자이너 예약을 확정했습니다`):'요청을 거절하고 전액 환불했습니다'); render(); return; }
  if(t.dataset.lact){ const l=leases.find(x=>x.id===+t.dataset.id);
    if(t.dataset.lact==='remind'){ l.thisMonth='알림 발송'; toast(`${l.guest} 디자이너에게 납부 알림을 보냈습니다 (예시)`); }
    else toast(`${l.guest} 디자이너에게 계약 연장을 제안했습니다 (예시)`); render(); return; }
  if(t.dataset.vact){ const v=verifs.find(x=>x.id===+t.dataset.id); v.status=t.dataset.vact; if(v.status==='반려') v.reason='업종 불일치';
    if(v.kind==='게스트'&&v.target==='회원가입'&&v.who===ME_GUEST.name&&v.status==='승인') ME_GUEST.verified=true;
    if(v.spaceId&&v.status==='승인'){ const s=sp(v.spaceId); s.status=hasPending(s.types)?'사전 접수':'공개'; }
    toast(`${v.who} ${v.status} 처리했습니다`); render(); return; }
  if(t.dataset.more){ const i=t.dataset.more; S.more[i]=(S.more[i]||1)+1; render(); return; }
  if(t.dataset.rv){ const a=t.dataset.rv;
    if(a==='open'){ S.rv={bid:+t.dataset.id,rating:0,text:''}; reviewDialog(); return; }
    if(a==='cancel'){ $('#layer').innerHTML=''; return; }
    if(a==='star'){ S.rv.text=$('#rv-text').value; S.rv.rating=+t.dataset.n; reviewDialog(); $('#rv-text').focus(); return; }
    if(a==='submit'){ const text=$('#rv-text').value.trim(); S.rv.text=text;
      if(!S.rv.rating){ toast('별점을 선택해 주세요'); return; }
      if(text.length<10){ toast('후기를 10자 이상 입력해 주세요'); return; }
      const b=bookings.find(x=>x.id===S.rv.bid);
      if(b.status!=='완료'||reviews.some(r=>r.bid===b.id)) { $('#layer').innerHTML=''; return; }
      reviews.push({id:Date.now(),bid:b.id,spaceId:b.spaceId,guest:b.guest,rating:S.rv.rating,text,date:'2026-10-30',reply:''});
      $('#layer').innerHTML=''; render(); toast('후기가 등록되었습니다'); return; }
    if(a==='reply'){ const r=reviews.find(x=>x.id===+t.dataset.id); const v=$('#rp-'+r.id).value.trim();
      if(!v){ toast('답글을 입력해 주세요'); return; } r.reply=v; render(); toast('답글을 등록했습니다'); return; }
  }
  if(t.dataset.pay){ if(t.dataset.pay==='ok'){ const F=S.form; const id=Date.now();
      bookings.push({id,spaceId:S.sel,guest:ME_GUEST.name,gType:F.gType,unit:F.unit,qty:F.qty,start:F.start,time:F.time,contract:F.contract,status:'요청',price:unitPrice(sp(S.sel),F.unit)});
      if(sp(S.sel).host!==ME_HOST) { /* 다른 호스트 예약도 내 예약에 표시 */ }
      $('#layer').innerHTML=''; S.sel=null; S.tab.guest='mine'; render(); toast('결제 완료. 호스트 수락을 기다리는 중입니다'); }
    else $('#layer').innerHTML=''; return; }
});
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset.af && S.auth && el.type!=='file' && el.type!=='checkbox' && el.tagName!=='SELECT'){ S.auth[el.dataset.af]=el.value; }
  if(el.dataset.sim){ S.sim[el.dataset.sim]= el.type==='checkbox'?el.checked:Math.max(0,+el.value||0); const c=simCalc(); $('#sim-net').textContent=won(c.net); $('#sim-year').textContent='연 환산 '+won(c.net*12); $('#sim-sum').innerHTML=simSum(c); }
});

document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.af && S.auth && (el.type==='file'||el.type==='checkbox'||el.tagName==='SELECT')){ const k=el.dataset.af; S.auth[k]= el.type==='file'?(el.files[0]?.name||''): el.type==='checkbox'?el.checked:el.value; render(); return; }
  if(el.dataset.ag && S.auth){ const g=S.auth.agree; if(el.dataset.ag==='all'){ Object.keys(g).forEach(k=>g[k]=el.checked); } else g[el.dataset.ag]=el.checked; render(); const f=document.getElementById('ag-'+el.dataset.ag); if(f) f.focus(); return; }
  if(el.dataset.deal){ const [id,k]=el.dataset.deal.split(':'); const s=sp(+id); if(s.deal){ s.deal[k]= k==='until'?el.value:Math.max(0,+el.value||0); const lim=k==='month'?s.month:k==='day'?s.day:0; if(lim&&s.deal[k]>=lim){ s.deal[k]=0; toast('할인가는 원가보다 낮아야 합니다'); } } render(); return; }
  if(el.dataset.filter){ S.filter[el.dataset.filter]=el.value; render(); }
  if(el.dataset.form){ const k=el.dataset.form; S.form[k]= k==='qty'?Math.min(Math.max(1,+el.value||1),QTY_MAX[S.form.unit]):el.value; render(); }
  if(el.dataset.reg){ const k=el.dataset.reg; S.reg[k]= el.type==='checkbox'?el.checked: el.type==='file'?(el.files[0]?.name||''): (el.type==='number'||k==='dayHours')?Math.max(0,+el.value||0):el.value; render(); const f=document.getElementById('r-'+(k==='share'?'share':k)); if(f&&f.type!=='file') f.focus(); }
});
document.addEventListener('submit',e=>{
  e.preventDefault();
  if(e.target.id==='authform') authSubmit();
  if(e.target.id==='homesearch'){ const q=$('#home-q').value.trim(); Object.assign(S.filter,{q,type:'전체',flag:'',area:'전체'}); S.role='guest'; S.tab.guest='search'; S.sel=null; render(); scrollTo(0,0); }
  if(e.target.id==='bookform') payDialog();
  if(e.target.id==='regform'){ const r=S.reg; const id=Date.now();
    spaces.push({id,name:r.name||'새 공간',area:r.area,types:[...r.types],seats:r.seats,free:Math.min(r.free,r.seats),day:r.day,month:r.month,deposit:r.deposit,ops:r.ops,year:r.year,photos:r.photos.map(x=>x.url),open:r.open,close:r.close,acc24:r.acc24,accFrom:r.accFrom,accTo:r.accTo,dayHours:r.dayHours,code:r.code,addr:r.addr,pyeong:r.pyeong,shampoo:r.shampoo,beds:needsBed(r.types)?r.beds:0,share:r.share,days:[...r.days],svc:[...r.svc],h:300,host:ME_HOST,status:hasPending(r.types)?'사전 접수':'검수 대기',rating:'-'});
    verifs.unshift({id:id+1,spaceId:id,who:r.name||'새 공간',kind:'호스트',doc:'미용업 영업신고증'+(r.file?` (${r.file})`:''),types:[...r.types],target:'공간 등록',date:'2026-10-30',status:'대기'});
    const pre=hasPending(r.types); S.reg={...S.reg,name:'',file:'',photos:[]}; S.tab.host='dash'; render(); scrollTo(0,0); toast(pre?'사전 접수했습니다. 문신사법 시행 후 공개됩니다':'검수를 요청했습니다. 관리자 탭에서 승인해 보세요'); }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape') $('#layer').innerHTML=''; });
