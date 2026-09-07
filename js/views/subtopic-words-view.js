/**
 * Subtopic Words View (Level 4 Subpage) - Danh sách từ vựng chi tiết, bộ lọc, phân trang và phát âm
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon } from '../constants.js';
import { StorageManager } from '../storage.js';
import { escapeHTML } from '../utils/helpers.js';

/**
 * Mở Trang danh sách từ vựng của Chủ đề con (Level 4 Subpage)
 */
export async function openSubtopicWordsPage(app, deckId, subtopicName) {
  app.currentSubtopicsDeckId = deckId;
  app.currentSubtopicName = subtopicName;
  if (app.deckManager && app.deckManager.ensureTopicLoaded) {
    await app.deckManager.ensureTopicLoaded(deckId);
  }
  app.switchTab('tab-subtopic-words');
}

/**
 * Render Trang danh sách từ vựng của Chủ đề con (Level 4 Subpage)
 */
export async function renderSubtopicWordsPage(app, deckId, subtopicName) {
  try {
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const subCards = app.deckManager.getSubtopicCards(deckId, subtopicName);
    const subIcon = getSubtopicIcon(subtopicName, deck.icon || '📖');
    const englishDeckTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;

    // 1. Cập nhật Top Header của Trang từ vựng
    const pageTitleEl = document.getElementById('subtopic-words-page-title');
    const pageSubtitleEl = document.getElementById('subtopic-words-page-subtitle');
    if (pageTitleEl) pageTitleEl.textContent = `${subIcon} ${subtopicName}`;
    if (pageSubtitleEl) pageSubtitleEl.textContent = `${subCards.length} từ vựng • ${englishDeckTitle}`;

    // 2. Chuẩn bị trạng thái học của các thẻ từ
    const wordsListContainer = document.getElementById('subtopic-words-list');
    const paginationContainer = document.getElementById('subtopic-words-pagination');
    if (!wordsListContainer) return;

    const cardStates = StorageManager.getAllCardStates();
    const now = new Date();

    const getCardStatus = (card) => {
      const state = cardStates[card.id];
      if (!state || state.state === 0) return 'new';
      if (state.due && new Date(state.due) <= now) return 'due';
      if (state.stability >= 21) return 'done';
      return 'learning';
    };

    // Đếm số lượng từ theo từng nhóm trạng thái
    let countNew = 0, countLearning = 0, countDue = 0, countDone = 0;
    subCards.forEach(card => {
      const status = getCardStatus(card);
      if (status === 'new') countNew++;
      else if (status === 'learning') countLearning++;
      else if (status === 'due') countDue++;
      else if (status === 'done') countDone++;
    });

    const chipCountAll = document.getElementById('chip-count-all');
    const chipCountNew = document.getElementById('chip-count-new');
    const chipCountLearning = document.getElementById('chip-count-learning');
    const chipCountDue = document.getElementById('chip-count-due');
    const chipCountDone = document.getElementById('chip-count-done');
    if (chipCountAll) chipCountAll.textContent = subCards.length;
    if (chipCountNew) chipCountNew.textContent = countNew;
    if (chipCountLearning) chipCountLearning.textContent = countLearning;
    if (chipCountDue) chipCountDue.textContent = countDue;
    if (chipCountDone) chipCountDone.textContent = countDone;

    // 3. Quản lý trạng thái Lọc & Phân trang
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'default';
    let pageSize = '10';
    let currentPage = 1;

    const getFilteredAndSortedCards = () => {
      let list = subCards.slice();

      // Lọc theo trạng thái chip
      if (currentFilter !== 'all') {
        list = list.filter(c => getCardStatus(c) === currentFilter);
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery) {
        list = list.filter(c => 
          (c.word && c.word.toLowerCase().includes(searchQuery)) ||
          (c.meaning && c.meaning.toLowerCase().includes(searchQuery)) ||
          (c.definition && c.definition.toLowerCase().includes(searchQuery)) ||
          (c.phonetic && c.phonetic.toLowerCase().includes(searchQuery))
        );
      }

      // Sắp xếp
      if (currentSort === 'az') {
        list.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
      } else if (currentSort === 'za') {
        list.sort((a, b) => (b.word || '').localeCompare(a.word || ''));
      }

      return list;
    };

    const render = () => {
      const processedCards = getFilteredAndSortedCards();
      const totalItems = processedCards.length;
      
      const effectivePageSize = pageSize === 'all' ? (totalItems || 1) : parseInt(pageSize, 10);
      const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
      
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const startIndex = (currentPage - 1) * effectivePageSize;
      const endIndex = Math.min(startIndex + effectivePageSize, totalItems);
      const pageCards = processedCards.slice(startIndex, endIndex);

      // Render danh sách thẻ từ
      wordsListContainer.innerHTML = '';
      if (totalItems === 0) {
        wordsListContainer.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
            Không tìm thấy từ vựng nào khớp với bộ lọc
          </div>
        `;
      } else {
        const fragment = document.createDocumentFragment();

        pageCards.forEach((card, idx) => {
          const globalIdx = startIndex + idx + 1;
          const status = getCardStatus(card);
          let cardStatusBadge = `<span class="subtopic-badge badge-new">Mới</span>`;
          if (status === 'due') {
            cardStatusBadge = `<span class="subtopic-badge badge-due">⚠️ Cần ôn</span>`;
          } else if (status === 'done') {
            cardStatusBadge = `<span class="subtopic-badge badge-done">✓ Đã thuộc</span>`;
          } else if (status === 'learning') {
            cardStatusBadge = `<span class="subtopic-badge badge-learning">Đang học</span>`;
          }

          const wordCardEl = document.createElement('div');
          wordCardEl.className = 'word-item-card';
          wordCardEl.innerHTML = `
            <div class="word-card-top">
              <div class="word-card-header">
                <span class="word-index">#${globalIdx}</span>
                <span class="word-text">${escapeHTML(card.word)}</span>
                ${card.phonetic ? `<span class="word-phonetic">${escapeHTML(card.phonetic)}</span>` : ''}
                ${card.pos ? `<span class="badge-tag">${escapeHTML(card.pos)}</span>` : ''}
              </div>
              <div class="word-card-actions">
                ${cardStatusBadge}
                <button class="btn-tts-audio" data-word="${escapeHTML(card.word)}" aria-label="Phát âm">🔊</button>
              </div>
            </div>
            <div class="word-meaning">${escapeHTML(card.meaning || '')}</div>
            ${card.definition ? `<div class="word-definition">${escapeHTML(card.definition)}</div>` : ''}
          `;

          const ttsBtn = wordCardEl.querySelector('.btn-tts-audio');
          if (ttsBtn) {
            ttsBtn.onclick = (e) => {
              try {
                e.stopPropagation();
                if (app && app.studySession && typeof app.studySession.speak === 'function') {
                  app.studySession.speak(card.word);
                }
              } catch (err) {
                console.error('Lỗi phát âm từ vựng:', err);
              }
            };
          }

          fragment.appendChild(wordCardEl);
        });

        wordsListContainer.appendChild(fragment);
      }

      // Render Phân trang
      if (paginationContainer) {
        if (totalItems <= effectivePageSize || totalItems === 0) {
          if (totalItems > 0) {
            paginationContainer.innerHTML = `
              <div class="pagination-info">Hiển thị toàn bộ ${totalItems} từ vựng</div>
            `;
          } else {
            paginationContainer.innerHTML = '';
          }
          return;
        }

        let navHtml = `
          <div class="pagination-nav">
            <button class="pagination-btn" id="btn-page-prev" ${currentPage === 1 ? 'disabled' : ''}>‹ Trước</button>
        `;

        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
            navHtml += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
          } else if (p === currentPage - 2 || p === currentPage + 2) {
            navHtml += `<span style="padding: 0 4px; color: var(--text-muted); font-size: 0.8rem;">...</span>`;
          }
        }

        navHtml += `
            <button class="pagination-btn" id="btn-page-next" ${currentPage === totalPages ? 'disabled' : ''}>Sau ›</button>
          </div>
          <div class="pagination-info">Hiển thị từ ${startIndex + 1} - ${endIndex} trong tổng số ${totalItems} từ (Trang ${currentPage}/${totalPages})</div>
        `;

        paginationContainer.innerHTML = navHtml;

        const prevBtn = paginationContainer.querySelector('#btn-page-prev');
        if (prevBtn) {
          prevBtn.onclick = () => {
            if (currentPage > 1) {
              currentPage--;
              render();
              wordsListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          };
        }

        const nextBtn = paginationContainer.querySelector('#btn-page-next');
        if (nextBtn) {
          nextBtn.onclick = () => {
            if (currentPage < totalPages) {
              currentPage++;
              render();
              wordsListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          };
        }

        paginationContainer.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
          btn.onclick = () => {
            const pageNum = parseInt(btn.getAttribute('data-page'), 10);
            if (pageNum && pageNum !== currentPage) {
              currentPage = pageNum;
              render();
              wordsListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          };
        });
      }
    };

    // 4. Lắng nghe các bộ lọc (Chips, Tìm kiếm, Sắp xếp, Phân trang)
    const chipsContainer = document.getElementById('subtopic-words-filter-chips');
    if (chipsContainer) {
      chipsContainer.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-filter') === currentFilter);
        chip.onclick = () => {
          const filter = chip.getAttribute('data-filter');
          if (filter !== currentFilter) {
            currentFilter = filter;
            chipsContainer.querySelectorAll('.filter-chip').forEach(c => {
              c.classList.toggle('active', c === chip);
            });
            currentPage = 1;
            render();
          }
        };
      });
    }

    const sortSelect = document.getElementById('subtopic-words-sort-select');
    if (sortSelect) {
      sortSelect.value = currentSort;
      sortSelect.onchange = (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        render();
      };
    }

    const pageSizeSelect = document.getElementById('subtopic-words-pagesize-select');
    if (pageSizeSelect) {
      pageSizeSelect.value = pageSize;
      pageSizeSelect.onchange = (e) => {
        pageSize = e.target.value;
        currentPage = 1;
        render();
      };
    }

    const filterInput = document.getElementById('subtopic-words-filter-input');
    if (filterInput) {
      filterInput.value = '';
      filterInput.oninput = (e) => {
        searchQuery = (e.target.value || '').trim().toLowerCase();
        currentPage = 1;
        render();
      };
    }

    // Render khởi tạo ban đầu
    render();
  } catch (err) {
    console.error('Lỗi renderSubtopicWordsPage:', err);
  }
}
