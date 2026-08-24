export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function timedFetch(input: string, ms = 3000): Promise<Response> {
  if (!navigator.onLine) {
    await delay(ms);
    throw new TypeError('offline');
  }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(input, { signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}