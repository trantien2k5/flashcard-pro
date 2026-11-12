/**
 * PWA Service Worker Registration & Live Update Checker
 */

import { APP_CONFIG } from '../config.js';
import { showConfirm } from '../views/components.js';

/**
 * Đăng ký Service Worker, tự động kiểm tra cập nhật & thông báo trạng thái Online/Offline
 */
export function registerAppServiceWorker(app) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !window.location.protocol.startsWith('http')) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('dev')) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) reg.unregister();
    }).catch(() => {});

    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) caches.delete(key);
      }).catch(() => {});
    }
    return;
  }

  let swRegistration = null;
  let isReloading = false;

  const performReload = (message = '🚀 Ứng dụng đã tự động cập nhật phiên bản mới nhất!') => {
    if (isReloading) return;
    isReloading = true;
    app.showToast(message, 'success', 2000);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleUpdateDetected = () => {
    if (app.studySession && app.studySession.isActive) {
      app._pendingUpdateReload = true;
      app.showToast('✨ Có bản cập nhật mới — sẽ tự động áp dụng sau phiên học này.', 'info', 4000);
    } else {
      performReload();
    }
  };

  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((registration) => {
    app.swRegistration = registration;
    swRegistration = registration;

    registration.update().catch(() => {});

    setInterval(() => {
      if (navigator.onLine && registration) {
        registration.update().catch(() => {});
      }
    }, 3 * 60 * 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine && registration) {
        registration.update().catch(() => {});
      }
    });
    window.addEventListener('focus', () => {
      if (navigator.onLine && registration) {
        registration.update().catch(() => {});
      }
    });

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Phiên bản mới đã tải xong trong background.');
            installingWorker.postMessage({ action: 'skipWaiting' });
          }
        };
      }
    };
  }).catch(err => {
    console.warn('[PWA] Service worker registration error:', err);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    handleUpdateDetected();
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_ACTIVATED') {
      console.log('[PWA] SW_ACTIVATED version:', event.data.version);
      handleUpdateDetected();
    }
  });

  window.addEventListener('offline', () => {
    app.showToast('📡 Đang ở chế độ Offline (Học 100% không cần mạng)', 'info', 3500);
  });

  window.addEventListener('online', () => {
    app.showToast('⚡ Đã kết nối Internet — Đang kiểm tra cập nhật...', 'success', 2500);
    if (swRegistration) {
      swRegistration.update().catch(() => {});
    }
  });
}

/**
 * Kiểm tra và áp dụng cập nhật phiên bản mới một cách minh bạch
 */
export async function checkAppUpdate(app, options = {}) {
  const isManual = options.manual === true;

  if (!navigator.onLine) {
    if (isManual) {
      app.showToast('📡 Đang ngoại tuyến. Bật mạng để kiểm tra cập nhật.', 'info', 3000);
    }
    return { hasUpdate: false, offline: true, currentVersion: APP_CONFIG.version };
  }

  if (isManual) {
    app.showToast('🔍 Đang kiểm tra phiên bản mới...', 'info', 2000);
  }

  let remoteVersion = null;
  try {
    const res = await fetch(`./sw.js?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/CACHE_NAME\s*=\s*['"]flashcard-pro-v([^'"]+)['"]/);
      if (match && match[1]) {
        remoteVersion = match[1].trim();
      }
    }
  } catch (e) {
    console.warn('[PWA] Lỗi fetch sw.js:', e);
  }

  let swHasUpdate = false;
  let reg = app.swRegistration;
  if (!reg && 'serviceWorker' in navigator) {
    try {
      reg = await navigator.serviceWorker.getRegistration();
      app.swRegistration = reg;
    } catch (e) {}
  }

  if (reg) {
    try {
      await reg.update();
      if (reg.installing || reg.waiting) {
        swHasUpdate = true;
      }
    } catch (e) {}
  }

  const currentVersion = APP_CONFIG.version;
  const isNewer = remoteVersion && remoteVersion !== currentVersion;
  const hasUpdate = Boolean(isNewer || swHasUpdate);

  if (hasUpdate) {
    const targetVer = remoteVersion || 'mới';
    app.showToast(`🚀 Đã có v${targetVer}! Đang tải bản mới...`, 'info', 3000);

    if (reg && reg.waiting) {
      reg.waiting.postMessage({ action: 'skipWaiting' });
    }

    setTimeout(() => {
      app.showToast(`✨ Đã cập nhật lên v${targetVer}! Đang làm mới...`, 'success', 1800);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 1200);

    return { hasUpdate: true, currentVersion, remoteVersion: targetVer };
  }

  if (isManual) {
    app.showToast(`✅ Ứng dụng đã ở bản mới nhất (v${currentVersion})`, 'success', 2500);

    const wantCleanReload = await showConfirm({
      title: 'Phiên Bản Mới Nhất',
      message: `Ứng dụng của bạn đã ở phiên bản mới nhất (v${currentVersion}). Toàn bộ mã nguồn & dữ liệu từ vựng đã được đồng bộ chuẩn.\n\nNếu bạn nghi ngờ có lỗi hiển thị và muốn dọn sạch bộ nhớ đệm (Cache) để tải lại toàn bộ tài nguyên từ đầu, hãy chọn "Làm mới bộ nhớ đệm".`,
      confirmText: 'Làm mới bộ nhớ đệm',
      cancelText: 'Đóng',
      type: 'info',
      icon: '✅'
    });

    if (wantCleanReload) {
      app.showToast('🧹 Đang dọn sạch bộ nhớ đệm và tải lại trang...', 'info', 1500);
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  }

  return { hasUpdate: false, currentVersion, remoteVersion: currentVersion };
}

