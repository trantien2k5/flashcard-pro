/**
 * Flashcard English Pro - Shared UI Components
 * Consolidates Toast Notifications, Confirm Dialog, Spotlight Search & Sync Modal
 */

import { StorageManager } from '../services/storage.js';
import { State } from '../core/fsrs.js';
import { escapeHTML, escapeRegex } from '../utils.js';
import { speak } from '../services/audio.js';
import { SyncManager, SimpleQRCode } from '../services/sync.js';

/* ==========================================================================
   0. MODALS DYNAMIC MOUNTING (APP SHELL ARCHITECTURE)
   ========================================================================== */

export function mountGlobalModals() {
  const root = document.getElementById('modals-root') || document.body;

  // 1. Toast Container
  if (!document.getElementById('toast-container')) {
    const toastDiv = document.createElement('div');
    toastDiv.id = 'toast-container';
    toastDiv.className = 'toast-container';
    document.body.appendChild(toastDiv);
  }

  // 2. Custom Confirmation Modal
  if (!document.getElementById('app-confirm-modal')) {
    const confirmModal = document.createElement('div');
    confirmModal.id = 'app-confirm-modal';
    confirmModal.className = 'modal-backdrop';
    confirmModal.innerHTML = `
      <div class="modal-dialog confirm-dialog">
        <button class="btn-icon-close confirm-modal-close" id="btn-confirm-close" title="Đóng (Esc)">✕</button>
        <div class="confirm-icon-wrapper" id="confirm-icon-box">
          <span id="confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </span>
        </div>
        <h3 class="confirm-title" id="confirm-title">Thoát phiên học?</h3>
        <p class="confirm-message" id="confirm-message">Bạn có chắc chắn muốn thoát phiên học này không?</p>
        <div class="confirm-actions">
          <button type="button" class="btn-confirm-secondary" id="btn-confirm-cancel">
            <span>Hủy</span>
            <kbd class="kbd-pill-sm">Esc</kbd>
          </button>
          <button type="button" class="btn-confirm-primary" id="btn-confirm-ok">
            <span>Xác nhận</span>
            <kbd class="kbd-pill-sm" style="background: rgba(255, 255, 255, 0.22); color: #ffffff; border-color: rgba(255, 255, 255, 0.35);">Enter</kbd>
          </button>
        </div>
      </div>
    `;
    root.appendChild(confirmModal);
  }

  // 3. Subtopic Detail Modal
  if (!document.getElementById('subtopic-detail-modal')) {
    const subtopicModal = document.createElement('div');
    subtopicModal.id = 'subtopic-detail-modal';
    subtopicModal.className = 'modal-backdrop';
    subtopicModal.innerHTML = `
      <div class="modal-dialog subtopic-modal-dialog">
        <div class="subtopic-modal-header">
          <div class="subtopic-modal-title-group">
            <div class="subtopic-modal-icon" id="subtopic-detail-icon">📖</div>
            <div class="subtopic-modal-title-text">
              <h3 class="subtopic-modal-title" id="subtopic-detail-title">Chủ đề con</h3>
              <div class="subtopic-modal-subtitle" id="subtopic-detail-meta">0 từ vựng • 0 cần ôn</div>
            </div>
          </div>
          <button class="btn-icon-close" id="btn-close-subtopic-modal" title="Đóng">✕</button>
        </div>

        <div class="subtopic-modal-body">
          <div class="subtopic-overview-stats">
            <div class="overview-stat-pill">
              <span class="overview-stat-num" id="subtopic-stat-total">0</span>
              <span class="overview-stat-lbl">Tổng số từ</span>
            </div>
            <div class="overview-stat-pill">
              <span class="overview-stat-num text-success" id="subtopic-stat-learned">0</span>
              <span class="overview-stat-lbl">Đã thuộc</span>
            </div>
            <div class="overview-stat-pill">
              <span class="overview-stat-num text-warning" id="subtopic-stat-due">0</span>
              <span class="overview-stat-lbl">Cần ôn</span>
            </div>
          </div>

          <div class="deck-progress-bar-bg" style="margin-top: 14px;">
            <div class="deck-progress-fill" id="subtopic-detail-progress-fill" style="width: 0%;"></div>
          </div>
          <div class="subpage-deck-footer">
            <span id="subtopic-detail-progress-text">Tiến độ: 0/0 từ</span>
            <span id="subtopic-detail-due-status"></span>
          </div>

          <div class="subtopic-action-group">
            <button id="btn-start-subtopic-study" class="btn-primary-hero btn-modal-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              <span>Bắt đầu học</span>
            </button>
            <button id="btn-view-subtopic-words" class="btn-secondary-action btn-modal-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span id="btn-view-words-text">Danh sách từ</span>
            </button>
          </div>
        </div>
      </div>
    `;
    root.appendChild(subtopicModal);
  }

  // 4. Study Summary Modal
  if (!document.getElementById('study-summary-modal')) {
    const summaryModal = document.createElement('div');
    summaryModal.id = 'study-summary-modal';
    summaryModal.className = 'modal-backdrop';
    summaryModal.innerHTML = `
      <div class="modal-dialog study-summary-dialog">
        <div class="summary-hero-badge">
          <span class="summary-trophy-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7.5a1.5 1.5 0 0 0-1.5 1.5v.5h12v-.5a1.5 1.5 0 0 0-1.5-1.5H15c-.55 0-1-.45-1-1v-2.34"/><path d="M18 4H6v7a6 6 0 0 0 12 0V4Z"/></svg>
          </span>
        </div>
        <h3 class="summary-title" id="summary-modal-title">Xuất sắc! Đã hoàn thành</h3>
        <p class="summary-subtitle" id="summary-modal-subtitle">Trí nhớ của bạn đã được củng cố với thuật toán FSRS-6</p>

        <div class="summary-stats-grid">
          <div class="summary-stat-box total">
            <span class="summary-stat-num" id="sum-stat-total">0</span>
            <span class="summary-stat-lbl">Thẻ đã học</span>
          </div>
          <div class="summary-stat-box retention">
            <span class="summary-stat-num" id="sum-stat-retention">100%</span>
            <span class="summary-stat-lbl">Tỉ lệ nhớ</span>
          </div>
        </div>

        <div class="summary-fsrs-breakdown">
          <div class="summary-fsrs-pill again">
            <span class="fsrs-pill-dot"></span>
            <span>Quên: <strong id="sum-stat-again">0</strong></span>
          </div>
          <div class="summary-fsrs-pill hard">
            <span class="fsrs-pill-dot"></span>
            <span>Khó: <strong id="sum-stat-hard">0</strong></span>
          </div>
          <div class="summary-fsrs-pill good">
            <span class="fsrs-pill-dot"></span>
            <span>Nhớ: <strong id="sum-stat-good">0</strong></span>
          </div>
          <div class="summary-fsrs-pill easy">
            <span class="fsrs-pill-dot"></span>
            <span>Dễ: <strong id="sum-stat-easy">0</strong></span>
          </div>
        </div>

        <div class="summary-actions">
          <button class="btn-primary-hero btn-summary-home-btn" id="btn-summary-home">
            <span>Về màn hình ôn tập</span>
          </button>
        </div>
      </div>
    `;
    root.appendChild(summaryModal);
  }

  // 5. Spotlight Search Modal
  if (!document.getElementById('search-modal')) {
    const searchModal = document.createElement('div');
    searchModal.id = 'search-modal';
    searchModal.className = 'modal-backdrop';
    searchModal.innerHTML = `
      <div class="modal-dialog search-modal-dialog">
        <div class="search-modal-header">
          <div class="search-box-wrapper">
            <span class="search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input type="text" id="global-search-input" class="search-input" placeholder="Tìm từ vựng, nghĩa, IPA, ví dụ, cấp độ CEFR..." autocomplete="off" spellcheck="false">
            <button type="button" id="btn-clear-search-input" class="search-clear-btn" style="display: none;" title="Xóa từ khóa">✕</button>
          </div>
          <button type="button" class="btn-icon-close" id="btn-close-search-modal" title="Đóng tìm kiếm" aria-label="Đóng tìm kiếm">✕</button>
        </div>

        <div class="search-quick-filters" id="search-quick-filters">
          <button class="search-filter-tag active" data-search-filter="all" type="button">Tất cả</button>
          <button class="search-filter-tag" data-search-filter="pos:noun" type="button">Danh từ</button>
          <button class="search-filter-tag" data-search-filter="pos:verb" type="button">Động từ</button>
          <button class="search-filter-tag" data-search-filter="pos:adj" type="button">Tính từ</button>
          <button class="search-filter-tag" data-search-filter="cefr:b1" type="button">B1/B2</button>
          <button class="search-filter-tag" data-search-filter="cefr:c1" type="button">C1/C2</button>
          <button class="search-filter-tag" data-search-filter="state:due" type="button">Cần ôn</button>
          <button class="search-filter-tag" data-search-filter="state:new" type="button">Chưa học</button>
        </div>

        <div id="search-empty-state" class="search-empty-state"></div>
        <div class="search-modal-results" id="search-modal-results" style="display: none;"></div>

        <div class="search-modal-footer">
          <div class="search-shortcut-hints">
            <span><kbd>Esc</kbd> Đóng</span>
            <span><kbd>↵</kbd> Chi tiết</span>
            <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Tìm kiếm</span>
          </div>
          <span id="search-result-count" class="search-result-count-label"></span>
        </div>
      </div>
    `;
    root.appendChild(searchModal);
  }

  // 6. Universal Sync Modal
  if (!document.getElementById('sync-modal')) {
    const syncModal = document.createElement('div');
    syncModal.id = 'sync-modal';
    syncModal.className = 'modal-backdrop';
    syncModal.innerHTML = `
      <div class="modal-dialog sync-modal-dialog">
        <div class="sync-modal-header">
          <div class="sync-modal-title-group">
            <div class="sync-modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
            </div>
            <div class="sync-modal-title-text">
              <h3 class="sync-modal-title">Đồng bộ Thông Minh 2 Chiều</h3>
              <p class="sync-modal-subtitle">1 máy mở QR — 1 máy quét (hoặc nhập PIN) ➔ Cả 2 cùng lên bản mới nhất</p>
            </div>
          </div>
          <button class="btn-icon-close" id="btn-close-sync-modal" title="Đóng">✕</button>
        </div>

        <div class="sync-modal-body">
          <div class="sync-scanner-action-box">
            <div id="sync-camera-box" class="camera-scanner-wrapper" style="display: none;">
              <video id="sync-scanner-video" class="camera-scanner-video" playsinline autoplay muted></video>
              <div class="camera-reticle"><div class="camera-laser"></div></div>
              <button type="button" id="btn-stop-camera" class="btn-stop-camera" style="display: none;">✕ Tắt Camera</button>
            </div>

            <button type="button" id="btn-start-camera" class="btn-sync-action primary" style="width: 100%; padding: 13px; font-size: 0.95rem;">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <span>Quét mã QR trên máy kia</span>
            </button>
          </div>

          <div class="sync-divider"><span>HOẶC NHẬP MÃ PIN TỪ MÁY KIA</span></div>

          <div class="sync-input-field-wrapper">
            <input type="text" id="input-sync-pin" class="sync-input-field" placeholder="Nhập 6 số PIN (VD: 849201)..." maxlength="10" inputmode="numeric" autocomplete="off" />
            <button type="button" id="btn-submit-pin" class="btn-paste-inside">Kết nối</button>
          </div>

          <div class="sync-divider"><span>HOẶC ĐỂ MÁY KIA QUÉT MÃ NÀY</span></div>

          <div class="sync-receive-card">
            <div class="sync-radar-status" id="sync-host-status">
              <span class="radar-dot"></span>
              <span id="sync-host-status-text">Đang tạo trạm kết nối...</span>
            </div>

            <div class="sync-qr-frame" id="sync-qr-code-container">
              <div class="sync-loading">Đang tạo mã QR...</div>
            </div>

            <div class="sync-pin-banner" id="sync-pin-banner" style="display: none;">
              <span class="sync-pin-title">MÃ PIN KẾT NỐI:</span>
              <span class="sync-pin-number" id="sync-pin-number">------</span>
            </div>

            <div class="sync-actions-row">
              <button type="button" class="btn-sync-action" id="btn-create-host-session">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                <span>Đổi mã mới</span>
              </button>
              <button type="button" class="btn-sync-action" id="btn-copy-sync-link" style="display: none;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Sao chép link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    root.appendChild(syncModal);
  }
}

/* ==========================================================================
   1. FEEDBACK & NOTIFICATIONS (TOAST & CONFIRM MODAL)
   ========================================================================== */

/**
 * Custom Confirmation Modal (thay thế window.confirm hoàn toàn)
 */
export function showConfirm({
  title = 'Thoát phiên học?',
  message = 'Bạn có chắc chắn muốn thoát phiên học này không?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  icon = '🚪'
} = {}) {
  mountGlobalModals();
  return new Promise((resolve) => {
    const modal = document.getElementById('app-confirm-modal');
    if (!modal) {
      resolve(window.confirm(message));
      return;
    }

    const iconEl = document.getElementById('confirm-icon');
    const iconBox = document.getElementById('confirm-icon-box');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const btnCloseModal = document.getElementById('btn-confirm-close');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnOk = document.getElementById('btn-confirm-ok');

    if (iconEl) iconEl.textContent = icon;
    if (iconBox) iconBox.className = `confirm-icon-wrapper ${type}`;
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (btnCancel) btnCancel.textContent = cancelText;
    if (btnOk) {
      btnOk.textContent = confirmText;
      btnOk.className = `btn-confirm-primary ${type}`;
    }

    modal.classList.add('active');

    let keydownHandler = null;
    const cleanup = () => {
      modal.classList.remove('active');
      if (btnOk) btnOk.onclick = null;
      if (btnCancel) btnCancel.onclick = null;
      if (btnCloseModal) btnCloseModal.onclick = null;
      modal.onclick = null;
      if (keydownHandler) {
        window.removeEventListener('keydown', keydownHandler);
      }
    };

    keydownHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        resolve(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        resolve(true);
      }
    };
    window.addEventListener('keydown', keydownHandler);

    if (btnOk) {
      btnOk.onclick = () => {
        cleanup();
        resolve(true);
      };
    }

    if (btnCancel) {
      btnCancel.onclick = () => {
        cleanup();
        resolve(false);
      };
    }

    if (btnCloseModal) {
      btnCloseModal.onclick = () => {
        cleanup();
        resolve(false);
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        cleanup();
        resolve(false);
      }
    };
  });
}

/**
 * Upgraded In-App Floating Toast Notification (thay thế window.alert)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || icons.info;

  const contentEl = document.createElement('div');
  contentEl.className = 'toast-content';
  contentEl.textContent = String(message || '');

  toast.append(iconEl, contentEl);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-12px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ==========================================================================
   2. SPOTLIGHT SEARCH CONTROLLER
   ========================================================================== */

const SEARCH_HISTORY_KEY = 'flashcard_search_history_v2';
const MAX_HISTORY_ITEMS = 8;

const HOT_SEARCH_TAGS = [
  { label: '💼 Business & Work', query: 'work' },
  { label: '🗣️ Giao tiếp (B1)', query: 'b1' },
  { label: '✈️ Du lịch (Travel)', query: 'travel' },
  { label: '💰 Tài chính & Tiền', query: 'money' },
  { label: '🎯 Nâng cao (C1/C2)', query: 'c1' },
  { label: '🍔 Ăn uống (Food)', query: 'food' },
  { label: '🩺 Sức khỏe (Health)', query: 'health' }
];

export function setupSearch(app) {
  try {
    mountGlobalModals();
    const btnOpenHeader = document.getElementById('btn-header-search');
    const searchModal = document.getElementById('search-modal');
    const btnCloseSearch = document.getElementById('btn-close-search-modal');
    const searchInput = document.getElementById('global-search-input');
    const btnClearInput = document.getElementById('btn-clear-search-input');
    const filterTagsContainer = document.getElementById('search-quick-filters');
    const emptyStateContainer = document.getElementById('search-empty-state');
    const resultsContainer = document.getElementById('search-modal-results');
    const resultCountLabel = document.getElementById('search-result-count');

    if (!searchModal || !searchInput) return;

    let currentFilter = 'all';
    let currentResults = [];
    let selectedIndex = -1;
    let searchDebounceTimer = null;

    const getSearchHistory = () => {
      try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    };

    const saveSearchHistory = (history) => {
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
      } catch (e) {}
    };

    const addQueryToHistory = (query) => {
      const q = query.trim();
      if (!q || q.length < 2) return;
      let history = getSearchHistory();
      history = history.filter(item => item.toLowerCase() !== q.toLowerCase());
      history.unshift(q);
      saveSearchHistory(history);
    };

    const removeQueryFromHistory = (query) => {
      let history = getSearchHistory();
      history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
      saveSearchHistory(history);
      renderSearchSuggestions();
    };

    const highlightKeyword = (text, keyword) => {
      if (!text || !keyword) return escapeHTML(text || '');
      const escaped = escapeHTML(text);
      const escapedKw = escapeRegex(escapeHTML(keyword));
      const regex = new RegExp(`(${escapedKw})`, 'gi');
      return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
    };

    const openSearchModal = (initialQuery = '') => {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      searchInput.value = initialQuery;
      if (initialQuery) {
        performSearch(initialQuery);
      } else {
        renderSearchSuggestions();
      }
      setTimeout(() => searchInput.focus(), 80);
    };

    const closeSearchModal = () => {
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
      searchInput.value = '';
      if (btnClearInput) btnClearInput.style.display = 'none';
      if (emptyStateContainer) emptyStateContainer.style.display = 'none';
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
      }
      if (resultCountLabel) resultCountLabel.textContent = '';
      selectedIndex = -1;
    };

    if (btnOpenHeader) btnOpenHeader.onclick = () => openSearchModal();
    if (btnCloseSearch) btnCloseSearch.onclick = () => closeSearchModal();

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearchModal();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchModal.classList.contains('active')) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === 'Escape' && searchModal.classList.contains('active')) {
        closeSearchModal();
      } else if (searchModal.classList.contains('active') && currentResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % currentResults.length;
          updateSelectedResult();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
          updateSelectedResult();
        } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < currentResults.length) {
          e.preventDefault();
          const target = currentResults[selectedIndex];
          if (target && target.card) {
            addQueryToHistory(searchInput.value || target.card.word);
            closeSearchModal();
            app.startStudySession(target.card.deckId || null, null, [target.card]);
          }
        }
      }
    });

    const updateSelectedResult = () => {
      if (!resultsContainer) return;
      const rows = resultsContainer.querySelectorAll('.search-result-row');
      rows.forEach((r, idx) => {
        if (idx === selectedIndex) {
          r.classList.add('selected');
          r.scrollIntoView({ block: 'nearest' });
        } else {
          r.classList.remove('selected');
        }
      });
    };

    const renderSearchSuggestions = () => {
      if (!emptyStateContainer) return;
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
      }
      if (resultCountLabel) resultCountLabel.textContent = '';
      emptyStateContainer.style.display = 'block';

      const history = getSearchHistory();
      let html = '';

      if (history.length > 0) {
        html += `
          <div class="search-section-title">
            <span>🕒 Lịch sử tìm kiếm gần đây</span>
            <button class="btn-clear-all-history" id="btn-clear-all-history">Xóa lịch sử</button>
          </div>
          <div class="search-history-chips">
            ${history.map(item => `
              <div class="search-chip history-chip" data-query="${escapeHTML(item)}">
                <span>${escapeHTML(item)}</span>
                <span class="btn-remove-chip" data-remove="${escapeHTML(item)}" title="Xóa">×</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      html += `
        <div class="search-section-title" style="margin-top: ${history.length > 0 ? '16px' : '0'};">
          <span>🔥 Tìm kiếm theo ngữ cảnh nổi bật</span>
        </div>
        <div class="search-hot-chips">
          ${HOT_SEARCH_TAGS.map(tag => `
            <div class="search-chip hot-chip" data-query="${escapeHTML(tag.query)}">
              ${escapeHTML(tag.label)}
            </div>
          `).join('')}
        </div>
      `;

      emptyStateContainer.innerHTML = html;

      const clearAllBtn = emptyStateContainer.querySelector('#btn-clear-all-history');
      if (clearAllBtn) {
        clearAllBtn.onclick = () => {
          localStorage.removeItem(SEARCH_HISTORY_KEY);
          renderSearchSuggestions();
        };
      }

      emptyStateContainer.querySelectorAll('.btn-remove-chip').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const query = btn.dataset.remove;
          if (query) removeQueryFromHistory(query);
        };
      });

      emptyStateContainer.querySelectorAll('.search-chip').forEach(chip => {
        chip.onclick = () => {
          const q = chip.dataset.query;
          if (q) {
            searchInput.value = q;
            performSearch(q);
          }
        };
      });
    };

    if (filterTagsContainer) {
      filterTagsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.search-filter-tag');
        if (!btn) return;
        filterTagsContainer.querySelectorAll('.search-filter-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.searchFilter || btn.dataset.filter || 'all';
        if (searchInput.value.trim()) {
          performSearch(searchInput.value.trim());
        }
      });
    }

    if (btnClearInput) {
      btnClearInput.onclick = () => {
        searchInput.value = '';
        searchInput.focus();
        btnClearInput.style.display = 'none';
        renderSearchSuggestions();
      };
    }

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (btnClearInput) {
        btnClearInput.style.display = q ? 'flex' : 'none';
      }
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      if (!q) {
        renderSearchSuggestions();
        return;
      }
      searchDebounceTimer = setTimeout(() => {
        performSearch(q);
      }, 150);
    });

    const performSearch = (rawQuery) => {
      const q = rawQuery.toLowerCase().trim();
      if (!q) {
        renderSearchSuggestions();
        return;
      }

      if (emptyStateContainer) emptyStateContainer.style.display = 'none';
      if (!resultsContainer) return;
      resultsContainer.style.display = 'flex';

      const allCards = app.deckManager.getAllCards();
      const cardStates = StorageManager.getAllCardStates();

      let matches = [];
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        const word = (card.word || '').toLowerCase();
        const meaning = (card.meaning || '').toLowerCase();
        const pos = (card.pos || '').toLowerCase();
        const cefr = (card.level || card.cefr || '').toLowerCase();
        const ipa = (card.ipa || card.phonetic || '').toLowerCase();
        const example = (card.example || '').toLowerCase();
        const exampleVi = (card.exampleVi || '').toLowerCase();
        const subtopic = (card.subtopic || '').toLowerCase();

        let isMatch = false;
        let score = 0;

        if (word === q) {
          isMatch = true;
          score += 100;
        } else if (word.startsWith(q)) {
          isMatch = true;
          score += 60;
        } else if (word.includes(q)) {
          isMatch = true;
          score += 30;
        } else if (meaning.includes(q)) {
          isMatch = true;
          score += 25;
        } else if (cefr === q) {
          isMatch = true;
          score += 20;
        } else if (pos === q) {
          isMatch = true;
          score += 15;
        } else if (ipa.includes(q) || example.includes(q) || exampleVi.includes(q) || subtopic.includes(q)) {
          isMatch = true;
          score += 10;
        }

        if (isMatch) {
          const state = cardStates[card.id];
          const isLearned = state && state.state !== State.New && state.state !== 0;
          const isMastered = isLearned && state.stability >= 21;

          if (currentFilter === 'pos:noun' && pos !== 'noun') continue;
          if (currentFilter === 'pos:verb' && pos !== 'verb') continue;
          if (currentFilter === 'pos:adj' && pos !== 'adjective' && pos !== 'adj') continue;
          if (currentFilter === 'cefr:b1' && cefr !== 'b1' && cefr !== 'b2') continue;
          if (currentFilter === 'cefr:c1' && cefr !== 'c1' && cefr !== 'c2') continue;
          if (currentFilter === 'state:due') {
            const isDue = state && state.state !== State.New && state.due && new Date(state.due) <= new Date();
            if (!isDue) continue;
          }
          if (currentFilter === 'state:new' && isLearned) continue;
          if (currentFilter === 'learned' && !isLearned) continue;
          if (currentFilter === 'new' && isLearned) continue;
          if (currentFilter === 'mastered' && !isMastered) continue;

          matches.push({ card, score, state, isLearned, isMastered });
        }
      }

      matches.sort((a, b) => b.score - a.score);
      currentResults = matches.slice(0, 50);
      selectedIndex = -1;

      if (resultCountLabel) {
        resultCountLabel.textContent = `Tìm thấy ${matches.length} từ vựng phù hợp`;
      }

      renderSearchResults(currentResults, q);
    };

    const renderSearchResults = (items, query) => {
      if (!resultsContainer) return;
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'flex';

      if (items.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-no-result">
            <div class="no-result-icon">🔍</div>
            <div class="no-result-title">Không tìm thấy từ vựng phù hợp</div>
            <div class="no-result-desc">Hãy thử tìm bằng từ tiếng Anh, nghĩa tiếng Việt hoặc cấp độ CEFR (A1, A2, B1, B2, C1, C2)</div>
          </div>
        `;
        return;
      }

      const frag = document.createDocumentFragment();

      items.forEach((item, index) => {
        const { card, state, isLearned, isMastered } = item;
        const deck = app.deckManager.getDeckById(card.deckId || (card.topicIds && card.topicIds[0]));
        const deckName = deck ? (deck.titleEn || deck.title || deck.name) : 'Chủ đề từ vựng';
        const cardIpa = card.ipa || card.phonetic || '';
        const cardCefr = card.level || card.cefr || '';

        let statusBadge = '<span class="badge-status-new">Mới</span>';
        if (isMastered) {
          statusBadge = '<span class="badge-status-mastered">Ghi nhớ sâu</span>';
        } else if (isLearned) {
          statusBadge = `<span class="badge-status-learning">Đang học · S: ${state.stability?.toFixed(1) || '0'}d</span>`;
        }

        const el = document.createElement('div');
        el.className = 'search-result-row';
        el.dataset.index = index;

        el.innerHTML = `
          <div class="search-row-main">
            <div class="search-word-header">
              <span class="search-word-text">${highlightKeyword(card.word, query)}</span>
              ${cardIpa ? `<span class="search-word-phonetic">${highlightKeyword(cardIpa, query)}</span>` : ''}
              ${card.pos ? `<span class="search-word-pos">${card.pos}</span>` : ''}
              ${cardCefr ? `<span class="search-word-cefr ${cardCefr.toLowerCase()}">${cardCefr}</span>` : ''}
              ${statusBadge}
            </div>
            <div class="search-word-meaning">${highlightKeyword(card.meaning, query)}</div>
            ${card.example ? `<div class="search-word-example">${highlightKeyword(card.example, query)}</div>` : ''}
            <div class="search-word-meta">
              <span class="search-meta-deck">📁 ${escapeHTML(deckName)}</span>
              ${card.subtopic ? `<span class="search-meta-sub">🏷️ ${escapeHTML(card.subtopic)}</span>` : ''}
            </div>
          </div>
          <div class="search-row-actions">
            <button class="btn-search-audio" title="Phát âm" data-word="${escapeHTML(card.word)}" type="button">
              🔊
            </button>
          </div>
        `;

        el.addEventListener('click', (e) => {
          if (e.target.closest('.btn-search-audio')) {
            e.stopPropagation();
            speak(card.word, { cardObj: card });
            return;
          }
          addQueryToHistory(query || card.word);
          closeSearchModal();
          app.startStudySession(card.deckId || null, null, [card]);
        });

        frag.appendChild(el);
      });

      resultsContainer.appendChild(frag);
    };

  } catch (err) {
    console.error('Lỗi khi setupSearch:', err);
  }
}

