/**
 * Decks View (Level 1) - Quản lý danh sách Bộ đề từ vựng lớn, lọc danh mục, tìm kiếm và sắp xếp
 */

import { DECK_ENGLISH_NAMES } from '../../config/app.js';
import { StorageManager } from '../../services/storage.js';
import { showToast } from '../../shared/feedback.js';
import { escapeHTML, safeColor } from '../../utils/sanitize.js';
import { openSubtopicsPage, renderSubtopicsPage } from './subtopics-view.js';
import { openSubtopicDetailPage, renderSubtopicDetailPage } from '../../shared/modal.js';
import { openSubtopicWordsPage, renderSubtopicWordsPage } from './subtopic-words-view.js';

// Tương thích ngược: re-export để các module khác gọi qua decks-view.js vẫn hoạt động trơn tru
export { 
  openSubtopicsPage, 
  renderSubtopicsPage, 
  openSubtopicDetailPage, 
  renderSubtopicDetailPage, 
  openSubtopicWordsPage, 
  renderSubtopicWordsPage 
};

/**
 * Lấy category chuẩn của một bộ đề từ chính metadata của topic
 * @param {Object} deck
 * @returns {string}
 */
export function getDeckCategory(deck) {
  if (!deck) return 'daily';
  const rawCat = deck.category || deck.group;
  if (rawCat) {
    const lower = String(rawCat).toLowerCase().trim();
    if (lower === 'foundation' || lower === 'daily' || lower === 'life') return 'daily';
    if (lower === 'career' || lower === 'work' || lower === 'education' || lower === 'tech') return 'career';
    if (lower === 'finance' || lower === 'banking' || lower === 'money') return 'finance';
    if (lower === 'explore' || lower === 'extension' || lower === 'travel' || lower === 'nature' || lower === 'society') return 'explore';
    if (lower === 'toeic' || lower === 'ielts' || lower === 'exam') return 'toeic';
    return lower;
  }
  return DECK_CATEGORY_MAP[deck.id] || 'daily';
}

/**
 * Fallback mapping tương thích ngược cho dữ liệu cũ
 */
export const DECK_CATEGORY_MAP = {
  'toeic-b1': 'toeic',
  'daily-life-routines': 'daily',
  'people-relationships': 'daily',
  'communication-feelings': 'daily',
  'food-drink': 'daily',
  'home-living': 'daily',
  'health-body': 'daily',
  'shopping-money': 'daily',
  'transport-directions': 'daily',
  'work-jobs': 'career',
  'education-learning': 'career',
  'technology-internet': 'career',
  'travel-places': 'explore',
  'entertainment-hobbies': 'explore',
  'nature-weather': 'explore',
  'society-world': 'explore',
  'finance-banking': 'finance'
};

/**
 * Tạo phần tử Thẻ Chủ đề lớn (Deck Item Card) hoàn toàn data-driven
 */
