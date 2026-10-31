/* ===== 상태 ===== */
let BOOTING = LIVE;   /* 운영 모드에서 로그인 상태를 확인하기 전까지 true: 이 동안에는 로그아웃 화면을 그리지 않습니다 */
const S = { role:'intro', user:null, auth:null, tab:{intro:'home',host:'dash',guest:'search',admin:'dash'}, filter:{area:'전체',type:'전체',unit:'month',flag:'',q:'',shampoo:'0',bed:'0'}, fav:new Set([4]), recent:[],more:{}, slide:0, sel:null,
  form:{unit:'day',qty:1,start:'2026-11-09',time:'10:00',contract:'freelance',gType:'헤어'},
  sim:{chairs:1,days:10,dayPrice:60000,mChairs:2,mPrice:900000,mOps:100000,promo:false},
  reg:{name:'',area:'',zip:'',road:'',types:['헤어'],seats:4,free:1,day:50000,month:800000,deposit:800000,ops:80000,year:9600000,photos:[],open:'10:00',close:'22:00',acc24:false,accFrom:'06:00',accTo:'23:00',dayHours:12,code:'',days:['화','수','목','금','토'],svc:['샴푸대 사용','타월·가운 세탁','와이파이'],share:false,file:'',addr:'',pyeong:20,shampoo:2,beds:2},
  adminTab:'대기' };
