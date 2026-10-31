/* ===== 결제 확인 단계 (프로토타입) ===== */
function payDialog(){
  const s=sp(S.sel),F=S.form,total=F.unit==='day'?pDay(s)*F.qty:firstPay(s,F.unit);
  $('#layer').innerHTML=`<div class="ovl" role="dialog" aria-modal="true" aria-labelledby="payh"><div class="dlg">
    <h3 id="payh">결제 확인</h3>
    <div class="sum num"><div><span>${esc(s.name)}</span><span>${unitLabel(F.unit,F.qty)}</span></div><div><span>시작일</span><span>${F.start}</span></div><div><span>이용 시간</span><span>${F.unit==='day'?`${F.time} ~ ${endOf(F.time,s.dayHours)}`:`출입 가능 ${accLabel(s)}`}</span></div><div><span>계약 유형</span><span>${contractLabel(F.contract)}</span></div>${F.unit!=='day'?`<div><span>${F.unit==='year'?'월 분납액':'월세'} + 운영료</span><span>${won(monthlyOf(s,F.unit)+(s.ops||0))} (카드 또는 가상계좌)</span></div><div><span>보증금</span><span>${won(s.deposit)} (${CONFIG.depositMethod})</span></div>`:''}<div class="tot"><span>${F.unit!=='day'?'오늘 결제 (첫 달 + 운영료 + 보증금)':'결제 금액'}</span><span>${won(total)}</span></div></div>
    <p class="small muted">프로토타입이라 실제 결제는 일어나지 않습니다.</p>
    <div class="row"><button class="btn" data-pay="cancel">취소</button><button class="btn pri payred" data-pay="ok">${won(total)} 결제</button></div></div></div>`;
  $('[data-pay="ok"]').focus();
}
