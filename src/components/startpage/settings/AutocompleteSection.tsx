import { useEffect, useMemo, useRef, useState } from 'react';
import { clearAll as clearAutocomplete, getAllTerms, importTerms, removeTerm, type Entry } from '../autocomplete';
import { extractSearchTerm, isUrlLike } from '../url';
import Section from './Section';
import { ghostBtn, hintText, inputField, linkBtn, rowLabel } from './typography';
const ROW_H = 30;
const OVERSCAN = 8;
function VirtualList({ items, onRemove }: { items: Entry[]; onRemove: (term: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ start: 0, end: 48 });
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
    setView({ start: 0, end: 48 });
  }, [items]);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const start = Math.max(0, Math.floor(el.scrollTop / ROW_H) - OVERSCAN);
    const end = Math.min(items.length, start + Math.ceil(el.clientHeight / ROW_H) + OVERSCAN * 2);
    setView((v) => (v.start === start && v.end === end ? v : { start, end }));
  };
  return (
    <div ref={ref} onScroll={onScroll} className="overflow-y-auto overflow-x-hidden border border-white/10 rounded-sm" style={{ height: 264 }}>
      <div style={{ height: items.length * ROW_H, position: 'relative' }}>
        {items.slice(view.start, view.end).map((term, i) => (
          <div key={term.term} className="absolute left-0 right-0 flex items-center justify-between gap-2 px-2 text-xs" style={{ top: (view.start + i) * ROW_H, height: ROW_H }}>
            <span className="truncate text-[var(--text-muted)]">{term.term}</span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-[var(--text-muted)]/60">{term.count}×</span>
              <button onClick={() => onRemove(term.term)} className={linkBtn}>remove</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
type Props = { openIds: Set<string>; toggle: (id: string) => void };
type SourceId = 'firefox-forms' | 'firefox-history' | 'chromium';
const SOURCES: { id: SourceId; label: string; sql: string; file: string }[] = [
  { id: 'firefox-forms', label: 'firefox', sql: 'SELECT value, timesUsed FROM moz_formhistory', file: '%APPDATA%/Mozilla/Firefox/Profiles/<profile>/formhistory.sqlite' },
  { id: 'firefox-history', label: 'firefox history', sql: 'SELECT url, visit_count FROM moz_places WHERE hidden = 0 AND visit_count > 0 ORDER BY last_visit_date DESC LIMIT 200000', file: '%APPDATA%/Mozilla/Firefox/Profiles/<profile>/places.sqlite' },
  { id: 'chromium', label: 'chromium (chrome, brave, vivaldi...)', sql: "SELECT value, count FROM autofill WHERE count > 0", file: '<browser> User Data/<profile>/Web Data' },
];
const FS_DB = 'startpage-fs';
function fsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const rq = indexedDB.open(FS_DB, 1);
    rq.onupgradeneeded = () => { if (!rq.result.objectStoreNames.contains('handles')) rq.result.createObjectStore('handles', { keyPath: 'id' }); };
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
  });
}
async function savedHandle(id: string): Promise<any> {
  try {
    const db = await fsDb();
    const rec = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction('handles', 'readonly');
      const g = tx.objectStore('handles').get(id);
      g.onsuccess = () => resolve(g.result);
      g.onerror = () => reject(g.error);
    });
    db.close();
    return rec?.handle ?? null;
  } catch { return null; }
}
async function rememberHandle(id: string, handle: any) {
  try {
    const db = await fsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put({ id, handle });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {}
}
async function readSqlite(file: File): Promise<Uint8Array> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const magic = 'SQLite format 3';
  for (let i = 0; i < magic.length; i++) if (buf[i] !== magic.charCodeAt(i)) throw new Error('not a sqlite database');
  return buf;
}
async function obtainFile(source: (typeof SOURCES)[number]): Promise<File> {
  const w = window as any;
  const want = source.file.split('/').pop() as string;
  const saved = await savedHandle(source.id);
  if (saved) {
    try {
      let perm = await saved.queryPermission({ mode: 'read' });
      if (perm !== 'granted') perm = await saved.requestPermission({ mode: 'read' });
      if (perm === 'granted') return await saved.getFile();
    } catch {}
  }
  const dot = want.lastIndexOf('.');
  if (typeof w.showOpenFilePicker === 'function') {
    const opts: any = { multiple: false, startIn: 'downloads' };
    if (dot > 0) {
      opts.types = [{ description: want, accept: { 'application/octet-stream': [want.slice(dot)] } }];
      opts.excludeAcceptAllOption = true;
    }
    const [handle] = await w.showOpenFilePicker(opts);
    await rememberHandle(source.id, handle);
    return await handle.getFile();
  }
  return new Promise<File>((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (dot > 0) input.accept = want.slice(dot);
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) resolve(f);
      else reject(Object.assign(new Error('no file chosen'), { name: 'AbortError' }));
    };
    input.click();
  });
}
async function parseHistory(data: Uint8Array, sql: string): Promise<unknown[][]> {
  const initSqlJs = (await import('sql.js')).default;
  let SQL: any;
  try {
    SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
  } catch {
    const buf = await (await fetch('/sql-wasm.wasm')).arrayBuffer();
    SQL = await initSqlJs({ wasmBinary: buf });
  }
  const db = new SQL.Database(data);
  try {
    const stmt = db.prepare(sql);
    const rows: unknown[][] = [];
    while (stmt.step()) rows.push(stmt.get());
    stmt.free();
    return rows;
  } catch (err) {
    let detail = '';
    try { detail = String(db.exec("SELECT group_concat(name, ', ') FROM sqlite_master WHERE type='table'")[0]?.values[0]?.[0] ?? ''); } catch {}
    throw new Error(detail ? detail.slice(0, 120) : String((err as Error)?.message ?? err));
  } finally { db.close(); }
}
export default function AutocompleteSection({ openIds, toggle }: Props) {
  const [terms, setTerms] = useState<Entry[]>([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => { if (open) getAllTerms().then(setTerms); }, [open]);
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => t.term.toLowerCase().includes(q));
  }, [terms, filter]);
  const doImport = async (source: (typeof SOURCES)[number]) => {
    if (busy) return;
    setBusy(true);
    try {
      setStatus(`${source.label}: reading…`);
      const file = await obtainFile(source);
      const data = await readSqlite(file);
      const rows = await parseHistory(data, source.sql);
      let extracted = 0;
      const items = rows
        .map((r) => {
          const raw = String(r[0] ?? '');
          const term = extractSearchTerm(raw) ?? raw;
          if (term !== raw) extracted++;
          return { term, count: typeof r[1] === 'number' ? r[1] : 1 };
        })
        .filter((it) => it.term.trim().length >= 2)
        .map((it) => ({ ...it, kind: (isUrlLike(it.term) ? 'url' : 'search') as 'url' | 'search' }));
      const added = items.length ? await importTerms(items) : 0;
      setStatus(
        !items.length
          ? `${source.label}: no rows in ${file.name}; empty table or wrong profile's file`
          : added
            ? `${source.label}: added ${added} new terms from ${rows.length} rows (${extracted} search terms)`
            : `${source.label}: all ${items.length} rows already known`
      );
    } catch (err) {
      const e = err as any;
      if (e?.name === 'AbortError') setStatus('');
      else setStatus(`couldn't import ${source.label}; close the browser fully and retry (${e?.message ?? 'error'})`);
    } finally {
      setBusy(false);
    }
    if (open) getAllTerms().then(setTerms);
  };
  return (
    <Section id="autocomplete" title="autocomplete" openIds={openIds} toggle={toggle}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={rowLabel}>local history</span>
          <button onClick={() => setOpen((value) => !value)} className={ghostBtn}>{open ? 'hide' : 'manage'}</button>
        </div>
        <p className={hintText}>stores your past search terms locally in idb for prefix suggestions.</p>
        <div className="flex flex-col gap-1">
          <span className={rowLabel}>import history</span>
          <div className="flex flex-col gap-1">
            {SOURCES.map((source) => (
              <div key={source.id} className="flex items-center justify-between gap-2">
                <span className="flex flex-col min-w-0 leading-tight">
                  <span className="text-xs text-[var(--text-main)] truncate">{source.label}</span>
                  <span className={hintText + ' truncate'}>{source.file.split('/').pop()}</span>
                </span>
                <button disabled={busy} title={source.file} onClick={() => doImport(source)} className={ghostBtn + ' shrink-0'}>import</button>
              </div>
            ))}
          </div>
          <p className={hintText}>move the file somewhere convenient, in a folder without system files.</p>
          {status && <p className={hintText}>{status}</p>}
        </div>
        {open && (
          <div className="flex flex-col gap-2">
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`filter ${terms.length} terms…`} className={inputField} />
            {filtered.length === 0 ? (
              <span className={hintText}>{terms.length ? 'nothing matches that filter' : 'no history yet'}</span>
            ) : (
              <VirtualList items={filtered} onRemove={async (term) => { await removeTerm(term); setTerms((current) => current.filter((item) => item.term !== term)); }} />
            )}
            {terms.length > 0 && <button onClick={async () => { await clearAutocomplete(); setTerms([]); setFilter(''); }} className={ghostBtn + ' w-fit'}>clear all</button>}
          </div>
        )}
      </div>
    </Section>
  );
}