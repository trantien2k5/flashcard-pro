/**
 * Service Worker - Quản lý Caching & Tự động cập nhật phiên bản (Auto Live Reload & Offline PWA)
 * 100% Offline-First: Học tập mượt mà không cần mạng internet.
 * Tự động phát hiện và cập nhật code mới tức thời khi Online (Zero-Friction Live Update).
 */

const CACHE_NAME = 'flashcard-pro-v3.68.0';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/favicon.ico',
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
  './css/views/quiz.css',
  './js/app.js',
  './js/config.js',
  './js/utils.js',
  './js/core/fsrs.js',
  './js/core/session.js',
  './js/core/stats.js',
  './js/core/selectors.js',
  './js/services/storage.js',
  './js/services/audio.js',
  './js/views/components.js',
  './js/views/review.js',
  './js/views/library.js',
  './js/views/decks.js',
  './js/views/stats.js',
  './js/views/settings.js',
  './js/views/study.js',
  './js/views/quiz.js',
  './data/index.js',
  './data/schemas.js',
  './data/validators.js',
  './data/topics.js',
  './data/words.js',
  './data/words/legacy.js',
  './data/words/a1.js',
  './data/words/a2.js',
  './data/words/b1.js',
  './data/words/b2.js',
  './data/words/c1.js'
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

// 4. Fetch: Chiến lược linh hoạt kết hợp Cache-First cho Assets & Network-First cho Code
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Tự động bỏ qua cache khi phát triển trên localhost / 127.0.0.1 để live reload tức thời
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
  if (isLocalhost) {
    // Để trình duyệt fetch trực tiếp từ server cục bộ mà không bị chặn bởi cache
    return;
  }

  // Bỏ qua các scheme đặc biệt (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;


  // A. Cache-First cho Hình ảnh từ vựng (.webp, .png, .jpg, .svg) và Audio (.mp3)
  const isImageOrAudio = 
    url.pathname.includes('/assets/images/words/') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.mp3') ||
    url.hostname.includes('dictionary.cambridge.org') ||
    url.hostname.includes('oxfordlearnersdictionaries.com');

  if (isImageOrAudio) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkResponse;
        }).catch(() => {
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
    );
    return;
  }

  // Đối với tài nguyên ngoài domain khác (nếu có): Không can thiệp cache SW
  if (url.origin !== self.location.origin) {
    return;
  }

  // B. Navigation Request (Truy cập trang / HTML): Luôn tải HTML mới nhất từ server khi có mạng
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

  // C. Tệp tĩnh nội bộ (JS, CSS, Data, Icons): Stale-While-Revalidate (Instant Load <10ms & Silent Refresh)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(() => {});
            }).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetchPromise.then((networkResponse) => {
        if (networkResponse) return networkResponse;
        return new Response('Offline: Tài nguyên không có sẵn trong bộ nhớ đệm', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      });
    })
  );
});
