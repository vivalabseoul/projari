/* ===== 운영 연결 설정 =====
   Supabase 프로젝트의 URL 과 anon(공개) 키를 넣으면 '운영 모드'로 동작합니다.
   (Project Settings → API 에서 확인. anon 키는 공개되어도 되는 키입니다. service_role 키는 절대 넣지 마세요.)
   비워 두면 기존처럼 예시 데이터로 보는 '시연 모드'로 열립니다. */
window.ENV = {
  SUPABASE_URL: "https://xssviypcxyviqslgmeqb.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc3ZpeXBjeHl2aXFzbGdtZXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTQ3OTYsImV4cCI6MjEwODk5MDc5Nn0.5WltBI5fw08Da_WpdX00ASNGlpxI5KXIoOZFZTGsCKg",
};
const LIVE = !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
const todayKST = () =>
  new Date(Date.now() + 9 * 3600e3)
    .toISOString()
    .slice(0, 10); /* 한국 날짜 기준 오늘 */
