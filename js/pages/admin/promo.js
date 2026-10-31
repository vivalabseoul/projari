/* ===== 관리자: 수수료율 · 프로모션 =====
   요율은 서버(supabase/admin_content.sql)가 정합니다. 이 화면은 설정을 바꾸고, 지금 적용되는 요율을 미리 보여 줍니다.
   - 예약이 만들어지는 순간의 요율이 그 예약에 고정됩니다. 여기서 바꿔도 이미 만들어진 예약·월 계약은 바뀌지 않습니다.
   - 진행 중인 프로모션이 겹치면 가장 낮은 요율 하나만 적용합니다. (합산하지 않음) */
const PR = { d:null };
const pc = r => (Math.round(r*1000)/10) + '%';
const KST = iso => new Date(iso).toLocaleString('ko-KR', { timeZone:'Asia/Seoul', hour12:false, month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
const PR_UNITS = [['day','일 단위'],['month','월 단위'],['year','년 단위']];
const promoState = p => !p.active ? '중지' : TODAY < p.startsOn ? '예정' : TODAY > p.endsOn ? '종료' : '진행 중';
const promoPill = st => ({'진행 중':'p-ok','예정':'p-warn','종료':'p-mut','중지':'p-mut'})[st];
const newPromo = () => ({ id:null, name:'', pct:'', startsOn:TODAY, endsOn:addDays(TODAY, 30), units:['day','month','year'], target:'all', newDays:90, memo:'' });
/* 서버 fee_for() 와 같은 규칙으로 계산한 '오늘 기준' 미리보기 */
function feeNow(unit, newHost){
  const c = FEE.promos.filter(p => p.active && TODAY >= p.startsOn && TODAY <= p.endsOn && p.units.includes(unit) && (p.target === 'all' || (p.target === 'new_host' && newHost)))
    .sort((a, b) => a.rate - b.rate || b.id - a.id)[0];
  return c ? { rate:c.rate, name:c.name } : { rate:FEE.base, name:'' };
}
function logSummary(x){
  const a = x.after || {}, b = x.before || {}, act = { INSERT:'추가', UPDATE:'수정', DELETE:'삭제' }[x.action] || x.action;
  if(x.target === 'fee_config') return `기본 수수료율 ${pc(+b.rate)} → ${pc(+a.rate)}`;
  if(x.target === 'promotions'){ const r = x.action === 'DELETE' ? b : a; return `프로모션 ${act}: ${esc(r.name)} (${pc(+r.rate)}, ${day10(r.starts_on)} ~ ${day10(r.ends_on)}${x.action === 'UPDATE' && b.active !== a.active ? (a.active ? ', 재개' : ', 중지') : ''})`; }
  if(x.target === 'adbar') return `광고바 ${act}`;
  if(x.target === 'notices') return `공지사항 ${act}: ${esc((x.action === 'DELETE' ? b : a).title)}`;
  if(x.target === 'popups') return `팝업 ${act}: ${esc((x.action === 'DELETE' ? b : a).title)}`;
  return esc(x.target + ' ' + act);
}
function adminPromo(){
  if(!LIVE) return `<div class="head"><h2>수수료율 · 프로모션</h2></div><section class="panel empty">운영 모드에서만 사용할 수 있습니다.</section>`;
  if(!FEE.ready) return `<div class="head"><h2>수수료율 · 프로모션</h2></div><section class="panel empty">아직 준비되지 않았습니다.<br>Supabase SQL Editor 에서 <b>supabase/admin_content.sql</b> 을 실행한 뒤 새로고침해 주세요.</section>`;
  const d = PR.d;
  const rows = PR_UNITS.map(([u, l]) => { const g = feeNow(u, false), n = feeNow(u, true);
    return `<tr><td>${l}</td><td class="r"><b>${pc(g.rate)}</b>${g.name ? `<br><span class="small muted">${esc(g.name)}</span>` : ''}</td><td class="r"><b>${pc(n.rate)}</b>${n.name ? `<br><span class="small muted">${esc(n.name)}</span>` : ''}</td></tr>`; }).join('');
  return `<div class="head"><div><h2>수수료율 · 프로모션</h2><p class="small muted">예약이 만들어지는 순간의 요율이 그 예약에 고정됩니다. 여기서 바꿔도 이미 만들어진 예약과 월 계약은 바뀌지 않습니다.</p></div></div>
  <div class="grid2">
    <section class="panel stack"><h3>기본 수수료율</h3>
      <p class="small muted">진행 중인 프로모션이 없을 때 적용됩니다. 화면에는 공개하지 않습니다.</p>
      <div class="row" style="align-items:end"><div class="field"><label for="pr-base">기본 수수료율 (%)</label><input id="pr-base" type="number" min="0" max="100" step="0.1" value="${(FEE.base*100).toFixed(1).replace(/\.0$/, '')}"></div>
      <div style="flex:0 0 auto"><button class="btn pri" data-pr="base">변경</button></div></div>
      <p class="note">현재 ${pc(FEE.base)}. 변경하면 그 시점 이후에 만들어지는 예약부터 적용됩니다.</p></section>
    <section class="panel stack num"><h3>오늘 적용되는 요율</h3>
      <div class="tbl-wrap"><table><thead><tr><th>이용 단위</th><th class="r">일반 원장님</th><th class="r">신규 원장님</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="note">프로모션이 겹치면 가장 낮은 요율 하나만 적용합니다. 신규 원장님은 "가입 후 N일 이내" 조건이 있는 프로모션 대상입니다.</p></section>
  </div>
  <section class="panel stack"><h3>${d ? (d.id ? '프로모션 수정' : '새 프로모션') : '프로모션'}</h3>
  ${d ? `<div class="row"><div class="field"><label for="prf-name">프로모션 이름</label><input id="prf-name" type="text" maxlength="60" value="${esc(d.name)}" data-prf="name" placeholder="예: 11월 신규 입점 이벤트"></div>
    <div class="field"><label for="prf-pct">적용 수수료율 (%)</label><input id="prf-pct" type="number" min="0" max="100" step="0.1" value="${esc(d.pct)}" data-prf="pct" placeholder="예: 10"></div></div>
    <div class="row"><div class="field"><label for="prf-s">시작일</label><input id="prf-s" type="date" value="${d.startsOn}" data-prf="startsOn"></div>
    <div class="field"><label for="prf-e">종료일 (이 날까지 적용)</label><input id="prf-e" type="date" value="${d.endsOn}" data-prf="endsOn"></div></div>
    <div class="field"><span class="lbl">적용 이용 단위</span><div class="row" style="gap:16px">${PR_UNITS.map(([u, l]) => `<label class="check"><input type="checkbox" data-prf="unit" data-u="${u}" ${d.units.includes(u) ? 'checked' : ''}> ${l}</label>`).join('')}</div></div>
    <div class="row"><div class="field"><label for="prf-t">대상</label><select id="prf-t" data-prf="target"><option value="all" ${d.target === 'all' ? 'selected' : ''}>모든 원장님</option><option value="new_host" ${d.target === 'new_host' ? 'selected' : ''}>신규 원장님만 (가입 후 N일 이내)</option></select></div>
    ${d.target === 'new_host' ? `<div class="field"><label for="prf-n">가입 후 며칠 이내</label><input id="prf-n" type="number" min="1" max="3650" step="1" value="${d.newDays}" data-prf="newDays"></div>` : ''}</div>
    <div class="field"><label for="prf-m">내부 메모 (원장님에게 보이지 않음)</label><input id="prf-m" type="text" maxlength="200" value="${esc(d.memo)}" data-prf="memo"></div>
    <div class="row"><button class="btn" data-pr="cancel">취소</button><button class="btn pri" data-pr="save">${d.id ? '수정 저장' : '프로모션 등록'}</button></div>`
  : `<div><button class="btn pri" data-pr="new">새 프로모션 만들기</button></div>`}
  <div class="tbl-wrap"><table class="num"><thead><tr><th>이름</th><th class="r">수수료율</th><th>기간</th><th>단위</th><th>대상</th><th>상태</th><th class="r">관리</th></tr></thead><tbody>
  ${FEE.promos.length ? FEE.promos.map(p => { const st = promoState(p); return `<tr><td>${esc(p.name)}${p.memo ? `<br><span class="small muted">${esc(p.memo)}</span>` : ''}</td><td class="r"><b>${pc(p.rate)}</b></td><td style="white-space:nowrap">${p.startsOn} ~ ${p.endsOn}</td>
    <td>${p.units.map(u => ({ day:'일', month:'월', year:'년' })[u]).join('·')}</td><td>${p.target === 'all' ? '모든 원장님' : `신규 (가입 ${p.newDays}일 이내)`}</td>
    <td><span class="pill ${promoPill(st)}">${st}</span></td>
    <td class="r" style="white-space:nowrap"><button class="btn sm" data-pr="edit" data-id="${p.id}">수정</button> <button class="btn sm" data-pr="toggle" data-id="${p.id}">${p.active ? '중지' : '재개'}</button> <button class="btn sm" data-pr="del" data-id="${p.id}">삭제</button></td></tr>`; }).join('')
  : '<tr><td colspan="7" class="muted" style="text-align:center;padding:20px">등록된 프로모션이 없습니다</td></tr>'}
  </tbody></table></div>
  <p class="note">중지하거나 삭제해도 이미 적용된 예약의 요율은 그대로 유지됩니다. 종료일이 지난 프로모션은 자동으로 적용이 끝납니다.</p></section>
  <section class="panel stack"><h3>변경 이력</h3><div class="tbl-wrap"><table><thead><tr><th>일시</th><th>관리자</th><th>내용</th></tr></thead><tbody>
  ${FEE.log.length ? FEE.log.map(x => `<tr><td style="white-space:nowrap">${KST(x.at)}</td><td>${esc(x.admin_name || '-')}</td><td>${logSummary(x)}</td></tr>`).join('') : '<tr><td colspan="3" class="muted" style="text-align:center;padding:20px">변경 이력이 없습니다</td></tr>'}
  </tbody></table></div></section>`;
}

/* ----- 입력·저장 ----- */
document.addEventListener('input', e => {
  const el = e.target, k = el.dataset && el.dataset.prf; if(!k || !PR.d) return;
  if(k === 'unit'){ const u = el.dataset.u, a = PR.d.units; PR.d.units = el.checked ? PR_UNITS.map(x => x[0]).filter(x => a.includes(x) || x === u) : a.filter(x => x !== u); }
  else if(k === 'newDays') PR.d.newDays = +el.value;
  else PR.d[k] = el.value;
  if(k === 'target') render();
});
async function savePromo(){
  const d = PR.d, rate = Math.round(parseFloat(d.pct) * 10) / 1000;
  if(!d.name.trim()) return toast('프로모션 이름을 입력해 주세요');
  if(d.pct === '' || !isFinite(rate) || rate < 0 || rate > 1) return toast('수수료율은 0~100% 사이로 입력해 주세요');
  if(!d.startsOn || !d.endsOn || d.endsOn < d.startsOn) return toast('종료일은 시작일과 같거나 이후여야 합니다');
  if(!d.units.length) return toast('적용할 이용 단위를 하나 이상 선택해 주세요');
  if(d.target === 'new_host' && !(d.newDays >= 1 && d.newDays <= 3650)) return toast('가입 후 일수는 1~3650 사이로 입력해 주세요');
  if(rate > FEE.base && !confirm(`프로모션 요율(${pc(rate)})이 기본 요율(${pc(FEE.base)})보다 높습니다. 그래도 저장할까요?`)) return;
  if(rate === 0 && !confirm('수수료율 0%입니다. 이 기간에는 수수료를 받지 않습니다. 저장할까요?')) return;
  const row = { name:d.name.trim(), rate, starts_on:d.startsOn, ends_on:d.endsOn, units:d.units, target:d.target, new_days:d.target === 'new_host' ? d.newDays : 90, memo:d.memo.trim() };
  const q = d.id ? sb.from('promotions').update(row).eq('id', d.id) : sb.from('promotions').insert(row);
  const { error } = await q; if(error) return dbErr(error);
  PR.d = null; await loadFee(); render(); toast('저장했습니다. 이후 생성되는 예약부터 적용됩니다');
}
document.addEventListener('click', async e => {
  const t = e.target.closest('button[data-pr]'); if(!t) return;
  const a = t.dataset.pr, id = +t.dataset.id, p = FEE.promos.find(x => x.id === id);
  try{
    if(a === 'new'){ PR.d = newPromo(); render(); return; }
    if(a === 'cancel'){ PR.d = null; render(); return; }
    if(a === 'edit'){ PR.d = { id:p.id, name:p.name, pct:String(Math.round(p.rate*1000)/10), startsOn:p.startsOn, endsOn:p.endsOn, units:[...p.units], target:p.target, newDays:p.newDays, memo:p.memo }; render(); scrollTo(0, 0); return; }
    if(a === 'save'){ await savePromo(); return; }
    if(a === 'toggle'){ const { error } = await sb.from('promotions').update({ active:!p.active }).eq('id', id); if(error) throw error; await loadFee(); render(); toast(p.active ? '중지했습니다. 이후 예약에는 적용되지 않습니다' : '재개했습니다'); return; }
    if(a === 'del'){ if(!confirm(`"${p.name}" 프로모션을 삭제할까요?\n이미 적용된 예약의 요율은 그대로 유지됩니다.`)) return;
      const { error } = await sb.from('promotions').delete().eq('id', id); if(error) throw error; await loadFee(); render(); toast('삭제했습니다'); return; }
    if(a === 'base'){ const v = parseFloat($('#pr-base').value), rate = Math.round(v * 10) / 1000;
      if(!isFinite(rate) || rate < 0 || rate > 1) return toast('수수료율은 0~100% 사이로 입력해 주세요');
      if(rate === FEE.base) return toast('현재와 같은 값입니다');
      if(!confirm(`기본 수수료율을 ${pc(FEE.base)} → ${pc(rate)}로 바꿉니다.\n지금부터 생성되는 예약에 적용되고, 이미 만들어진 예약은 바뀌지 않습니다.`)) return;
      const { error } = await sb.from('fee_config').update({ rate, updated_at:new Date().toISOString(), updated_by:S.user.id }).eq('id', 1); if(error) throw error;
      await loadFee(); render(); toast('기본 수수료율을 바꿨습니다'); return; }
  }catch(err){ dbErr(err); }
});

/* 화면 등록 */
PAGES.admin.promo=()=>adminPromo();
