/**
 * Flashcard English Pro - Shared UI Components
 * Consolidates Toast Notifications, Confirm Dialog, Spotlight Search & Sync Modal
 */

import { StorageManager } from '../services/storage.js';
import { State } from '../core/fsrs.js';
import { escapeHTML, highlightKeyword } from '../utils.js';
import { speak } from '../services/audio.js';
import { BehavioralOptimizer } from '../core/stats.js';
import { MASTERY_STABILITY_THRESHOLD } from '../config.js';

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
          <span class="summary-trophy-icon">🏆</span>
        </div>
        <h3 class="summary-title" id="summary-modal-title">Xuất sắc! Hoàn thành phiên học</h3>
        <p class="summary-subtitle" id="summary-modal-subtitle">Trí nhớ của bạn vừa được củng cố với thuật toán FSRS-6</p>

        <div class="summary-stats-grid">
          <div class="summary-stat-box total">
            <span class="summary-stat-num" id="sum-stat-total">0</span>
            <span class="summary-stat-lbl">Thẻ đã ôn luyện</span>
          </div>
          <div class="summary-stat-box retention">
            <span class="summary-stat-num" id="sum-stat-retention">100%</span>
            <span class="summary-stat-lbl">Tỉ lệ nhớ phiên này</span>
          </div>
        </div>

        <div class="summary-progression-section">
          <span class="summary-sec-header">Chuyển hóa & Tiến bộ Trí nhớ</span>
          <div class="summary-progression-grid">
            <div class="progression-pill-card prog-new">
              <span class="prog-icon">🌱</span>
              <div class="prog-info">
                <span class="prog-label">Tiếp thu từ mới</span>
                <strong class="prog-val" id="sum-stat-new">+0 từ</strong>
              </div>
            </div>
            <div class="progression-pill-card prog-strengthened">
              <span class="prog-icon">⚡</span>
              <div class="prog-info">
                <span class="prog-label">Tăng độ bền (S)</span>
                <strong class="prog-val" id="sum-stat-strengthened">+0 từ</strong>
              </div>
            </div>
            <div class="progression-pill-card prog-recovered">
              <span class="prog-icon">🛡️</span>
              <div class="prog-info">
                <span class="prog-label">Phục hồi trí nhớ</span>
                <strong class="prog-val" id="sum-stat-recovered">+0 từ</strong>
              </div>
            </div>
            <div class="progression-pill-card prog-relearn">
              <span class="prog-icon">🔄</span>
              <div class="prog-info">
                <span class="prog-label">Đã lên lịch ôn bù</span>
                <strong class="prog-val" id="sum-stat-relearn">0 từ</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="summary-insight-banner" id="summary-insight-banner">
          <span class="insight-icon">💡</span>
          <span class="insight-text" id="summary-insight-text">Thuật toán FSRS-6 đã tự động tối ưu hóa lịch giãn cách để bạn sớm thuần thục toàn bộ từ vựng!</span>
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
    toast.style.transform = 'translateY(8px) scale(0.96)';
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
    const btnOpenSidebar = document.getElementById('btn-sidebar-search');
    if (btnOpenSidebar) btnOpenSidebar.onclick = () => openSearchModal();
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
          const isMastered = isLearned && state.stability >= MASTERY_STABILITY_THRESHOLD;

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
   6. BEHAVIORAL OPTIMIZER MODAL (PHÂN TÍCH HÀNH VI & TỐI ƯU HÓA CÁ NHÂN HÓA)
   ========================================================================== */

