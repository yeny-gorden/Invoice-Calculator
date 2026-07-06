const CACHE_NAME = 'yeny-gorden-v1'; // Kamu tetap bisa pakai v1, nanti dia akan "self-destruct" sendiri

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Memaksa SW baru segera aktif tanpa menunggu tab lama ditutup
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([
    './index.html',
    './invoice.html',
    './manifest.json',
    './logo.png'
  ])));
});

self.addEventListener('activate', (e) => {
  // Menghapus cache lama yang tidak relevan saat SW baru aktif
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      // Selalu ambil dari cache, tapi fetch ke server di background untuk update
      return res || fetch(e.request);
    })
  );
});
