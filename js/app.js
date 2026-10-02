/**
 * Flashcard English Pro - Điểm khởi động & Bộ điều phối ứng dụng chính
 * Quản lý vòng đời App, Router chuyển đổi Tab, Khởi tạo trạng thái và Kết nối sự kiện
 */

import { DeckManager } from './core/selectors.js';
import { StorageManager } from './services/storage.js';
import { StudySession } from './core/session.js';
import { StatsManager } from './core/stats.js';
import { scrollToTop } from './utils.js';

// Giao diện các màn hình chức năng & Thành phần dùng chung
import { renderReviewTab } from './views/review.js';
import { renderDecksTab, 
  openSubtopicsPage, 
  renderSubtopicsPage, 
  openSubtopicDetailPage, 
  renderSubtopicDetailPage, 
  openSubtopicWordsPage, 
  renderSubtopicWordsPage 
} from './views/decks.js';
import { renderLibraryTab } from './views/library.js';
import { renderStatsTab } from './views/stats.js';
import { setupSettingsUI } from './views/settings.js';
import { 
  setupStudyControls, 
  startStudySession as startStudyView, 
  handleCardChange, 
  handleStudyFinish 
} from './views/study.js';
import { startQuizSession } from './views/quiz.js';
import { setupSearch, showToast, showConfirm, mountGlobalModals } from './views/components.js';

// Xuất các hằng số và Enum để tương thích toàn hệ thống
export { DECK_ENGLISH_NAMES, SUBTOPIC_ICONS, getSubtopicIcon, getSubtopicColor, Rating, State, STABILITY_TIERS } from './config.js';

export class FlashcardApp {
  constructor() {
    this.deckManager = new DeckManager();
    this.settings = StorageManager.getSettings();

    this.activeTab = 'tab-review';
    this.previousTab = 'tab-review';
    this.currentSubtopicsDeckId = null;
    this.currentSubtopicName = null;

    this.studySession = new StudySession({
      deckManager: this.deckManager,
      settings: this.settings,
      onCardChange: (card, progress) => handleCardChange(this, card, progress),
      onFinish: (sessionStats) => handleStudyFinish(this, sessionStats)
    });
  }

  async init() {
    try {
      // 1. Gắn các Modal chung vào DOM (App Shell)
      mountGlobalModals();

      // 2. Áp dụng Theme & Cấu hình cuộn trang
      try {
        this.applyTheme(this.settings?.theme || 'light');
        if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
      } catch (e) {}

      // 3. Khởi tạo tầng lưu trữ IndexedDB
      try {
        if (typeof StorageManager.initStorage === 'function') {
          await StorageManager.initStorage();
        }
      } catch (e) {
        console.warn('initStorage non-blocking warn:', e);
      }

      // 4. Khởi tạo danh mục Decks từ data/
      await this.deckManager.init();
      if (typeof window !== 'undefined') {
        window.deckManager = this.deckManager;
        window.app = this;
      }

      // 5. Khởi tạo giao diện các tab và thành phần
      this.setupNavigation();
      try { setupStudyControls(this); } catch (e) { console.warn('setupStudyControls:', e); }
      try { setupSettingsUI(this); } catch (e) { console.warn('setupSettingsUI:', e); }
      try { setupSearch(this); } catch (e) { console.warn('setupSearch:', e); }

      // 6. Đặt tab Trang chủ làm mặc định & Khởi tạo dữ liệu
      this.switchTab('tab-review');
      this.updateHeaderBadges();

      // 7. Đăng ký Service Worker
      this.registerServiceWorker();

    } catch (err) {
      console.error('Lỗi khi khởi tạo FlashcardApp:', err);
      try {
        this.showToast('Lỗi khởi động: ' + (err?.message || err), 'error');
      } catch (e) {}
    }
  }

  registerServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !window.location.protocol.startsWith('http')) {
      return;
    }

    // Tự động nhận diện môi trường Local Development (Live Server / localhost / IP nội bộ)
    const hostname = window.location.hostname;
    const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local') || hostname.startsWith('192.168.') || hostname.startsWith('10.');

    if (isLocalDev) {
      // Tự động gỡ bỏ Service Worker & xóa sạch Cache cũ trên môi trường dev mà người dùng không cần thao tác
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      }).catch(() => {});

      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        }).catch(() => {});
      }
      return;
    }

    let swRegistration = null;
    let isReloading = false;

    const performReload = (message = '🚀 Ứng dụng đã tự động cập nhật phiên bản mới nhất!') => {
      if (isReloading) return;
      isReloading = true;
      this.showToast(message, 'success', 2000);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    };

    const handleUpdateDetected = () => {
      // Nếu đang trong phiên học 3D flashcard, hoãn reload cho đến khi kết thúc phiên để không làm gián đoạn
      if (this.studySession && this.studySession.isActive) {
        this._pendingUpdateReload = true;
        this.showToast('✨ Có bản cập nhật mới — sẽ tự động áp dụng sau phiên học này.', 'info', 4000);
      } else {
        performReload();
      }
    };

    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((registration) => {
      swRegistration = registration;

      // 1. Kiểm tra cập nhật ngay lập tức khi mở ứng dụng
      registration.update().catch(() => {});

      // 2. Tự động kiểm tra cập nhật định kỳ mỗi 3 phút khi online
      setInterval(() => {
        if (navigator.onLine && registration) {
          registration.update().catch(() => {});
        }
      }, 3 * 60 * 1000);

      // 3. Kiểm tra cập nhật khi người dùng chuyển lại tab (focus / visibility)
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

      // 4. Lắng nghe khi có SW mới đang cài đặt
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Phiên bản mới đã tải xong trong background.');
              // Gửi tin nhắn ép kích hoạt nếu cần
              installingWorker.postMessage({ action: 'skipWaiting' });
            }
          };
        }
      };
    }).catch(err => {
      console.warn('[PWA] Service worker registration error:', err);
    });

    // 5. Lắng nghe controllerchange khi Service Worker mới chính thức tiếp quản
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      handleUpdateDetected();
    });

    // 6. Lắng nghe tin nhắn kích hoạt từ SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_ACTIVATED') {
        console.log('[PWA] SW_ACTIVATED version:', event.data.version);
        handleUpdateDetected();
      }
    });

    // 7. Lắng nghe trạng thái Online / Offline
    window.addEventListener('offline', () => {
      this.showToast('📡 Đang ở chế độ Offline (Học 100% không cần mạng)', 'info', 3500);
    });

    window.addEventListener('online', () => {
      this.showToast('⚡ Đã kết nối Internet — Đang kiểm tra cập nhật...', 'success', 2500);
      if (swRegistration) {
        swRegistration.update().catch(() => {});
      }
    });
  }

  scrollToTop() {
    scrollToTop();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        try {
          const targetTab = item.getAttribute('data-tab');
          this.switchTab(targetTab);
        } catch (err) {
          console.error('Lỗi chuyển tab bottom nav:', err);
        }
      });
    });

    const btnHeaderSettings = document.getElementById('btn-header-settings') || document.getElementById('btn-header-profile');
    if (btnHeaderSettings) {
      btnHeaderSettings.addEventListener('click', () => {
        try {
          if (this.activeTab === 'tab-settings') {
            this.switchTab(this.previousTab || 'tab-review');
          } else {
            this.switchTab('tab-settings');
          }
        } catch (err) {
          console.error('Lỗi btn-header-settings:', err);
        }
      });
    }

    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle && !btnThemeToggle._themeBound) {
      btnThemeToggle._themeBound = true;
      btnThemeToggle.addEventListener('click', (e) => {
        try {
          e.preventDefault();
          const currentTheme = this.settings?.theme || 'light';
          const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
          if (this.settings) this.settings.theme = nextTheme;
          this.applyTheme(nextTheme);
          StorageManager.saveSettings(this.settings);
          this.showToast(nextTheme === 'dark' ? '🌙 Đã chuyển sang chế độ Tối' : '☀️ Đã chuyển sang chế độ Sáng', 'info', 1500);
        } catch (err) {
          console.error('Lỗi btn-theme-toggle:', err);
        }
      });
    }

    const btnBack = document.getElementById('btn-back-to-decks');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        try {
          this.switchTab(this.previousTab || 'tab-review');
        } catch (err) {
          console.error('Lỗi btn-back-to-decks:', err);
        }
      });
    }

    const btnBackSubtopic = document.getElementById('btn-back-to-subtopics');
    if (btnBackSubtopic) {
      btnBackSubtopic.addEventListener('click', () => {
        try {
          if (this.currentSubtopicsDeckId) {
            this.openSubtopicsPage(this.currentSubtopicsDeckId);
          } else {
            this.switchTab('tab-review');
          }
        } catch (err) {
          console.error('Lỗi btn-back-to-subtopics:', err);
        }
      });
    }

    const btnBackToSubtopicDetail = document.getElementById('btn-back-to-subtopic-detail');
    if (btnBackToSubtopicDetail) {
      btnBackToSubtopicDetail.addEventListener('click', () => {
        try {
          if (this.currentSubtopicsDeckId) {
            this.openSubtopicsPage(this.currentSubtopicsDeckId);
          } else {
            this.switchTab('tab-review');
          }
        } catch (err) {
          console.error('Lỗi btn-back-to-subtopic-detail:', err);
        }
      });
    }
  }

  switchTab(tabId) {
    try {
      const isSubpageTarget = (tabId === 'tab-subtopics' || tabId === 'tab-subtopic-words');
      if (!isSubpageTarget) {
        this.previousTab = tabId;
      }
      this.activeTab = tabId;

      document.body.classList.toggle('subpage-view-active', isSubpageTarget);

      const panes = document.querySelectorAll('.tab-pane');
      panes.forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
      });

      const navTargetId = isSubpageTarget ? (this.previousTab || 'tab-review') : tabId;
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === navTargetId);
      });

      const btnHeaderSettings = document.getElementById('btn-header-settings') || document.getElementById('btn-header-profile');
      if (btnHeaderSettings) {
        btnHeaderSettings.classList.toggle('active', tabId === 'tab-settings');
      }

      scrollToTop();

      if (this.deckManager) {
        this.deckManager.invalidateStatsCache();
      }
      this.updateHeaderBadges();

      if (tabId === 'tab-review' || tabId === 'tab-home') this.renderReviewTab();
      else if (tabId === 'tab-settings') this.renderSettingsTab();
      else if (tabId === 'tab-decks') this.renderDecksTab();
      else if (tabId === 'tab-library') this.renderLibraryTab();
      else if (tabId === 'tab-subtopics' && this.currentSubtopicsDeckId) {
        this.renderSubtopicsPage(this.currentSubtopicsDeckId);
      } else if (tabId === 'tab-subtopic-words' && this.currentSubtopicsDeckId && this.currentSubtopicName) {
        this.renderSubtopicWordsPage(this.currentSubtopicsDeckId, this.currentSubtopicName);
      }
    } catch (err) {
      console.error(`Lỗi trong switchTab(${tabId}):`, err);
    }
  }

  refreshAllViews() {
    if (this.deckManager) {
      this.deckManager.invalidateStatsCache();
    }
    if (this.activeTab === 'tab-review' || this.activeTab === 'tab-home') {
      this.renderReviewTab();
    } else if (this.activeTab === 'tab-library') {
      this.renderLibraryTab();
    } else if (this.activeTab === 'tab-decks') {
      this.renderDecksTab();
    } else if (this.activeTab === 'tab-settings') {
      this.renderSettingsTab();
    } else if (this.activeTab === 'tab-subtopics' && this.currentSubtopicsDeckId) {
      this.renderSubtopicsPage(this.currentSubtopicsDeckId);
    } else if (this.activeTab === 'tab-subtopic-words' && this.currentSubtopicsDeckId && this.currentSubtopicName) {
      this.renderSubtopicWordsPage(this.currentSubtopicsDeckId, this.currentSubtopicName);
    }

    this.updateHeaderBadges();

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        if (this.activeTab !== 'tab-decks') this.renderDecksTab();
      });
    }
  }

  updateHeaderBadges() {
    try {
      const logs = StorageManager.getStudyLogs();
      const streak = StatsManager.calculateStreak(logs);
      
      const streakEl = document.getElementById('streak-count');
      if (streakEl) streakEl.textContent = `${streak} ngày`;

      const desktopStreakEl = document.getElementById('desktop-streak-count');
      if (desktopStreakEl) desktopStreakEl.textContent = streak;

      const topHeaderStreakEl = document.getElementById('header-streak-count');
      if (topHeaderStreakEl) topHeaderStreakEl.textContent = streak;
    } catch (err) {
      console.error('Lỗi updateHeaderBadges:', err);
    }
  }

  applyTheme(theme) {
    const t = (theme === 'dark' || theme === 'light') ? theme : 'light';
    document.documentElement.setAttribute('data-theme', t);
    
    // Đổi icon Mặt Trời / Mặt Trăng trên thanh Header
    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      if (t === 'dark') {
        btnTheme.title = 'Chuyển sang chế độ Sáng';
        btnTheme.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
      } else {
        btnTheme.title = 'Chuyển sang chế độ Tối';
        btnTheme.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
      }
    }

    // Đồng bộ checkbox trong mục Cài đặt nếu đang mở
    const darkThemeToggle = document.getElementById('setting-dark-theme');
    if (darkThemeToggle) {
      darkThemeToggle.checked = (t === 'dark');
    }
  }

  // Delegated View Methods
  renderReviewTab() {
    try { renderReviewTab(this); } catch (err) { console.error('Lỗi renderReviewTab:', err); }
  }

  renderLibraryTab() {
    try { renderLibraryTab(this); } catch (err) { console.error('Lỗi renderLibraryTab:', err); }
  }

  renderDecksTab() {
    try { renderDecksTab(this); } catch (err) { console.error('Lỗi renderDecksTab:', err); }
  }

  openSubtopicsPage(deckId) {
    openSubtopicsPage(this, deckId);
  }

  renderSubtopicsPage(deckId) {
    renderSubtopicsPage(this, deckId);
  }

  openSubtopicDetailPage(deckId, subtopicName) {
    openSubtopicDetailPage(this, deckId, subtopicName);
  }

  renderSubtopicDetailPage(deckId, subtopicName) {
    renderSubtopicDetailPage(this, deckId, subtopicName);
  }

  openSubtopicWordsPage(deckId, subtopicName) {
    openSubtopicWordsPage(this, deckId, subtopicName);
  }

  renderSubtopicWordsPage(deckId, subtopicName) {
    renderSubtopicWordsPage(this, deckId, subtopicName);
  }

  renderStatsTab() {
    try { renderStatsTab(this); } catch (err) { console.error('Lỗi renderStatsTab:', err); }
  }

  renderSettingsTab() {
    try { setupSettingsUI(this); } catch (err) { console.error('Lỗi renderSettingsTab:', err); }
  }

  async startStudySession(deckId = null, subtopic = null, customCards = null, options = {}) {
    try {
      let queue = [];
      // Hỗ trợ truyền mảng customCards ở tham số đầu tiên (polymorphic)
      if (Array.isArray(deckId)) {
        customCards = deckId;
        deckId = null;
      }
      if (Array.isArray(customCards) && customCards.length > 0) {
        queue = customCards;
      } else {
        if (deckId && this.deckManager && this.deckManager.ensureTopicLoaded) {
          await this.deckManager.ensureTopicLoaded(deckId);
        }
        const studyData = this.deckManager.getStudyQueue(deckId, this.settings, subtopic, options);
        queue = studyData.queue || [];
      }

      if (!queue || queue.length === 0) {
        if (options && options.mode === 'due_only') {
          this.showToast('Tuyệt vời! Hiện chưa có từ nào đến hạn cần ôn trong mục này.', 'info');
        } else {
          this.showToast('Không có từ vựng nào để học trong mục này.', 'info');
        }
        return;
      }
      this.currentStudyContext = { deckId, subtopic, options };
      startStudyView(this, queue);
    } catch (err) {
      console.error('Lỗi startStudySession:', err);
      this.showToast('Lỗi khi mở phiên học: ' + (err?.message || err), 'error');
    }
  }

  startQuizSession(queue = null, options = {}) {
    try {
      // Hỗ trợ nếu truyền customCards ở vị trí linh hoạt
      if (Array.isArray(queue)) {
        startQuizSession(this, queue, options);
      } else {
        startQuizSession(this, null, options);
      }
    } catch (err) {
      console.error('Lỗi startQuizSession:', err);
      this.showToast('Lỗi khi mở phiên trắc nghiệm: ' + (err?.message || err), 'error');
    }
  }


  showConfirm(options) {
    return showConfirm(options);
  }

  showToast(message, type, duration) {
    return showToast(message, type, duration);
  }
}

export async function bootstrap() {
  try {
    const app = new FlashcardApp();
    if (typeof window !== 'undefined') {
      window.app = app;
    }
    await app.init();
    return app;
  } catch (err) {
    console.error('Lỗi nghiêm trọng khi khởi chạy FlashcardApp:', err);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
}