/* ==========================================================================
   3. UNIVERSAL 2-WAY SYNC MODAL CONTROLLER
   ========================================================================== */

let _currentHostSession = null;
let _cameraStream = null;
let _cameraScanRaf = null;
let _scannerCanvas = null;
let _scannerCtx = null;
let _isScanning = false;
let _jsQRLoaderPromise = null;

function getJsQR() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  if (_jsQRLoaderPromise) return _jsQRLoaderPromise;
  _jsQRLoaderPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = () => resolve(window.jsQR);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return _jsQRLoaderPromise;
}

export function setupSyncController(app) {
  mountGlobalModals();
  const modal = document.getElementById('sync-modal');
  if (!modal) return;

  const btnClose = document.getElementById('btn-close-sync-modal');
  if (btnClose) {
    btnClose.onclick = () => closeSyncModal();
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSyncModal();
  });

  const btnStartCamera = document.getElementById('btn-start-camera');
  const btnStopCamera = document.getElementById('btn-stop-camera');

  if (btnStartCamera) {
    btnStartCamera.onclick = async () => {
      await startCameraScanner(app);
    };
  }

  if (btnStopCamera) {
    btnStopCamera.onclick = () => {
      stopCameraScanner();
    };
  }

  const btnCreateHost = document.getElementById('btn-create-host-session');
  if (btnCreateHost) {
    btnCreateHost.onclick = async () => {
      await createHostSession(app);
    };
  }

  const btnSubmitPin = document.getElementById('btn-submit-pin');
  const inputPin = document.getElementById('input-sync-pin');
  if (btnSubmitPin && inputPin) {
    const handlePinConnect = async () => {
      const pinVal = inputPin.value.trim();
      if (!pinVal || pinVal.length < 5) {
        showToast('Vui lòng nhập đủ 6 chữ số mã PIN', 'warning');
        inputPin.focus();
        return;
      }
      btnSubmitPin.disabled = true;
      btnSubmitPin.textContent = 'Đang gửi...';
      showToast('Đang truyền dữ liệu đồng bộ qua mã PIN...', 'info', 4000);

      try {
        const res = await SyncManager.executeClientHandshake(pinVal);
        if (res.success) {
          app.settings = StorageManager.getSettings();
          app.applyTheme(app.settings.theme || 'light');
          app.refreshAllViews();
          showToast(`🎉 Đồng bộ 2 chiều thành công! Đã cập nhật ${res.stats?.total || 0} thẻ`, 'success', 5000);
          inputPin.value = '';
          closeSyncModal();
        } else {
          showToast(res.error || 'Không thể kết nối. Hãy kiểm tra lại mã PIN.', 'error');
        }
      } catch (err) {
        showToast('Lỗi khi kết nối: ' + (err.message || 'Thất bại'), 'error');
      } finally {
        btnSubmitPin.disabled = false;
        btnSubmitPin.textContent = 'Kết nối';
      }
    };

    btnSubmitPin.onclick = handlePinConnect;
    inputPin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePinConnect();
      }
    });
  }
}

