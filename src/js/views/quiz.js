/**
 * Quiz View Controller - FSRS-6 Smart Multiple-Choice Spaced Repetition Engine
 * 1. Thuật toán chọn 3 đáp án gây nhiễu thông minh (Cùng chủ đề, cùng loại từ POS & từ yếu)
 * 2. Đo thời gian phản xạ (Reaction Latency) & Khóa chống spam/đoán mò (< 0.8s)
 * 3. Tự động tính toán & ghi nhận FSRS-6 trực tiếp vào cùng luồng dữ liệu chuẩn
 */

import { FSRS, Rating } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { WORDS } from '../../data/index.js';
import { escapeHTML, scrollToTop, shuffle } from '../utils.js';
import { speak, unlockAudioContext } from '../services/audio.js';
import { globalStudyTimer } from '../core/stats.js';
import { showConfirm } from './components.js';

const QUIZ_SESSION_LIMIT = 25;

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
let _quizOptions = {};
let _reviewedCards = [];

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

  const selectedCards = [
    ...shuffle([...sameTopicSamePos]),
    ...shuffle([...samePos]),
    ...shuffle([...sameTopic]),
    ...shuffle([...remaining])
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
      <!-- 1. Header Bar: Nút thoát & Chỉ số số lượng từ -->
      <header class="quiz-header-bar">
        <button type="button" class="btn-quiz-close" id="btn-quiz-close" title="Thoát bài ôn (Esc)" aria-label="Thoát bài ôn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <div class="quiz-header-stats">
          <div class="quiz-stat-pill pill-due" title="Số từ cần ôn trong phiên này">
            <span>⚡ Ôn: <strong id="quiz-stat-due">0</strong></span>
          </div>
          <div class="quiz-stat-pill pill-new" title="Số từ mới trong phiên này">
            <span>🌱 Mới: <strong id="quiz-stat-new">0</strong></span>
          </div>
          <div class="quiz-stat-pill pill-progress" title="Tiến độ bài học">
            <span id="quiz-progress-counter">1/10</span>
          </div>
        </div>
      </header>

      <!-- 2. Main Question Card -->
      <main class="quiz-main-stage">
        <div class="quiz-question-card" id="quiz-question-card">
          <!-- Huy hiệu trạng thái FSRS của từ vựng hiện tại -->
          <div class="quiz-word-status-row">
            <span class="quiz-status-pill" id="quiz-word-status">🌱 Từ mới</span>
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

          <p class="quiz-prompt-hint">Chọn nghĩa tiếng Việt:</p>
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
      if (reviewed === 0) {
        closeQuizSession(true);
        return;
      }

      const confirmed = await showConfirm({
        title: 'Dừng phiên trắc nghiệm?',
        message: `Bạn đã làm xong ${reviewed}/${_quizQueue.length} câu. Bạn có muốn xem bảng tổng kết tiến độ các từ vừa ôn không?`,
        confirmText: 'Xem Kết Quả & Dừng',
        cancelText: 'Làm Tiếp',
        type: 'primary',
        icon: '📊'
      });

      if (confirmed) {
        closeQuizSession(false);
        showQuizSummaryModal(_quizStats);
      }
    };
  }

  const btnNext = document.getElementById('btn-quiz-next');
  if (btnNext) {
    btnNext.onclick = () => {
      advanceQuizQuestion();
    };
  }

  const btnModeSwitch = document.getElementById('btn-quiz-mode-switch');
  if (btnModeSwitch) {
    btnModeSwitch.onclick = () => {
      try {
        const startIndex = _isAnswerLocked ? _quizIndex + 1 : _quizIndex;
        const remainingQueue = (_quizQueue || []).slice(startIndex);
        if (!remainingQueue || remainingQueue.length === 0) {
          _quizApp?.showToast('🎉 Bạn đã hoàn thành toàn bộ thẻ trong hàng đợi!', 'success');
          finishQuizSession();
          return;
        }

        closeQuizSession(false);
        _quizApp?.startStudySession(null, null, remainingQueue);
        _quizApp?.showToast('🎴 Đã chuyển sang chế độ Flashcard 3D', 'info', 2000);
      } catch (err) {
        console.error('Lỗi chuyển sang Flashcard:', err);
      }
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
    _quizOptions = { ...options };
    _reviewedCards = [];

    let queue = customQueue;
    if (!queue || queue.length === 0) {
      if (options && options.mode === 'redemption') {
        // Thử Thách Chuộc Lỗi: Lấy từ vựng (ưu tiên từ đã học)
        const allCards = app.deckManager ? app.deckManager.getAllCards() : WORDS;
        const cardStates = StorageManager.getAllCardStates() || {};
        const learnedPool = allCards.filter(c => {
          const s = cardStates[c.id];
          return s && (s.state > 0 || s.reps > 0);
        });
        const pool = learnedPool.length >= QUIZ_SESSION_LIMIT ? learnedPool : allCards;
        queue = shuffle([...pool]).slice(0, QUIZ_SESSION_LIMIT);
      } else {
        const studyQueue = app.deckManager.getStudyQueue(null, app.settings, null, { mode: 'interleave' });
        
        if (options && options.mode === 'new_only') {
          queue = (studyQueue.newCards || []).slice(0, QUIZ_SESSION_LIMIT);
        } else if (options && options.mode === 'due_only') {
          queue = (studyQueue.dueCards || []).slice(0, QUIZ_SESSION_LIMIT);
        } else {
          // VÒNG LẶP TRẮC NGHIỆM 3-1-3-1 ĐAN XEN NHẬN THỨC THEO NHỊP:
          // - Đợt 1: 3 từ đến hạn ôn
          // - Xen 1 từ khó / hay quên (nếu có)
          // - Đợt 2: 3 từ đến hạn ôn tiếp theo
          // - Xen 1 từ mới sau 2 đợt ôn (6 lượt ôn)
          const dueList = studyQueue.dueCards || [];
          const newList = studyQueue.newCards || [];
          const weakList = studyQueue.weakCards || [];
          
          if (dueList.length > 0 || newList.length > 0) {
            const interleaved = [];
            let d = 0;
            let w = 0;
            let n = 0;
            const seenIds = new Set();
            
            const pushCard = (card) => {
              if (card && card.id && !seenIds.has(card.id) && interleaved.length < QUIZ_SESSION_LIMIT) {
                seenIds.add(card.id);
                interleaved.push(card);
                return true;
              }
              return false;
            };

            while (interleaved.length < QUIZ_SESSION_LIMIT && (d < dueList.length || w < weakList.length || n < newList.length)) {
              // Đợt 1: 3 từ đến hạn
              for (let i = 0; i < 3 && d < dueList.length; i++) {
                pushCard(dueList[d++]);
              }

              // Xen 1 từ khó / hay quên (nếu có)
              if (w < weakList.length) {
                while (w < weakList.length && !pushCard(weakList[w++])) {}
              }

              // Đợt 2: 3 từ đến hạn tiếp theo
              for (let i = 0; i < 3 && d < dueList.length; i++) {
                pushCard(dueList[d++]);
              }

              // Xen 1 từ mới sau 2 đợt ôn (6 lượt ôn)
              if (n < newList.length) {
                while (n < newList.length && !pushCard(newList[n++])) {}
              }

              if (d >= dueList.length && w >= weakList.length && n >= newList.length) break;
            }
            queue = interleaved;
          } else if (weakList.length > 0) {
            queue = weakList.slice(0, QUIZ_SESSION_LIMIT);
          } else if (studyQueue.queue && studyQueue.queue.length > 0) {
            queue = studyQueue.queue.slice(0, QUIZ_SESSION_LIMIT);
          } else {
            // Luyện phản xạ từ vựng tổng hợp
            const allCards = app.deckManager.getAllCards() || WORDS;
            queue = shuffle([...allCards]).slice(0, Math.min(QUIZ_SESSION_LIMIT, 15));
          }
        }
      }
    }

    if (!queue || queue.length === 0) {
      app.showToast('🎉 Hiện không có từ vựng nào trong hàng đợi.', 'info', 3000);
      return;
    }

    // Giới hạn số lượng thẻ mỗi phiên trắc nghiệm theo chuẩn 25 từ
    if (queue.length > QUIZ_SESSION_LIMIT) {
      queue = queue.slice(0, QUIZ_SESSION_LIMIT);
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
 * Phân tích trạng thái FSRS của từ vựng hiện tại
 */
function getCardStatusInfo(card) {
  const state = StorageManager.getCardState(card.id);
  if (!state || state.state === 0 || state.reps === 0) {
    return { label: '🌱 Từ mới', className: 'status-new' };
  }
  if (state.state === 3 || (state.lapses && state.lapses >= 2)) {
    return { label: '🔥 Hay quên', className: 'status-lapse' };
  }
  if (state.stability && state.stability >= 21) {
    return { label: '💎 Ghi nhớ sâu', className: 'status-mastered' };
  }
  if (state.stability && state.stability < 3) {
    return { label: '⚠️ Cần củng cố', className: 'status-fragile' };
  }
  return { label: '⚡ Tới hạn ôn', className: 'status-due' };
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

  // Cập nhật Header: Đếm số từ ôn & từ mới còn lại trong phiên
  const elDue = document.getElementById('quiz-stat-due');
  const elNew = document.getElementById('quiz-stat-new');
  const elCounter = document.getElementById('quiz-progress-counter');

  let dueCount = 0;
  let newCount = 0;
  for (let i = index; i < _quizQueue.length; i++) {
    const s = StorageManager.getCardState(_quizQueue[i].id);
    if (!s || s.state === 0 || s.reps === 0) newCount++;
    else dueCount++;
  }

  if (elDue) elDue.textContent = dueCount;
  if (elNew) elNew.textContent = newCount;
  if (elCounter) elCounter.textContent = `${index + 1}/${_quizQueue.length}`;

  // Cập nhật Thẻ Câu Hỏi
  const elWord = document.getElementById('quiz-word-prompt');
  const elIpa = document.getElementById('quiz-ipa-text');
  const elStatus = document.getElementById('quiz-word-status');
  const btnSpeaker = document.getElementById('btn-quiz-speaker');
  const actionBar = document.getElementById('quiz-action-bar');

  if (actionBar) {
    actionBar.classList.remove('active');
  }

  // Hiển thị trạng thái FSRS của từ vựng hiện tại (Từ mới / Tới hạn / Hay quên / Ghi nhớ sâu)
  if (elStatus) {
    const statusInfo = getCardStatusInfo(card);
    elStatus.textContent = statusInfo.label;
    elStatus.className = `quiz-status-pill ${statusInfo.className}`;
  }

  if (elWord) elWord.textContent = card.word || '...';
  if (elIpa) elIpa.textContent = card.phonetic || card.ipa || '';

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

  // 1. Phân loại Điểm FSRS chạy ngầm: Đúng là Tốt (Good), Sai là Quên (Again)
  const rating = isCorrect ? Rating.Good : Rating.Again;

  if (!isCorrect) {
    _comboCount = 0;
    _quizStats.wrong++;
  } else {
    _comboCount++;
    if (_comboCount > _quizStats.comboMax) _quizStats.comboMax = _comboCount;
    _quizStats.correct++;
  }

  _quizStats.ratings[rating]++;

  // 2. Tính toán và Lưu Thuật Toán FSRS-6 Trực Tiếp ngầm
  try {
    const fsrs = new FSRS({
      w: _quizApp?.settings?.fsrsW,
      requestRetention: _quizApp?.settings?.requestRetention || 0.90,
      enableFuzz: _quizApp?.settings?.enableFuzz !== false,
      leechThreshold: _quizApp?.settings?.leechThreshold || 8,
      leechAction: _quizApp?.settings?.leechAction || 'suspend'
    });

    const now = new Date();
    const oldState = StorageManager.getCardState(card.id) || FSRS.createEmptyCard(card.id);
    const nextState = fsrs.calculateNextState(oldState, rating, now, {
      enableFuzz: _quizApp?.settings?.enableFuzz !== false,
      leechThreshold: _quizApp?.settings?.leechThreshold || 8,
      leechAction: _quizApp?.settings?.leechAction || 'suspend'
    });

    // Lưu bền vững vào IndexedDB & RAM Cache
    StorageManager.saveCardState(nextState);

    // Ghi nhật ký học tập chính xác ngầm
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

    // Lưu vào danh sách các từ đã hoàn thành trong phiên để hiển thị ở Bảng tổng kết
    _reviewedCards.push({
      id: card.id,
      word: card.word,
      meaning: card.meaning || '',
      ipa: card.phonetic || card.ipa || '',
      isCorrect,
      scheduledDays: nextState.scheduled_days !== undefined ? nextState.scheduled_days : 0,
      due: nextState.due,
      stability: nextState.stability || 0
    });

    // Cập nhật ngay huy hiệu trạng thái FSRS trên thẻ câu hỏi để người dùng thấy rõ từ đã được lưu
    const elWordStatus = document.getElementById('quiz-word-status');
    if (elWordStatus) {
      const nextDays = nextState.scheduled_days !== undefined ? nextState.scheduled_days : 0;
      let nextDaysText = '10 phút';
      if (nextDays >= 1) {
        nextDaysText = `${Math.round(nextDays)} ngày`;
      } else if (nextDays > 0.05) {
        nextDaysText = `${Math.max(1, Math.round(nextDays * 24))} giờ`;
      }
      if (isCorrect) {
        elWordStatus.innerHTML = `✓ Đã lưu FSRS: Ôn lại sau <strong>${nextDaysText}</strong>`;
        elWordStatus.className = 'quiz-status-pill status-saved-good';
      } else {
        elWordStatus.innerHTML = `✗ Đã ghi nhận FSRS: Cần ôn lại sớm (<strong>${nextDaysText}</strong>)`;
        elWordStatus.className = 'quiz-status-pill status-saved-again';
      }
    }

    if (_quizApp?.deckManager) {
      _quizApp.deckManager.invalidateStatsCache();
    }
  } catch (err) {
    console.error('Lỗi cập nhật FSRS ngầm trong Quiz:', err);
    // Dự phòng lưu kết quả nếu tính FSRS lỗi
    _reviewedCards.push({
      id: card.id,
      word: card.word,
      meaning: card.meaning || '',
      ipa: card.phonetic || card.ipa || '',
      isCorrect,
      scheduledDays: isCorrect ? 1 : 0
    });
  }

  // 3. Phản hồi màu sắc đơn giản tức thì: Đúng xanh lá, Sai đỏ
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

  // 4. Hiển thị nút "Tiếp tục" để người dùng chủ động bấm chuyển câu (Không tự động nhảy câu)
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
  try { StorageManager.flushPendingSync(); } catch (e) {}
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

  const reviewedList = _reviewedCards || [];
  const total = reviewedList.length > 0 ? reviewedList.length : (stats.total || 1);
  const correct = reviewedList.length > 0 ? reviewedList.filter(c => c.isCorrect).length : (stats.correct || 0);
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgLatencySec = total > 0 ? ((stats.totalLatencyMs / total) / 1000).toFixed(1) : '0.0';

  const isRedemptionMode = _quizOptions && _quizOptions.mode === 'redemption';
  const isRedemptionSuccess = isRedemptionMode && accuracyPct >= 80;

  if (isRedemptionSuccess && _quizOptions.targetDateKey) {
    try {
      StorageManager.redeemStreak(_quizOptions.targetDateKey);
      if (_quizApp && typeof _quizApp.updateHeaderBadges === 'function') {
        _quizApp.updateHeaderBadges();
      }
    } catch (e) {
      console.warn('Lỗi ghi nhận chuộc lỗi streak:', e);
    }
  }

  let headerIcon = '🎯';
  let headerTitle = reviewedList.length >= _quizQueue.length ? 'Hoàn Thành Bài Trắc Nghiệm!' : 'Tổng Kết Phiên Học Trắc Nghiệm';
  let headerDesc = 'Toàn bộ tiến trình đã được thuật toán FSRS-6 ghi nhận chính xác.';
  let specialBadge = '';

  if (isRedemptionMode) {
    if (isRedemptionSuccess) {
      headerIcon = '🎉';
      headerTitle = 'Cứu Chuỗi Streak Thành Công!';
      headerDesc = `Xuất sắc! Độ chính xác đạt ${accuracyPct}% (≥ 80%). Chuỗi ngày học của bạn đã được kết nối lại trọn vẹn!`;
      specialBadge = `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.28); color: #10b981; border-radius: 999px; padding: 6px 14px; font-weight: 800; font-size: 0.85rem; margin: 0 auto 14px auto; display: inline-flex; align-items: center; gap: 6px;">
          🔥 Chuỗi ngày học đã được khôi phục
        </div>
      `;
    } else {
      headerIcon = '💪';
      headerTitle = 'Chưa Đạt Mục Tiêu Chuộc Lỗi';
      headerDesc = `Độ chính xác hiện tại là ${accuracyPct}% (Yêu cầu ≥ 80%). Bạn chỉ cần nỗ lực thêm một chút nữa thôi!`;
      specialBadge = `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.28); color: #f59e0b; border-radius: 999px; padding: 6px 14px; font-weight: 800; font-size: 0.85rem; margin: 0 auto 14px auto; display: inline-flex; align-items: center; gap: 6px;">
          ⏳ Cần đạt từ 80% để cứu streak
        </div>
      `;
    }
  }

  // Danh sách chi tiết các từ vựng & Thời hạn tới hạn FSRS
  const wordsListHtml = reviewedList.length > 0 ? `
    <div class="quiz-summary-words-box">
      <div class="quiz-summary-words-header">
        <span>Từ vựng đã ôn (${reviewedList.length})</span>
        <span>Lịch ôn kế tiếp</span>
      </div>
      <div class="quiz-summary-words-list">
        ${reviewedList.map(item => {
          const days = item.scheduledDays !== undefined ? item.scheduledDays : 0;
          let dueBadgeText = '';
          let dueBadgeClass = '';
          if (days <= 0.05) {
            dueBadgeText = '10 phút';
            dueBadgeClass = 'due-lapse';
          } else if (days < 1) {
            dueBadgeText = `${Math.max(1, Math.round(days * 24))} giờ`;
            dueBadgeClass = 'due-lapse';
          } else if (days === 1) {
            dueBadgeText = '1 ngày';
            dueBadgeClass = 'due-short';
          } else {
            dueBadgeText = `${Math.round(days)} ngày`;
            dueBadgeClass = days >= 14 ? 'due-long' : 'due-mid';
          }

          return `
            <div class="quiz-summary-word-item">
              <div class="quiz-word-meta">
                <span class="quiz-result-icon ${item.isCorrect ? 'icon-correct' : 'icon-wrong'}">
                  ${item.isCorrect ? '✓' : '✗'}
                </span>
                <div class="quiz-word-text-col">
                  <strong class="quiz-word-eng">${escapeHTML(item.word)}</strong>
                  <span class="quiz-word-vie">${escapeHTML(item.meaning)}</span>
                </div>
              </div>
              <div class="quiz-due-tag ${dueBadgeClass}" title="Thuật toán FSRS-6 lên lịch lặp lại">
                <span class="quiz-due-label">Sau ${dueBadgeText}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  modal.innerHTML = `
    <div class="confirm-dialog-card quiz-summary-card" style="text-align: center;">
      <div class="quiz-summary-scroll-content">
        <div style="font-size: 2.3rem; margin-bottom: 4px;">${headerIcon}</div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0;">${headerTitle}</h3>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0 0 12px 0;">${headerDesc}</p>
        ${specialBadge}

        <!-- 4 Bento Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 14px; text-align: left;">
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px;">
            <span style="font-size: 0.66rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Độ chính xác</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: ${accuracyPct >= 80 ? '#10b981' : '#f59e0b'};">${accuracyPct}%</div>
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

        <!-- Chi tiết các từ vựng & thời hạn tới hạn -->
        ${wordsListHtml}
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        ${isRedemptionMode && !isRedemptionSuccess ? `
          <button type="button" id="btn-quiz-retry-redemption" class="btn-confirm-primary" style="flex: 1; min-height: 42px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; background: var(--primary); color: white;">
            ⚡ Thử Lại Ngay
          </button>
        ` : ''}
        <button type="button" id="btn-quiz-summary-done" class="${isRedemptionMode && !isRedemptionSuccess ? 'btn-confirm-secondary' : 'btn-confirm-primary'}" style="flex: 1; min-height: 42px; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
          ${isRedemptionSuccess ? '🔥 Xem Chuỗi & Tiếp Tục' : 'Về Trang Chủ'}
        </button>
      </div>
    </div>
  `;

  const btnRetry = modal.querySelector('#btn-quiz-retry-redemption');
  if (btnRetry) {
    btnRetry.onclick = () => {
      modal.className = 'confirm-dialog-overlay';
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 200);
      if (_quizApp) {
        startQuizSession(_quizApp, null, _quizOptions);
      }
    };
  }

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
