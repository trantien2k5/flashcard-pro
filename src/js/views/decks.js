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

export function renderDecksTabShell(tabPane) {
  if (!tabPane) return;
  if (!tabPane.querySelector('.decks-header-bar')) {
    tabPane.innerHTML = `
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
            <span>Hoàn thành</span>
            <span class="chip-count" id="deck-chip-completed">0</span>
          </button>
        </div>

        <div class="decks-sub-toolbar">
          <div class="decks-toolbar-header">
            <span class="decks-count-summary" id="decks-count-summary">Hiển thị 0 chủ đề</span>
          </div>
          <div class="decks-filter-dropdowns">
            <div class="decks-select-wrap">
              <select id="decks-category-select" aria-label="Lọc theo danh mục">
                <option value="all">📁 Tất cả danh mục</option>
                <option value="daily">🏠 Đời sống</option>
                <option value="career">💼 Công sở & Sự nghiệp</option>
                <option value="explore">🌍 Du lịch & Khám phá</option>
                <option value="toeic">🎯 Luyện thi (TOEIC)</option>
              </select>
            </div>
            <div class="decks-select-wrap">
              <select id="decks-sort-select" aria-label="Sắp xếp danh sách">
                <option value="default">⚡ Sắp xếp: Mặc định</option>
                <option value="recent">🕒 Vừa học gần đây</option>
                <option value="progress">📈 Tiến độ cao</option>
                <option value="due">⚠️ Cần ôn nhiều</option>
                <option value="words">📝 Số từ nhiều</option>
                <option value="az">🔤 Tên A → Z</option>
              </select>
            </div>
          </div>
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

    // Đếm số lượng theo status chip
    let countAll = 0, countLearning = 0, countDue = 0, countCompleted = 0;

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

    // Lọc theo Status
    let filtered = deckDataList.filter(item => {
      if (activeStatus === 'learning' && !item.isLearning) return false;
      if (activeStatus === 'due' && !item.isDue) return false;
      if (activeStatus === 'completed' && !item.isCompleted) return false;
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
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
      countSummary.textContent = `Hiển thị ${filtered.length} chủ đề`;
    }

    container.innerHTML = '';
    const frag = document.createDocumentFragment();

    filtered.forEach(item => {
      const { deck, stats, isPinned } = item;
      const englishTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
      const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
      const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
      const subtopicsCount = rawSubtopics.length || 1;
      const deckColor = safeColor(deck.color);

      const card = document.createElement('div');
      card.className = `deck-item-card ${isPinned ? 'deck-item-pinned' : ''}`;
      card.dataset.deckId = deck.id;
      card.style.setProperty('--deck-theme-color', deckColor);

      card.innerHTML = `
        <div class="deck-card-header">
          <div class="deck-icon-badge" style="background: linear-gradient(135deg, ${deckColor}25, ${deckColor}12); color: ${deckColor}; border: 1px solid ${deckColor}35; box-shadow: 0 4px 14px ${deckColor}22;">
            <span>${deck.icon || '📚'}</span>
          </div>
          <div class="deck-info">
            <h3 class="deck-title">${escapeHTML(englishTitle)}</h3>
            <p class="deck-sub-title">${escapeHTML(vietnameseTitle)}</p>
            <div class="deck-meta-strip">
              <span>${subtopicsCount} chặng</span>
              <span class="meta-dot">•</span>
              <span>${stats.total} từ vựng</span>
            </div>
          </div>
          ${allDecks.length > 1 ? `
            <button class="btn-deck-pin ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" data-pin-id="${escapeHTML(deck.id)}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="deck-card-footer">
          <div class="deck-progress-container">
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${stats.progressPercent}%; background: linear-gradient(90deg, ${deckColor}, ${deckColor}dd);"></div>
            </div>
            <span class="deck-stats-fraction">${stats.progressPercent}%</span>
          </div>
          <div class="deck-actions-group">
            <button class="btn-deck-study ${stats.dueCount > 0 ? 'due' : ''}" data-study-id="${escapeHTML(deck.id)}">
              ${stats.dueCount > 0 ? `⚡ Ôn ${stats.dueCount}` : '✨ Học ngay'}
              <span class="btn-study-arrow">›</span>
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

  const catSelect = document.getElementById('decks-category-select');
  if (catSelect && !catSelect._bound) {
    catSelect._bound = true;
    catSelect.onchange = (e) => {
      app._activeDeckCategory = e.target.value;
      renderDecksTab(app);
    };
  }

  const sortSelect = document.getElementById('decks-sort-select');
  if (sortSelect && !sortSelect._bound) {
    sortSelect._bound = true;
    sortSelect.onchange = (e) => {
      app._activeDeckSort = e.target.value;
      renderDecksTab(app);
    };
  }
}
