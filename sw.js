/**
 * Service Worker - Quản lý Caching & Tự động cập nhật phiên bản (Auto Live Reload & Offline PWA)
 * 100% Offline-First: Học tập mượt mà không cần mạng internet.
 * Tự động phát hiện và cập nhật code mới tức thời khi Online (Zero-Friction Live Update).
 */

const CACHE_NAME = 'flashcard-pro-v3.2.0';
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
  './css/views/library.css',
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
  './js/views/library.js',
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

// 1. Install: Precache toàn bộ ứng dụng và skipWaiting để kích hoạt ngay lập tức
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial fallback:', err);
      });
    })
  );
});

// 2. Activate: Dọn dẹp toàn bộ cache cũ, claim clients ngay và thông báo cho client tab
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Xóa cache phiên bản cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Thông báo cho tất cả các tab đang mở rằng Service Worker mới đã kích hoạt
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_NAME,
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

// 3. Message Event: Hỗ trợ lệnh ép cập nhật từ client
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 4. Fetch: Chiến lược Network-First linh hoạt + Cache Fallback 100% Offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bỏ qua các scheme đặc biệt (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Bỏ qua toàn bộ Server-Sent Events (SSE), WebSocket & Realtime Sync Relays
  if (
    url.pathname.endsWith('/sse') ||
    url.pathname.includes('/fc_fsrs_') ||
    url.searchParams.has('poll') ||
    url.hostname.includes('ntfy') ||
    event.request.headers.get('Accept')?.includes('text/event-stream')
  ) {
    return;
  }

  // Đối với tài nguyên ngoài domain (CDN audio từ điển, TTS API): Không can thiệp cache SW
  if (url.origin !== self.location.origin) {
    return;
  }

  // A. Navigation Request (Truy cập trang / HTML): Luôn tải HTML mới nhất từ server khi có mạng
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline Fallback cho Navigation
          const cached = (await caches.match('./index.html')) || (await caches.match('./')) || (await caches.match(event.request));
          if (cached) return cached;
          return new Response('Offline: Vui lòng kết nối mạng để tải lại trang.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. Tệp tĩnh nội bộ (JS, CSS, Data, Images, Icons)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Nếu phản hồi hợp lệ (HTTP 200 Basic/Cors), cập nhật vào Cache cho lần dùng Offline kế tiếp
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {});
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        // Khi không có mạng (Offline) -> Lấy từ Cache
        try {
          const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
          if (cachedResponse) {
            return cachedResponse;
          }
        } catch (e) {}

        return new Response('Offline: Tài nguyên không có sẵn trong bộ nhớ đệm', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});
