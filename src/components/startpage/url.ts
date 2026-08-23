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
}