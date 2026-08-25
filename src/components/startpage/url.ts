export function isUrlLike(input: string): boolean {
  const q = input.trim();
  if (!q || /\s/.test(q)) return false;
  if (/^https?:\/\//i.test(q)) {
    try { const u = new URL(q); return !!u.hostname; } catch { return false; }
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(q)) {
    try { const u = new URL(q); return !!u.hostname; } catch { return false; }
  }
  const candidate = `https://${q}`;
  try {
    const u = new URL(candidate);
    const host = u.hostname;
    if (host === "localhost") return true;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    if (/^\[.*\]$/.test(host)) return true;
    if (host.includes(".") && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return true;
    if (host.includes(".") && host.split(".").every((p) => p.length > 0)) {
      const tld = host.split(".").pop()!;
      if (tld.length >= 2) return true;
    }
    return false;
  } catch {
    return false;
  }
}
export function normalizeUrl(input: string): string {
  const q = input.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(q)) return q;
  return `https://${q}`;
}const ENGINE_PARAMS: { host: RegExp; params: string[] }[] = [
  { host: /(^|\.)google\./i, params: ['q', 'query'] },
  { host: /(^|\.)(duckduckgo)\.com$/i, params: ['q'] },
  { host: /(^|\.)bing\.com$/i, params: ['q'] },
  { host: /(^|\.)(search\.brave)\.com$/i, params: ['q'] },
  { host: /(^|\.)ecosia\.org$/i, params: ['q'] },
  { host: /(^|\.)startpage\.com$/i, params: ['query', 'q'] },
  { host: /(^|\.)qwant\.com$/i, params: ['q'] },
  { host: /(^|\.)mojeek\.com$/i, params: ['q'] },
  { host: /(^|\.)yandex\.com$/i, params: ['text'] },
  { host: /(^|\.)baidu\.com$/i, params: ['wd', 'word'] },
  { host: /(^|\.)(youtube)\.com$/i, params: ['search_query'] },
  { host: /(^|\.)(reddit)\.com$/i, params: ['q'] },
  { host: /(^|\.)(amazon)\.(com|co\.uk|de|fr|ca|co\.jp)$/i, params: ['k', 'field-keywords'] },
  { host: /(^|\.)(ebay)\.(com|co\.uk|de)$/i, params: ['_nkw'] },
  { host: /(^|\.)(wikipedia)\.org$/i, params: ['search'] },
  { host: /(^|\.)(github)\.com$/i, params: ['q'] },
  { host: /(^|\.)(stackoverflow)\.com$/i, params: ['q'] },
  { host: /(^|\.)(x|twitter)\.com$/i, params: ['q'] },
  { host: /(^|\.)(pinterest)\.(com|[a-z.]+)$/i, params: ['q'] },
  { host: /(^|\.)(etsy|aliexpress|wish|temu)\.com$/i, params: ['q', 'search'] },
];
export function extractSearchTerm(input: string): string | null {
  const raw = input.trim();
  if (!raw || /\s/.test(raw)) return null;
  let u: URL;
  try { u = new URL(raw); } catch { try { u = new URL(`https://${raw}`); } catch { return null; } }
  if (!/^https?:$/.test(u.protocol)) return null;
  const hit = ENGINE_PARAMS.find((e) => e.host.test(u.hostname));
  if (!hit) return null;
  for (const p of hit.params) {
    const v = u.searchParams.get(p);
    if (v && v.trim()) {
      const term = v.trim().replace(/\s+/g, ' ').slice(0, 200);
      if (term.length >= 2) return term;
    }
  }
  return null;
}