export function openSyncModal(app) {
  mountGlobalModals();
  const modal = document.getElementById('sync-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  createHostSession(app);
}

export function closeSyncModal() {
  const modal = document.getElementById('sync-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  stopCameraScanner();
  if (_currentHostSession && typeof _currentHostSession.stop === 'function') {
    _currentHostSession.stop();
    _currentHostSession = null;
  }
}

async function createHostSession(app) {
  const container = document.getElementById('sync-qr-code-container');
  const statusTextEl = document.getElementById('sync-host-status-text');
  const pinBanner = document.getElementById('sync-pin-banner');
  const pinNumberEl = document.getElementById('sync-pin-number');
  const btnCopyLink = document.getElementById('btn-copy-sync-link');

  if (!container) return;

  if (_currentHostSession && typeof _currentHostSession.stop === 'function') {
    _currentHostSession.stop();
    _currentHostSession = null;
  }

  container.innerHTML = '<div class="sync-loading">Đang mở trạm kết nối...</div>';
  if (statusTextEl) statusTextEl.textContent = 'Đang khởi tạo phiên đồng bộ...';
  if (pinBanner) pinBanner.style.display = 'none';

  try {
    _currentHostSession = SyncManager.startUniversalHostSession({
      onConnected: ({ pin, pairUrl }) => {
        container.innerHTML = '';
        SimpleQRCode.render(container, pairUrl, { width: 220, height: 220 });

        if (statusTextEl) {
          statusTextEl.textContent = 'Sẵn sàng · Đang chờ máy kia quét...';
        }
        if (pinBanner && pinNumberEl) {
          pinBanner.style.display = 'flex';
          pinNumberEl.textContent = `${pin.slice(0, 3)} ${pin.slice(3)}`;
        }
        if (btnCopyLink) {
          btnCopyLink.style.display = 'inline-flex';
          btnCopyLink.onclick = () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(pairUrl);
              showToast('Đã sao chép link đồng bộ vào bộ nhớ tạm!', 'success');
            } else {
              showToast(`Mã PIN của bạn: ${pin}`, 'info');
            }
          };
        }
      },
      onSyncCompleted: async ({ pin, stats, data }) => {
        if (statusTextEl) {
          statusTextEl.textContent = '🎉 Đã nhận dữ liệu và hợp nhất thành công!';
        }
        app.settings = StorageManager.getSettings();
        app.applyTheme(app.settings.theme || 'light');
        app.refreshAllViews();
        showToast(`🎉 Đồng bộ 2 chiều thành công! Đã cập nhật ${stats.updated + stats.added} thẻ`, 'success', 5000);
        setTimeout(() => {
          closeSyncModal();
        }, 1500);
      },
      onError: (err) => {
        console.warn('Lỗi Host Session:', err);
        if (statusTextEl) {
          statusTextEl.textContent = 'Mất kết nối mạng. Hãy bấm "Đổi mã mới".';
        }
      }
    });
  } catch (err) {
    console.error('Lỗi khi tạo host session:', err);
    if (container) container.innerHTML = '<div class="sync-error">Không thể tạo mã QR. Hãy thử lại.</div>';
  }
}

