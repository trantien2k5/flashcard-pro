/**
 * Service Worker - Quản lý Caching & Tự động cập nhật phiên bản (Auto Live Reload & Offline PWA)
 * Chiến lược Network-First: Luôn tải file mới nhất từ server, tự động bypass cache khi có mạng,
 * và tự động fallback sang Cache khi thiết bị Offline.
 */

const CACHE_NAME = 'flashcard-pro-v2.8.3';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon.svg',
  './css/style.css',
  './css/main.css',
  './css/components.css',
  './css/flashcard.css',
  './css/views/review.css',
  './css/views/decks.css',
  './css/views/stats.css',
  './css/views/settings.css',
  './js/app.js',
  './js/config.js',
  './js/utils.js',
  './js/core/fsrs.js',
  './js/core/session.js',
  './js/core/stats.js',
  './js/core/selectors.js',
  './js/services/storage.js',
  './js/services/audio.js',
  './js/services/sync.js',
  './js/views/components.js',
  './js/views/review.js',
  './js/views/decks.js',
  './js/views/stats.js',
  './js/views/settings.js',
  './js/views/study.js',
  './data/index.js',
  './data/schemas.js',
  './data/validators.js',
  './data/topics.js',
  './data/words.js'
];

// 1. Install: Precache toàn bộ ứng dụng và skipWaiting để kích hoạt ngay
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial fallback:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate: Xóa bỏ các phiên bản cache cũ và claim clients ngay lập tức
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Network-First cho tài nguyên ứng dụng (Ưu tiên mạng -> Lưu cache mới -> Fallback cache khi offline)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bỏ qua các scheme đặc biệt như chrome-extension, v.v.
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        // Nếu lấy thành công từ mạng, cập nhật ngay vào Cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Khi Offline: Thử tìm trong Cache (bỏ qua query string nếu có)
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }
        // Nếu là HTML navigation request và không có cache chính xác, fallback về index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
        return new Response('Offline: Resource not available in cache', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});
