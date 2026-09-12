/**
 * Library View Controller - Comprehensive Vocabulary Directory & FSRS Manager
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

let _playingButtonId = null;

// Listen to audio play state to animate the active sound button
if (typeof window !== 'undefined') {
  onAudioPlayStateChange((isPlaying, accent, word) => {
    if (!isPlaying) {
      document.querySelectorAll('.btn-card-sound.playing').forEach(btn => btn.classList.remove('playing'));
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
      statusLabel: '✨ Chưa học',
      dueText: 'Chưa có lịch ôn'
    };
  }

  const dueDate = new Date(state.due);
  const isDue = isCardDue(state, now);
  const s = Number(state.stability) || 0;

  if (isDue) {
    return {
      statusClass: 'status-due',
      statusLabel: '⏰ Cần ôn ngay',
      dueText: `Đã đến hạn ôn hôm nay · S: ${s.toFixed(1)}d`
    };
  }

  const todayKey = getLocalDateKey(now);
  const dueKey = getLocalDateKey(dueDate);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let timeText = '';
  if (diffDays <= 1) {
    timeText = 'Ngày mai';
  } else if (diffDays < 30) {
    timeText = `sau ${diffDays} ngày (${dueDate.getDate()}/${dueDate.getMonth() + 1})`;
  } else if (diffDays < 365) {
    timeText = `sau ${(diffDays / 30).toFixed(1)} tháng (${dueDate.getDate()}/${dueDate.getMonth() + 1}/${dueDate.getFullYear()})`;
  } else {
    timeText = `${dueDate.getDate()}/${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`;
  }

  if (s >= 21) {
    return {
      statusClass: 'status-mastered',
      statusLabel: '🏆 Thuần thục',
      dueText: `Hạn ôn: ${timeText} · S: ${s.toFixed(1)}d`
    };
  }

  return {
    statusClass: 'status-learning',
    statusLabel: '🌱 Đang nhớ',
    dueText: `Hạn ôn: ${timeText} · S: ${s.toFixed(1)}d`
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
          <div class="library-hero-icon">📚</div>
          <div class="library-hero-text">
            <h2 class="library-hero-title">Thư Viện Từ Vựng</h2>
            <p class="library-hero-subtitle" id="lib-total-count-text">Khám phá và tra cứu toàn bộ kho từ vựng</p>
          </div>
        </div>
        <div class="library-hero-actions">
          <button class="btn-library-study" id="btn-lib-study-filtered" title="Bắt đầu học danh sách từ đang lọc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span id="btn-lib-study-label">Học danh sách này</span>
          </button>
        </div>
      </div>

      <!-- 2. Controls Panel: Search & Multi-Filters -->
      <div class="library-controls-panel">
        <!-- Search Input -->
        <div class="library-search-wrapper">
          <span class="library-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input 
            type="text" 
            id="lib-search-input" 
            class="library-search-input" 
            placeholder="Tìm kiếm từ tiếng Anh, phiên âm, hoặc nghĩa tiếng Việt..." 
            value="${escapeHTML(_libState.searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          />
          <button id="lib-search-clear" class="library-search-clear ${Boolean(_libState.searchQuery) ? 'visible' : ''}">✕</button>
        </div>

        <!-- CEFR Filter Row -->
        <div class="library-filter-row">
          <span class="filter-row-label">Trình độ:</span>
          <div class="library-chip-group" id="lib-cefr-chips">
            <button class="chip-btn ${_libState.selectedCefr === 'all' ? 'active' : ''}" data-cefr="all">Tất cả</button>
            <button class="chip-btn ${_libState.selectedCefr === 'a1' ? 'active' : ''}" data-cefr="a1">A1 (Cơ bản)</button>
            <button class="chip-btn ${_libState.selectedCefr === 'a2' ? 'active' : ''}" data-cefr="a2">A2 (Sơ cấp)</button>
            <button class="chip-btn ${_libState.selectedCefr === 'b1' ? 'active' : ''}" data-cefr="b1">B1 (Trung cấp)</button>
            <button class="chip-btn ${_libState.selectedCefr === 'b2' ? 'active' : ''}" data-cefr="b2">B2 (Trung cao)</button>
            <button class="chip-btn ${_libState.selectedCefr === 'c1' ? 'active' : ''}" data-cefr="c1">C1 (Cao cấp)</button>
            <button class="chip-btn ${_libState.selectedCefr === 'c2' ? 'active' : ''}" data-cefr="c2">C2 (Thành thạo)</button>
          </div>
        </div>

        <!-- FSRS Status Filter Row -->
        <div class="library-filter-row">
          <span class="filter-row-label">Trạng thái FSRS:</span>
          <div class="library-chip-group" id="lib-status-chips">
            <button class="chip-btn ${_libState.selectedStatus === 'all' ? 'active' : ''}" data-status="all">Tất cả</button>
            <button class="chip-btn ${_libState.selectedStatus === 'due' ? 'active' : ''}" data-status="due">⏰ Cần ôn tập</button>
            <button class="chip-btn ${_libState.selectedStatus === 'new' ? 'active' : ''}" data-status="new">✨ Chưa học</button>
            <button class="chip-btn ${_libState.selectedStatus === 'learning' ? 'active' : ''}" data-status="learning">🌱 Đang nhớ</button>
            <button class="chip-btn ${_libState.selectedStatus === 'mastered' ? 'active' : ''}" data-status="mastered">🏆 Thuần thục</button>
          </div>
        </div>

        <!-- Secondary Dropdowns Row: Topic, Sort, PageSize -->
        <div class="library-dropdowns-row">
          <!-- Topic Selector -->
          <div class="library-select-wrap">
            <span>Chủ đề:</span>
            <select id="lib-select-deck" class="library-select">
              <option value="all">Tất cả chủ đề (${allCards.length} từ)</option>
              ${decks.map(d => {
                const count = (d.wordIds ? d.wordIds.length : (d.cards ? d.cards.length : 0));
                return `<option value="${d.id}" ${_libState.selectedDeck === d.id ? 'selected' : ''}>${d.icon || '📖'} ${escapeHTML(d.title || d.name)} (${count})</option>`;
              }).join('')}
            </select>
          </div>

          <!-- Sort Order Selector -->
          <div class="library-select-wrap">
            <span>Sắp xếp:</span>
            <select id="lib-select-sort" class="library-select">
              <option value="due_asc" ${_libState.sortBy === 'due_asc' ? 'selected' : ''}>⏰ Hạn ôn gần nhất</option>
              <option value="cefr_asc" ${_libState.sortBy === 'cefr_asc' ? 'selected' : ''}>📊 Trình độ: A1 ➔ C2</option>
              <option value="cefr_desc" ${_libState.sortBy === 'cefr_desc' ? 'selected' : ''}>📊 Trình độ: C2 ➔ A1</option>
              <option value="stability_desc" ${_libState.sortBy === 'stability_desc' ? 'selected' : ''}>🧠 Độ bền FSRS (Cao ➔ Thấp)</option>
              <option value="stability_asc" ${_libState.sortBy === 'stability_asc' ? 'selected' : ''}>🌱 Độ bền FSRS (Thấp ➔ Cao)</option>
              <option value="alpha_asc" ${_libState.sortBy === 'alpha_asc' ? 'selected' : ''}>🔤 Từ A ➔ Z</option>
              <option value="alpha_desc" ${_libState.sortBy === 'alpha_desc' ? 'selected' : ''}>🔤 Từ Z ➔ A</option>
            </select>
          </div>

          <!-- Page Size Selector -->
          <div class="library-select-wrap">
            <span>Hiển thị:</span>
            <select id="lib-select-pagesize" class="library-select">
              <option value="10" ${_libState.pageSize === 10 ? 'selected' : ''}>10 từ / trang</option>
              <option value="20" ${_libState.pageSize === 20 ? 'selected' : ''}>20 từ / trang</option>
              <option value="50" ${_libState.pageSize === 50 ? 'selected' : ''}>50 từ / trang</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 3. Results Meta Header -->
      <div class="library-results-meta">
        <span id="lib-results-summary">Đang tải danh sách từ vựng...</span>
        <span id="lib-pagination-info">Trang 1 / 1</span>
      </div>

      <!-- 4. Word Cards Grid Container -->
      <div class="library-words-grid" id="lib-words-grid"></div>

      <!-- 5. Pagination Bar -->
      <div class="library-pagination-bar" id="lib-pagination-bar"></div>
    </div>
  `;

  // Gắn sự kiện điều khiển
  attachLibraryEvents(app);

  // Render danh sách từ
  renderLibraryWords(app);
}

/**
 * Gắn các sự kiện Filter, Search, Sort & Pagination
 */