async function startCameraScanner(app) {
  const video = document.getElementById('sync-scanner-video');
  const cameraBox = document.getElementById('sync-camera-box');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');

  if (!video || !cameraBox) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    _cameraStream = stream;
    video.srcObject = stream;
    await video.play();

    cameraBox.style.display = 'block';
    if (btnStart) btnStart.style.display = 'none';
    if (btnStop) btnStop.style.display = 'inline-flex';

    _isScanning = true;
    scanVideoFrame(app, video);
  } catch (err) {
    console.error('Lỗi truy cập camera:', err);
    showToast('Không thể truy cập camera: ' + (err.message || 'Bị từ chối'), 'error');
  }
}

function stopCameraScanner() {
  _isScanning = false;
  if (_cameraScanRaf) {
    cancelAnimationFrame(_cameraScanRaf);
    _cameraScanRaf = null;
  }
  if (_cameraStream) {
    _cameraStream.getTracks().forEach(track => track.stop());
    _cameraStream = null;
  }
  const cameraBox = document.getElementById('sync-camera-box');
  const btnStart = document.getElementById('btn-start-camera');
  const btnStop = document.getElementById('btn-stop-camera');
  if (cameraBox) cameraBox.style.display = 'none';
  if (btnStart) btnStart.style.display = 'inline-flex';
  if (btnStop) btnStop.style.display = 'none';
}

