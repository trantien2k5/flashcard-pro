/**
 * Decks & Subtopics View - Handles Level 1 Decks, Level 2 Subtopics, Level 3 Subtopic Details & Level 4 Words
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon } from '../constants.js';
import { StorageManager } from '../storage.js';
import { State } from '../fsrs.js';
import { showToast } from '../components/feedback.js';
import { TopicRepository } from '../../data/index.js';

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function safeColor(value, fallback = '#6366f1') {
  const color = String(value || '').trim();
  return /^(#[0-9a-f]{3,8}|rgb(a)?\([\d\s.,%]+\)|hsl(a)?\([\d\s.,%]+\)|[a-z]+)$/i.test(color) ? color : fallback;
}

/**
 * Tạo phần tử Thẻ Chủ đề lớn (Deck Item Card) bố cục chuẩn đẹp, cân đối
 */
export function createDeckCardElement(app, deck) {
  const deckStats = app.deckManager.getDeckStats(deck.id);
  const englishTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
  const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
  const learnedCount = deckStats.total - deckStats.newCount;
  const subCount = (deck.subtopics && deck.subtopics.length) ? deck.subtopics.length : (deck.subcategories && deck.subcategories.length ? deck.subcategories.length : 1);
  const deckColor = safeColor(deck.color);
  
  const cardEl = document.createElement('div');
  cardEl.className = 'deck-item-card';

  let dueBadgeHtml = '';
  if (deckStats.dueCount > 0) {
    dueBadgeHtml = `<span class="subtopic-badge badge-due">⚠️ ${deckStats.dueCount} cần ôn</span>`;
  } else if (learnedCount === deckStats.total && deckStats.total > 0) {
    dueBadgeHtml = `<span class="subtopic-badge badge-done">✓ Đã thuộc</span>`;
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
            ${dueBadgeHtml ? `<span class="tax-bullet">•</span>${dueBadgeHtml}` : ''}
          </div>
        </div>
      </div>
      <div class="deck-card-right">
        <span class="deck-stats-fraction">${learnedCount}/${deckStats.total}</span>
        <span class="deck-chevron">›</span>
      </div>
    </div>
    <div class="deck-progress-bar-bg">
      <div class="deck-progress-fill" style="width: ${deckStats.progressPercent}%;"></div>
    </div>
  `;
  cardEl.addEventListener('click', () => {
    if (app && typeof app.openSubtopicsPage === 'function') {
      app.openSubtopicsPage(deck.id);
    } else {
      openSubtopicsPage(app, deck.id);
    }
  });
  return cardEl;
}

const DECK_CATEGORY_MAP = {
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

let _decksCurrentFilter = 'all';
let _decksSearchQuery = '';
let _decksCurrentSort = 'default';
let _decksListenersAttached = false;

/**
 * Render Tab Danh sách chủ đề chính (Level 1)
 */
export function renderDecksTab(app) {
  try {
    const allDecks = app.deckManager.getAllDecks();

    // 1. Tự động tính toán các chỉ số & số lượng cho từng Filter Chip
    let countToeic = 0, countDaily = 0, countCareer = 0, countExplore = 0;
    let countLearning = 0, countDue = 0;
    let totalAllWords = 0;

    allDecks.forEach(deck => {
      const deckStats = app.deckManager.getDeckStats(deck.id);
      const learned = deckStats.total - deckStats.newCount;
      const cat = DECK_CATEGORY_MAP[deck.id] || 'daily';
      
      totalAllWords += deckStats.total;

      if (cat === 'toeic') countToeic++;
      else if (cat === 'daily') countDaily++;
      else if (cat === 'career') countCareer++;
      else if (cat === 'explore') countExplore++;

      if (learned > 0) countLearning++;
      if (deckStats.dueCount > 0) countDue++;
    });

    const chipAll = document.getElementById('deck-chip-all');
    const chipToeic = document.getElementById('deck-chip-toeic');
    const chipDaily = document.getElementById('deck-chip-daily');
    const chipCareer = document.getElementById('deck-chip-career');
    const chipExplore = document.getElementById('deck-chip-explore');
    const chipLearning = document.getElementById('deck-chip-learning');
    const chipDue = document.getElementById('deck-chip-due');

    if (chipAll) chipAll.textContent = allDecks.length;
    if (chipToeic) chipToeic.textContent = countToeic;
    if (chipDaily) chipDaily.textContent = countDaily;
    if (chipCareer) chipCareer.textContent = countCareer;
    if (chipExplore) chipExplore.textContent = countExplore;
    if (chipLearning) chipLearning.textContent = countLearning;
    if (chipDue) chipDue.textContent = countDue;

    // 2. Hàm lọc và sắp xếp danh sách chủ đề
    const getProcessedDecks = () => {
      let list = allDecks.slice();

      // Lọc theo Danh mục Filter Chip
      if (_decksCurrentFilter !== 'all') {
        if (_decksCurrentFilter === 'toeic' || _decksCurrentFilter === 'daily' || _decksCurrentFilter === 'career' || _decksCurrentFilter === 'explore') {
          list = list.filter(d => (DECK_CATEGORY_MAP[d.id] || 'daily') === _decksCurrentFilter);
        } else if (_decksCurrentFilter === 'learning') {
          list = list.filter(d => {
            const s = app.deckManager.getDeckStats(d.id);
            return (s.total - s.newCount) > 0;
          });
        } else if (_decksCurrentFilter === 'due') {
          list = list.filter(d => {
            const s = app.deckManager.getDeckStats(d.id);
            return s.dueCount > 0;
          });
        }
      }

      // Lọc theo từ khóa tìm kiếm
      if (_decksSearchQuery) {
        const q = _decksSearchQuery.toLowerCase();
        list = list.filter(d => {
          const en = (DECK_ENGLISH_NAMES[d.id] || d.titleEn || d.title || d.name || '').toLowerCase();
          const vi = (d.name || d.title || d.description || '').toLowerCase();
          const subs = (d.subtopics || d.subcategories || []).map(s => typeof s === 'object' ? s.name : s).join(' ').toLowerCase();
          return en.includes(q) || vi.includes(q) || subs.includes(q);
        });
      }

      // Sắp xếp
      if (_decksCurrentSort === 'due') {
        list.sort((a, b) => app.deckManager.getDeckStats(b.id).dueCount - app.deckManager.getDeckStats(a.id).dueCount);
      } else if (_decksCurrentSort === 'progress') {
        list.sort((a, b) => app.deckManager.getDeckStats(b.id).progressPercent - app.deckManager.getDeckStats(a.id).progressPercent);
      } else if (_decksCurrentSort === 'words') {
        list.sort((a, b) => app.deckManager.getDeckStats(b.id).total - app.deckManager.getDeckStats(a.id).total);
      } else if (_decksCurrentSort === 'az') {
        list.sort((a, b) => {
          const nameA = DECK_ENGLISH_NAMES[a.id] || a.titleEn || a.title;
          const nameB = DECK_ENGLISH_NAMES[b.id] || b.titleEn || b.title;
          return nameA.localeCompare(nameB);
        });
      }

      return list;
    };

    // 3. Render danh sách thẻ bộ đề vào container
    const container = document.getElementById('all-decks-container');
    const countSummary = document.getElementById('decks-count-summary');
    if (!container) return;

    const renderList = () => {
      const processedDecks = getProcessedDecks();
      const totalWords = processedDecks.reduce((sum, d) => sum + app.deckManager.getDeckStats(d.id).total, 0);

      if (countSummary) {
        countSummary.textContent = `Hiển thị ${processedDecks.length} / ${allDecks.length} bộ đề • ${totalWords.toLocaleString('vi-VN')} từ vựng`;
      }

      container.innerHTML = '';
      if (processedDecks.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-muted); grid-column: 1 / -1;">
            <div style="font-size: 2.4rem; margin-bottom: 8px;">🔍</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Không tìm thấy bộ đề phù hợp</div>
            <div style="font-size: 0.85rem;">Hãy thử tìm với từ khóa khác hoặc chọn danh mục "Tất cả"</div>
          </div>
        `;
        return;
      }

      const fragment = document.createDocumentFragment();
      processedDecks.forEach(deck => {
        const cardEl = createDeckCardElement(app, deck);
        fragment.appendChild(cardEl);
      });
      container.appendChild(fragment);
    };

    renderList();

    // 4. Gắn Event Listeners một lần duy nhất cho Toolbar
    if (!_decksListenersAttached) {
      _decksListenersAttached = true;

      // Filter chips click
      const chipsContainer = document.getElementById('decks-filter-chips');
      if (chipsContainer) {
        chipsContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.filter-chip');
          if (!btn) return;
          const filter = btn.getAttribute('data-deck-filter');
          if (filter && filter !== _decksCurrentFilter) {
            _decksCurrentFilter = filter;
            chipsContainer.querySelectorAll('.filter-chip').forEach(c => {
              c.classList.toggle('active', c === btn);
            });
            renderList();
          }
        });
      }

      // Search input
      const searchInput = document.getElementById('decks-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          _decksSearchQuery = (e.target.value || '').trim();
          renderList();
        });
      }

      // Sort select
      const sortSelect = document.getElementById('decks-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          _decksCurrentSort = e.target.value;
          renderList();
        });
      }
    }
  } catch (err) {
    console.error('Lỗi renderDecksTab:', err);
  }
}

