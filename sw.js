// Service worker: يخلّي الموقع يشتغل بدون إنترنت بعد أول زيارة.
// الصفحة: الشبكة أولاً (عشان التحديثات تظهر فوراً)، ولو مفيش نت بنفتح النسخة المحفوظة.
// الخطوط ومكتبة Supabase: بتتحفظ أول مرة. طلبات قاعدة البيانات عمرها ما بتتحفظ.
const CACHE = 'bsma-shell-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
const okToCache = res => res && (res.status === 200 || res.type === 'opaque');
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co')) return;
  const same = u.origin === location.origin;
  const lib = /fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/.test(u.hostname);
  if (!same && !lib) return;
  if (same) {
    e.respondWith(
      fetch(r).then(res => { if (okToCache(res) && !res.redirected) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
        .catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./') : undefined)))
    );
  } else {
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => { if (okToCache(res)) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }))
    );
  }
});
