/**
 * Decks & Topics View Controller (Level 1: Main Decks Tab & Facade)
 * Quản lý danh sách 22 chủ đề gốc, bộ lọc danh mục & thanh công cụ sắp xếp.
 * Tái xuất khẩu các sub-controllers Level 2 (Subtopics) và Level 4 (Subtopic Words).
 */

import { DECK_ENGLISH_NAMES } from '../config.js';
import { escapeHTML, safeColor } from '../utils.js';
import {
  renderSubtopicsPageShell,
  openSubtopicsPage,
  renderSubtopicsPage,
  openSubtopicDetailPage,
  renderSubtopicDetailPage
} from './decks/subtopics.js';

import {
  renderSubtopicWordsPageShell,
  openSubtopicWordsPage,
  renderSubtopicWordsPage
} from './decks/words.js';

export {
  renderSubtopicsPageShell,
  openSubtopicsPage,
  renderSubtopicsPage,
  openSubtopicDetailPage,
  renderSubtopicDetailPage,
  renderSubtopicWordsPageShell,
  openSubtopicWordsPage,
  renderSubtopicWordsPage
};

let _pinnedDecks = new Set();
try {
  const rawPinned = localStorage.getItem('fc_pro_pinned_decks');
  if (rawPinned) _pinnedDecks = new Set(JSON.parse(rawPinned));
} catch (e) {}

function savePinnedDecks() {
  try {
    localStorage.setItem('fc_pro_pinned_decks', JSON.stringify([..._pinnedDecks]));
  } catch (e) {}
}

