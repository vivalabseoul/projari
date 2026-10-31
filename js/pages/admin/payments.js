/* ===== 관리자: 입금확인 · 정산확인 (상태 분리) ===== */
const PG_COST = { '카드': a => a*0.034*1.1, '가상계좌': () => 440 };   /* 토스페이먼츠 공시 요금 기준(VAT 포함), 계약 조건에 따라 다름 */
function payRow(l){
  const base=l.rent+(l.ops||0), dep=l.first?l.deposit:0, bill=base+dep;
  const paid=l.thisMonth==='결제 완료', fee=base*CONFIG.fee.month;
  const payout=paid?base-fee+dep:0;
  const deposit=paid?'입금 확인':(l.thisMonth==='미납'?'미입금':'입금 대기');
  const settle=!paid?'정산 대상 아님':l.settle;
  const recon=!paid?(l.thisMonth==='미납'?'확인 필요 · 미입금':'대기'):'일치';
  const pg=paid?PG_COST[l.method](base)+(l.first?PG_COST['가상계좌']():0):0;   /* 보증금은 별도 가상계좌 1건 */
  return {base,dep,bill,paid,fee,payout,deposit,settle,recon,pg};
}
const payPill = t => ({'입금 확인':'p-ok','입금 대기':'p-mut','미입금':'p-bad','지급 완료':'p-ok','지급 대기':'p-acc','정산 보류':'p-warn','정산 대상 아님':'p-mut','일치':'p-ok','대기':'p-mut'})[t] || 'p-bad';
function adminPay(){
  const rows=leases.map(l=>({l,r:payRow(l)}));
  const sum=f=>rows.reduce((a,x)=>a+f(x),0);
  const nPaid=rows.filter(x=>x.r.paid).length, hold=sum(x=>x.r.settle==='정산 보류'?x.r.payout:0), done=sum(x=>x.r.settle==='지급 완료'?x.r.payout:0), bad=rows.filter(x=>x.r.recon.startsWith('확인')).length;
  const fees=sum(x=>x.r.paid?x.r.fee:0), pgs=sum(x=>x.r.pg);
  return `<div class="head"><div><h2>입금·정산</h2><p class="small muted">10월 청구 기준 · 예시 데이터. 입금 확인과 정산 확인을 따로 관리합니다.</p></div></div>
  <div class="grid3">
    <div class="panel kpi"><span class="lbl">입금 확인</span><span class="v num">${nPaid} / ${rows.length}건</span><span class="small muted num">대사 확인 필요 ${bad}건</span></div>
    <div class="panel kpi"><span class="lbl">정산 보류 (입주 확인 대기)</span><span class="v num">${won(hold)}</span><span class="small muted num">지급 완료 ${won(done)}</span></div>
    <div class="panel kpi"><span class="lbl">플랫폼 수수료 − PG 비용 (추정)</span><span class="v acc num">${won(fees-pgs)}</span><span class="small muted num">수수료 ${won(fees)} · PG ${won(pgs)}</span></div>
  </div>
  <section class="panel"><div class="tbl-wrap"><table class="num"><thead><tr><th>청구</th><th>매장 · 디자이너</th><th class="r">청구액</th><th>결제수단</th><th>입금 확인</th><th>정산 확인</th><th class="r">수수료</th><th class="r">원장님 지급액</th><th>대사</th></tr></thead><tbody>
  ${rows.map(({l,r})=>`<tr><td>C-${l.id}<br><span class="small muted">${l.first?'첫 달 (보증금 포함)':'10월 정기'}</span></td><td>${esc(sp(l.spaceId).name)}<br><span class="small muted">${esc(l.guest)}</span></td>
    <td class="r"><span style="white-space:nowrap">${won(r.bill)}</span><br><span class="small muted">월세 ${won(l.rent)} · 운영료 ${won(l.ops||0)}${r.dep?` · 보증금 ${won(r.dep)}`:''}</span></td>
    <td>${esc(l.method)}${r.dep?`<br><span class="small muted">보증금 ${CONFIG.depositMethod}</span>`:''}</td>
    <td><span class="pill ${payPill(r.deposit)}">${r.deposit}</span>${l.paidAt&&r.paid?`<br><span class="small muted">${esc(l.paidAt)}</span>`:''}</td>
    <td><span class="pill ${payPill(r.settle)}">${r.settle}</span>${r.paid&&l.settleAt?`<br><span class="small muted">${esc(l.settleAt)}</span>`:''}</td>
    <td class="r" style="white-space:nowrap">${r.paid?won(r.fee):'–'}</td>
    <td class="r" style="white-space:nowrap"><b>${r.paid?won(r.payout):'–'}</b></td>
    <td><span class="pill ${payPill(r.recon)}">${r.recon}</span></td></tr>`).join('')}
  </tbody></table></div></section>
  <p class="note">수수료는 월세+운영료 기준이며 보증금에는 붙지 않습니다. 대사: 청구액 = 입금액, 입금액 = 원장님 지급액 + 수수료를 매일 확인합니다. 정산 보류는 첫 달 계약의 입주 확인 전 상태입니다. PG 비용은 공시 요금(카드 3.4%+VAT, 가상계좌 건당 400원+VAT) 기준 추정치입니다.</p>`;
}

/* 화면 등록 */
PAGES.admin.pay=()=>adminPay();
