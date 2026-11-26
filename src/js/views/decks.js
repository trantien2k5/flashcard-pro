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
  if (!tabPane.querySelector('.decks-hero-banner')) {
    tabPane.innerHTML = `
      <div class="decks-hero-banner">
        <div class="decks-hero-decor" aria-hidden="true">
          <div class="hero-glow-orb"></div>
          <div class="hero-float-badge hero-badge-en">EN</div>
          <div class="hero-float-badge hero-badge-aa">Aa</div>
        </div>
        <div class="decks-hero-top">
          <div class="decks-hero-icon">📖</div>
          <div class="decks-hero-titles">
            <h2 class="decks-hero-title">Chủ đề</h2>
            <p class="decks-hero-subtitle">Khám phá kho từ vựng CEFR &amp; TOEIC đa dạng</p>
          </div>
        </div>
        <div class="decks-hero-search-wrap">
          <svg class="decks-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input type="search" id="decks-hero-search-input" class="decks-hero-search-input" placeholder="Tìm kiếm chủ đề, từ vựng..." autocomplete="off" />
          <button type="button" id="decks-hero-search-clear" class="decks-hero-search-clear" aria-label="Xóa tìm kiếm" style="display:none;">✕</button>
        </div>
      </div>

      <div class="decks-category-dock" id="decks-category-dock">
        <button type="button" class="cat-dock-item active" data-cat="all">
          <span class="cat-dock-icon cat-all">Aa</span>
          <span class="cat-dock-label">Tất cả</span>
          <span class="cat-dock-sub" id="cat-count-all">22 chủ đề</span>
        </button>
        <button type="button" class="cat-dock-item" data-cat="daily">
          <span class="cat-dock-icon cat-daily">🏠</span>
          <span class="cat-dock-label">Đời sống</span>
          <span class="cat-dock-sub" id="cat-count-daily">0 chủ đề</span>
        </button>
        <button type="button" class="cat-dock-item" data-cat="career">
          <span class="cat-dock-icon cat-career">💼</span>
          <span class="cat-dock-label">Công sở</span>
          <span class="cat-dock-sub" id="cat-count-career">0 chủ đề</span>
        </button>
        <button type="button" class="cat-dock-item" data-cat="explore">
          <span class="cat-dock-icon cat-explore">🌍</span>
          <span class="cat-dock-label">Du lịch</span>
          <span class="cat-dock-sub" id="cat-count-explore">0 chủ đề</span>
        </button>
        <button type="button" class="cat-dock-item" data-cat="toeic">
          <span class="cat-dock-icon cat-toeic">🏆</span>
          <span class="cat-dock-label">TOEIC</span>
          <span class="cat-dock-sub" id="cat-count-toeic">0 chủ đề</span>
        </button>
      </div>

      <section class="decks-featured-section" id="decks-featured-section">
        <div class="decks-section-row">
          <h3 class="decks-section-heading"><span>🔥</span> Bộ sưu tập nổi bật</h3>
        </div>
        <div class="decks-featured-grid" id="decks-featured-grid"></div>
      </section>

      <div class="decks-header-bar">
        <div class="decks-section-row">
          <h3 class="decks-section-heading"><span>📚</span> Danh sách chủ đề</h3>
          <span class="decks-count-summary" id="decks-count-summary">Hiển thị 0 chủ đề</span>
        </div>

        <div class="decks-controls-row">
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

          <div class="decks-select-wrap decks-sort-compact">
            <select id="decks-sort-select" aria-label="Sắp xếp danh sách">
              <option value="default">⚡ Mặc định</option>
              <option value="recent">🕒 Gần đây</option>
              <option value="progress">📈 Tiến độ</option>
              <option value="due">⚠️ Cần ôn</option>
              <option value="words">📝 Nhiều từ</option>
              <option value="az">🔤 A → Z</option>
            </select>
          </div>
        </div>
      </div>

      <div class="decks-list" id="all-decks-container"></div>

      <div class="decks-cta-banner" id="decks-cta-banner">
        <div class="cta-banner-left">
          <div class="cta-banner-target">🎯</div>
          <div class="cta-banner-text">
            <h4>Học hiệu quả hơn mỗi ngày</h4>
            <p>Cùng Flashcard Pro chinh phục tiếng Anh!</p>
          </div>
        </div>
        <button type="button" class="btn-cta-start" id="btn-decks-cta-start">Bắt đầu ngay →</button>
      </div>
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

    // Cập nhật số lượng trên category dock
    const setCatLabel = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `${count} chủ đề`;
    };
    setCatLabel('cat-count-all', countAll);
    setCatLabel('cat-count-daily', catCounts.daily);
    setCatLabel('cat-count-career', catCounts.career);
    setCatLabel('cat-count-explore', catCounts.explore);
    setCatLabel('cat-count-toeic', catCounts.toeic);

    // Render Bộ sưu tập nổi bật (ẩn khi đang lọc hoặc tìm kiếm)
    const featuredSection = document.getElementById('decks-featured-section');
    const featuredGrid = document.getElementById('decks-featured-grid');
    const showFeatured = activeStatus === 'all' && activeCategory === 'all' && !searchQuery && deckDataList.length >= 4;
    if (featuredSection && featuredGrid) {
      featuredSection.style.display = showFeatured ? '' : 'none';
      if (showFeatured) {
        const featuredIds = ['top-1000-core', 'travel-places', 'work-jobs', 'top-1000-toeic'];
        const featuredItems = [];
        featuredIds.forEach(id => {
          const found = deckDataList.find(d => d.deck.id === id);
          if (found) featuredItems.push(found);
        });
        for (const item of deckDataList) {
          if (featuredItems.length >= 4) break;
          if (!featuredItems.includes(item)) featuredItems.push(item);
        }
        const pastelThemes = ['pastel-blue', 'pastel-amber', 'pastel-mint', 'pastel-lavender'];
        featuredGrid.innerHTML = featuredItems.slice(0, 4).map((item, idx) => {
          const { deck, stats } = item;
          const enTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
          const viTitle = deck.name || '';
          return `
            <button type="button" class="featured-pastel-card ${pastelThemes[idx % 4]}" data-featured-id="${escapeHTML(deck.id)}">
              <span class="featured-word-pill">${stats.total.toLocaleString('vi-VN')} từ</span>
              <span class="featured-bg-emoji" aria-hidden="true">${deck.icon || '📚'}</span>
              <div class="featured-card-body">
                <h4 class="featured-card-title">${escapeHTML(enTitle)}</h4>
                <p class="featured-card-sub">${escapeHTML(viTitle)}</p>
              </div>
              <span class="featured-arrow-btn" aria-hidden="true">›</span>
            </button>
          `;
        }).join('');

        featuredGrid.querySelectorAll('.featured-pastel-card').forEach(btn => {
          btn.onclick = () => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try { navigator.vibrate(8); } catch (e) {}
            }
            openSubtopicsPage(app, btn.dataset.featuredId);
          };
        });
      }
    }

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
      countSummary.textContent = `Hiển thị ${filtered.length} chủ đề`;
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
          document.querySelectorAll('#decks-category-dock .cat-dock-item').forEach((d) => {
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
      card.className = `deck-item-card ${isPinned ? 'deck-item-pinned' : ''}`;
      card.dataset.deckId = deck.id;
      card.style.setProperty('--deck-accent', deckColor);

      card.innerHTML = `
        <div class="bento-card-top">
          <div class="deck-icon-badge" style="background: linear-gradient(135deg, ${deckColor}22, ${deckColor}0c); color: ${deckColor}; border: 1px solid ${deckColor}2c;">
            <span>${deck.icon || '📚'}</span>
          </div>
          ${allDecks.length > 1 ? `
            <button type="button" class="btn-deck-pin ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" aria-label="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" data-pin-id="${escapeHTML(deck.id)}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="deck-info">
          <h3 class="deck-title">${escapeHTML(englishTitle)}</h3>
          <p class="deck-sub-title">${escapeHTML(vietnameseTitle)}</p>
          <div class="deck-meta-line">${subtopicsCount} chặng · ${stats.total.toLocaleString('vi-VN')} từ</div>
        </div>
        <div class="bento-card-bottom">
          <div class="deck-progress-bar-bg">
            <div class="deck-progress-fill" style="width: ${stats.progressPercent}%; background: linear-gradient(90deg, ${deckColor}, ${deckColor}cc);"></div>
          </div>
          <div class="deck-card-footer">
            <span class="deck-stats-fraction">${stats.progressPercent}%</span>
            <button type="button" class="btn-deck-study ${stats.dueCount > 0 ? 'due' : ''}" data-study-id="${escapeHTML(deck.id)}">
              ${stats.dueCount > 0 ? `⚡ Ôn ${stats.dueCount}` : '✨ Học'}
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
  const dockItems = document.querySelectorAll('#decks-category-dock .cat-dock-item');
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

  const ctaBtn = document.getElementById('btn-decks-cta-start');
  if (ctaBtn && !ctaBtn._bound) {
    ctaBtn._bound = true;
    ctaBtn.onclick = () => {
      app.startStudySession(null, null, null, { mode: 'due_first' });
    };
  }
}