export const DECK_CATEGORY_MAP = {
  'top-1000-core': 'daily',
  'top-1000-toeic': 'toeic',
  'toeic-b1': 'toeic',
  'daily-life-routines': 'daily',
  'people-relationships': 'daily',
  'pets-animals': 'daily',
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

/* ==========================================================================
   LEVEL 1: MAIN DECKS TAB
   ========================================================================== */

function getDeckCategorySvg(category) {
  switch (category) {
    case 'career':
      return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`;
    case 'explore':
      return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    case 'toeic':
      return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
    case 'finance':
      return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
    default:
      return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;
  }
}

export function renderDecksTabShell(tabPane) {
  if (!tabPane) return;
  if (!tabPane.querySelector('.decks-minimal-header')) {
    tabPane.innerHTML = `
      <div class="decks-minimal-header">
        <div class="decks-title-row">
          <div class="decks-title-group">
            <h2 class="decks-page-title">Chủ đề</h2>
            <span class="decks-count-pill" id="decks-count-summary">22 chủ đề</span>
          </div>
          <div class="decks-sort-box">
            <select id="decks-sort-select" class="decks-sort-select" aria-label="Sắp xếp danh sách">
              <option value="default">Mặc định</option>
              <option value="recent">Gần đây</option>
              <option value="progress">Tiến độ</option>
              <option value="due">Cần ôn</option>
              <option value="words">Nhiều từ</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>

        <div class="decks-search-box">
          <svg class="decks-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input type="search" id="decks-hero-search-input" class="decks-search-input" placeholder="Tìm kiếm chủ đề..." autocomplete="off" />
          <button type="button" id="decks-hero-search-clear" class="decks-search-clear" aria-label="Xóa tìm kiếm" style="display:none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="decks-category-strip" id="decks-category-dock" role="tablist" aria-label="Danh mục chủ đề">
          <button type="button" class="cat-pill active" data-cat="all">Tất cả</button>
          <button type="button" class="cat-pill" data-cat="daily">Đời sống</button>
          <button type="button" class="cat-pill" data-cat="career">Công sở</button>
          <button type="button" class="cat-pill" data-cat="explore">Du lịch</button>
          <button type="button" class="cat-pill" data-cat="toeic">TOEIC</button>
        </div>
      </div>

      <div class="decks-header-bar">
        <div class="decks-filter-chips" id="decks-filter-chips">
          <button class="filter-chip active" data-deck-status="all">
            <span>Tất cả</span>
            <span class="chip-count" id="deck-chip-all">0</span>
          </button>
          <button class="filter-chip" data-deck-status="learning">
            <span>Đang học</span>
            <span class="chip-count" id="deck-chip-learning">0</span>
          </button>
          <button class="filter-chip" data-deck-status="due">
            <span>Cần ôn</span>
            <span class="chip-count" id="deck-chip-due">0</span>
          </button>
          <button class="filter-chip" data-deck-status="completed">
            <span>Xong</span>
            <span class="chip-count" id="deck-chip-completed">0</span>
          </button>
        </div>
      </div>

      <div class="decks-list" id="all-decks-container"></div>
    `;
  }
}

export function renderDecksTab(app) {
  try {
    const tabPane = document.getElementById('tab-decks');
    if (!tabPane) return;
    renderDecksTabShell(tabPane);

    const container = document.getElementById('all-decks-container') || document.getElementById('decks-list');
    if (!container) return;

    const allDecks = app.deckManager.getAllDecks();
    const activeStatus = app._activeDeckStatus || 'all';
    const activeCategory = app._activeDeckCategory || 'all';
    const activeSort = app._activeDeckSort || 'default';
    const searchQuery = (app._activeDeckSearch || '').trim().toLowerCase();

    // Đếm số lượng theo status chip & category dock
    let countAll = 0, countLearning = 0, countDue = 0, countCompleted = 0;
    const catCounts = { daily: 0, career: 0, explore: 0, toeic: 0 };

    const deckDataList = allDecks.map(deck => {
      const stats = app.deckManager.getDeckStats(deck.id);
      const isPinned = _pinnedDecks.has(deck.id);
      const cat = getDeckCategory(deck);
      const isLearning = stats.learningCount > 0 || (stats.total > stats.newCount && stats.progressPercent < 100);
      const isDue = stats.dueCount > 0;
      const isCompleted = stats.total > 0 && stats.progressPercent >= 100;

      countAll++;
      if (isLearning) countLearning++;
      if (isDue) countDue++;
      if (isCompleted) countCompleted++;
      if (catCounts[cat] !== undefined) catCounts[cat]++;

      return {
        deck,
        stats,
        isPinned,
        category: cat,
        isLearning,
        isDue,
        isCompleted
      };
    });

    // Cập nhật số lượng trên các chip
    const chipAll = document.getElementById('deck-chip-all');
    const chipLearning = document.getElementById('deck-chip-learning');
    const chipDue = document.getElementById('deck-chip-due');
    const chipCompleted = document.getElementById('deck-chip-completed');

    if (chipAll) chipAll.textContent = countAll;
    if (chipLearning) chipLearning.textContent = countLearning;
    if (chipDue) chipDue.textContent = countDue;
    if (chipCompleted) chipCompleted.textContent = countCompleted;

    // Lọc theo Status, Category & Search
    let filtered = deckDataList.filter(item => {
      if (activeStatus === 'learning' && !item.isLearning) return false;
      if (activeStatus === 'due' && !item.isDue) return false;
      if (activeStatus === 'completed' && !item.isCompleted) return false;
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery) {
        const en = (DECK_ENGLISH_NAMES[item.deck.id] || item.deck.title || '').toLowerCase();
        const vi = (item.deck.name || '').toLowerCase();
        if (!en.includes(searchQuery) && !vi.includes(searchQuery)) return false;
      }
      return true;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      // 1. Ưu tiên ghim lên đầu
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

      // 2. Sắp xếp theo lựa chọn
      if (activeSort === 'progress') return b.stats.progressPercent - a.stats.progressPercent;
      if (activeSort === 'due') return b.stats.dueCount - a.stats.dueCount;
      if (activeSort === 'words') return b.stats.total - a.stats.total;
      if (activeSort === 'az') {
        const nameA = (DECK_ENGLISH_NAMES[a.deck.id] || a.deck.title || a.deck.name || '').toLowerCase();
        const nameB = (DECK_ENGLISH_NAMES[b.deck.id] || b.deck.title || b.deck.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (activeSort === 'recent') {
        const timeA = a.stats.lastStudiedTime || 0;
        const timeB = b.stats.lastStudiedTime || 0;
        if (timeA !== timeB) return timeB - timeA;
        return (a.deck.order ?? 999) - (b.deck.order ?? 999);
      }

      // 3. Mặc định ('default'): Tuân thủ chuẩn xác lộ trình sư phạm
      return (a.deck.order ?? 999) - (b.deck.order ?? 999);
    });

    // Ẩn thanh công cụ lọc/sắp xếp thừa thãi khi chỉ có <= 1 chủ đề
    const headerBar = tabPane.querySelector('.decks-header-bar');
    if (headerBar) {
      headerBar.style.display = allDecks.length > 1 ? '' : 'none';
    }

    // Cập nhật summary label nếu có
    const countSummary = document.getElementById('decks-count-summary');
    if (countSummary) {
      countSummary.textContent = `${filtered.length} chủ đề`;
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="decks-empty-state">
          <div class="decks-empty-icon">🧭</div>
          <h3 class="decks-empty-title">Không có chủ đề nào phù hợp</h3>
          <p class="decks-empty-desc">Thử đổi bộ lọc trạng thái hoặc chọn lại danh mục khác nhé.</p>
          <button type="button" class="btn-decks-reset-filter" id="btn-decks-reset-filter">Hiện tất cả chủ đề</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-decks-reset-filter');
      if (resetBtn) {
        resetBtn.onclick = () => {
          app._activeDeckStatus = 'all';
          app._activeDeckCategory = 'all';
          app._activeDeckSearch = '';
          const searchEl = document.getElementById('decks-hero-search-input');
          const clearEl = document.getElementById('decks-hero-search-clear');
          if (searchEl) searchEl.value = '';
          if (clearEl) clearEl.style.display = 'none';
          document.querySelectorAll('#decks-category-dock .cat-pill').forEach((d) => {
            d.classList.toggle('active', d.dataset.cat === 'all');
          });
          document.querySelectorAll('#decks-filter-chips .filter-chip').forEach((c) => {
            c.classList.toggle('active', c.dataset.deckStatus === 'all');
          });
          renderDecksTab(app);
        };
      }
      setupDecksToolbarEvents(app);
      return;
    }

    const frag = document.createDocumentFragment();

    filtered.forEach(item => {
      const { deck, stats, isPinned } = item;
      const englishTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
      const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
      const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
      const subtopicsCount = rawSubtopics.length || 1;
      const deckColor = safeColor(deck.color);

      const card = document.createElement('div');
      card.className = `deck-item-card ${isPinned ? 'deck-item-pinned' : ''} ${item.isDue ? 'is-due' : ''}`;
      card.dataset.deckId = deck.id;

      const statusLabel = stats.dueCount > 0
        ? 'Cần ôn'
        : (item.isCompleted ? 'Hoàn thành' : (item.isLearning ? 'Đang học' : 'Mới'));
      const statusClass = stats.dueCount > 0
        ? 'status-due'
        : (item.isCompleted ? 'status-done' : (item.isLearning ? 'status-learning' : 'status-new'));
      const actionLabel = stats.dueCount > 0
        ? `Ôn ${stats.dueCount}`
        : (item.isLearning ? 'Học tiếp' : 'Bắt đầu');

      card.innerHTML = `
        <div class="bento-card-top">
          <div class="deck-icon-badge" aria-hidden="true">
            ${getDeckCategorySvg(item.category)}
          </div>
          <div class="deck-top-actions">
            <span class="deck-status-tag ${statusClass}">${statusLabel}</span>
            ${allDecks.length > 1 ? `
              <button type="button" class="btn-deck-pin ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" aria-label="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" data-pin-id="${escapeHTML(deck.id)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22"></line>
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
        <div class="deck-info">
          <h3 class="deck-title">${escapeHTML(englishTitle)}</h3>
          <p class="deck-sub-title">${escapeHTML(vietnameseTitle)}</p>
          <div class="deck-meta-line">${subtopicsCount} chặng · ${stats.total.toLocaleString('vi-VN')} từ</div>
        </div>
        <div class="bento-card-bottom">
          <div class="deck-progress-bar-bg">
            <div class="deck-progress-fill" style="width: ${stats.progressPercent}%;"></div>
          </div>
          <div class="deck-card-footer">
            <span class="deck-stats-fraction">${stats.progressPercent}%</span>
            <button type="button" class="btn-deck-study ${stats.dueCount > 0 ? 'due' : ''}" data-study-id="${escapeHTML(deck.id)}">
              <span>${actionLabel}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      `;

      const pinBtn = card.querySelector('.btn-deck-pin');
      if (pinBtn) {
        pinBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(6); } catch (err) {}
          }
          if (_pinnedDecks.has(deck.id)) {
            _pinnedDecks.delete(deck.id);
          } else {
            _pinnedDecks.add(deck.id);
          }
          savePinnedDecks();
          renderDecksTab(app);
        };
      }

      const studyBtn = card.querySelector('.btn-deck-study');
      if (studyBtn) {
        studyBtn.onclick = (e) => {
          e.stopPropagation();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(10); } catch (err) {}
          }
          app.startStudySession(deck.id, null, null, { mode: stats.dueCount > 0 ? 'due_only' : 'new_only' });
        };
      }

      card.onclick = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(8); } catch (err) {}
        }
        openSubtopicsPage(app, deck.id);
      };

      frag.appendChild(card);
    });

    container.appendChild(frag);

    setupDecksToolbarEvents(app);

  } catch (err) {
    console.error('Lỗi renderDecksTab:', err);
  }
}

