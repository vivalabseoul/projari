/* ===== 유틸 ===== */
const won = n => Math.round(n).toLocaleString('ko-KR') + '원';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sp = id => spaces.find(s=>s.id===id);
/* 프로모션(할인가): 원장이 설정, 종료일이 지나면 원가로 자동 복귀 */
const TODAY = LIVE ? todayKST() : '2026-10-30';   /* 시연 모드는 예시 데이터에 맞춰 날짜 고정 */
const addDays = (d,n) => new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const DEAL_LABELS=['프로모션','할인','특가'];
const dealOf = s => { const d=s.deal; return d && d.until>=TODAY && ((d.month>0&&d.month<s.month)||(d.day>0&&d.day<s.day)) ? d : null; };
const pDay = s => { const d=dealOf(s); return d&&d.day>0&&d.day<s.day ? d.day : s.day; };
const pMonth = s => { const d=dealOf(s); return d&&d.month>0&&d.month<s.month ? d.month : s.month; };
const dealPct = s => dealOf(s) ? (s.deal.pct || Math.round(Math.max(1-pMonth(s)/s.month, 1-pDay(s)/s.day)*100)) : 0;
const dealTag = s => dealOf(s) ? `<span class="tag t3">${esc(s.deal.label)} ${dealPct(s)}%</span>` : '';
/* 할인율 하나로 일·월 할인가를 100원 단위로 계산합니다. 년 요금은 월 할인과 같은 비율로 내려갑니다(서버 deal_price 와 같은 규칙) */
const roundWon = n => Math.round(n/100)*100;
function applyDealPct(s){ const d=s.deal; if(!d) return; const r=1-d.pct/100;
  d.day = s.day>0 && roundWon(s.day*r)<s.day ? roundWon(s.day*r) : 0;
  d.month = s.month>0 && roundWon(s.month*r)<s.month ? roundWon(s.month*r) : 0; }
const priceOf = (price,base) => price<base ? `<s class="old">${won(base)}</s><b>${won(price)}</b>` : `<b>${won(price)}</b>`;
const MONTHS = {day:0, month:1, year:12};   /* 단위별 개월 수 (운영료·분납 계산) */
const pYear = s => { const base=s.year||s.month*12, d=dealOf(s); return d&&d.month>0&&d.month<s.month ? roundWon(base*d.month/s.month) : base; };   /* 연 임대료: 원장님 설정, 없으면 월세×12. 할인 중이면 월 할인과 같은 비율 */
const unitPrice = (s,u) => u==='day'?pDay(s):u==='year'?pYear(s):pMonth(s);
const opsOf = b => (b.ops ?? sp(b.spaceId).ops ?? 0)*MONTHS[b.unit]*b.qty;   /* 운영료(정액): 전기·기기 사용료, 원장님 수령 */
const amountOf = b => { const s=sp(b.spaceId); return (b.price ?? unitPrice(s,b.unit))*b.qty + opsOf(b); };
/* 수수료율: 운영 모드는 예약 때 서버가 고정한 요율(b.feeRate), 없으면 기본 설정값 */
const rateOf = b => b.feeRate ?? CONFIG.fee[b.unit==='day'?'day':'month'];
const feeOf = b => amountOf(b) * rateOf(b);
const monthlyOf = (s,u) => u==='year' ? Math.round(pYear(s)/12) : pMonth(s);   /* 년 단위는 매월 분납 */
const firstPay = (s,u='month') => monthlyOf(s,u) + (s.ops||0) + s.deposit;
const unitLabel = (u,q) => u==='day' ? `${q}일` : u==='year' ? `${q}년` : `${q}개월`;
const UNIT_NAME = {day:'일 단위', month:'월 단위', year:'년 단위'};
const QTY_MAX = {day:30, month:12, year:3};
const pct = r => Math.round(r*100) + '%';
const statusPill = st => ({'요청':'p-warn','확정':'p-acc','완료':'p-ok','거절':'p-bad','대기':'p-warn','승인':'p-ok','반려':'p-bad','공개':'p-ok','검수 대기':'p-warn','사전 접수':'p-warn'})[st] || 'p-mut';
const contractLabel = c => c==='freelance' ? '호스트 소속 프리랜서' : '각자 영업신고';
function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2400); }
const BED_TYPES=['피부','반영구','SMP'];
const needsBed = types => types.some(t=>BED_TYPES.includes(t));
/* 페이지 주소 기준 절대경로로 바꿔야 CSS 변수(--img)에서도 깨지지 않습니다 */
const IMGS=['images/salon.jpg','images/salon2.jpg','images/salon3.jpg'].map(p=>new URL(p,document.baseURI).href);
const imgOf = s => (s.photos&&s.photos[0]) || IMGS[(Math.abs(+s.id||0)*7+1)%IMGS.length];
function ph(s, big){ const seats=Array.from({length:Math.min(s.seats,8)},(_,i)=>`<span class="seat ${i<s.seats-s.free?'off':''}"></span>`).join('');
  return `<div class="ph ${big?'detail-ph':''}" style="--h:${s.h};--img:url(${imgOf(s)})" role="img" aria-label="${esc(s.name)} 매장 사진"><span class="tag">${s.types.map(esc).join(' · ')}</span>${dealTag(s)}<div class="seatrow">${seats}</div></div>`; }
