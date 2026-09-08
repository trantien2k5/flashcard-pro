/**
 * Search Modal Component - Global Instant Search across all vocabulary cards
 */

import { escapeHTML } from '../utils/sanitize.js';

export function setupSearch(app) {
  try {
    const btnOpenSearch = document.getElementById('btn-open-search-modal');
    const searchModal = document.getElementById('search-modal');
    const btnCloseSearch = document.getElementById('btn-close-search-modal');
    const searchInput = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('search-modal-results');

    if (!searchModal || !searchInput) return;

    if (btnOpenSearch) {
      btnOpenSearch.addEventListener('click', () => {
        try {
          searchModal.classList.add('active');
          if (app.deckManager.preloadAllWordsInBackground) {
            app.deckManager.preloadAllWordsInBackground();
          }
          setTimeout(() => searchInput.focus(), 100);
        } catch (err) {
          console.error('Lỗi mở search modal:', err);
        }
      });
    }

    const closeSearch = () => {
      try {
        searchModal.classList.remove('active');
        searchInput.value = '';
        if (resultsContainer) {
          resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
              Nhập từ vựng, phiên âm hoặc định nghĩa để tìm kiếm nhanh
            </div>
          `;
        }
      } catch (err) {
        console.error('Lỗi đóng search modal:', err);
      }
    };

    if (btnCloseSearch) {
      btnCloseSearch.addEventListener('click', closeSearch);
    }

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });

    // Lắng nghe Escape để đóng modal tìm kiếm
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal.classList.contains('active')) {
        closeSearch();
      }
    });

    // Debounce helper để tối ưu hóa tìm kiếm khi gõ nhanh trên điện thoại/bàn phím
    let searchDebounceTimer = null;

    const executeSearch = (query) => {
      try {
        if (!resultsContainer) return;

        if (!query.trim()) {
          resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
              Nhập từ vựng, phiên âm hoặc định nghĩa để tìm kiếm nhanh
            </div>
          `;
          return;
        }

        const results = app.deckManager.searchCards(query);
        resultsContainer.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">Tìm thấy ${results.length} từ vựng phù hợp:</div>`;

        if (results.length === 0) {
          resultsContainer.innerHTML += `<div style="text-align: center; padding: 30px; color: var(--text-muted);">Không tìm thấy từ vựng nào phù hợp với từ khóa "${escapeHTML(query)}".</div>`;
          return;
        }

        const fragment = document.createDocumentFragment();
        results.slice(0, 30).forEach(card => {
          const item = document.createElement('div');
          item.className = 'deck-item-card';
          item.style.padding = '12px 16px';
          item.style.margin = '0';
          item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 700; font-size: 1.05rem;">${escapeHTML(card.word)}</span>
                <span style="color: var(--accent); font-family: var(--font-mono); font-size: 0.85rem; margin-left: 6px;">${escapeHTML(card.phonetic || '')}</span>
                <span class="badge-tag" style="margin-left: 6px;">${escapeHTML(card.pos || '')}</span>
              </div>
              <button class="btn-tts-audio" style="width: 28px; height: 28px; font-size: 0.8rem;" data-word="${escapeHTML(card.word)}" aria-label="Phát âm">🔊</button>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-primary); margin-top: 4px;">${escapeHTML(card.meaning || '')}</div>
            ${card.example ? `<div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; margin-top: 2px;">"${escapeHTML(card.example)}"</div>` : ''}
          `;
          const audioBtn = item.querySelector('.btn-tts-audio');
          if (audioBtn) {
            audioBtn.onclick = (ev) => {
              try {
                ev.stopPropagation();
                app.studySession.speak(card.word);
              } catch (err) {
                console.error('Lỗi phát âm từ search:', err);
              }
            };
          }
          fragment.appendChild(item);
        });

        resultsContainer.appendChild(fragment);
      } catch (err) {
        console.error('Lỗi thực thi executeSearch:', err);
      }
    };

    // Xử lý tìm kiếm real-time với debounce 150ms
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        executeSearch(val);
      }, 150);
    });
  } catch (err) {
    console.error('Lỗi setupSearch:', err);
  }
}
