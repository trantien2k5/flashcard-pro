/**
 * Reels View Controller - Short Video / TikTok-Style Vocabulary Learning Engine
 * Lướt từ vựng toàn màn hình, tự động phát âm chuẩn bản ngữ, câu ví dụ sinh động,
 * thanh tương tác cạnh phải (Like/Loa/Che nghĩa) và đánh giá FSRS-6 một chạm (Lướt là thuộc).
 */

import { FSRS, Rating, State, isCardDue } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { WORDS, WORDS_MAP } from '../../data/index.js';
import { escapeHTML } from '../utils.js';
import { speak, stopAudio, unlockAudioContext } from '../services/audio.js';
import { preloadCardImage } from '../core/session.js';
import { globalStudyTimer } from '../core/stats.js';

let _reelsApp = null;
let _reelsQueue = [];
let _currentIndex = 0;
let _currentMode = 'mixed'; // 'mixed' | 'due_only' | 'new_only'
let _isAutoplay = false;
let _autoPlayTimer = null;
const _autoPlayIntervalSec = 5;
let _isGlobalMeaningHidden = false;
let _bookmarkedIds = new Set();
let _observer = null;
let _feedContainer = null;
let _keyHandler = null;
let _speechDebounceTimer = null;
let _isRatingInProgress = false;

// Thống kê phiên lướt từ
let _reelsStats = {
  viewed: 0,
  rated: 0,
  ratings: {
    [Rating.Again]: 0,
    [Rating.Hard]: 0,
    [Rating.Good]: 0,
    [Rating.Easy]: 0
  }
};

/**
 * Nạp danh sách Bookmarked từ Storage
 */
function loadBookmarks() {
  try {
    const raw = localStorage.getItem('reels_bookmarked_ids');
    if (raw) {
      _bookmarkedIds = new Set(JSON.parse(raw));
    }
  } catch (e) {
    _bookmarkedIds = new Set();
  }
}

function saveBookmarks() {
  try {
    localStorage.setItem('reels_bookmarked_ids', JSON.stringify([..._bookmarkedIds]));
  } catch (e) {}
}

/**
 * Tạo hàng đợi từ vựng thông minh cho luồng Reels
 */
function buildReelsQueue(app, mode = 'mixed', customCards = null) {
  if (Array.isArray(customCards) && customCards.length > 0) {
    return [...customCards];
  }

  const allWords = Array.isArray(WORDS) && WORDS.length > 0 ? WORDS : [];
  const cardStates = StorageManager.getAllCardStates() || {};
  const now = new Date();

  const dueList = [];
  const newList = [];
  const reviewList = [];

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i];
    const state = cardStates[word.id] || StorageManager.getCardState(word.id);

    if (state && state.suspended) continue;

    const isNew = (!state || state.state === State.New || state.state === 0) &&
                  (!state || !state.reps || state.reps === 0);

    if (isNew) {
      newList.push({ ...word, fsrsState: state || FSRS.createEmptyCard(word.id) });
    } else if (isCardDue(state, now)) {
      dueList.push({ ...word, fsrsState: state });
    } else {
      reviewList.push({ ...word, fsrsState: state });
    }
  }

  // Shuffle nhẹ mảng
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  shuffle(newList);
  shuffle(dueList);
  shuffle(reviewList);

  let queue = [];

  if (mode === 'due_only') {
    queue = dueList.length > 0 ? dueList : reviewList.slice(0, 30);
  } else if (mode === 'new_only') {
    queue = newList.length > 0 ? newList.slice(0, 40) : reviewList.slice(0, 30);
  } else {
    // Chế độ Mixed (Smart Feed): Xen kẽ 3 từ ôn : 1 từ mới
    const maxLen = Math.max(dueList.length, newList.length, 30);
    let dIdx = 0, nIdx = 0, rIdx = 0;

    while (queue.length < 50 && (dIdx < dueList.length || nIdx < newList.length || rIdx < reviewList.length)) {
      // 2-3 từ ôn tập tới hạn
      for (let k = 0; k < 2 && dIdx < dueList.length; k++) {
        queue.push(dueList[dIdx++]);
      }
      // 1 từ mới
      if (nIdx < newList.length) {
        queue.push(newList[nIdx++]);
      }
      // Bổ sung từ đang học nếu hết từ tới hạn
      if (dIdx >= dueList.length && rIdx < reviewList.length) {
        queue.push(reviewList[rIdx++]);
      }
      if (dIdx >= dueList.length && nIdx >= newList.length && rIdx >= reviewList.length) {
        break;
      }
    }
  }

  // Fallback an toàn nếu kho dữ liệu rỗng
  if (queue.length === 0) {
    queue = allWords.slice(0, 30);
  }

  return queue;
}

