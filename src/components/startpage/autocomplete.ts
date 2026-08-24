const DB_NAME = 'startpage-autocomplete-v1'
const STORE = 'entries'
const META = 'meta'
const DB_VERSION = 2
const NORM_KEY = 'url-norm-v1'
type Kind = 'search' | 'url'
export type Entry = { term: string; kind: Kind; count: number; lastUsed: number }
type SuggestItem = { term: string; kind: Kind; score: number }
type Idx = { term: string; lower: string; kind: Kind; count: number; lastUsed: number }
let idx: Idx[] = []
let ready = false
let booting: Promise<void> | null = null
function cmp(a: Idx, b: Idx) { return a.lower < b.lower ? -1 : a.lower > b.lower ? 1 : 0 }
function toIdx(e: Entry): Idx { return { ...e, lower: e.term.toLowerCase() } }
function lowerBound(lower: string): number {
  let lo = 0
  let hi = idx.length
  while (lo < hi) { const mid = (lo + hi) >> 1; if (idx[mid].lower < lower) lo = mid + 1; else hi = mid }
  return lo
}
function idxUpsert(e: Entry) {
  const item = toIdx(e)
  const i = lowerBound(item.lower)
  if (i < idx.length && idx[i].lower === item.lower && idx[i].term === item.term) { idx[i] = item; return }
  idx.splice(i, 0, item)
}
export function bootAutocomplete(): Promise<void> {
  if (ready) return Promise.resolve()
  if (!booting) {
    booting = (async () => {
      try {
        const db = await openDB()
        const all = await new Promise<Entry[]>((resolve, reject) => {
          const tx = db.transaction(STORE, 'readonly')
          const rq = tx.objectStore(STORE).getAll()
          rq.onsuccess = () => resolve(rq.result as Entry[])
          rq.onerror = () => reject(rq.error)
        })
        let final = all
        if ((await readMeta(db)) !== NORM_KEY) {
          final = mergeEntries(all)
          await rewriteEntries(db, final)
          await writeMeta(db, NORM_KEY)
        }
        idx = final.map(toIdx).sort(cmp)
        db.close()
      } catch {}
      ready = true
    })()
  }
  return booting
}
function normText(term: string): string {
  const t = (term ?? '').trim()
  if (!t || /^file:/i.test(t)) return ''
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) {
    const u = t.slice(t.indexOf('://') + 3).replace(/^www\./i, '').replace(/\/+$/, '')
    return u || t
  }
  return t.replace(/\/+$/, '')
}
function mergeEntries(all: Entry[]): Entry[] {
  const byKey = new Map<string, Entry>()
  for (const e of all) {
    const text = normText(e.term)
    if (!text || text.length < 2) continue
    const key = text.toLowerCase()
    const cur = byKey.get(key)
    if (!cur) byKey.set(key, { term: text, kind: e.kind, count: e.count, lastUsed: e.lastUsed })
    else {
      cur.count += e.count
      cur.lastUsed = Math.max(cur.lastUsed, e.lastUsed)
      if (cur.kind === 'url' && e.kind === 'search') cur.kind = 'search'
    }
  }
  return [...byKey.values()]
}
async function readMeta(db: IDBDatabase): Promise<unknown> {
  return new Promise((resolve) => {
    const tx = db.transaction(META, 'readonly')
    const rq = tx.objectStore(META).get('norm')
    rq.onsuccess = () => resolve(rq.result)
    rq.onerror = () => resolve(undefined)
  })
}
async function writeMeta(db: IDBDatabase, value: unknown) {
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META, 'readwrite')
    tx.objectStore(META).put(value, 'norm')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
