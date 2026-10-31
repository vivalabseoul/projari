/* 시작: 주소에 #역할-탭 이 있으면 그 화면으로, admin.html 은 관리자 화면으로 엽니다 */
document.getElementById('brand').textContent=CONFIG.name;
const bootView = () => '<div class="boot" role="status" aria-live="polite"><span class="spin" aria-hidden="true"></span><p>'+(window.START?'관리자 화면을 준비하고 있습니다…':'불러오는 중…')+'</p><div class="sk" aria-hidden="true"><i></i><i></i><i></i></div></div>';
(async()=>{
  if(LIVE){
    $('#view').innerHTML=bootView();
    if(typeof supabase==='undefined'){ BOOTING=false; $('#view').innerHTML='<section class="panel empty">서버 연결 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.</section>'; return; }
    await liveBoot();
    BOOTING=false;
    S.form.start=addDays(TODAY,7);
  }
  loadLocal();
  if(!openFromHash() && window.START){ S.role=window.START.role; S.tab[S.role]=window.START.tab; }
  render();
  showPopups();
})();
