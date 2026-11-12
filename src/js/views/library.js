/**
 * Thư Viện Từ Vựng - Quản lý toàn diện kho từ vựng & Hệ thống bộ lọc FSRS-6 chuyên sâu
 * Facade điều phối bộ lọc, shell tìm kiếm & bảng phân trang danh sách từ.
 */

import { escapeHTML } from '../utils.js';
import { openWordDetailModal } from './library/detail-modal.js';
import { libState, resetLibFilters, getFilteredAndSortedCards } from './library/filters.js';
import { renderLibraryWords } from './library/renderer.js';

export { openWordDetailModal };

/**
 * Khởi tạo và hiển thị toàn bộ giao diện màn hình Thư viện từ vựng
 */
export function renderLibraryTab(app) {
  const container = document.getElementById('tab-library');
  if (!container) return;

  const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
  const decks = app.deckManager ? app.deckManager.decks : [];

  container.innerHTML = `
    <div class="library-container">
      <!-- 1. Search Bar & Action Row -->
      <div class="library-top-bar">
        <div class="library-search-wrapper">
          <span class="library-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input 
            type="text" 
            id="lib-search-input" 
            class="library-search-input" 
            placeholder="Tìm từ vựng, nghĩa tiếng Việt, IPA..." 
            value="${escapeHTML(libState.searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          />
          ${libState.searchQuery ? `
            <button class="btn-clear-search" id="btn-clear-search" title="Xóa tìm kiếm">✕</button>
          ` : ''}
        </div>
        
        <button class="btn-library-study-compact" id="btn-lib-study-filtered" title="Bắt đầu học danh sách từ đang lọc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span id="btn-lib-study-label">Học (${allCards.length})</span>
        </button>
      </div>

      <!-- 2. Bộ lọc 4 Dropdown Menus Tinh Gọn -->
      <div class="library-filter-grid">
        <div class="filter-dropdown-card ${libState.selectedStatus !== 'all' ? 'active' : ''}">
          <span class="filter-dropdown-icon">⚡</span>
          <select id="lib-status-select" class="filter-dropdown-select" aria-label="Lọc theo trạng thái ôn tập">
            <option value="all" ${libState.selectedStatus === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
            <option value="new" ${libState.selectedStatus === 'new' ? 'selected' : ''}>✨ Chưa học</option>
            <option value="due" ${libState.selectedStatus === 'due' ? 'selected' : ''}>⏰ Cần ôn hôm nay</option>
            <option value="learning" ${libState.selectedStatus === 'learning' ? 'selected' : ''}>🌱 Đang ghi nhớ</option>
            <option value="mastered" ${libState.selectedStatus === 'mastered' ? 'selected' : ''}>🏆 Thuần thục dài hạn</option>
            <option value="leech" ${libState.selectedStatus === 'leech' || libState.selectedStatus === 'hard' ? 'selected' : ''}>⚠️ Hay quên liên tục (Leech)</option>
          </select>
          <span class="filter-dropdown-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <div class="filter-dropdown-card ${libState.selectedCefr !== 'all' ? 'active' : ''}">
          <span class="filter-dropdown-icon">🎓</span>
          <select id="lib-cefr-select" class="filter-dropdown-select" aria-label="Lọc theo trình độ CEFR">
            <option value="all" ${libState.selectedCefr === 'all' ? 'selected' : ''}>Tất cả trình độ</option>
            <option value="a1" ${libState.selectedCefr === 'a1' ? 'selected' : ''}>A1 • Căn bản</option>
            <option value="a2" ${libState.selectedCefr === 'a2' ? 'selected' : ''}>A2 • Sơ cấp</option>
            <option value="b1" ${libState.selectedCefr === 'b1' ? 'selected' : ''}>B1 • Trung cấp</option>
            <option value="b2" ${libState.selectedCefr === 'b2' ? 'selected' : ''}>B2 • Trung cao</option>
            <option value="c1" ${libState.selectedCefr === 'c1' ? 'selected' : ''}>C1 • Cao cấp</option>
          </select>
          <span class="filter-dropdown-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <div class="filter-dropdown-card ${libState.selectedPos !== 'all' ? 'active' : ''}">
          <span class="filter-dropdown-icon">🏷️</span>
          <select id="lib-pos-select" class="filter-dropdown-select" aria-label="Lọc theo loại từ">
            <option value="all" ${libState.selectedPos === 'all' ? 'selected' : ''}>Tất cả loại từ</option>
            <option value="noun" ${libState.selectedPos === 'noun' ? 'selected' : ''}>Danh từ (n)</option>
            <option value="verb" ${libState.selectedPos === 'verb' ? 'selected' : ''}>Động từ (v)</option>
            <option value="adjective" ${libState.selectedPos === 'adjective' ? 'selected' : ''}>Tính từ (adj)</option>
            <option value="adverb" ${libState.selectedPos === 'adverb' ? 'selected' : ''}>Trạng từ (adv)</option>
            <option value="phrasal verb" ${libState.selectedPos === 'phrasal verb' ? 'selected' : ''}>Cụm động từ (phrasal verb)</option>
            <option value="phrase" ${libState.selectedPos === 'phrase' ? 'selected' : ''}>Cụm từ & Thành ngữ (phrase)</option>
            <option value="preposition" ${libState.selectedPos === 'preposition' ? 'selected' : ''}>Giới từ (prep)</option>
          </select>
          <span class="filter-dropdown-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <div class="filter-dropdown-card ${libState.selectedDeck !== 'all' ? 'active' : ''}">
          <span class="filter-dropdown-icon">📚</span>
          <select id="lib-deck-select" class="filter-dropdown-select" aria-label="Lọc theo chủ đề">
            <option value="all" ${libState.selectedDeck === 'all' ? 'selected' : ''}>Tất cả chủ đề</option>
            ${decks.map(d => `
              <option value="${escapeHTML(d.id)}" ${libState.selectedDeck === d.id ? 'selected' : ''}>
                ${escapeHTML(d.name || d.id)}
              </option>
            `).join('')}
          </select>
          <span class="filter-dropdown-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>

      <!-- 5. Meta & Pagination Sub-Bar -->
      <div class="library-meta-bar">
        <div class="library-results-summary" id="lib-results-summary">
          <div class="results-summary-content">
            <span class="results-count-label">Hiển thị <strong>${allCards.length.toLocaleString('vi-VN')}</strong> từ vựng</span>
          </div>
        </div>
        <div class="library-meta-right">
          <div class="meta-select-wrap">
            <select id="lib-sort-select" class="compact-meta-select" aria-label="Sắp xếp danh sách">
              <option value="due_asc" ${libState.sortBy === 'due_asc' ? 'selected' : ''}>⇅ Hạn ôn</option>
              <option value="due_desc" ${libState.sortBy === 'due_desc' ? 'selected' : ''}>⇅ Hạn ôn xa</option>
              <option value="alpha_asc" ${libState.sortBy === 'alpha_asc' ? 'selected' : ''}>⇅ A ➔ Z</option>
              <option value="alpha_desc" ${libState.sortBy === 'alpha_desc' ? 'selected' : ''}>⇅ Z ➔ A</option>
              <option value="cefr_asc" ${libState.sortBy === 'cefr_asc' ? 'selected' : ''}>⇅ Cấp độ</option>
              <option value="stability_desc" ${libState.sortBy === 'stability_desc' ? 'selected' : ''}>⇅ Độ nhớ</option>
              <option value="difficulty_desc" ${libState.sortBy === 'difficulty_desc' ? 'selected' : ''}>⇅ Độ khó</option>
            </select>
          </div>

          <select id="lib-pagesize-select" class="compact-meta-select" aria-label="Số lượng từ mỗi trang">
            <option value="20" ${libState.pageSize === 20 ? 'selected' : ''}>20 / trang</option>
            <option value="50" ${libState.pageSize === 50 ? 'selected' : ''}>50 / trang</option>
            <option value="100" ${libState.pageSize === 100 ? 'selected' : ''}>100 / trang</option>
          </select>
          <div class="library-pagination-info" id="lib-pagination-info"></div>
        </div>
      </div>

      <!-- 6. Vocabulary Table Header -->
      <div class="library-table-header" aria-hidden="true">
        <span class="th-col th-sound">Nghe</span>
        <span class="th-col th-word">Từ vựng</span>
        <span class="th-col th-ipa">Phiên âm</span>
        <span class="th-col th-cefr">Cấp độ</span>
        <span class="th-col th-pos">Loại từ</span>
        <span class="th-col th-meaning">Nghĩa tiếng Việt</span>
        <span class="th-col th-status">Trạng thái</span>
      </div>

      <!-- 7. Vocabulary Words Rows List Container -->
      <div class="library-words-list" id="lib-words-list"></div>

      <!-- 8. Bottom Pagination Bar -->
      <div class="library-pagination-bar" id="lib-pagination-bar"></div>
    </div>
  `;

  setupLibraryEventListeners(app);
  renderLibraryWords(app, renderLibraryTab);
}

