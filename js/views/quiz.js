/**
 * Quiz View Controller - FSRS-6 Smart Multiple-Choice Spaced Repetition Engine
 * 1. Thuật toán chọn 3 đáp án gây nhiễu thông minh (Cùng chủ đề, cùng loại từ POS & từ yếu)
 * 2. Đo thời gian phản xạ (Reaction Latency) & Khóa chống spam/đoán mò (< 0.8s)
 * 3. Tự động tính toán & ghi nhận FSRS-6 trực tiếp vào cùng luồng dữ liệu chuẩn
 */

import { FSRS, Rating, State } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { WORDS } from '../../data/index.js';
import { escapeHTML, scrollToTop } from '../utils.js';
import { speak, unlockAudioContext } from '../services/audio.js';
import { globalStudyTimer } from '../core/stats.js';
import { showConfirm } from './components.js';

let _quizApp = null;
let _quizQueue = [];
let _quizIndex = 0;
let _quizStartTime = 0;
let _questionStartTime = 0;
let _reflexInterval = null;
let _comboCount = 0;
let _isAnswerLocked = false;
let _audioCtx = null;
let _timerUnsubscribe = null;
let _autoSpeakTimer = null;

// Thống kê phiên trắc nghiệm
let _quizStats = {
  total: 0,
  correct: 0,
  wrong: 0,
  comboMax: 0,
  totalLatencyMs: 0,
  ratings: {
    [Rating.Again]: 0,
    [Rating.Hard]: 0,
    [Rating.Good]: 0,
    [Rating.Easy]: 0
  }
};

/**
 * Phát âm thanh phản hồi nhẹ nhàng bằng Web Audio API
 */
function playFeedbackTone(isCorrect) {
  try {
    if (!_audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) _audioCtx = new AudioCtxClass();
    }
    if (!_audioCtx) return;
    if (_audioCtx.state === 'suspended') _audioCtx.resume();

    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);

    const now = _audioCtx.currentTime;

    if (isCorrect) {
      // Tiếng ting 2 âm sắc vui tươi
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Tiếng buzzer nhẹ cảnh báo
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(196, now + 0.1); // G3
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}

/**
 * Sinh 3 đáp án gây nhiễu thông minh (Smart Distractors)
 */
function generateDistractors(targetCard, allPool) {
  const correctMeaning = (targetCard.meaning || '').trim();
  const targetPos = (targetCard.pos || '').toLowerCase();
  const targetTopicId = Array.isArray(targetCard.topicIds) && targetCard.topicIds.length > 0 ? targetCard.topicIds[0] : null;

  const pool = allPool && allPool.length > 0 ? allPool : WORDS;
  const candidates = pool.filter(c => c.id !== targetCard.id && (c.meaning || '').trim() !== correctMeaning);

  // 1. Phân loại theo độ ưu tiên
  const sameTopicSamePos = [];
  const samePos = [];
  const sameTopic = [];
  const remaining = [];

  candidates.forEach(c => {
    const cPos = (c.pos || '').toLowerCase();
    const cTopicId = Array.isArray(c.topicIds) && c.topicIds.length > 0 ? c.topicIds[0] : null;

    const isPosMatch = targetPos && cPos === targetPos;
    const isTopicMatch = targetTopicId && cTopicId === targetTopicId;

    if (isPosMatch && isTopicMatch) sameTopicSamePos.push(c);
    else if (isPosMatch) samePos.push(c);
    else if (isTopicMatch) sameTopic.push(c);
    else remaining.push(c);
  });

  // Trộn mảng ngẫu nhiên
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const selectedCards = [
    ...shuffle(sameTopicSamePos),
    ...shuffle(samePos),
    ...shuffle(sameTopic),
    ...shuffle(remaining)
  ];

  const distractors = [];
  const seenMeanings = new Set([correctMeaning]);

  for (const c of selectedCards) {
    const m = (c.meaning || '').trim();
    if (m && !seenMeanings.has(m)) {
      seenMeanings.add(m);
      distractors.push(m);
      if (distractors.length >= 3) break;
    }
  }

  // Dự phòng nếu chưa đủ 3
  while (distractors.length < 3) {
    distractors.push(`Ý nghĩa dự phòng #${distractors.length + 1}`);
  }

  // Kết hợp đáp án đúng và 3 đáp án gây nhiễu rồi xáo trộn
  const options = [
    { text: correctMeaning, isCorrect: true },
    { text: distractors[0], isCorrect: false },
    { text: distractors[1], isCorrect: false },
    { text: distractors[2], isCorrect: false }
  ];

  return shuffle(options);
}

