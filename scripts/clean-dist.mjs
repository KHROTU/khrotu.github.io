import { readFileSync, readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, sep, posix } from 'node:path';
const distDir = 'dist';
const htmlFiles = [];
const jsFiles = [];
const cssFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith('.html')) htmlFiles.push(p);
    else if (p.endsWith('.js')) jsFiles.push(p);
    else if (p.endsWith('.css')) cssFiles.push(p);
  }
}
walk(distDir);
function toPosixRelative(p) {
  return p.split(sep).join(posix.sep).replace(/^dist\//, '');
}
const referencedJs = new Set();
const referencedCss = new Set();
for (const html of htmlFiles) {
  const content = readFileSync(html, 'utf-8');
  for (const m of content.matchAll(/(?:src|href)="(\/_astro\/[^"]+\.(?:js|css))"/g)) {
    const ref = m[1].replace(/^\//, '').split('/').join(posix.sep);
    if (ref.endsWith('.js')) referencedJs.add(ref);
    else referencedCss.add(ref);
  }
}
const removed = new Set();
for (const js of jsFiles) {
  const rel = toPosixRelative(js);
  if (referencedJs.has(rel)) continue;
  if (!existsSync(js)) continue;
  const content = readFileSync(js, 'utf-8');
  const base = js.split(/[\\/]/).pop();
  let isReferenced = false;
  for (const other of jsFiles) {
    if (other === js || removed.has(other)) continue;
    if (!existsSync(other)) continue;
    const otherContent = readFileSync(other, 'utf-8');
    if (otherContent.includes(base)) {
      isReferenced = true;
      break;
    }
  }
  if (!isReferenced) {
    console.log(`  remove unreferenced js: ${js}`);
    unlinkSync(js);
    removed.add(js);
  }
}
for (const css of cssFiles) {
  const rel = toPosixRelative(css);
  if (referencedCss.has(rel)) continue;
  if (!existsSync(css)) continue;
  console.log(`  remove unreferenced css: ${css}`);
  unlinkSync(css);
}