/**
 * Library View Controller - Comprehensive Vocabulary Directory & FSRS Manager
 * Clean 1-Row-Per-Word Layout & Interactive Rich Detail Modal
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { escapeHTML, scrollToTop, getLocalDateKey } from '../utils.js';
import { speak, onAudioPlayStateChange } from '../services/audio.js';

// Local view state to preserve across tab switches
let _libState = {
  searchQuery: '',
  selectedCefr: 'all',
  selectedStatus: 'all',
  selectedDeck: 'all',
  sortBy: 'due_asc',
  pageSize: 20,
  currentPage: 1
};

// Listen to audio play state to animate the active sound button
if (typeof window !== 'undefined') {
  onAudioPlayStateChange((isPlaying, accent, word) => {
    if (!isPlaying) {
      document.querySelectorAll('.btn-row-sound.playing, .btn-modal-sound.playing').forEach(btn => btn.classList.remove('playing'));
    }
  });
}

/**
 * Format friendly FSRS due date & interval text
 */
function formatFSRSDueText(state, now = new Date()) {
  if (!state || state.state === State.New || state.state === 0 || !state.due) {
    return {
      statusClass: 'status-new',
      statusLabel: 'Chưa học',
      statusIcon: '✨',
      shortDueText: 'Mới',
      tierLabel: 'Chưa học',
      tierLevel: 0,
      dueFullText: 'Chưa có lịch ôn',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      interval: 0,
      dueDateFormatted: '—'
    };
  }

  const dueDate = new Date(state.due);
  const isDue = isCardDue(state, now);
  const s = Number(state.stability) || 0;
  const d = Number(state.difficulty) || 0;
  const reps = Number(state.reps) || 0;
  const lapses = Number(state.lapses) || 0;
  const interval = Number(state.scheduled_days) || 0;

  // Tính tier
  let tierLabel = 'Mức 1 (Mới học)';
  let tierLevel = 1;
  if (s >= 30) {
    tierLabel = 'Mức 5 (Ghi nhớ sâu)';
    tierLevel = 5;
  } else if (s >= 14) {
    tierLabel = 'Mức 4 (Bền vững)';
    tierLevel = 4;
  } else if (s >= 7) {
    tierLabel = 'Mức 3 (Trung hạn)';
    tierLevel = 3;
  } else if (s >= 3) {
    tierLabel = 'Mức 2 (Ngắn hạn)';
    tierLevel = 2;
  }

  const dueDay = dueDate.getDate().toString().padStart(2, '0');
  const dueMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0');
  const dueYear = dueDate.getFullYear();
  const dueDateFormatted = `${dueDay}/${dueMonth}/${dueYear}`;

  if (isDue) {
    return {
      statusClass: 'status-due',
      statusLabel: 'Cần ôn ngay',
      statusIcon: '⏰',
      shortDueText: 'Đến hạn',
      tierLabel,
      tierLevel,
      dueFullText: `Đã đến hạn ôn hôm nay (${dueDateFormatted})`,
      stability: s,
      difficulty: d,
      reps,
      lapses,
      interval,
      dueDateFormatted
    };
  }

  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let shortDueText = '';
  let dueFullText = '';

  if (diffDays <= 1) {
    shortDueText = 'Ngày mai';
    dueFullText = `Ngày mai (${dueDateFormatted})`;
  } else if (diffDays < 30) {
    shortDueText = `${diffDays} ngày nữa`;
    dueFullText = `Sau ${diffDays} ngày (${dueDateFormatted})`;
  } else if (diffDays < 365) {
    shortDueText = `${(diffDays / 30).toFixed(0)} tháng nữa`;
    dueFullText = `Sau ${(diffDays / 30).toFixed(1)} tháng (${dueDateFormatted})`;
  } else {
    shortDueText = dueDateFormatted;
    dueFullText = dueDateFormatted;
  }

  if (s >= 21) {
    return {
      statusClass: 'status-mastered',
      statusLabel: 'Thuần thục',
      statusIcon: '🏆',
      shortDueText,
      tierLabel,
      tierLevel,
      dueFullText,
      stability: s,
      difficulty: d,
      reps,
      lapses,
      interval,
      dueDateFormatted
    };
  }

  return {
    statusClass: 'status-learning',
    statusLabel: 'Đang nhớ',
    statusIcon: '🌱',
    shortDueText,
    tierLabel,
    tierLevel,
    dueFullText,
    stability: s,
    difficulty: d,
    reps,
    lapses,
    interval,
    dueDateFormatted
  };
}