export function openBehavioralOptimizerModal(app) {
  let modal = document.getElementById('behavioral-optimizer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'behavioral-optimizer-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const analysis = BehavioralOptimizer.analyze();
  const { profile, recommendations, hasOptimizations } = analysis;

  modal.innerHTML = `
    <div class="modal-dialog optimizer-dialog">
      <div class="modal-header optimizer-header">
        <div class="optimizer-title-group">
          <div class="optimizer-icon">🧠</div>
          <div>
            <h3 class="optimizer-title">Phân tích Hành vi & Tối ưu hóa FSRS</h3>
            <p class="optimizer-subtitle">Tự động cân chỉnh thông số theo nhịp độ tư duy và tỉ lệ nhớ thực tế</p>
          </div>
        </div>
        <button class="btn-icon-close" id="btn-close-optimizer-modal" title="Đóng" aria-label="Đóng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body optimizer-body">
        <!-- 0. Giới thiệu ngắn gọn cơ chế hoạt động -->
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45;">
          💡 <strong>Cách hoạt động:</strong> Hệ thống AI phân tích thời gian bạn suy nghĩ trước khi lật thẻ và tỷ lệ quên thực tế để tự động tinh chỉnh: <em>Độ giãn chu kỳ ôn FSRS, tốc độ đọc phát âm và hạn mức từ mới/ngày</em> cho phù hợp nhất với não bộ của bạn.
        </div>

        <!-- 1. Behavioral Profile Metrics -->
        <div class="optimizer-section-label">📊 Hồ sơ Phản xạ & Trí nhớ Thực tế</div>
        <div class="optimizer-profile-grid">
          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">⏱️</span>
              <span class="stat-num">${profile.avgLatencySec > 0 ? profile.avgLatencySec + 's' : '—'}</span>
            </div>
            <div class="stat-title">Tốc độ nhớ lại</div>
            <div class="stat-desc text-muted">${profile.speedType}</div>
          </div>

          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">🎯</span>
              <span class="stat-num ${profile.actualRetentionPct >= 80 ? 'text-success' : 'text-warning'}">${profile.totalReviews > 0 ? profile.actualRetentionPct + '%' : '90%'}</span>
            </div>
            <div class="stat-title">Tỉ lệ nhớ thành công</div>
            <div class="stat-desc text-muted">${profile.totalReviews > 0 ? `${profile.totalReviews} lượt đánh giá` : 'Đang thu thập'}</div>
          </div>

          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">👁️</span>
              <span class="stat-num">${profile.avgBackViewSec > 0 ? profile.avgBackViewSec + 's' : '0s'}</span>
            </div>
            <div class="stat-title">Thời gian xem đáp án</div>
            <div class="stat-desc text-muted">${profile.verificationType}</div>
          </div>

          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">⏳</span>
              <span class="stat-num">${profile.avgDailyMinutes > 0 ? profile.avgDailyMinutes + 'p' : '0p'}</span>
            </div>
            <div class="stat-title">Thời gian học/ngày</div>
            <div class="stat-desc text-muted">${profile.activeDays} ngày ghi nhận</div>
          </div>
        </div>

        <!-- 2. Insights & Warnings if any -->
        ${profile.totalReviews >= 6 && profile.rushedRatingPct >= 40 && profile.avgBackViewSec < 1.2 ? `
          <div class="optimizer-alert warning" style="margin-top: 10px;">
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
              <strong>Lưu ý:</strong> Bạn đang chuyển thẻ khá nhanh. Dành thêm 1-2 giây nghe phát âm và đọc ví dụ ở mặt sau sẽ giúp FSRS củng cố trí nhớ sâu hơn.
            </div>
          </div>
        ` : ''}

        <!-- 3. Recommendations -->
        <div class="optimizer-section-label" style="margin-top: 16px;">✨ Đề xuất Cân chỉnh Thuật toán FSRS-6</div>
        ${hasOptimizations ? `
          <div class="recommendations-list">
            ${recommendations.map(rec => `
              <div class="rec-card">
                <div class="rec-card-header">
                  <span class="rec-icon">${rec.icon}</span>
                  <div class="rec-label">${escapeHTML(rec.label)}</div>
                </div>
                <div class="rec-diff">
                  <span class="rec-val old">${escapeHTML(rec.currentValue)}</span>
                  <span class="rec-arrow">➔</span>
                  <span class="rec-val new">${escapeHTML(rec.recommendedValue)}</span>
                </div>
                <p class="rec-reason">${escapeHTML(rec.reason)}</p>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="optimizer-perfect-state">
            <div class="perfect-icon">🎉</div>
            <h4>Cấu hình hiện tại đã tối ưu hóa hoàn hảo!</h4>
            <p>${profile.totalReviews < 8 
              ? `Hệ thống FSRS đang theo dõi nhịp độ học của bạn (${profile.totalReviews}/8 lượt ôn). Thuật toán sẽ tiếp tục tự động học đường cong ghi nhớ khi bạn học thêm.`
              : 'Tỷ lệ ghi nhớ mục tiêu 90%, tốc độ audio và hạn mức học tập hiện tại đang hoàn toàn đồng bộ với năng lực tiếp thu của bạn.'
            }</p>
          </div>
        `}
      </div>

      <div class="modal-footer optimizer-footer">
        <button type="button" class="btn-confirm-secondary" id="btn-cancel-optimizer">Đóng</button>
        ${hasOptimizations ? `
          <button type="button" class="btn-primary-hero" id="btn-apply-optimizer" style="padding: 10px 22px; font-size: 0.95rem;">
            <span>✨ Áp dụng tối ưu (${recommendations.length})</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  const closeModal = () => {
    modal.classList.remove('active');
  };

  modal.querySelector('#btn-close-optimizer-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#btn-cancel-optimizer')?.addEventListener('click', closeModal);
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const btnApply = modal.querySelector('#btn-apply-optimizer');
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      const ok = BehavioralOptimizer.applyOptimizations(recommendations);
      if (ok) {
        if (app) {
          app.settings = StorageManager.getSettings();
          if (typeof app.refreshAllViews === 'function') app.refreshAllViews();
        }
        showToast('✨ Đã áp dụng các thông số cá nhân hóa tối ưu thành công!', 'success');
        closeModal();
      } else {
        showToast('Không thể cập nhật cấu hình.', 'error');
      }
    });
  }

  modal.classList.add('active');
}


