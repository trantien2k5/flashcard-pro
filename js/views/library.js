/**
 * Thư Viện Từ Vựng - Quản lý toàn diện kho từ vựng & Hệ thống bộ lọc FSRS-6 chuyên sâu
 * Tối ưu hóa giao diện tinh gọn, thanh lịch (Modern Clean UI) & Zero-Lag DOM.
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
  currentPage: 1
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
      statusLabel: 'Mới',
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
      statusLabel: 'Thuần thục',
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
    _libState.sortBy !== 'due_asc'
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

  const hasActiveFilter = isFilterActive();

  // Danh mục nhãn hiển thị cho active chips
  const cefrLabels = { a1: 'A1 - Căn bản', a2: 'A2 - Sơ cấp', b1: 'B1 - Trung cấp', b2: 'B2 - Trung cao cấp', c1: 'C1 - Cao cấp' };
  const posLabels = {
    noun: 'Danh từ (n)',
    verb: 'Động từ (v)',
    adjective: 'Tính từ (adj)',
    adverb: 'Trạng từ (adv)',
    phrase: 'Cụm từ (phrase)',
    'phrasal verb': 'Cụm động từ (phrasal verb)',
    idiom: 'Thành ngữ (idiom)',
    preposition: 'Giới từ (prep)'
  };
  const statusLabels = {
    due: '⏰ Cần ôn',
    new: '✨ Chưa học',
    learning: '🌱 Đang học',
    hard: '⚠️ Hay quên',
    mastered: '🏆 Thuần thục'
  };

  const selectedDeckObj = decks.find(d => d.id === _libState.selectedDeck);
  const deckLabel = selectedDeckObj ? (selectedDeckObj.name || selectedDeckObj.id) : _libState.selectedDeck;

  // Khung cấu trúc tinh gọn & tối ưu không gian hiển thị (Clean Modern Design)
  container.innerHTML = `
    <div class="library-container">
      <!-- 1. Search Bar & Action Row -->
      <div class="library-top-bar">
        <div class="library-search-wrapper">
          <span class="library-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input 
            type="text" 
            id="lib-search-input" 
            class="library-search-input" 
            placeholder="Tìm từ vựng, nghĩa tiếng Việt, IPA..." 
            value="${escapeHTML(_libState.searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          />
          ${_libState.searchQuery ? `
            <button class="btn-clear-search" id="btn-clear-search" title="Xóa tìm kiếm">✕</button>
          ` : ''}
        </div>
        
        <button class="btn-library-study-compact" id="btn-lib-study-filtered" title="Bắt đầu học danh sách từ đang lọc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span id="btn-lib-study-label">Học (${allCards.length})</span>
        </button>
      </div>

      <!-- 2. Row 1: Trạng thái FSRS (Quick Status Pills) -->
      <div class="library-pills-bar-wrapper">
        <div class="library-pills-scroll">
          <button class="filter-pill ${_libState.selectedStatus === 'all' ? 'active' : ''}" data-status="all">
            <span>Tất cả</span>
            <span class="pill-badge">${allCards.length.toLocaleString('vi-VN')}</span>
          </button>

          <button class="filter-pill ${_libState.selectedStatus === 'new' ? 'active' : ''}" data-status="new">
            <span>✨ Chưa học</span>
            <span class="pill-badge">${newCount.toLocaleString('vi-VN')}</span>
          </button>

          <button class="filter-pill ${_libState.selectedStatus === 'due' ? 'active' : ''}" data-status="due">
            <span>⏰ Cần ôn</span>
            <span class="pill-badge">${dueCount}</span>
          </button>

          <button class="filter-pill ${_libState.selectedStatus === 'learning' ? 'active' : ''}" data-status="learning">
            <span>🌱 Đang học</span>
            <span class="pill-badge">${learningCount}</span>
          </button>

          <button class="filter-pill ${_libState.selectedStatus === 'hard' ? 'active' : ''}" data-status="hard">
            <span>⚠️ Hay quên</span>
            <span class="pill-badge">${hardCount}</span>
          </button>

          <button class="filter-pill ${_libState.selectedStatus === 'mastered' ? 'active' : ''}" data-status="mastered">
            <span>🏆 Thuần thục</span>
            <span class="pill-badge">${masteredCount}</span>
          </button>
        </div>
      </div>

      <!-- 3. Row 2: Bộ lọc Chuyên sâu Song song (Trình độ, Loại từ, Chủ đề, Sắp xếp) -->
      <div class="library-criteria-bar-wrapper">
        <div class="library-criteria-scroll">
          <!-- Dropdown Pill: Trình độ CEFR -->
          <div class="filter-pill-select-wrapper ${_libState.selectedCefr !== 'all' ? 'active' : ''}">
            <span>🎓</span>
            <select id="lib-cefr-select" class="filter-pill-select" aria-label="Lọc theo trình độ CEFR">
              <option value="all" ${_libState.selectedCefr === 'all' ? 'selected' : ''}>Trình độ (Tất cả)</option>
              <option value="a1" ${_libState.selectedCefr === 'a1' ? 'selected' : ''}>A1 - Căn bản</option>
              <option value="a2" ${_libState.selectedCefr === 'a2' ? 'selected' : ''}>A2 - Sơ cấp</option>
              <option value="b1" ${_libState.selectedCefr === 'b1' ? 'selected' : ''}>B1 - Trung cấp</option>
              <option value="b2" ${_libState.selectedCefr === 'b2' ? 'selected' : ''}>B2 - Trung cao cấp</option>
              <option value="c1" ${_libState.selectedCefr === 'c1' ? 'selected' : ''}>C1 - Cao cấp</option>
            </select>
          </div>

          <!-- Dropdown Pill: Loại từ POS -->
          <div class="filter-pill-select-wrapper ${_libState.selectedPos !== 'all' ? 'active' : ''}">
            <span>🏷️</span>
            <select id="lib-pos-select" class="filter-pill-select" aria-label="Lọc theo loại từ">
              <option value="all" ${_libState.selectedPos === 'all' ? 'selected' : ''}>Loại từ (Tất cả)</option>
              <option value="noun" ${_libState.selectedPos === 'noun' ? 'selected' : ''}>Danh từ (n)</option>
              <option value="verb" ${_libState.selectedPos === 'verb' ? 'selected' : ''}>Động từ (v)</option>
              <option value="adjective" ${_libState.selectedPos === 'adjective' ? 'selected' : ''}>Tính từ (adj)</option>
              <option value="adverb" ${_libState.selectedPos === 'adverb' ? 'selected' : ''}>Trạng từ (adv)</option>
              <option value="phrase" ${_libState.selectedPos === 'phrase' ? 'selected' : ''}>Cụm từ (phrase)</option>
              <option value="phrasal verb" ${_libState.selectedPos === 'phrasal verb' ? 'selected' : ''}>Cụm động từ (phrasal verb)</option>
              <option value="idiom" ${_libState.selectedPos === 'idiom' ? 'selected' : ''}>Thành ngữ (idiom)</option>
              <option value="preposition" ${_libState.selectedPos === 'preposition' ? 'selected' : ''}>Giới từ (prep)</option>
            </select>
          </div>

          <!-- Dropdown Pill: Chủ đề -->
          <div class="filter-pill-select-wrapper ${_libState.selectedDeck !== 'all' ? 'active' : ''}">
            <span>📚</span>
            <select id="lib-deck-select" class="filter-pill-select" aria-label="Lọc theo chủ đề">
              <option value="all" ${_libState.selectedDeck === 'all' ? 'selected' : ''}>Chủ đề (${decks.length})</option>
              ${decks.map(d => `
                <option value="${escapeHTML(d.id)}" ${_libState.selectedDeck === d.id ? 'selected' : ''}>
                  ${escapeHTML(d.name || d.id)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Dropdown Pill: Sắp xếp -->
          <div class="filter-pill-select-wrapper ${_libState.sortBy !== 'due_asc' ? 'active' : ''}">
            <span>⇅</span>
            <select id="lib-sort-select" class="filter-pill-select" aria-label="Sắp xếp danh sách">
              <option value="due_asc" ${_libState.sortBy === 'due_asc' ? 'selected' : ''}>Hạn ôn (Gần nhất)</option>
              <option value="due_desc" ${_libState.sortBy === 'due_desc' ? 'selected' : ''}>Hạn ôn (Xa nhất)</option>
              <option value="alpha_asc" ${_libState.sortBy === 'alpha_asc' ? 'selected' : ''}>Từ A ➔ Z</option>
              <option value="alpha_desc" ${_libState.sortBy === 'alpha_desc' ? 'selected' : ''}>Từ Z ➔ A</option>
              <option value="cefr_asc" ${_libState.sortBy === 'cefr_asc' ? 'selected' : ''}>Cấp độ (A1 ➔ C1)</option>
              <option value="stability_desc" ${_libState.sortBy === 'stability_desc' ? 'selected' : ''}>Độ nhớ cao nhất</option>
              <option value="difficulty_desc" ${_libState.sortBy === 'difficulty_desc' ? 'selected' : ''}>Độ khó cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 4. Active Filter Tags Bar (Hiển thị các tiêu chí lọc đang kết hợp song song) -->
      ${hasActiveFilter ? `
        <div class="library-active-tags-bar">
          <span class="active-tags-title">Đang lọc:</span>
          <div class="active-tags-list">
            ${_libState.selectedStatus !== 'all' ? `
              <span class="active-tag-chip" data-clear="status">
                <span>${escapeHTML(statusLabels[_libState.selectedStatus] || _libState.selectedStatus)}</span>
                <span class="tag-chip-remove" title="Bỏ lọc trạng thái">✕</span>
              </span>
            ` : ''}
            ${_libState.selectedCefr !== 'all' ? `
              <span class="active-tag-chip" data-clear="cefr">
                <span>🎓 ${escapeHTML(cefrLabels[_libState.selectedCefr] || _libState.selectedCefr.toUpperCase())}</span>
                <span class="tag-chip-remove" title="Bỏ lọc trình độ">✕</span>
              </span>
            ` : ''}
            ${_libState.selectedPos !== 'all' ? `
              <span class="active-tag-chip" data-clear="pos">
                <span>🏷️ ${escapeHTML(posLabels[_libState.selectedPos] || _libState.selectedPos)}</span>
                <span class="tag-chip-remove" title="Bỏ lọc loại từ">✕</span>
              </span>
            ` : ''}
            ${_libState.selectedDeck !== 'all' ? `
              <span class="active-tag-chip" data-clear="deck">
                <span>📚 ${escapeHTML(deckLabel)}</span>
                <span class="tag-chip-remove" title="Bỏ lọc chủ đề">✕</span>
              </span>
            ` : ''}
            ${_libState.searchQuery ? `
              <span class="active-tag-chip" data-clear="search">
                <span>🔍 "${escapeHTML(_libState.searchQuery)}"</span>
                <span class="tag-chip-remove" title="Bỏ từ khóa tìm kiếm">✕</span>
              </span>
            ` : ''}
            <button class="btn-pill-reset" id="btn-reset-all-filters" title="Xóa toàn bộ bộ lọc">
              <span>✕ Đặt lại tất cả</span>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 5. Meta & Pagination Sub-Bar -->
      <div class="library-meta-bar">
        <div class="library-results-summary" id="lib-results-summary">
          <span><strong>${allCards.length.toLocaleString('vi-VN')}</strong> từ vựng</span>
        </div>
        <div class="library-meta-right">
          <select id="lib-pagesize-select" class="compact-pagesize-select" aria-label="Số lượng từ mỗi trang">
            <option value="20" ${_libState.pageSize === 20 ? 'selected' : ''}>20 từ / trang</option>
            <option value="50" ${_libState.pageSize === 50 ? 'selected' : ''}>50 từ / trang</option>
            <option value="100" ${_libState.pageSize === 100 ? 'selected' : ''}>100 từ / trang</option>
          </select>
          <div class="library-pagination-info" id="lib-pagination-info"></div>
        </div>
      </div>

      <!-- 6. Vocabulary Words Rows List Container (DocumentFragment Virtual Chunking) -->
      <div class="library-words-list" id="lib-words-list">
        <!-- Rendered dynamically -->
      </div>

      <!-- 7. Bottom Pagination Bar -->
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
  const selectDeck = document.getElementById('lib-deck-select');
  const selectSort = document.getElementById('lib-sort-select');
  const selectPageSize = document.getElementById('lib-pagesize-select');
  const btnStudyFiltered = document.getElementById('btn-lib-study-filtered');
  const btnResetFilters = document.getElementById('btn-reset-all-filters');

  // Quick Status Pills
  document.querySelectorAll('.filter-pill[data-status]').forEach(btn => {
    btn.onclick = () => {
      const status = btn.getAttribute('data-status');
      _libState.selectedStatus = status;
      _libState.currentPage = 1;
      renderLibraryTab(app);
    };
  });

  // Individual active tag chip remove buttons
  document.querySelectorAll('.active-tag-chip[data-clear]').forEach(chip => {
    chip.onclick = () => {
      const clearTarget = chip.getAttribute('data-clear');
      if (clearTarget === 'status') _libState.selectedStatus = 'all';
      else if (clearTarget === 'cefr') _libState.selectedCefr = 'all';
      else if (clearTarget === 'pos') _libState.selectedPos = 'all';
      else if (clearTarget === 'deck') _libState.selectedDeck = 'all';
      else if (clearTarget === 'search') _libState.searchQuery = '';
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
      renderLibraryTab(app);
    });
  }

  // POS select
  if (selectPos) {
    selectPos.addEventListener('change', (e) => {
      _libState.selectedPos = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  // Deck selector
  if (selectDeck) {
    selectDeck.addEventListener('change', (e) => {
      _libState.selectedDeck = e.target.value || 'all';
      _libState.currentPage = 1;
      renderLibraryTab(app);
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
      _libState.currentPage = 1;
      renderLibraryTab(app);
    });
  }

  // Học nhanh danh sách từ đang lọc (Học toàn bộ không giới hạn)
  if (btnStudyFiltered) {
    btnStudyFiltered.addEventListener('click', () => {
      const filtered = getFilteredAndSortedCards(app);
      if (!filtered || filtered.length === 0) {
        if (app.showToast) app.showToast('Không có từ nào trong danh sách đang lọc để học.', 'info');
        return;
      }
      app.startStudySession(null, null, filtered);
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
      const inDeck = item.topicIds.some(tid => tid === deckFilter || tid.startsWith(deckFilter)) ||
                     (c.deckId && (c.deckId === deckFilter || c.deckId.startsWith(deckFilter)));
      if (!inDeck) continue;
    }

    // 2. Lọc theo CEFR level
    if (cefrFilter !== 'all' && item.levelLower !== cefrFilter) {
      continue;
    }

    // 3. Lọc theo POS (Loại từ - Khớp chuẩn hóa đa dạng)
    if (posFilter !== 'all') {
      const p = item.posLower;
      let matchesPos = false;
      if (posFilter === 'noun') {
        matchesPos = p.includes('noun') || p === 'n';
      } else if (posFilter === 'verb') {
        matchesPos = (p.includes('verb') && !p.includes('phrasal')) || p === 'v';
      } else if (posFilter === 'adjective' || posFilter === 'adj') {
        matchesPos = p.includes('adj') || p.includes('adjective') || p === 'a';
      } else if (posFilter === 'adverb' || posFilter === 'adv') {
        matchesPos = p.includes('adv') || p.includes('adverb');
      } else if (posFilter === 'phrase') {
        matchesPos = p.includes('phrase') || p.includes('idiom') || p.includes('expression');
      } else if (posFilter === 'phrasal verb' || posFilter === 'phrasal') {
        matchesPos = p.includes('phrasal');
      } else if (posFilter === 'idiom') {
        matchesPos = p.includes('idiom');
      } else if (posFilter === 'preposition' || posFilter === 'prep') {
        matchesPos = p.includes('prep');
      } else {
        matchesPos = p.includes(posFilter);
      }
      if (!matchesPos) continue;
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
 * Hiển thị danh sách từ vựng dạng 1 dòng/từ siêu gọn đẹp kèm phân trang
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

  // Cập nhật số lượng trên nút Học (Hiển thị toàn bộ số từ đang lọc)
  if (btnStudyLabel) {
    btnStudyLabel.textContent = `Học (${totalFiltered.toLocaleString('vi-VN')})`;
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
        <p class="library-empty-desc">Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm đặt lại bộ lọc.</p>
        <button class="btn-clear-empty-filter" id="btn-empty-reset">
          🔄 Đặt lại bộ lọc
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

function formatShortPos(pos) {
  if (!pos) return '';
  const p = String(pos).toLowerCase().trim();
  if (p === 'noun' || p === 'n') return 'n.';
  if (p === 'verb' || p === 'v') return 'v.';
  if (p === 'adjective' || p === 'adj' || p === 'a') return 'adj.';
  if (p === 'adverb' || p === 'adv') return 'adv.';
  if (p === 'phrasal verb' || p === 'phrasal') return 'phr v.';
  if (p === 'phrase') return 'phr.';
  if (p === 'idiom') return 'idiom';
  if (p === 'preposition' || p === 'prep') return 'prep.';
  return p;
}

  pageCards.forEach(card => {
    const state = StorageManager.getCardState(card.id);
    const fsrs = formatFSRSDueText(state, now);
    const cefr = (card.cefr || card.level || 'a1').toUpperCase();
    const phonetic = card.phonetic || card.ipa || '';
    const shortPos = formatShortPos(card.pos);

    const rowEl = document.createElement('div');
    rowEl.className = 'library-word-row';
    rowEl.setAttribute('data-card-id', card.id);
    rowEl.setAttribute('tabindex', '0');
    rowEl.setAttribute('role', 'button');
    rowEl.setAttribute('aria-label', `Xem chi tiết từ ${card.word}`);

    rowEl.innerHTML = `
      <!-- Cột 1: Nút phát âm thanh mini -->
      <button class="btn-row-sound" title="Phát âm từ vựng" aria-label="Phát âm ${escapeHTML(card.word)}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      </button>

      <!-- Cột 2: Nội dung chính từ vựng -->
      <div class="library-row-main">
        <div class="library-row-top-line">
          <span class="library-row-word">${escapeHTML(card.word || '')}</span>
          ${phonetic ? `<span class="library-row-ipa">${escapeHTML(phonetic)}</span>` : ''}
          <span class="badge-cefr-mini" data-cefr="${cefr.toLowerCase()}">${cefr}</span>
          ${shortPos ? `<span class="library-pos-text">${escapeHTML(shortPos)}</span>` : ''}
        </div>
        <div class="library-row-meaning">${escapeHTML(card.meaning || '')}</div>
      </div>

      <!-- Cột 3: Trạng thái FSRS & Chevron -->
      <div class="library-row-end">
        <span class="library-status-badge ${fsrs.statusClass}">
          <span class="status-dot"></span>
          <span>${fsrs.shortDueText}</span>
        </span>
        <svg class="library-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
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
      ◀
    </button>
    <div class="pagination-pages-list">
  `;

  // Tạo dải số trang thông minh
  const pageNumbers = [];
  if (totalPages <= 5) {
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
      ▶
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
