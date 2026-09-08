/**
 * Service Worker - Quản lý Caching & Tự động cập nhật phiên bản (Auto Live Reload)
 * Chiến lược Network-First: Luôn tải file mới nhất từ server, tự động bypass cache khi sửa code.
 */

const CACHE_NAME = 'flashcard-pro-v2.6.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Luôn ưu tiên lấy bản mới nhất từ server (no-cache)
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Nếu offline, dùng bản cache
        return caches.match(event.request);
      })
  );
});
