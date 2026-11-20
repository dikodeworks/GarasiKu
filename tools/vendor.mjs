// Menyalin library & font dari node_modules ke folder aplikasi (agar tanpa CDN).
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('js', { recursive: true });
mkdirSync('fonts', { recursive: true });
mkdirSync('css', { recursive: true });

copyFileSync('node_modules/chart.js/dist/chart.umd.min.js', 'js/chart.umd.min.js');
copyFileSync('node_modules/lucide/dist/umd/lucide.min.js', 'js/lucide.min.js');

const faces = [];
const add = (pkg, family, weights) => {
  for (const w of weights) {
    const file = `${pkg}-latin-${w}-normal.woff2`;
    copyFileSync(`node_modules/@fontsource/${pkg}/files/${file}`, `fonts/${file}`);
    faces.push(`@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(../fonts/${file}) format('woff2')}`);
  }
};
add('open-sans', 'Open Sans', [400, 500, 600, 700, 800]);
add('jetbrains-mono', 'JetBrains Mono', [400, 500, 600]);
writeFileSync('css/fonts.css', faces.join('\n') + '\n');
console.log('vendor OK');
