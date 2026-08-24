const CACHE = 'startpage-v5';
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
function later(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function emptyIcon() {
  return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' } });
}
function isReload(request) {
  return request.cache === 'reload' || request.headers.get('Cache-Control') === 'max-age=0';
}
async function updatePage(cache, res, url) {
  await Promise.all(PAGE_KEYS.map((key) => store(cache, key, res)));
  await followHtml(cache, res, url);
}
function fetchPage(request) {
  return fetch(request, { cache: 'reload' });
}
async function pageResponse(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await matchPage(cache) || await cache.match(request);
  const net = fetchPage(request).then((res) => {
    if (res.ok) event.waitUntil(updatePage(cache, res, request.url));
    return res;
  });
  if (!cached) {
    const raced = await Promise.race([net.catch(() => null), later(2500)]);
    if (raced && raced.ok) return raced;
    return new Response('', { status: 503, statusText: 'offline' });
  }
  if (isReload(request) && self.navigator.onLine) {
    const raced = await Promise.race([net.catch(() => null), later(800)]);
    if (raced && raced.ok) return raced;
    event.waitUntil(net.then((res) => { if (res && res.ok) return updatePage(cache, res, request.url); }).catch(() => {}));
    return cached;
  }
  event.waitUntil(net.then((res) => { if (res && res.ok) return updatePage(cache, res, request.url); }).catch(() => {}));
  return cached;
}
async function cacheFirst(request, storeKey) {
  const cache = await caches.open(CACHE);
  const key = storeKey || request;
  const cached = await cache.match(key);
  if (cached) {
    if (self.navigator.onLine) fetch(request).then(async (res) => { if (res.ok) await store(cache, key, res); }).catch(() => {});
    return cached;
  }
  if (!self.navigator.onLine) return new Response('', { status: 503, statusText: 'offline' });
  const raced = await Promise.race([
    fetch(request).then(async (res) => {
      if (res.ok) await store(cache, key, res);
      return res;
    }).catch(() => null),
    later(400),
  ]);
  if (raced && raced.ok) return raced;
  return new Response('', { status: 503, statusText: 'offline' });
}
function canCache(res) {
  return res && (res.ok || res.type === 'opaque');
}
async function putIcon(cache, request, res) {
  try { await cache.put(typeof request === 'string' ? request : request.url, res); } catch {}
}
async function faviconResponse(request) {
  const cache = await caches.open(CACHE);
  const key = request.url;
  const cached = await cache.match(key);
  if (cached) {
    if (self.navigator.onLine) fetch(request).then((res) => { if (canCache(res)) putIcon(cache, key, res); }).catch(() => {});
    return cached;
  }
  if (!self.navigator.onLine) return emptyIcon();
  const net = fetch(request).then((res) => {
    if (canCache(res)) putIcon(cache, key, res.clone());
    return res;
  });
  const raced = await Promise.race([net.catch(() => null), later(1200)]);
  if (canCache(raced)) return raced;
  return emptyIcon();
}
async function cacheIcons(urls) {
  const cache = await caches.open(CACHE);
  await Promise.all((urls || []).map(async (u) => {
    if (!u || await cache.match(u)) return;
    try {
      const res = await fetch(u, { mode: 'no-cors' });
      if (canCache(res)) await putIcon(cache, u, res);
    } catch {}
  }));
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
self.addEventListener('message', (event) => {
  if (event.data?.type === 'cache-icons') event.waitUntil(cacheIcons(event.data.urls));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname === '/sw.js') return;
  if (url.origin === self.location.origin && isPagePath(url.pathname)) {
    event.respondWith(pageResponse(event.request, event));
    return;
  }
  if (url.origin === self.location.origin && isAssetPath(url.pathname)) {
    event.respondWith(cacheFirst(event.request, url.pathname));
    return;
  }
  if (isFaviconHost(url.hostname)) {
    event.respondWith(faviconResponse(event.request));
  }
});