/**
 * Render Khung Shell của Quiz Overlay
 */
export function renderQuizOverlayShell() {
  let overlay = document.getElementById('quiz-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.className = 'quiz-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="quiz-layout-wrapper">
      <!-- 1. Header & Progress Bar -->
      <header class="quiz-header-bar">
        <button type="button" class="btn-quiz-close" id="btn-quiz-close" title="Thoát bài ôn (Esc)" aria-label="Thoát bài ôn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <div class="quiz-progress-section">
          <div class="quiz-progress-top-row">
            <div class="quiz-progress-left-meta">
              <span class="quiz-counter-text" id="quiz-progress-counter">1 / 10</span>
              <span class="quiz-combo-badge" id="quiz-combo-badge">🔥 x1 Combo</span>
            </div>

            <!-- Live Active Study Timer with Idle AFK Auto-Pause -->
            <div class="quiz-live-timer" id="quiz-live-timer" title="Thời gian học chủ động FSRS (Tự dừng khi treo máy)">
              <span class="timer-icon">⏱️</span>
              <span class="timer-digits" id="quiz-timer-digits">00:00</span>
              <span class="timer-status-dot is-active" id="quiz-timer-dot" title="Đang tính giờ"></span>
            </div>
          </div>
          <div class="quiz-progress-track">
            <div class="quiz-progress-fill" id="quiz-progress-fill" style="width: 10%;"></div>
          </div>
        </div>
      </header>

      <!-- 2. Main Question Card & Reflex Timer -->
      <main class="quiz-main-stage">
        <div class="quiz-question-card" id="quiz-question-card">
          <!-- Floating Reflex Result Badge -->
          <div class="quiz-reflex-toast" id="quiz-reflex-toast">⚡ Siêu tốc</div>

          <!-- Meta badges row (POS & CEFR only, no FSRS label) -->
          <div class="quiz-meta-pills-row">
            <span class="quiz-badge-pos" id="quiz-badge-pos">VERB</span>
            <span class="quiz-badge-cefr" id="quiz-badge-cefr">B1</span>
          </div>

          <!-- Word title -->
          <h2 class="quiz-word-prompt" id="quiz-word-prompt">Word</h2>

          <!-- IPA & Speaker -->
          <div class="quiz-ipa-row">
            <span class="quiz-ipa-text" id="quiz-ipa-text">/ wɜːrd /</span>
            <button type="button" class="btn-quiz-speaker" id="btn-quiz-speaker" title="Nghe phát âm" aria-label="Phát âm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
          </div>

          <p class="quiz-prompt-hint">Chọn nghĩa tiếng Việt chính xác nhất:</p>
        </div>

        <!-- 3. 4 Options Bento Grid -->
        <div class="quiz-options-grid" id="quiz-options-grid">
          <!-- Options dynamic injected -->
        </div>

        <!-- 4. Manual Advance Action Bar (Fixed Reserved Space, No Layout Shift) -->
        <div class="quiz-action-bar" id="quiz-action-bar">
          <button type="button" class="btn-quiz-next" id="btn-quiz-next">
            <span id="quiz-next-label">Tiếp tục</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  `;

  setupQuizEvents();
}

function setupQuizEvents() {
  const btnClose = document.getElementById('btn-quiz-close');
  if (btnClose) {
    btnClose.onclick = async () => {
      const reviewed = _quizStats.correct + _quizStats.wrong;
      const confirmed = await showConfirm({
        title: 'Thoát bài trắc nghiệm?',
        message: reviewed > 0 
          ? `Bạn đã hoàn thành ${reviewed} câu trắc nghiệm. Bạn có chắc chắn muốn dừng không?`
          : 'Bạn có chắc chắn muốn thoát phiên ôn tập này không?',
        confirmText: 'Thoát',
        type: 'danger',
        icon: '🚪'
      });

      if (confirmed) {
        closeQuizSession(true);
      }
    };
  }

  const btnNext = document.getElementById('btn-quiz-next');
  if (btnNext) {
    btnNext.onclick = () => {
      advanceQuizQuestion();
    };
  }

  // Phím tắt bàn phím 1, 2, 3, 4 hoặc A, B, C, D; Space / Enter để tiếp tục; R để nghe lại
  window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('quiz-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      const btn = document.getElementById('btn-quiz-close');
      if (btn) btn.click();
      return;
    }

    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      const currentCard = _quizQueue[_quizIndex];
      if (currentCard?.word) speak(currentCard.word);
      return;
    }

    // Khi đã trả lời xong, bấm Space hoặc Enter để sang câu tiếp theo
    if (_isAnswerLocked) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advanceQuizQuestion();
      }
      return;
    }

    let targetIdx = -1;
    if (e.key === '1' || e.key.toLowerCase() === 'a') targetIdx = 0;
    else if (e.key === '2' || e.key.toLowerCase() === 'b') targetIdx = 1;
    else if (e.key === '3' || e.key.toLowerCase() === 'c') targetIdx = 2;
    else if (e.key === '4' || e.key.toLowerCase() === 'd') targetIdx = 3;

    if (targetIdx >= 0) {
      e.preventDefault();
      const tiles = document.querySelectorAll('.quiz-option-tile');
      if (tiles[targetIdx]) {
        tiles[targetIdx].click();
      }
    }
  });
}

function advanceQuizQuestion() {
  _quizIndex++;
  loadQuizQuestion(_quizIndex);
}

/**
 * Bắt đầu phiên ôn tập / học từ mới trắc nghiệm FSRS
 */
export function startQuizSession(app, customQueue = null, options = {}) {
  try {
    unlockAudioContext();
    _quizApp = app;

    let queue = customQueue;
    if (!queue || queue.length === 0) {
      const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
      
      if (options && options.mode === 'new_only') {
        queue = studyQueue.newCards || [];
      } else if (options && options.mode === 'due_only') {
        queue = studyQueue.dueCards || [];
      } else {
        // Mặc định: Ưu tiên dueCards, nếu không có dueCards thì dùng newCards, nếu không có newCards thì dùng queue
        if (studyQueue.dueCards && studyQueue.dueCards.length > 0) {
          queue = studyQueue.dueCards;
        } else if (studyQueue.newCards && studyQueue.newCards.length > 0) {
          queue = studyQueue.newCards;
        } else if (studyQueue.queue && studyQueue.queue.length > 0) {
          queue = studyQueue.queue;
        } else {
          // Lấy 10 từ ngẫu nhiên để luyện phản xạ
          const allCards = app.deckManager.getAllCards() || WORDS;
          const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
          queue = shuffle(allCards).slice(0, 10);
        }
      }
    }

    if (!queue || queue.length === 0) {
      app.showToast('🎉 Hiện không có từ vựng nào trong hàng đợi.', 'info', 3000);
      return;
    }

    _quizQueue = [...queue];
    _quizIndex = 0;
    _comboCount = 0;
    _quizStartTime = Date.now();
    _quizStats = {
      total: _quizQueue.length,
      correct: 0,
      wrong: 0,
      comboMax: 0,
      totalLatencyMs: 0,
      ratings: {
        [Rating.Again]: 0,
        [Rating.Hard]: 0,
        [Rating.Good]: 0,
        [Rating.Easy]: 0
      }
    };

    renderQuizOverlayShell();
    const overlay = document.getElementById('quiz-overlay');
    if (overlay) overlay.classList.add('active');
    
    globalStudyTimer.startSession();
    if (_timerUnsubscribe) _timerUnsubscribe();
    _timerUnsubscribe = globalStudyTimer.subscribe((state) => {
      updateQuizLiveTimerUI(state);
    });

    loadQuizQuestion(_quizIndex);
  } catch (err) {
    console.error('Lỗi khởi động Quiz Session:', err);
  }
}

/**
 * Nạp câu hỏi trắc nghiệm hiện tại
 */
function loadQuizQuestion(index) {
  if (index >= _quizQueue.length) {
    finishQuizSession();
    return;
  }

  _isAnswerLocked = false;
  const card = _quizQueue[index];
  const allPool = _quizApp?.deckManager?.getAllCards() || WORDS;

  // Cập nhật Header Progress
  const total = _quizQueue.length;
  const currentNum = index + 1;
  const percent = Math.min(100, Math.round((currentNum / total) * 100));

  const elCounter = document.getElementById('quiz-progress-counter');
  const elFill = document.getElementById('quiz-progress-fill');
  const elCombo = document.getElementById('quiz-combo-badge');

  if (elCounter) elCounter.textContent = `${currentNum} / ${total}`;
  if (elFill) elFill.style.width = `${percent}%`;
  if (elCombo) {
    if (_comboCount >= 2) {
      elCombo.textContent = `🔥 x${_comboCount} Combo`;
      elCombo.classList.add('active');
    } else {
      elCombo.classList.remove('active');
    }
  }

  // Cập nhật Thẻ Câu Hỏi
  const elWord = document.getElementById('quiz-word-prompt');
  const elIpa = document.getElementById('quiz-ipa-text');
  const elPos = document.getElementById('quiz-badge-pos');
  const elCefr = document.getElementById('quiz-badge-cefr');
  const elToast = document.getElementById('quiz-reflex-toast');
  const btnSpeaker = document.getElementById('btn-quiz-speaker');
  const actionBar = document.getElementById('quiz-action-bar');

  if (actionBar) {
    actionBar.classList.remove('active');
  }

  if (elWord) elWord.textContent = card.word || '...';
  if (elIpa) elIpa.textContent = card.phonetic || card.ipa || '';
  if (elPos) elPos.textContent = (card.pos || 'word').toUpperCase();
  if (elCefr) elCefr.textContent = (card.cefr || card.level || 'A1').toUpperCase();
  if (elToast) elToast.className = 'quiz-reflex-toast';

  if (btnSpeaker) {
    btnSpeaker.onclick = (e) => {
      e.stopPropagation();
      btnSpeaker.classList.add('playing');
      speak(card.word, { cardObj: card });
      setTimeout(() => btnSpeaker.classList.remove('playing'), 1000);
    };
  }

  // Tự động phát âm từ vựng ngay lập tức khi vào câu hỏi mới (0ms delay)
  if (_autoSpeakTimer) {
    clearTimeout(_autoSpeakTimer);
    _autoSpeakTimer = null;
  }
  const shouldAutoSpeak = _quizApp?.settings?.autoPronounce !== false;
  if (shouldAutoSpeak && card && card.word) {
    if (btnSpeaker) btnSpeaker.classList.add('playing');
    speak(card.word, {
      cardObj: card,
      onEnd: () => {
        if (btnSpeaker) btnSpeaker.classList.remove('playing');
      }
    });
    setTimeout(() => {
      if (btnSpeaker) btnSpeaker.classList.remove('playing');
    }, 1200);
  }

  // Sinh 4 phương án trắc nghiệm
  const options = generateDistractors(card, allPool);
  const optionsGrid = document.getElementById('quiz-options-grid');
  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    const keys = ['A', 'B', 'C', 'D'];

    options.forEach((opt, optIdx) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'quiz-option-tile';
      tile.setAttribute('data-idx', optIdx);

      tile.innerHTML = `
        <span class="quiz-option-key">${keys[optIdx]}</span>
        <span class="quiz-option-text">${escapeHTML(opt.text)}</span>
      `;

      tile.onclick = () => {
        handleOptionSelected(tile, opt, card, options);
      };

      optionsGrid.appendChild(tile);
    });
  }

  // Bắt đầu đo thời gian phản xạ (High-Resolution Timer tính toán ngầm)
  _questionStartTime = performance.now();
}

/**
 * Xử lý khi người dùng chọn một phương án
 */
function handleOptionSelected(selectedTile, selectedOpt, card, allOptions) {
  if (_isAnswerLocked) return;
  _isAnswerLocked = true;

  const elapsedMs = performance.now() - _questionStartTime;
  const elapsedSec = elapsedMs / 1000;
  _quizStats.totalLatencyMs += elapsedMs;

  globalStudyTimer.recordActivity();

  const isCorrect = selectedOpt.isCorrect === true;
  playFeedbackTone(isCorrect);

  // 1. Phân loại Điểm FSRS theo Khoa Học Nhận Thức & Quy tắc Trắc Nghiệm
  const oldCardState = StorageManager.getCardState(card.id) || FSRS.createEmptyCard(card.id);
  const pastReps = oldCardState.reps || 0;

  let rating = Rating.Good;
  let toastClass = 'toast-good';
  let toastText = '✨ Chuẩn xác (+Good)';

  if (!isCorrect) {
    rating = Rating.Again;
    toastClass = 'toast-again';
    toastText = '❌ Chưa nhớ (+Again)';
    _comboCount = 0;
    _quizStats.wrong++;
  } else {
    _comboCount++;
    if (_comboCount > _quizStats.comboMax) _quizStats.comboMax = _comboCount;
    _quizStats.correct++;

    // LỚP 1: KHÓA CHỐNG SPAM / ĐOÁN MÒ (< 0.8s)
    if (elapsedSec < 0.8) {
      rating = Rating.Hard;
      toastClass = 'toast-hard';
      toastText = '🛡️ Quá nhanh (<0.8s) • Khó (+Hard)';
    } else if (elapsedSec <= 2.5) {
      // Phản xạ nhanh: Chỉ cấp Easy nếu từ này đã được học/ôn thành công từ 3 lần trở lên
      if (pastReps >= 3) {
        rating = Rating.Easy;
        toastClass = 'toast-easy';
        toastText = `⚡ Đã nhớ sâu (Ôn x${pastReps}) • Dễ (+Easy)`;
      } else {
        rating = Rating.Good;
        toastClass = 'toast-good';
        toastText = `✨ Chuẩn xác (${elapsedSec.toFixed(1)}s) • Tốt (+Good)`;
      }
    } else if (elapsedSec <= 5.5) {
      // Trả lời chuẩn xác trong thời gian đọc hiểu thông thường
      rating = Rating.Good;
      toastClass = 'toast-good';
      toastText = `✨ Chuẩn xác (${elapsedSec.toFixed(1)}s) • Tốt (+Good)`;
    } else {
      // Phân vân lâu
      rating = Rating.Hard;
      toastClass = 'toast-hard';
      toastText = `⏳ Phân vân (${elapsedSec.toFixed(1)}s) • Khó (+Hard)`;
    }
  }

  _quizStats.ratings[rating]++;

  // 2. Tính toán và Lưu Thuật Toán FSRS-6 Trực Tiếp (Shared SSOT Stream)
  try {
    const fsrs = new FSRS({
      requestRetention: _quizApp?.settings?.requestRetention || 0.90,
      enableFuzz: _quizApp?.settings?.enableFuzz !== false,
      leechThreshold: _quizApp?.settings?.leechThreshold || 6,
      leechAction: _quizApp?.settings?.leechAction || 'tag'
    });

    const now = new Date();
    const oldState = StorageManager.getCardState(card.id) || FSRS.createEmptyCard(card.id);
    const nextState = fsrs.calculateNextState(oldState, rating, now, {
      enableFuzz: _quizApp?.settings?.enableFuzz !== false,
      leechThreshold: _quizApp?.settings?.leechThreshold || 6,
      leechAction: _quizApp?.settings?.leechAction || 'tag'
    });

    // Lưu bền vững vào IndexedDB & RAM Cache
    StorageManager.saveCardState(nextState);

    // Ghi nhật ký học tập chính xác
    StorageManager.logReview({
      cardId: card.id,
      word: card.word,
      rating: rating,
      oldState: oldState.state,
      newState: nextState.state,
      scheduledDays: nextState.scheduled_days,
      stability: nextState.stability,
      difficulty: nextState.difficulty,
      isQuiz: true,
      latencySec: Number(elapsedSec.toFixed(2))
    });
  } catch (err) {
    console.error('Lỗi cập nhật FSRS trong Quiz:', err);
  }

  // 3. Hiển thị Visual Feedback tức thì
  const tiles = document.querySelectorAll('.quiz-option-tile');
  tiles.forEach(t => {
    t.classList.add('locked');
    const idx = parseInt(t.getAttribute('data-idx'), 10);
    const opt = allOptions[idx];

    if (opt && opt.isCorrect) {
      t.classList.add('state-correct');
    } else if (t === selectedTile && !isCorrect) {
      t.classList.add('state-wrong');
    } else {
      t.classList.add('state-dimmed');
    }
  });

  const toast = document.getElementById('quiz-reflex-toast');
  if (toast) {
    toast.textContent = toastText;
    toast.className = `quiz-reflex-toast ${toastClass} show`;
  }

  // 4. Hiển thị nút "Tiếp tục" thủ công (Không tự động nhảy câu & Không giật layout)
  const actionBar = document.getElementById('quiz-action-bar');
  const nextLabel = document.getElementById('quiz-next-label');
  const isLast = _quizIndex + 1 >= _quizQueue.length;

  if (nextLabel) {
    nextLabel.textContent = isLast ? 'Xem Kết Quả' : 'Tiếp tục';
  }

  if (actionBar) {
    actionBar.classList.add('active');
  }
}

/**
 * Kết thúc phiên trắc nghiệm & Tổng kết
 */
function finishQuizSession() {
  closeQuizSession(false);
  showQuizSummaryModal(_quizStats);
}

function updateQuizLiveTimerUI(state) {
  if (!state) return;
  const elDigits = document.getElementById('quiz-timer-digits');
  const elContainer = document.getElementById('quiz-live-timer');
  const elDot = document.getElementById('quiz-timer-dot');
  if (!elDigits || !elContainer) return;

  elDigits.textContent = state.formattedSessionTime || '00:00';

  if (state.isIdle || state.isPaused) {
    elContainer.classList.add('is-idle');
    elContainer.setAttribute('title', 'Tạm dừng tính giờ (Đang treo máy - tương tác lại để tiếp tục)');
    if (elDot) elDot.className = 'timer-status-dot is-idle';
  } else {
    elContainer.classList.remove('is-idle');
    elContainer.setAttribute('title', 'Thời gian học chủ động FSRS (Tự dừng khi treo máy)');
    if (elDot) elDot.className = 'timer-status-dot is-active';
  }
}

function closeQuizSession(isCancel = false) {
  if (_autoSpeakTimer) {
    clearTimeout(_autoSpeakTimer);
    _autoSpeakTimer = null;
  }
  if (_timerUnsubscribe) {
    _timerUnsubscribe();
    _timerUnsubscribe = null;
  }
  if (_reflexInterval) clearInterval(_reflexInterval);
  globalStudyTimer.endSession();
  const overlay = document.getElementById('quiz-overlay');
  if (overlay) overlay.classList.remove('active');
  scrollToTop();

  if (_quizApp) {
    _quizApp.refreshAllViews();
  }
}

/**
 * Modal Báo Cáo Tổng Kết Sau Khi Hoàn Thành Bài Trắc Nghiệm
 */
function showQuizSummaryModal(stats) {
  let modal = document.getElementById('quiz-summary-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quiz-summary-modal';
    modal.className = 'confirm-dialog-overlay active';
    document.body.appendChild(modal);
  } else {
    modal.className = 'confirm-dialog-overlay active';
  }

  const total = stats.total || 1;
  const correct = stats.correct || 0;
  const accuracyPct = Math.round((correct / total) * 100);
  const avgLatencySec = total > 0 ? ((stats.totalLatencyMs / total) / 1000).toFixed(1) : '0.0';

  modal.innerHTML = `
    <div class="confirm-dialog-card" style="max-width: 440px; text-align: center;">
      <div style="font-size: 2.4rem; margin-bottom: 6px;">🎯</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0;">Hoàn Thành Bài Trắc Nghiệm!</h3>
      <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0 0 16px 0;">Toàn bộ tiến trình đã được thuật toán FSRS-6 ghi nhận chính xác.</p>

      <!-- 4 Bento Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; text-align: left;">
        <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px;">
          <span style="font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Độ chính xác</span>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: #10b981;">${accuracyPct}%</div>
          <span style="font-size: 0.64rem; color: var(--text-secondary);">${correct}/${total} câu đúng</span>
        </div>

        <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px;">
          <span style="font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Tốc độ phản xạ</span>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--primary);">${avgLatencySec}s</div>
          <span style="font-size: 0.64rem; color: var(--text-secondary);">Trung bình mỗi câu</span>
        </div>

        <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px;">
          <span style="font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Chuỗi combo</span>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: #f59e0b;">🔥 x${stats.comboMax}</div>
          <span style="font-size: 0.64rem; color: var(--text-secondary);">Liên tiếp nhiều nhất</span>
        </div>

        <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px;">
          <span style="font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Phân bố FSRS</span>
          <div style="font-size: 0.74rem; font-weight: 700; margin-top: 4px; display: flex; gap: 6px;">
            <span style="color: #10b981;">⚡${stats.ratings[Rating.Easy]}</span>
            <span style="color: #6366f1;">✨${stats.ratings[Rating.Good]}</span>
            <span style="color: #f59e0b;">⏳${stats.ratings[Rating.Hard]}</span>
            <span style="color: #ef4444;">❌${stats.ratings[Rating.Again]}</span>
          </div>
          <span style="font-size: 0.64rem; color: var(--text-secondary);">Easy/Good/Hard/Again</span>
        </div>
      </div>

      <button type="button" id="btn-quiz-summary-done" class="btn-confirm-primary" style="width: 100%; min-height: 42px; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
        Về Trang Chủ Ôn Tập
      </button>
    </div>
  `;

  const btnDone = modal.querySelector('#btn-quiz-summary-done');
  if (btnDone) {
    btnDone.onclick = () => {
      modal.className = 'confirm-dialog-overlay';
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 200);
      if (_quizApp) _quizApp.switchTab('tab-review');
    };
  }
}
