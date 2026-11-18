// Service Worker for Fino PWA
const CACHE_NAME = 'fino-pwa-v4';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/app-icon.svg',
  '/favicon-32x32.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// Install: precache static assets safely without failing if one asset is missing
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          // Non-critical if individual icon fails to pre-fetch
          console.warn('[SW] Non-critical precache skip:', asset, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up older caches so updates are applied immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first with safe cache fallback for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-http(s) requests and mutations
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML documents)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network is offline or fails, return cached page or fallback
          const cachedPage = (await caches.match(request)) || (await caches.match('/'));
          if (cachedPage) {
            return cachedPage;
          }
          return new Response(
            '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fino</title><style>body{font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:48px 20px;background:#FAF8F5;color:#0F172A;}button{padding:12px 24px;background:#FFCF00;border:none;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:16px;}</style></head><body><h2>Modo sin conexión</h2><p>Conéctate a internet para cargar Fino o refrescar los datos.</p><button onclick="location.reload()">Reintentar</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Static icons, images, manifest, fonts
  const isStaticAsset =
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.url.includes('/manifest.json') ||
    request.url.includes('/pwa-') ||
    request.url.includes('/apple-touch-icon.png') ||
    request.url.includes('/favicon-32x32.png') ||
    request.url.includes('/app-icon.svg');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(async () => {
            if (request.destination === 'image') {
              const svgFallback = await caches.match('/app-icon.svg');
              if (svgFallback) return svgFallback;
            }
            return new Response('', { status: 408, statusText: 'Offline' });
          });
      })
    );
    return;
  }

  // 3. Application code & modules (Vite, JS, CSS, JSON)
  // Always network-first to avoid stale JS execution or syntax crashes
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }
        return new Response('', { status: 408, statusText: 'Network Failed' });
      })
  );
});