function attachLibraryEvents(app) {
  const searchInput = document.getElementById('lib-search-input');
  const searchClear = document.getElementById('lib-search-clear');
  const cefrChips = document.getElementById('lib-cefr-chips');
  const statusChips = document.getElementById('lib-status-chips');
  const selectDeck = document.getElementById('lib-select-deck');
  const selectSort = document.getElementById('lib-select-sort');
  const selectPageSize = document.getElementById('lib-select-pagesize');
  const btnStudyFiltered = document.getElementById('btn-lib-study-filtered');

  // Search input với debounce mượt mà
  let searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        _libState.searchQuery = (e.target.value || '').trim();
        _libState.currentPage = 1;
        if (searchClear) {
          searchClear.classList.toggle('visible', Boolean(_libState.searchQuery));
        }
        renderLibraryWords(app);
      }, 150);
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      _libState.searchQuery = '';
      _libState.currentPage = 1;
      searchClear.classList.remove('visible');
      renderLibraryWords(app);
      if (searchInput) searchInput.focus();
    });
  }

  // CEFR chips filter
  if (cefrChips) {
    cefrChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      cefrChips.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _libState.selectedCefr = btn.getAttribute('data-cefr') || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // FSRS status chips filter
  if (statusChips) {
    statusChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      statusChips.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _libState.selectedStatus = btn.getAttribute('data-status') || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
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
 * Render danh sách từ vựng kèm phân trang
 */
function renderLibraryWords(app) {
  const gridContainer = document.getElementById('lib-words-grid');
  const paginationBar = document.getElementById('lib-pagination-bar');
  const resultsSummary = document.getElementById('lib-results-summary');
  const paginationInfo = document.getElementById('lib-pagination-info');
  const totalCountText = document.getElementById('lib-total-count-text');
  const btnStudyLabel = document.getElementById('btn-lib-study-label');

  if (!gridContainer) return;

  const totalAllCards = app.deckManager ? app.deckManager.getAllCards().length : 0;
  if (totalCountText) {
    totalCountText.textContent = `Tổng cộng ${totalAllCards.toLocaleString('vi-VN')} từ vựng trong toàn bộ ứng dụng`;
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
    gridContainer.innerHTML = `
      <div class="library-empty-state">
        <span class="library-empty-icon">🔍</span>
        <h3 class="library-empty-title">Không tìm thấy từ vựng nào</h3>
        <p class="library-empty-desc">Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc để xem thêm từ vựng.</p>
      </div>
    `;
    if (paginationBar) paginationBar.innerHTML = '';
    return;
  }

  // Render danh sách các Word Card
  const now = new Date();
  const frag = document.createDocumentFragment();

  pageCards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'library-word-card';

    const state = StorageManager.getCardState(card.id);
    const fsrsInfo = formatFSRSDueText(state, now);
    const cefr = (card.cefr || card.level || 'A1').toLowerCase();
    const pos = (card.pos || 'word').toUpperCase();
    const imgSrc = card.img || card.image || '';

    cardEl.innerHTML = `
      <!-- 1. Thumbnail Image -->
      <div class="library-word-thumbnail-wrap" title="${imgSrc ? 'Nhấn để phóng to ảnh' : 'Từ vựng'}">
        ${imgSrc 
          ? `<img src="${escapeHTML(imgSrc)}" class="library-word-thumbnail" alt="${escapeHTML(card.word)}" loading="lazy" decoding="async" />`
          : `<span class="thumbnail-placeholder">📖</span>`
        }
      </div>

      <!-- 2. Main Content Body -->
      <div class="library-word-body">
        <div class="library-word-header">
          <div class="library-word-title-group">
            <h3 class="library-word-text">${escapeHTML(card.word || '')}</h3>
            ${card.phonetic || card.ipa ? `<span class="library-word-ipa">${escapeHTML(card.phonetic || card.ipa)}</span>` : ''}
            <div class="library-badges-wrap">
              <span class="badge-pos">${escapeHTML(pos)}</span>
              <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
            </div>
          </div>

          <div class="library-card-actions">
            <button class="btn-card-sound" data-word="${escapeHTML(card.word || '')}" title="Phát âm từ vựng" aria-label="Phát âm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </button>
            <button class="btn-card-single-study" data-card-id="${escapeHTML(card.id)}" title="Học riêng từ này">
              Ôn thẻ
            </button>
          </div>
        </div>

        <!-- Meaning -->
        <p class="library-word-meaning">${escapeHTML(card.meaning || '')}</p>

        <!-- Definition in English -->
        ${card.definition || card.def ? `<p class="library-word-def">${escapeHTML(card.definition || card.def)}</p>` : ''}

        <!-- Example Sentences -->
        ${card.example ? `
          <div class="library-word-example">
            <span>"${escapeHTML(card.example)}"</span>
            ${card.exampleVi ? `<div class="library-word-example-vi">${escapeHTML(card.exampleVi)}</div>` : ''}
          </div>
        ` : ''}

        <!-- FSRS Footer Meta -->
        <div class="library-word-fsrs-meta">
          <span class="fsrs-status-tag ${fsrsInfo.statusClass}">${fsrsInfo.statusLabel}</span>
          <span class="fsrs-due-info">${fsrsInfo.dueText}</span>
        </div>
      </div>
    `;

    // Click xem ảnh phóng to
    const imgWrap = cardEl.querySelector('.library-word-thumbnail-wrap');
    if (imgWrap && imgSrc) {
      imgWrap.onclick = () => openImageLightbox(imgSrc, card.word);
    }

    // Click phát âm
    const soundBtn = cardEl.querySelector('.btn-card-sound');
    if (soundBtn) {
      soundBtn.onclick = (e) => {
        e.stopPropagation();
        soundBtn.classList.add('playing');
        speak(card.word, { cardObj: card });
      };
    }

    // Click ôn riêng từ này
    const studyBtn = cardEl.querySelector('.btn-card-single-study');
    if (studyBtn) {
      studyBtn.onclick = (e) => {
        e.stopPropagation();
        app.startStudySession(card.deckId || null, null, [card]);
      };
    }

    frag.appendChild(cardEl);
  });

  gridContainer.innerHTML = '';
  gridContainer.appendChild(frag);

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
 * Mở modal phóng to hình ảnh
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
    <img src="${escapeHTML(src)}" class="image-lightbox-content" alt="${escapeHTML(altText)}" />
  `;
  modal.style.display = 'flex';

  modal.onclick = () => {
    modal.style.display = 'none';
  };
}
