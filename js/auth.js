/* ===== 회원가입 · 로그인 (프로토타입: 실제 인증·저장 없음, 비밀번호 받지 않음) ===== */
const ACCOUNTS = [
  {phone:'01011112222', name:'결 헤어 원장', type:'host'},
  {phone:'01033334444', name:'김지원', type:'guest'}
];
const digits = s => String(s||'').replace(/\D/g,'');
const phoneOk = s => /^01\d{8,9}$/.test(digits(s));
/* 국가기술자격 종목 → 플랫폼 업종 매핑 */
const QUALS = [
  {k:'일반',label:'미용사(일반)',type:'헤어'},
  {k:'피부',label:'미용사(피부)',type:'피부'},
  {k:'네일',label:'미용사(네일)',type:'네일'},
  {k:'메이크업',label:'미용사(메이크업)',type:'메이크업',also:['속눈썹']}
];
const qualTypes = qs => [...new Set(QUALS.filter(q=>qs.includes(q.k)).flatMap(q=>[q.type,...(q.also||[])]))];
const qualLabels = qs => QUALS.filter(q=>qs.includes(q.k)).map(q=>q.label);
function newAuth(mode,type){ return {mode,step:mode==='signup'&&type?1:0,type:type||'',name:'',phone:'',code:'',sent:false,err:'',
  quals:['일반'],qform:'book',birth:'',qno:'',qdate:'',qpage:'',qmng:'',qfile:'',
  store:'',area:AREAS[0],types:['헤어'],own:false,file:'',agree:{tos:false,priv:false,efin:false,mkt:false}}; }