function setupDecksToolbarEvents(app) {
  const dockItems = document.querySelectorAll('#decks-category-dock .cat-pill');
  dockItems.forEach(item => {
    if (!item._bound) {
      item._bound = true;
      item.onclick = () => {
        dockItems.forEach(d => d.classList.remove('active'));
        item.classList.add('active');
        app._activeDeckCategory = item.dataset.cat || 'all';
        renderDecksTab(app);
      };
    }
  });

  const searchInput = document.getElementById('decks-hero-search-input');
  const searchClear = document.getElementById('decks-hero-search-clear');
  if (searchInput && !searchInput._bound) {
    searchInput._bound = true;
    searchInput.oninput = (e) => {
      app._activeDeckSearch = e.target.value || '';
      if (searchClear) searchClear.style.display = app._activeDeckSearch ? 'flex' : 'none';
      renderDecksTab(app);
    };
  }
  if (searchClear && !searchClear._bound) {
    searchClear._bound = true;
    searchClear.onclick = () => {
      app._activeDeckSearch = '';
      if (searchInput) searchInput.value = '';
      searchClear.style.display = 'none';
      renderDecksTab(app);
    };
  }

  const chips = document.querySelectorAll('#decks-filter-chips .filter-chip');
  chips.forEach(chip => {
    if (!chip._bound) {
      chip._bound = true;
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        app._activeDeckStatus = chip.dataset.deckStatus || chip.dataset.deckFilter || 'all';
        renderDecksTab(app);
      };
    }
  });

  const sortSelect = document.getElementById('decks-sort-select');
  if (sortSelect && !sortSelect._bound) {
    sortSelect._bound = true;
    sortSelect.onchange = (e) => {
      app._activeDeckSort = e.target.value;
      renderDecksTab(app);
    };
  }
}
