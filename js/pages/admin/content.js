/* ===== 관리자: 광고바 · 공지사항 · 팝업 =====
   저장하면 바로 사이트에 반영됩니다. (DB 테이블은 supabase/admin_content.sql) */
const CM = { ad:null, notice:null, pop:null };
const LINK_PRESETS = [['', '링크 없음'], ['intro:hostcenter', '호스트센터'], ['intro:guide', '이용 안내'], ['intro:notices', '공지사항'], ['intro:faq', '자주 묻는 질문'], ['guest:search', '공간 찾기'], ['custom', '직접 입력 (https://…)']];
const linkSelOf = l => !l ? '' : LINK_PRESETS.some(p => p[0] === l) ? l : 'custom';
const linkOf = (sel, url) => sel === 'custom' ? url.trim() : sel;
const linkErr = l => l && !/^(https:\/\/|intro:|guest:)/.test(l) ? '링크는 https:// 로 시작해야 합니다' : '';
function adDraft(){
  const a = SITE.adbar || { text:'', tag:'AD', link:'', bg:'#141414', fg:'#f0f0f0', active:true, startsOn:'', endsOn:'' };
  return { ...a, linkSel:linkSelOf(a.link), linkUrl:linkSelOf(a.link) === 'custom' ? a.link : '' };
}
const periodPill = (on, s, e) => !on ? '<span class="pill p-mut">중지</span>' : TODAY < s ? '<span class="pill p-warn">예정</span>' : TODAY > e ? '<span class="pill p-mut">종료</span>' : '<span class="pill p-ok">노출 중</span>';