async function rewriteEntries(db: IDBDatabase, entries: Entry[]) {
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.clear()
    for (const e of entries) store.put(e)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'))
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'term' })
        s.createIndex('lastUsed', 'lastUsed')
        s.createIndex('kind', 'kind')
      }
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>): Promise<T> {
  const db = await openDB()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const store = tx.objectStore(STORE)
    let req: any
    try { req = fn(store) } catch (e) { db.close(); reject(e); return }
    const isRequest = req && typeof req.onsuccess !== 'undefined'
    if (isRequest) {
      req.onsuccess = () => { resolve(req.result as T); db.close() }
      req.onerror = () => { reject(req.error); db.close() }
    } else {
      ;(req as Promise<T>).then((v) => { resolve(v); db.close() }).catch((e) => { reject(e); db.close() })
    }
    tx.onerror = () => reject(tx.error)
  })
}
export async function recordTerm(raw: string, kind: Kind) {
  const term = raw.trim()
  if (!term || term.startsWith('!')) return
  if (term.length > 200) return
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      const get = store.get(term)
      get.onsuccess = () => {
        const existing = get.result as Entry | undefined
        const next: Entry = existing
          ? { term, kind: kind === 'url' ? 'url' : existing.kind, count: existing.count + 1, lastUsed: Date.now() }
          : { term, kind, count: 1, lastUsed: Date.now() }
        store.put(next)
        idxUpsert(next)
      }
      get.onerror = () => reject(get.error)
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onerror = () => { db.close(); reject(tx.error) }
    })
  } catch {}
}
export function suggestSync(prefix: string, limit = 6): SuggestItem[] {
  const q = prefix.trim().toLowerCase()
  if (!q || !ready) return []
  const now = Date.now()
  const cands: Idx[] = []
  for (let i = lowerBound(q); i < idx.length && idx[i].lower.startsWith(q); i++) cands.push(idx[i])
  if (cands.length < limit) {
    let scanned = 0
    for (const e of idx) {
      if (cands.length >= 64 || ++scanned > 30000) break
      if (!e.lower.startsWith(q) && e.lower.includes(q)) cands.push(e)
    }
  }
  return cands
    .map((e) => ({ term: e.term, kind: e.kind, score: e.count * 2 * (e.lower.startsWith(q) ? 2 : 1) + Math.max(0, 1 - (now - e.lastUsed) / 2592000000) + (e.kind === 'url' ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
export async function importTerms(items: { term: string; kind?: Kind }[]): Promise<number> {
  const now = Date.now()
  const batch = new Map<string, { term: string; kind: Kind; n: number }>()
  for (const it of items) {
    const term = normText(it?.term)
    if (term.length < 2 || term.length > 200 || term.startsWith('!')) continue
    const key = term.toLowerCase()
    const cur = batch.get(key)
    if (cur) cur.n++
    else batch.set(key, { term, kind: it.kind === 'url' ? 'url' : 'search', n: 1 })
  }
  if (!batch.size) return 0
  await bootAutocomplete()
  const byLower = new Map(idx.map((e) => [e.lower, e]))
  const writes: Entry[] = []
  let fresh = 0
  for (const { term, kind, n } of batch.values()) {
    const lower = term.toLowerCase()
    const ex = byLower.get(lower)
    if (ex) { ex.count += n; writes.push({ term: ex.term, kind: ex.kind, count: ex.count, lastUsed: ex.lastUsed }) }
    else { fresh++; const entry: Entry = { term, kind, count: n, lastUsed: now }; writes.push(entry); byLower.set(lower, toIdx(entry)) }
  }
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      for (const w of writes) store.put(w)
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onerror = () => { db.close(); reject(tx.error) }
    })
  } catch { return 0 }
  idx = [...byLower.values()].sort(cmp)
  return fresh
}
export async function removeTerm(term: string) {
  try {
    await withStore('readwrite', (s) => s.delete(term))
    const i = lowerBound(term.toLowerCase())
    if (i < idx.length && idx[i].term === term) idx.splice(i, 1)
  } catch {}
}
export async function clearAll() {
  try {
    await withStore('readwrite', (s) => s.clear())
    idx = []
  } catch {}
}
export async function getAllTerms(): Promise<Entry[]> {
  await bootAutocomplete()
  return idx.map((e) => ({ term: e.term, kind: e.kind, count: e.count, lastUsed: e.lastUsed }))
}