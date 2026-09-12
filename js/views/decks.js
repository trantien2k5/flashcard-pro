/**
 * Decks & Topics View Controller (Levels 1, 2, 3, 4)
 * Fully aligned with index.html DOM IDs, CSS classes & Scroll Restoration
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon, getSubtopicColor } from '../config.js';
import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { TopicRepository } from '../../data/index.js';
import { escapeHTML, safeColor, scrollToTop } from '../utils.js';
import { showToast } from './components.js';

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
  'society-world': 'explore'
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
        return (a.deck.order || 99) - (b.deck.order || 99);
      }

      // 3. Mặc định ('default'): Chủ đề vừa học gần đây nhất sẽ tự động được đưa lên đầu!
      const timeA = a.stats.lastStudiedTime || 0;
      const timeB = b.stats.lastStudiedTime || 0;
      if (timeA > 0 || timeB > 0) {
        if (timeA > 0 && timeB > 0) return timeB - timeA;
        return timeB > 0 ? 1 : -1;
      }

      return (a.deck.order || 99) - (b.deck.order || 99);
    });

    // Cập nhật summary label
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

      card.innerHTML = `
        <div class="deck-card-header">
          <div class="deck-icon-badge" style="background: ${deckColor}22; color: ${deckColor}; border: 1px solid ${deckColor}44;">
            <span>${deck.icon || '📚'}</span>
          </div>
          <div class="deck-info">
            <h3 class="deck-title">${escapeHTML(englishTitle)}</h3>
            <p class="deck-sub-title">${escapeHTML(vietnameseTitle)}</p>
          </div>
          <button class="btn-deck-pin ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}" data-pin-id="${escapeHTML(deck.id)}">📌</button>
        </div>
        <div class="deck-card-footer">
          <div class="deck-meta-strip">
            <span>📁 ${subtopicsCount} chặng</span>
            <span>•</span>
            <span>📝 ${stats.total} từ</span>
          </div>
          <div class="deck-actions-group">
            <span class="deck-stats-fraction">${stats.progressPercent}%</span>
            <button class="btn-deck-study ${stats.dueCount > 0 ? 'due' : ''}" data-study-id="${escapeHTML(deck.id)}">
              ${stats.dueCount > 0 ? `⚡ Ôn ${stats.dueCount}` : '✨ Học'}
            </button>
            <span class="deck-chevron">›</span>
          </div>
        </div>
        <div class="deck-progress-bar-bg">
          <div class="deck-progress-fill" style="width: ${stats.progressPercent}%; background: ${deckColor};"></div>
        </div>
      `;

      const pinBtn = card.querySelector('.btn-deck-pin');
      if (pinBtn) {
        pinBtn.onclick = (e) => {
          e.stopPropagation();
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
          app.startStudySession(deck.id, null);
        };
      }

      card.onclick = () => {
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

/* ==========================================================================
   LEVEL 2: SUBTOPICS LIST (SUBPAGE)
   ========================================================================== */

export function renderSubtopicsPageShell(tabPane) {
  if (!tabPane) return;
  if (!tabPane.querySelector('.yt-subpage-header')) {
    tabPane.innerHTML = `
      <div class="yt-subpage-header">
        <button id="btn-back-to-decks" class="yt-back-btn" title="Quay lại danh mục (Esc)" aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="yt-subpage-title-wrap">
          <h2 class="yt-header-title" id="subpage-top-title">Chủ đề</h2>
          <span class="yt-header-subtitle" id="subpage-top-subtitle">0 chặng • 0 từ vựng</span>
        </div>
      </div>

      <div class="subpage-content-body">
        <div id="subpage-hero-container"></div>
        <div class="subtopics-section-header">
          <h3 class="subtopics-section-title">Danh sách chặng học</h3>
          <span class="subtopics-section-meta" id="subtopics-list-count">0 chủ đề</span>
        </div>
        <div class="subtopics-list-container" id="subpage-subtopics-list"></div>
      </div>
    `;
  }
}

export function openSubtopicsPage(app, deckId) {
  app.currentSubtopicsDeckId = deckId;
  app.switchTab('tab-subtopics');
  scrollToTop();
}

