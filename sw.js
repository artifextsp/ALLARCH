const CACHE_NAME = 'allarch-v1';
const ASSETS = [
  './',
  './index.html',
  './registro.html',
  './registro_arqueologo.html',
  './dashboard_publico.html',
  './dashboard_arqueologo.html',
  './dashboard_admin.html',
  './nuevo_hallazgo.html',
  './hallazgo.html',
  './css/styles.css',
  './js/config.js',
  './js/auth.js',
  './js/utils.js',
  './js/publico.js',
  './js/arqueologo.js',
  './js/admin.js',
  './js/hallazgo.js',
  './js/pwa-install.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('{"error":"offline"}', {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetched = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetched;
      })
  );
});
