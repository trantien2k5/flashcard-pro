/**
 * Universal Spotlight Search Controller & Multi-Faceted Vocabulary Engine
 */

import { StorageManager } from '../services/storage.js';
import { State } from '../core/learning/fsrs.js';
import { escapeHTML } from '../utils/sanitize.js';
import { speak } from '../services/audio.js';

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
    const btnOpenHeader = document.getElementById('btn-header-search');
    const btnOpenLegacy = document.getElementById('btn-open-search-modal');
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

    // 1. Quản lý Lịch sử tìm kiếm
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
      let history = getSearchHistory().filter(item => item.toLowerCase() !== q.toLowerCase());
      history.unshift(q);
      saveSearchHistory(history);
    };

    const removeHistoryItem = (query) => {
      const history = getSearchHistory().filter(item => item.toLowerCase() !== query.toLowerCase());
      saveSearchHistory(history);
      renderEmptyState();
    };

    const clearAllHistory = () => {
      saveSearchHistory([]);
      renderEmptyState();
    };

    // 2. Hàm Tô sáng từ khóa (Safe Highlight)
    const highlightMatch = (text, query) => {
      if (!text || !query) return escapeHTML(text || '');
      const escapedText = escapeHTML(String(text));
      const escapedQuery = escapeHTML(String(query).trim());
      if (!escapedQuery) return escapedText;

      const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    };

    // 3. Render Màn hình Gợi ý & Lịch sử khi chưa gõ từ khóa
    const renderEmptyState = () => {
      if (!emptyStateContainer) return;
      const history = getSearchHistory();

      let historyHtml = '';
      if (history.length > 0) {
        historyHtml = `
          <div class="search-history-section">
            <div class="search-section-title">
              <span>🕒 Tìm kiếm gần đây</span>
              <button type="button" class="btn-clear-history" id="btn-clear-all-history">Xóa tất cả</button>
            </div>
            <div class="search-chips-wrap">
              ${history.map(item => `
                <div class="search-history-chip" data-search-query="${escapeHTML(item)}">
                  <span>${escapeHTML(item)}</span>
                  <span class="search-history-remove" data-remove-query="${escapeHTML(item)}" title="Xóa">✕</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      const hotTagsHtml = `
        <div class="search-suggestions-section">
          <div class="search-section-title">
            <span>💡 Gợi ý chủ đề & cấp độ phổ biến</span>
          </div>
          <div class="search-chips-wrap">
            ${HOT_SEARCH_TAGS.map(tag => `
              <div class="search-history-chip" data-search-query="${escapeHTML(tag.query)}">
                <span>${escapeHTML(tag.label)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      emptyStateContainer.innerHTML = `
        <div class="search-empty-hero">
          <div class="search-empty-hero-icon">🔍</div>
          <div class="search-empty-hero-title">Tìm kiếm từ vựng đa năng</div>
          <div class="search-empty-hero-desc">Tra cứu tức thì hơn 2.500+ từ vựng theo nghĩa Tiếng Việt, phiên âm IPA, câu ví dụ, từ loại hoặc cấp độ CEFR.</div>
        </div>
        ${historyHtml}
        ${hotTagsHtml}
      `;

      // Gắn sự kiện click cho Lịch sử & Gợi ý
      const chipEls = emptyStateContainer.querySelectorAll('.search-history-chip');
      chipEls.forEach(chip => {
        chip.addEventListener('click', (e) => {
          if (e.target.classList.contains('search-history-remove')) {
            e.stopPropagation();
            const removeTarget = e.target.getAttribute('data-remove-query');
            if (removeTarget) removeHistoryItem(removeTarget);
            return;
          }
          const query = chip.getAttribute('data-search-query');
          if (query) {
            searchInput.value = query;
            if (btnClearInput) btnClearInput.style.display = 'flex';
            executeSearch(query);
            searchInput.focus();
          }
        });
      });

      const btnClearAll = emptyStateContainer.querySelector('#btn-clear-all-history');
      if (btnClearAll) {
        btnClearAll.addEventListener('click', (e) => {
          e.stopPropagation();
          clearAllHistory();
        });
      }

      emptyStateContainer.style.display = 'flex';
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (resultCountLabel) resultCountLabel.textContent = '';
    };

    // 4. Mở & Đóng Search Modal
    const openSearch = (initialQuery = '') => {
      try {
        searchModal.classList.add('active');
        if (app.deckManager && app.deckManager.preloadAllWordsInBackground) {
          app.deckManager.preloadAllWordsInBackground();
        }
        if (initialQuery) {
          searchInput.value = initialQuery;
          executeSearch(initialQuery);
        } else {
          renderEmptyState();
        }
        setTimeout(() => searchInput.focus(), 80);
      } catch (err) {
        console.error('Lỗi mở search modal:', err);
      }
    };

    const closeSearch = () => {
      try {
        searchModal.classList.remove('active');
        searchInput.value = '';
        if (btnClearInput) btnClearInput.style.display = 'none';
        currentResults = [];
        selectedIndex = -1;
      } catch (err) {
        console.error('Lỗi đóng search modal:', err);
      }
    };

    if (btnOpenHeader) btnOpenHeader.addEventListener('click', () => openSearch());
    if (btnOpenLegacy) btnOpenLegacy.addEventListener('click', () => openSearch());
    if (btnCloseSearch) btnCloseSearch.addEventListener('click', closeSearch);

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });

    if (btnClearInput) {
      btnClearInput.addEventListener('click', () => {
        searchInput.value = '';
        btnClearInput.style.display = 'none';
        selectedIndex = -1;
        renderEmptyState();
        searchInput.focus();
      });
    }

    // 5. Bộ lọc đa tầng (Quick Filter Chips)
    if (filterTagsContainer) {
      const filterButtons = filterTagsContainer.querySelectorAll('.search-filter-tag');
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.getAttribute('data-search-filter') || 'all';
          executeSearch(searchInput.value);
        });
      });
    }

    // 6. Thuật toán tìm kiếm & Xếp hạng kết quả thông minh (Ranked Search & Faceting)
    const executeSearch = (rawQuery) => {
      try {
        const query = (rawQuery || '').trim();
        if (btnClearInput) {
          btnClearInput.style.display = query ? 'flex' : 'none';
        }

        if (!query) {
          renderEmptyState();
          return;
        }

        const qLower = query.toLowerCase();
        const allCards = app.deckManager.getAllCards();
        const cardStates = StorageManager.getAllCardStates();

        // Lọc theo từ khóa đa trường
        let matched = allCards.filter(card => {
          const w = (card.word || '').toLowerCase();
          const m = (card.meaning || '').toLowerCase();
          const d = (card.definition || '').toLowerCase();
          const p = (card.phonetic || card.ipa || '').toLowerCase();
          const pos = (card.pos || '').toLowerCase();
          const cefr = (card.cefr || '').toLowerCase();
          const ex = (card.example || '').toLowerCase();
          const exVi = (card.exampleVi || '').toLowerCase();
          const sub = (card.subtopic || '').toLowerCase();

          return w.includes(qLower) ||
                 m.includes(qLower) ||
                 d.includes(qLower) ||
                 p.includes(qLower) ||
                 pos.includes(qLower) ||
                 cefr.includes(qLower) ||
                 ex.includes(qLower) ||
                 exVi.includes(qLower) ||
                 sub.includes(qLower);
        });

        // Áp dụng Facet Filter
        if (currentFilter !== 'all') {
          if (currentFilter.startsWith('pos:')) {
            const targetPos = currentFilter.slice(4).toLowerCase();
            matched = matched.filter(c => (c.pos || '').toLowerCase().includes(targetPos));
          } else if (currentFilter.startsWith('cefr:')) {
            const targetCefr = currentFilter.slice(5).toLowerCase();
            if (targetCefr === 'b1') {
              matched = matched.filter(c => {
                const lvl = (c.cefr || '').toUpperCase();
                return lvl === 'B1' || lvl === 'B2';
              });
            } else if (targetCefr === 'c1') {
              matched = matched.filter(c => {
                const lvl = (c.cefr || '').toUpperCase();
                return lvl === 'C1' || lvl === 'C2';
              });
            }
          } else if (currentFilter === 'state:due') {
            const now = new Date();
            matched = matched.filter(c => {
              const s = cardStates[c.id];
              return s && s.state !== State.New && s.state !== 0 && s.due && new Date(s.due) <= now;
            });
          } else if (currentFilter === 'state:new') {
            matched = matched.filter(c => {
              const s = cardStates[c.id];
              return !s || s.state === State.New || s.state === 0;
            });
          }
        }

        // Xếp hạng (Ranking & Scoring): Trùng chính xác từ tiếng Anh -> Bắt đầu bằng từ khóa -> Trùng nghĩa -> Khác
        matched.sort((a, b) => {
          const aWord = (a.word || '').toLowerCase();
          const bWord = (b.word || '').toLowerCase();
          if (aWord === qLower && bWord !== qLower) return -1;
          if (bWord === qLower && aWord !== qLower) return 1;
          if (aWord.startsWith(qLower) && !bWord.startsWith(qLower)) return -1;
          if (bWord.startsWith(qLower) && !aWord.startsWith(qLower)) return 1;
          return 0;
        });

        currentResults = matched;
        selectedIndex = -1;

        if (emptyStateContainer) emptyStateContainer.style.display = 'none';
        if (resultsContainer) {
          resultsContainer.style.display = 'flex';
          resultsContainer.innerHTML = '';
        }

        if (resultCountLabel) {
          resultCountLabel.textContent = `${matched.length} kết quả`;
        }

        if (matched.length === 0) {
          resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 8px;">🤔</div>
              <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Không tìm thấy từ vựng nào</div>
              <div style="font-size: 0.82rem;">Không có kết quả khớp với "${escapeHTML(query)}". Hãy thử tìm theo nghĩa tiếng Việt hoặc đổi bộ lọc.</div>
            </div>
          `;
          return;
        }

        // Render tối đa 40 kết quả đầu để đảm bảo 60fps mượt mà
        const displayList = matched.slice(0, 40);
        const fragment = document.createDocumentFragment();

        displayList.forEach((card, idx) => {
          const cardEl = document.createElement('div');
          cardEl.className = 'search-card-item';
          cardEl.setAttribute('data-card-index', idx);

          const cardState = cardStates[card.id];
          let memoryBadge = '';
          if (cardState && cardState.state !== State.New && cardState.state !== 0) {
            const isDue = cardState.due && new Date(cardState.due) <= new Date();
            if (isDue) {
              memoryBadge = `<span class="search-badge-pos" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">⚠️ Cần ôn</span>`;
            } else {
              memoryBadge = `<span class="search-badge-pos" style="background: rgba(16, 185, 129, 0.12); color: #10b981;">✓ S: ${Math.round(cardState.stability || 1)}d</span>`;
            }
          }

          cardEl.innerHTML = `
            <div class="search-card-header">
              <div class="search-card-word-meta">
                <span class="search-card-word">${highlightMatch(card.word, query)}</span>
                <span class="search-card-phonetic">${escapeHTML(card.phonetic || card.ipa || '')}</span>
                ${card.pos ? `<span class="search-badge-pos">${escapeHTML(card.pos)}</span>` : ''}
                ${card.cefr ? `<span class="search-badge-cefr">${escapeHTML(card.cefr)}</span>` : ''}
                ${memoryBadge}
              </div>
              <div class="search-card-actions">
                <button type="button" class="btn-search-action-icon btn-search-audio" title="Nghe phát âm" aria-label="Phát âm">🔊</button>
                <button type="button" class="btn-search-study-now" title="Học ngay qua Flashcard">⚡ Học ngay</button>
              </div>
            </div>
            <div class="search-card-meaning">${highlightMatch(card.meaning, query)}</div>
            ${card.example ? `
              <div class="search-card-example">
                "${highlightMatch(card.example, query)}"
                ${card.exampleVi ? `<div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 1px;">${highlightMatch(card.exampleVi, query)}</div>` : ''}
              </div>
            ` : ''}
          `;

          // Xử lý nút Loa phát âm trực tiếp
          const btnAudio = cardEl.querySelector('.btn-search-audio');
          if (btnAudio) {
            btnAudio.addEventListener('click', (e) => {
              e.stopPropagation();
              speak(card.word, app.settings?.audioAccent || 'us');
            });
          }

          // Xử lý nút Học ngay (Mở Flashcard 3D)
          const btnStudy = cardEl.querySelector('.btn-search-study-now');
          if (btnStudy) {
            btnStudy.addEventListener('click', (e) => {
              e.stopPropagation();
              addQueryToHistory(card.word);
              closeSearch();
              app.startStudySession([card]);
            });
          }

          // Nhấn vào thẻ kết quả: Mở chi tiết hoặc chuyển tới chặng
          cardEl.addEventListener('click', () => {
            addQueryToHistory(card.word);
            closeSearch();
            if (card.deckId && card.subtopic && typeof app.openSubtopicWordsPage === 'function') {
              app.openSubtopicWordsPage(card.deckId, card.subtopic);
            } else {
              app.startStudySession([card]);
            }
          });

          fragment.appendChild(cardEl);
        });

        resultsContainer.appendChild(fragment);
      } catch (err) {
        console.error('Lỗi thực thi executeSearch:', err);
      }
    };

    // 7. Lắng nghe ô nhập với Debounce 120ms
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        executeSearch(val);
      }, 120);
    });

    // 8. Điều hướng phím mũi tên ↑ / ↓ / Enter / Escape
    searchInput.addEventListener('keydown', (e) => {
      if (!resultsContainer || currentResults.length === 0) return;

      const cardEls = resultsContainer.querySelectorAll('.search-card-item');
      if (cardEls.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % cardEls.length;
        updateSelectedCard(cardEls);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + cardEls.length) % cardEls.length;
        updateSelectedCard(cardEls);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < cardEls.length) {
          cardEls[selectedIndex].click();
        } else if (cardEls.length > 0) {
          cardEls[0].click();
        }
      }
    });

    const updateSelectedCard = (cardEls) => {
      cardEls.forEach((el, idx) => {
        if (idx === selectedIndex) {
          el.classList.add('selected');
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          el.classList.remove('selected');
        }
      });
    };

    // 9. Phím tắt Toàn cục: Ctrl + K, Cmd + K hoặc phím '/'
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (searchModal.classList.contains('active')) {
          closeSearch();
        } else {
          openSearch();
        }
        return;
      }

      if (e.key === 'Escape' && searchModal.classList.contains('active')) {
        closeSearch();
        return;
      }

      // Phím tắt '/' khi không gõ trong ô input khác
      if (e.key === '/' && !searchModal.classList.contains('active')) {
        const activeTagName = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTagName !== 'input' && activeTagName !== 'textarea') {
          e.preventDefault();
          openSearch();
        }
      }
    });

    // Đính kèm phương thức public lên window và app để tiện gọi từ bất kỳ đâu
    if (app) {
      app.openGlobalSearch = openSearch;
      app.closeGlobalSearch = closeSearch;
    }

  } catch (err) {
    console.error('Lỗi khởi tạo setupSearch:', err);
  }
}

