# Garasiku PWA v1.1.0 — by DikodeWorks

Pengingat servis, pajak PKB, dan masa berlaku SIM. Data tersimpan **lokal** (localStorage), semua aset di-bundle
(tanpa CDN), sehingga aplikasi berjalan **offline** setelah dibuka sekali.

## 1. Coba lokal
```bash
npx serve . -l 8080        # atau: python3 -m http.server 8080
```
Buka `http://localhost:8080`. `localhost` dianggap aman sehingga service worker aktif.
Membuka `index.html` langsung (`file://`) **tidak** bisa menjadi PWA.

## 2. Deploy (wajib HTTPS)
Unggah seluruh isi folder ini (tanpa `node_modules`) ke hosting statis apa pun: Cloudflare Pages, GitHub Pages,
Netlify, atau nginx. Pastikan `sw.js`, `index.html`, dan `manifest.webmanifest` tidak di-cache lama.

- Cloudflare Pages / Netlify: file `_headers` sudah disediakan.
- nginx:
```nginx
location = /sw.js                { add_header Cache-Control "no-cache"; }
location = /index.html           { add_header Cache-Control "no-cache"; }
location = /manifest.webmanifest { default_type application/manifest+json; add_header Cache-Control "no-cache"; }
```

## 3. Cara pasang
| Platform | Langkah |
|---|---|
| Android (Chrome) | Tombol **Pasang** di banner / Pengaturan, atau menu ⋮ → Instal aplikasi |
| iPhone / iPad | Safari → **Bagikan** → **Tambah ke Layar Utama** (iOS 16.4+ juga bisa dari browser lain) |
| macOS | Safari 17+: **File → Tambahkan ke Dock**. Chrome/Edge: ikon pasang di address bar |
| Windows | Edge/Chrome: ikon pasang di address bar, atau menu ⋯ → Aplikasi → Instal |

## 4. Update aplikasi
Setelah mengubah `index.html` (atau berkas lain):
```bash
npm install      # sekali saja
npm run build    # rebuild Tailwind (css/app.css) + stempel versi baru di sw.js
```
Deploy ulang. Pengguna akan melihat toast **"Versi baru tersedia → Muat Ulang"**.
Jika lupa `npm run build`, perubahan tidak akan terdeteksi oleh service worker.

> **Cloudflare Workers/Pages:** `/index.html` di-redirect ke `/`. Karena itu `index.html` sengaja *tidak* di-precache langsung;
> halaman utama di-cache lewat `./` dan respons hasil redirect dibersihkan di `sw.template.js`. Jangan ditambahkan kembali.
> Jika browser masih menyimpan service worker lama yang rusak: DevTools → Application → Service Workers → Unregister, lalu Clear site data.

Skrip lain: `npm run vendor` (salin Chart.js/Lucide/font dari node_modules), `npm run icons` (buat ulang ikon).

## 5. Catatan data
- Data milik **satu browser + satu domain**. Ganti domain/subdomain = data tidak ikut. Pindahkan dengan Export/Import JSON.
- **iOS:** aplikasi di Layar Utama memakai penyimpanan terpisah dari Safari. Impor backup setelah memasang.
- Lakukan **Export Backup JSON** berkala (Pengaturan). Membersihkan data situs di browser akan menghapus data.

## Struktur
```
index.html            aplikasi (Tailwind class discan dari file ini)
manifest.webmanifest  identitas PWA + pintasan (Servis, Pajak, SIM)
sw.js                 service worker (HASIL BUILD — edit sw.template.js)
css/ js/ fonts/       aset lokal (Tailwind terkompilasi, Chart.js, Lucide, Open Sans, JetBrains Mono)
icons/                ikon any + maskable + apple-touch + favicon
```