export function createDeckCardElement(app, deck, extraOptions = {}) {
  const deckStats = app.deckManager.getDeckStats(deck.id);
  const englishTitle = deck.titleEn || deck.nameEn || DECK_ENGLISH_NAMES[deck.id] || deck.title || deck.name;
  const rawViTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
  const vietnameseTitle = rawViTitle.replace(/\s*\([^)]*[a-zA-Z]{3,}[^)]*\)$/, '').trim();
  const learnedCount = deckStats.total - deckStats.newCount;
  const subCount = (deck.subtopics && deck.subtopics.length) ? deck.subtopics.length : (deck.subcategories && deck.subcategories.length ? deck.subcategories.length : 1);
  const deckColor = safeColor(deck.color);
  const isPinned = extraOptions.isPinned !== undefined ? extraOptions.isPinned : StorageManager.isTopicPinned(deck.id);
  
  const cardEl = document.createElement('div');
  cardEl.className = 'deck-item-card';
  if (isPinned) {
    cardEl.classList.add('deck-item-pinned');
  }
  if (extraOptions.isMostRecent) {
    cardEl.classList.add('deck-item-recent');
  }

  let statusBadgeHtml = '';
  if (isPinned) {
    statusBadgeHtml = `<span class="subtopic-badge badge-pinned">📌 Đã ghim</span>`;
  } else if (deckStats.dueCount > 0) {
    statusBadgeHtml = `<span class="subtopic-badge badge-due">⚠️ ${deckStats.dueCount} cần ôn</span>`;
  } else if (extraOptions.isMostRecent || (deckStats.lastStudiedTime > 0 && (Date.now() - deckStats.lastStudiedTime < 3 * 86400000))) {
    statusBadgeHtml = `<span class="subtopic-badge badge-recent">🔥 Vừa học</span>`;
  } else if (learnedCount === deckStats.total && deckStats.total > 0) {
    statusBadgeHtml = `<span class="subtopic-badge badge-done">✓ Đã thuộc</span>`;
  } else if (extraOptions.isRecommendedNext) {
    statusBadgeHtml = `<span class="subtopic-badge badge-recommended">✨ Khuyên học</span>`;
  }

  cardEl.innerHTML = `
    <div class="deck-card-top">
      <div class="deck-card-main">
        <div class="deck-icon-badge" style="background: ${deckColor}18; color: ${deckColor};">
          ${escapeHTML(deck.icon || '📚')}
        </div>
        <div class="deck-info">
          <h4 class="deck-title">${escapeHTML(englishTitle)}</h4>
          ${vietnameseTitle ? `<div class="deck-sub-title">${escapeHTML(vietnameseTitle)}</div>` : ''}
          <div class="deck-meta-strip">
            <span>${subCount} chủ đề con</span>
            <span class="tax-bullet">•</span>
            <span>${deckStats.total} từ</span>
            ${statusBadgeHtml ? `<span class="tax-bullet">•</span>${statusBadgeHtml}` : ''}
          </div>
        </div>
      </div>
      <div class="deck-card-right">
        <button class="btn-deck-pin ${isPinned ? 'pinned' : ''}" type="button" title="${isPinned ? 'Bỏ ghim chủ đề' : 'Ghim chủ đề lên đầu'}" aria-label="Ghim chủ đề">
          📌
        </button>
        <span class="deck-stats-fraction">${learnedCount}/${deckStats.total}</span>
        <span class="deck-chevron">›</span>
      </div>
    </div>
    <div class="deck-progress-bar-bg">
      <div class="deck-progress-fill" style="width: ${deckStats.progressPercent}%;"></div>
    </div>
  `;

  // Xử lý nút ghim chủ đề độc lập
  const btnPin = cardEl.querySelector('.btn-deck-pin');
  if (btnPin) {
    btnPin.addEventListener('click', (e) => {
      e.stopPropagation();
      const newlyPinned = StorageManager.togglePinTopic(deck.id);
      showToast(newlyPinned ? `📌 Đã ghim "${englishTitle}" lên đầu danh sách` : `Đã bỏ ghim "${englishTitle}"`, 'success');
      if (typeof extraOptions.onPinToggle === 'function') {
        extraOptions.onPinToggle(deck.id, newlyPinned);
      } else {
        renderDecksTab(app);
      }
    });
  }

  cardEl.addEventListener('click', () => {
    if (app && typeof app.openSubtopicsPage === 'function') {
      app.openSubtopicsPage(deck.id);
    } else {
      openSubtopicsPage(app, deck.id);
    }
  });
  return cardEl;
}

let _decksCurrentStatus = 'all';
let _decksCurrentCategory = 'all';
let _decksSearchQuery = '';
let _decksCurrentSort = 'default';
let _decksListenersAttached = false;

/**
 * Render Tab Danh sách chủ đề chính (Level 1)
 */
