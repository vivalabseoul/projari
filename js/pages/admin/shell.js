/* ===== 관리자 화면 틀 (왼쪽 메뉴 + 대시보드) =====
   메뉴를 늘리려면: 화면 파일에서 PAGES.admin.키 를 등록하고, 아래 ADMIN_MENU 에 한 줄만 추가하면 됩니다. */
const ADMIN_MENU = [
  { g:'', items:[['dash', '대시보드', 'M3 12 12 3l9 9M5 10v10h5v-6h4v6h5V10']] },
  { g:'운영', items:[
    ['verify', '자격·신고증 인증', 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z M9 12l2 2 4-4'],
    ['pay', '입금·정산', 'M3 7h18v12H3z M3 11h18 M7 15h3'],
    ['ops', '운영 현황', 'M4 20V10M10 20V4M16 20v-7M22 20H2']] },
  { g:'콘텐츠', items:[['content', '광고바·공지·팝업', 'M4 5h16v11H9l-5 4z']] },
  { g:'요금', items:[['promo', '수수료·프로모션', 'M20 12 12 20 4 12V4h8z M8.5 8.500h.01']] }
];
function adminPending(){
  return { verify:verifs.filter(v => v.status === '대기').length, pay:leases.filter(l => payRow(l).recon !== '일치').length };
}
function adminShell(inner){
  const cur = S.tab.admin, pend = adminPending();
  const nav = ADMIN_MENU.map(m => `${m.g ? `<p class="adm-g">${m.g}</p>` : ''}${m.items.map(([k, l, ic]) =>
    `<button data-tab="${k}" ${cur === k ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ic}"/></svg><span>${l}</span>${pend[k] ? `<em>${pend[k]}</em>` : ''}</button>`).join('')}`).join('');
  return `<div class="adm"><aside class="adm-side" aria-label="관리자 메뉴">${nav}
    <p class="adm-g">바로가기</p><a href="index.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M10 6H5v13h13v-5"/></svg><span>사이트 보기</span></a></aside>
    <div class="adm-main">${inner}</div></div>`;
}

/* ----- 대시보드 ----- */
const sumBy = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
function daySeries(n){
  const days = Array.from({ length:n }, (_, i) => addDays(TODAY, i - n + 1));
  return days.map(d => ({ d, n:bookings.filter(b => b.created === d).length }));
}
function barChart(series, color, label='예약 요청 수'){
  const max = Math.max(...series.map(x => x.n), 1), W = 100 / series.length;
  return `<svg viewBox="0 0 100 44" preserveAspectRatio="none" style="width:100%;height:150px;display:block" role="img" aria-label="${series.length}일 ${label}">${series.map((x, i) => {
    const h = x.n / max * 36; return `<rect x="${i * W + W * .18}" y="${40 - h}" width="${W * .64}" height="${Math.max(h, x.n ? .8 : .25)}" rx=".6" fill="${x.n ? color : 'var(--line)'}"><title>${x.d} · ${x.n}건</title></rect>`; }).join('')}</svg>
    <div class="row small muted num" style="justify-content:space-between;flex-wrap:nowrap;gap:4px"><span>${series[0].d.slice(5)}</span><span>합계 ${sumBy(series, x => x.n)}건</span><span>${series[series.length - 1].d.slice(5)}</span></div>`;
}
function adminDash(){
  const live = bookings.filter(b => b.status !== '거절' && b.status !== '취소');
  const gross = sumBy(live, amountOf), fee = sumBy(live, feeOf);
  const monthKey = TODAY.slice(0, 7), thisM = live.filter(b => (b.created || '').startsWith(monthKey));
  const pend = adminPending(), reqs = bookings.filter(b => b.status === '요청').length;
  const pubs = spaces.filter(s => s.status === '공개').length, wait = spaces.filter(s => s.status === '검수 대기').length;
  const todos = [
    [pend.verify, '자격·신고증 검수 대기', 'admin:verify'], [wait, '승인 대기 중인 공간', 'admin:verify'],
    [pend.pay, '입금·정산 확인이 필요한 청구', 'admin:pay'], [reqs, '원장님 응답 대기 중인 예약 요청', 'admin:ops']
  ].filter(t => t[0] > 0);
  const stat = ['요청', '확정', '완료', '거절', '취소'].map(s => ({ s, n:bookings.filter(b => b.status === s).length }));
  const smax = Math.max(...stat.map(x => x.n), 1);
  const recent = [...bookings].sort((a, b) => b.id - a.id).slice(0, 6);
  const feeNote = LIVE && FEE.ready ? `기본 ${pc(FEE.base)}${FEE.promos.some(p => promoState(p) === '진행 중') ? ' · 진행 중 프로모션 있음' : ''}` : '';
  return `<div class="head"><div><h2>대시보드</h2><p class="small muted">${TODAY} 기준 · ${LIVE ? '실제 데이터' : '예시 데이터'}</p></div>
    <div class="adm-actions"><button class="btn sm" data-tab="verify">검수하기</button><button class="btn sm" data-tab="content">공지·팝업</button><button class="btn sm" data-tab="promo">프로모션</button></div></div>
  <div class="adm-kpis">
    <div class="panel kpi"><span class="lbl">총 거래액</span><span class="v num">${won(gross)}</span><span class="small muted num">이번 달 ${won(sumBy(thisM, amountOf))}</span></div>
    <div class="panel kpi"><span class="lbl">플랫폼 수수료</span><span class="v acc num">${won(fee)}</span><span class="small muted num">${gross ? '평균 ' + (fee / gross * 100).toFixed(1) + '%' : '아직 거래가 없습니다'}</span></div>
    <div class="panel kpi"><span class="lbl">예약</span><span class="v num">${bookings.length}건</span><span class="small muted num">응답 대기 ${reqs}건</span></div>
    <div class="panel kpi"><span class="lbl">공개 공간</span><span class="v num">${pubs}곳</span><span class="small muted num">승인 대기 ${wait}곳</span></div>
    <div class="panel kpi"><span class="lbl">월 계약</span><span class="v num">${leases.length}건</span><span class="small muted num">미납 ${leases.filter(l => l.thisMonth === '미납').length}건</span></div>
  </div>
  <div class="grid2" style="grid-template-columns:1.2fr .8fr">
    <section class="panel stack"><h3>처리할 일</h3>${todos.length ? `<ul class="adm-todo">${todos.map(([n, l, go]) => `<li><button data-go="${go}"><b class="num">${n}</b><span>${l}</span><i aria-hidden="true">›</i></button></li>`).join('')}</ul>` : '<p class="muted small" style="margin:0">지금 처리할 일이 없습니다.</p>'}</section>
    <section class="panel stack"><h3>수수료율</h3><p class="small muted" style="margin:0">${feeNote || '설정 전입니다'}</p><div><button class="btn sm" data-tab="promo">수수료·프로모션 관리</button></div></section>
  </div>
  <div class="grid2" style="grid-template-columns:1.2fr .8fr">
    <section class="panel stack"><h3>최근 14일 예약 요청</h3>${barChart(daySeries(14), 'var(--accent)')}</section>
    <section class="panel stack"><h3>예약 상태</h3>${stat.map(x => `<div class="row" style="align-items:center;gap:10px;flex-wrap:nowrap"><span class="small" style="flex:0 0 44px">${x.s}</span><div class="bar" style="flex:1 1 auto"><i style="width:${x.n / smax * 100}%"></i></div><span class="num small" style="flex:0 0 28px;text-align:right">${x.n}</span></div>`).join('')}</section>
  </div>
  <section class="panel stack"><h3>최근 예약</h3><div class="tbl-wrap"><table class="num"><thead><tr><th>접수</th><th>공간</th><th>디자이너</th><th>단위</th><th class="r">금액</th><th>상태</th></tr></thead><tbody>
  ${recent.length ? recent.map(b => { const s = sp(b.spaceId); return `<tr><td>${b.created || b.start}</td><td>${s ? esc(s.name) : '-'}</td><td>${esc(b.guest)}</td><td>${unitLabel(b.unit, b.qty)}</td><td class="r">${s ? won(amountOf(b)) : '-'}</td><td><span class="pill ${statusPill(b.status)}">${b.status}</span></td></tr>`; }).join('')
    : '<tr><td colspan="6" class="muted" style="text-align:center;padding:20px">아직 예약이 없습니다</td></tr>'}
  </tbody></table></div></section>`;
}

/* 화면 등록 */
PAGES.admin.dash=()=>adminDash();