/**
 * Mở trang danh sách chủ đề con (Level 2)
 */
export function openSubtopicsPage(app, deckId) {
  app.currentSubtopicsDeckId = deckId;
  app.switchTab('tab-subtopics');
  if (typeof app.scrollToTop === 'function') app.scrollToTop();
  renderSubtopicsPage(app, deckId);
}

/**
 * Render trang danh sách chủ đề con (Level 2)
 */
export function renderSubtopicsPage(app, deckId) {
  try {
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const cards = app.deckManager.getCardsByDeckId(deckId);
    const englishTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
    const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const deckStats = app.deckManager.getDeckStats(deck.id);
    const learnedCount = deckStats.total - deckStats.newCount;
    const deckColor = safeColor(deck.color);

    // 1. Cập nhật Top Navigation Title & Subtitle
    const topTitleEl = document.getElementById('subpage-top-title');
    const topSubtitleEl = document.getElementById('subpage-top-subtitle');
    if (topTitleEl) topTitleEl.textContent = englishTitle;
    if (topSubtitleEl) {
      topSubtitleEl.textContent = vietnameseTitle ? `${vietnameseTitle} • ${rawSubtopics.length} chủ đề con` : `${rawSubtopics.length} chủ đề con`;
    }

    const cardStates = StorageManager.getAllCardStates();
    const userProgress = StorageManager.getUserProgress();
    const nowMs = Date.now();
    const isProgressive = deck.isProgressive === true || deck.id === 'toeic-b1';

    const subtopicStatusList = [];

    for (let i = 0; i < rawSubtopics.length; i++) {
      const subObj = rawSubtopics[i];
      const subName = typeof subObj === 'object' ? (subObj.name || subObj.id) : String(subObj);
      const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
      
      const subCards = app.deckManager.getSubtopicCards(deck.id, subObj);

      let dueSubCount = 0;
      let learnedSubCount = 0;

      for (let j = 0; j < subCards.length; j++) {
        const s = cardStates[subCards[j].id];
        if (s && s.state !== State.New && s.state !== 0) {
          learnedSubCount++;
          if (s.due && Date.parse(s.due) <= nowMs) {
            dueSubCount++;
          }
        }
      }

      const isSubDone = subCards.length > 0 && (learnedSubCount >= subCards.length);
      if (isSubDone) {
        StorageManager.completeSubtopic(subId);
      }

      const isLocked = isProgressive 
        ? !TopicRepository.isSubtopicUnlocked(typeof subObj === 'object' ? subObj : { id: subId, unlockRule: i === 0 ? null : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id } }, userProgress)
        : false;

      subtopicStatusList.push({
        sub: subName,
        subId,
        subObj,
        index: i,
        subCards,
        dueSubCount,
        learnedSubCount,
        subProgress: subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0,
        isDone: isSubDone,
        isLocked,
        prevSubName: i > 0 ? (typeof rawSubtopics[i - 1] === 'object' ? (rawSubtopics[i - 1].name || rawSubtopics[i - 1].id) : rawSubtopics[i - 1]) : null
      });
    }

    const unlockedSubtopics = subtopicStatusList.filter(s => !s.isLocked);
    const unlockedCards = isProgressive 
      ? subtopicStatusList.filter(s => !s.isLocked).flatMap(s => s.subCards)
      : cards;

    // 3. Render Hero Card Banner tổng quan bộ đề
    const heroContainer = document.getElementById('subpage-hero-container');
    if (heroContainer) {
      let dueBannerHtml = '';
      if (deckStats.dueCount > 0) {
        dueBannerHtml = `<span class="subtopic-badge badge-due">⚠️ ${deckStats.dueCount} từ cần ôn</span>`;
      } else if (learnedCount === deckStats.total && deckStats.total > 0) {
        dueBannerHtml = `<span class="subtopic-badge badge-done">✓ Đã thuộc toàn bộ</span>`;
      } else if (learnedCount > 0) {
        dueBannerHtml = `<span class="subtopic-badge badge-learning">Đã học ${learnedCount}/${deckStats.total} từ</span>`;
      } else {
        dueBannerHtml = `<span class="subtopic-badge badge-new">Chưa học</span>`;
      }

      let pathwayBadgeHtml = '';
      if (isProgressive) {
        pathwayBadgeHtml = `<span class="subtopic-badge badge-learning" style="background: rgba(14, 165, 233, 0.12); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.3);">🔓 Đã mở ${unlockedSubtopics.length}/${rawSubtopics.length} chặng</span><span class="tax-bullet">•</span>`;
      }

      const studyQueueResult = app.deckManager.getStudyQueue(deckId, app.settings);
      const totalDue = studyQueueResult.totalDue;
      const totalNew = studyQueueResult.totalNew;
      const totalLearned = studyQueueResult.totalLearned;
      const newInBatch = studyQueueResult.newCards.length;

      let heroStudyIcon = '🚀';
      let heroStudyText = 'Học toàn bộ';

      if (isProgressive) {
        if (totalDue > 0) {
          heroStudyIcon = '⚡';
          heroStudyText = 'Ôn tập chặng';
        } else if (totalLearned > 0 && totalNew > 0) {
          heroStudyIcon = '✨';
          heroStudyText = 'Học tiếp';
        } else if (totalLearned === 0) {
          heroStudyIcon = '🚀';
          heroStudyText = 'Bắt đầu chặng';
        } else {
          heroStudyIcon = '🔄';
          heroStudyText = 'Ôn lại chặng';
        }
      } else {
        if (totalDue > 0) {
          heroStudyIcon = '⚡';
          heroStudyText = 'Ôn tập ngay';
        } else if (totalLearned > 0 && totalNew > 0) {
          heroStudyIcon = '✨';
          heroStudyText = 'Học tiếp';
        } else if (totalLearned === 0) {
          heroStudyIcon = '🚀';
          heroStudyText = 'Bắt đầu học';
        } else {
          heroStudyIcon = '🔄';
          heroStudyText = 'Ôn lại toàn bộ';
        }
      }

      heroContainer.innerHTML = `
        <div class="subpage-hero-card">
          <div class="subpage-hero-top">
            <div class="subpage-deck-icon" style="background: ${deckColor}18; color: ${deckColor};">
              ${escapeHTML(deck.icon || '📚')}
            </div>
            <div class="subpage-deck-info">
              <h3 class="subpage-deck-title">${escapeHTML(englishTitle)}</h3>
              <div class="subpage-deck-meta">
                ${vietnameseTitle ? `<span class="subpage-vi-title">${escapeHTML(vietnameseTitle)}</span><span class="tax-bullet">•</span>` : ''}
                ${pathwayBadgeHtml}
                <span>${rawSubtopics.length} chủ đề con</span>
                <span class="tax-bullet">•</span>
                <span>${deckStats.total} từ vựng</span>
                <span class="tax-bullet">•</span>
                ${dueBannerHtml}
              </div>
            </div>
            <div class="subpage-hero-cta-group">
              <button type="button" class="btn-primary-hero btn-hero-study" id="btn-hero-study-deck">
                <span>${heroStudyIcon} ${heroStudyText}</span>
              </button>
            </div>
          </div>
          <div class="deck-progress-bar-bg" style="margin-top: 14px; height: 8px;">
            <div class="deck-progress-fill" style="width: ${deckStats.progressPercent}%;"></div>
          </div>
          <div class="subpage-deck-footer">
            <span>Tiến độ: <strong>${learnedCount}/${deckStats.total} từ</strong> (${deckStats.progressPercent}%)</span>
            <span>${deckStats.dueCount > 0 ? `<span style="color: #ef4444; font-weight: 700;">⚠️ ${deckStats.dueCount} từ đến hạn ôn</span>` : ''}</span>
          </div>
        </div>
      `;

      const btnHeroStudy = heroContainer.querySelector('#btn-hero-study-deck');
      if (btnHeroStudy) {
        btnHeroStudy.onclick = async () => {
          if (app.deckManager && app.deckManager.ensureTopicLoaded) {
            await app.deckManager.ensureTopicLoaded(deckId);
          }
          if (unlockedCards.length === 0) {
            showToast('Chưa có thẻ nào được mở khóa để học!', 'warning');
            return;
          }
          const currentQueueResult = app.deckManager.getStudyQueue(deckId, app.settings);
          if (currentQueueResult && currentQueueResult.queue && currentQueueResult.queue.length > 0) {
            app.startStudySession(currentQueueResult.queue);
          } else {
            app.startStudySession(unlockedCards);
          }
        };
      }
    }

    // 4. Cập nhật Section Heading
    const headingCount = document.getElementById('subtopics-list-count');
    if (headingCount) {
      headingCount.textContent = isProgressive 
        ? `${unlockedSubtopics.length}/${rawSubtopics.length} chặng đã mở` 
        : `${rawSubtopics.length} chủ đề`;
    }

    // 5. Render danh sách chủ đề con dạng Grid
    const listContainer = document.getElementById('subpage-subtopics-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (subtopicStatusList.length > 0) {
      const fragment = document.createDocumentFragment();

      subtopicStatusList.forEach(sInfo => {
        const { sub, subCards, dueSubCount, learnedSubCount, subProgress, isDone, isLocked, prevSubName } = sInfo;

        const subIcon = isLocked ? '🔒' : getSubtopicIcon(sub, deck.icon || '📖');

        let subBadgeHtml = '';
        if (isLocked) {
          subBadgeHtml = `<span class="subtopic-badge badge-locked">🔒 Khóa • Hoàn thành chặng trước</span>`;
        } else if (dueSubCount > 0) {
          subBadgeHtml = `<span class="subtopic-badge badge-due">⚠️ ${dueSubCount} cần ôn</span>`;
        } else if (isDone) {
          subBadgeHtml = `<span class="subtopic-badge badge-done">✓ Đã thuộc</span>`;
        } else if (learnedSubCount > 0) {
          subBadgeHtml = `<span class="subtopic-badge badge-learning">${learnedSubCount}/${subCards.length} từ (${subProgress}%)</span>`;
        } else {
          subBadgeHtml = `<span class="subtopic-badge badge-new">Chưa học</span>`;
        }

        const subCardEl = document.createElement('div');
        subCardEl.className = `subtopic-card-btn${isLocked ? ' locked' : ''}`;
        subCardEl.setAttribute('role', 'button');
        subCardEl.setAttribute('tabindex', '0');
        subCardEl.innerHTML = `
          <div class="subtopic-card-top-row">
            <div class="subtopic-icon-badge" style="background: ${isLocked ? 'rgba(148, 163, 184, 0.12)' : `${deckColor}15`}; color: ${isLocked ? 'var(--text-muted)' : deckColor};">
              ${escapeHTML(subIcon)}
            </div>
            <div class="subtopic-card-info">
              <div class="subtopic-card-title">${escapeHTML(sub)}</div>
              <div class="subtopic-card-meta">
                <span class="subtopic-count-text">${subCards.length} từ</span>
                <span class="tax-bullet">•</span>
                ${subBadgeHtml}
              </div>
            </div>
            <div class="subtopic-card-right">
              <span class="subtopic-stats-fraction">${isLocked ? '' : `${learnedSubCount}/${subCards.length}`}</span>
              <span class="subtopic-chevron" style="${isLocked ? 'color: #f59e0b; font-size: 1.1rem;' : ''}">${isLocked ? '🔒' : '›'}</span>
            </div>
          </div>
          <div class="subtopic-mini-progress-bg">
            <div class="subtopic-mini-progress-fill" style="width: ${isLocked ? 0 : subProgress}%;"></div>
          </div>
        `;

        subCardEl.onclick = () => {
          if (isLocked) {
            subCardEl.classList.remove('shake');
            void subCardEl.offsetWidth; // Force CSS reflow
            subCardEl.classList.add('shake');
            showToast(`🔒 Chặng này đang khóa! Hãy hoàn thành "${prevSubName || 'chặng trước'}" để mở khóa nhé.`, 'warning');
            return;
          }

          if (app && typeof app.openSubtopicDetailPage === 'function') {
            app.openSubtopicDetailPage(deckId, sub);
          } else {
            openSubtopicDetailPage(app, deckId, sub);
          }
        };

        fragment.appendChild(subCardEl);
      });

      listContainer.appendChild(fragment);
    }
  } catch (err) {
    console.error(`Lỗi renderSubtopicsPage(${deckId}):`, err);
  }
}

