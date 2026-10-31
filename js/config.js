/* ===== 설정: 이름·수수료는 여기서만 바꾸면 전체 반영 ===== */
const CONFIG = {
  name: '프로체어',
  fee: { day: 0.15, month: 0.15, year: 0.15 },   // 수수료 15% (호스트 정산 시 차감)
  feePublic: false,                    // false: 수수료율을 화면에 공개하지 않음 (정산 계산에는 그대로 사용)
  promoMonths: 0,                      // 수수료 할인 없음: 수수료는 항상 15%
  promoRate: 0,
  photo: { max: 5, maxKB: 100 },     // 매장 사진: 최대 5장, 장당 100KB (넘으면 자동 축소)
  depositMethod: '가상계좌'            // 보증금은 가상계좌로만 수납 (카드 수수료 방지)
};
const promoFee = r => r*(1-CONFIG.promoRate);
const feePct = r => CONFIG.feePublic ? pct(r) : '별도 안내';
const TYPES = ['헤어','네일','피부','속눈썹','메이크업','반영구','SMP'];
const PENDING_TYPES = ['반영구','SMP']; /* 문신사법 시행(공포 후 2년) 전: 사전 접수만, 검색 비노출 */
const hasPending = types => types.some(t=>PENDING_TYPES.includes(t));
/* 지역은 우편번호 검색(주소)에서 '시도 시군구'로 자동 입력됩니다. 검색 필터에는 공개된 공간이 있는 지역만 나옵니다. */
const areaOptions = () => [...new Set(spaces.filter(s=>s.status==='공개').map(s=>s.area).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
const DAYS = ['월','화','수','목','금','토','일'];
const SELF_SUPPLY = '시술 약제와 소모품은 디자이너가 직접 준비합니다 (헤어 예: 펌약·염색약·롯드·파지·고무줄). 매장 기기는 운영료로 이용합니다. 업종별 기준은 이용 안내에서 확인하세요.';
/* ===== 업종별 이용 기준: 여기 한 곳만 고치면 상세·등록·이용 안내에 모두 반영 ===== */
const TYPE_RULES = {
  '헤어':    {rent:'샴푸대, 열기구, 드라이기', own:'펌약, 염색약, 롯드, 파지, 고무줄', note:'샴푸대 사용 시간은 매장과 미리 조율합니다. 약제를 쓸 때는 환기합니다.'},
  '네일':    {rent:'시술 테이블, 젤 램프, 집진기', own:'젤, 폴리시, 팁, 파일', note:'도구는 소독 기준에 맞춰 관리합니다. 분진과 아세톤 등 화학제품 보관에 주의합니다.'},
  '피부':    {rent:'베드, 스티머', own:'화장품, 앰플, 시트', note:'의료기기에 해당하는 기기는 사용할 수 없으며, 사용할 기기는 매장과 미리 확인합니다. 개별 룸이 있는 매장을 권합니다.'},
  '속눈썹':  {rent:'베드, 조명', own:'글루, 속눈썹 모', note:'시술하려면 해당 업종의 자격이 필요합니다. 글루를 쓸 때는 환기합니다.'},
  '메이크업': {rent:'의자, 조명, 거울', own:'화장품 일체', note:'시술은 매장 안에서 합니다. 새벽 이용은 원장님이 정한 출입 시간 안에서만 가능합니다.'},
  '반영구':  {rent:'베드', own:'시술 재료 일체', note:'문신사법 시행 전에는 사전 접수만 받습니다.'},
  'SMP':     {rent:'베드', own:'시술 재료 일체', note:'문신사법 시행 전에는 사전 접수만 받습니다.'}
};
const ruleRows = types => types.filter(t=>TYPE_RULES[t]).map(t=>{const r=TYPE_RULES[t];return `<tr><th scope="row">${esc(t)}</th><td>${esc(r.rent)}</td><td>${esc(r.own)}</td><td>${esc(r.note)}</td></tr>`}).join('');
const ruleTable = types => `<div class="tbl-wrap"><table class="rules"><thead><tr><th>업종</th><th>매장 기기 (운영료)</th><th>디자이너 직접 준비</th><th>유의사항</th></tr></thead><tbody>${ruleRows(types)}</tbody></table></div>`;
const SERVICES = ['샴푸대 사용','펌·열기구 사용','타월·가운 세탁','기본 재료 (샴푸·린스)','예약 데스크 응대','카드 단말기','고객 대기 라운지','소독·위생 관리','와이파이','주차','개별 룸','개인 수납함'];
