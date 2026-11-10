/**
 * Subtopic Words List View Controller (Level 4: Subtopic Words Page)
 * Hiển thị danh sách từ vựng chi tiết của từng chặng học, phân trang và bộ lọc trạng thái (New, Due, Learning, Done).
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon, MASTERY_STABILITY_THRESHOLD } from '../../config.js';
import { StorageManager } from '../../services/storage.js';
import { State, isCardDue } from '../../core/fsrs.js';
import { escapeHTML, scrollToTop } from '../../utils.js';
import { showToast } from '../components.js';

export function renderSubtopicWordsPageShell(tabPane) {
  if (!tabPane) return;
  if (!tabPane.querySelector('.yt-subpage-header')) {
    tabPane.innerHTML = `
      <div class="yt-subpage-header">
        <button id="btn-back-to-subtopics" class="yt-back-btn" title="Quay lại chặng học" aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="yt-subpage-title-wrap">
          <h2 class="yt-header-title" id="subtopic-words-page-title">Danh sách từ</h2>
          <span class="yt-header-subtitle" id="subtopic-words-page-subtitle">0 từ vựng</span>
        </div>
      </div>

      <div class="subtopic-words-container">
        <div class="subtopic-words-toolbar">
          <div class="subtopic-words-filter-chips">
            <button class="subtopic-words-filter-chip active" data-filter="all">Tất cả (<span id="chip-count-all">0</span>)</button>
            <button class="subtopic-words-filter-chip" data-filter="new">Chưa học (<span id="chip-count-new">0</span>)</button>
            <button class="subtopic-words-filter-chip" data-filter="learning">Đang học (<span id="chip-count-learning">0</span>)</button>
            <button class="subtopic-words-filter-chip" data-filter="due">Cần ôn (<span id="chip-count-due">0</span>)</button>
            <button class="subtopic-words-filter-chip" data-filter="done">Thuần thục (<span id="chip-count-done">0</span>)</button>
          </div>
        </div>

        <div class="subtopic-words-list" id="subtopic-words-list"></div>
        <div class="subtopic-words-pagination" id="subtopic-words-pagination"></div>
      </div>
    `;
  }
}

export async function openSubtopicWordsPage(app, deckId, subtopicName) {
  app.currentSubtopicsDeckId = deckId;
  app.currentSubtopicName = subtopicName;
  if (app.deckManager && app.deckManager.ensureTopicLoaded) {
    await app.deckManager.ensureTopicLoaded(deckId);
  }
  app.switchTab('tab-subtopic-words');
  scrollToTop();
}

export async function renderSubtopicWordsPage(app, deckId, subtopicName) {
  try {
    const tabPane = document.getElementById('tab-subtopic-words');
    if (!tabPane) return;
    renderSubtopicWordsPageShell(tabPane);

    const btnBack = document.getElementById('btn-back-to-subtopics');
    if (btnBack && !btnBack._bound) {
      btnBack._bound = true;
      btnBack.onclick = () => {
        if (app.currentSubtopicsDeckId) {
          app.openSubtopicsPage(app.currentSubtopicsDeckId);
        } else {
          app.switchTab('tab-decks');
        }
      };
    }

    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const subObj = rawSubtopics.find(s => (typeof s === 'object' ? (s.name === subtopicName || s.id === subtopicName) : s === subtopicName));
    const subCards = app.deckManager.getSubtopicCards(deckId, subtopicName);
    const subIcon = (subObj && subObj.icon) ? subObj.icon : getSubtopicIcon(subtopicName, deck.icon || '📖');
    const englishDeckTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;

    const pageTitleEl = document.getElementById('subtopic-words-page-title');
    const pageSubtitleEl = document.getElementById('subtopic-words-page-subtitle');
    if (pageTitleEl) pageTitleEl.textContent = `${subIcon} ${subtopicName}`;
    if (pageSubtitleEl) pageSubtitleEl.textContent = `${subCards.length} từ vựng • ${englishDeckTitle}`;

    const wordsListContainer = document.getElementById('subtopic-words-list');
    const paginationContainer = document.getElementById('subtopic-words-pagination');
    if (!wordsListContainer) return;

    const now = new Date();

    const getCardStatus = (card) => {
      const state = StorageManager.getCardState(card.id);
      if (!state || state.state === 0 || state.state === State.New) return 'new';
      if (isCardDue(state, now)) return 'due';
      if (state.stability >= MASTERY_STABILITY_THRESHOLD) return 'done';
      return 'learning';
    };

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

    let currentFilter = 'all';
    let currentPage = 1;
    const PAGE_SIZE = 15;

    const filterChips = document.querySelectorAll('.subtopic-words-filter-chip');
    filterChips.forEach(chip => {
      chip.onclick = () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter || 'all';
        currentPage = 1;
        renderFilteredWords();
      };
    });

    const renderFilteredWords = () => {
      let filtered = subCards;
      if (currentFilter !== 'all') {
        filtered = subCards.filter(card => getCardStatus(card) === currentFilter);
      }

      const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
      if (currentPage > totalPages) currentPage = totalPages;

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

      wordsListContainer.innerHTML = '';
      if (pageItems.length === 0) {
        wordsListContainer.innerHTML = `
          <div class="words-empty-state">
            <span>🔍</span>
            <p>Không có từ vựng nào trong mục này</p>
          </div>
        `;
      } else {
        const frag = document.createDocumentFragment();
        pageItems.forEach((card, index) => {
          const status = getCardStatus(card);
          const state = StorageManager.getCardState(card.id);
          const isSuspended = Boolean(state && state.suspended === true);
          const row = document.createElement('div');
          row.className = `word-item-card status-${status} ${isSuspended ? 'is-suspended' : ''}`;

          let statusTag = '<span class="word-status-tag status-new">Chưa học</span>';
          if (isSuspended) {
            statusTag = '<span class="word-status-tag status-suspended">⏸️ Tạm dừng</span>';
          } else if (status === 'due') {
            statusTag = '<span class="word-status-tag status-due">Cần ôn</span>';
          } else if (status === 'done') {
            statusTag = '<span class="word-status-tag status-done">Thuần thục</span>';
          } else if (status === 'learning') {
            statusTag = '<span class="word-status-tag status-learning">Đang nhớ</span>';
          }

          let exampleHtml = '';
          if (card.example) {
            let enHtml = escapeHTML(card.example);
            if (card.word) {
              try {
                const escapedWord = escapeHTML(card.word.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedWord})`, 'gi');
                enHtml = enHtml.replace(regex, '<strong class="example-highlight">$1</strong>');
              } catch (e) {}
            }
            exampleHtml = `
              <div class="word-example-box">
                <p class="word-example-en">"${enHtml}"</p>
                ${card.exampleVi ? `<p class="word-example-vi">${escapeHTML(card.exampleVi)}</p>` : ''}
              </div>
            `;
          }

          row.innerHTML = `
            <div class="word-card-top-row">
              <span class="word-order-num">#${startIndex + index + 1}</span>
              <div class="word-main-text-group">
                <span class="word-term">${escapeHTML(card.word)}</span>
                ${card.phonetic ? `<span class="word-phonetic">${escapeHTML(card.phonetic)}</span>` : ''}
                ${card.pos ? `<span class="word-pos">(${escapeHTML(card.pos)})</span>` : ''}
                ${card.cefr ? `<span class="word-cefr ${card.cefr.toLowerCase()}">${card.cefr}</span>` : ''}
              </div>
              <div class="word-status-col">${statusTag}</div>
            </div>

            <div class="word-meaning-text">${escapeHTML(card.meaning)}</div>

            ${exampleHtml}

            <div class="word-card-bottom-actions">
              <button class="btn-word-audio" data-word="${escapeHTML(card.word)}" title="Phát âm">
                🔊 Nghe từ
              </button>
              <button class="btn-word-study-single" data-id="${escapeHTML(card.id)}" title="Bắt đầu học riêng từ này">
                ⚡ Học từ này
              </button>
              <button class="btn-word-reset-card" data-id="${escapeHTML(card.id)}" title="Đặt lại tiến độ về Từ mới">
                🔄 Đặt lại
              </button>
            </div>
          `;

          row.querySelector('.btn-word-audio').onclick = (e) => {
            e.stopPropagation();
            import('../../services/audio.js').then(({ speak }) => {
              speak(card.word, { cardObj: card });
            });
          };

          row.querySelector('.btn-word-study-single').onclick = (e) => {
            e.stopPropagation();
            app.startStudySession(deckId, null, [card]);
          };

          const btnReset = row.querySelector('.btn-word-reset-card');
          if (btnReset) {
            btnReset.onclick = async (e) => {
              e.stopPropagation();
              if (confirm(`Bạn có chắc muốn đặt lại từ "${card.word}" về trạng thái Chưa học không?`)) {
                await StorageManager.resetCard(card.id);
                showToast(`Đã đặt lại "${card.word}" về từ mới`, 'info');
                renderFilteredWords();
              }
            };
          }

          frag.appendChild(row);
        });
        wordsListContainer.appendChild(frag);
      }

      // Render Pagination Controls
      if (paginationContainer) {
        if (totalPages <= 1) {
          paginationContainer.innerHTML = '';
        } else {
          paginationContainer.innerHTML = `
            <div class="pagination-bar">
              <button class="btn-page-nav" id="btn-prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                ← Trang trước
              </button>
              <span class="pagination-info">Trang ${currentPage} / ${totalPages}</span>
              <button class="btn-page-nav" id="btn-next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                Trang sau →
              </button>
            </div>
          `;

          const btnPrev = paginationContainer.querySelector('#btn-prev-page');
          const btnNext = paginationContainer.querySelector('#btn-next-page');

          if (btnPrev) {
            btnPrev.onclick = () => {
              if (currentPage > 1) {
                currentPage--;
                renderFilteredWords();
                scrollToTop();
              }
            };
          }

          if (btnNext) {
            btnNext.onclick = () => {
              if (currentPage < totalPages) {
                currentPage++;
                renderFilteredWords();
                scrollToTop();
              }
            };
          }
        }
      }
    };

    renderFilteredWords();

  } catch (err) {
    console.error('Lỗi renderSubtopicWordsPage:', err);
  }
}