/**
 * Mở Popup chi tiết của một Chủ đề con (Modal Popup giữa màn hình)
 */
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

/**
 * Render Dữ liệu Modal Popup chi tiết Chủ đề con
 */
export async function renderSubtopicDetailPage(app, deckId, subtopicName) {
  try {
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const subCards = app.deckManager.getSubtopicCards(deckId, subtopicName);
    const subIcon = getSubtopicIcon(subtopicName, deck.icon || '📖');

    // Tính toán chỉ số tiến độ chủ đề con
    const dueSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return s && s.state !== State.New && s.state !== 0 && s.due && new Date(s.due) <= new Date();
    }).length;

    const learnedSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return s && s.state !== State.New && s.state !== 0;
    }).length;

    const subProgress = subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0;

    // 1. Cập nhật Tiêu đề và biểu tượng trên Header của Modal
    const iconEl = document.getElementById('subtopic-detail-icon');
    const titleEl = document.getElementById('subtopic-detail-title');
    const metaEl = document.getElementById('subtopic-detail-meta');
    const fillEl = document.getElementById('subtopic-detail-progress-fill');
    const progressTextEl = document.getElementById('subtopic-detail-progress-text');
    const dueStatusEl = document.getElementById('subtopic-detail-due-status');
    const btnStartStudy = document.getElementById('btn-start-subtopic-study');

    if (iconEl) {
      iconEl.textContent = subIcon;
      iconEl.style.background = `${deck.color || '#6366f1'}18`;
      iconEl.style.color = deck.color || '#6366f1';
    }
    const englishDeckTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
    const vietnameseDeckTitle = deck.name || (deck.title && deck.title !== englishDeckTitle ? deck.title : '');
    if (titleEl) titleEl.textContent = subtopicName;
    if (metaEl) metaEl.textContent = `${vietnameseDeckTitle || englishDeckTitle} • ${subCards.length} từ vựng`;
    if (fillEl) fillEl.style.width = `${subProgress}%`;
    if (progressTextEl) progressTextEl.textContent = `Tiến độ: ${learnedSubCount}/${subCards.length} từ (${subProgress}%)`;
    if (dueStatusEl) {
      if (dueSubCount > 0) {
        dueStatusEl.innerHTML = `<span style="color: #ef4444; font-weight: 700;">⚠️ ${dueSubCount} từ cần ôn</span>`;
      } else if (learnedSubCount === subCards.length && subCards.length > 0) {
        dueStatusEl.innerHTML = `<span style="color: #10b981; font-weight: 600;">✓ Đã hoàn thành</span>`;
      } else if (learnedSubCount > 0) {
        dueStatusEl.innerHTML = `<span style="color: #10b981; font-weight: 600;">Đã học ${learnedSubCount}/${subCards.length} từ</span>`;
      } else {
        dueStatusEl.innerHTML = `<span style="color: var(--text-muted);">Chưa học</span>`;
      }
    }

    // 2. Cập nhật 3 thông số tổng quan
    const statTotal = document.getElementById('subtopic-stat-total');
    const statLearned = document.getElementById('subtopic-stat-learned');
    const statDue = document.getElementById('subtopic-stat-due');
    if (statTotal) statTotal.textContent = subCards.length;
    if (statLearned) statLearned.textContent = learnedSubCount;
    if (statDue) statDue.textContent = dueSubCount;

    // Helper đóng modal
    const closeModal = () => {
      const modal = document.getElementById('subtopic-detail-modal');
      if (modal) modal.classList.remove('active');
    };

    const btnClose = document.getElementById('btn-close-subtopic-modal');
    if (btnClose) btnClose.onclick = closeModal;

    const modal = document.getElementById('subtopic-detail-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    // 3. Nút Cột 1: Bắt đầu / Tiếp tục học (CTA Chính)
    if (btnStartStudy) {
      const subQueueResult = app.deckManager.getStudyQueue(deckId, app.settings, subtopicName);
      let ctaIcon = '🚀';
      let ctaText = 'Bắt đầu học';

      if (subQueueResult.totalDue > 0) {
        ctaIcon = '⚡';
        ctaText = 'Ôn tập ngay';
      } else if (subQueueResult.totalLearned === subCards.length && subCards.length > 0) {
        ctaIcon = '🔄';
        ctaText = 'Ôn lại';
      } else if (subQueueResult.totalLearned > 0) {
        ctaIcon = '✨';
        ctaText = 'Học tiếp';
      }

      btnStartStudy.innerHTML = `<span>${ctaIcon} ${ctaText}</span>`;

      btnStartStudy.onclick = async () => {
        try {
          closeModal();
          if (app.deckManager && app.deckManager.ensureTopicLoaded) {
            await app.deckManager.ensureTopicLoaded(deckId);
          }
          const queue = app.deckManager.getStudyQueue(deckId, app.settings, subtopicName);
          if (queue.queue && queue.queue.length > 0) {
            app.startStudySession(queue.queue);
          } else {
            app.startStudySession(subCards);
          }
        } catch (err) {
          console.error('Lỗi khi bắt đầu học chủ đề con:', err);
        }
      };
    }

    // 4. Nút Cột 2: Xem danh sách từ vựng
    const btnViewWords = document.getElementById('btn-view-subtopic-words');
    const btnViewWordsText = document.getElementById('btn-view-words-text');
    if (btnViewWordsText) {
      btnViewWordsText.textContent = `📖 Danh sách từ (${subCards.length})`;
    }

    if (btnViewWords) {
      btnViewWords.onclick = async () => {
        try {
          closeModal();
          if (app && typeof app.openSubtopicWordsPage === 'function') {
            await app.openSubtopicWordsPage(deckId, subtopicName);
          } else {
            await openSubtopicWordsPage(app, deckId, subtopicName);
          }
        } catch (err) {
          console.error('Lỗi khi mở trang từ vựng:', err);
        }
      };
    }
  } catch (err) {
    console.error('Lỗi renderSubtopicDetailPage:', err);
  }
}

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
  if (typeof app.scrollToTop === 'function') app.scrollToTop();
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
                app.studySession.speak(card.word);
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
