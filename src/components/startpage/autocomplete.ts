const DB_NAME = 'startpage-autocomplete-v1'
const STORE = 'entries'
const DB_VERSION = 1
type Kind = 'search' | 'url'
export type Entry = { term: string; kind: Kind; count: number; lastUsed: number }
type SuggestItem = { term: string; kind: Kind; score: number }
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
      }
      get.onerror = () => reject(get.error)
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onerror = () => { db.close(); reject(tx.error) }
    })
  } catch {}
}
export async function getSuggestions(prefix: string, limit = 6): Promise<SuggestItem[]> {
  const q = prefix.trim().toLowerCase()
  if (!q) return []
  try {
    const all = await withStore<Entry[]>('readonly', (store) => {
      return new Promise<Entry[]>((resolve, reject) => {
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result as Entry[])
        req.onerror = () => reject(req.error)
      }) as any
    })
    const now = Date.now()
    const filtered = all
      .filter((e) => e.term.toLowerCase().startsWith(q) || e.term.toLowerCase().includes(q))
      .map((e) => {
        const starts = e.term.toLowerCase().startsWith(q) ? 2 : 1
        const recency = Math.max(0, 1 - (now - e.lastUsed) / (30 * 24 * 3600 * 1000))
        const score = e.count * 2 * starts + recency * 3 + (e.kind === 'url' ? 0.5 : 0)
        return { term: e.term, kind: e.kind, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    return filtered
  } catch { return [] }
}
export async function removeTerm(term: string) {
  try { await withStore('readwrite', (s) => s.delete(term)) } catch {}
}
export async function clearAll() {
  try { await withStore('readwrite', (s) => s.clear()) } catch {}
}
export async function getAllTerms(): Promise<Entry[]> {
  try { return await withStore('readonly', (s: any) => s.getAll()) } catch { return [] }
}