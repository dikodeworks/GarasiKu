/* Garasiku service worker — di-generate oleh build.mjs (jangan edit sw.js langsung, edit sw.template.js).
 * Strategi: seluruh aplikasi di-precache per versi (cache-first) sehingga 100% jalan offline.
 * Versi baru = cache baru; pengguna diberi toast "Muat Ulang" sebelum berganti versi. */
const VERSION = '__VERSION__';
const CACHE = 'garasiku-' + VERSION;
const PRECACHE = __PRECACHE__;
const INDEX = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('garasiku-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigasi (termasuk ?tab=... dan ?source=pwa) selalu dilayani dari index.html di cache
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match(INDEX);
      if (cached) return cached;
      try { return await fetch(req); } catch (e) { return Response.error(); }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    } catch (e) {
      return Response.error();
    }
  })());
});
