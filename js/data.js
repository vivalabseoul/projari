/* ===== 예시 데이터 (실제 매장 아님) ===== */
const ME_HOST = '결 헤어 스튜디오';
const ME_GUEST = { name:'김지원', licenses:['헤어','속눈썹','메이크업'], ownReport:false, verified:true };
const DEMO_CODE = '123456';   // 프로토타입 인증번호
let spaces = [
  {id:1,deal:{label:'특가',day:50000,month:790000,until:'2026-11-30'},name:'결 헤어 스튜디오',area:'서울 마포구',types:['헤어'],seats:6,free:2,day:60000,month:900000,deposit:1000000,ops:100000,year:10260000,share:false,days:['화','수','목','금','토'],svc:['샴푸대 사용','펌·열기구 사용','타월·가운 세탁','기본 재료 (샴푸·린스)','예약 데스크 응대','카드 단말기','와이파이','주차'],h:340,host:ME_HOST,status:'공개',rating:4.8,pyeong:24,shampoo:3,addr:'서울 마포구 서교동 000-0, 2층'},
  {id:2,name:'결 네일 룸',area:'서울 마포구',types:['네일','속눈썹','메이크업'],seats:3,free:1,day:40000,month:600000,deposit:500000,ops:60000,year:6840000,share:true,days:['월','화','수','목','금'],svc:['개별 룸','소독·위생 관리','타월·가운 세탁','카드 단말기','와이파이','개인 수납함'],h:20,host:ME_HOST,status:'공개',rating:4.9,pyeong:12,shampoo:0,addr:'서울 마포구 서교동 000-0, 3층'},
  {id:3,name:'온결 살롱',area:'서울 성동구',types:['헤어','피부'],seats:8,free:3,day:75000,month:1100000,deposit:1500000,ops:120000,year:12540000,share:false,days:['수','목','금','토','일'],svc:['샴푸대 사용','펌·열기구 사용','타월·가운 세탁','고객 대기 라운지','예약 데스크 응대','와이파이'],h:200,host:'온결 살롱',status:'공개',rating:4.7,pyeong:40,shampoo:5,beds:2,addr:'서울 성동구 성수동 000-0, 1~2층'},
  {id:4,name:'모노 뷰티랩',area:'서울 강남구',types:['피부','속눈썹','메이크업'],seats:4,free:2,day:80000,month:1250000,deposit:1500000,ops:120000,year:14250000,share:true,days:['월','화','수','목','금','토'],svc:['개별 룸','소독·위생 관리','타월·가운 세탁','고객 대기 라운지','개인 수납함','와이파이'],h:260,host:'모노 뷰티랩',status:'공개',rating:4.6,pyeong:18,shampoo:0,beds:3,addr:'서울 강남구 논현동 000-0, 4층'},
  {id:5,deal:{label:'프로모션',day:39000,month:600000,until:'2026-12-31'},name:'하루 헤어',area:'경기 성남시',types:['헤어'],seats:5,free:2,day:45000,month:700000,deposit:700000,ops:80000,year:7980000,share:false,days:['월','화','수','목','금','토','일'],svc:['샴푸대 사용','펌·열기구 사용','기본 재료 (샴푸·린스)','주차','와이파이'],h:150,host:'하루 헤어',status:'공개',rating:4.5,pyeong:20,shampoo:3,addr:'경기 성남시 분당구 000-0, 2층'},
  {id:6,name:'소담 네일',area:'경기 고양시',types:['네일'],seats:4,free:2,day:30000,month:450000,deposit:300000,ops:50000,year:5130000,share:true,days:['화','수','목','금','토'],svc:['소독·위생 관리','카드 단말기','와이파이','개인 수납함'],h:100,host:'소담 네일',status:'공개',rating:4.8,pyeong:10,shampoo:0,addr:'경기 고양시 일산동구 000-0, 1층'},
  {id:7,deal:{label:'할인',day:0,month:750000,until:'2026-11-15'},name:'로아 헤어',area:'서울 송파구',types:['헤어'],seats:7,free:3,day:55000,month:850000,deposit:900000,ops:90000,year:9690000,share:false,days:['화','수','목','금','토','일'],svc:['샴푸대 사용','펌·열기구 사용','기본 재료 (샴푸·린스)','카드 단말기','와이파이','주차'],h:180,host:'로아 헤어',status:'공개',rating:4.6,pyeong:28,shampoo:4,addr:'서울 송파구 잠실동 000-0, 3층'},
  {id:8,name:'아뜰리에 스킨',area:'서울 강남구',types:['피부'],seats:5,free:2,day:70000,month:1000000,deposit:1000000,ops:100000,year:11400000,share:true,days:['월','화','수','목','금','토'],svc:['개별 룸','소독·위생 관리','타월·가운 세탁','개인 수납함','와이파이'],h:240,host:'아뜰리에 스킨',status:'공개',rating:4.7,pyeong:22,shampoo:0,beds:4,addr:'서울 강남구 역삼동 000-0, 5층'},
  {id:9,name:'단아 네일 스튜디오',area:'서울 성동구',types:['네일'],seats:4,free:2,day:35000,month:500000,deposit:300000,ops:50000,year:5700000,share:true,days:['화','수','목','금','토'],svc:['소독·위생 관리','카드 단말기','와이파이','개인 수납함'],h:60,host:'단아 네일 스튜디오',status:'공개',rating:4.5,pyeong:14,shampoo:0,addr:'서울 성동구 성수동 000-0, 2층'},
  {id:10,name:'청담 헤어룸',area:'서울 강남구',types:['헤어','속눈썹','메이크업'],seats:10,free:4,day:90000,month:1400000,deposit:2000000,ops:150000,year:15960000,share:false,days:['월','화','수','목','금','토','일'],svc:['샴푸대 사용','펌·열기구 사용','타월·가운 세탁','고객 대기 라운지','예약 데스크 응대','와이파이','주차'],h:300,host:'청담 헤어룸',status:'공개',rating:4.9,pyeong:55,shampoo:6,addr:'서울 강남구 청담동 000-0, 2층'}
];
/* 시간 규칙: 호스트가 출입 가능 시간대 + 1일 기준(연속 N시간)을 정하고, 게스트가 시작 시각을 고름. 자정 넘김 허용 */
const TIMES = {
  1:{open:'10:00',close:'22:00',acc24:false,accFrom:'06:00',accTo:'23:30',dayHours:12,code:'2580#'},
  2:{open:'11:00',close:'21:00',acc24:true,accFrom:'00:00',accTo:'23:30',dayHours:10,code:'1357*'},
  3:{open:'10:00',close:'21:00',acc24:false,accFrom:'08:00',accTo:'22:00',dayHours:12,code:''},
  4:{open:'10:30',close:'20:30',acc24:true,accFrom:'00:00',accTo:'23:30',dayHours:12,code:'4826#'},
  5:{open:'09:30',close:'20:00',acc24:false,accFrom:'07:00',accTo:'22:00',dayHours:12,code:''},
  6:{open:'11:00',close:'22:00',acc24:false,accFrom:'09:00',accTo:'23:00',dayHours:10,code:'0909#'},
  7:{open:'10:00',close:'21:00',acc24:false,accFrom:'08:00',accTo:'22:00',dayHours:12,code:''},
  8:{open:'10:00',close:'20:00',acc24:false,accFrom:'09:00',accTo:'21:00',dayHours:10,code:'7421#'},
  9:{open:'11:00',close:'21:00',acc24:false,accFrom:'10:00',accTo:'22:00',dayHours:8,code:''},
  10:{open:'10:00',close:'22:00',acc24:true,accFrom:'00:00',accTo:'23:30',dayHours:12,code:'3050#'}
};
spaces.forEach(s=>Object.assign(s,TIMES[s.id]));
const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const pad = n => String(n).padStart(2,'0');
const fmtMin = m => `${m>=1440?'익일 ':''}${pad(Math.floor((m%1440)/60))}:${pad(m%60)}`;
const endOf = (t,h) => fmtMin(toMin(t)+h*60);
const accLabel = s => s.acc24 ? '24시간' : `${s.accFrom}~${s.accTo}`;
const startOptions = s => { const out=[]; for(let m=0;m<1440;m+=30){ if(s.acc24 || (m>=toMin(s.accFrom) && m+s.dayHours*60<=toMin(s.accTo))) out.push(fmtMin(m)); } return out; };
const accessOk = r => r.acc24 || toMin(r.accTo)-toMin(r.accFrom) >= r.dayHours*60;
const dayNo = d => Math.round(Date.parse(d+'T00:00:00Z')/86400000);
function overlapCount(spaceId,start,qty,time,hours,exceptId){
  const iv=[]; for(let i=0;i<qty;i++){ const a=(dayNo(start)+i)*1440+toMin(time); iv.push([a,a+hours*60]); }
  return bookings.filter(b=>b.spaceId===spaceId&&b.unit==='day'&&b.id!==exceptId&&(b.status==='요청'||b.status==='확정')).filter(b=>{
    for(let i=0;i<b.qty;i++){ const a=(dayNo(b.start)+i)*1440+toMin(b.time); const e=a+sp(b.spaceId).dayHours*60; if(iv.some(([x,y])=>x<e&&a<y)) return true; } return false; }).length;
}
/* 샵인샵 월세 계약: 프로체어가 매월 자동결제 → 수수료 차감 → 호스트 정산 */
let leases = [
  {id:301,spaceId:1,guest:'이도윤',gType:'헤어',rent:900000,deposit:1000000,start:'2026-08-01',months:12,payDay:1,thisMonth:'결제 완료',ops:100000,method:'카드',paidAt:'2026-10-01 09:12',settle:'지급 완료',settleAt:'2026-10-06'},
  {id:302,spaceId:1,guest:'서지안',gType:'헤어',rent:900000,deposit:1000000,start:'2026-06-25',months:6,payDay:25,thisMonth:'미납',ops:100000,method:'카드',paidAt:'',settle:'청구 대기',settleAt:''},
  {id:303,spaceId:2,guest:'최하은',gType:'네일',rent:600000,deposit:500000,start:'2026-09-15',months:6,payDay:15,thisMonth:'결제 완료',ops:60000,method:'가상계좌',paidAt:'2026-10-15 14:03',settle:'지급 대기',settleAt:'2026-10-20'},
  {id:304,spaceId:2,guest:'오유나',gType:'속눈썹',rent:600000,deposit:500000,start:'2026-10-30',months:3,payDay:30,thisMonth:'결제 완료',ops:60000,method:'가상계좌',paidAt:'2026-10-28 18:40',settle:'정산 보류',settleAt:'입주 확인 후',first:true}
];
let bookings = [
  {id:101,spaceId:1,guest:'박서연',gType:'헤어',unit:'day',qty:4,start:'2026-10-06',contract:'freelance',status:'완료'},
  {id:102,spaceId:1,guest:'이도윤',gType:'헤어',unit:'month',qty:1,start:'2026-10-01',contract:'freelance',status:'완료'},
  {id:103,spaceId:2,guest:'최하은',gType:'네일',unit:'day',qty:6,start:'2026-10-13',contract:'own',status:'완료'},
  {id:104,spaceId:1,guest:'정민재',gType:'헤어',unit:'day',qty:3,start:'2026-11-04',contract:'freelance',status:'요청'},
  {id:105,spaceId:2,guest:'한소율',gType:'메이크업',unit:'month',qty:2,start:'2026-11-01',contract:'own',status:'요청'},
  {id:106,spaceId:1,guest:'윤채원',gType:'헤어',unit:'day',qty:2,start:'2026-11-10',contract:'freelance',status:'확정'},
  {id:107,spaceId:4,guest:'김지원',gType:'속눈썹',unit:'day',qty:1,start:'2026-11-07',time:'02:00',contract:'freelance',status:'확정'},
  {id:108,spaceId:1,guest:'문가온',gType:'헤어',unit:'day',qty:1,start:'2026-11-14',time:'06:00',contract:'freelance',status:'확정'},
  {id:109,spaceId:4,guest:'김지원',gType:'속눈썹',unit:'day',qty:1,start:'2026-10-10',time:'02:00',contract:'freelance',status:'완료'},
  {id:110,spaceId:1,guest:'김지원',gType:'헤어',unit:'day',qty:2,start:'2026-09-20',time:'10:00',contract:'freelance',status:'완료'}
];
/* 후기: 이용 완료(bid) 1건당 1개. 예시 데이터 */
const reviews = [
  {id:1,bid:101,spaceId:1,guest:'박서연',rating:5,text:'샴푸대와 열기구 상태가 좋고 자리 정리 기준이 명확해서 첫 이용인데도 편했어요.',date:'2026-10-11',reply:'이용해 주셔서 감사합니다. 다음에도 편하게 쓰실 수 있도록 관리하겠습니다.'},
  {id:2,bid:102,spaceId:1,guest:'이도윤',rating:4,text:'월 단위로 입점했고 단골 상담 공간이 따로 있어 좋습니다. 주말 오후에는 조금 붐벼요.',date:'2026-10-20',reply:''},
  {id:3,bid:103,spaceId:2,guest:'최하은',rating:5,text:'개별 룸이라 시술 집중이 잘 됩니다. 소독 도구가 잘 갖춰져 있어요.',date:'2026-10-19',reply:''},
  {id:4,bid:110,spaceId:1,guest:'김지원',rating:4,text:'위치가 좋고 안내가 친절했습니다. 출입 코드 전달도 정확했어요.',date:'2026-09-23',reply:''}
];
const maskName = n => n.length<=2 ? n[0]+'○' : n[0]+'○'.repeat(n.length-2)+n.slice(-1);
const starTxt = n => '★'.repeat(n)+'☆'.repeat(5-n);
const rvOf = s => reviews.filter(r=>r.spaceId===s.id).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
const ratingTxt = s => { const l=rvOf(s); return l.length ? (l.reduce((a,r)=>a+r.rating,0)/l.length).toFixed(1)+` (${l.length})` : String(s.rating); };

bookings.forEach(b=>{ if(!b.time) b.time='10:00'; });
let verifs = [
  {id:201,who:'정민재',kind:'게스트',doc:'미용사 면허증 (일반)',types:['헤어'],target:'결 헤어 스튜디오 (헤어)',date:'2026-10-28',status:'대기'},
  {id:202,who:'한소율',kind:'게스트',doc:'미용사 면허증 (메이크업) · 본인 영업신고증',types:['메이크업','속눈썹'],target:'결 네일 룸 (네일, 속눈썹, 메이크업)',date:'2026-10-29',status:'대기'},
  {id:203,who:'이나래',kind:'게스트',doc:'미용사 면허증 (피부)',types:['피부'],target:'하루 헤어 (헤어)',date:'2026-10-29',status:'대기'},
  {id:204,who:'하루 헤어',kind:'호스트',doc:'미용업 영업신고증 (일반)',types:['헤어'],target:'공간 등록',date:'2026-10-20',status:'승인'}
];