export function renderDecksTab(app) {
  try {
    const allDecks = app.deckManager.getAllDecks();

    // 1. Tự động tính toán các chỉ số cho 4 Chip Trạng thái (Status Chips)
    let countLearning = 0;
    let countDue = 0;
    let countCompleted = 0;
    let totalAllWords = 0;

    allDecks.forEach(deck => {
      const deckStats = app.deckManager.getDeckStats(deck.id);
      const learned = deckStats.total - deckStats.newCount;
      const total = deckStats.total;
      
      totalAllWords += total;

      if (learned > 0 && learned < total) {
        countLearning++;
      }
      if (deckStats.dueCount > 0) {
        countDue++;
      }
      if (learned === total && total > 0) {
        countCompleted++;
      }
    });

    const chipAll = document.getElementById('deck-chip-all');
    const chipLearning = document.getElementById('deck-chip-learning');
    const chipDue = document.getElementById('deck-chip-due');
    const chipCompleted = document.getElementById('deck-chip-completed');

    if (chipAll) chipAll.textContent = allDecks.length;
    if (chipLearning) chipLearning.textContent = countLearning;
    if (chipDue) chipDue.textContent = countDue;
    if (chipCompleted) chipCompleted.textContent = countCompleted;

    // 2. Hàm lọc và sắp xếp danh sách chủ đề theo nguyên tắc 4 tầng:
    // Search (tìm cái gì) -> Danh mục (lĩnh vực nào) -> Trạng thái (học tới đâu) -> Sort (thứ tự hiển thị)
    const getProcessedDecks = () => {
      let list = allDecks.slice();
      const pinnedIds = new Set(StorageManager.getPinnedTopicIds());

      // Tầng 1: Lọc theo Trạng thái học (Status)
      if (_decksCurrentStatus === 'learning') {
        list = list.filter(d => {
          const s = app.deckManager.getDeckStats(d.id);
          const learned = s.total - s.newCount;
          return learned > 0 && learned < s.total;
        });
      } else if (_decksCurrentStatus === 'due') {
        list = list.filter(d => {
          const s = app.deckManager.getDeckStats(d.id);
          return s.dueCount > 0;
        });
      } else if (_decksCurrentStatus === 'completed') {
        list = list.filter(d => {
          const s = app.deckManager.getDeckStats(d.id);
          const learned = s.total - s.newCount;
          return learned === s.total && s.total > 0;
        });
      }

      // Tầng 2: Lọc theo Danh mục riêng biệt (Category)
      if (_decksCurrentCategory !== 'all') {
        list = list.filter(d => getDeckCategory(d) === _decksCurrentCategory);
      }

      // Tầng 3: Lọc theo Từ khóa tìm kiếm (Search Query)
      if (_decksSearchQuery) {
        const q = _decksSearchQuery.toLowerCase();
        list = list.filter(d => {
          const en = (d.titleEn || d.nameEn || DECK_ENGLISH_NAMES[d.id] || d.title || d.name || '').toLowerCase();
          const vi = (d.name || d.title || d.description || '').toLowerCase();
          const subs = (d.subtopics || d.subcategories || []).map(s => typeof s === 'object' ? (s.name || '') : String(s)).join(' ').toLowerCase();
          return en.includes(q) || vi.includes(q) || subs.includes(q);
        });
      }

      // Tầng 4: Sắp xếp (Sort) - ƯU TIÊN CHỦ ĐỀ ĐƯỢC GHIM LÊN ĐẦU
      list.sort((a, b) => {
        const aPinned = pinnedIds.has(a.id);
        const bPinned = pinnedIds.has(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        if (_decksCurrentSort === 'due') {
          return app.deckManager.getDeckStats(b.id).dueCount - app.deckManager.getDeckStats(a.id).dueCount;
        } else if (_decksCurrentSort === 'progress') {
          return app.deckManager.getDeckStats(b.id).progressPercent - app.deckManager.getDeckStats(a.id).progressPercent;
        } else if (_decksCurrentSort === 'words') {
          return app.deckManager.getDeckStats(b.id).total - app.deckManager.getDeckStats(a.id).total;
        } else if (_decksCurrentSort === 'az') {
          const nameA = a.titleEn || a.nameEn || DECK_ENGLISH_NAMES[a.id] || a.title || a.name || '';
          const nameB = b.titleEn || b.nameEn || DECK_ENGLISH_NAMES[b.id] || b.title || b.name || '';
          return nameA.localeCompare(nameB);
        } else {
          // Mặc định: Vừa học gần nhất lên đầu -> sau đó theo thứ tự định nghĩa trong metadata
          const statsA = app.deckManager.getDeckStats(a.id);
          const statsB = app.deckManager.getDeckStats(b.id);
          const lastA = statsA.lastStudiedTime || 0;
          const lastB = statsB.lastStudiedTime || 0;

          if (lastA > 0 && lastB > 0) {
            return lastB - lastA;
          }
          if (lastA > 0) return -1;
          if (lastB > 0) return 1;

          const orderA = typeof a.order === 'number' ? a.order : 999;
          const orderB = typeof b.order === 'number' ? b.order : 999;
          return orderA - orderB;
        }
      });

      return list;
    };

    // 3. Render danh sách thẻ chủ đề vào container
    const container = document.getElementById('all-decks-container');
    const countSummary = document.getElementById('decks-count-summary');
    if (!container) return;

    const renderList = () => {
      const processed = getProcessedDecks();
      const pinnedIds = new Set(StorageManager.getPinnedTopicIds());
      container.innerHTML = '';

      if (countSummary) {
        countSummary.textContent = `Hiển thị ${processed.length} chủ đề • ${totalAllWords.toLocaleString()} từ vựng`;
      }

      if (processed.length === 0) {
        container.innerHTML = `
          <div class="empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
            <h4 style="font-weight: 700; margin-bottom: 6px;">Không tìm thấy chủ đề phù hợp</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Hãy thử từ khóa khác hoặc thiết lập lại bộ lọc.</p>
          </div>
        `;
        return;
      }

      // Xác định chủ đề vừa học gần nhất
      let mostRecentDeckId = null;
      let maxStudiedTime = 0;
      allDecks.forEach(d => {
        const s = app.deckManager.getDeckStats(d.id);
        if (s.lastStudiedTime > maxStudiedTime) {
          maxStudiedTime = s.lastStudiedTime;
          mostRecentDeckId = d.id;
        }
      });

      const fragment = document.createDocumentFragment();
      processed.forEach(deck => {
        const isMostRecent = (deck.id === mostRecentDeckId) && (maxStudiedTime > 0);
        const isPinned = pinnedIds.has(deck.id);
        const cardEl = createDeckCardElement(app, deck, { 
          isMostRecent, 
          isPinned,
          onPinToggle: () => renderList()
        });
        fragment.appendChild(cardEl);
      });
      container.appendChild(fragment);
    };

    renderList();

    // 4. Gắn các Event Listener (1 lần duy nhất)
    if (!_decksListenersAttached) {
      _decksListenersAttached = true;

      // Status Filter Chips
      const filterChips = document.querySelectorAll('.decks-filter-chips .filter-chip');
      filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          _decksCurrentStatus = chip.getAttribute('data-deck-status') || chip.getAttribute('data-deck-filter') || 'all';
          renderList();
        });
      });

      // Category Dropdown
      const categorySelect = document.getElementById('decks-category-select');
      if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
          _decksCurrentCategory = e.target.value;
          renderList();
        });
      }

      // Sort Select
      const sortSelect = document.getElementById('decks-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          _decksCurrentSort = e.target.value;
          renderList();
        });
      }

      // Search Input
      const searchInput = document.getElementById('decks-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          _decksSearchQuery = e.target.value.trim();
          renderList();
        });
      }
    }
  } catch (err) {
    console.error('Lỗi trong renderDecksTab:', err);
  }
}
