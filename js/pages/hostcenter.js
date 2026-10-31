/* ===== 호스트센터 (원장님 안내) ===== */
function landing(){
  return `<div class="lp">
  <section class="lp-hero">
    <div class="lp-hero-in">
      <span class="lp-eyebrow">SALON SHARING PLATFORM</span>
      <h1>비어 있는 의자를<br><b>월세 받는 자리로</b></h1>
      <p>국가자격이 확인된 디자이너를 연결하고, 월세 수납과 정산까지 ${esc(CONFIG.name)}가 맡습니다. 원장님은 자리만 내어 주세요.</p>
      <div class="lp-cta">
        <button class="btn gold" data-auth="signup" data-type="host">무료로 공간 등록하기</button>
        <button class="btn line" data-go="host:dash">원장님 화면 미리보기</button>
      </div>
      <div class="lp-proof"><span>원장님·디자이너 국가자격 검증</span><span>월세·운영료 수납 대행</span></div>
    </div>
  </section>

  <section class="lp-sec">
    <span class="lp-kicker">WHY PROCHAIR</span>
    <h2>샵인샵 운영에 드는 수고를 <b>대신 맡습니다</b></h2>
    <div class="lp-cols">
      <div><span class="lp-tag">VERIFIED</span><h3>검증된 디자이너만</h3><p>모든 회원의 미용사 국가기술자격을 큐넷 진위확인으로 대조합니다. 시술 업종이 매장 영업신고 업종과 맞는지도 자동으로 확인합니다.</p></div>
      <div><span class="lp-tag">RENT &amp; DEPOSIT</span><h3>월세와 보증금은 프로체어가</h3><p>월세와 운영료는 정해진 날 카드나 가상계좌로 받습니다. 보증금은 입주가 확인되면 원장님께 전달합니다. 미납되면 프로체어가 알림과 재결제를 진행합니다.</p></div>
      <div><span class="lp-tag">EXTRA HOURS</span><h3>빈 시간까지 수익으로</h3><p>월 입점 외에 남는 의자는 일 단위로 빌려줄 수 있습니다. 출입 시간을 열어 두면 새벽 메이크업·광고 촬영 예약도 받습니다.</p></div>
    </div>
  </section>

  <section class="lp-sec">
    <span class="lp-kicker">HOW IT WORKS</span>
    <h2>등록부터 정산까지 <b>네 단계</b></h2>
    <ol class="lp-steps">
      <li><b>공간 등록</b><span>사진, 좌석 수, 월세·운영료·보증금, 출입 가능 시간을 입력합니다.</span></li>
      <li><b>서류 검수</b><span>국가자격과 영업신고증을 확인한 뒤 공간이 공개됩니다.</span></li>
      <li><b>입점 요청 수락</b><span>디자이너의 자격과 포트폴리오를 보고 수락하면 계약이 시작됩니다.</span></li>
      <li><b>입주 확인 후 정산</b><span>첫 달은 입주가 확인되면 월세·운영료와 보증금을, 이후 매월 결제분을 수수료를 빼고 지급합니다.</span></li>
    </ol>
  </section>

  <section class="lp-split">
    <div class="lp-sec" style="gap:12px"><span class="lp-kicker">FAQ</span><h2>원장님이 <b>자주 묻는 질문</b></h2><p class="small muted">결제·정산 기준은 <button class="btn ghost sm" style="padding:0;text-decoration:underline;color:var(--accent)" data-go="intro:guide">이용 안내</button>에서 확인하세요.</p></div>
    <div>
      <details><summary>디자이너 손님의 시술 매출은 누구 매출인가요?</summary><p>시술 매출은 디자이너 본인 몫이고, 원장님은 월세·대여료를 받습니다. 매장 카드단말기로 결제하면 원장님 매출로 잡힐 수 있어 디자이너 개인 결제 수단 사용을 원칙으로 안내합니다.</p></details>
      <details><summary>디자이너는 어떻게 검증하나요?</summary><p>가입할 때 미용사 국가기술자격증 정보를 받아 큐넷 진위확인으로 대조합니다. 원장님도 같은 절차를 거칩니다. 확인 전에는 예약과 공간 공개가 제한됩니다.</p></details>
      <details><summary>영업시간 외에도 빌려줘야 하나요?</summary><p>아닙니다. 출입 가능 시간과 1일 기준 시간은 원장님이 직접 정합니다. 24시간 출입을 허용하면 새벽 메이크업 예약도 받을 수 있습니다.</p></details>
      <details><summary>기기와 약제는 누가 준비하나요?</summary><p>매장 기기는 디자이너가 운영료를 내고 함께 씁니다. 약제와 소모품은 디자이너가 직접 준비합니다. 헤어라면 펌약·염색약·롯드·파지·고무줄, 네일이라면 젤·폴리시·파일이 해당합니다. 업종별 기준은 이용 안내에 정리되어 있습니다.</p></details>
      <details><summary>월세가 밀리면 어떻게 되나요?</summary><p>프로체어가 납부 알림과 재결제를 진행하고, 원장님은 월세 관리 화면에서 상태를 바로 확인할 수 있습니다.</p></details>
    </div>
  </section>

  <section class="lp-end">
    <div style="flex:1 1 300px;display:grid;gap:6px"><h2>지금 비어 있는 의자,<br><b>이번 달부터 수익으로</b></h2><p>가입부터 공간 등록까지 약 5분 · 등록비 없음</p></div>
    <div class="lp-cta"><button class="btn gold" data-auth="signup" data-type="host">무료로 시작하기</button><button class="btn line" data-auth="signup" data-type="guest">디자이너로 가입</button></div>
  </section>
  </div>`;
}

/* 화면 등록 */
PAGES.intro.hostcenter=()=>landing();