function adminContent(){
  if(!LIVE) return `<div class="head"><h2>콘텐츠 관리</h2></div><section class="panel empty">운영 모드에서만 사용할 수 있습니다.</section>`;
  if(!SITE.ready) return `<div class="head"><h2>콘텐츠 관리</h2></div><section class="panel empty">아직 준비되지 않았습니다.<br>Supabase SQL Editor 에서 <b>supabase/admin_content.sql</b> 을 실행한 뒤 새로고침해 주세요.</section>`;
  const ad = CM.ad || (CM.ad = adDraft()), n = CM.notice, p = CM.pop;
  return `<div class="head"><div><h2>콘텐츠 관리</h2><p class="small muted">광고바, 공지사항, 팝업을 만들고 고칩니다. 저장하면 바로 사이트에 반영됩니다.</p></div></div>
  <section class="panel stack"><h3>상단 광고바</h3>
    <div id="cm-adprev" style="border-radius:8px;padding:8px 12px;font-size:.8rem;background:${esc(ad.bg)};color:${esc(ad.fg)};opacity:${ad.active ? 1 : .45}">${ad.tag ? `<span class="ad-tag">${esc(ad.tag)}</span> ` : ''}${esc(ad.text) || '<span style="opacity:.6">문구를 입력하세요</span>'}</div>
    <div class="row"><div class="field" style="flex:3 1 260px"><label for="ad-text">문구 (120자 이내)</label><input id="ad-text" type="text" maxlength="120" value="${esc(ad.text)}" data-cm="ad:text"></div>
      <div class="field"><label for="ad-tag">라벨 (비우면 숨김)</label><input id="ad-tag" type="text" maxlength="8" value="${esc(ad.tag)}" data-cm="ad:tag"></div></div>
    <div class="row"><div class="field"><label for="ad-link">클릭 시 이동</label><select id="ad-link" data-cm="ad:linkSel">${LINK_PRESETS.map(([v, l]) => `<option value="${v}" ${ad.linkSel === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      ${ad.linkSel === 'custom' ? `<div class="field" style="flex:2 1 220px"><label for="ad-url">주소</label><input id="ad-url" type="text" value="${esc(ad.linkUrl)}" data-cm="ad:linkUrl" placeholder="https://"></div>` : ''}</div>
    <div class="row"><div class="field"><label for="ad-bg">배경색</label><input id="ad-bg" type="color" value="${esc(ad.bg)}" data-cm="ad:bg" style="width:100%;height:38px"></div>
      <div class="field"><label for="ad-fg">글자색</label><input id="ad-fg" type="color" value="${esc(ad.fg)}" data-cm="ad:fg" style="width:100%;height:38px"></div>
      <div class="field"><label for="ad-s">시작일 (비우면 바로)</label><input id="ad-s" type="date" value="${ad.startsOn}" data-cm="ad:startsOn"></div>
      <div class="field"><label for="ad-e">종료일 (비우면 계속)</label><input id="ad-e" type="date" value="${ad.endsOn}" data-cm="ad:endsOn"></div></div>
    <label class="check"><input type="checkbox" ${ad.active ? 'checked' : ''} data-cm="ad:active"> 광고바 표시</label>
    <div><button class="btn pri" data-cmact="ad-save">광고바 저장</button></div></section>

  <section class="panel stack"><h3>공지사항</h3>
  ${n ? `<div class="field"><label for="nt-title">제목 (100자 이내)</label><input id="nt-title" type="text" maxlength="100" value="${esc(n.title)}" data-cm="notice:title"></div>
    <div class="field"><label for="nt-body">내용</label><textarea id="nt-body" rows="6" maxlength="5000" data-cm="notice:body">${esc(n.body)}</textarea></div>
    <div class="row" style="gap:16px"><label class="check"><input type="checkbox" ${n.pinned ? 'checked' : ''} data-cm="notice:pinned"> 목록 맨 위에 고정</label><label class="check"><input type="checkbox" ${n.published ? 'checked' : ''} data-cm="notice:published"> 공개</label></div>
    <div class="row"><button class="btn" data-cmact="notice-cancel">취소</button><button class="btn pri" data-cmact="notice-save">${n.id ? '수정 저장' : '공지 등록'}</button></div>`
  : `<div><button class="btn pri" data-cmact="notice-new">새 공지 작성</button></div>`}
  <div class="tbl-wrap"><table><thead><tr><th>제목</th><th>등록일</th><th>상태</th><th class="r">관리</th></tr></thead><tbody>
  ${SITE.notices.length ? SITE.notices.map(x => `<tr><td>${x.pinned ? '<span class="pill p-acc">고정</span> ' : ''}${esc(x.title)}</td><td class="num">${x.date}</td><td>${x.published ? '<span class="pill p-ok">공개</span>' : '<span class="pill p-mut">비공개</span>'}</td>
    <td class="r" style="white-space:nowrap"><button class="btn sm" data-cmact="notice-edit" data-id="${x.id}">수정</button> <button class="btn sm" data-cmact="notice-del" data-id="${x.id}">삭제</button></td></tr>`).join('')
  : '<tr><td colspan="4" class="muted" style="text-align:center;padding:20px">등록된 공지가 없습니다</td></tr>'}
  </tbody></table></div></section>

  <section class="panel stack"><h3>팝업</h3>
  <p class="small muted">사이트에 들어오면 한 번 뜹니다. 방문자는 "오늘 하루 안 보기"로 끌 수 있습니다. 기간이 겹치면 가장 최근에 만든 팝업 하나만 보입니다.</p>
  ${p ? `<div class="field"><label for="pp-title">제목 (60자 이내)</label><input id="pp-title" type="text" maxlength="60" value="${esc(p.title)}" data-cm="pop:title"></div>
    <div class="field"><label for="pp-body">내용 (500자 이내)</label><textarea id="pp-body" rows="4" maxlength="500" data-cm="pop:body">${esc(p.body)}</textarea></div>
    <div class="field"><label for="pp-img">이미지 (선택, 2MB 이하)</label><input id="pp-img" type="file" accept="image/jpeg,image/png,image/webp" data-cm="pop:file">
      ${p.image ? `<div class="row" style="align-items:center"><img src="${esc(p.image)}" alt="" style="max-width:160px;max-height:100px;border-radius:8px"><button class="btn sm" data-cmact="pop-noimg" style="flex:0 0 auto">이미지 빼기</button></div>` : ''}</div>
    <div class="row"><div class="field"><label for="pp-link">버튼 클릭 시 이동</label><select id="pp-link" data-cm="pop:linkSel">${LINK_PRESETS.map(([v, l]) => `<option value="${v}" ${p.linkSel === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      ${p.linkSel === 'custom' ? `<div class="field" style="flex:2 1 220px"><label for="pp-url">주소</label><input id="pp-url" type="text" value="${esc(p.linkUrl)}" data-cm="pop:linkUrl" placeholder="https://"></div>` : ''}
      ${p.linkSel ? `<div class="field"><label for="pp-lbl">버튼 글자 (12자 이내)</label><input id="pp-lbl" type="text" maxlength="12" value="${esc(p.linkLabel)}" data-cm="pop:linkLabel"></div>` : ''}</div>
    <div class="row"><div class="field"><label for="pp-s">시작일</label><input id="pp-s" type="date" value="${p.startsOn}" data-cm="pop:startsOn"></div>
      <div class="field"><label for="pp-e">종료일 (이 날까지)</label><input id="pp-e" type="date" value="${p.endsOn}" data-cm="pop:endsOn"></div></div>
    <label class="check"><input type="checkbox" ${p.active ? 'checked' : ''} data-cm="pop:active"> 사용</label>
    <div class="row"><button class="btn" data-cmact="pop-cancel">취소</button><button class="btn" data-cmact="pop-prev">미리보기</button><button class="btn pri" data-cmact="pop-save">${p.id ? '수정 저장' : '팝업 등록'}</button></div>`
  : `<div><button class="btn pri" data-cmact="pop-new">새 팝업 만들기</button></div>`}
  <div class="tbl-wrap"><table><thead><tr><th>제목</th><th>기간</th><th>상태</th><th class="r">관리</th></tr></thead><tbody>
  ${SITE.popups.length ? SITE.popups.map(x => `<tr><td>${esc(x.title)}</td><td class="num" style="white-space:nowrap">${x.startsOn} ~ ${x.endsOn}</td><td>${periodPill(x.active, x.startsOn, x.endsOn)}</td>
    <td class="r" style="white-space:nowrap"><button class="btn sm" data-cmact="pop-edit" data-id="${x.id}">수정</button> <button class="btn sm" data-cmact="pop-del" data-id="${x.id}">삭제</button></td></tr>`).join('')
  : '<tr><td colspan="4" class="muted" style="text-align:center;padding:20px">등록된 팝업이 없습니다</td></tr>'}
  </tbody></table></div></section>`;
}

/* ----- 입력: 다시 그리지 않고 값만 기억합니다 (선택 목록만 화면을 다시 그림) ----- */
function cmInput(e){
  const el = e.target, key = el.dataset && el.dataset.cm; if(!key) return;
  const [grp, f] = key.split(':'), o = CM[grp]; if(!o || f === 'file') return;
  o[f] = el.type === 'checkbox' ? el.checked : el.value;
  if(grp === 'ad' && e.type === 'input'){ const v = $('#cm-adprev'); if(v){ v.style.background = o.bg; v.style.color = o.fg; } }
  if(f === 'linkSel' && e.type === 'change') render();
  if(grp === 'ad' && f === 'active') render();
}
document.addEventListener('input', cmInput);
document.addEventListener('change', async e => {
  cmInput(e);
  const el = e.target; if(!(el.dataset && el.dataset.cm === 'pop:file') || !el.files[0]) return;
  const f = el.files[0];
  if(f.size > 2 * 1024 * 1024){ el.value = ''; return toast('이미지는 2MB 이하만 올릴 수 있습니다'); }
  try{
    const path = `popups/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${(f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const { error } = await sb.storage.from('site').upload(path, f, { contentType:f.type });
    if(error) throw error;
    CM.pop.image = sb.storage.from('site').getPublicUrl(path).data.publicUrl; render(); toast('이미지를 올렸습니다');
  }catch(err){ dbErr(err); }
});

async function cmSave(table, row, id){
  const { error } = await (id ? sb.from(table).update(row).eq('id', id) : sb.from(table).insert(row));
  if(error) throw error;
}
document.addEventListener('click', async e => {
  const t = e.target.closest('button[data-cmact]'); if(!t) return;
  const a = t.dataset.cmact, id = +t.dataset.id;
  try{
    if(a === 'ad-save'){ const d = CM.ad, link = linkOf(d.linkSel, d.linkUrl || '');
      if(!d.text.trim()) return toast('문구를 입력해 주세요');
      if(linkErr(link)) return toast(linkErr(link));
      if(d.startsOn && d.endsOn && d.endsOn < d.startsOn) return toast('종료일은 시작일 이후여야 합니다');
      const { error } = await sb.from('adbar').upsert({ id:1, text:d.text.trim(), tag:d.tag.trim(), link, bg:d.bg, fg:d.fg, active:d.active,
        starts_on:d.startsOn || null, ends_on:d.endsOn || null, updated_at:new Date().toISOString() });
      if(error) throw error;
      await loadSite(); CM.ad = null; render(); toast('광고바를 저장했습니다'); return; }

    if(a === 'notice-new'){ CM.notice = { id:null, title:'', body:'', pinned:false, published:true }; render(); return; }
    if(a === 'notice-cancel'){ CM.notice = null; render(); return; }
    if(a === 'notice-edit'){ CM.notice = { ...SITE.notices.find(x => x.id === id) }; render(); scrollTo(0, 0); return; }
    if(a === 'notice-save'){ const n = CM.notice;
      if(!n.title.trim()) return toast('제목을 입력해 주세요');
      await cmSave('notices', { title:n.title.trim(), body:n.body.trim(), pinned:n.pinned, published:n.published }, n.id);
      CM.notice = null; await loadSite(); render(); toast('공지를 저장했습니다'); return; }
    if(a === 'notice-del'){ const n = SITE.notices.find(x => x.id === id); if(!confirm(`"${n.title}" 공지를 삭제할까요?`)) return;
      const { error } = await sb.from('notices').delete().eq('id', id); if(error) throw error; await loadSite(); render(); toast('삭제했습니다'); return; }

    if(a === 'pop-new'){ CM.pop = { id:null, title:'', body:'', image:'', linkSel:'', linkUrl:'', linkLabel:'자세히 보기', startsOn:TODAY, endsOn:addDays(TODAY, 14), active:true }; render(); return; }
    if(a === 'pop-cancel'){ CM.pop = null; render(); return; }
    if(a === 'pop-noimg'){ CM.pop.image = ''; render(); return; }
    if(a === 'pop-edit'){ const x = SITE.popups.find(y => y.id === id); CM.pop = { ...x, linkSel:linkSelOf(x.link), linkUrl:linkSelOf(x.link) === 'custom' ? x.link : '' }; render(); scrollTo(0, 0); return; }
    if(a === 'pop-prev'){ const p = CM.pop, link = linkOf(p.linkSel, p.linkUrl || '');
      $('#layer').innerHTML = `<div class="ovl" role="dialog" aria-modal="true"><div class="dlg">${p.image ? `<img src="${esc(p.image)}" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:10px">` : ''}<h3>${esc(p.title) || '(제목 없음)'}</h3>${p.body ? `<p class="small" style="white-space:pre-wrap;margin:0">${esc(p.body)}</p>` : ''}<div class="row">${link ? `<button class="btn pri" data-pop="close">${esc(p.linkLabel || '자세히 보기')}</button>` : ''}<button class="btn" data-pop="close">닫기</button></div><p class="small muted">미리보기입니다</p></div></div>`; return; }
    if(a === 'pop-save'){ const p = CM.pop, link = linkOf(p.linkSel, p.linkUrl || '');
      if(!p.title.trim()) return toast('제목을 입력해 주세요');
      if(linkErr(link)) return toast(linkErr(link));
      if(!p.startsOn || !p.endsOn || p.endsOn < p.startsOn) return toast('종료일은 시작일과 같거나 이후여야 합니다');
      await cmSave('popups', { title:p.title.trim(), body:p.body.trim(), image:p.image, link, link_label:(p.linkLabel || '자세히 보기').trim(), starts_on:p.startsOn, ends_on:p.endsOn, active:p.active }, p.id);
      CM.pop = null; await loadSite(); render(); toast('팝업을 저장했습니다'); return; }
    if(a === 'pop-del'){ const p = SITE.popups.find(x => x.id === id); if(!confirm(`"${p.title}" 팝업을 삭제할까요?`)) return;
      const { error } = await sb.from('popups').delete().eq('id', id); if(error) throw error; await loadSite(); render(); toast('삭제했습니다'); return; }
  }catch(err){ dbErr(err); }
});

/* 화면 등록 */
PAGES.admin.content=()=>adminContent();
