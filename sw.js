// Service worker: la app siempre intenta traer la versión nueva (red primero)
// y solo usa la copia guardada si no hay internet. No toca Firebase/Firestore.
const CACHE='planificador-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return; // Firebase, fuentes, etc. pasan directo
  e.respondWith(
    fetch(r).then(res=>{
      if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(ch=>ch.put(r,c));}
      return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match('./')||caches.match('index.html')))
  );
});
