/* Garasiku service worker — di-generate oleh build.mjs (jangan edit sw.js langsung, edit sw.template.js).
 * Strategi: seluruh aplikasi di-precache per versi (cache-first) sehingga 100% jalan offline.
 * Versi baru = cache baru; pengguna diberi toast "Muat Ulang" sebelum berganti versi.
 *
 * Catatan hosting (Cloudflare Workers/Pages): "/index.html" di-redirect ke "/". Respons hasil redirect
 * TIDAK boleh dipakai untuk menjawab navigasi (browser menolak -> halaman gagal dibuka setelah refresh),
 * jadi halaman utama hanya di-cache lewat "./" dan semua respons "redirected" dibersihkan dulu. */
const VERSION = '__VERSION__';
const CACHE = 'garasiku-' + VERSION;
const PRECACHE = __PRECACHE__;
const ROOT = new URL('./', self.registration.scope).href;

// Salin respons agar flag `redirected` hilang (aman dipakai untuk navigasi)
async function clean(res) {
  if (!res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (url) => {
      const req = new Request(url, { cache: 'reload' });
      const res = await fetch(req);
      if (!res.ok) throw new Error('Precache gagal: ' + url + ' (' + res.status + ')');
      await cache.put(req, await clean(res));
    }));
  })());
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

  // Navigasi (termasuk ?tab=... dan ?source=pwa) selalu dilayani dari halaman utama di cache
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match(ROOT, { ignoreSearch: true });
      if (cached) return cached;
      try { return await clean(await fetch(req)); } catch (e) { return Response.error(); }
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