function setupLibraryEventListeners(app) {
  const searchInput = document.getElementById('lib-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const selectStatus = document.getElementById('lib-status-select');
  const selectCefr = document.getElementById('lib-cefr-select');
  const selectPos = document.getElementById('lib-pos-select');
  const selectDeck = document.getElementById('lib-deck-select');
  const selectSort = document.getElementById('lib-sort-select');
  const selectPageSize = document.getElementById('lib-pagesize-select');
  const btnStudyFiltered = document.getElementById('btn-lib-study-filtered');
  const btnResetFilters = document.getElementById('btn-reset-all-filters');

  if (selectStatus) {
    selectStatus.addEventListener('change', (e) => {
      libState.selectedStatus = e.target.value || 'all';
      libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  document.querySelectorAll('.active-tag-chip[data-clear]').forEach(chip => {
    chip.onclick = () => {
      const clearTarget = chip.getAttribute('data-clear');
      if (clearTarget === 'status') libState.selectedStatus = 'all';
      else if (clearTarget === 'cefr') libState.selectedCefr = 'all';
      else if (clearTarget === 'pos') libState.selectedPos = 'all';
      else if (clearTarget === 'deck') libState.selectedDeck = 'all';
      else if (clearTarget === 'search') libState.searchQuery = '';
      libState.currentPage = 1;
      renderLibraryTab(app);
    };
  });

  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        libState.searchQuery = e.target.value.trim();
        libState.currentPage = 1;
        renderLibraryWords(app, renderLibraryTab);
        if (btnClearSearch) {
          btnClearSearch.style.display = libState.searchQuery ? 'block' : 'none';
        }
      }, 180);
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        libState.searchQuery = '';
        libState.currentPage = 1;
        btnClearSearch.style.display = 'none';
        renderLibraryWords(app, renderLibraryTab);
      }
    });
  }

  if (selectCefr) {
    selectCefr.addEventListener('change', (e) => {
      libState.selectedCefr = e.target.value || 'all';
      libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  if (selectPos) {
    selectPos.addEventListener('change', (e) => {
      libState.selectedPos = e.target.value || 'all';
      libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  if (selectDeck) {
    selectDeck.addEventListener('change', (e) => {
      libState.selectedDeck = e.target.value || 'all';
      libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  if (selectSort) {
    selectSort.addEventListener('change', (e) => {
      libState.sortBy = e.target.value || 'due_asc';
      renderLibraryWords(app, renderLibraryTab);
    });
  }

  if (selectPageSize) {
    selectPageSize.addEventListener('change', (e) => {
      libState.pageSize = parseInt(e.target.value, 10) || 20;
      libState.currentPage = 1;
      renderLibraryWords(app, renderLibraryTab);
    });
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      resetLibFilters();
      renderLibraryTab(app);
    });
  }

  if (btnStudyFiltered) {
    btnStudyFiltered.addEventListener('click', () => {
      const filtered = getFilteredAndSortedCards(app);
      if (!filtered || filtered.length === 0) {
        if (app.showToast) app.showToast('Không có từ nào trong danh sách đang lọc để học.', 'info');
        return;
      }
      app.startStudySession(null, null, filtered);
    });
  }
}