export function renderSubtopicsPage(app, deckId) {
  try {
    const tabPane = document.getElementById('tab-subtopics');
    if (!tabPane) return;
    renderSubtopicsPageShell(tabPane);

    const btnBack = document.getElementById('btn-back-to-decks');
    if (btnBack && !btnBack._bound) {
      btnBack._bound = true;
      btnBack.onclick = () => app.switchTab(app.previousTab || 'tab-decks');
    }

    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const cards = app.deckManager.getCardsByDeckId(deckId);
    const englishTitle = deck.titleEn || deck.nameEn || DECK_ENGLISH_NAMES[deck.id] || deck.title || deck.name;
    const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const deckStats = app.deckManager.getDeckStats(deck.id);
    const learnedCount = deckStats.total - deckStats.newCount;
    const deckColor = safeColor(deck.color);

    const topTitleEl = document.getElementById('subpage-top-title');
    const topSubtitleEl = document.getElementById('subpage-top-subtitle');
    if (topTitleEl) topTitleEl.textContent = englishTitle;
    if (topSubtitleEl) topSubtitleEl.textContent = `${rawSubtopics.length} chặng • ${deckStats.total} từ vựng`;

    const headingCount = document.getElementById('subtopics-list-count');
    if (headingCount) headingCount.textContent = `${rawSubtopics.length} chủ đề`;

    const cardStates = StorageManager.getAllCardStates();
    const userProgress = StorageManager.getUserProgress();
    const nowMs = Date.now();
    const isProgressive = deck.isProgressive === true;

    // 1. Render Hero Banner
    const heroContainer = document.getElementById('subpage-hero-container');
    if (heroContainer) {
      heroContainer.innerHTML = `
        <div class="subpage-hero-card">
          <div class="subpage-hero-header">
            <div class="subpage-deck-icon" style="background: ${deckColor}22; color: ${deckColor}; border: 1px solid ${deckColor}44;">
              <span>${deck.icon || '📚'}</span>
            </div>
            <div class="subpage-deck-info">
              <h2 class="subpage-deck-title">${escapeHTML(englishTitle)}</h2>
              <p class="subpage-vi-title">${escapeHTML(vietnameseTitle)}</p>
              <div class="subpage-deck-meta">
                <span>${rawSubtopics.length} chặng</span>
                <span>•</span>
                <span>${deckStats.total} từ vựng</span>
                ${deckStats.dueCount > 0 ? `<span>•</span><span style="color: #ef4444; font-weight: 700;">${deckStats.dueCount} cần ôn</span>` : ''}
              </div>
            </div>
          </div>

          <div class="subpage-hero-progress-section">
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${deckStats.progressPercent}%; background: ${deckColor};"></div>
            </div>
            <div class="subpage-deck-footer">
              <span class="subpage-deck-footer-left">Đã học: <strong>${learnedCount}</strong>/${deckStats.total} từ</span>
              <span class="subpage-deck-footer-right">${deckStats.progressPercent}%</span>
            </div>
          </div>

          <button class="btn-hero-study" id="btn-hero-study-deck">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>${deckStats.dueCount > 0 ? 'Ôn tập ngay' : 'Bắt đầu học'}</span>
          </button>
        </div>
      `;

      const btnHeroStudy = heroContainer.querySelector('#btn-hero-study-deck');
      if (btnHeroStudy) {
        btnHeroStudy.onclick = () => {
          app.startStudySession(deck.id, null);
        };
      }
    }

    // 2. Render Subtopics Cards
    const subtopicsContainer = document.getElementById('subpage-subtopics-list');
    if (subtopicsContainer) {
      subtopicsContainer.innerHTML = '';
      const frag = document.createDocumentFragment();

      for (let i = 0; i < rawSubtopics.length; i++) {
        const subObj = rawSubtopics[i];
        const subName = typeof subObj === 'object' ? (subObj.name || subObj.id) : String(subObj);
        const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
        const subCards = app.deckManager.getSubtopicCards(deck.id, subObj);

        let dueSubCount = 0;
        let learnedSubCount = 0;

        for (let j = 0; j < subCards.length; j++) {
          const s = StorageManager.getCardState(subCards[j].id);
          if (s && s.state !== State.New && s.state !== 0) {
            learnedSubCount++;
            if (isCardDue(s, new Date())) dueSubCount++;
          }
        }

        const isSubDone = subCards.length > 0 && (learnedSubCount >= subCards.length);
        const percent = subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0;
        const icon = (typeof subObj === 'object' && subObj.icon) ? subObj.icon : getSubtopicIcon(subObj || subName, deck.icon || '📖', i);
        const subColor = (typeof subObj === 'object' && subObj.color) ? safeColor(subObj.color) : getSubtopicColor(subObj || subName, deckColor, i);

        let isUnlocked = true;
        if (isProgressive && i > 0) {
          const unlockRule = typeof subObj === 'object' && subObj.unlockRule 
            ? subObj.unlockRule 
            : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id || `${deck.id}-${i - 1}` };
          isUnlocked = TopicRepository.isSubtopicUnlocked({ id: subId, unlockRule }, userProgress);
        }

        const card = document.createElement('div');
        card.className = `subtopic-card-btn ${!isUnlocked ? 'locked' : ''} ${isSubDone ? 'completed' : ''}`;
        card.dataset.subtopicId = subId;

        let badgeHtml = `<span class="subtopic-badge">Chặng ${i + 1}</span>`;
        if (!isUnlocked) {
          badgeHtml = `<span class="subtopic-badge badge-locked">🔒 Đang khóa</span>`;
        } else if (isSubDone) {
          badgeHtml = `<span class="subtopic-badge badge-done">✓ Hoàn thành</span>`;
        } else if (dueSubCount > 0) {
          badgeHtml = `<span class="subtopic-badge badge-due">⚠️ ${dueSubCount} cần ôn</span>`;
        } else if (learnedSubCount > 0) {
          badgeHtml = `<span class="subtopic-badge badge-learning">${percent}%</span>`;
        }

        card.innerHTML = `
          <div class="subtopic-card-top-row">
            <div class="subtopic-icon-badge" style="background: ${subColor}18; color: ${subColor}; border: 1px solid ${subColor}33;">
              <span>${icon}</span>
            </div>
            <div class="subtopic-card-info">
              <h4 class="subtopic-card-title">${escapeHTML(subName)}</h4>
              <div class="subtopic-card-meta">
                <span class="subtopic-count-text">${subCards.length} từ vựng</span>
                <span class="subtopic-meta-dot">•</span>
                <span class="subtopic-learned-text">Đã học ${learnedSubCount}/${subCards.length}</span>
              </div>
            </div>
            <div class="subtopic-card-right">
              ${badgeHtml}
              <div class="subtopic-chevron">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </div>
          ${percent > 0 ? `
          <div class="subtopic-card-progress">
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${percent}%; background: ${subColor};"></div>
            </div>
          </div>` : ''}
        `;

        card.onclick = () => {
          if (!isUnlocked) {
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 400);
            showToast('Chặng này đang bị khóa, hãy hoàn thành chặng trước đó!', 'warning');
            return;
          }
          openSubtopicDetailPage(app, deck.id, subName);
        };

        frag.appendChild(card);
      }

      subtopicsContainer.appendChild(frag);
    }

  } catch (err) {
    console.error('Lỗi renderSubtopicsPage:', err);
  }
}

