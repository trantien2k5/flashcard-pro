/**
 * Facebook-Style Vocabulary Newsfeed (Lướt Từ Vựng Kiểu Facebook)
 * Trải nghiệm lướt từ vựng gây nghiện tương tự bảng tin Facebook:
 * - Mỗi từ vựng là 1 bài viết Facebook đầy đủ (Tích xanh, Tác giả, Thời gian, Menu 3 chấm)
 * - Tên từ vựng, Loại từ, Phiên âm IPA, 2 nút phát âm US / UK bản ngữ độc lập
 * - Nghĩa tiếng Việt (Có chế độ che mờ thử thách trí nhớ), Định nghĩa tiếng Anh
 * - Ảnh đính kèm bài viết Facebook hoặc Phông nền màu Status bắt mắt
 * - Trích dẫn câu ví dụ ngữ cảnh có highlight từ vựng + Nút nghe đọc cả câu
 * - Thanh tương tác chuẩn FB: Like 👍 (thả tim), Comment 💬 (ghi chú cá nhân), Share ↗️, Bookmark 🔖
 * - Thanh đánh giá FSRS-6 khoa học (Quên, Khó, Tốt, Dễ) lưu ngay vào IndexedDB/Storage
 * - Nút bộ lọc nhỏ gọn trên cùng: Lọc theo Cấp độ (A1-C1), Chủ đề (Topics), Trạng thái (FSRS)
 * - Cuộn vô tận (Infinite Newsfeed Scrolling) mượt mà tối ưu cao.
 */

import { FSRS, Rating, State, isCardDue } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { WORDS, WORDS_MAP, TOPICS } from '../../data/index.js';
import { escapeHTML, shuffle } from '../utils.js';
import { speak, stopAudio, unlockAudioContext, preloadWordAudio } from '../services/audio.js';
import { preloadCardImage } from '../core/session.js';

// ==========================================
// STATE MANAGEMENT
// ==========================================
let _fbApp = null;
let _fbQueue = [];
let _feedContainer = null;
let _mainContentEl = null;
let _renderedCount = 0;
const BATCH_SIZE = 12;

function getMainContentEl() {
  if (!_mainContentEl || !_mainContentEl.isConnected) {
    _mainContentEl = document.getElementById('main-content');
  }
  return _mainContentEl;
}

// Filter State
let _fbFilter = {
  level: 'all',     // 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  topicId: 'all',   // 'all' | topicId
  status: 'mixed',  // 'mixed' | 'due' | 'new' | 'bookmarked' | 'hard'
  autoAudio: true,  // Tự động phát âm khi lướt
  blurMeaning: false // Che nghĩa tiếng Việt mặc định
};

// User Interactions Cache
let _likedWordIds = new Set();
let _bookmarkedWordIds = new Set();
let _wordComments = {}; // { [wordId]: string[] }

// Observers & Timers
let _activeObserver = null;
let _scrollTimeout = null;
let _speechDebounceTimer = null;
let _lastSpokenWordId = null;

// ==========================================
// PERSISTENCE HELPERS
// ==========================================
function loadUserInteractions() {
  try {
    const rawLiked = localStorage.getItem('fb_liked_word_ids');
    if (rawLiked) _likedWordIds = new Set(JSON.parse(rawLiked));
  } catch (e) {
    _likedWordIds = new Set();
  }

  try {
    const rawBm = localStorage.getItem('fb_bookmarked_ids') || localStorage.getItem('reels_bookmarked_ids');
    if (rawBm) _bookmarkedWordIds = new Set(JSON.parse(rawBm));
  } catch (e) {
    _bookmarkedWordIds = new Set();
  }

  try {
    const rawCm = localStorage.getItem('fb_word_comments');
    if (rawCm) _wordComments = JSON.parse(rawCm);
  } catch (e) {
    _wordComments = {};
  }

  try {
    const rawFilter = localStorage.getItem('fb_feed_filter_v2');
    if (rawFilter) {
      const parsed = JSON.parse(rawFilter);
      _fbFilter = { ..._fbFilter, ...parsed };
    }
  } catch (e) {}
}

function saveUserInteractions() {
  try {
    localStorage.setItem('fb_liked_word_ids', JSON.stringify([..._likedWordIds]));
    localStorage.setItem('fb_bookmarked_ids', JSON.stringify([..._bookmarkedWordIds]));
    localStorage.setItem('fb_word_comments', JSON.stringify(_wordComments));
    localStorage.setItem('fb_feed_filter_v2', JSON.stringify(_fbFilter));
  } catch (e) {}
}

// ==========================================
// QUEUE BUILDER (SMART FACEBOOK FEED)
// ==========================================
function buildSmartFeedQueue(app, filter = _fbFilter) {
  const allWords = Array.isArray(WORDS) && WORDS.length > 0 ? WORDS : [];
  const cardStates = StorageManager.getAllCardStates() || {};
  const now = new Date();

  // 1. Lọc theo Level CEFR
  let filtered = allWords;
  if (filter.level && filter.level !== 'all') {
    const targetLvl = filter.level.toUpperCase();
    filtered = filtered.filter(w => (w.level || '').toUpperCase() === targetLvl);
  }

  // 2. Lọc theo Chủ đề (Topic)
  if (filter.topicId && filter.topicId !== 'all') {
    filtered = filtered.filter(w => Array.isArray(w.topicIds) && w.topicIds.some(t => t.startsWith(filter.topicId)));
  }

  // 3. Phân loại theo FSRS State
  const dueList = [];
  const newList = [];
  const reviewList = [];
  const bookmarkedList = [];
  const hardList = [];

  for (let i = 0; i < filtered.length; i++) {
    const word = filtered[i];
    const state = cardStates[word.id] || StorageManager.getCardState(word.id);

    if (state && state.suspended && filter.status !== 'hard') continue;

    const isBookmarked = _bookmarkedWordIds.has(word.id);
    if (isBookmarked) bookmarkedList.push({ ...word, fsrsState: state });

    const isNew = (!state || state.state === State.New || state.state === 0) &&
                  (!state || !state.reps || state.reps === 0);

    if (isNew) {
      newList.push({ ...word, fsrsState: state || FSRS.createEmptyCard(word.id) });
    } else if (isCardDue(state, now)) {
      dueList.push({ ...word, fsrsState: state });
    } else {
      reviewList.push({ ...word, fsrsState: state });
    }

    if (state && (state.lapses >= 3 || state.difficulty >= 7)) {
      hardList.push({ ...word, fsrsState: state });
    }
  }

  shuffle(newList);
  shuffle(dueList);
  shuffle(reviewList);
  shuffle(bookmarkedList);
  shuffle(hardList);

  let result = [];

  if (filter.status === 'due') {
    result = dueList.length > 0 ? dueList : reviewList;
  } else if (filter.status === 'new') {
    result = newList.length > 0 ? newList : filtered;
  } else if (filter.status === 'bookmarked') {
    result = bookmarkedList.length > 0 ? bookmarkedList : filtered;
  } else if (filter.status === 'hard') {
    result = hardList.length > 0 ? hardList : dueList;
  } else {
    // Chế độ Mặc định 'mixed' - Trộn thông minh Newsfeed tự nhiên
    let d = 0, n = 0, r = 0;
    while (d < dueList.length || n < newList.length || r < reviewList.length) {
      if (d < dueList.length) result.push(dueList[d++]);
      if (n < newList.length) result.push(newList[n++]);
      if (d < dueList.length) result.push(dueList[d++]);
      if (r < reviewList.length) result.push(reviewList[r++]);
      if (result.length >= 250) break;
    }
    if (result.length === 0) {
      result = [...filtered];
      shuffle(result);
    }
  }

  return result.length > 0 ? result : allWords.slice(0, 30);
}

