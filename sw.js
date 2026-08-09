/* ─────────────────────────────────────────────
   Jol Kona — Service Worker (PWA offline cache)
   Cache-first for static assets, network-first for pages.
   ───────────────────────────────────────────── */
const CACHE_VERSION = 'jolkona-v2-4';
const CORE_CACHE = `core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

/* Static assets needed to boot the app offline */
const CORE_ASSETS = [
  './',
  './index.html',
  './index-v2.html',
  './custom-order.html',
  './product.html',
  './about.html',
  './account.html',
  './wishlist-cart.html',
  './manifest.webmanifest',
  './css/style.css',
  './css/style-v2.css',
  './css/auth.css',
  './css/mobile-nav.css',
  './css/bengali-fonts.css',
  './js/pwa.js',
  './js/main.js',
  './js/mobile-nav.js',
  './js/dark-mode.js',
  './js/products.js',
  './js/shop.js',
  './js/catalog.js',
  './js/auth.js',
  './js/reviews-marquee.js',
  './img/logo.png',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  './img/icons/icon-maskable-192.png',
  './img/icons/icon-maskable-512.png'
];

/* Install: precache the core shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // A failed precache must not block activation of the SW
        console.warn('[Jol Kona SW] Precache warning:', err);
        self.skipWaiting();
      })
  );
});

/* Activate: clean up old caches, take control of open tabs */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('core-') || key.startsWith('runtime-'))
          .filter((key) => key !== CORE_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* Fetch: network-first for navigations, cache-first for static assets */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore non-same-origin requests (fonts, Firebase, scripts from CDNs)
  if (url.origin !== self.location.origin) return;

  // Page navigations → network first, fall back to cached page (offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached || caches.match('./index.html')
          )
        )
    );
    return;
  }

  // Static assets (css, js, images) → cache first, then network + cache
  if (url.pathname.match(/\.(css|js|png|jpe?g|webp|svg|gif|ico|woff2?|ttf|otf|webmanifest|json)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Anything else: try network, fall back to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
