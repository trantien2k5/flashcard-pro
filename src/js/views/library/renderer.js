/**
 * Library Words List & Pagination Renderer (DocumentFragment Virtual Chunking)
 */

import { StorageManager } from '../../services/storage.js';
import { escapeHTML, scrollToTop } from '../../utils.js';
import { speak, onAudioPlayStateChange } from '../../services/audio.js';
import { formatFSRSDueText, openWordDetailModal } from './detail-modal.js';
import {
  libState,
  resetLibFilters,
  isFilterActive,
  formatShortPos,
  getFilteredAndSortedCards
} from './filters.js';

if (typeof window !== 'undefined') {
  onAudioPlayStateChange((isPlaying) => {
    if (!isPlaying) {
      document.querySelectorAll('.btn-row-sound.playing, .btn-modal-sound.playing').forEach(btn => btn.classList.remove('playing'));
    }
  });
}

/**
 * Hiển thị danh sách từ vựng dạng 1 dòng/từ kèm phân trang
 */
export function renderLibraryWords(app, onReloadTab) {
  const listContainer = document.getElementById('lib-words-list');
  const resultsSummary = document.getElementById('lib-results-summary');
  const paginationInfo = document.getElementById('lib-pagination-info');
  const btnStudyLabel = document.getElementById('btn-lib-study-label');

  if (!listContainer) return;

  const totalAllCards = app.deckManager ? app.deckManager.getAllCards().length : 0;
  const filteredCards = getFilteredAndSortedCards(app);
  const totalFiltered = filteredCards.length;
  const pageSize = libState.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  if (libState.currentPage > totalPages) {
    libState.currentPage = totalPages;
  }
  const currentPage = libState.currentPage;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const pageCards = filteredCards.slice(startIndex, endIndex);

  if (btnStudyLabel) {
    btnStudyLabel.textContent = `Học (${totalFiltered.toLocaleString('vi-VN')})`;
  }

  if (resultsSummary) {
    const isFiltered = isFilterActive();
    const countText = totalFiltered === totalAllCards
      ? `Hiển thị <strong>${totalFiltered.toLocaleString('vi-VN')}</strong> từ vựng`
      : `Tìm thấy <strong>${totalFiltered.toLocaleString('vi-VN')}</strong> / ${totalAllCards.toLocaleString('vi-VN')} từ`;
    resultsSummary.innerHTML = `
      <div class="results-summary-content">
        <span class="results-count-label">${countText}</span>
        ${libState.searchQuery ? `<span class="filter-badge-keyword" title="Bỏ từ khóa tìm kiếm">"${escapeHTML(libState.searchQuery)}"</span>` : ''}
        ${isFiltered ? `
          <button type="button" class="btn-lib-reset-inline" id="btn-reset-all-filters" title="Xóa tất cả bộ lọc">
            ✕ Đặt lại
          </button>
        ` : ''}
      </div>
    `;
    const btnResetFilters = resultsSummary.querySelector('#btn-reset-all-filters');
    if (btnResetFilters) {
      btnResetFilters.onclick = () => {
        resetLibFilters();
        onReloadTab?.(app);
      };
    }
  }

  if (paginationInfo) {
    paginationInfo.textContent = totalFiltered > 0 ? `${currentPage}/${totalPages}` : '0/0';
  }

  if (totalFiltered === 0) {
    listContainer.innerHTML = `
      <div class="library-empty-state">
        <span class="library-empty-icon">🔍</span>
        <h3 class="library-empty-title">Không tìm thấy từ vựng nào</h3>
        <p class="library-empty-desc">Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm đặt lại bộ lọc.</p>
        <button class="btn-clear-empty-filter" id="btn-empty-reset">
          🔄 Đặt lại bộ lọc
        </button>
      </div>
    `;
    const btnEmptyReset = document.getElementById('btn-empty-reset');
    if (btnEmptyReset) {
      btnEmptyReset.onclick = () => {
        resetLibFilters();
        onReloadTab?.(app);
      };
    }
    renderPaginationBar(app, totalPages, currentPage, onReloadTab);
    return;
  }

  const now = new Date();
  const frag = document.createDocumentFragment();

  pageCards.forEach(card => {
    const state = StorageManager.getCardState(card.id);
    const fsrs = formatFSRSDueText(state, now);
    const cefr = (card.cefr || card.level || 'a1').toUpperCase();
    const phonetic = card.phonetic || card.ipa || '';
    const shortPos = formatShortPos(card.pos);

    const rowEl = document.createElement('div');
    rowEl.className = 'library-word-row';
    rowEl.setAttribute('data-card-id', card.id);
    rowEl.setAttribute('tabindex', '0');
    rowEl.setAttribute('role', 'button');
    rowEl.setAttribute('aria-label', `Xem chi tiết từ ${card.word}`);

    rowEl.innerHTML = `
      <div class="col-cell cell-sound">
        <button class="btn-row-sound" title="Phát âm từ vựng" aria-label="Phát âm ${escapeHTML(card.word)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </button>
      </div>

      <div class="col-cell cell-word">
        <span class="library-row-word">${escapeHTML(card.word || '')}</span>
      </div>

      <div class="col-cell cell-ipa">
        <span class="library-row-ipa">${phonetic ? escapeHTML(phonetic) : '—'}</span>
      </div>

      <div class="col-cell cell-cefr">
        <span class="badge-cefr-mini" data-cefr="${cefr.toLowerCase()}">${cefr}</span>
      </div>

      <div class="col-cell cell-pos">
        <span class="library-pos-text">${shortPos ? escapeHTML(shortPos) : '—'}</span>
      </div>

      <div class="col-cell cell-meaning">
        <span class="library-row-meaning">${escapeHTML(card.meaning || '')}</span>
      </div>

      <div class="col-cell cell-status">
        <span class="library-status-badge ${fsrs.statusClass}">
          <span class="status-dot"></span>
          <span>${fsrs.shortDueText}</span>
        </span>
        <svg class="library-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    `;

    const soundBtn = rowEl.querySelector('.btn-row-sound');
    if (soundBtn) {
      soundBtn.onclick = (e) => {
        e.stopPropagation();
        soundBtn.classList.add('playing');
        speak(card.word, { cardObj: card });
      };
    }

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

  renderPaginationBar(app, totalPages, currentPage, onReloadTab);
}

/**
 * Hiển thị thanh điều hướng phân trang
 */
export function renderPaginationBar(app, totalPages, currentPage, onReloadTab) {
  const paginationBar = document.getElementById('lib-pagination-bar');
  if (!paginationBar) return;

  if (totalPages <= 1) {
    paginationBar.innerHTML = '';
    return;
  }

  let html = `
    <button class="btn-page-nav" id="btn-page-prev" ${currentPage === 1 ? 'disabled' : ''}>
      ◀
    </button>
    <div class="pagination-pages-list">
  `;

  const pageNumbers = [];
  if (totalPages <= 5) {
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
      ▶
    </button>
  `;

  paginationBar.innerHTML = html;

  const btnPrev = document.getElementById('btn-page-prev');
  const btnNext = document.getElementById('btn-page-next');

  if (btnPrev) {
    btnPrev.onclick = () => {
      if (libState.currentPage > 1) {
        libState.currentPage--;
        renderLibraryWords(app, onReloadTab);
        scrollToTop();
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      if (libState.currentPage < totalPages) {
        libState.currentPage++;
        renderLibraryWords(app, onReloadTab);
        scrollToTop();
      }
    };
  }

  paginationBar.querySelectorAll('.btn-page-num').forEach(btn => {
    btn.onclick = () => {
      const page = parseInt(btn.getAttribute('data-page'), 10);
      if (page && page !== libState.currentPage) {
        libState.currentPage = page;
        renderLibraryWords(app, onReloadTab);
        scrollToTop();
      }
    };
  });
}

