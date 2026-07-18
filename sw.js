const CACHE_NAME = 'invoice-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './invoice.html',
  './manifest.json',
  './icon.png'
];

// 1. Install Service Worker dan simpan aset dasar ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan aset ke cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Aktivasi & pembersihan cache lama jika ada update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Strategi Fetching Pintar
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategi Network-First untuk halaman HTML (agar data selalu fresh jika online)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Salin respon terbaru ke cache
          const toCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
          return response;
        })
        .catch(() => {
          // Jika offline, ambil dari cache
          return caches.match(event.request);
        })
    );
  } else {
    // Strategi Cache-First untuk aset statis (logo/gambar/css) agar loading instan
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const toCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
          return response;
        });
      })
    );
  }
});
