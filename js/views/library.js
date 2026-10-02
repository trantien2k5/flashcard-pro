/**
 * Thư Viện Từ Vựng - Quản lý toàn diện kho từ vựng & Hệ thống bộ lọc FSRS-6 chuyên sâu
 * Tối ưu hóa hiệu năng cực cao: RAM Pre-indexed Search, DocumentFragment Virtual Chunking & Zero-Lag DOM.
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { escapeHTML, scrollToTop } from '../utils.js';
import { speak, onAudioPlayStateChange } from '../services/audio.js';
import { MASTERY_STABILITY_THRESHOLD } from '../config.js';

// Trạng thái bộ lọc và tìm kiếm cục bộ của Thư viện (bảo toàn khi chuyển tab)
let _libState = {
  searchQuery: '',
  selectedCefr: 'all',        // all, a1, a2, b1, b2, c1
  selectedPos: 'all',         // all, noun, verb, adjective, adverb, phrase, phrasal verb, idiom, preposition
  selectedStatus: 'all',      // all, due, new, learning, hard, tier1, tier2, tier3, tier4, tier5, mastered
  selectedDeck: 'all',        // all, or any deck/topic id
  sortBy: 'due_asc',          // due_asc, due_desc, alpha_asc, alpha_desc, cefr_asc, cefr_desc, stability_desc, stability_asc, difficulty_desc, reps_desc
  pageSize: 20,               // 15, 20, 50, 100
  currentPage: 1,
  quickFilter: 'all'          // all, due, new, learning, hard, mastered
};

// RAM Search Index Cache (Tối ưu sub-millisecond filtering)
let _searchIndexCache = null;
let _searchIndexSourceLength = 0;

function buildSearchIndex(allCards) {
  if (_searchIndexCache && _searchIndexSourceLength === allCards.length) {
    return _searchIndexCache;
  }
  _searchIndexSourceLength = allCards.length;
  _searchIndexCache = allCards.map(c => ({
    id: c.id,
    card: c,
    wordLower: (c.word || '').toLowerCase(),
    meaningLower: (c.meaning || '').toLowerCase(),
    ipaLower: (c.ipa || c.phonetic || '').toLowerCase(),
    defLower: (c.definition || c.def || '').toLowerCase(),
    exampleLower: (c.example || '').toLowerCase(),
    exampleViLower: (c.exampleVi || '').toLowerCase(),
    levelLower: (c.level || c.cefr || 'a1').toLowerCase(),
    posLower: (c.pos || '').toLowerCase(),
    topicIds: Array.isArray(c.topicIds) ? c.topicIds : []
  }));
  return _searchIndexCache;
}

// Lắng nghe sự kiện phát âm thanh để hiển thị hiệu ứng sóng âm trên nút
if (typeof window !== 'undefined') {
  onAudioPlayStateChange((isPlaying) => {
    if (!isPlaying) {
      document.querySelectorAll('.btn-row-sound.playing, .btn-modal-sound.playing').forEach(btn => btn.classList.remove('playing'));
    }
  });
}

/**
 * Định dạng trạng thái FSRS, hạn ôn tập và nhãn phân tầng trí nhớ
 */
function formatFSRSDueText(state, now = new Date()) {
  if (!state || state.state === State.New || state.state === 0 || !state.due) {
    return {
      statusClass: 'status-new',
      statusLabel: 'Chưa học',
      statusIcon: '✨',
      shortDueText: 'Mới',
      tierLabel: 'Chưa học',
      tierLevel: 0,
      dueFullText: 'Chưa có lịch ôn',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      interval: 0,
      dueDateFormatted: '—'
    };
  }

  const dueDate = new Date(state.due);
  const isDue = isCardDue(state, now);
  const s = Number(state.stability) || 0;
  const d = Number(state.difficulty) || 0;
  const reps = Number(state.reps) || 0;
  const lapses = Number(state.lapses) || 0;
  const interval = Number(state.scheduled_days) || 0;

  // Tính tier theo 5 cấp độ trí nhớ FSRS
  let tierLabel = 'Mức 1 (Mới học)';
  let tierLevel = 1;
  if (s >= 30) {
    tierLabel = 'Mức 5 (Ghi nhớ sâu)';
    tierLevel = 5;
  } else if (s >= 14) {
    tierLabel = 'Mức 4 (Bền vững)';
    tierLevel = 4;
  } else if (s >= 7) {
    tierLabel = 'Mức 3 (Trung hạn)';
    tierLevel = 3;
  } else if (s >= 3) {
    tierLabel = 'Mức 2 (Ngắn hạn)';
    tierLevel = 2;
  }

  const dueDay = dueDate.getDate().toString().padStart(2, '0');
  const dueMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0');
  const dueYear = dueDate.getFullYear();
  const dueDateFormatted = `${dueDay}/${dueMonth}/${dueYear}`;

  if (isDue) {
    return {
      statusClass: 'status-due',
      statusLabel: 'Cần ôn ngay',
      statusIcon: '⏰',
      shortDueText: 'Đến hạn',
      tierLabel,
      tierLevel,
      dueFullText: `Đã đến hạn ôn hôm nay (${dueDateFormatted})`,
      stability: s,
      difficulty: d,
      reps,
      lapses,
      interval,
      dueDateFormatted
    };
  }

  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let shortDueText = '';
  let dueFullText = '';

  if (diffDays <= 1) {
    shortDueText = 'Ngày mai';
    dueFullText = `Ngày mai (${dueDateFormatted})`;
  } else if (diffDays < 30) {
    shortDueText = `${diffDays} ngày nữa`;
    dueFullText = `Sau ${diffDays} ngày (${dueDateFormatted})`;
  } else if (diffDays < 365) {
    shortDueText = `${(diffDays / 30).toFixed(0)} tháng nữa`;
    dueFullText = `Sau ${(diffDays / 30).toFixed(1)} tháng (${dueDateFormatted})`;
  } else {
    shortDueText = dueDateFormatted;
    dueFullText = dueDateFormatted;
  }

  if (s >= MASTERY_STABILITY_THRESHOLD) {
    return {
      statusClass: 'status-mastered',
      statusLabel: 'Thuần thục (Mức 5)',
      statusIcon: '🏆',
      shortDueText,
      tierLabel,
      tierLevel,
      dueFullText,
      stability: s,
      difficulty: d,
      reps,
      lapses,
      interval,
      dueDateFormatted
    };
  }

  return {
    statusClass: 'status-learning',
    statusLabel: 'Đang nhớ',
    statusIcon: '🌱',
    shortDueText,
    tierLabel,
    tierLevel,
    dueFullText,
    stability: s,
    difficulty: d,
    reps,
    lapses,
    interval,
    dueDateFormatted
  };
}

