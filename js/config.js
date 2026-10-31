/* ===== 설정: 이름·수수료는 여기서만 바꾸면 전체 반영 ===== */
const CONFIG = {
  name: '프로체어',
  fee: { day: 0.07, month: 0.08, year: 0.08 },   // 년 단위: 월과 동일 8%, 매월 분납   // 가안: 일 7%(공간 중개 업계 서비스 수수료 6~7% 기준), 월 8% (호스트 정산 시 차감)
  promoMonths: 3,                      // 런칭 혜택: 첫 3개월
  promoRate: 0.5,                      //   수수료 50% 할인
  photo: { max: 5, maxKB: 100 },     // 매장 사진: 최대 5장, 장당 100KB (넘으면 자동 축소)
  depositMethod: '가상계좌'            // 보증금은 가상계좌로만 수납 (카드 수수료 방지)
};
const promoFee = r => r*(1-CONFIG.promoRate);
const TYPES = ['헤어','네일','피부','속눈썹','메이크업','반영구','SMP'];
const PENDING_TYPES = ['반영구','SMP']; /* 문신사법 시행(공포 후 2년) 전: 사전 접수만, 검색 비노출 */
const hasPending = types => types.some(t=>PENDING_TYPES.includes(t));
const AREAS = ['서울 마포구','서울 성동구','서울 강남구','서울 송파구','경기 성남시','경기 고양시'];
const DAYS = ['월','화','수','목','금','토','일'];
const SELF_SUPPLY = '시술 약제와 소모품은 디자이너가 직접 준비합니다 (헤어 예: 펌약·염색약·롯드·파지·고무줄). 매장 기기는 운영료로 이용합니다. 업종별 기준은 이용 안내에서 확인하세요.';
/* ===== 업종별 이용 기준: 여기 한 곳만 고치면 상세·등록·이용 안내에 모두 반영 ===== */
const TYPE_RULES = {
  '헤어':    {rent:'샴푸대, 열기구, 드라이기', own:'펌약, 염색약, 롯드, 파지, 고무줄', note:'샴푸대 사용 시간은 매장과 미리 조율합니다. 약제를 쓸 때는 환기합니다.'},
  '네일':    {rent:'시술 테이블, 젤 램프, 집진기', own:'젤, 폴리시, 팁, 파일', note:'도구는 소독 기준에 맞춰 관리합니다. 분진과 아세톤 등 화학제품 보관에 주의합니다.'},
  '피부':    {rent:'베드, 스티머', own:'화장품, 앰플, 시트', note:'사용할 수 있는 기기 범위는 확인 중입니다 (의료기기 해당 여부). 개별 룸이 있는 매장을 권합니다.'},
  '속눈썹':  {rent:'베드, 조명', own:'글루, 속눈썹 모', note:'필요한 면허 종목은 확인 중입니다. 글루를 쓸 때는 환기합니다.'},
  '메이크업': {rent:'의자, 조명, 거울', own:'화장품 일체', note:'시술은 매장 안에서 합니다. 새벽 이용은 원장님이 정한 출입 시간 안에서만 가능합니다.'},
  '반영구':  {rent:'베드', own:'시술 재료 일체', note:'문신사법 시행 전에는 사전 접수만 받습니다.'},
  'SMP':     {rent:'베드', own:'시술 재료 일체', note:'문신사법 시행 전에는 사전 접수만 받습니다.'}
};
const ruleRows = types => types.filter(t=>TYPE_RULES[t]).map(t=>{const r=TYPE_RULES[t];return `<tr><th scope="row">${esc(t)}</th><td>${esc(r.rent)}</td><td>${esc(r.own)}</td><td>${esc(r.note)}</td></tr>`}).join('');
const ruleTable = types => `<div class="tbl-wrap"><table class="rules"><thead><tr><th>업종</th><th>매장 기기 (운영료)</th><th>디자이너 직접 준비</th><th>유의사항</th></tr></thead><tbody>${ruleRows(types)}</tbody></table></div>`;
const SERVICES = ['샴푸대 사용','펌·열기구 사용','타월·가운 세탁','기본 재료 (샴푸·린스)','예약 데스크 응대','카드 단말기','고객 대기 라운지','소독·위생 관리','와이파이','주차','개별 룸','개인 수납함'];
