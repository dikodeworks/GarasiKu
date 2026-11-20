// Membuat semua ikon PWA (PNG + SVG): wordmark "GarasiKu." di atas latar putih.
// Teks dikonversi jadi path (opentype.js) sehingga hasilnya sama di semua mesin tanpa perlu font terpasang.
import sharp from 'sharp';
import opentype from 'opentype.js';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
mkdirSync('icons', { recursive: true });

const INK = '#141414', RED = '#D63333', BG = '#FFFFFF', BORDER = '#E5E5E5';
const buf = readFileSync('node_modules/@fontsource/open-sans/files/open-sans-latin-800-normal.woff');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const adv = (t, s) => font.getAdvanceWidth(t, s);
const path = (t, x, y, s, fill) => `<path d="${font.getPath(t, x, y, s).toPathData(2)}" fill="${fill}"/>`;

// Dua baris, rata tengah:  "Garasi" / "Ku."  (titik merah seperti logo di header)
function wordmark(targetWidth) {
  const unit = 100;
  const w1 = adv('Garasi', unit);
  const size = unit * targetWidth / w1;               // baris terlebar = targetWidth
  const cap = font.tables.os2.sCapHeight / font.unitsPerEm * size;
  const lineGap = cap * 1.28;
  const totalH = cap + lineGap;
  const top = 256 - totalH / 2 + cap;                 // baseline baris 1
  const x1 = 256 - adv('Garasi', size) / 2;
  const w2 = adv('Ku', size) + adv('.', size);
  const x2 = 256 - w2 / 2;
  return path('Garasi', x1, top, size, INK) +
         path('Ku', x2, top + lineGap, size, INK) +
         path('.', x2 + adv('Ku', size), top + lineGap, size, RED);
}

const svg = (inner, rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect ${rounded ? 'x="3" y="3" width="506" height="506" rx="112"' : 'width="512" height="512"'} fill="${BG}"${rounded ? ` stroke="${BORDER}" stroke-width="6"` : ''}/>
  ${inner}
</svg>`;

// Monogram "G." untuk favicon (wordmark penuh tidak terbaca di 16–32 px)
function monogram() {
  const size = 330;
  const wG = adv('G', size), wD = adv('.', size);
  const x = 256 - (wG + wD) / 2;
  const cap = font.tables.os2.sCapHeight / font.unitsPerEm * size;
  const y = 256 + cap / 2;
  return path('G', x, y, size, INK) + path('.', x + wG, y, size, RED);
}

const png = (markup, size, file) =>
  sharp(Buffer.from(markup)).resize(size, size).png({ compressionLevel: 9 }).toFile(`icons/${file}`);

writeFileSync('icons/favicon.svg', svg(monogram(), true));
await png(svg(wordmark(350), true), 192, 'icon-192.png');
await png(svg(wordmark(350), true), 512, 'icon-512.png');
await png(svg(wordmark(290), false), 512, 'icon-maskable-512.png'); // zona aman maskable (lingkaran 80%)
await png(svg(wordmark(330), false), 180, 'apple-touch-icon.png');  // iOS: tanpa transparansi
await png(svg(monogram(), true), 32, 'favicon-32.png');
console.log('icons OK');
