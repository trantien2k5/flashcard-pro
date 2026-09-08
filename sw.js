/**
 * Service Worker - Quản lý Caching & Tự động cập nhật phiên bản (Auto Live Reload)
 * Chiến lược Network-First: Luôn tải file mới nhất từ server, tự động bypass cache khi sửa code.
 */

const CACHE_NAME = 'flashcard-pro-v2.6.0';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon.svg',
  './css/style.css?v=2.6.0',
  './css/main.css',
  './css/components.css',
  './css/flashcard.css',
  './css/views/review.css',
  './css/views/decks.css',
  './css/views/stats.css',
  './css/views/settings.css',
  './js/app.js?v=2.6.0',
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial fallback:', err);
      });
    }).then(() => self.skipWaiting())
  );
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
