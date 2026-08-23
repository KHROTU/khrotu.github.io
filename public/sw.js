const CACHE = 'startpage-v2';
const PRECACHE = [
  '/startpage/',
  '/favicon-startpage.svg',
  '/fonts/HyperlegibleSans-Regular.woff2',
  '/fonts/HyperlegibleSans-Italic.woff2',
  '/fonts/HyperlegibleSans-Medium.woff2',
  '/fonts/HyperlegibleSans-MediumItalic.woff2',
  '/fonts/HyperlegibleSans-Bold.woff2',
  '/fonts/HyperlegibleSans-BoldItalic.woff2',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await cache.addAll(PRECACHE);
      const page = await cache.match('/startpage/');
      if (page) {
        const html = await page.text();
        const assets = [...html.matchAll(/\/_astro\/[^"']+\.(?:js|css)/g)].map((m) => m[0]);
        await Promise.all(assets.map((a) => cache.add(a).catch(() => {})));
      }
    }).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }
  const isFavicon = url.hostname === 'www.google.com' || url.hostname === 'icons.duckduckgo.com';
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (isFavicon && cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok && (isFavicon || url.hostname.includes('open-meteo') || url.hostname.includes('github') || url.hostname.includes('dummyjson'))) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});