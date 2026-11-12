/**
 * Flashcard English Pro - Điểm khởi động & Bộ điều phối ứng dụng chính
 * Quản lý vòng đời App, Router chuyển đổi Tab, Khởi tạo trạng thái và Kết nối sự kiện
 */

import { DeckManager } from './core/selectors.js';
import { StorageManager } from './services/storage.js';
import { StudySession } from './core/session.js';
import { BehavioralOptimizer } from './core/stats.js';
import { scrollToTop } from './utils.js';

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
import { renderLibraryTab } from './views/library.js';
import { renderStatsTab } from './views/stats.js';
import { renderToeicTestTab } from './views/toeic-test.js';
import { setupSettingsUI } from './views/settings.js';
import {
  setupStudyControls,
  startStudySession as startStudyView,
  handleCardChange,
  handleStudyFinish,
  switchStudyPriority
} from './views/study.js';
import { startQuizSession } from './views/quiz.js';
import { renderReelsTab } from './views/reels.js';
import { setupSearch, showToast, showConfirm, mountGlobalModals } from './views/components.js';
import { APP_CONFIG } from './config.js';
import { registerAppServiceWorker, checkAppUpdate } from './app/pwa.js';
import {
  bindAppNavigation,
  renderTabContent,
  switchAppTab,
  updateAppHeaderBadges,
  applyAppTheme
} from './app/navigation.js';

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
    this.swRegistration = null;

    this.studySession = new StudySession({
      deckManager: this.deckManager,
      settings: this.settings,
      relearnInSession: true,
      relearnStepOffset: 4,
      onCardChange: (card, progress) => handleCardChange(this, card, progress),
      onFinish: (sessionStats) => handleStudyFinish(this, sessionStats)
    });
  }

  async init() {
    try {
      mountGlobalModals();

      try {
        this.applyTheme(this.settings?.theme || 'light');
        if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
        }
      } catch (e) {}

      try {
        if (typeof StorageManager.initStorage === 'function') {
          await StorageManager.initStorage();
        }
      } catch (e) {
        console.warn('initStorage non-blocking warn:', e);
      }

      await this.deckManager.init();
      if (typeof window !== 'undefined') {
        window.deckManager = this.deckManager;
        window.app = this;
      }

      this.setupNavigation();
      try { setupStudyControls(this); } catch (e) { console.warn('setupStudyControls:', e); }
      try { setupSettingsUI(this); } catch (e) { console.warn('setupSettingsUI:', e); }
      try { setupSearch(this); } catch (e) { console.warn('setupSearch:', e); }

      const verBadge = document.getElementById('app-version-badge');
      if (verBadge && APP_CONFIG?.version) {
        verBadge.textContent = `v${APP_CONFIG.version}`;
      }

      this.switchTab('tab-review');
      this.updateHeaderBadges();

      if (typeof window !== 'undefined') {
        const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 120));
        scheduleIdle(() => {
          try {
            if (this.deckManager && this.settings) {
              this.deckManager.getStudyQueue(null, this.settings, null, { mode: 'due_first' });
            }
            BehavioralOptimizer.autoCalibrateBackground(this);
          } catch (e) {}
        });
      }

      this.registerServiceWorker();
    } catch (err) {
      console.error('Lỗi khi khởi tạo FlashcardApp:', err);
      try {
        this.showToast('Lỗi khởi động: ' + (err?.message || err), 'error');
      } catch (e) {}
    }
  }

  registerServiceWorker() {
    registerAppServiceWorker(this);
  }

  async checkUpdate(options = {}) {
    return checkAppUpdate(this, options);
  }

  scrollToTop() {
    scrollToTop();
  }

  setupNavigation() {
    bindAppNavigation(this);
  }

  switchTab(tabId) {
    switchAppTab(this, tabId);
  }

  refreshAllViews() {
    if (this.deckManager) {
      this.deckManager.invalidateStatsCache();
    }
    renderTabContent(this, this.activeTab);
    this.updateHeaderBadges();

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        if (this.activeTab !== 'tab-decks') this.renderDecksTab();
      });
    }
  }

  updateHeaderBadges() {
    updateAppHeaderBadges();
  }

  applyTheme(theme) {
    applyAppTheme(theme);
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

  openSubtopicsPage(deckId) { openSubtopicsPage(this, deckId); }
  renderSubtopicsPage(deckId) { renderSubtopicsPage(this, deckId); }
  openSubtopicDetailPage(deckId, subtopicName) { openSubtopicDetailPage(this, deckId, subtopicName); }
  renderSubtopicDetailPage(deckId, subtopicName) { renderSubtopicDetailPage(this, deckId, subtopicName); }
  openSubtopicWordsPage(deckId, subtopicName) { openSubtopicWordsPage(this, deckId, subtopicName); }
  renderSubtopicWordsPage(deckId, subtopicName) { renderSubtopicWordsPage(this, deckId, subtopicName); }

  renderStatsTab() {
    try { renderStatsTab(this); } catch (err) { console.error('Lỗi renderStatsTab:', err); }
  }

  renderSettingsTab() {
    try { setupSettingsUI(this); } catch (err) { console.error('Lỗi renderSettingsTab:', err); }
  }

  renderToeicTestTab() {
    try { renderToeicTestTab(this); } catch (err) { console.error('Lỗi renderToeicTestTab:', err); }
  }

  async startStudySession(deckId = null, subtopic = null, customCards = null, options = {}) {
    try {
      let queue = [];
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
        } else if (options && options.mode === 'weak_hunter') {
          this.showToast('Tuyệt vời! Bạn không có từ khó nào cần củng cố lúc này.', 'success');
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

  changeStudyPriority(mode) {
    return switchStudyPriority(this, mode);
  }

  startQuizSession(queue = null, options = {}) {
    try {
      startQuizSession(this, Array.isArray(queue) ? queue : null, options);
    } catch (err) {
      console.error('Lỗi startQuizSession:', err);
      this.showToast('Lỗi khi mở phiên trắc nghiệm: ' + (err?.message || err), 'error');
    }
  }

  renderReelsTab(customQueue = null, options = {}) {
    try {
      renderReelsTab(this, customQueue, options);
    } catch (err) {
      console.error('Lỗi renderReelsTab:', err);
    }
  }

  startReelsSession(queue = null, options = {}) {
    try {
      this.switchTab('tab-reels');
      if (Array.isArray(queue) && queue.length > 0) {
        this.renderReelsTab(queue, { ...options, forceReload: true });
      }
    } catch (err) {
      console.error('Lỗi startReelsSession:', err);
      this.showToast('Lỗi khi mở phiên lướt từ vựng: ' + (err?.message || err), 'error');
    }
  }

  showConfirm(options) { return showConfirm(options); }
  showToast(message, type, duration) { return showToast(message, type, duration); }
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
