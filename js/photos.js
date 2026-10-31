/* ===== 매장 사진: 최대 장수·용량 제한, 초과 용량은 브라우저에서 축소 ===== */
const readURL = blob => new Promise((ok,no)=>{ const fr=new FileReader(); fr.onload=()=>ok(fr.result); fr.onerror=no; fr.readAsDataURL(blob); });
const loadImg = url => new Promise((ok,no)=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=no; im.src=url; });
const toBlob = (c,q) => new Promise(ok=>c.toBlob(ok,'image/jpeg',q));
async function fitPhoto(file){
  const limit=CONFIG.photo.maxKB*1024;
  if(file.size<=limit) return {url:await readURL(file), kb:file.size/1024};
  const im=await loadImg(await readURL(file));
  let side=1600;
  for(let round=0; round<6; round++){
    const k=Math.min(1, side/Math.max(im.naturalWidth,im.naturalHeight));
    const c=document.createElement('canvas'); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    for(const q of [0.82,0.7,0.58,0.46]){ const b=await toBlob(c,q); if(b&&b.size<=limit) return {url:await readURL(b), kb:b.size/1024, shrunk:true}; }
    side=Math.round(side*0.75);
  }
  return null;
}
document.addEventListener('change', async e=>{
  const el=e.target; if(!el.dataset || el.dataset.photos===undefined) return;
  const room=CONFIG.photo.max-S.reg.photos.length, files=[...el.files];
  if(!files.length) return;
  if(files.length>room) toast(`사진은 최대 ${CONFIG.photo.max}장입니다. 앞의 ${room}장만 올립니다`);
  let shrunk=0, failed=0;
  for(const f of files.slice(0,room)){
    if(!f.type.startsWith('image/')){ failed++; continue; }
    try{ const r=await fitPhoto(f); if(r){ S.reg.photos.push(r); if(r.shrunk) shrunk++; } else failed++; }catch(_){ failed++; }
  }
  render(); document.getElementById('r-photos')?.focus();
  if(failed) toast(`${failed}장은 ${CONFIG.photo.maxKB}KB 이하로 줄이지 못해 제외했습니다. 다른 사진을 골라 주세요`);
  else if(shrunk) toast(`${shrunk}장을 ${CONFIG.photo.maxKB}KB 이하로 줄여 올렸습니다`);
});
