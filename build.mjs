// Menghasilkan sw.js dari sw.template.js: daftar precache otomatis + versi = hash isi file.
// Jalankan setiap selesai mengubah file aplikasi:  npm run build
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = ['index.html', 'manifest.webmanifest', ...['css', 'js', 'fonts', 'icons'].flatMap(walk)]
  .map((f) => f.replace(/\\/g, '/')).sort();

const hash = createHash('sha1');
for (const f of files) { hash.update(f); hash.update(readFileSync(f)); }
const version = hash.digest('hex').slice(0, 10);

const sw = readFileSync('sw.template.js', 'utf8')
  .replace('__VERSION__', version)
  .replace('__PRECACHE__', JSON.stringify(['./', ...files], null, 2));
writeFileSync('sw.js', sw);
console.log(`sw.js dibuat — versi ${version}, ${files.length + 1} berkas di-precache`);
