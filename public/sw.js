const CACHE = 'startpage-v3';
const PRECACHE = [
  '/startpage/',
  '/startpage',
  '/favicon-startpage.svg',
  '/favicon.svg',
  '/fonts/HyperlegibleSans-Regular.woff2',
  '/fonts/HyperlegibleSans-Italic.woff2',
  '/fonts/HyperlegibleSans-Medium.woff2',
  '/fonts/HyperlegibleSans-MediumItalic.woff2',
  '/fonts/HyperlegibleSans-Bold.woff2',
  '/fonts/HyperlegibleSans-BoldItalic.woff2',
];
const PAGE_KEYS = ['/startpage/', '/startpage', '/startpage/index.html'];
function isPagePath(pathname) {
  return pathname === '/startpage' || pathname === '/startpage/' || pathname === '/startpage/index.html';
}
function isAssetPath(pathname) {
  return pathname.startsWith('/_astro/') || pathname.startsWith('/fonts/') || pathname === '/favicon-startpage.svg' || pathname === '/favicon.svg' || pathname === '/favicon-startpage-contrast.svg';
}
function isFaviconHost(hostname) {
  return hostname === 'www.google.com' || hostname === 'icons.duckduckgo.com';
}
function collectRefs(text, base) {
  const urls = new Set();
  for (const m of text.matchAll(/\/_astro\/[\w.-]+\.(?:js|css)/g)) urls.add(m[0]);
  for (const m of text.matchAll(/\/fonts\/[\w.-]+\.woff2/g)) urls.add(m[0]);
  for (const m of text.matchAll(/\/favicon[\w.-]*\.(?:svg|ico|png|webp)/g)) urls.add(m[0]);
  for (const m of text.matchAll(/["'](\.\/[\w.-]+)["']/g)) {
    try { urls.add(new URL(m[1], base).pathname); } catch {}
  }
  return [...urls];
}
async function store(cache, key, res) {
  const buf = await res.clone().arrayBuffer();
  await cache.put(key, new Response(buf, { status: res.status, statusText: res.statusText, headers: res.headers }));
}
async function putAndFollow(cache, url, seen) {
  const abs = new URL(url, self.location.origin);
  const key = abs.origin === self.location.origin ? abs.pathname : abs.href;
  if (seen.has(key)) return;
  seen.add(key);
  try {
    const res = await fetch(abs.href, { cache: 'reload' });
    if (!res.ok) return;
    await store(cache, key, res);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('javascript') || ct.includes('html') || abs.pathname.endsWith('.js') || isPagePath(abs.pathname)) {
      const text = await res.text();
      await Promise.all(collectRefs(text, abs.href).map((ref) => putAndFollow(cache, ref, seen)));
    }
  } catch {}
}
async function matchPage(cache) {
  for (const key of PAGE_KEYS) {
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return hit;
  }
  return undefined;
}
async function followHtml(cache, res, base) {
  try {
    const text = await res.clone().text();
    const seen = new Set();
    await Promise.all(collectRefs(text, base).map((ref) => putAndFollow(cache, ref, seen)));
  } catch {}
}
async function networkFirstPage(request, event) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request, { cache: 'reload' });
    if (res.ok) {
      const extra = Promise.all(PAGE_KEYS.map((key) => store(cache, key, res))).then(() => followHtml(cache, res, request.url));
      event.waitUntil(extra);
    }
    return res;
  } catch {
    const hit = await matchPage(cache) || await cache.match(request);
    if (hit) return hit;
    return new Response('', { status: 503, statusText: 'offline' });
  }
}
async function cacheFirst(request, storeKey) {
  const cache = await caches.open(CACHE);
  const key = storeKey || request;
  const cached = await cache.match(key);
  const refresh = fetch(request).then(async (res) => {
    if (res.ok) await store(cache, key, res);
    return res;
  }).catch(() => null);
  if (cached) {
    refresh.catch(() => {});
    return cached;
  }
  const res = await refresh;
  if (res) return res;
  return new Response('', { status: 503, statusText: 'offline' });
}
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const seen = new Set();
    await Promise.all(PRECACHE.map((u) => putAndFollow(cache, u, seen)));
    if (!(await matchPage(cache))) throw new Error('precache');
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname === '/sw.js') return;
  if (url.origin === self.location.origin && isPagePath(url.pathname)) {
    event.respondWith(networkFirstPage(event.request, event));
    return;
  }
  if (url.origin === self.location.origin && isAssetPath(url.pathname)) {
    event.respondWith(cacheFirst(event.request, url.pathname));
    return;
  }
  if (isFaviconHost(url.hostname)) {
    event.respondWith(cacheFirst(event.request));
  }
});