/**
 * Render main Library Tab Shell
 */
export function renderLibraryTab(app) {
  const container = document.getElementById('tab-library');
  if (!container) return;

  const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
  const decks = app.deckManager ? app.deckManager.decks : [];

  // 1. Khung cấu trúc tĩnh
  container.innerHTML = `
    <div class="library-container">
      <!-- 1. Hero Header Banner -->
      <div class="library-hero-banner">
        <div class="library-hero-left">
          <div class="library-hero-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <path d="M8 7h8"/>
              <path d="M8 11h6"/>
            </svg>
          </div>
          <div>
            <h1 class="library-hero-title">Thư Viện Từ Vựng</h1>
            <p class="library-hero-subtitle" id="lib-total-count-text">
              Tổng hợp toàn bộ ${allCards.length.toLocaleString('vi-VN')} từ vựng với thuật toán FSRS-6
            </p>
          </div>
        </div>
        <div class="library-hero-actions">
          <button class="btn-library-study" id="btn-lib-study-filtered" title="Học ngay danh sách đang lọc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span id="btn-lib-study-label">Học danh sách này</span>
          </button>
        </div>
      </div>

      <!-- 2. Control Bar: Search & Multi-Filters Panel -->
      <div class="library-controls-panel">
        <!-- Search Bar -->
        <div class="library-search-wrapper">
          <span class="library-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input 
            type="text" 
            id="lib-search-input" 
            class="library-search-input" 
            placeholder="Tìm kiếm theo từ tiếng Anh, phiên âm, hoặc nghĩa tiếng Việt..." 
            value="${escapeHTML(_libState.searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          />
          ${_libState.searchQuery ? `
            <button class="btn-clear-search" id="btn-clear-search" title="Xóa tìm kiếm">✕</button>
          ` : ''}
        </div>

        <!-- Filter Row 1: CEFR Level Chips -->
        <div class="library-filter-group">
          <span class="filter-group-label">Trình độ:</span>
          <div class="filter-chips-scroll" id="lib-cefr-chips">
            <button class="chip-filter ${!_libState.selectedCefr || _libState.selectedCefr === 'all' ? 'active' : ''}" data-cefr="all">
              Tất cả
            </button>
            <button class="chip-filter ${_libState.selectedCefr === 'a1' ? 'active' : ''}" data-cefr="a1">
              A1 <span class="chip-sub">Cơ bản</span>
            </button>
            <button class="chip-filter ${_libState.selectedCefr === 'a2' ? 'active' : ''}" data-cefr="a2">
              A2 <span class="chip-sub">Sơ cấp</span>
            </button>
            <button class="chip-filter ${_libState.selectedCefr === 'b1' ? 'active' : ''}" data-cefr="b1">
              B1 <span class="chip-sub">Trung cấp</span>
            </button>
            <button class="chip-filter ${_libState.selectedCefr === 'b2' ? 'active' : ''}" data-cefr="b2">
              B2 <span class="chip-sub">Trung cao</span>
            </button>
            <button class="chip-filter ${_libState.selectedCefr === 'c1' ? 'active' : ''}" data-cefr="c1">
              C1 <span class="chip-sub">Cao cấp</span>
            </button>
            <button class="chip-filter ${_libState.selectedCefr === 'c2' ? 'active' : ''}" data-cefr="c2">
              C2 <span class="chip-sub">Thành thạo</span>
            </button>
          </div>
        </div>

        <!-- Filter Row 2: FSRS Status Chips -->
        <div class="library-filter-group">
          <span class="filter-group-label">Trạng thái:</span>
          <div class="filter-chips-scroll" id="lib-status-chips">
            <button class="chip-filter ${!_libState.selectedStatus || _libState.selectedStatus === 'all' ? 'active' : ''}" data-status="all">
              Tất cả trạng thái
            </button>
            <button class="chip-filter ${_libState.selectedStatus === 'due' ? 'active' : ''}" data-status="due">
              ⏰ Cần ôn ngay
            </button>
            <button class="chip-filter ${_libState.selectedStatus === 'learning' ? 'active' : ''}" data-status="learning">
              🌱 Đang học
            </button>
            <button class="chip-filter ${_libState.selectedStatus === 'new' ? 'active' : ''}" data-status="new">
              ✨ Thẻ mới
            </button>
            <button class="chip-filter ${_libState.selectedStatus === 'mastered' ? 'active' : ''}" data-status="mastered">
              🏆 Thuần thục
            </button>
          </div>
        </div>

        <!-- Filter Row 3: Deck Selector & Sorting & Page Size -->
        <div class="library-selectors-bar">
          <div class="selector-field">
            <label for="lib-deck-select">Chủ đề:</label>
            <select id="lib-deck-select" class="library-select">
              <option value="all">Toàn bộ chủ đề (${decks.length})</option>
              ${decks.map(d => `
                <option value="${escapeHTML(d.id)}" ${_libState.selectedDeck === d.id ? 'selected' : ''}>
                  ${escapeHTML(d.name || d.id)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="selector-field">
            <label for="lib-sort-select">Sắp xếp:</label>
            <select id="lib-sort-select" class="library-select">
              <option value="due_asc" ${_libState.sortBy === 'due_asc' ? 'selected' : ''}>Hạn ôn tập (Gần nhất trước)</option>
              <option value="alpha_asc" ${_libState.sortBy === 'alpha_asc' ? 'selected' : ''}>Từ A đến Z</option>
              <option value="alpha_desc" ${_libState.sortBy === 'alpha_desc' ? 'selected' : ''}>Từ Z đến A</option>
              <option value="cefr_asc" ${_libState.sortBy === 'cefr_asc' ? 'selected' : ''}>Cấp độ (A1 ➔ C2)</option>
              <option value="cefr_desc" ${_libState.sortBy === 'cefr_desc' ? 'selected' : ''}>Cấp độ (C2 ➔ A1)</option>
              <option value="stability_desc" ${_libState.sortBy === 'stability_desc' ? 'selected' : ''}>Độ nhớ cao nhất</option>
              <option value="stability_asc" ${_libState.sortBy === 'stability_asc' ? 'selected' : ''}>Độ nhớ thấp nhất</option>
            </select>
          </div>

          <div class="selector-field">
            <label for="lib-pagesize-select">Hiển thị:</label>
            <select id="lib-pagesize-select" class="library-select">
              <option value="10" ${_libState.pageSize === 10 ? 'selected' : ''}>10 từ / trang</option>
              <option value="20" ${_libState.pageSize === 20 ? 'selected' : ''}>20 từ / trang</option>
              <option value="50" ${_libState.pageSize === 50 ? 'selected' : ''}>50 từ / trang</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 3. Meta & Counter Bar -->
      <div class="library-meta-bar">
        <div class="library-results-summary" id="lib-results-summary">
          Đang tải dữ liệu từ vựng...
        </div>
        <div class="library-pagination-info" id="lib-pagination-info"></div>
      </div>

      <!-- 4. Vocabulary Words Rows List Container (1 Row Per Word) -->
      <div class="library-words-list" id="lib-words-list">
        <!-- Rendered dynamically -->
      </div>

      <!-- 5. Bottom Pagination Bar -->
      <div class="library-pagination-bar" id="lib-pagination-bar">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // 2. Gắn Event Listeners
  setupLibraryEventListeners(app);

  // 3. Render danh sách từ vựng
  renderLibraryWords(app);
}

/**
 * Gắn các sự kiện tương tác cho View Thư viện
 */
function setupLibraryEventListeners(app) {
  const searchInput = document.getElementById('lib-search-input');
  const cefrChips = document.getElementById('lib-cefr-chips');
  const statusChips = document.getElementById('lib-status-chips');
  const selectDeck = document.getElementById('lib-deck-select');
  const selectSort = document.getElementById('lib-sort-select');
  const selectPageSize = document.getElementById('lib-pagesize-select');
  const btnStudyFiltered = document.getElementById('btn-lib-study-filtered');

  // Search input với debounce
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        _libState.searchQuery = e.target.value.trim();
        _libState.currentPage = 1;
        renderLibraryWords(app);
      }, 250);
    });
  }

  // CEFR chips
  if (cefrChips) {
    cefrChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-filter');
      if (!chip) return;
      const cefr = chip.getAttribute('data-cefr');
      if (cefr) {
        _libState.selectedCefr = cefr;
        _libState.currentPage = 1;
        cefrChips.querySelectorAll('.chip-filter').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderLibraryWords(app);
      }
    });
  }

  // Status chips
  if (statusChips) {
    statusChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-filter');
      if (!chip) return;
      const status = chip.getAttribute('data-status');
      if (status) {
        _libState.selectedStatus = status;
        _libState.currentPage = 1;
        statusChips.querySelectorAll('.chip-filter').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderLibraryWords(app);
      }
    });
  }

  // Deck selector
  if (selectDeck) {
    selectDeck.addEventListener('change', (e) => {
      _libState.selectedDeck = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // Sort selector
  if (selectSort) {
    selectSort.addEventListener('change', (e) => {
      _libState.sortBy = e.target.value || 'due_asc';
      renderLibraryWords(app);
    });
  }

  // Page size selector
  if (selectPageSize) {
    selectPageSize.addEventListener('change', (e) => {
      _libState.pageSize = parseInt(e.target.value, 10) || 20;
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // Học nhanh danh sách từ đang lọc
  if (btnStudyFiltered) {
    btnStudyFiltered.addEventListener('click', () => {
      const filtered = getFilteredAndSortedCards(app);
      if (!filtered || filtered.length === 0) {
        if (app.showToast) app.showToast('Không có từ nào trong danh sách đang lọc để học.', 'info');
        return;
      }
      app.startStudySession(null, null, filtered.slice(0, 50));
    });
  }
}

const CEFR_ORDER = { a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 6 };

/**
 * Lọc và sắp xếp danh sách từ vựng theo State
 */
function getFilteredAndSortedCards(app) {
  if (!app.deckManager) return [];
  let cards = [];

  if (_libState.selectedDeck === 'all') {
    cards = app.deckManager.getAllCards();
  } else {
    cards = app.deckManager.getCardsByDeckId(_libState.selectedDeck);
  }

  const now = new Date();
  const query = _libState.searchQuery.toLowerCase();
  const cefrFilter = _libState.selectedCefr.toLowerCase();
  const statusFilter = _libState.selectedStatus;

  // 1. Lọc theo từ khóa tìm kiếm
  if (query) {
    cards = cards.filter(c => {
      const w = (c.word || '').toLowerCase();
      const m = (c.meaning || '').toLowerCase();
      const p = (c.phonetic || c.ipa || '').toLowerCase();
      return w.includes(query) || m.includes(query) || p.includes(query);
    });
  }

  // 2. Lọc theo CEFR level
  if (cefrFilter !== 'all') {
    cards = cards.filter(c => {
      const lvl = (c.cefr || c.level || 'a1').toLowerCase();
      return lvl === cefrFilter;
    });
  }

  // 3. Lọc theo trạng thái FSRS
  if (statusFilter !== 'all') {
    cards = cards.filter(c => {
      const state = StorageManager.getCardState(c.id);
      const isNew = !state || state.state === 0 || state.state === State.New;
      const isDue = isCardDue(state, now);
      const s = state ? (Number(state.stability) || 0) : 0;

      if (statusFilter === 'due') return isDue;
      if (statusFilter === 'new') return isNew;
      if (statusFilter === 'learning') return !isNew && s < 21;
      if (statusFilter === 'mastered') return !isNew && s >= 21;
      return true;
    });
  }

  // 4. Sắp xếp danh sách (Sorting)
  cards = [...cards].sort((a, b) => {
    const stateA = StorageManager.getCardState(a.id);
    const stateB = StorageManager.getCardState(b.id);

    if (_libState.sortBy === 'due_asc') {
      const isDueA = isCardDue(stateA, now) ? 1 : 0;
      const isDueB = isCardDue(stateB, now) ? 1 : 0;
      if (isDueA !== isDueB) return isDueB - isDueA; // Thẻ đến hạn ưu tiên đầu
      const dueA = stateA?.due ? new Date(stateA.due).getTime() : Infinity;
      const dueB = stateB?.due ? new Date(stateB.due).getTime() : Infinity;
      return dueA - dueB;
    } else if (_libState.sortBy === 'cefr_asc') {
      const orderA = CEFR_ORDER[(a.cefr || a.level || 'a1').toLowerCase()] || 1;
      const orderB = CEFR_ORDER[(b.cefr || b.level || 'a1').toLowerCase()] || 1;
      return orderA - orderB;
    } else if (_libState.sortBy === 'cefr_desc') {
      const orderA = CEFR_ORDER[(a.cefr || a.level || 'a1').toLowerCase()] || 1;
      const orderB = CEFR_ORDER[(b.cefr || b.level || 'a1').toLowerCase()] || 1;
      return orderB - orderA;
    } else if (_libState.sortBy === 'stability_desc') {
      const sA = stateA?.stability || 0;
      const sB = stateB?.stability || 0;
      return sB - sA;
    } else if (_libState.sortBy === 'stability_asc') {
      const sA = stateA?.stability || 0;
      const sB = stateB?.stability || 0;
      return sA - sB;
    } else if (_libState.sortBy === 'alpha_desc') {
      return (b.word || '').localeCompare(a.word || '');
    } else {
      // alpha_asc
      return (a.word || '').localeCompare(b.word || '');
    }
  });

  return cards;
}

/**
 * Render danh sách từ vựng dạng 1 dòng/từ kèm phân trang
 */
function renderLibraryWords(app) {
  const listContainer = document.getElementById('lib-words-list');
  const paginationBar = document.getElementById('lib-pagination-bar');
  const resultsSummary = document.getElementById('lib-results-summary');
  const paginationInfo = document.getElementById('lib-pagination-info');
  const totalCountText = document.getElementById('lib-total-count-text');
  const btnStudyLabel = document.getElementById('btn-lib-study-label');

  if (!listContainer) return;

  const totalAllCards = app.deckManager ? app.deckManager.getAllCards().length : 0;
  if (totalCountText) {
    totalCountText.textContent = `Tổng hợp toàn bộ ${totalAllCards.toLocaleString('vi-VN')} từ vựng với thuật toán FSRS-6`;
  }

  const filteredCards = getFilteredAndSortedCards(app);
  const totalResults = filteredCards.length;

  if (btnStudyLabel) {
    btnStudyLabel.textContent = `Học danh sách này (${Math.min(50, totalResults)} từ)`;
  }

  // Tính toán phân trang
  const pageSize = _libState.pageSize || 20;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  if (_libState.currentPage > totalPages) _libState.currentPage = totalPages;
  if (_libState.currentPage < 1) _libState.currentPage = 1;
  const currentPage = _libState.currentPage;

  const startIndex = (currentPage - 1) * pageSize;
  const pageCards = filteredCards.slice(startIndex, startIndex + pageSize);

  // Cập nhật Meta Summary
  if (resultsSummary) {
    resultsSummary.innerHTML = `Tìm thấy <strong>${totalResults.toLocaleString('vi-VN')}</strong> từ vựng phù hợp`;
  }
  if (paginationInfo) {
    paginationInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
  }

  // Trường hợp không có kết quả
  if (pageCards.length === 0) {
    listContainer.innerHTML = `
      <div class="library-empty-state">
        <span class="library-empty-icon">🔍</span>
        <h3 class="library-empty-title">Không tìm thấy từ vựng nào</h3>
        <p class="library-empty-desc">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại các bộ lọc bên trên.</p>
      </div>
    `;
    if (paginationBar) paginationBar.innerHTML = '';
    return;
  }

  // Render danh sách các Word Row (1 dòng/từ)
  const now = new Date();
  const frag = document.createDocumentFragment();

  pageCards.forEach(card => {
    const rowEl = document.createElement('div');
    rowEl.className = 'library-word-row';
    rowEl.setAttribute('role', 'button');
    rowEl.setAttribute('tabindex', '0');

    const state = StorageManager.getCardState(card.id);
    const fsrsInfo = formatFSRSDueText(state, now);
    const cefr = (card.cefr || card.level || 'A1').toLowerCase();
    const pos = (card.pos || 'word').toUpperCase();
    const phonetic = card.phonetic || card.ipa || '';

    rowEl.innerHTML = `
      <!-- 1. Sound Button -->
      <button class="btn-row-sound" data-word="${escapeHTML(card.word || '')}" title="Phát âm từ vựng" aria-label="Phát âm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      </button>

      <!-- 2. Main Word & Info Group -->
      <div class="library-row-main">
        <div class="library-row-header-group">
          <span class="library-row-word">${escapeHTML(card.word || '')}</span>
          ${phonetic ? `<span class="library-row-ipa">${escapeHTML(phonetic)}</span>` : ''}
          <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
          <span class="badge-pos">${escapeHTML(pos)}</span>
        </div>
        <div class="library-row-meaning">${escapeHTML(card.meaning || '')}</div>
      </div>

      <!-- 3. FSRS Status & Short Due Pill -->
      <div class="library-row-status-wrap">
        <span class="fsrs-status-tag ${fsrsInfo.statusClass}" title="${fsrsInfo.dueFullText}">
          <span class="fsrs-status-icon">${fsrsInfo.statusIcon}</span>
          <span class="fsrs-status-text">${fsrsInfo.statusLabel}</span>
        </span>
        <span class="fsrs-due-time">${fsrsInfo.shortDueText}</span>
      </div>

      <!-- 4. Chevron Indicator -->
      <div class="library-row-chevron" title="Xem chi tiết từ vựng">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    `;

    // Click Sound Button: Phát âm mà không mở popup
    const soundBtn = rowEl.querySelector('.btn-row-sound');
    if (soundBtn) {
      soundBtn.onclick = (e) => {
        e.stopPropagation();
        soundBtn.classList.add('playing');
        speak(card.word, { cardObj: card });
      };
    }

    // Click cả hàng để mở Word Detail Modal
    rowEl.onclick = (e) => {
      if (e.target.closest('.btn-row-sound')) return;
      openWordDetailModal(card, app);
    };

    rowEl.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWordDetailModal(card, app);
      }
    };

    frag.appendChild(rowEl);
  });

  listContainer.innerHTML = '';
  listContainer.appendChild(frag);

  // Render thanh phân trang
  renderPaginationBar(app, totalPages, currentPage);
}

/**
 * Render thanh điều hướng phân trang (Pagination Bar)
 */
function renderPaginationBar(app, totalPages, currentPage) {
  const paginationBar = document.getElementById('lib-pagination-bar');
  if (!paginationBar) return;

  if (totalPages <= 1) {
    paginationBar.innerHTML = '';
    return;
  }

  let html = `
    <button class="btn-page-nav" id="btn-page-prev" ${currentPage === 1 ? 'disabled' : ''}>
      ◀ Trước
    </button>
    <div class="pagination-pages-list">
  `;

  // Tạo dải số trang thông minh
  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pageNumbers.includes(i)) pageNumbers.push(i);
    }

    if (currentPage < totalPages - 2) pageNumbers.push('...');
    if (!pageNumbers.includes(totalPages)) pageNumbers.push(totalPages);
  }

  pageNumbers.forEach(p => {
    if (p === '...') {
      html += `<span class="pagination-ellipsis">...</span>`;
    } else {
      html += `<button class="btn-page-num ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
  });

  html += `
    </div>
    <button class="btn-page-nav" id="btn-page-next" ${currentPage === totalPages ? 'disabled' : ''}>
      Sau ▶
    </button>
  `;

  paginationBar.innerHTML = html;

  // Gắn sự kiện phân trang
  const btnPrev = document.getElementById('btn-page-prev');
  const btnNext = document.getElementById('btn-page-next');

  if (btnPrev) {
    btnPrev.onclick = () => {
      if (_libState.currentPage > 1) {
        _libState.currentPage--;
        renderLibraryWords(app);
        scrollToTop();
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      if (_libState.currentPage < totalPages) {
        _libState.currentPage++;
        renderLibraryWords(app);
        scrollToTop();
      }
    };
  }

  paginationBar.querySelectorAll('.btn-page-num').forEach(btn => {
    btn.onclick = () => {
      const page = parseInt(btn.getAttribute('data-page'), 10);
      if (page && page !== _libState.currentPage) {
        _libState.currentPage = page;
        renderLibraryWords(app);
        scrollToTop();
      }
    };
  });
}

/**
 * Mở Modal Popup Chi Tiết Từ Vựng Đầy Đủ (Word Detail Modal)
 */
export function openWordDetailModal(card, app) {
  if (!card) return;

  let modal = document.getElementById('word-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'word-detail-modal';
    modal.className = 'word-detail-modal-overlay';
    document.body.appendChild(modal);
  }

  const now = new Date();
  const state = StorageManager.getCardState(card.id);
  const fsrsInfo = formatFSRSDueText(state, now);
  const cefr = (card.cefr || card.level || 'A1').toLowerCase();
  const pos = (card.pos || 'word').toUpperCase();
  const imgSrc = card.img || card.image || '';
  const phonetic = card.phonetic || card.ipa || '';

  // Render Modal HTML
  modal.innerHTML = `
    <div class="word-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-word-title">
      <!-- Modal Header -->
      <div class="word-detail-header">
        <div class="word-detail-header-tags">
          <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
          <span class="badge-pos">${escapeHTML(pos)}</span>
        </div>
        <button class="btn-detail-close" id="btn-close-word-modal" title="Đóng (Esc)" aria-label="Đóng">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="word-detail-body">
        <!-- 1. Hero Area: Image & Word Head -->
        <div class="word-detail-hero">
          ${imgSrc ? `
            <div class="word-detail-image-wrap" id="detail-img-wrap" title="Nhấn để phóng to ảnh">
              <img src="${escapeHTML(imgSrc)}" class="word-detail-img" alt="${escapeHTML(card.word)}" loading="eager" />
              <span class="img-zoom-hint">🔍 Phóng to</span>
            </div>
          ` : ''}

          <div class="word-detail-headline">
            <h2 class="word-detail-title" id="modal-word-title">${escapeHTML(card.word || '')}</h2>
            ${phonetic ? `<div class="word-detail-ipa">${escapeHTML(phonetic)}</div>` : ''}

            <!-- Dual Audio Pronunciation Buttons -->
            <div class="word-detail-audio-row">
              <button class="btn-modal-sound btn-sound-us" id="btn-sound-us" title="Phát âm chuẩn Mỹ (US)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                <span>US (Mỹ)</span>
              </button>
              <button class="btn-modal-sound btn-sound-uk" id="btn-sound-uk" title="Phát âm chuẩn Anh (UK)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <span>UK (Anh)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Meaning & Definition Box -->
        <div class="word-detail-section meaning-box">
          <div class="section-label">Nghĩa tiếng Việt:</div>
          <div class="word-detail-meaning-text">${escapeHTML(card.meaning || '')}</div>
          
          ${card.definition || card.def ? `
            <div class="section-label def-label">Định nghĩa tiếng Anh:</div>
            <div class="word-detail-def-text">${escapeHTML(card.definition || card.def)}</div>
          ` : ''}
        </div>

        <!-- 3. Example Sentences -->
        ${card.example ? `
          <div class="word-detail-section example-box">
            <div class="section-label">Ví dụ câu thực tế:</div>
            <div class="word-detail-example-en">"${escapeHTML(card.example)}"</div>
            ${card.exampleVi ? `<div class="word-detail-example-vi">${escapeHTML(card.exampleVi)}</div>` : ''}
          </div>
        ` : ''}

        <!-- 4. FSRS Spaced Repetition Analytics Box -->
        <div class="word-detail-section fsrs-stats-box">
          <div class="fsrs-box-header">
            <div class="fsrs-box-title">
              <span class="fsrs-icon">🧠</span> Tiến trình Trí nhớ FSRS-6
            </div>
            <span class="fsrs-tier-pill tier-${fsrsInfo.tierLevel}">
              ${fsrsInfo.tierLabel}
            </span>
          </div>

          <div class="fsrs-stats-grid">
            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Trạng thái</div>
              <div class="fsrs-stat-value">
                <span class="fsrs-status-tag ${fsrsInfo.statusClass}">
                  ${fsrsInfo.statusIcon} ${fsrsInfo.statusLabel}
                </span>
              </div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Hạn ôn tập tiếp theo</div>
              <div class="fsrs-stat-value highlight">${escapeHTML(fsrsInfo.dueFullText)}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Độ bền (Stability S)</div>
              <div class="fsrs-stat-value">${fsrsInfo.stability > 0 ? `${fsrsInfo.stability.toFixed(1)} ngày` : 'Chưa học'}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Độ khó (Difficulty D)</div>
              <div class="fsrs-stat-value">${fsrsInfo.difficulty > 0 ? `${fsrsInfo.difficulty.toFixed(1)} / 10` : 'Chưa học'}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Số lần đã ôn</div>
              <div class="fsrs-stat-value">${fsrsInfo.reps} lần</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Số lần quên (Lapses)</div>
              <div class="fsrs-stat-value">${fsrsInfo.lapses} lần</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Action Footer -->
      <div class="word-detail-footer">
        <button class="btn-detail-secondary" id="btn-close-modal-bottom">
          Đóng
        </button>
        <button class="btn-detail-primary" id="btn-study-this-card">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Ôn tập thẻ này ngay
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Sự kiện nút đóng
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const btnClose = modal.querySelector('#btn-close-word-modal');
  const btnCloseBottom = modal.querySelector('#btn-close-modal-bottom');
  if (btnClose) btnClose.onclick = closeModal;
  if (btnCloseBottom) btnCloseBottom.onclick = closeModal;

  // Click outside dialog to close
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Esc key to close
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // Phóng to ảnh trong modal
  const detailImgWrap = modal.querySelector('#detail-img-wrap');
  if (detailImgWrap && imgSrc) {
    detailImgWrap.onclick = () => openImageLightbox(imgSrc, card.word);
  }

  // Audio US / UK
  const btnUs = modal.querySelector('#btn-sound-us');
  const btnUk = modal.querySelector('#btn-sound-uk');

  if (btnUs) {
    btnUs.onclick = () => {
      btnUs.classList.add('playing');
      speak(card.word, { accent: 'us', cardObj: card });
    };
  }

  if (btnUk) {
    btnUk.onclick = () => {
      btnUk.classList.add('playing');
      speak(card.word, { accent: 'uk', cardObj: card });
    };
  }

  // Học riêng từ này
  const btnStudy = modal.querySelector('#btn-study-this-card');
  if (btnStudy) {
    btnStudy.onclick = () => {
      closeModal();
      if (app && app.startStudySession) {
        app.startStudySession(card.deckId || null, null, [card]);
      }
    };
  }
}

/**
 * Mở modal phóng to hình ảnh (Lightbox)
 */
function openImageLightbox(src, altText = '') {
  let modal = document.getElementById('image-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-lightbox-modal';
    modal.className = 'image-lightbox-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="image-lightbox-container">
      <img src="${escapeHTML(src)}" class="image-lightbox-content" alt="${escapeHTML(altText)}" />
      <button class="image-lightbox-close" title="Đóng">✕</button>
    </div>
  `;
  modal.style.display = 'flex';

  modal.onclick = (e) => {
    if (e.target === modal || e.target.classList.contains('image-lightbox-close')) {
      modal.style.display = 'none';
    }
  };
}
