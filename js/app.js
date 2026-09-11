/**
 * Flashcard English Pro - Main Application Entry Point & Controller
 * Consolidates App Bootstrap, State Management, Navigation Router & Event Hub
 */

import { DeckManager } from './core/selectors.js';
import { StorageManager } from './services/storage.js';
import { StudySession } from './core/session.js';
import { StatsManager } from './core/stats.js';
import { SyncManager } from './services/sync.js';
import { scrollToTop } from './utils.js';

// Feature Views & Shared Components
import { renderReviewTab } from './views/review.js';
import { 
  renderDecksTab, 
  openSubtopicsPage, 
  renderSubtopicsPage, 
  openSubtopicDetailPage, 
  renderSubtopicDetailPage, 
  openSubtopicWordsPage, 
  renderSubtopicWordsPage 
} from './views/decks.js';
import { renderStatsTab } from './views/stats.js';
import { setupSettingsUI, renderProfileTab } from './views/settings.js';
import { 
  setupStudyControls, 
  startStudySession as startStudyView, 
  handleCardChange, 
  handleStudyFinish, 
  showSummaryModal 
} from './views/study.js';
import { setupSearch, setupSyncController, openSyncModal, showToast, showConfirm, mountGlobalModals } from './views/components.js';

// Export constants & enums for full compatibility
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
      try { setupSyncController(this); } catch (e) { console.warn('setupSyncController:', e); }

      // Triggers mở Sync Modal
      const btnHeaderSync = document.getElementById('btn-header-sync');
      if (btnHeaderSync) btnHeaderSync.onclick = () => this.openSyncModal();

      const btnSidebarSync = document.getElementById('btn-sidebar-sync');
      if (btnSidebarSync) btnSidebarSync.onclick = () => this.openSyncModal();

      const btnSettingsSync = document.getElementById('btn-settings-open-sync');
      if (btnSettingsSync) btnSettingsSync.onclick = () => this.openSyncModal();

      // 5. Đặt tab Ôn tập làm mặc định & Khởi tạo dữ liệu
      this.switchTab('tab-review');
      this.updateHeaderBadges();

      // 6. Kiểm tra auto-sync từ URL
      this.checkUrlSync();

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
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').then((registration) => {
        // Tự động kiểm tra bản cập nhật mới định kỳ và khi quay lại tab
        registration.update().catch(() => {});

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // Lắng nghe khi phát hiện Service Worker mới
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Phiên bản mới đã sẵn sàng.');
              }
            };
          }
        };
      }).catch(err => {
        console.warn('Service worker registration failed:', err);
      });

      // Lắng nghe khi SW mới kích hoạt (clients.claim) để cập nhật view nếu cần
      let isReloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isReloading) {
          isReloading = true;
          // Chỉ reload tự động nếu không đang trong phiên học thẻ dở dang
          if (!this.studySession || !this.studySession.isActive) {
            window.location.reload();
          }
        }
      });
    }
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

    const btnHeaderProfile = document.getElementById('btn-header-profile');
    if (btnHeaderProfile) {
      btnHeaderProfile.addEventListener('click', () => {
        try {
          this.switchTab('tab-profile');
        } catch (err) {
          console.error('Lỗi btn-header-profile:', err);
        }
      });
    }

    const btnBack = document.getElementById('btn-back-to-decks');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        try {
          this.switchTab(this.previousTab || 'tab-decks');
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
            this.switchTab('tab-decks');
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
            this.switchTab('tab-decks');
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

      const btnHeaderProfile = document.getElementById('btn-header-profile');
      if (btnHeaderProfile) {
        btnHeaderProfile.classList.toggle('active', tabId === 'tab-profile');
      }

      scrollToTop();

      if (this.deckManager) {
        this.deckManager.invalidateStatsCache();
      }
      this.updateHeaderBadges();

      if (tabId === 'tab-review' || tabId === 'tab-home') this.renderReviewTab();
      else if (tabId === 'tab-decks') this.renderDecksTab();
      else if (tabId === 'tab-stats') this.renderStatsTab();
      else if (tabId === 'tab-profile') this.renderProfileTab();
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
    } else if (this.activeTab === 'tab-decks') {
      this.renderDecksTab();
    } else if (this.activeTab === 'tab-stats') {
      this.renderStatsTab();
    } else if (this.activeTab === 'tab-profile') {
      this.renderProfileTab();
    } else if (this.activeTab === 'tab-subtopics' && this.currentSubtopicsDeckId) {
      this.renderSubtopicsPage(this.currentSubtopicsDeckId);
    } else if (this.activeTab === 'tab-subtopic-words' && this.currentSubtopicsDeckId && this.currentSubtopicName) {
      this.renderSubtopicWordsPage(this.currentSubtopicsDeckId, this.currentSubtopicName);
    }

    this.updateHeaderBadges();

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        if (this.activeTab !== 'tab-decks') this.renderDecksTab();
        if (this.activeTab !== 'tab-stats') this.renderStatsTab();
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
    } catch (err) {
      console.error('Lỗi updateHeaderBadges:', err);
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Delegated View Methods
  renderReviewTab() {
    try { renderReviewTab(this); } catch (err) { console.error('Lỗi renderReviewTab:', err); }
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

  renderProfileTab() {
    try { renderProfileTab(this); } catch (err) { console.error('Lỗi renderProfileTab:', err); }
  }

  async startStudySession(deckId = null, subtopic = null, customCards = null) {
    try {
      let queue = [];
      if (Array.isArray(customCards) && customCards.length > 0) {
        queue = customCards;
      } else {
        if (deckId && this.deckManager && this.deckManager.ensureTopicLoaded) {
          await this.deckManager.ensureTopicLoaded(deckId);
        }
        const studyData = this.deckManager.getStudyQueue(deckId, this.settings, subtopic);
        queue = studyData.queue;
        if ((!queue || queue.length === 0) && studyData.learningCards?.length > 0) {
          queue = studyData.learningCards;
        }
        if ((!queue || queue.length === 0) && deckId) {
          queue = this.deckManager.getCardsByDeckId(deckId).slice(0, 10);
        }
      }

      if (!queue || queue.length === 0) {
        this.showToast('Không có thẻ nào cần học trong danh mục này!', 'info');
        return;
      }
      startStudyView(this, queue);
    } catch (err) {
      console.error('Lỗi startStudySession:', err);
      this.showToast('Lỗi khi mở phiên học: ' + (err?.message || err), 'error');
    }
  }

  openSyncModal() {
    openSyncModal(this);
  }

  async checkUrlSync() {
    try {
      if (typeof window === 'undefined' || !window.location) return;
      const urlParams = new URLSearchParams(window.location.search);
      
      const pairPin = urlParams.get('pair');
      if (pairPin) {
        this.showToast('Đang bắt tay đồng bộ 2 chiều với máy kia...', 'info', 3000);
        const res = await SyncManager.executeClientHandshake(pairPin);
        if (res.success) {
          this.settings = StorageManager.getSettings();
          this.applyTheme(this.settings.theme || 'light');
          this.refreshAllViews();
          this.showToast(`🎉 Đồng bộ 2 chiều thành công!`, 'success', 5000);
        } else {
          this.showToast(res.error || 'Không thể kết nối với máy kia.', 'error');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const syncToken = urlParams.get('sync') || (window.location.hash.startsWith('#sync=') ? window.location.hash.slice(6) : null);
      if (syncToken) {
        const res = await SyncManager.fetchSyncData(syncToken);
        if (res.success && res.payload) {
          const unpacked = SyncManager.unpackageSyncData(res.payload);
          if (unpacked) {
            const mergeResult = SyncManager.mergeProgress(unpacked);
            await StorageManager.importBackup(mergeResult.data);
            this.settings = StorageManager.getSettings();
            this.applyTheme(this.settings.theme || 'light');
            this.refreshAllViews();
            this.showToast(`🎉 Đồng bộ thành công! Đã cập nhật ${mergeResult.stats.total} thẻ FSRS`, 'success', 4000);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    } catch (e) {
      console.warn('Auto sync URL err:', e);
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