/**
 * Đánh dấu từ vựng trong câu ví dụ (Highlight Tag)
 */
function highlightWordInExample(sentence, targetWord) {
  if (!sentence) return '';
  if (!targetWord) return escapeHTML(sentence);

  const cleanTarget = targetWord.trim();
  // Regex tìm từ vựng trong câu không phân biệt hoa thường
  const escaped = cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escaped}\\w*)\\b`, 'gi');

  if (regex.test(sentence)) {
    return escapeHTML(sentence).replace(regex, '<mark>$1</mark>');
  }

  return escapeHTML(sentence);
}

/**
 * Sinh HTML cho 1 slide từ vựng
 */
function renderReelSlideHTML(card, index) {
  const isBookmarked = _bookmarkedIds.has(card.id);
  const cefr = (card.level || card.cefr || 'A1').toUpperCase();
  const pos = (card.pos || 'word').toLowerCase();
  const ipa = card.ipa || card.phonetic || '';
  const wordText = card.word || '';
  const meaningText = card.meaning || '';
  const exampleEn = highlightWordInExample(card.example || '', card.word);
  const exampleVi = card.exampleVi || '';
  const imgSrc = card.img || '';

  const hasImg = imgSrc && imgSrc.length > 5;
  const levelClass = `level-${cefr.toLowerCase()}`;

  return `
    <article class="reel-slide" data-index="${index}" data-id="${card.id}" id="reel-slide-${index}">
      <div class="reel-backdrop-gradient"></div>

      <!-- Hero Visual (Ảnh minh họa hoặc Typo Visualizer) -->
      <div class="reel-visual-stage">
        <div class="reel-image-wrapper" role="button" tabindex="0" title="Bấm để phát âm" data-action="speak-word">
          ${hasImg ? `
            <img class="reel-image" src="${imgSrc}" alt="${escapeHTML(wordText)}" loading="lazy" onerror="this.style.display='none'; const p = this.parentElement?.querySelector('.reel-image-placeholder'); if (p) p.classList.remove('is-hidden');" />
          ` : ''}
          <div class="reel-image-placeholder ${hasImg ? 'is-hidden' : ''}">
            <span class="reel-image-placeholder-icon">📖</span>
            <span>${escapeHTML(card.definition || wordText)}</span>
          </div>
          <!-- Equalizer sóng âm khi đang phát -->
          <div class="reel-audio-equalizer" id="eq-${index}">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Right Floating Action Bar (TikTok / Reels Signature) -->
      <div class="reel-action-bar">
        <!-- Nút 1: Phát âm từ vựng -->
        <div class="reel-action-btn-item">
          <button type="button" class="btn-reel-action btn-reel-speak" data-action="speak-word" title="Nghe phát âm từ vựng (R)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
          <span class="reel-action-label">Phát âm</span>
        </div>

        <!-- Nút 2: Nghe câu ví dụ -->
        ${card.example ? `
          <div class="reel-action-btn-item">
            <button type="button" class="btn-reel-action btn-reel-example" data-action="speak-example" title="Nghe câu ví dụ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="10" x2="15" y2="10"></line>
              </svg>
            </button>
            <span class="reel-action-label">Ví dụ</span>
          </div>
        ` : ''}

        <!-- Nút 3: Che / Hiện nghĩa tiếng Việt (Thử thách trí nhớ) -->
        <div class="reel-action-btn-item">
          <button type="button" class="btn-reel-action btn-reel-toggle-meaning" data-action="toggle-meaning" title="Ẩn/Hiện nghĩa tiếng Việt (M)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <span class="reel-action-label">Nghĩa</span>
        </div>

        <!-- Nút 4: Bookmark / Lưu từ yêu thích -->
        <div class="reel-action-btn-item">
          <button type="button" class="btn-reel-action btn-reel-bookmark ${isBookmarked ? 'is-bookmarked' : ''}" data-action="toggle-bookmark" title="Lưu vào danh sách yêu thích">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <span class="reel-action-label">Lưu</span>
        </div>

        <!-- Nút 5: Lướt tiếp xuống (Dành cho một tay / chuột) -->
        <div class="reel-action-btn-item">
          <button type="button" class="btn-reel-action btn-reel-next" data-action="next-slide" title="Từ tiếp theo (Phím Xuống / Space)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <span class="reel-action-label">Tiếp</span>
        </div>
      </div>

      <!-- Main Content Box (Thông tin từ vựng) -->
      <div class="reel-content-box">
        <div class="reel-word-header">
          <div class="reel-word-title-group">
            <h2 class="reel-word-title">${escapeHTML(wordText)}</h2>
            <div class="reel-word-ipa-row">
              ${ipa ? `<span class="reel-word-ipa">${escapeHTML(ipa)}</span>` : ''}
              <span class="reel-badge-pill ${levelClass}">${cefr}</span>
              ${pos ? `<span class="reel-badge-pill">${escapeHTML(pos)}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Nghĩa Tiếng Việt (Bấm vào để ẩn/hiện hoặc che mờ) -->
        <div class="reel-meaning-box ${_isGlobalMeaningHidden ? 'blurred' : ''}" data-action="toggle-meaning" title="Bấm để ẩn / hiện nghĩa">
          <div class="reel-meaning-text">${escapeHTML(meaningText)}</div>
          <span class="reel-meaning-hint">👁️ Nhấn để xem nghĩa</span>
        </div>

        <!-- Câu ví dụ song ngữ -->
        ${card.example ? `
          <div class="reel-example-box">
            <div class="reel-example-en">${exampleEn}</div>
            ${exampleVi ? `<div class="reel-example-vi">${escapeHTML(exampleVi)}</div>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Bottom Floating FSRS Rating Bar (Lướt là nhớ) -->
      <div class="reel-fsrs-rating-bar">
        <button type="button" class="btn-reel-fsrs btn-reel-fsrs-again" data-rating="1" title="Chưa nhớ (Phím 1)">
          <span class="fsrs-btn-name">❌ Quên</span>
          <span class="fsrs-btn-hint">Học lại</span>
        </button>
        <button type="button" class="btn-reel-fsrs btn-reel-fsrs-hard" data-rating="2" title="Hơi khó (Phím 2)">
          <span class="fsrs-btn-name">⏳ Khó</span>
          <span class="fsrs-btn-hint">Ôn sớm</span>
        </button>
        <button type="button" class="btn-reel-fsrs btn-reel-fsrs-good" data-rating="3" title="Nhớ tốt (Phím 3)">
          <span class="fsrs-btn-name">✨ Tốt</span>
          <span class="fsrs-btn-hint">Chuẩn hạn</span>
        </button>
        <button type="button" class="btn-reel-fsrs btn-reel-fsrs-easy" data-rating="4" title="Rất dễ (Phím 4)">
          <span class="fsrs-btn-name">💎 Dễ</span>
          <span class="fsrs-btn-hint">Nhớ sâu</span>
        </button>
      </div>
    </article>
  `;
}

/**
 * Hiệu ứng bay icon reaction (Tim / Sao / Check)
 */
function spawnFloatingParticle(targetEl, emoji = '✨') {
  if (!targetEl) return;
  const particle = document.createElement('div');
  particle.className = 'reel-floating-particle';
  particle.textContent = emoji;
  particle.style.left = '50%';
  particle.style.top = '40%';
  targetEl.appendChild(particle);
  setTimeout(() => particle.remove(), 850);
}

/**
 * Xử lý đánh giá FSRS-6 khi bấm nút hoặc phím tắt
 */
function handleRateCard(rating) {
  if (_isRatingInProgress) return;
  const currentCard = _reelsQueue[_currentIndex];
  if (!currentCard) return;

  _isRatingInProgress = true;
  const currentSlide = document.getElementById(`reel-slide-${_currentIndex}`);

  // Hiệu ứng hạt biểu tượng theo rating
  const emojis = {
    [Rating.Again]: '🔁',
    [Rating.Hard]: '⏳',
    [Rating.Good]: '✨',
    [Rating.Easy]: '💎'
  };
  spawnFloatingParticle(currentSlide, emojis[rating] || '✨');

  // Haptic feedback nhẹ
  try {
    if (rating === Rating.Again) {
      navigator.vibrate?.(20);
    } else {
      navigator.vibrate?.(10);
    }
  } catch (e) {}

  // Ghi nhận FSRS-6
  try {
    const fsrs = new FSRS({
      requestRetention: _reelsApp?.settings?.requestRetention || 0.90,
      enableFuzz: _reelsApp?.settings?.enableFuzz !== false,
      leechThreshold: _reelsApp?.settings?.leechThreshold || 8,
      leechAction: _reelsApp?.settings?.leechAction || 'suspend'
    });

    const now = new Date();
    const oldState = StorageManager.getCardState(currentCard.id) || FSRS.createEmptyCard(currentCard.id);
    const nextState = fsrs.calculateNextState(oldState, rating, now, {
      enableFuzz: _reelsApp?.settings?.enableFuzz !== false,
      leechThreshold: _reelsApp?.settings?.leechThreshold || 8,
      leechAction: _reelsApp?.settings?.leechAction || 'suspend'
    });

    StorageManager.saveCardState(nextState);

    StorageManager.logReview({
      cardId: currentCard.id,
      word: currentCard.word,
      rating: rating,
      oldState: oldState.state,
      newState: nextState.state,
      scheduledDays: nextState.scheduled_days,
      stability: nextState.stability,
      difficulty: nextState.difficulty,
      isReels: true
    });

    _reelsStats.rated++;
    _reelsStats.ratings[rating]++;

    // Nếu chọn Again (Quên), chèn lại từ này vào 4 slide kế tiếp để người dùng gặp lại ngay!
    if (rating === Rating.Again) {
      const reinsertIndex = Math.min(_currentIndex + 4, _reelsQueue.length);
      _reelsQueue.splice(reinsertIndex, 0, { ...currentCard });
      renderAppendedSlide(currentCard, _reelsQueue.length - 1);
    }
  } catch (err) {
    console.warn('Lỗi ghi nhận FSRS trong Reels:', err);
  }

  // Chuyển thẻ tức thì và mượt mà sau 60ms (vừa mượt vừa tức thì)
  setTimeout(() => {
    scrollToNextReel();
    setTimeout(() => {
      _isRatingInProgress = false;
    }, 180);
  }, 60);
}

/**
 * Lướt tới thẻ tiếp theo (Snappy Fast Smooth Scroll)
 */
function scrollToNextReel() {
  if (_currentIndex < _reelsQueue.length - 1) {
    scrollToSlide(_currentIndex + 1);
  } else {
    // Nếu đã hết thẻ, thêm batch mới
    appendMoreCards();
  }
}

/**
 * Lướt lùi về thẻ trước
 */
function scrollToPrevReel() {
  if (_currentIndex > 0) {
    scrollToSlide(_currentIndex - 1);
  }
}

/**
 * Cuộn tới slide cụ thể với thuật toán Snappy Cubic Ease-out (160ms - Tức thì & Êm dịu)
 */
function scrollToSlide(index, duration = 160) {
  const targetSlide = document.getElementById(`reel-slide-${index}`);
  if (!targetSlide || !_feedContainer) return;

  const startTop = _feedContainer.scrollTop;
  const targetTop = targetSlide.offsetTop;
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 2) return;

  if (duration <= 0) {
    _feedContainer.scrollTop = targetTop;
    return;
  }

  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Cubic ease-out curve: Chạy nhanh ngay tức thì và dừng cực êm
    const ease = 1 - Math.pow(1 - progress, 3);
    _feedContainer.scrollTop = startTop + distance * ease;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

/**
 * Chèn thêm thẻ khi lướt gần hết danh sách (Infinite Feed)
 */
function appendMoreCards() {
  const more = buildReelsQueue(_reelsApp, _currentMode);
  if (!more || more.length === 0) return;

  const startIdx = _reelsQueue.length;
  const filtered = more.filter(c => !_reelsQueue.some(q => q.id === c.id)).slice(0, 15);

  if (filtered.length === 0) return;

  _reelsQueue.push(...filtered);

  if (_feedContainer) {
    const frag = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    filtered.forEach((card, i) => {
      tempDiv.innerHTML = renderReelSlideHTML(card, startIdx + i);
      const child = tempDiv.firstElementChild;
      if (child) {
        frag.appendChild(child);
        if (_observer) _observer.observe(child);
      }
    });
    _feedContainer.appendChild(frag);
    updateCounterUI();
  }
}

function renderAppendedSlide(card, index) {
  if (!_feedContainer) return;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderReelSlideHTML(card, index);
  const child = tempDiv.firstElementChild;
  if (child) {
    _feedContainer.appendChild(child);
    if (_observer) _observer.observe(child);
  }
}

/**
 * Cập nhật số đếm trên Header
 */
function updateCounterUI() {
  const elCounter = document.getElementById('reels-counter-text');
  if (elCounter) {
    elCounter.textContent = `${_currentIndex + 1}/${_reelsQueue.length}`;
  }
}

/**
 * Kích hoạt thẻ hiện tại khi cuộn tới
 */
function activateSlide(index) {
  if (index === _currentIndex && _reelsStats.viewed > 0) return;
  _currentIndex = index;
  _reelsStats.viewed++;

  const currentCard = _reelsQueue[_currentIndex];
  if (!currentCard) return;

  updateCounterUI();

  // Quản lý .is-active cho content-visibility optimization
  document.querySelectorAll('.reel-slide.is-active').forEach(s => s.classList.remove('is-active'));
  const currentSlide = document.getElementById(`reel-slide-${index}`);
  if (currentSlide) currentSlide.classList.add('is-active');

  // Dừng audio cũ ngay lập tức trước khi phát từ mới
  stopAudio();
  if (_speechDebounceTimer) {
    clearTimeout(_speechDebounceTimer);
    _speechDebounceTimer = null;
  }

  // Kích hoạt Equalizer
  document.querySelectorAll('.reel-audio-equalizer').forEach(eq => eq.classList.remove('active'));
  const currentEq = document.getElementById(`eq-${index}`);

  // Tự động phát âm từ vựng (Debounced 80ms để chống chồng chéo khi lướt nhanh)
  const shouldAutoPronounce = _reelsApp?.settings?.autoPronounce !== false;
  if (shouldAutoPronounce && currentCard.word) {
    _speechDebounceTimer = setTimeout(() => {
      if (currentEq) currentEq.classList.add('active');
      speak(currentCard.word, {
        cardObj: currentCard,
        onEnd: () => {
          if (currentEq) currentEq.classList.remove('active');
        }
      });
      setTimeout(() => {
        if (currentEq) currentEq.classList.remove('active');
      }, 1500);
    }, 80);
  }

  // Tải trước hình ảnh và âm thanh của 2 từ kế tiếp (0ms delay)
  for (let k = 1; k <= 2; k++) {
    const nextCard = _reelsQueue[_currentIndex + k];
    if (nextCard) {
      if (nextCard.img) preloadCardImage(nextCard.img);
      if (nextCard.word) speak(nextCard.word, { cardObj: nextCard, preloadOnly: true });
    }
  }

  // Tự động lướt nếu chế độ rảnh tay (Autoplay) đang bật
  resetAutoPlayTimer();

  // Nếu còn dưới 3 thẻ, chuẩn bị nạp thêm
  if (_currentIndex >= _reelsQueue.length - 3) {
    appendMoreCards();
  }
}

/**
 * Bộ đếm Autoplay tự động chuyển thẻ
 */
function resetAutoPlayTimer() {
  if (_autoPlayTimer) {
    clearTimeout(_autoPlayTimer);
    _autoPlayTimer = null;
  }
  if (_isAutoplay) {
    _autoPlayTimer = setTimeout(() => {
      scrollToNextReel();
    }, _autoPlayIntervalSec * 1000);
  }
}

function toggleAutoPlay() {
  _isAutoplay = !_isAutoplay;
  const btn = document.getElementById('btn-reels-autoplay');
  if (btn) {
    btn.classList.toggle('active', _isAutoplay);
    btn.style.color = _isAutoplay ? '#22c55e' : '#ffffff';
  }
  if (_isAutoplay) {
    resetAutoPlayTimer();
    _reelsApp?.showToast(`▶️ Tự động lướt rảnh tay (Mỗi ${_autoPlayIntervalSec}s)`, 'info', 2000);
  } else {
    if (_autoPlayTimer) clearTimeout(_autoPlayTimer);
    _reelsApp?.showToast('⏸️ Đã dừng tự động lướt', 'info', 1800);
  }
}

/**
 * Đổi chế độ Feed: Mixed / Due / New
 */
function switchFeedMode(mode) {
  if (mode === _currentMode) return;
  _currentMode = mode;

  // Cập nhật giao diện Segmented Buttons
  document.querySelectorAll('.reels-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });

  // Tái tạo lại hàng đợi
  _reelsQueue = buildReelsQueue(_reelsApp, mode);
  _currentIndex = 0;

  if (_feedContainer) {
    _feedContainer.innerHTML = _reelsQueue.map((card, idx) => renderReelSlideHTML(card, idx)).join('');
    setupIntersectionObserver();
    _feedContainer.scrollTop = 0;
    activateSlide(0);
  }
}

/**
 * Thiết lập IntersectionObserver để phát hiện thẻ đang chiếm trọn màn hình
 */
function setupIntersectionObserver() {
  if (_observer) {
    _observer.disconnect();
  }

  _observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const idx = parseInt(entry.target.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          activateSlide(idx);
        }
      }
    }
  }, {
    root: _feedContainer,
    threshold: 0.5
  });

  const slides = _feedContainer.querySelectorAll('.reel-slide');
  slides.forEach(slide => _observer.observe(slide));
}