/* ==========================================================================
   LEVEL 3: SUBTOPIC DETAIL POPUP MODAL
   ========================================================================== */

export async function openSubtopicDetailPage(app, deckId, subtopicName) {
  try {
    app.currentSubtopicsDeckId = deckId;
    app.currentSubtopicName = subtopicName;
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    await renderSubtopicDetailPage(app, deckId, subtopicName);
    const modal = document.getElementById('subtopic-detail-modal');
    if (modal) {
      modal.classList.add('active');
    }
  } catch (err) {
    console.error(`Lỗi openSubtopicDetailPage(${deckId}, ${subtopicName}):`, err);
  }
}

export async function renderSubtopicDetailPage(app, deckId, subtopicName) {
  try {
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const subObj = rawSubtopics.find(s => (typeof s === 'object' ? (s.name === subtopicName || s.id === subtopicName) : s === subtopicName));
    const subCards = app.deckManager.getSubtopicCards(deckId, subtopicName);
    const subIcon = (subObj && subObj.icon) ? subObj.icon : getSubtopicIcon(subtopicName, deck.icon || '📖');
    const subColor = (subObj && subObj.color) ? safeColor(subObj.color) : getSubtopicColor(subtopicName, deck.color || '#6366f1');

    const dueSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return isCardDue(s, new Date());
    }).length;

    const learnedSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return s && s.state !== State.New && s.state !== 0;
    }).length;

    const subProgress = subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0;

    const iconEl = document.getElementById('subtopic-detail-icon');
    const titleEl = document.getElementById('subtopic-detail-title');
    const metaEl = document.getElementById('subtopic-detail-meta');
    const progressEl = document.getElementById('subtopic-detail-progress-fill');
    const progressTextEl = document.getElementById('subtopic-detail-progress-text');
    const countLearnedEl = document.getElementById('subtopic-stat-learned') || document.getElementById('subtopic-detail-count-learned');
    const countDueEl = document.getElementById('subtopic-stat-due') || document.getElementById('subtopic-detail-count-due');
    const countTotalEl = document.getElementById('subtopic-stat-total') || document.getElementById('subtopic-detail-count-total');

    if (iconEl) iconEl.textContent = subIcon;
    if (titleEl) titleEl.textContent = subtopicName;
    if (metaEl) metaEl.textContent = `${subCards.length} từ vựng • ${DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title}`;
    if (progressEl) progressEl.style.width = `${subProgress}%`;
    if (progressTextEl) progressTextEl.textContent = `Tiến độ: ${learnedSubCount}/${subCards.length} từ (${subProgress}%)`;
    if (countLearnedEl) countLearnedEl.textContent = learnedSubCount;
    if (countDueEl) countDueEl.textContent = dueSubCount;
    if (countTotalEl) countTotalEl.textContent = subCards.length;

    const btnStudyModal = document.getElementById('btn-start-subtopic-study') || document.getElementById('btn-modal-study-subtopic');
    if (btnStudyModal) {
      if (dueSubCount > 0) {
        btnStudyModal.textContent = `⚡ Ôn tập ${dueSubCount} từ`;
      } else if (learnedSubCount < subCards.length) {
        btnStudyModal.textContent = `🚀 Học ${subCards.length - learnedSubCount} từ mới`;
      } else {
        btnStudyModal.textContent = `✓ Đã hoàn thành chặng này`;
      }

      btnStudyModal.onclick = () => {
        const modal = document.getElementById('subtopic-detail-modal');
        if (modal) modal.classList.remove('active');
        if (dueSubCount > 0 || learnedSubCount < subCards.length) {
          app.startStudySession(deckId, subtopicName);
        } else {
          openSubtopicWordsPage(app, deckId, subtopicName);
        }
      };
    }

    const btnViewWordsModal = document.getElementById('btn-view-subtopic-words') || document.getElementById('btn-modal-view-words');
    if (btnViewWordsModal) {
      btnViewWordsModal.onclick = () => {
        const modal = document.getElementById('subtopic-detail-modal');
        if (modal) modal.classList.remove('active');
        openSubtopicWordsPage(app, deckId, subtopicName);
      };
    }

    const btnClose = document.getElementById('btn-close-subtopic-modal') || document.getElementById('btn-close-subtopic-detail');
    if (btnClose) {
      btnClose.onclick = () => {
        const modal = document.getElementById('subtopic-detail-modal');
        if (modal) modal.classList.remove('active');
      };
    }
  } catch (err) {
    console.error('Lỗi renderSubtopicDetailPage:', err);
  }
}

