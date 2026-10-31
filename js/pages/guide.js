/* ===== 이용 안내 (수수료·정산 상세) ===== */
function guidePage(){
  return `<div class="head"><div><h2>이용 안내</h2><p class="small muted">서비스 특징과 수수료, 결제, 정산 기준을 정리했습니다. 수치는 확정 전 가안입니다.</p></div></div>
  <section class="stack" style="gap:12px"><h3>${esc(CONFIG.name)}만의 서비스</h3>
    <div class="grid2">
      <div class="panel stack"><b>샵인샵 월세 중간 관리</b><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
        <li>첫 달 월세, 운영료, 보증금을 계약 시점에 한 번에 수납합니다.</li>
        <li>이후 매월 월세와 운영료가 청구되고, 미납 시 납부 알림과 재결제는 프로체어가 진행합니다.</li>
        <li>원장님은 월세 수납 현황을 화면에서 확인하고, 직접 독촉할 필요가 없습니다.</li>
      </ul></div>
      <div class="panel stack"><b>국가자격 검증 입점</b><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
        <li>원장님과 디자이너 모두 미용사 국가기술자격증을 인증한 뒤에만 이용할 수 있습니다.</li>
        <li>보유 자격 종목 범위 안에서만 시술 업종을 선택할 수 있습니다.</li>
        <li>계약 형태(호스트 소속 프리랜서 / 각자 영업신고)에 맞춰 신고증도 함께 확인합니다.</li>
      </ul></div>
    </div>
    <div class="panel stack"><b>새벽·야간 시간 예약</b><p class="small" style="margin:0">메이크업·촬영 등 새벽 콜에 맞춰 원장님이 출입 가능 시간과 1일 이용 시간을 정하고, 디자이너는 시작 시간을 고릅니다. 예약이 확정되면 출입 코드가 공개됩니다.</p></div>
  </section>
  <section class="panel stack num">
    <h3>수수료</h3>
    <div class="tbl-wrap"><table><thead><tr><th>구분</th><th class="r">수수료</th><th>예시</th><th class="r">원장님 정산액</th></tr></thead><tbody>
      <tr><td>샵인샵 월 입점</td><td class="r">${pct(CONFIG.fee.month)}</td><td>월세 ${won(900000)} + 운영료 ${won(100000)}</td><td class="r"><b>${won(1000000*(1-CONFIG.fee.month))}</b></td></tr>
      <tr><td>보증금</td><td class="r">0%</td><td>보증금 ${won(1000000)}</td><td class="r"><b>${won(1000000)}</b><br><span class="small muted">입주 확인 후 전달</span></td></tr>
      <tr><td>일 단위 대여</td><td class="r">${pct(CONFIG.fee.day)}</td><td>1일 ${won(60000)}</td><td class="r"><b>${won(60000*(1-CONFIG.fee.day))}</b></td></tr>
    </tbody></table></div>
    <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
      <li>등록비·월 이용료는 없고, 거래가 생길 때만 수수료가 붙습니다.</li>
      <li>수수료는 원장님 정산금에서 차감되며, 디자이너는 수수료를 내지 않습니다.</li>
      <li>런칭 혜택: 가입 후 첫 ${CONFIG.promoMonths}개월은 수수료를 ${pct(CONFIG.promoRate)} 할인합니다. (월 입점 ${pct(promoFee(CONFIG.fee.month))}, 일 단위 ${pct(promoFee(CONFIG.fee.day))})</li>
      <li>운영료(전기·기기 사용료)는 월세와 함께 원장님 정산금에 포함되며, 수수료도 같은 기준으로 붙습니다.</li>
    </ul>
  </section>
  <section class="grid2">
    <div class="panel stack"><h3>결제</h3><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
      <li>일 단위: 예약할 때 전체 금액을 결제합니다.</li>
      <li>년 단위: 원장님이 정한 연 임대료를 12개월로 나눠 매월 결제합니다. 수수료는 월 단위와 같은 ${pct(CONFIG.fee.year)}입니다.</li>
      <li>월 단위: 첫 달 월세, 운영료, 보증금을 먼저 결제하고, 이후 매월 계약한 날짜에 월세와 운영료가 청구됩니다.</li>
      <li>결제 수단: 월세·운영료는 카드 또는 가상계좌, 보증금은 가상계좌만 가능합니다.</li>
      <li>보증금은 입주가 확인되면 원장님께 전달하고, 계약 종료 시 원장님이 디자이너에게 직접 반환합니다.</li>
    </ul></div>
    <div class="panel stack"><h3>정산</h3><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">
      <li>첫 달은 입주 확인 후, 이후는 결제 확인 후 수수료를 뺀 금액을 원장님 계좌로 지급합니다. 지급 일정은 PG사 확정 후 안내합니다.</li>
      <li>월세가 미납되면 프로체어가 납부 알림과 재결제를 진행합니다.</li>
      <li>정산 내역과 월세 수납 현황은 원장님 화면에서 실시간으로 확인합니다.</li>
    </ul></div>
  </section>
  <section class="panel stack"><h3>업종별 이용 기준</h3><p class="small muted">매장 기기는 운영료로 함께 쓰고, 약제와 소모품은 디자이너가 직접 준비합니다. 확인 중인 항목은 확정되면 바로 반영합니다.</p>${ruleTable(Object.keys(TYPE_RULES))}</section>
  <section class="panel stack"><h3>기기·약제·보험</h3><ul class="small" style="margin:0;padding-left:18px;display:grid;gap:4px"><li>${SELF_SUPPLY}</li><li>프로체어케어: 계약에 기본 포함되는 보험으로, 시술 중 고객 사고와 매장 시설 파손 보장을 보험사와 협의 중입니다. (준비 중)</li></ul></section>
  <section class="panel stack"><h3>가입 자격</h3><p class="small">원장님과 디자이너 모두 미용사 국가기술자격증이 필요하며, 가입 시 큐넷 진위확인으로 대조합니다. 시술 가능한 업종은 보유 자격 종목으로 정해집니다.</p></section>
  <section class="panel row" style="align-items:center;justify-content:space-between">
    <p style="flex:1 1 260px" class="small muted">취소·환불 기준은 정식 버전에서 약관과 함께 안내합니다.</p>
    <button class="btn pri" style="flex:0 0 auto" data-auth="signup" data-type="host">무료로 시작하기</button>
  </section>`;
}

/* 화면 등록 */
PAGES.intro.guide=()=>guidePage();
