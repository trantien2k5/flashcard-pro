/**
 * Decks View (Level 1) - Quản lý danh sách Bộ đề từ vựng lớn, lọc danh mục, tìm kiếm và sắp xếp
 */

import { DECK_ENGLISH_NAMES } from '../constants.js';
import { escapeHTML, safeColor } from '../utils/helpers.js';
import { openSubtopicsPage, renderSubtopicsPage } from './subtopics-view.js';
import { openSubtopicDetailPage, renderSubtopicDetailPage } from '../components/subtopic-modal.js';
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
 * Lộ trình học tập sư phạm ưu tiên cho 16 chủ đề (Từ nền tảng -> đời sống -> nghề nghiệp -> nâng cao)
 */
export const RECOMMENDED_TOPIC_ORDER = [
  // Giai đoạn 1: Nền tảng giao tiếp căn bản (Foundation)
  'daily-life-routines',     // 1. Đời sống & Thói quen (Cơ bản nhất mỗi ngày)
  'people-relationships',    // 2. Con người & Mối quan hệ (Gia đình, bạn bè, bản thân)
  'food-drink',              // 3. Ẩm thực & Ăn uống (Thức ăn, nước uống, nhà hàng)
  'home-living',             // 4. Nhà cửa & Không gian sống (Đồ đạc sinh hoạt)
  'communication-feelings',  // 5. Giao tiếp & Cảm xúc (Hội thoại, cảm xúc cơ bản)

  // Giai đoạn 2: Kỹ năng sống & Đời sống thực tế (Practical Living)
  'health-body',             // 6. Sức khỏe & Cơ thể (Bộ phận, bệnh tật, chăm sóc)
  'shopping-money',          // 7. Mua sắm & Tiền tệ (Giá cả, thanh toán, ngân hàng)
  'transport-directions',    // 8. Giao thông & Di chuyển (Phương tiện, hỏi đường)
  'travel-places',           // 9. Du lịch & Khám phá (Sân bay, khách sạn, thắng cảnh)

  // Giai đoạn 3: Công việc, Học tập & Công nghệ (Career, Study & Tech)
  'education-learning',      // 10. Giáo dục & Học tập (Trường học, môn học, kỹ năng)
  'work-jobs',               // 11. Công việc & Sự nghiệp (Văn phòng, nghề nghiệp)
  'technology-internet',     // 12. Công nghệ & Internet (Máy tính, mạng xã hội, AI)

  // Giai đoạn 4: Mở rộng & Luyện thi nâng cao (Explore, Society & Test Prep)
  'entertainment-hobbies',   // 13. Giải trí & Sở thích (Âm nhạc, phim, thể thao)
  'nature-weather',          // 14. Thiên nhiên & Thời tiết (Thời tiết, môi trường)
  'society-world',           // 15. Xã hội & Thế giới (Văn hóa, tin tức, luật pháp)
  'toeic-b1'                 // 16. Từ vựng TOEIC B1 (Luyện thi tổng hợp chuyên sâu)
];

const RECOMMENDED_TOPIC_INDEX_MAP = new Map(
  RECOMMENDED_TOPIC_ORDER.map((id, index) => [id, index])
);

/**
 * Tạo phần tử Thẻ Chủ đề lớn (Deck Item Card) bố cục chuẩn đẹp, cân đối
 */
export function createDeckCardElement(app, deck, extraOptions = {}) {
  const deckStats = app.deckManager.getDeckStats(deck.id);
  const englishTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
  const rawViTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
  // Loại bỏ các đoạn trùng tên tiếng Anh trong ngoặc ví dụ: "Nhà cửa & Đời sống (Home & Living)" -> "Nhà cửa & Đời sống"
  const vietnameseTitle = rawViTitle.replace(/\s*\([^)]*[a-zA-Z]{3,}[^)]*\)$/, '').trim();
  const learnedCount = deckStats.total - deckStats.newCount;
  const subCount = (deck.subtopics && deck.subtopics.length) ? deck.subtopics.length : (deck.subcategories && deck.subcategories.length ? deck.subcategories.length : 1);
  const deckColor = safeColor(deck.color);
  
  const cardEl = document.createElement('div');
  cardEl.className = 'deck-item-card';
  if (extraOptions.isMostRecent) {
    cardEl.classList.add('deck-item-recent');
  }

  let statusBadgeHtml = '';
  if (deckStats.dueCount > 0) {
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
          const nameA = DECK_ENGLISH_NAMES[a.id] || a.titleEn || a.title || a.name || '';
          const nameB = DECK_ENGLISH_NAMES[b.id] || b.titleEn || b.title || b.name || '';
          return nameA.localeCompare(nameB);
        });
      } else {
        // SẮP XẾP MẶC ĐỊNH THÔNG MINH (Smart Default Sort):
        // 1. Chủ đề vừa học gần đây (lastStudiedTime > 0) -> ĐẨY LÊN ĐẦU (mới nhất trước)
        // 2. Tiếp theo là các chủ đề chưa học -> XẾP THEO LỘ TRÌNH SƯ PHẠM ƯU TIÊN (RECOMMENDED_TOPIC_ORDER)
        list.sort((a, b) => {
          const statsA = app.deckManager.getDeckStats(a.id);
          const statsB = app.deckManager.getDeckStats(b.id);
          const lastA = statsA.lastStudiedTime || 0;
          const lastB = statsB.lastStudiedTime || 0;

          // Cả hai đều đã từng học: xếp chủ đề học gần nhất lên trước
          if (lastA > 0 && lastB > 0) {
            return lastB - lastA;
          }
          // Một trong hai đã học: đưa chủ đề đã học lên trên
          if (lastA > 0) return -1;
          if (lastB > 0) return 1;

          // Cả hai chưa học: xếp theo lộ trình ưu tiên sư phạm
          const idxA = RECOMMENDED_TOPIC_INDEX_MAP.has(a.id) ? RECOMMENDED_TOPIC_INDEX_MAP.get(a.id) : 999;
          const idxB = RECOMMENDED_TOPIC_INDEX_MAP.has(b.id) ? RECOMMENDED_TOPIC_INDEX_MAP.get(b.id) : 999;
          return idxA - idxB;
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
        countSummary.textContent = `${processedDecks.length}/${allDecks.length} bộ đề • ${totalWords.toLocaleString('vi-VN')} từ`;
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

      // Xác định chủ đề vừa học gần nhất và chủ đề đầu tiên khuyên học tiếp theo
      let mostRecentDeckId = null;
      let maxLastStudied = 0;
      let firstUnstartedDeckId = null;

      processedDecks.forEach(deck => {
        const s = app.deckManager.getDeckStats(deck.id);
        if (s.lastStudiedTime && s.lastStudiedTime > maxLastStudied) {
          maxLastStudied = s.lastStudiedTime;
          mostRecentDeckId = deck.id;
        }
        if (!firstUnstartedDeckId && (s.total - s.newCount) === 0) {
          firstUnstartedDeckId = deck.id;
        }
      });

      const fragment = document.createDocumentFragment();
      processedDecks.forEach(deck => {
        const isMostRecent = deck.id === mostRecentDeckId;
        const isRecommendedNext = deck.id === firstUnstartedDeckId;
        const cardEl = createDeckCardElement(app, deck, { isMostRecent, isRecommendedNext });
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