/* ==========================================================================
   LEVEL 4: SUBTOPIC WORDS FULL LIST (SUBPAGE & PAGINATION)
   ========================================================================== */

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

    const cardStates = StorageManager.getAllCardStates();
    const now = new Date();

    const getCardStatus = (card) => {
      const state = StorageManager.getCardState(card.id);
      if (!state || state.state === 0 || state.state === State.New) return 'new';
      if (isCardDue(state, now)) return 'due';
      if (state.stability >= 21) return 'done';
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
          const row = document.createElement('div');
          row.className = `word-item-card status-${status}`;

          let statusTag = '<span class="word-status-tag status-new">Chưa học</span>';
          if (status === 'due') {
            statusTag = '<span class="word-status-tag status-due">Cần ôn</span>';
          } else if (status === 'done') {
            statusTag = `<span class="word-status-tag status-done">Thuần thục · S: ${state?.stability?.toFixed(1) || '21'}d</span>`;
          } else if (status === 'learning') {
            statusTag = `<span class="word-status-tag status-learning">Đang nhớ · S: ${state?.stability?.toFixed(1) || '0'}d</span>`;
          }

          row.innerHTML = `
            <div class="word-card-top-row">
              <span class="word-order-num">#${startIndex + index + 1}</span>
              <div class="word-main-text-group">
                <span class="word-term">${escapeHTML(card.word)}</span>
                ${card.phonetic ? `<span class="word-phonetic">${escapeHTML(card.phonetic)}</span>` : ''}
                ${card.pos ? `<span class="word-pos">${escapeHTML(card.pos)}</span>` : ''}
                ${card.cefr ? `<span class="word-cefr ${card.cefr.toLowerCase()}">${card.cefr}</span>` : ''}
              </div>
              <div class="word-status-col">${statusTag}</div>
            </div>

            <div class="word-meaning-text">${escapeHTML(card.meaning)}</div>

            ${card.example ? `
              <div class="word-example-box">
                <p class="word-example-en">"${escapeHTML(card.example)}"</p>
                ${card.exampleVi ? `<p class="word-example-vi">${escapeHTML(card.exampleVi)}</p>` : ''}
              </div>
            ` : ''}

            <div class="word-card-bottom-actions">
              <button class="btn-word-audio" data-word="${escapeHTML(card.word)}" title="Phát âm">
                🔊 Nghe từ
              </button>
              <button class="btn-word-study-single" data-id="${escapeHTML(card.id)}">
                ⚡ Học từ này
              </button>
            </div>
          `;

          row.querySelector('.btn-word-audio').onclick = (e) => {
            e.stopPropagation();
            import('../services/audio.js').then(({ speak }) => {
              speak(card.word, { cardObj: card });
            });
          };

          row.querySelector('.btn-word-study-single').onclick = (e) => {
            e.stopPropagation();
            app.startStudySession(deckId, null, [card]);
          };

          frag.appendChild(row);
        });
        wordsListContainer.appendChild(frag);
      }

      // Render Pagination
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
        if (totalPages > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.className = 'pagination-btn prev-btn';
          prevBtn.textContent = '‹';
          prevBtn.disabled = currentPage === 1;
          prevBtn.onclick = () => {
            if (currentPage > 1) {
              currentPage--;
              renderFilteredWords();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          };
          paginationContainer.appendChild(prevBtn);

          for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
              const pageBtn = document.createElement('button');
              pageBtn.className = `pagination-btn page-num ${p === currentPage ? 'active' : ''}`;
              pageBtn.textContent = p;
              pageBtn.onclick = () => {
                currentPage = p;
                renderFilteredWords();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              };
              paginationContainer.appendChild(pageBtn);
            } else if (p === currentPage - 2 || p === currentPage + 2) {
              const dots = document.createElement('span');
              dots.className = 'pagination-dots';
              dots.textContent = '...';
              paginationContainer.appendChild(dots);
            }
          }

          const nextBtn = document.createElement('button');
          nextBtn.className = 'pagination-btn next-btn';
          nextBtn.textContent = '›';
          nextBtn.disabled = currentPage === totalPages;
          nextBtn.onclick = () => {
            if (currentPage < totalPages) {
              currentPage++;
              renderFilteredWords();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          };
          paginationContainer.appendChild(nextBtn);
        }
      }
    };

    renderFilteredWords();

  } catch (err) {
    console.error('Lỗi trong renderSubtopicWordsPage:', err);
  }
}
