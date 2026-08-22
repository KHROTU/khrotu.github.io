const KEY = 'startpage-command-usage-v1';
type Usage = Record<string, number>;
function load(): Usage {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}
export function recordUse(name: string) {
  const u = load();
  u[name] = (u[name] ?? 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(u));
  } catch {}
}
export function usageCount(name: string): number {
  return load()[name] ?? 0;
}