// ==========================================
// STRING & HTML HELPERS
// ==========================================
function highlightTargetWord(sentence, targetWord) {
  if (!sentence) return '';
  if (!targetWord) return escapeHTML(sentence);
  const clean = targetWord.trim();
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escaped}\\w*)\\b`, 'gi');
  if (regex.test(sentence)) {
    return escapeHTML(sentence).replace(regex, '<mark>$1</mark>');
  }
  return escapeHTML(sentence);
}

// Sinh Avatar Gradient ngẫu nhiên đẹp mắt (Dùng CSS Tokens để tương thích Theme)
function getGradientForWord(wordText) {
  const gradients = [
    'linear-gradient(135deg, var(--primary), var(--accent))',
    'linear-gradient(135deg, var(--primary-light), var(--primary))',
    'linear-gradient(135deg, var(--fsrs-again), var(--fsrs-hard))',
    'linear-gradient(135deg, var(--fsrs-good), var(--accent))',
    'linear-gradient(135deg, var(--fsrs-hard), var(--primary-light))'
  ];
  let hash = 0;
  for (let i = 0; i < (wordText || '').length; i++) {
    hash = wordText.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// ==========================================
// RENDER 1 FACEBOOK POST CARD
// ==========================================
function renderFacebookPostCardHTML(card, index) {
  const isLiked = _likedWordIds.has(card.id);
  const isBookmarked = _bookmarkedWordIds.has(card.id);
  const cefr = (card.level || 'A1').toUpperCase();
  const pos = (card.pos || 'word').toLowerCase();
  const ipa = card.ipa || card.phonetic || '';
  const wordText = card.word || '';
  const meaningText = card.meaning || '';
  const definitionEn = card.definition || '';
  const exampleEn = highlightTargetWord(card.example || '', card.word);
  const exampleVi = card.exampleVi || '';
  const imgSrc = card.img || '';
  const hasImg = imgSrc && imgSrc.length > 5;
  const isBlur = _fbFilter.blurMeaning;

  // Lấy danh sách comments cá nhân của từ
  const comments = _wordComments[card.id] || [];

  // Trạng thái FSRS
  const state = card.fsrsState || StorageManager.getCardState(card.id);
  const reps = state?.reps || 0;
  const stability = state?.stability ? Math.round(state.stability * 10) / 10 : 0;
  const timeDesc = reps > 0 ? `Đã ôn ${reps} lần • Độ bền: ${stability}d` : 'Từ mới gợi ý cho bạn';

  return `
    <article class="fb-post-card" data-index="${index}" data-id="${card.id}" id="fb-post-${card.id}">
      <!-- 1. Post Header (Tác giả, Tích xanh, Cấp độ, Thời gian, Menu 3 chấm) -->
      <header class="fb-post-header">
        <div class="fb-post-author-group" data-action="speak-word-us">
          <div class="fb-story-ring">
            <div class="fb-post-avatar" style="background: ${getGradientForWord(wordText)};">
              ${cefr}
            </div>
          </div>
          <div class="fb-post-author-info">
            <div class="fb-author-row">
              <span class="fb-author-name">Flashcard Pro</span>
              <svg class="fb-verified-tick" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z"/>
              </svg>
              <span class="fb-author-level-tag level-tag-${cefr.toLowerCase()}">${cefr}</span>
            </div>
            <div class="fb-post-meta">
              <span>${timeDesc}</span>
              <span>•</span>
              <span class="fb-privacy-icon" title="Công khai">🌐</span>
            </div>
          </div>
        </div>

        <button type="button" class="fb-post-menu-btn" data-action="open-post-menu" title="Tùy chọn bài viết">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </header>

      <!-- 2. Post Body Content -->
      <div class="fb-post-body">
        <!-- Word Headline & POS -->
        <div class="fb-word-headline-row">
          <h2 class="fb-word-title">${escapeHTML(wordText)}</h2>
          ${pos ? `<span class="fb-word-pos-badge">${escapeHTML(pos)}</span>` : ''}
        </div>

        <!-- Pronunciation Strip: IPA & 2 Loa US / UK riêng biệt -->
        <div class="fb-pronounce-strip">
          ${ipa ? `<span class="fb-ipa-pill">${escapeHTML(ipa)}</span>` : ''}
          <div class="fb-audio-btn-group">
            <button type="button" class="fb-btn-accent-audio" data-action="speak-word-us" title="Nghe phát âm chuẩn Anh - Mỹ (US)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>🇺🇸 US</span>
            </button>
            <button type="button" class="fb-btn-accent-audio" data-action="speak-word-uk" title="Nghe phát âm chuẩn Anh - Anh (UK)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>🇬🇧 UK</span>
            </button>
          </div>
        </div>

        <!-- Khung nghĩa tiếng Việt (Bấm để che/hiện) -->
        <div class="fb-meaning-box ${isBlur ? 'is-blurred' : ''}" data-action="toggle-meaning-blur" title="Bấm để ẩn / hiện nghĩa tiếng Việt">
          <div class="fb-meaning-main-text">${escapeHTML(meaningText)}</div>
          <div class="fb-meaning-blur-hint">
            <span>👁️ Chạm để xem nghĩa</span>
          </div>
        </div>

        <!-- English Definition -->
        ${definitionEn ? `
          <div class="fb-definition-en">
            <em>💡 ${escapeHTML(definitionEn)}</em>
          </div>
        ` : ''}

        <!-- Post Image hoặc Colored Status Background -->
        ${hasImg ? `
          <div class="fb-post-image-wrap" data-action="speak-word-us">
            <img class="fb-post-img" src="${imgSrc}" alt="${escapeHTML(wordText)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none';" />
          </div>
        ` : `
          <div class="fb-post-colored-status" style="background: ${getGradientForWord(wordText)};" data-action="speak-word-us">
            <div class="fb-colored-word">${escapeHTML(wordText)}</div>
            <div class="fb-colored-meaning">${escapeHTML(meaningText)}</div>
          </div>
        `}

        <!-- Context Quote Card (Câu ví dụ song ngữ) -->
        ${card.example ? `
          <div class="fb-context-quote-card">
            <div class="fb-quote-header">
              <span class="fb-quote-label">📖 Ví dụ trong ngữ cảnh</span>
              <button type="button" class="fb-btn-listen-quote" data-action="speak-example" title="Nghe câu ví dụ">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <span>Nghe câu</span>
              </button>
            </div>
            <div class="fb-example-en">${exampleEn}</div>
            ${exampleVi ? `<div class="fb-example-vi">${escapeHTML(exampleVi)}</div>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- 3. Reaction Stats Count Row (👍 ❤️ 💡 Bạn và 2.5K người khác) -->
      <div class="fb-stats-counter-row">
        <div class="fb-reaction-cluster">
          <div class="fb-reaction-icons">
            <span class="fb-reaction-bubble fb-bubble-like">👍</span>
            <span class="fb-reaction-bubble fb-bubble-love">❤️</span>
            <span class="fb-reaction-bubble fb-bubble-care">💡</span>
          </div>
          <span class="fb-like-count-text">${isLiked ? 'Bạn và 2.5K người khác' : '2.5K người khác'}</span>
        </div>
        <div class="fb-stats-right-text">
          <span class="fb-comment-count-text">${comments.length} ghi chú</span>
          <span>•</span>
          <span>FSRS-6</span>
        </div>
      </div>

      <!-- 4. Facebook Action Bar (Thích - Bình luận - Chia sẻ - Lưu) -->
      <div class="fb-action-bar">
        <button type="button" class="fb-action-btn ${isLiked ? 'is-liked' : ''}" data-action="toggle-like" title="Thích từ vựng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span>Thích</span>
        </button>

        <button type="button" class="fb-action-btn" data-action="toggle-comments" title="Ghi chú & Bình luận">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Bình luận</span>
        </button>

        <button type="button" class="fb-action-btn" data-action="share-word" title="Chia sẻ bài viết">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Chia sẻ</span>
        </button>

        <button type="button" class="fb-action-btn ${isBookmarked ? 'is-bookmarked' : ''}" data-action="toggle-bookmark" title="Lưu từ vào bộ sưu tập">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Lưu</span>
        </button>
      </div>

      <!-- 5. FSRS-6 Quick Scientific Rating Bar (Khoa học ghi nhớ ngắt quãng) -->
      <div class="fb-fsrs-rating-bar">
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-again" data-rating="1" title="Chưa nhớ - Ôn lại sớm">
          <span class="fb-fsrs-label">❌ Quên</span>
          <span class="fb-fsrs-desc">Học lại</span>
        </button>
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-hard" data-rating="2" title="Hơi khó nhớ">
          <span class="fb-fsrs-label">⏳ Khó</span>
          <span class="fb-fsrs-desc">Ôn sớm</span>
        </button>
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-good" data-rating="3" title="Nhớ tốt">
          <span class="fb-fsrs-label">✨ Tốt</span>
          <span class="fb-fsrs-desc">Chuẩn hạn</span>
        </button>
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-easy" data-rating="4" title="Rất dễ nhớ">
          <span class="fb-fsrs-label">💎 Dễ</span>
          <span class="fb-fsrs-desc">Nhớ sâu</span>
        </button>
      </div>

      <!-- 6. Comments & Notes Drawer -->
      <div class="fb-comments-drawer" id="fb-comments-${card.id}">
        <div class="fb-comment-list" id="fb-comment-list-${card.id}">
          ${comments.map(c => `
            <div class="fb-comment-item">
              <div class="fb-comment-avatar">Me</div>
              <div class="fb-comment-bubble">
                <div class="fb-comment-author">Ghi chú của bạn</div>
                <div>${escapeHTML(c)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="fb-comment-input-row">
          <input type="text" class="fb-comment-input" placeholder="Viết ghi chú / ví dụ riêng cho từ này..." />
          <button type="button" class="fb-btn-send-comment" data-action="submit-comment" title="Gửi ghi chú">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

// ==========================================
// RENDER BỘ LỌC TỪ VỰNG MODAL / BOTTOM SHEET
// ==========================================
function renderFilterModalHTML() {
  const rootTopics = Array.isArray(TOPICS) ? TOPICS.filter(t => !t.parentId) : [];

  return `
    <div class="fb-filter-modal-backdrop" id="fb-filter-modal">
      <div class="fb-filter-sheet">
        <div class="fb-filter-header">
          <div class="fb-filter-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Bộ Lọc Nội Dung Lướt Từ</span>
          </div>
          <button type="button" class="fb-btn-circle" id="fb-filter-close-btn" title="Đóng bộ lọc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="fb-filter-body">
          <!-- 1. Cấp độ CEFR -->
          <div>
            <div class="fb-filter-group-title">🏷️ Cấp độ CEFR</div>
            <div class="fb-filter-chips-row" id="filter-level-chips">
              <button type="button" class="fb-filter-chip ${_fbFilter.level === 'all' ? 'active' : ''}" data-level="all">Tất cả Cấp độ</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.level === 'A1' ? 'active' : ''}" data-level="A1">A1 Căn bản</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.level === 'A2' ? 'active' : ''}" data-level="A2">A2 Sơ cấp</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.level === 'B1' ? 'active' : ''}" data-level="B1">B1 Trung cấp</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.level === 'B2' ? 'active' : ''}" data-level="B2">B2 Nâng cao</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.level === 'C1' ? 'active' : ''}" data-level="C1">C1 Chuyên sâu</button>
            </div>
          </div>

          <!-- 2. Trạng thái học FSRS -->
          <div>
            <div class="fb-filter-group-title">🎯 Thuật toán & Trạng thái</div>
            <div class="fb-filter-chips-row" id="filter-status-chips">
              <button type="button" class="fb-filter-chip ${_fbFilter.status === 'mixed' ? 'active' : ''}" data-status="mixed">🔀 Trộn Thông Minh (FB Feed)</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.status === 'due' ? 'active' : ''}" data-status="due">⏰ Đến Hạn Ôn (FSRS Due)</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.status === 'new' ? 'active' : ''}" data-status="new">✨ Từ Mới Chưa Học</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.status === 'bookmarked' ? 'active' : ''}" data-status="bookmarked">⭐ Đã Lưu / Yêu Thích</button>
              <button type="button" class="fb-filter-chip ${_fbFilter.status === 'hard' ? 'active' : ''}" data-status="hard">🧠 Từ Khó / Hay Quên</button>
            </div>
          </div>

          <!-- 3. Chủ đề từ vựng -->
          <div>
            <div class="fb-filter-group-title">📚 Chủ đề từ vựng</div>
            <select class="fb-filter-select" id="filter-topic-select">
              <option value="all" ${_fbFilter.topicId === 'all' ? 'selected' : ''}>Tất cả chủ đề từ vựng (Toàn bộ kho từ)</option>
              ${rootTopics.map(t => `
                <option value="${t.id}" ${_fbFilter.topicId === t.id ? 'selected' : ''}>
                  ${t.icon || '📖'} ${escapeHTML(t.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- 4. Cài đặt hiển thị & phát âm -->
          <div>
            <div class="fb-filter-group-title">⚙️ Cài đặt lướt bảng tin</div>
            <div class="fb-filter-toggle-row">
              <div class="fb-filter-toggle-label">
                <span class="fb-filter-toggle-name">🔊 Tự động phát âm khi lướt</span>
                <span class="fb-filter-toggle-desc">Tự phát âm từ vựng khi bài viết trượt vào màn hình</span>
              </div>
              <label class="fb-switch">
                <input type="checkbox" id="filter-toggle-audio" ${_fbFilter.autoAudio ? 'checked' : ''}>
                <span class="fb-slider"></span>
              </label>
            </div>

            <div class="fb-filter-toggle-row">
              <div class="fb-filter-toggle-label">
                <span class="fb-filter-toggle-name">👁️ Che nghĩa tiếng Việt mặc định</span>
                <span class="fb-filter-toggle-desc">Làm mờ nghĩa để bạn tự đoán trước khi chạm xem</span>
              </div>
              <label class="fb-switch">
                <input type="checkbox" id="filter-toggle-blur" ${_fbFilter.blurMeaning ? 'checked' : ''}>
                <span class="fb-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="fb-filter-footer">
          <button type="button" class="fb-btn-reset-filter" id="fb-filter-reset-btn">Đặt lại</button>
          <button type="button" class="fb-btn-apply-filter" id="fb-filter-apply-btn">Áp dụng bộ lọc</button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// HIỆU ỨNG TIM BAY & REACTION FLOATING
// ==========================================
function spawnFloatingReaction(x, y, emoji = '❤️') {
  const el = document.createElement('div');
  el.className = 'fb-floating-reaction';
  el.textContent = emoji;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ==========================================
// INFINITE FEED OBSERVER & BATCHING
// ==========================================
function appendNextBatch() {
  if (!_feedContainer || _renderedCount >= _fbQueue.length) return;

  const nextBatch = _fbQueue.slice(_renderedCount, _renderedCount + BATCH_SIZE);
  if (nextBatch.length === 0) return;

  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');

  nextBatch.forEach((card, idx) => {
    temp.innerHTML = renderFacebookPostCardHTML(card, _renderedCount + idx);
    const child = temp.firstElementChild;
    if (child) {
      frag.appendChild(child);
      if (_activeObserver) _activeObserver.observe(child);
    }
  });

  _feedContainer.appendChild(frag);
  _renderedCount += nextBatch.length;

  // Cập nhật nhãn bộ lọc
  updateFilterPillLabel();
}

function updateFilterPillLabel() {
  const labelEl = document.getElementById('fb-filter-pill-text');
  if (!labelEl) return;
  const parts = [];
  if (_fbFilter.level !== 'all') parts.push(_fbFilter.level);
  if (_fbFilter.status !== 'mixed') {
    const statusMap = { due: 'Cần ôn', new: 'Từ mới', bookmarked: 'Đã lưu', hard: 'Từ khó' };
    parts.push(statusMap[_fbFilter.status] || _fbFilter.status);
  }
  labelEl.textContent = parts.length > 0 ? `Lọc: ${parts.join(' • ')}` : 'Bộ lọc';
}

function setupFeedIntersectionObserver() {
  if (_activeObserver) {
    _activeObserver.disconnect();
  }

  _activeObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
        const cardId = entry.target.getAttribute('data-id');
        const card = WORDS_MAP.get(cardId);
        if (card) {
          handleCardInView(card);
        }
      }
    }
  }, {
    root: null,
    threshold: 0.55
  });

  if (_feedContainer) {
    const cards = _feedContainer.querySelectorAll('.fb-post-card');
    cards.forEach(card => _activeObserver.observe(card));
  }
}

function handleCardInView(card) {
  if (!card || card.id === _lastSpokenWordId) return;

  // Preload âm thanh và ảnh
  preloadWordAudio(card.word, 'us', card);
  if (card.img) preloadCardImage(card.img);

  // Tự động phát âm nếu bật
  if (_fbFilter.autoAudio) {
    if (_speechDebounceTimer) clearTimeout(_speechDebounceTimer);
    _speechDebounceTimer = setTimeout(() => {
      _lastSpokenWordId = card.id;
      speak(card.word, { accent: 'us', cardObj: card });
    }, 280);
  }
}

/**
 * Phát âm bài viết nằm chính giữa màn hình sau khi dừng lướt (Scroll Settled)
 * Ngăn chặn tuyệt đối việc phát âm chồng chéo khi vuốt nhanh
 */
function checkAndPronounceCenterCard() {
  const reelsTab = document.getElementById('tab-reels');
  if (!reelsTab || !reelsTab.classList.contains('active')) return;
  if (!_feedContainer || !_fbFilter.autoAudio) return;
  const centerY = window.innerHeight / 2;

  const cards = _feedContainer.querySelectorAll('.fb-post-card');
  let closestCard = null;
  let minDistance = Infinity;

  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    if (rect.bottom < 40 || rect.top > window.innerHeight - 40) continue;
    const cardCenter = rect.top + rect.height / 2;
    const dist = Math.abs(cardCenter - centerY);
    if (dist < minDistance) {
      minDistance = dist;
      closestCard = cards[i];
    }
  }

  if (closestCard) {
    const cardId = closestCard.getAttribute('data-id');
    const card = WORDS_MAP.get(cardId);
    if (card && card.id !== _lastSpokenWordId) {
      _lastSpokenWordId = card.id;
      speak(card.word, { accent: 'us', cardObj: card });
    }
  }
}

// ==========================================
// RATING FSRS-6 HANDLER
// ==========================================
function handleRateCardFSRS(cardId, rating, sourceEl) {
  const card = WORDS_MAP.get(cardId);
  if (!card) return;

  // Hiệu ứng hạt biểu tượng bay lên
  if (sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    const emojis = { [Rating.Again]: '❌', [Rating.Hard]: '⏳', [Rating.Good]: '✨', [Rating.Easy]: '💎' };
    spawnFloatingReaction(rect.left + rect.width / 2, rect.top, emojis[rating] || '✨');
  }

  // Haptic feedback
  try {
    if (rating === Rating.Again) {
      navigator.vibrate?.(25);
    } else {
      navigator.vibrate?.(12);
    }
  } catch (e) {}

  try {
    const fsrs = new FSRS({
      w: _fbApp?.settings?.fsrsW,
      requestRetention: _fbApp?.settings?.requestRetention || 0.90,
      enableFuzz: _fbApp?.settings?.enableFuzz !== false,
      leechThreshold: _fbApp?.settings?.leechThreshold || 8,
      leechAction: _fbApp?.settings?.leechAction || 'suspend'
    });

    const now = new Date();
    const { oldState, nextState } = StorageManager.applyCardReview({
      card,
      rating,
      fsrsInstance: fsrs,
      settings: _fbApp?.settings,
      now,
      logExtra: {
        isReels: true
      }
    });

    // Cập nhật giao diện thẻ vừa đánh giá
    const postEl = document.getElementById(`fb-post-${card.id}`);
    if (postEl) {
      const metaSpan = postEl.querySelector('.fb-post-meta span:first-child');
      if (metaSpan) {
        metaSpan.textContent = `Đã ôn ${nextState.reps} lần • Độ bền: ${Math.round(nextState.stability * 10) / 10}d`;
      }
      postEl.style.transition = 'box-shadow 0.25s ease';
      postEl.style.boxShadow = '0 0 0 2px var(--fb-primary)';
      setTimeout(() => {
        postEl.style.boxShadow = '';
      }, 600);
    }

    _fbApp?.showToast(`Đã ghi nhận FSRS: ${rating === 1 ? 'Again' : rating === 2 ? 'Hard' : rating === 3 ? 'Good' : 'Easy'}`, 'success', 1200);
  } catch (err) {
    console.warn('Lỗi ghi nhận FSRS trong FB Feed:', err);
  }
}

// ==========================================
// FILTER DIALOG LOGIC
// ==========================================
function openFilterModal() {
  const modal = document.getElementById('fb-filter-modal');
  if (modal) modal.classList.add('is-open');
}

function closeFilterModal() {
  const modal = document.getElementById('fb-filter-modal');
  if (modal) modal.classList.remove('is-open');
}

function applyCurrentFilter() {
  closeFilterModal();
  saveUserInteractions();

  // Tái tạo hàng đợi với bộ lọc mới
  _fbQueue = buildSmartFeedQueue(_fbApp, _fbFilter);
  _renderedCount = 0;
  _lastSpokenWordId = null;

  if (_feedContainer) {
    _feedContainer.innerHTML = '';
    appendNextBatch();
    setupFeedIntersectionObserver();
    const mainEl = getMainContentEl();
    if (mainEl) mainEl.scrollTop = 0;
    _feedContainer.scrollTop = 0;
    window.scrollTo({ top: 0 });
  }

  updateFilterPillLabel();
  _fbApp?.showToast(`Đã áp dụng bộ lọc: ${_fbQueue.length} từ vựng phù hợp`, 'info', 1800);
}

// ==========================================
// PAUSE, CLOSE & CLEANUP
// ==========================================
export function pauseReelsSession() {
  if (_activeObserver) {
    _activeObserver.disconnect();
    _activeObserver = null;
  }
  if (_speechDebounceTimer) {
    clearTimeout(_speechDebounceTimer);
    _speechDebounceTimer = null;
  }
  if (_scrollTimeout) {
    clearTimeout(_scrollTimeout);
    _scrollTimeout = null;
  }
  stopAudio();
}

// ==========================================
// MAIN ENTRY POINT (TAB LƯỚT TỪ VỰNG - FIRST-CLASS TAB)
// ==========================================
export function renderReelsTab(app, customQueue = null, options = {}) {
  _fbApp = app || (typeof window !== 'undefined' ? window.app : null);
  unlockAudioContext();
  loadUserInteractions();

  const mountTarget = document.getElementById('tab-reels');
  if (!mountTarget) {
    console.error('Không tìm thấy #tab-reels trong DOM.');
    return;
  }

  // Nếu bài viết đã được dựng sẵn và không bị buộc reload, chỉ cần re-attach observer
  const existingFeed = mountTarget.querySelector('#fb-feed-container');
  if (existingFeed && existingFeed.children.length > 1 && !customQueue && !options?.forceReload) {
    _feedContainer = existingFeed;
    setupFeedIntersectionObserver();
    return;
  }

  if (Array.isArray(customQueue) && customQueue.length > 0) {
    _fbQueue = [...customQueue];
  } else {
    _fbQueue = buildSmartFeedQueue(_fbApp, _fbFilter);
  }

  if (!_fbQueue || _fbQueue.length === 0) {
    mountTarget.innerHTML = `
      <div class="fb-feed-stage" style="padding: 40px 20px; text-align: center;">
        <h3 style="color: var(--fb-text-main); margin-bottom: 12px;">🎉 Bạn đã xem hết từ vựng!</h3>
        <p style="color: var(--fb-text-sub); margin-bottom: 20px;">Không có từ nào phù hợp với bộ lọc hiện tại.</p>
        <button type="button" class="fb-btn-accent-audio" id="fb-btn-empty-reset" style="margin: 0 auto; padding: 10px 20px;">
          Đặt lại bộ lọc
        </button>
      </div>
    `;
    const btnReset = mountTarget.querySelector('#fb-btn-empty-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        _fbFilter = { level: 'all', topicId: 'all', status: 'mixed', autoAudio: true, blurMeaning: false };
        saveUserInteractions();
        renderReelsTab(_fbApp, null, { forceReload: true });
      };
    }
    return;
  }

  mountTarget.innerHTML = `
    <div class="fb-feed-stage">
      <!-- 1. Facebook Top App Bar (Header - Không nút back, dính trên cùng) -->
      <header class="fb-top-header">
        <div class="fb-header-left">
          <div class="fb-brand-title">
            <span>facebook</span>
            <span class="fb-brand-badge">Feed</span>
          </div>
        </div>

        <div class="fb-header-right">
          <!-- Nút nhỏ bấm chọn bộ lọc từ vựng trên cùng (theo yêu cầu) -->
          <button type="button" class="fb-btn-filter-pill" id="fb-btn-filter-pill" title="Mở bộ lọc nội dung từ vựng">
            <span class="fb-filter-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </span>
            <span id="fb-filter-pill-text">Bộ lọc</span>
            <span class="fb-filter-arrow">▾</span>
          </button>

          <!-- Nút Loa tự động phát âm -->
          <button type="button" class="fb-btn-circle fb-btn-toggle-sound ${_fbFilter.autoAudio ? 'is-on' : ''}" id="fb-btn-toggle-sound" title="${_fbFilter.autoAudio ? 'Đang bật tự phát âm' : 'Đang tắt tự phát âm'}">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- 2. Newsfeed Scroll Container -->
      <main class="fb-feed-container" id="fb-feed-container">
        <!-- Status Composer Bar ("Hôm nay bạn muốn học gì?") -->
        <section class="fb-composer-card">
          <div class="fb-composer-top">
            <div class="fb-user-avatar">FB</div>
            <div class="fb-composer-input-fake" id="fb-composer-trigger">
              Hôm nay bạn muốn học chủ đề gì? Chạm để lọc...
            </div>
          </div>
          <div class="fb-composer-bottom">
            <button type="button" class="fb-composer-action-btn" id="fb-composer-btn-filter">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Bộ lọc từ vựng</span>
            </button>
            <button type="button" class="fb-composer-action-btn" id="fb-composer-btn-shuffle">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              <span>Xáo trộn Feed</span>
            </button>
          </div>
        </section>

        <!-- Dynamic Post Cards will be appended here -->
      </main>

      <!-- Nút cuộn lên đầu trang -->
      <button type="button" class="fb-btn-scroll-top" id="fb-btn-scroll-top" title="Lên đầu trang">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      <!-- 3. Bộ lọc Modal / Bottom Sheet -->
      ${renderFilterModalHTML()}
    </div>
  `;

  _feedContainer = document.getElementById('fb-feed-container');
  _renderedCount = 0;

  // Render batch đầu tiên
  appendNextBatch();
  setupFeedIntersectionObserver();
  updateFilterPillLabel();

  // Nút mở bộ lọc
  const btnFilter = document.getElementById('fb-btn-filter-pill');
  if (btnFilter) btnFilter.onclick = openFilterModal;

  const composerFilter = document.getElementById('fb-composer-btn-filter');
  if (composerFilter) composerFilter.onclick = openFilterModal;

  const composerTrigger = document.getElementById('fb-composer-trigger');
  if (composerTrigger) composerTrigger.onclick = openFilterModal;

  // Nút đóng bộ lọc
  const filterClose = document.getElementById('fb-filter-close-btn');
  if (filterClose) filterClose.onclick = closeFilterModal;

  const filterBackdrop = document.getElementById('fb-filter-modal');
  if (filterBackdrop) {
    filterBackdrop.onclick = (e) => {
      if (e.target === filterBackdrop) closeFilterModal();
    };
  }

  // Nút bật/tắt âm thanh tự động
  const btnSound = document.getElementById('fb-btn-toggle-sound');
  if (btnSound) {
    btnSound.onclick = () => {
      _fbFilter.autoAudio = !_fbFilter.autoAudio;
      btnSound.classList.toggle('is-on', _fbFilter.autoAudio);
      btnSound.title = _fbFilter.autoAudio ? 'Đang bật tự phát âm' : 'Đang tắt tự phát âm';
      saveUserInteractions();
      _fbApp?.showToast(_fbFilter.autoAudio ? '🔊 Đã bật tự động phát âm khi lướt' : '🔇 Đã tắt tự động phát âm', 'info', 1500);
    };
  }

  // Nút Xáo trộn Feed
  const btnShuffle = document.getElementById('fb-composer-btn-shuffle');
  if (btnShuffle) {
    btnShuffle.onclick = () => {
      _fbQueue.sort(() => Math.random() - 0.5);
      _renderedCount = 0;
      if (_feedContainer) {
        _feedContainer.innerHTML = '';
        appendNextBatch();
        setupFeedIntersectionObserver();
        const mainEl = document.getElementById('main-content');
        if (mainEl) mainEl.scrollTop = 0;
      }
      _fbApp?.showToast('🎲 Đã xáo trộn bảng tin mới!', 'success', 1500);
    };
  }

  // Nút cuộn lên đầu trang
  const btnScrollTop = document.getElementById('fb-btn-scroll-top');
  if (btnScrollTop) {
    btnScrollTop.onclick = () => {
      const mainEl = getMainContentEl();
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      _feedContainer?.scrollTo?.({ top: 0, behavior: 'smooth' });
    };
  }

  // Sự kiện cuộn với rAF Throttling & Scroll Idle Detection (Tối ưu chống quá tải & chống lag)
  const scrollTarget = getMainContentEl() || window;
  let isScrollTicking = false;
  let scrollIdleTimer = null;

  const handleScroll = () => {
    const reelsTab = document.getElementById('tab-reels');
    if (!reelsTab || !reelsTab.classList.contains('active')) return;

    // 1. Dừng phát âm ngay nếu người dùng đang vuốt nhanh lướt qua nhiều bài
    if (_speechDebounceTimer) {
      clearTimeout(_speechDebounceTimer);
      _speechDebounceTimer = null;
    }

    // 2. Throttling rAF giữ chuẩn 60-120fps cho chuyển động mượt mà
    if (!isScrollTicking) {
      isScrollTicking = true;
      requestAnimationFrame(() => {
        const mainEl = getMainContentEl();
        const scrollPos = mainEl ? mainEl.scrollTop : (window.scrollY || 0);
        const scrollHeight = mainEl ? mainEl.scrollHeight : (document.documentElement.scrollHeight || 0);
        const clientHeight = mainEl ? mainEl.clientHeight : window.innerHeight;

        if (btnScrollTop) {
          btnScrollTop.classList.toggle('is-visible', scrollPos > 350);
        }

        // Khi lướt còn 750px tới đáy, nạp thêm batch tiếp theo
        if (scrollHeight - (scrollPos + clientHeight) < 750) {
          appendNextBatch();
        }

        isScrollTicking = false;
      });
    }

    // 3. Khi dừng lướt (Scroll Idle 260ms), mới phát âm bài viết nằm giữa màn hình
    if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => {
      checkAndPronounceCenterCard();
    }, 260);
  };

  scrollTarget.removeEventListener('scroll', handleScroll);
  scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
  if (scrollTarget !== window) {
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Sự kiện trong Bộ lọc Sheet
  const levelChips = document.querySelectorAll('#filter-level-chips .fb-filter-chip');
  levelChips.forEach(chip => {
    chip.onclick = () => {
      levelChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _fbFilter.level = chip.getAttribute('data-level');
    };
  });

  const statusChips = document.querySelectorAll('#filter-status-chips .fb-filter-chip');
  statusChips.forEach(chip => {
    chip.onclick = () => {
      statusChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _fbFilter.status = chip.getAttribute('data-status');
    };
  });

  const topicSelect = document.getElementById('filter-topic-select');
  if (topicSelect) {
    topicSelect.onchange = () => {
      _fbFilter.topicId = topicSelect.value;
    };
  }

  const toggleAudio = document.getElementById('filter-toggle-audio');
  if (toggleAudio) {
    toggleAudio.onchange = () => {
      _fbFilter.autoAudio = toggleAudio.checked;
      if (btnSound) btnSound.classList.toggle('is-on', _fbFilter.autoAudio);
    };
  }

  const toggleBlur = document.getElementById('filter-toggle-blur');
  if (toggleBlur) {
    toggleBlur.onchange = () => {
      _fbFilter.blurMeaning = toggleBlur.checked;
    };
  }

  const btnApplyFilter = document.getElementById('fb-filter-apply-btn');
  if (btnApplyFilter) btnApplyFilter.onclick = applyCurrentFilter;

  const btnResetFilter = document.getElementById('fb-filter-reset-btn');
  if (btnResetFilter) {
    btnResetFilter.onclick = () => {
      _fbFilter = {
        level: 'all',
        topicId: 'all',
        status: 'mixed',
        autoAudio: true,
        blurMeaning: false
      };
      levelChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-level') === 'all'));
      statusChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-status') === 'mixed'));
      if (topicSelect) topicSelect.value = 'all';
      if (toggleAudio) toggleAudio.checked = true;
      if (toggleBlur) toggleBlur.checked = false;
      if (btnSound) btnSound.classList.add('is-on');
      applyCurrentFilter();
    };
  }

  // Sự kiện tương tác trên bài viết (Event Delegation)
  if (_feedContainer && !_feedContainer._hasEvents) {
    _feedContainer._hasEvents = true;
    _feedContainer.addEventListener('click', (e) => {
      const target = e.target;
      const postCard = target.closest('.fb-post-card');
      if (!postCard) return;

      const cardId = postCard.getAttribute('data-id');
      const card = WORDS_MAP.get(cardId);
      if (!card) return;

      // 1. Đánh giá FSRS-6
      const ratingBtn = target.closest('[data-rating]');
      if (ratingBtn) {
        e.stopPropagation();
        const rating = parseInt(ratingBtn.getAttribute('data-rating'), 10);
        handleRateCardFSRS(cardId, rating, ratingBtn);
        return;
      }

      const actionEl = target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-action');

      // 2. Phát âm US
      if (action === 'speak-word-us') {
        e.stopPropagation();
        const usBtn = postCard.querySelector('.fb-btn-accent-audio:first-child');
        usBtn?.classList.add('is-playing');
        speak(card.word, {
          accent: 'us',
          cardObj: card,
          onEnd: () => usBtn?.classList.remove('is-playing')
        });
        setTimeout(() => usBtn?.classList.remove('is-playing'), 1200);
      }
      // 3. Phát âm UK
      else if (action === 'speak-word-uk') {
        e.stopPropagation();
        const ukBtn = postCard.querySelector('.fb-btn-accent-audio:last-child');
        ukBtn?.classList.add('is-playing');
        speak(card.word, {
          accent: 'uk',
          cardObj: card,
          onEnd: () => ukBtn?.classList.remove('is-playing')
        });
        setTimeout(() => ukBtn?.classList.remove('is-playing'), 1200);
      }
      // 4. Nghe câu ví dụ
      else if (action === 'speak-example') {
        e.stopPropagation();
        if (card.example) {
          speak(card.example);
        }
      }
      // 5. Che/Hiện nghĩa tiếng Việt
      else if (action === 'toggle-meaning-blur') {
        e.stopPropagation();
        const box = postCard.querySelector('.fb-meaning-box');
        box?.classList.toggle('is-blurred');
      }
      // 6. Thích (Like)
      else if (action === 'toggle-like') {
        e.stopPropagation();
        const isNowLiked = !_likedWordIds.has(card.id);
        const likeBtn = actionEl;
        const rect = likeBtn.getBoundingClientRect();

        if (isNowLiked) {
          _likedWordIds.add(card.id);
          likeBtn.classList.add('is-liked');
          spawnFloatingReaction(rect.left + rect.width / 2, rect.top, '👍');
          const likeCountText = postCard.querySelector('.fb-like-count-text');
          if (likeCountText) likeCountText.textContent = 'Bạn và 2.5K người khác';
        } else {
          _likedWordIds.delete(card.id);
          likeBtn.classList.remove('is-liked');
          const likeCountText = postCard.querySelector('.fb-like-count-text');
          if (likeCountText) likeCountText.textContent = '2.5K người khác';
        }
        saveUserInteractions();
      }
      // 7. Lưu (Bookmark)
      else if (action === 'toggle-bookmark') {
        e.stopPropagation();
        const isNowBookmarked = !_bookmarkedWordIds.has(card.id);
        const bmBtn = actionEl;
        if (isNowBookmarked) {
          _bookmarkedWordIds.add(card.id);
          bmBtn.classList.add('is-bookmarked');
          bmBtn.querySelector('svg')?.setAttribute('fill', 'currentColor');
          _fbApp?.showToast(`⭐ Đã lưu từ "${card.word}" vào mục Yêu thích`, 'success', 1500);
        } else {
          _bookmarkedWordIds.delete(card.id);
          bmBtn.classList.remove('is-bookmarked');
          bmBtn.querySelector('svg')?.setAttribute('fill', 'none');
          _fbApp?.showToast(`Đã bỏ lưu từ "${card.word}"`, 'info', 1200);
        }
        saveUserInteractions();
      }
      // 8. Chia sẻ (Share)
      else if (action === 'share-word') {
        e.stopPropagation();
        const shareText = `📚 Từ vựng: ${card.word} (${card.pos || ''})\nPhiên âm: ${card.ipa || ''}\nNghĩa: ${card.meaning}\nVí dụ: ${card.example || ''}\n(Học trên Flashcard English Pro)`;
        if (navigator.share) {
          navigator.share({
            title: `Từ vựng tiếng Anh: ${card.word}`,
            text: shareText
          }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(shareText).then(() => {
            _fbApp?.showToast('📋 Đã sao chép nội dung từ vựng vào bộ nhớ tạm!', 'success', 2000);
          });
        }
      }
      // 9. Mở / Đóng Comments Drawer
      else if (action === 'toggle-comments') {
        e.stopPropagation();
        const drawer = postCard.querySelector('.fb-comments-drawer');
        if (drawer) {
          const isOpen = drawer.classList.toggle('is-open');
          if (isOpen) {
            drawer.querySelector('.fb-comment-input')?.focus();
          }
        }
      }
      // 10. Gửi Comment / Ghi chú
      else if (action === 'submit-comment') {
        e.stopPropagation();
        const drawer = postCard.querySelector('.fb-comments-drawer');
        const input = drawer?.querySelector('.fb-comment-input');
        const text = input?.value?.trim();
        if (text) {
          if (!_wordComments[card.id]) _wordComments[card.id] = [];
          _wordComments[card.id].push(text);
          saveUserInteractions();

          const list = drawer.querySelector('.fb-comment-list');
          if (list) {
            const item = document.createElement('div');
            item.className = 'fb-comment-item';
            item.innerHTML = `
              <div class="fb-comment-avatar">Me</div>
              <div class="fb-comment-bubble">
                <div class="fb-comment-author">Ghi chú của bạn</div>
                <div>${escapeHTML(text)}</div>
              </div>
            `;
            list.appendChild(item);
          }

          input.value = '';
          const countEl = postCard.querySelector('.fb-comment-count-text');
          if (countEl) countEl.textContent = `${_wordComments[card.id].length} ghi chú`;
          _fbApp?.showToast('💬 Đã lưu ghi chú vào từ vựng!', 'success', 1500);
        }
      }
      // 11. Menu 3 chấm bài viết
      else if (action === 'open-post-menu') {
        e.stopPropagation();
        const selected = window.confirm(`Tùy chọn cho từ "${card.word}":\n- Bấm OK để nghe phát âm tốc độ chậm (0.8x)\n- Bấm Cancel để đóng.`);
        if (selected) {
          speak(card.word, { speechRate: 0.8, cardObj: card });
        }
      }
    });

    _feedContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = e.target.closest('.fb-comment-input');
        if (input) {
          e.preventDefault();
          const drawer = input.closest('.fb-comments-drawer');
          const submitBtn = drawer?.querySelector('[data-action="submit-comment"]');
          submitBtn?.click();
        }
      }
    });
  }

  // Phím tắt bàn phím
  const keyHandler = (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('fb-filter-modal');
      if (modal && modal.classList.contains('is-open')) {
        closeFilterModal();
      }
    }
  };
  window.addEventListener('keydown', keyHandler);
}

// Giữ tương thích ngược với các lời gọi startReelsSession cũ
export function startReelsSession(app, customQueue = null, options = {}) {
  const targetApp = app || _fbApp || (typeof window !== 'undefined' ? window.app : null);
  if (targetApp && typeof targetApp.switchTab === 'function') {
    targetApp.switchTab('tab-reels');
    if (Array.isArray(customQueue) && customQueue.length > 0) {
      renderReelsTab(targetApp, customQueue, { ...options, forceReload: true });
    }
  } else {
    renderReelsTab(targetApp, customQueue, options);
  }
}