function qualStep(A){ return `<div><h2>국가자격 인증</h2><p class="small muted">원장님과 디자이너 모두 미용사 국가기술자격증이 있어야 가입할 수 있습니다. 입력한 정보는 큐넷(한국산업인력공단) 진위확인으로 대조합니다.</p></div>
  <div class="field"><span class="lbl">보유 자격 종목</span><div class="chips">${QUALS.map(q=>`<button type="button" class="chip" data-aq="${q.k}" aria-pressed="${A.quals.includes(q.k)}">${q.label}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">자격증 형태</span><div class="seg"><button type="button" data-aqf="book" aria-pressed="${A.qform==='book'}">수첩형</button><button type="button" data-aqf="cert" aria-pressed="${A.qform==='cert'}">상장형</button></div></div>
  ${A.qform==='book'?`<div class="row">
      <div class="field"><label for="a-birth">생년월일 8자리</label><input id="a-birth" type="text" inputmode="numeric" maxlength="8" placeholder="19940512" value="${esc(A.birth)}" data-af="birth"></div>
      <div class="field"><label for="a-qno">자격증 번호</label><input id="a-qno" type="text" value="${esc(A.qno)}" data-af="qno"></div>
    </div><div class="row">
      <div class="field"><label for="a-qdate">발급일</label><input id="a-qdate" type="date" value="${esc(A.qdate)}" data-af="qdate"></div>
      <div class="field"><label for="a-qpage">자격증 내지번호</label><input id="a-qpage" type="text" value="${esc(A.qpage)}" data-af="qpage"></div>
    </div><span class="small muted">수첩형은 기간 제한 없이 진위확인이 가능합니다.</span>`
  :`<div class="field"><label for="a-qmng">자격증 관리번호</label><input id="a-qmng" type="text" value="${esc(A.qmng)}" data-af="qmng"></div>
    <span class="small" style="color:var(--warn)">상장형은 발급일로부터 90일 동안만 온라인 진위확인이 됩니다. 기간이 지났다면 수첩형 정보나 자격증 사본으로 확인합니다.</span>`}
  <div class="field"><label for="a-qfile">자격증 사본 (선택)</label><input id="a-qfile" type="file" accept="image/*,.pdf" data-af="qfile"><span class="small muted">${A.qfile?esc(A.qfile)+' 선택됨':'프로토타입에서는 저장되지 않습니다.'}</span></div>
  <p class="note">이름은 본인 확인 단계의 실명(${esc(A.name||'미입력')})과 대조합니다. 확인이 끝날 때까지 공간 공개·예약이 제한됩니다.</p>`; }
function codeBlock(A){ return `
  <div class="field"><label for="a-phone">휴대폰 번호</label>
    <div class="row" style="gap:8px"><input id="a-phone" type="text" inputmode="numeric" autocomplete="tel" placeholder="010-0000-0000" value="${esc(A.phone)}" data-af="phone"><button type="button" class="btn" style="flex:0 0 auto" data-auth="send">${A.sent?'다시 받기':'인증번호 받기'}</button></div></div>
  ${A.sent?`<div class="field"><label for="a-code">인증번호 6자리</label><input id="a-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${esc(A.code)}" data-af="code"><span class="small muted">프로토타입: 인증번호는 ${DEMO_CODE} 입니다.</span></div>`:''}`; }
function authView(){
  const A=S.auth;
  if(A.mode==='login') return `<form class="auth panel" id="authform" novalidate>
    <div><h2>로그인</h2><p class="small muted">가입한 휴대폰 번호로 인증하면 바로 로그인됩니다.</p></div>
    ${codeBlock(A)}
    ${A.err?`<p class="err" role="alert">${esc(A.err)}</p>`:''}
    <button class="btn pri" type="submit">로그인</button>
    <button class="btn kakao" type="button" data-auth="kakao">카카오로 시작하기</button>
    <div class="sep"></div>
    <div class="stack" style="gap:8px"><span class="lbl">시연 계정으로 바로 보기</span><div class="row" style="gap:8px"><button type="button" class="btn sm" data-demo="01011112222">원장님 계정</button><button type="button" class="btn sm" data-demo="01033334444">디자이너 계정</button></div></div>
    <p class="small muted">아직 회원이 아니신가요? <button type="button" class="btn ghost sm" style="padding:0;text-decoration:underline" data-auth="signup">회원가입</button></p>
    <button type="button" class="btn ghost sm" data-auth="cancel">← 돌아가기</button>
  </form>`;
  const total=5, st=A.step;
  const bar=`<div class="stepper" aria-label="가입 단계 ${Math.min(st+1,total)}/${total}">${Array.from({length:total},(_,i)=>`<span class="${i<=st?'on':''}"></span>`).join('')}</div>`;
  const nav=(next)=>`${A.err?`<p class="err" role="alert">${esc(A.err)}</p>`:''}<div class="row" style="gap:8px">${st>0?'<button type="button" class="btn" style="flex:0 0 auto" data-auth="back">이전</button>':''}<button class="btn pri" type="submit">${next}</button></div>`;
  let body='';
  if(st===0) body=`<div><h2>어떤 회원으로 가입하시나요?</h2></div>
    <div class="pick"><button type="button" data-ap="host" aria-pressed="${A.type==='host'}"><b>원장님</b><span class="small muted">매장 의자를 빌려줘요</span></button><button type="button" data-ap="guest" aria-pressed="${A.type==='guest'}"><b>디자이너</b><span class="small muted">매장 자리를 빌려요</span></button></div>${nav('다음')}`;
  if(st===1) body=`<div><h2>본인 확인</h2><p class="small muted">계약과 정산에 쓰이므로 실명으로 입력해 주세요.</p></div>
    <div class="field"><label for="a-name">이름</label><input id="a-name" type="text" autocomplete="name" value="${esc(A.name)}" data-af="name"></div>
    ${codeBlock(A)}${nav('다음')}`;
  if(st===2) body = qualStep(A) + nav('다음');
  if(st===3) body = A.type==='host' ? `<div><h2>매장 정보</h2><p class="small muted">영업신고증은 관리자 검수 후 공간 공개에 쓰입니다.</p></div>
    <div class="field"><label for="a-store">매장 이름</label><input id="a-store" type="text" value="${esc(A.store)}" data-af="store"></div>
    <div class="field"><label for="a-area">지역</label><select id="a-area" data-af="area">${AREAS.map(a=>`<option ${a===A.area?'selected':''}>${a}</option>`).join('')}</select></div>
    <div class="field"><span class="lbl">영업신고 업종</span><div class="chips">${TYPES.map(t=>`<button type="button" class="chip" data-alic="types" data-v="${t}" aria-pressed="${A.types.includes(t)}">${t}</button>`).join('')}</div>
      <span class="small muted">보유 자격: ${qualLabels(A.quals).join(', ')||'없음'} → 신고 업종은 보유 자격 범위 안이어야 합니다.</span></div>
    <div class="field"><label for="a-file">미용업 영업신고증</label><input id="a-file" type="file" accept="image/*,.pdf" data-af="file"><span class="small muted">${A.file?esc(A.file)+' 선택됨':'나중에 올려도 됩니다. 프로토타입에서는 저장되지 않습니다.'}</span></div>${nav('다음')}`
  : `<div><h2>활동 정보</h2><p class="small muted">시술 가능한 업종은 보유 자격으로 정해집니다.</p></div>
    <div class="field"><span class="lbl">시술 가능 업종</span><div class="chips">${qualTypes(A.quals).map(t=>`<span class="pill p-acc">${t}</span>`).join('')}</div></div>
    <label class="check"><input id="a-own" type="checkbox" ${A.own?'checked':''} data-af="own"> 본인 명의 미용업 영업신고를 했어요 (각자 영업신고 매장 이용 시 필요)</label>
    ${A.own?`<div class="field"><label for="a-file">본인 영업신고증</label><input id="a-file" type="file" accept="image/*,.pdf" data-af="file"><span class="small muted">${A.file?esc(A.file)+' 선택됨':'프로토타입에서는 저장되지 않습니다.'}</span></div>`:''}${nav('다음')}`;
  if(st===4){ const g=A.agree, all=g.tos&&g.priv&&g.efin&&g.mkt;
    body=`<div><h2>약관 동의</h2></div>
    <label class="check" style="font-weight:700;font-size:.95rem"><input id="ag-all" type="checkbox" ${all?'checked':''} data-ag="all"> 전체 동의</label>
    <div class="sep"></div>
    <label class="check"><input id="ag-tos" type="checkbox" ${g.tos?'checked':''} data-ag="tos"> [필수] 서비스 이용약관</label>
    <label class="check"><input id="ag-priv" type="checkbox" ${g.priv?'checked':''} data-ag="priv"> [필수] 개인정보 수집·이용</label>
    <label class="check"><input id="ag-efin" type="checkbox" ${g.efin?'checked':''} data-ag="efin"> [필수] 전자금융거래 이용약관</label>
    <label class="check"><input id="ag-mkt" type="checkbox" ${g.mkt?'checked':''} data-ag="mkt"> [선택] 혜택·이벤트 알림 수신</label>
    <p class="small muted">약관 본문은 정식 버전에서 법률 검토 후 연결합니다.</p>${nav('가입 완료')}`; }
  if(st===5) body=`<div class="stack" style="gap:8px"><span class="pill p-ok" style="justify-self:start">가입 완료</span><h2>${esc(A.name)}님, 환영합니다</h2>
    <p class="muted">국가자격 진위확인${A.type==='host'?'과 영업신고증 검수가':'이'} 끝나면 ${A.type==='host'?'공간이 공개됩니다. 지금 공간을 등록해 두세요.':'예약할 수 있습니다. 먼저 공간을 둘러보세요.'}</p>
    <div class="sum small"><div><span>제출 자격</span><span>${qualLabels(A.quals).join(', ')}</span></div><div><span>진위확인 상태</span><span class="pill p-warn">검수 대기</span></div></div></div>
    <button type="button" class="btn pri" data-auth="start">${A.type==='host'?'공간 등록하러 가기':'공간 둘러보기'}</button>`;
  return `<form class="auth panel" id="authform" novalidate>${st<5?bar:''}${body}${st===0?'<p class="small muted">이미 회원이신가요? <button type="button" class="btn ghost sm" style="padding:0;text-decoration:underline" data-auth="login">로그인</button></p>':''}${st<5?'<button type="button" class="btn ghost sm" data-auth="cancel">← 돌아가기</button>':''}</form>`;
}
function authSubmit(){
  const A=S.auth; A.err='';
  const codeErr = () => !phoneOk(A.phone) ? '휴대폰 번호를 확인해 주세요. 예: 010-1234-5678' : !A.sent ? '인증번호 받기를 먼저 눌러 주세요.' : A.code!==DEMO_CODE ? '인증번호가 맞지 않습니다. 다시 확인해 주세요.' : '';
  if(A.mode==='login'){
    A.err = codeErr(); if(A.err) return render();
    const acc = ACCOUNTS.find(a=>a.phone===digits(A.phone));
    if(!acc){ A.err='가입되지 않은 번호입니다. 회원가입을 먼저 해주세요.'; return render(); }
    return loginAs(acc);
  }
  if(A.step===0 && !A.type) A.err='회원 유형을 골라 주세요.';
  if(A.step===1) A.err = !A.name.trim() ? '이름을 입력해 주세요.' : codeErr() || (ACCOUNTS.some(a=>a.phone===digits(A.phone)) ? '이미 가입된 번호입니다. 로그인해 주세요.' : '');
  if(A.step===2) A.err = !A.quals.length ? '보유 자격 종목을 하나 이상 골라 주세요.'
    : A.qform==='book' ? (!/^\d{8}$/.test(A.birth)?'생년월일 8자리를 숫자로 입력해 주세요. 예: 19940512':!A.qno.trim()?'자격증 번호를 입력해 주세요.':!A.qdate?'발급일을 입력해 주세요.':!A.qpage.trim()?'자격증 내지번호를 입력해 주세요.':'')
    : (!A.qmng.trim()?'자격증 관리번호를 입력해 주세요.':'');
  if(A.step===3 && A.type==='host'){ const over=A.types.filter(t=>!PENDING_TYPES.includes(t)&&!qualTypes(A.quals).includes(t));
    A.err = !A.store.trim()?'매장 이름을 입력해 주세요.':!A.types.length?'영업신고 업종을 하나 이상 골라 주세요.':over.length?`${over.join(', ')} 업종은 보유 자격에 없습니다. 해당 자격을 추가하거나 업종을 빼 주세요.`:''; }
  if(A.step===4 && !(A.agree.tos&&A.agree.priv&&A.agree.efin)) A.err='필수 약관에 모두 동의해 주세요.';
  if(A.err) return render();
  if(A.step===4){
    const qdoc = `국가기술자격 ${qualLabels(A.quals).join('·')} (${A.qform==='book'?'수첩형 · 번호 '+A.qno.trim():'상장형 · 관리번호 '+A.qmng.trim()})`;
    ACCOUNTS.push({phone:digits(A.phone),name:A.name.trim(),type:A.type});
    verifs.unshift({id:Date.now(),who:A.type==='host'?`${A.store.trim()} (${A.name.trim()})`:A.name.trim(),kind:A.type==='host'?'호스트':'게스트',
      doc: qdoc + (A.type==='host'?' · 미용업 영업신고증':(A.own?' · 본인 영업신고증':'')),
      types:A.type==='host'?[...A.types]:qualTypes(A.quals),target:'회원가입',date:'2026-10-30',status:'대기'});
    if(A.type==='guest'){ Object.assign(ME_GUEST,{name:A.name.trim(),licenses:qualTypes(A.quals),ownReport:A.own,verified:false}); }
  }
  A.step++; render();
}
function loginAs(acc){
  S.user={name:acc.name,type:acc.type}; S.auth=null; S.sel=null;
  if(acc.type==='guest' && acc.phone==='01033334444') Object.assign(ME_GUEST,{name:'김지원',licenses:['헤어','속눈썹','메이크업'],ownReport:false,verified:true});
  S.role=acc.type; S.tab[acc.type]= acc.type==='host'?'dash':'search'; render(); scrollTo(0,0); toast(`${acc.name}님, 로그인했습니다`);
}
