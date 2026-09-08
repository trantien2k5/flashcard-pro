/**
 * Application Entry Point - Orchestrates Navigation, Views, FSRS Study Controller & Settings
 */

import { DeckManager } from '../core/vocabulary/selectors.js';
import { StorageManager } from '../services/storage.js';
import { StudySession } from '../core/learning/study-session.js';
import { StatsManager } from '../core/statistics/stats.js';
import { SyncManager } from '../services/sync.js';
import { AppRouter } from './router.js';
import { scrollToTop } from '../utils/dom.js';

// Feature Views & Subpages
import { renderReviewTab } from '../features/home/review-view.js';
import { renderDecksTab } from '../features/topics/decks-view.js';
import { openSubtopicsPage, renderSubtopicsPage } from '../features/topics/subtopics-view.js';
import { openSubtopicDetailPage, renderSubtopicDetailPage } from '../shared/modal.js';
import { openSubtopicWordsPage, renderSubtopicWordsPage } from '../features/topics/subtopic-words-view.js';
import { renderStatsTab } from '../features/stats/stats-view.js';
import { setupSettingsUI } from '../features/settings/settings-view.js';
import { renderProfileTab } from '../features/profile/profile-view.js';

// Shared Components & Controls
import { setupSearch } from '../shared/search.js';
import { setupSyncController, openSyncModal } from '../shared/sync-modal.js';
import {
  setupStudyControls,
  startStudySession,
  handleCardChange,
  handleStudyFinish,
  showSummaryModal
} from '../features/study/study-view.js';
import { showToast, showConfirm } from '../shared/feedback.js';

// Re-export constants for full compatibility
export { DECK_ENGLISH_NAMES, SUBTOPIC_ICONS, getSubtopicIcon } from '../config/app.js';
export { Rating, State, STABILITY_TIERS } from '../config/fsrs.js';

export class FlashcardApp {
  constructor() {
    this.deckManager = new DeckManager();
    this.settings = StorageManager.getSettings();
    this.router = new AppRouter(this);

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
      // 1. Áp dụng Theme & Cấu hình cuộn trang
      try {
        this.applyTheme(this.settings?.theme || 'light');
        if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
      } catch (e) {}

      // 2. Khởi tạo tầng lưu trữ IndexedDB
      try {
        if (typeof StorageManager.initStorage === 'function') {
          await StorageManager.initStorage();
        } else if (typeof window !== 'undefined' && window.StorageManager && typeof window.StorageManager.initStorage === 'function') {
          await window.StorageManager.initStorage();
        }
      } catch (e) {
        console.warn('initStorage non-blocking warn:', e);
      }

      // 3. Khởi tạo danh mục Decks từ data/
      await this.deckManager.init();

      // 4. Khởi tạo giao diện các tab và thành phần
      this.router.setupNavigation();
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

      // 6. Kiểm tra auto-sync từ URL (khi quét mã QR bằng camera điện thoại)
      this.checkUrlSync();
    } catch (err) {
      console.error('Lỗi khi khởi tạo FlashcardApp:', err);
      try {
        this.showToast('Lỗi khởi động: ' + (err?.message || err), 'error');
      } catch (e) {}
    }
  }

  scrollToTop() {
    scrollToTop();
  }

  switchTab(tabId) {
    this.router.switchTab(tabId);
  }

  /**
   * Cập nhật toàn bộ các view và chỉ số (Tối ưu hóa tránh Forced Reflow)
   */
  refreshAllViews() {
    // 1. Ưu tiên render tab đang hiển thị ngay lập tức
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

    // 2. Cập nhật huy hiệu Streak & Header (Cả Mobile và Desktop Sidebar)
    this.updateHeaderBadges();

    // 3. Hoãn nạp ngầm các tab không hoạt động sang khung hình kế tiếp
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
      
      // Mobile Header Streak
      const streakEl = document.getElementById('streak-count');
      if (streakEl) streakEl.textContent = streak;

      // Desktop Sidebar Streak
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
    try {
      renderReviewTab(this);
    } catch (err) {
      console.error('Lỗi renderReviewTab:', err);
    }
  }

  renderDecksTab() {
    try {
      renderDecksTab(this);
    } catch (err) {
      console.error('Lỗi renderDecksTab:', err);
    }
  }

  openSubtopicsPage(deckId) {
    openSubtopicsPage(this, deckId);
  }

  openSubtopics(deckId) {
    this.openSubtopicsPage(deckId);
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
    try {
      renderStatsTab(this);
    } catch (err) {
      console.error('Lỗi renderStatsTab:', err);
    }
  }

  renderProfileTab() {
    try {
      renderProfileTab(this);
    } catch (err) {
      console.error('Lỗi renderProfileTab:', err);
    }
  }

  openSubtopicDetail(deckId, subtopicName) {
    this.openSubtopicDetailPage(deckId, subtopicName);
  }

  openSubtopicWords(deckId, subtopicName) {
    this.openSubtopicWordsPage(deckId, subtopicName);
  }

  startStudySession(queue) {
    startStudySession(this, queue);
  }

  openSyncModal() {
    openSyncModal(this);
  }

  async checkUrlSync() {
    try {
      if (typeof window === 'undefined' || !window.location) return;
      const urlParams = new URLSearchParams(window.location.search);
      
      // 1. Quét mã QR bằng Camera ngoài (?pair=XXXXXX) -> Bắt tay 2 chiều tự động
      const pairPin = urlParams.get('pair');
      if (pairPin) {
        this.showToast('Đang bắt tay đồng bộ 2 chiều với máy kia...', 'info', 3000);
        const res = await SyncManager.executeClientHandshake(pairPin);
        if (res.success) {
          this.settings = StorageManager.getSettings();
          this.applyTheme(this.settings.theme || 'light');
          this.refreshAllViews();
          this.showToast(`🎉 Đồng bộ 2 chiều thành công! Cả 2 máy đã cập nhật.`, 'success', 5000);
        } else {
          this.showToast(res.error || 'Không thể kết nối với máy kia.', 'error');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // 2. Token nén (?sync=TOKEN)
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

// Khởi chạy App khi DOM sẵn sàng (Xử lý an toàn cả khi DOM đã nạp xong từ trước)
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