/**
 * Đóng phiên lướt từ vựng và quay lại Trang chủ
 */
export function closeReelsSession() {
  if (_autoPlayTimer) {
    clearTimeout(_autoPlayTimer);
    _autoPlayTimer = null;
  }
  if (_speechDebounceTimer) {
    clearTimeout(_speechDebounceTimer);
    _speechDebounceTimer = null;
  }
  if (_observer) {
    _observer.disconnect();
    _observer = null;
  }
  if (_keyHandler) {
    window.removeEventListener('keydown', _keyHandler);
    _keyHandler = null;
  }

  stopAudio();

  const overlay = document.getElementById('reels-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
  }

  // Khôi phục cuộn trang thông thường
  document.body.style.overflow = '';

  // Đồng bộ lại tất cả số liệu trên giao diện chính
  if (_reelsApp) {
    _reelsApp.refreshAllViews();
    if (_reelsStats.rated > 0) {
      _reelsApp.showToast(`Tuyệt vời! Đã lướt & ôn tập ${_reelsStats.rated} từ vựng FSRS.`, 'success', 3000);
    }
  }
}

/**
 * Điểm khởi động chính: Mở chế độ Lướt từ vựng (Reels Mode)
 */
export function startReelsSession(app, customQueue = null, options = {}) {
  _reelsApp = app;
  unlockAudioContext();
  loadBookmarks();

  _currentMode = options.mode || 'mixed';
  _reelsQueue = buildReelsQueue(app, _currentMode, customQueue);

  if (!_reelsQueue || _reelsQueue.length === 0) {
    app.showToast('Không có từ vựng nào để lướt lúc này.', 'info');
    return;
  }

  _currentIndex = 0;
  _reelsStats = {
    viewed: 0,
    rated: 0,
    ratings: { [Rating.Again]: 0, [Rating.Hard]: 0, [Rating.Good]: 0, [Rating.Easy]: 0 }
  };

  const overlay = document.getElementById('reels-overlay');
  if (!overlay) {
    console.error('Không tìm thấy #reels-overlay trong DOM.');
    return;
  }

  // Khóa cuộn trang web nền
  document.body.style.overflow = 'hidden';

  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="reels-app-stage">
      <!-- 1. Top Header Overlay -->
      <header class="reels-top-header">
        <div class="reels-header-left">
          <button type="button" class="btn-reels-circle" id="btn-reels-close" title="Đóng Reels (Esc)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Segmented Feed Switcher -->
          <div class="reels-mode-segmented">
            <button type="button" class="reels-mode-btn ${_currentMode === 'mixed' ? 'active' : ''}" data-mode="mixed" title="Trộn thông minh từ mới và từ tới hạn"><span class="mode-label-long">🔀 Dành cho bạn</span><span class="mode-label-short">🔀 Mix</span></button>
            <button type="button" class="reels-mode-btn ${_currentMode === 'due_only' ? 'active' : ''}" data-mode="due_only" title="Chỉ ôn từ đến hạn FSRS"><span class="mode-label-long">⚡ Ôn tập</span><span class="mode-label-short">⚡ Ôn</span></button>
            <button type="button" class="reels-mode-btn ${_currentMode === 'new_only' ? 'active' : ''}" data-mode="new_only" title="Chỉ học từ mới chưa học"><span class="mode-label-long">✨ Từ mới</span><span class="mode-label-short">✨ Mới</span></button>
          </div>
        </div>

        <div class="reels-header-right">
          <!-- Nút Tự động lướt (Autoplay Story) -->
          <button type="button" class="btn-reels-circle" id="btn-reels-autoplay" title="Tự động lướt rảnh tay (Mỗi 5s)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          <!-- Đếm số lượng từ -->
          <div class="reels-counter-pill" id="reels-counter-text">1/${_reelsQueue.length}</div>
        </div>
      </header>

      <!-- Gợi ý vuốt trên lần đầu mở -->
      <div class="reel-swipe-indicator" id="reel-swipe-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        <span>Vuốt lên để xem tiếp</span>
      </div>

      <!-- 2. Vertical Feed Container (Scroll-snap 100dvh) -->
      <main class="reels-feed-container" id="reels-feed-container">
        ${_reelsQueue.map((card, idx) => renderReelSlideHTML(card, idx)).join('')}
      </main>
    </div>
  `;

  _feedContainer = document.getElementById('reels-feed-container');

  // Sự kiện nút đóng
  const btnClose = document.getElementById('btn-reels-close');
  if (btnClose) btnClose.onclick = closeReelsSession;

  // Sự kiện Segmented Buttons
  document.querySelectorAll('.reels-mode-btn').forEach(btn => {
    btn.onclick = () => switchFeedMode(btn.getAttribute('data-mode'));
  });

  // Sự kiện Autoplay
  const btnAutoplay = document.getElementById('btn-reels-autoplay');
  if (btnAutoplay) btnAutoplay.onclick = toggleAutoPlay;

  // Ẩn gợi ý vuốt sau 3 giây
  setTimeout(() => {
    const ind = document.getElementById('reel-swipe-indicator');
    if (ind) {
      ind.style.transition = 'opacity 0.6s ease';
      ind.style.opacity = '0';
      setTimeout(() => ind.remove(), 600);
    }
  }, 3200);

  // Sự kiện tương tác trên thẻ (Event Delegation)
  if (_feedContainer) {
    _feedContainer.addEventListener('click', (e) => {
      const target = e.target;
      const ratingEl = target.closest('[data-rating]');
      const actionEl = target.closest('[data-action]') || target.closest('.reel-action-btn-item')?.querySelector('[data-action]');

      // Đánh giá FSRS
      if (ratingEl) {
        e.stopPropagation();
        const rating = parseInt(ratingEl.getAttribute('data-rating'), 10);
        handleRateCard(rating);
        return;
      }

      if (!actionEl) return;
      const action = actionEl.getAttribute('data-action');
      const slideEl = actionEl.closest('.reel-slide');
      const index = slideEl ? parseInt(slideEl.getAttribute('data-index'), 10) : _currentIndex;
      const card = _reelsQueue[index];
      if (!card) return;

      if (action === 'speak-word') {
        e.stopPropagation();
        const speakBtn = slideEl?.querySelector('.btn-reel-speak');
        if (speakBtn) speakBtn.classList.add('playing');
        const eq = document.getElementById(`eq-${index}`);
        if (eq) eq.classList.add('active');
        speak(card.word, {
          cardObj: card,
          onEnd: () => {
            if (eq) eq.classList.remove('active');
            if (speakBtn) speakBtn.classList.remove('playing');
          }
        });
        setTimeout(() => {
          if (eq) eq.classList.remove('active');
          if (speakBtn) speakBtn.classList.remove('playing');
        }, 1200);
      } else if (action === 'speak-example') {
        e.stopPropagation();
        if (card.example) {
          const exBtn = slideEl?.querySelector('.btn-reel-example');
          if (exBtn) exBtn.classList.add('playing');
          speak(card.example, {
            onEnd: () => {
              if (exBtn) exBtn.classList.remove('playing');
            }
          });
          setTimeout(() => {
            if (exBtn) exBtn.classList.remove('playing');
          }, 3500);
        }
      } else if (action === 'toggle-meaning') {
        e.stopPropagation();
        const meaningBox = slideEl?.querySelector('.reel-meaning-box');
        const meaningBtn = slideEl?.querySelector('.btn-reel-toggle-meaning');
        if (meaningBox) {
          const isBlurred = meaningBox.classList.toggle('blurred');
          if (meaningBtn) meaningBtn.classList.toggle('active', isBlurred);
        }
      } else if (action === 'toggle-bookmark') {
        e.stopPropagation();
        const bookmarkBtn = slideEl?.querySelector('.btn-reel-bookmark') || actionEl;
        const isNowBookmarked = !_bookmarkedIds.has(card.id);
        if (isNowBookmarked) {
          _bookmarkedIds.add(card.id);
          bookmarkBtn.classList.add('is-bookmarked');
          bookmarkBtn.querySelector('svg')?.setAttribute('fill', 'currentColor');
          app.showToast(`⭐ Đã lưu từ "${card.word}" vào mục Yêu thích`, 'success', 1800);
        } else {
          _bookmarkedIds.delete(card.id);
          bookmarkBtn.classList.remove('is-bookmarked');
          bookmarkBtn.querySelector('svg')?.setAttribute('fill', 'none');
          app.showToast(`Đã bỏ lưu từ "${card.word}"`, 'info', 1600);
        }
        saveBookmarks();
      } else if (action === 'next-slide') {
        e.stopPropagation();
        scrollToNextReel();
      }
    });
  }

  // Khởi tạo Intersection Observer
  setupIntersectionObserver();

  // Kích hoạt slide đầu tiên
  activateSlide(0);

  // Phím tắt bàn phím (Desktop)
  _keyHandler = (e) => {
    if (e.key === 'Escape') {
      closeReelsSession();
    } else if (e.key === 'ArrowDown' || e.key === 'j' || e.key === ' ') {
      e.preventDefault();
      scrollToNextReel();
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      scrollToPrevReel();
    } else if (e.key === '1') {
      handleRateCard(Rating.Again);
    } else if (e.key === '2') {
      handleRateCard(Rating.Hard);
    } else if (e.key === '3') {
      handleRateCard(Rating.Good);
    } else if (e.key === '4') {
      handleRateCard(Rating.Easy);
    } else if (e.key === 'r' || e.key === 'R') {
      const card = _reelsQueue[_currentIndex];
      if (card) speak(card.word, { cardObj: card });
    } else if (e.key === 'm' || e.key === 'M') {
      const slide = document.getElementById(`reel-slide-${_currentIndex}`);
      slide?.querySelector('.reel-meaning-box')?.classList.toggle('blurred');
    }
  };
  window.addEventListener('keydown', _keyHandler);
}

