import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
const ROOT = resolve(decodeURI(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
const DIRS = ['src'];
const EXT_GLOB = '**/*.{ts,tsx,js,jsx,mjs,cjs,css}';
function formatChangedPath(filePath) {
  const parts = filePath.split(/[\\/]/).filter(Boolean);
  if (parts.length < 2) return filePath;
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}
function processFile(filePath) {
  const original = readFileSync(filePath, 'utf-8');
  const lines = original.split('\n');
  let inTemplate = false;
  let inSingleString = false;
  let inDoubleString = false;
  let inRegex = false;
  let inBlockComment = false;
  const outputLines = [];
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const wasInTemplate = inTemplate;
    let inSingleLineComment = false;
    let escapeNext = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (inSingleLineComment) {
        break;
      }
      if (inRegex) {
        if (ch === '\\') { escapeNext = true; continue; }
        if (ch === '/') { inRegex = false; }
        continue;
      }
      if (inBlockComment) {
        if (ch === '*' && line[i + 1] === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      const insideCode = inTemplate || inSingleString || inDoubleString;
      if (ch === '/' && line[i + 1] === '/' && !insideCode) {
        inSingleLineComment = true;
        i++;
        continue;
      }
      if (ch === '/' && line[i + 1] === '*' && !insideCode) {
        inBlockComment = true;
        i++;
        continue;
      }
      if (ch === '/' && line[i + 1] !== '/' && line[i + 1] !== '*' && !insideCode) {
        let k = i - 1;
        while (k >= 0 && (line[k] === ' ' || line[k] === '\t')) k--;
        if (k >= 0) {
          const prev = line[k];
          if ('(=,!?:|&[~{+-;'.includes(prev) || prev === '<' || prev === '>') {
            inRegex = true;
            continue;
          }
        }
      }
      if (ch === '\\') {
        escapeNext = true;
        continue;
      }
      if (ch === "'" && !inDoubleString && !inTemplate) {
        inSingleString = !inSingleString;
        continue;
      }
      if (ch === '"' && !inSingleString && !inTemplate) {
        inDoubleString = !inDoubleString;
        continue;
      }
      if (ch === '`' && !inSingleString && !inDoubleString) {
        inTemplate = !inTemplate;
      }
    }
    const trimmed = line.trim();
    if (trimmed.length > 0 || wasInTemplate) {
      outputLines.push(line);
    }
  }
  const result = outputLines.join('\n');
  if (result !== original) {
    writeFileSync(filePath, result, 'utf-8');
    return true;
  }
  return false;
}
async function main() {
  let totalFiles = 0;
  const changedFiles = [];
  for (const dir of DIRS) {
    const pattern = `${dir}/${EXT_GLOB}`;
    const files = await glob(pattern, { cwd: ROOT, nodir: true, dot: false });
    for (const f of files) {
      const abs = resolve(ROOT, f);
      if (processFile(abs)) changedFiles.push(formatChangedPath(f));
      totalFiles++;
    }
  }
  if (changedFiles.length === 0) {
    console.log(`Done. Processed ${totalFiles} files, changed 0`);
    return;
  }
  for (const file of changedFiles) {
    console.log(file);
  }
  console.log(`Done. Processed ${totalFiles} files, changed ${changedFiles.length}`);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});