/**
 * Kiểm tra xem có bộ lọc nào khác mặc định đang hoạt động không
 */
function isFilterActive() {
  return Boolean(
    _libState.searchQuery ||
    _libState.selectedCefr !== 'all' ||
    _libState.selectedPos !== 'all' ||
    _libState.selectedStatus !== 'all' ||
    _libState.selectedDeck !== 'all' ||
    _libState.sortBy !== 'due_asc' ||
    _libState.quickFilter !== 'all'
  );
}

/**
 * Khởi tạo và hiển thị toàn bộ giao diện màn hình Thư viện từ vựng
 */
export function renderLibraryTab(app) {
  const container = document.getElementById('tab-library');
  if (!container) return;

  const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
  const decks = app.deckManager ? app.deckManager.decks : [];

  // Tính toán số lượng cho Quick Chips
  const now = new Date();
  let dueCount = 0;
  let newCount = 0;
  let learningCount = 0;
  let hardCount = 0;
  let masteredCount = 0;

  for (let i = 0; i < allCards.length; i++) {
    const state = StorageManager.getCardState(allCards[i].id);
    const isNew = !state || state.state === 0 || state.state === State.New;
    if (isNew) {
      newCount++;
    } else {
      const isDue = isCardDue(state, now);
      const s = Number(state.stability) || 0;
      const d = Number(state.difficulty) || 0;
      const lapses = Number(state.lapses) || 0;

      if (isDue) dueCount++;
      if (s >= MASTERY_STABILITY_THRESHOLD) masteredCount++;
      else learningCount++;
      if (d >= 7 || lapses > 0) hardCount++;
    }
  }

  // Khung cấu trúc tinh gọn & tối ưu không gian hiển thị
  container.innerHTML = `
    <div class="library-container">
      <!-- 1. Header & Quick Filter Chips -->
      <div class="library-quick-chips-wrapper">
        <div class="library-quick-chips">
          <button class="lib-quick-chip ${_libState.quickFilter === 'all' && _libState.selectedStatus === 'all' ? 'active' : ''}" data-quick="all">
            <span>📚 Tất cả</span>
            <span class="chip-count">${allCards.length.toLocaleString('vi-VN')}</span>
          </button>
          <button class="lib-quick-chip ${_libState.quickFilter === 'due' || _libState.selectedStatus === 'due' ? 'active' : ''}" data-quick="due">
            <span>⏰ Cần ôn ngay</span>
            <span class="chip-count">${dueCount.toLocaleString('vi-VN')}</span>
          </button>
          <button class="lib-quick-chip ${_libState.quickFilter === 'new' || _libState.selectedStatus === 'new' ? 'active' : ''}" data-quick="new">
            <span>✨ Thẻ mới</span>
            <span class="chip-count">${newCount.toLocaleString('vi-VN')}</span>
          </button>
          <button class="lib-quick-chip ${_libState.quickFilter === 'learning' || _libState.selectedStatus === 'learning' ? 'active' : ''}" data-quick="learning">
            <span>🌱 Đang học</span>
            <span class="chip-count">${learningCount.toLocaleString('vi-VN')}</span>
          </button>
          <button class="lib-quick-chip ${_libState.quickFilter === 'hard' || _libState.selectedStatus === 'hard' ? 'active' : ''}" data-quick="hard">
            <span>⚠️ Từ khó / Hay quên</span>
            <span class="chip-count">${hardCount.toLocaleString('vi-VN')}</span>
          </button>
          <button class="lib-quick-chip ${_libState.quickFilter === 'mastered' || _libState.selectedStatus === 'mastered' ? 'active' : ''}" data-quick="mastered">
            <span>🏆 Thuần thục</span>
            <span class="chip-count">${masteredCount.toLocaleString('vi-VN')}</span>
          </button>
        </div>
      </div>

      <!-- 2. Main Search & Advanced Filter Grid -->
      <div class="library-controls-panel">
        <!-- Row 1: Search Input & Action Button -->
        <div class="library-search-action-row">
          <div class="library-search-wrapper">
            <span class="library-search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input 
              type="text" 
              id="lib-search-input" 
              class="library-search-input" 
              placeholder="Tìm kiếm theo từ, nghĩa tiếng Việt, IPA, câu ví dụ..." 
              value="${escapeHTML(_libState.searchQuery)}"
              autocomplete="off"
              spellcheck="false"
            />
            ${_libState.searchQuery ? `
              <button class="btn-clear-search" id="btn-clear-search" title="Xóa tìm kiếm">✕</button>
            ` : ''}
          </div>
          
          <button class="btn-library-study-compact" id="btn-lib-study-filtered" title="Bắt đầu phiên học với danh sách đang lọc">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span id="btn-lib-study-label">Học danh sách</span>
          </button>
        </div>

        <!-- Row 2: 5 Advanced Filter Selects Grid -->
        <div class="library-compact-filter-grid">
          <!-- Trình độ CEFR -->
          <div class="compact-select-wrapper">
            <span class="compact-select-icon">🎓</span>
            <select id="lib-cefr-select" class="compact-select" aria-label="Lọc theo trình độ CEFR">
              <option value="all" ${!_libState.selectedCefr || _libState.selectedCefr === 'all' ? 'selected' : ''}>Mọi trình độ (A1 - C1)</option>
              <option value="a1" ${_libState.selectedCefr === 'a1' ? 'selected' : ''}>A1 - Căn bản</option>
              <option value="a2" ${_libState.selectedCefr === 'a2' ? 'selected' : ''}>A2 - Sơ cấp</option>
              <option value="b1" ${_libState.selectedCefr === 'b1' ? 'selected' : ''}>B1 - Trung cấp</option>
              <option value="b2" ${_libState.selectedCefr === 'b2' ? 'selected' : ''}>B2 - Trung cao cấp</option>
              <option value="c1" ${_libState.selectedCefr === 'c1' ? 'selected' : ''}>C1 - Cao cấp</option>
            </select>
          </div>

          <!-- Loại từ (Part of Speech) -->
          <div class="compact-select-wrapper">
            <span class="compact-select-icon">🏷️</span>
            <select id="lib-pos-select" class="compact-select" aria-label="Lọc theo loại từ">
              <option value="all" ${!_libState.selectedPos || _libState.selectedPos === 'all' ? 'selected' : ''}>Mọi loại từ (All POS)</option>
              <option value="noun" ${_libState.selectedPos === 'noun' ? 'selected' : ''}>Danh từ (Noun)</option>
              <option value="verb" ${_libState.selectedPos === 'verb' ? 'selected' : ''}>Động từ (Verb)</option>
              <option value="adjective" ${_libState.selectedPos === 'adjective' ? 'selected' : ''}>Tính từ (Adjective)</option>
              <option value="adverb" ${_libState.selectedPos === 'adverb' ? 'selected' : ''}>Trạng từ (Adverb)</option>
              <option value="phrase" ${_libState.selectedPos === 'phrase' ? 'selected' : ''}>Cụm từ (Phrase)</option>
              <option value="phrasal verb" ${_libState.selectedPos === 'phrasal verb' ? 'selected' : ''}>Cụm động từ (Phrasal Verb)</option>
              <option value="idiom" ${_libState.selectedPos === 'idiom' ? 'selected' : ''}>Thành ngữ (Idiom)</option>
              <option value="preposition" ${_libState.selectedPos === 'preposition' ? 'selected' : ''}>Giới từ (Preposition)</option>
            </select>
          </div>

          <!-- Trạng thái Trí nhớ FSRS-6 & 5 Tầng Stability -->
          <div class="compact-select-wrapper">
            <span class="compact-select-icon">⚡</span>
            <select id="lib-status-select" class="compact-select" aria-label="Lọc theo trạng thái trí nhớ">
              <option value="all" ${!_libState.selectedStatus || _libState.selectedStatus === 'all' ? 'selected' : ''}>Mọi trạng thái FSRS</option>
              <option value="due" ${_libState.selectedStatus === 'due' ? 'selected' : ''}>⏰ Cần ôn ngay (Due)</option>
              <option value="new" ${_libState.selectedStatus === 'new' ? 'selected' : ''}>✨ Thẻ mới chưa học (New)</option>
              <option value="learning" ${_libState.selectedStatus === 'learning' ? 'selected' : ''}>🌱 Đang học (Learning)</option>
              <option value="hard" ${_libState.selectedStatus === 'hard' ? 'selected' : ''}>⚠️ Dễ quên / Hay lapsed</option>
              <option value="tier1" ${_libState.selectedStatus === 'tier1' ? 'selected' : ''}>📊 Mức 1: Mới học (S &lt; 3 ngày)</option>
              <option value="tier2" ${_libState.selectedStatus === 'tier2' ? 'selected' : ''}>📊 Mức 2: Ngắn hạn (3 ≤ S &lt; 7 ngày)</option>
              <option value="tier3" ${_libState.selectedStatus === 'tier3' ? 'selected' : ''}>📊 Mức 3: Trung hạn (7 ≤ S &lt; 14 ngày)</option>
              <option value="tier4" ${_libState.selectedStatus === 'tier4' ? 'selected' : ''}>📊 Mức 4: Bền vững (14 ≤ S &lt; 30 ngày)</option>
              <option value="tier5" ${_libState.selectedStatus === 'tier5' ? 'selected' : ''}>🏆 Mức 5: Ghi nhớ sâu (S ≥ 30 ngày)</option>
            </select>
          </div>

          <!-- Chủ đề (Decks / Topics) -->
          <div class="compact-select-wrapper">
            <span class="compact-select-icon">📚</span>
            <select id="lib-deck-select" class="compact-select" aria-label="Lọc theo chủ đề">
              <option value="all" ${_libState.selectedDeck === 'all' ? 'selected' : ''}>Tất cả chủ đề (${decks.length})</option>
              ${decks.map(d => `
                <option value="${escapeHTML(d.id)}" ${_libState.selectedDeck === d.id ? 'selected' : ''}>
                  ${escapeHTML(d.name || d.id)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Sắp xếp Đa chiều (Sorting) -->
          <div class="compact-select-wrapper">
            <span class="compact-select-icon">⇅</span>
            <select id="lib-sort-select" class="compact-select" aria-label="Sắp xếp danh sách">
              <option value="due_asc" ${_libState.sortBy === 'due_asc' ? 'selected' : ''}>Hạn ôn (Gần nhất trước)</option>
              <option value="due_desc" ${_libState.sortBy === 'due_desc' ? 'selected' : ''}>Hạn ôn (Xa nhất trước)</option>
              <option value="alpha_asc" ${_libState.sortBy === 'alpha_asc' ? 'selected' : ''}>Từ A ➔ Z</option>
              <option value="alpha_desc" ${_libState.sortBy === 'alpha_desc' ? 'selected' : ''}>Từ Z ➔ A</option>
              <option value="cefr_asc" ${_libState.sortBy === 'cefr_asc' ? 'selected' : ''}>Cấp độ (A1 ➔ C1)</option>
              <option value="cefr_desc" ${_libState.sortBy === 'cefr_desc' ? 'selected' : ''}>Cấp độ (C1 ➔ A1)</option>
              <option value="stability_desc" ${_libState.sortBy === 'stability_desc' ? 'selected' : ''}>Độ nhớ cao nhất (Stability ↓)</option>
              <option value="stability_asc" ${_libState.sortBy === 'stability_asc' ? 'selected' : ''}>Độ nhớ thấp nhất (Stability ↑)</option>
              <option value="difficulty_desc" ${_libState.sortBy === 'difficulty_desc' ? 'selected' : ''}>Độ khó cao nhất (Difficulty ↓)</option>
              <option value="reps_desc" ${_libState.sortBy === 'reps_desc' ? 'selected' : ''}>Ôn nhiều nhất (Reps ↓)</option>
            </select>
          </div>
        </div>

        <!-- Row 3: Filter Reset & Active Tag Bar -->
        ${isFilterActive() ? `
          <div class="library-active-filters-bar">
            <div class="active-filters-text">
              <span class="filter-indicator-dot"></span>
              Đang áp dụng bộ lọc nâng cao
            </div>
            <button class="btn-reset-filters" id="btn-reset-all-filters" title="Xóa tất cả bộ lọc về mặc định">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- 3. Meta & Pagination Summary Bar -->
      <div class="library-meta-bar">
        <div class="library-results-summary" id="lib-results-summary">
          Đang tải dữ liệu từ vựng...
        </div>
        <div class="library-meta-right">
          <select id="lib-pagesize-select" class="compact-pagesize-select" aria-label="Số lượng từ mỗi trang">
            <option value="15" ${_libState.pageSize === 15 ? 'selected' : ''}>15 từ / trang</option>
            <option value="20" ${_libState.pageSize === 20 ? 'selected' : ''}>20 từ / trang</option>
            <option value="50" ${_libState.pageSize === 50 ? 'selected' : ''}>50 từ / trang</option>
            <option value="100" ${_libState.pageSize === 100 ? 'selected' : ''}>100 từ / trang</option>
          </select>
          <div class="library-pagination-info" id="lib-pagination-info"></div>
        </div>
      </div>

      <!-- 4. Vocabulary Words Rows List Container (DocumentFragment Virtual Chunking) -->
      <div class="library-words-list" id="lib-words-list">
        <!-- Rendered dynamically -->
      </div>

      <!-- 5. Bottom Pagination Bar -->
      <div class="library-pagination-bar" id="lib-pagination-bar">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Gắn Event Listeners
  setupLibraryEventListeners(app);

  // Render danh sách từ vựng
  renderLibraryWords(app);
}

/**
 * Gắn các sự kiện tương tác cho View Thư viện
 */
function setupLibraryEventListeners(app) {
  const searchInput = document.getElementById('lib-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const selectCefr = document.getElementById('lib-cefr-select');
  const selectPos = document.getElementById('lib-pos-select');
  const selectStatus = document.getElementById('lib-status-select');
  const selectDeck = document.getElementById('lib-deck-select');
  const selectSort = document.getElementById('lib-sort-select');
  const selectPageSize = document.getElementById('lib-pagesize-select');
  const btnStudyFiltered = document.getElementById('btn-lib-study-filtered');
  const btnResetFilters = document.getElementById('btn-reset-all-filters');

  // Quick chips
  document.querySelectorAll('.lib-quick-chip').forEach(btn => {
    btn.onclick = () => {
      const q = btn.getAttribute('data-quick');
      _libState.quickFilter = q;
      _libState.selectedStatus = q;
      _libState.currentPage = 1;
      renderLibraryTab(app);
    };
  });

  // Search input với debounce 180ms
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        _libState.searchQuery = e.target.value.trim();
        _libState.currentPage = 1;
        renderLibraryWords(app);
        
        if (btnClearSearch) {
          btnClearSearch.style.display = _libState.searchQuery ? 'block' : 'none';
        }
      }, 180);
    });
  }

  // Nút xóa tìm kiếm
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        _libState.searchQuery = '';
        _libState.currentPage = 1;
        btnClearSearch.style.display = 'none';
        renderLibraryWords(app);
      }
    });
  }

  // CEFR select
  if (selectCefr) {
    selectCefr.addEventListener('change', (e) => {
      _libState.selectedCefr = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // POS select
  if (selectPos) {
    selectPos.addEventListener('change', (e) => {
      _libState.selectedPos = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // Status select
  if (selectStatus) {
    selectStatus.addEventListener('change', (e) => {
      _libState.selectedStatus = e.target.value || 'all';
      _libState.quickFilter = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // Deck selector
  if (selectDeck) {
    selectDeck.addEventListener('change', (e) => {
      _libState.selectedDeck = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // Sort selector
  if (selectSort) {
    selectSort.addEventListener('change', (e) => {
      _libState.sortBy = e.target.value || 'due_asc';
      renderLibraryWords(app);
    });
  }

  // Page size selector
  if (selectPageSize) {
    selectPageSize.addEventListener('change', (e) => {
      _libState.pageSize = parseInt(e.target.value, 10) || 20;
      _libState.currentPage = 1;
      renderLibraryWords(app);
    });
  }

  // Reset all filters button
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      _libState.searchQuery = '';
      _libState.selectedCefr = 'all';
      _libState.selectedPos = 'all';
      _libState.selectedStatus = 'all';
      _libState.selectedDeck = 'all';
      _libState.sortBy = 'due_asc';
      _libState.quickFilter = 'all';
      _libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  // Học nhanh danh sách từ đang lọc
  if (btnStudyFiltered) {
    btnStudyFiltered.addEventListener('click', () => {
      const filtered = getFilteredAndSortedCards(app);
      if (!filtered || filtered.length === 0) {
        if (app.showToast) app.showToast('Không có từ nào trong danh sách đang lọc để học.', 'info');
        return;
      }
      app.startStudySession(null, null, filtered.slice(0, 50));
    });
  }
}

const CEFR_ORDER = { a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 6 };

/**
 * Lọc và sắp xếp danh sách từ vựng theo State
 */
function getFilteredAndSortedCards(app) {
  if (!app.deckManager) return [];
  const allCards = app.deckManager.getAllCards();
  const searchIndex = buildSearchIndex(allCards);

  const now = new Date();
  const query = _libState.searchQuery.toLowerCase();
  const cefrFilter = _libState.selectedCefr.toLowerCase();
  const posFilter = _libState.selectedPos.toLowerCase();
  const statusFilter = _libState.selectedStatus;
  const deckFilter = _libState.selectedDeck;

  const filtered = [];

  for (let i = 0; i < searchIndex.length; i++) {
    const item = searchIndex[i];
    const c = item.card;

    // 1. Lọc theo Topic / Deck
    if (deckFilter !== 'all') {
      const inDeck = item.topicIds.some(tid => tid === deckFilter || tid.startsWith(deckFilter));
      if (!inDeck) continue;
    }

    // 2. Lọc theo CEFR level
    if (cefrFilter !== 'all' && item.levelLower !== cefrFilter) {
      continue;
    }

    // 3. Lọc theo POS (Loại từ)
    if (posFilter !== 'all' && item.posLower !== posFilter) {
      continue;
    }

    // 4. Lọc theo Trạng thái & Tầng Trí nhớ FSRS
    if (statusFilter !== 'all') {
      const state = StorageManager.getCardState(c.id);
      const isNew = !state || state.state === 0 || state.state === State.New;
      const isDue = isCardDue(state, now);
      const s = state ? (Number(state.stability) || 0) : 0;
      const d = state ? (Number(state.difficulty) || 0) : 0;
      const lapses = state ? (Number(state.lapses) || 0) : 0;

      if (statusFilter === 'due' && !isDue) continue;
      if (statusFilter === 'new' && !isNew) continue;
      if (statusFilter === 'learning' && (isNew || s >= MASTERY_STABILITY_THRESHOLD)) continue;
      if (statusFilter === 'mastered' && (isNew || s < MASTERY_STABILITY_THRESHOLD)) continue;
      if (statusFilter === 'hard' && (isNew || (d < 7 && lapses === 0))) continue;
      if (statusFilter === 'tier1' && (isNew || s >= 3)) continue;
      if (statusFilter === 'tier2' && (isNew || s < 3 || s >= 7)) continue;
      if (statusFilter === 'tier3' && (isNew || s < 7 || s >= 14)) continue;
      if (statusFilter === 'tier4' && (isNew || s < 14 || s >= 30)) continue;
      if (statusFilter === 'tier5' && (isNew || s < 30)) continue;
    }

    // 5. Lọc theo từ khóa tìm kiếm (Full-text index)
    if (query) {
      const match = item.wordLower.includes(query) ||
                    item.meaningLower.includes(query) ||
                    item.ipaLower.includes(query) ||
                    item.defLower.includes(query) ||
                    item.exampleLower.includes(query) ||
                    item.exampleViLower.includes(query);
      if (!match) continue;
    }

    filtered.push(c);
  }

  // 6. Sắp xếp danh sách (Sorting)
  filtered.sort((a, b) => {
    const stateA = StorageManager.getCardState(a.id);
    const stateB = StorageManager.getCardState(b.id);

    if (_libState.sortBy === 'due_asc') {
      const isDueA = isCardDue(stateA, now) ? 1 : 0;
      const isDueB = isCardDue(stateB, now) ? 1 : 0;
      if (isDueA !== isDueB) return isDueB - isDueA; // Thẻ đến hạn ưu tiên đầu
      const dueA = stateA?.due ? new Date(stateA.due).getTime() : Infinity;
      const dueB = stateB?.due ? new Date(stateB.due).getTime() : Infinity;
      return dueA - dueB;
    } else if (_libState.sortBy === 'due_desc') {
      const dueA = stateA?.due ? new Date(stateA.due).getTime() : 0;
      const dueB = stateB?.due ? new Date(stateB.due).getTime() : 0;
      return dueB - dueA;
    } else if (_libState.sortBy === 'cefr_asc') {
      const orderA = CEFR_ORDER[(a.cefr || a.level || 'a1').toLowerCase()] || 1;
      const orderB = CEFR_ORDER[(b.cefr || b.level || 'a1').toLowerCase()] || 1;
      return orderA - orderB;
    } else if (_libState.sortBy === 'cefr_desc') {
      const orderA = CEFR_ORDER[(a.cefr || a.level || 'a1').toLowerCase()] || 1;
      const orderB = CEFR_ORDER[(b.cefr || b.level || 'a1').toLowerCase()] || 1;
      return orderB - orderA;
    } else if (_libState.sortBy === 'stability_desc') {
      const sA = stateA?.stability || 0;
      const sB = stateB?.stability || 0;
      return sB - sA;
    } else if (_libState.sortBy === 'stability_asc') {
      const sA = stateA?.stability || 0;
      const sB = stateB?.stability || 0;
      return sA - sB;
    } else if (_libState.sortBy === 'difficulty_desc') {
      const dA = stateA?.difficulty || 0;
      const dB = stateB?.difficulty || 0;
      return dB - dA;
    } else if (_libState.sortBy === 'reps_desc') {
      const rA = stateA?.reps || 0;
      const rB = stateB?.reps || 0;
      return rB - rA;
    } else if (_libState.sortBy === 'alpha_desc') {
      return (b.word || '').localeCompare(a.word || '');
    } else {
      // alpha_asc
      return (a.word || '').localeCompare(b.word || '');
    }
  });

  return filtered;
}

/**
 * Hiển thị danh sách từ vựng dạng 1 dòng/từ kèm phân trang siêu nhẹ
 */
function renderLibraryWords(app) {
  const listContainer = document.getElementById('lib-words-list');
  const resultsSummary = document.getElementById('lib-results-summary');
  const paginationInfo = document.getElementById('lib-pagination-info');
  const btnStudyLabel = document.getElementById('btn-lib-study-label');

  if (!listContainer) return;

  const totalAllCards = app.deckManager ? app.deckManager.getAllCards().length : 0;
  const filteredCards = getFilteredAndSortedCards(app);
  const totalFiltered = filteredCards.length;
  const pageSize = _libState.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  
  if (_libState.currentPage > totalPages) {
    _libState.currentPage = totalPages;
  }
  const currentPage = _libState.currentPage;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const pageCards = filteredCards.slice(startIndex, endIndex);

  // Cập nhật số lượng trên nút Học
  if (btnStudyLabel) {
    btnStudyLabel.textContent = `Học (${Math.min(50, totalFiltered)})`;
  }

  // Cập nhật Summary & Pagination Info
  if (resultsSummary) {
    resultsSummary.innerHTML = `
      <span>Hiển thị <strong>${totalFiltered.toLocaleString('vi-VN')}</strong> / ${totalAllCards.toLocaleString('vi-VN')} từ</span>
      ${_libState.searchQuery ? `<span class="filter-badge-keyword">"${escapeHTML(_libState.searchQuery)}"</span>` : ''}
    `;
  }

  if (paginationInfo) {
    paginationInfo.textContent = totalFiltered > 0 
      ? `Trang ${currentPage} / ${totalPages}`
      : 'Không có dữ liệu';
  }

  // Nếu không có kết quả
  if (totalFiltered === 0) {
    listContainer.innerHTML = `
      <div class="library-empty-state">
        <span class="library-empty-icon">🔍</span>
        <h3 class="library-empty-title">Không tìm thấy từ vựng nào</h3>
        <p class="library-empty-desc">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại các bộ lọc bên trên.</p>
        <button class="btn-clear-empty-filter" id="btn-empty-reset">
          🔄 Đặt lại tất cả bộ lọc
        </button>
      </div>
    `;
    const btnEmptyReset = document.getElementById('btn-empty-reset');
    if (btnEmptyReset) {
      btnEmptyReset.onclick = () => {
        _libState.searchQuery = '';
        _libState.selectedCefr = 'all';
        _libState.selectedPos = 'all';
        _libState.selectedStatus = 'all';
        _libState.selectedDeck = 'all';
        _libState.sortBy = 'due_asc';
        _libState.quickFilter = 'all';
        _libState.currentPage = 1;
        renderLibraryTab(app);
      };
    }
    renderPaginationBar(app, totalPages, currentPage);
    return;
  }

  // Render Virtual Chunk thông qua DocumentFragment (Zero-Lag DOM injection)
  const now = new Date();
  const frag = document.createDocumentFragment();

  pageCards.forEach(card => {
    const state = StorageManager.getCardState(card.id);
    const fsrs = formatFSRSDueText(state, now);
    const cefr = (card.cefr || card.level || 'a1').toLowerCase();
    const phonetic = card.phonetic || card.ipa || '';
    const pos = card.pos || '';

    const rowEl = document.createElement('div');
    rowEl.className = 'library-word-row';
    rowEl.setAttribute('data-card-id', card.id);
    rowEl.setAttribute('tabindex', '0');
    rowEl.setAttribute('role', 'button');
    rowEl.setAttribute('aria-label', `Xem chi tiết từ ${card.word}`);

    rowEl.innerHTML = `
      <!-- Cột 1: Nút phát âm thanh -->
      <button class="btn-row-sound" title="Phát âm từ vựng" aria-label="Phát âm ${escapeHTML(card.word)}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      </button>

      <!-- Cột 2: Nội dung chính từ vựng (Từ, IPA, POS & Nghĩa) -->
      <div class="library-row-main">
        <div class="library-row-header-group">
          <span class="library-row-word">${escapeHTML(card.word || '')}</span>
          ${phonetic ? `<span class="library-row-ipa">${escapeHTML(phonetic)}</span>` : ''}
          <span class="badge-cefr badge-cefr-sm" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
          ${pos ? `<span class="badge-pos-tag">${escapeHTML(pos)}</span>` : ''}
        </div>
        <div class="library-row-meaning">${escapeHTML(card.meaning || '')}</div>
      </div>

      <!-- Cột 3: Trạng thái FSRS & Hạn ôn tập -->
      <div class="library-row-status-wrap">
        <span class="library-status-pill ${fsrs.statusClass}" title="${escapeHTML(fsrs.dueFullText)}">
          <span class="status-dot"></span>
          <span class="status-label-text">${fsrs.statusLabel}</span>
        </span>
        <span class="library-due-hint">${fsrs.shortDueText}</span>
      </div>

      <!-- Cột 4: Mũi tên xem chi tiết -->
      <div class="library-row-chevron" title="Xem chi tiết từ vựng">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    `;

    // Gắn sự kiện âm thanh
    const soundBtn = rowEl.querySelector('.btn-row-sound');
    if (soundBtn) {
      soundBtn.onclick = (e) => {
        e.stopPropagation();
        soundBtn.classList.add('playing');
        speak(card.word, { cardObj: card });
      };
    }

    // Click cả hàng để mở Word Detail Modal
    rowEl.onclick = (e) => {
      if (e.target.closest('.btn-row-sound')) return;
      openWordDetailModal(card, app);
    };

    rowEl.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWordDetailModal(card, app);
      }
    };

    frag.appendChild(rowEl);
  });

  listContainer.innerHTML = '';
  listContainer.appendChild(frag);

  // Hiển thị thanh phân trang
  renderPaginationBar(app, totalPages, currentPage);
}

/**
 * Hiển thị thanh điều hướng phân trang (Pagination Bar)
 */
function renderPaginationBar(app, totalPages, currentPage) {
  const paginationBar = document.getElementById('lib-pagination-bar');
  if (!paginationBar) return;

  if (totalPages <= 1) {
    paginationBar.innerHTML = '';
    return;
  }

  let html = `
    <button class="btn-page-nav" id="btn-page-prev" ${currentPage === 1 ? 'disabled' : ''}>
      ◀ Trước
    </button>
    <div class="pagination-pages-list">
  `;

  // Tạo dải số trang thông minh
  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pageNumbers.includes(i)) pageNumbers.push(i);
    }

    if (currentPage < totalPages - 2) pageNumbers.push('...');
    if (!pageNumbers.includes(totalPages)) pageNumbers.push(totalPages);
  }

  pageNumbers.forEach(p => {
    if (p === '...') {
      html += `<span class="pagination-ellipsis">...</span>`;
    } else {
      html += `<button class="btn-page-num ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
  });

  html += `
    </div>
    <button class="btn-page-nav" id="btn-page-next" ${currentPage === totalPages ? 'disabled' : ''}>
      Sau ▶
    </button>
  `;

  paginationBar.innerHTML = html;

  // Gắn sự kiện phân trang
  const btnPrev = document.getElementById('btn-page-prev');
  const btnNext = document.getElementById('btn-page-next');

  if (btnPrev) {
    btnPrev.onclick = () => {
      if (_libState.currentPage > 1) {
        _libState.currentPage--;
        renderLibraryWords(app);
        scrollToTop();
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      if (_libState.currentPage < totalPages) {
        _libState.currentPage++;
        renderLibraryWords(app);
        scrollToTop();
      }
    };
  }

  paginationBar.querySelectorAll('.btn-page-num').forEach(btn => {
    btn.onclick = () => {
      const page = parseInt(btn.getAttribute('data-page'), 10);
      if (page && page !== _libState.currentPage) {
        _libState.currentPage = page;
        renderLibraryWords(app);
        scrollToTop();
      }
    };
  });
}

/**
 * Mở Modal Popup Chi Tiết Từ Vựng Đầy Đủ (Word Detail Modal)
 */
export function openWordDetailModal(card, app) {
  if (!card) return;

  let modal = document.getElementById('word-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'word-detail-modal';
    modal.className = 'word-detail-modal-overlay';
    document.body.appendChild(modal);
  }

  const now = new Date();
  const state = StorageManager.getCardState(card.id);
  const fsrsInfo = formatFSRSDueText(state, now);
  const cefr = (card.cefr || card.level || 'A1').toLowerCase();
  const pos = (card.pos || 'word').toUpperCase();
  const imgSrc = card.img || card.image || '';
  const phonetic = card.phonetic || card.ipa || '';

  // Render Modal HTML
  modal.innerHTML = `
    <div class="word-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-word-title">
      <!-- Modal Header -->
      <div class="word-detail-header">
        <div class="word-detail-header-tags">
          <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
          <span class="badge-pos">${escapeHTML(pos)}</span>
        </div>
        <button class="btn-detail-close" id="btn-close-word-modal" title="Đóng (Esc)" aria-label="Đóng">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="word-detail-body">
        <!-- 1. Hero Area: Image & Word Head -->
        <div class="word-detail-hero">
          ${imgSrc ? `
            <div class="word-detail-image-wrap" id="detail-img-wrap" title="Nhấn để xem ảnh">
              <img src="${escapeHTML(imgSrc)}" class="word-detail-img" alt="${escapeHTML(card.word)}" loading="eager" />
            </div>
          ` : ''}

          <div class="word-detail-headline">
            <h2 class="word-detail-title" id="modal-word-title">${escapeHTML(card.word || '')}</h2>
            ${phonetic ? `<div class="word-detail-ipa">${escapeHTML(phonetic)}</div>` : ''}

            <!-- Dual Audio Pronunciation Buttons -->
            <div class="word-detail-audio-row">
              <button class="btn-modal-sound btn-sound-us" id="btn-sound-us" title="Phát âm chuẩn Mỹ (US)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                <span>US (Mỹ)</span>
              </button>
              <button class="btn-modal-sound btn-sound-uk" id="btn-sound-uk" title="Phát âm chuẩn Anh (UK)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <span>UK (Anh)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Meaning & Definition Box -->
        <div class="word-detail-section meaning-box">
          <div class="section-label">Nghĩa tiếng Việt:</div>
          <div class="word-detail-meaning-text">${escapeHTML(card.meaning || '')}</div>
          
          ${card.definition || card.def ? `
            <div class="section-label def-label">Định nghĩa tiếng Anh:</div>
            <div class="word-detail-def-text">${escapeHTML(card.definition || card.def)}</div>
          ` : ''}
        </div>

        <!-- 3. Example Sentences -->
        ${card.example ? `
          <div class="word-detail-section example-box">
            <div class="section-label">Ví dụ câu thực tế:</div>
            <div class="word-detail-example-en">"${escapeHTML(card.example)}"</div>
            ${card.exampleVi ? `<div class="word-detail-example-vi">${escapeHTML(card.exampleVi)}</div>` : ''}
          </div>
        ` : ''}

        <!-- 4. FSRS Spaced Repetition Analytics Box -->
        <div class="word-detail-section fsrs-stats-box">
          <div class="fsrs-box-header">
            <div class="fsrs-box-title">
              <span class="fsrs-icon">🧠</span> Tiến trình Trí nhớ FSRS-6
            </div>
            <span class="fsrs-tier-pill tier-${fsrsInfo.tierLevel}">
              ${fsrsInfo.tierLabel}
            </span>
          </div>

          <div class="fsrs-stats-grid">
            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Trạng thái</div>
              <div class="fsrs-stat-value">
                <span class="fsrs-status-tag ${fsrsInfo.statusClass}">
                  ${fsrsInfo.statusIcon} ${fsrsInfo.statusLabel}
                </span>
              </div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Hạn ôn tập tiếp theo</div>
              <div class="fsrs-stat-value highlight">${escapeHTML(fsrsInfo.dueFullText)}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Độ bền (Stability S)</div>
              <div class="fsrs-stat-value">${fsrsInfo.stability > 0 ? `${fsrsInfo.stability.toFixed(1)} ngày` : 'Chưa học'}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Độ khó (Difficulty D)</div>
              <div class="fsrs-stat-value">${fsrsInfo.difficulty > 0 ? `${fsrsInfo.difficulty.toFixed(1)} / 10` : 'Chưa học'}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Số lần đã ôn</div>
              <div class="fsrs-stat-value">${fsrsInfo.reps} lần (Quên: ${fsrsInfo.lapses})</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Khoảng cách lịch ôn</div>
              <div class="fsrs-stat-value">${fsrsInfo.interval > 0 ? `${fsrsInfo.interval} ngày` : 'Mặc định'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer CTA -->
      <div class="word-detail-footer">
        <button class="btn-modal-study-now" id="btn-modal-study-single">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Học Thẻ Này Ngay</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Sự kiện đóng Modal
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const btnClose = document.getElementById('btn-close-word-modal');
  if (btnClose) btnClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Nút phát âm US
  const btnUS = document.getElementById('btn-sound-us');
  if (btnUS) {
    btnUS.onclick = () => {
      btnUS.classList.add('playing');
      speak(card.word, { lang: 'en-US', cardObj: card });
    };
  }

  // Nút phát âm UK
  const btnUK = document.getElementById('btn-sound-uk');
  if (btnUK) {
    btnUK.onclick = () => {
      btnUK.classList.add('playing');
      speak(card.word, { lang: 'en-GB', cardObj: card });
    };
  }

  // Nút học ngay thẻ này
  const btnStudySingle = document.getElementById('btn-modal-study-single');
  if (btnStudySingle) {
    btnStudySingle.onclick = () => {
      closeModal();
      app.startStudySession(null, null, [card]);
    };
  }
}
