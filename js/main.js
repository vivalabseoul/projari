/* 시작: 주소에 #역할-탭 이 있으면 그 화면으로, admin.html 은 관리자 화면으로 엽니다 */
document.getElementById('brand').textContent=CONFIG.name;
if(!openFromHash() && window.START){ S.role=window.START.role; S.tab[S.role]=window.START.tab; }
render();
