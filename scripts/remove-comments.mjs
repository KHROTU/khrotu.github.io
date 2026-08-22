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
  function unclosedQuotes(line, col) {
    let dq = 0, sq = 0, bt = 0;
    for (let j = 0; j < col; j++) {
      if (line[j] === '\\') { j++; continue; }
      if (line[j] === '"') dq++;
      if (line[j] === "'") sq++;
      if (line[j] === '`') bt++;
    }
    return (dq % 2 === 1) || (sq % 2 === 1) || (bt % 2 === 1);
  }
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const startedInBlock = inBlockComment;
    let inSingleLineComment = false;
    let escapeNext = false;
    let keepLeftOf = 0;
    let nonCommentPrefix = -1;
    let nonCommentSuffixCol = -1;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (inSingleLineComment) {
        if (keepLeftOf === 0 && nonCommentPrefix === -1) {
          keepLeftOf = -1;
        }
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
          nonCommentSuffixCol = i + 1;
        }
        continue;
      }
      const insideCode = inTemplate || inSingleString || inDoubleString;
      if (ch === '/' && line[i + 1] === '/' && !insideCode) {
        if (unclosedQuotes(line, i)) continue;
        if (i > 0 && line[i - 1] === ':') continue;
        if (line.slice(i + 2).trimStart().startsWith('nodel')) break;
        const prev = line.slice(0, i);
        keepLeftOf = prev.trim() ? i : 0;
        inSingleLineComment = true;
        i++;
        continue;
      }
      if (ch === '/' && line[i + 1] === '*' && !insideCode) {
        if (unclosedQuotes(line, i)) continue;
        inBlockComment = true;
        if (!startedInBlock && keepLeftOf === 0) {
          nonCommentPrefix = i;
        }
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
    if (keepLeftOf === -1) continue;
    if (startedInBlock && nonCommentSuffixCol === -1 && !inBlockComment) {
      continue;
    }
    if (inBlockComment && nonCommentPrefix >= 0) {
      const kept = line.slice(0, nonCommentPrefix);
      if (kept.trim().length > 0) outputLines.push(kept);
      continue;
    }
    if (inBlockComment && nonCommentPrefix < 0) {
      continue;
    }
    if (!startedInBlock && nonCommentPrefix >= 0 && nonCommentSuffixCol >= 0) {
      const prefix = line.slice(0, nonCommentPrefix);
      const suffix = line.slice(nonCommentSuffixCol);
      const joined = (prefix + suffix).trim();
      if (joined.length > 0) outputLines.push(joined);
      continue;
    }
    if (startedInBlock && nonCommentSuffixCol >= 0) {
      const suffix = line.slice(nonCommentSuffixCol);
      if (suffix.trim().length > 0) outputLines.push(suffix);
      continue;
    }
    if (keepLeftOf > 0) {
      const kept = line.slice(0, keepLeftOf);
      if (kept.trim().length > 0) outputLines.push(kept);
      continue;
    }
    outputLines.push(line);
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