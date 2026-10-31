/* ===== 관리자 ===== */
function matchInfo(v){
  if(v.target==='회원가입') return {ok:true,txt:'큐넷 진위확인 대조 필요'};
  if(v.kind==='호스트') return {ok:true,txt:'신고증 업종 확인 필요'};
  const m = v.target.match(/\((.+)\)/); const allowed = m? m[1].split(', '):[]; const ok = v.types.every(t=>allowed.includes(t));
  return {ok, txt: ok?'매장 신고 업종과 일치':'매장 신고 업종에 없음'};
}
function adminVerify(){
  const tabs=['대기','승인','반려']; const list=verifs.filter(v=>v.status===S.adminTab);
  return `<div class="head"><h2>자격·신고증 인증</h2><div class="seg">${tabs.map(t=>`<button data-atab="${t}" aria-pressed="${S.adminTab===t}">${t} ${verifs.filter(v=>v.status===t).length}</button>`).join('')}</div></div>
  <section class="panel"><div class="tbl-wrap"><table><thead><tr><th>제출일</th><th>구분</th><th>이름</th><th>제출 서류</th><th>대상 매장 (신고 업종)</th><th>업종 검증</th><th class="r">처리</th></tr></thead><tbody>
  ${list.length?list.map(v=>{const m=matchInfo(v);return `<tr><td class="num">${v.date}</td><td><span class="pill p-mut">${v.kind}</span></td><td>${esc(v.who)}</td><td>${esc(v.doc)}</td><td>${esc(v.target)}</td><td><span class="pill ${m.ok?'p-ok':'p-bad'}">${m.txt}</span></td><td class="r" style="white-space:nowrap">${v.files&&v.files.length?`<button class="btn sm" data-vdoc="${v.id}">서류 보기</button> `:''}${v.status==='대기'?`<button class="btn sm" data-vact="반려" data-id="${v.id}">반려</button> <button class="btn pri sm" data-vact="승인" data-id="${v.id}">승인</button>`:`<span class="pill ${statusPill(v.status)}">${v.status}${v.reason?' · '+esc(v.reason):''}</span>`}</td></tr>`}).join(''):`<tr><td colspan="7" class="empty">${S.adminTab} 항목이 없습니다.</td></tr>`}
  </tbody></table></div></section>
  <p class="note">업종 검증 규칙: 게스트가 시술할 업종이 호스트의 영업신고 업종에 포함되어야 합니다. 각자 영업신고 게스트는 본인 신고증도 함께 확인합니다. 반영구·SMP는 문신사 면허 확인이 필요하며, 법 시행 전에는 승인해도 사전 접수 상태로 유지됩니다.</p>`;
}

/* 화면 등록 */
PAGES.admin.verify=()=>adminVerify();