async function scanVideoFrame(app, video) {
  if (!_isScanning) return;

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    if (!_scannerCanvas) {
      _scannerCanvas = document.createElement('canvas');
      _scannerCtx = _scannerCanvas.getContext('2d', { willReadFrequently: true });
    }

    _scannerCanvas.width = video.videoWidth;
    _scannerCanvas.height = video.videoHeight;
    _scannerCtx.drawImage(video, 0, 0, _scannerCanvas.width, _scannerCanvas.height);

    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(_scannerCanvas);
        if (barcodes && barcodes.length > 0) {
          handleScannedCode(app, barcodes[0].rawValue);
          return;
        }
      } catch (e) {}
    }

    const jsQR = await getJsQR();
    if (jsQR && _scannerCtx) {
      const imageData = _scannerCtx.getImageData(0, 0, _scannerCanvas.width, _scannerCanvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      if (code && code.data) {
        handleScannedCode(app, code.data);
        return;
      }
    }
  }

  if (_isScanning) {
    _cameraScanRaf = requestAnimationFrame(() => scanVideoFrame(app, video));
  }
}

async function handleScannedCode(app, rawData) {
  stopCameraScanner();
  showToast('Đang kết nối và truyền dữ liệu sang máy kia...', 'info', 4000);

  try {
    const res = await SyncManager.executeClientHandshake(rawData);
    if (res.success) {
      app.settings = StorageManager.getSettings();
      app.applyTheme(app.settings.theme || 'light');
      app.refreshAllViews();
      showToast(`🎉 Đồng bộ 2 chiều thành công! Đã cập nhật ${res.stats?.total || 0} thẻ`, 'success', 5000);
      closeSyncModal();
    } else {
      showToast(res.error || 'Đồng bộ thất bại. Vui lòng thử lại.', 'error', 4000);
    }
  } catch (err) {
    console.error('Lỗi phân tích mã QR:', err);
    showToast('Lỗi phân tích mã QR: ' + (err.message || 'Thất bại'), 'error');
  }
}
