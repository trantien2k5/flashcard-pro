/**
 * Spotlight Search Controller (Full-text word search & Quick Actions)
 */

import { StorageManager } from '../../services/storage.js';
import { escapeHTML, highlightKeyword } from '../../utils.js';
import { speak } from '../../services/audio.js';
import { mountGlobalModals } from './shell.js';
import {
  HOT_SEARCH_TAGS,
  getSearchHistory,
  addQueryToHistory,
  removeQueryFromHistory,
  clearSearchHistory
} from './search-history.js';
import { searchCards } from './search-engine.js';

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

    const updateSelectedResult = () => {
      if (!resultsContainer) return;
      resultsContainer.querySelectorAll('.search-result-row').forEach((r, idx) => {
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
          clearSearchHistory();
          renderSearchSuggestions();
        };
      }

      emptyStateContainer.querySelectorAll('.btn-remove-chip').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const query = btn.dataset.remove;
          if (query) {
            removeQueryFromHistory(query);
            renderSearchSuggestions();
          }
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
            <button class="btn-search-audio" title="Phát âm" data-word="${escapeHTML(card.word)}" type="button">🔊</button>
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

    const performSearch = (rawQuery) => {
      const q = rawQuery.toLowerCase().trim();
      if (!q) {
        renderSearchSuggestions();
        return;
      }

      if (emptyStateContainer) emptyStateContainer.style.display = 'none';
      if (!resultsContainer) return;
      resultsContainer.style.display = 'flex';

      const { totalMatches, results } = searchCards(
        app.deckManager.getAllCards(),
        StorageManager.getAllCardStates(),
        q,
        currentFilter
      );
      currentResults = results;
      selectedIndex = -1;

      if (resultCountLabel) {
        resultCountLabel.textContent = `Tìm thấy ${totalMatches} từ vựng phù hợp`;
      }

      renderSearchResults(currentResults, q);
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
        searchModal.classList.contains('active') ? closeSearchModal() : openSearchModal();
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

    if (filterTagsContainer) {
      filterTagsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.search-filter-tag');
        if (!btn) return;
        filterTagsContainer.querySelectorAll('.search-filter-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.searchFilter || btn.dataset.filter || 'all';
        if (searchInput.value.trim()) performSearch(searchInput.value.trim());
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
      if (btnClearInput) btnClearInput.style.display = q ? 'flex' : 'none';
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      if (!q) {
        renderSearchSuggestions();
        return;
      }
      searchDebounceTimer = setTimeout(() => performSearch(q), 150);
    });
  } catch (err) {
    console.error('Lỗi khi setupSearch:', err);
  }
}
