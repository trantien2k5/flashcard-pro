/**
 * Service Worker - Quản lý Caching & Tự động cập nhật phiên bản (Auto Live Reload & Offline PWA)
 * 100% Offline-First: Học tập mượt mà không cần mạng internet.
 * Tự động phát hiện và cập nhật code mới tức thời khi Online (Zero-Friction Live Update).
 */

const CACHE_NAME = 'flashcard-pro-v3.76.64';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/favicon.ico',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon.svg',
  './assets/icons/icon-maskable.svg',
  './assets/icons/apple-touch-icon.png',
  './src/css/style.css',
  './src/css/main.css',
  './src/css/base/tokens.css',
  './src/css/base/reset.css',
  './src/css/base/animations.css',
  './src/css/layout/shell.css',
  './src/css/layout/responsive.css',
  './src/css/components.css',
  './src/css/components/modals.css',
  './src/css/components/toast.css',
  './src/css/components/search.css',
  './src/css/components/optimizer.css',
  './src/css/components/streak.css',
  './src/css/components/custom-study.css',
  './src/css/views/flashcard.css',
  './src/css/views/review.css',
  './src/css/views/library.css',
  './src/css/views/decks.css',
  './src/css/views/stats.css',
  './src/css/views/settings.css',
  './src/css/views/quiz.css',
  './src/css/views/toeic-test.css',
  './src/css/views/reels.css',
  './src/js/app.js',
  './src/js/config.js',
  './src/js/utils.js',
  './src/js/core/fsrs.js',
  './src/js/core/session.js',
  './src/js/core/stats.js',
  './src/js/core/stats/roadmap.js',
  './src/js/core/stats/journal.js',
  './src/js/core/timer.js',
  './src/js/core/optimizer.js',
  './src/js/core/selectors.js',
  './src/js/services/storage.js',
  './src/js/services/storage/idb.js',
  './src/js/services/storage/streak.js',
  './src/js/services/storage/backup.js',
  './src/js/services/audio.js',
  './src/js/views/components.js',
  './src/js/views/components/shell.js',
  './src/js/views/components/toast.js',
  './src/js/views/components/search.js',
  './src/js/views/components/streak-hub.js',
  './src/js/views/components/custom-study.js',
  './src/js/views/components/optimizer-modal.js',
  './src/js/views/modals/goal-modal.js',
  './src/js/views/review.js',
  './src/js/views/review/stat-modals.js',
  './src/js/views/library.js',
  './src/js/views/library/detail-modal.js',
  './src/js/views/decks.js',
  './src/js/views/decks/subtopics.js',
  './src/js/views/decks/words.js',
  './src/js/views/stats.js',
  './src/js/views/stats/forecast-modal.js',
  './src/js/views/stats/journal.js',
  './src/js/views/settings.js',
  './src/js/views/study.js',
  './src/js/views/study/renderer.js',
  './src/js/views/study/autoplay.js',
  './src/js/views/study/prefs.js',
  './src/js/views/study/shell.js',
  './src/js/views/study/pomodoro.js',
  './src/js/views/study/summary-modal.js',
  './src/js/views/quiz.js',
  './src/js/views/toeic-test.js',
  './src/js/views/reels.js',
  './src/js/views/reels/templates.js',
  './src/data/index.js',
  './src/data/schemas.js',
  './src/data/validators.js',
  './src/data/topics.js',
  './src/data/toeic-tests.js',
  './src/data/words.js',
  './src/data/words/legacy.js',
  './src/data/words/a1.js',
  './src/data/words/a2.js',
  './src/data/words/b1.js',
  './src/data/words/b2.js',
  './src/data/words/c1.js',
  './src/data/words/toeic-500.js'
];

// 1. Install: Precache toàn bộ ứng dụng bền vững (từng file) và skipWaiting để kích hoạt ngay lập tức
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Dùng Promise.allSettled để tránh 1 file lỗi làm hủy toàn bộ precache
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[SW] Pre-cache item failed: ${asset}`, err);
          })
        )
      );
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

  // Fonts từ Google Fonts (googleapis, gstatic): Stale-While-Revalidate để dùng offline mượt mà
  const isGoogleFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (isGoogleFont) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Đối với tài nguyên ngoài domain khác (nếu có): Không can thiệp cache SW
  if (url.origin !== self.location.origin) {
    return;
  }

  // B. Navigation Request (Truy cập trang / HTML): Tải tức thì từ Cache (<5ms), kiểm tra cập nhật nền
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = (await cache.match(event.request)) ||
                       (await cache.match(event.request.url.split('?')[0])) ||
                       (await cache.match('./index.html')) ||
                       (await cache.match('index.html')) ||
                       (await cache.match('./'));

        // Cập nhật ngầm từ mạng không chặn UI
        const networkFetch = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            cache.put('./index.html', clone);
            cache.put(event.request, clone.clone());
          }
          return networkResponse;
        }).catch(() => null);

        if (cached) {
          return cached;
        }

        const netRes = await networkFetch;
        if (netRes) return netRes;

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
