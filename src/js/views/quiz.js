/**
 * Quiz View Controller - FSRS-6 Smart Multiple-Choice Spaced Repetition Engine
 * Orchestrator nối shell, engine distractors & modal tổng kết.
 */

import { FSRS, Rating } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { WORDS } from '../../data/index.js';
import { escapeHTML, scrollToTop } from '../utils.js';
import { speak, unlockAudioContext } from '../services/audio.js';
import { globalStudyTimer } from '../core/stats.js';
import { createEmptyQuizStats, quizState } from './quiz/state.js';
import { playFeedbackTone, generateDistractors, buildQuizQueue, getCardStatusInfo } from './quiz/engine.js';
import { renderQuizOverlayShell, updateQuizLiveTimerUI } from './quiz/shell.js';
import { showQuizSummaryModal } from './quiz/summary-modal.js';

export { renderQuizOverlayShell } from './quiz/shell.js';

function openSummaryModal(stats) {
  showQuizSummaryModal(stats, {
    onRetryRedemption: () => {
      if (quizState.app) {
        startQuizSession(quizState.app, null, quizState.options);
      }
    }
  });
}

function advanceQuizQuestion() {
  quizState.index++;
  loadQuizQuestion(quizState.index);
}

/**
 * Bắt đầu phiên ôn tập / học từ mới trắc nghiệm FSRS
 */
export function startQuizSession(app, customQueue = null, options = {}) {
  try {
    unlockAudioContext();
    quizState.app = app;
    quizState.options = { ...options };
    quizState.reviewedCards = [];

    const queue = buildQuizQueue(app, customQueue, options);
    if (!queue || queue.length === 0) {
      app.showToast('🎉 Hiện không có từ vựng nào trong hàng đợi.', 'info', 3000);
      return;
    }

    quizState.queue = [...queue];
    quizState.index = 0;
    quizState.comboCount = 0;
    quizState.startTime = Date.now();
    quizState.stats = createEmptyQuizStats(quizState.queue.length);

    renderQuizOverlayShell({
      onAdvance: advanceQuizQuestion,
      onClose: closeQuizSession,
      onFinish: finishQuizSession,
      onShowSummary: openSummaryModal
    });

    const overlay = document.getElementById('quiz-overlay');
    if (overlay) overlay.classList.add('active');

    globalStudyTimer.startSession();
    if (quizState.timerUnsubscribe) quizState.timerUnsubscribe();
    quizState.timerUnsubscribe = globalStudyTimer.subscribe((state) => {
      updateQuizLiveTimerUI(state);
    });

    loadQuizQuestion(quizState.index);
  } catch (err) {
    console.error('Lỗi khởi động Quiz Session:', err);
  }
}

/**
 * Nạp câu hỏi trắc nghiệm hiện tại
 */
function loadQuizQuestion(index) {
  if (index >= quizState.queue.length) {
    finishQuizSession();
    return;
  }

  quizState.isAnswerLocked = false;
  const card = quizState.queue[index];
  const allPool = quizState.app?.deckManager?.getAllCards() || WORDS;

  // Cập nhật Header: Đếm số từ ôn & từ mới còn lại trong phiên
  const elDue = document.getElementById('quiz-stat-due');
  const elNew = document.getElementById('quiz-stat-new');
  const elCounter = document.getElementById('quiz-progress-counter');

  let dueCount = 0;
  let newCount = 0;
  for (let i = index; i < quizState.queue.length; i++) {
    const s = StorageManager.getCardState(quizState.queue[i].id);
    if (!s || s.state === 0 || s.reps === 0) newCount++;
    else dueCount++;
  }

  if (elDue) elDue.textContent = dueCount;
  if (elNew) elNew.textContent = newCount;
  if (elCounter) elCounter.textContent = `${index + 1}/${quizState.queue.length}`;

  // Cập nhật Thẻ Câu Hỏi
  const elWord = document.getElementById('quiz-word-prompt');
  const elIpa = document.getElementById('quiz-ipa-text');
  const elStatus = document.getElementById('quiz-word-status');
  const btnSpeaker = document.getElementById('btn-quiz-speaker');
  const actionBar = document.getElementById('quiz-action-bar');

  if (actionBar) actionBar.classList.remove('active');

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

  // Tự động phát âm từ vựng ngay lập tức khi vào câu hỏi mới
  if (quizState.autoSpeakTimer) {
    clearTimeout(quizState.autoSpeakTimer);
    quizState.autoSpeakTimer = null;
  }
  const shouldAutoSpeak = quizState.app?.settings?.autoPronounce !== false;
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

  // Bắt đầu đo thời gian phản xạ
  quizState.questionStartTime = performance.now();
}

/**
 * Xử lý khi người dùng chọn một phương án
 */
function handleOptionSelected(selectedTile, selectedOpt, card, allOptions) {
  if (quizState.isAnswerLocked) return;
  quizState.isAnswerLocked = true;

  const elapsedMs = performance.now() - quizState.questionStartTime;
  const elapsedSec = elapsedMs / 1000;
  quizState.stats.totalLatencyMs += elapsedMs;

  globalStudyTimer.recordActivity();

  const isCorrect = selectedOpt.isCorrect === true;
  playFeedbackTone(isCorrect);

  // 1. Phân loại Điểm FSRS chạy ngầm: Đúng là Tốt (Good), Sai là Quên (Again)
  const rating = isCorrect ? Rating.Good : Rating.Again;

  if (!isCorrect) {
    quizState.comboCount = 0;
    quizState.stats.wrong++;
  } else {
    quizState.comboCount++;
    if (quizState.comboCount > quizState.stats.comboMax) {
      quizState.stats.comboMax = quizState.comboCount;
    }
    quizState.stats.correct++;
  }

  quizState.stats.ratings[rating]++;

  // 2. Tính toán và Lưu Thuật Toán FSRS-6 Trực Tiếp ngầm
  try {
    const appSettings = quizState.app?.settings;
    const fsrs = new FSRS({
      w: appSettings?.fsrsW,
      requestRetention: appSettings?.requestRetention || 0.90,
      enableFuzz: appSettings?.enableFuzz !== false,
      leechThreshold: appSettings?.leechThreshold || 8,
      leechAction: appSettings?.leechAction || 'suspend'
    });

    const now = new Date();
    const { nextState } = StorageManager.applyCardReview({
      card,
      rating,
      fsrsInstance: fsrs,
      settings: appSettings,
      now,
      logExtra: {
        isQuiz: true,
        latencySec: Number(elapsedSec.toFixed(2))
      }
    });

    quizState.reviewedCards.push({
      id: card.id,
      word: card.word,
      meaning: card.meaning || '',
      ipa: card.phonetic || card.ipa || '',
      isCorrect,
      scheduledDays: nextState.scheduled_days !== undefined ? nextState.scheduled_days : 0,
      due: nextState.due,
      stability: nextState.stability || 0
    });

    // Cập nhật ngay huy hiệu trạng thái FSRS trên thẻ câu hỏi
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

    if (quizState.app?.deckManager) {
      quizState.app.deckManager.invalidateStatsCache();
    }
  } catch (err) {
    console.error('Lỗi cập nhật FSRS ngầm trong Quiz:', err);
    quizState.reviewedCards.push({
      id: card.id,
      word: card.word,
      meaning: card.meaning || '',
      ipa: card.phonetic || card.ipa || '',
      isCorrect,
      scheduledDays: isCorrect ? 1 : 0
    });
  }

  // 3. Phản hồi màu sắc tức thì
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

  // 4. Hiển thị nút "Tiếp tục"
  const actionBar = document.getElementById('quiz-action-bar');
  const nextLabel = document.getElementById('quiz-next-label');
  const isLast = quizState.index + 1 >= quizState.queue.length;

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
  openSummaryModal(quizState.stats);
}

function closeQuizSession() {
  if (quizState.autoSpeakTimer) {
    clearTimeout(quizState.autoSpeakTimer);
    quizState.autoSpeakTimer = null;
  }
  if (quizState.timerUnsubscribe) {
    quizState.timerUnsubscribe();
    quizState.timerUnsubscribe = null;
  }
  if (quizState.reflexInterval) clearInterval(quizState.reflexInterval);
  globalStudyTimer.endSession();
  try { StorageManager.flushPendingSync(); } catch (e) {}
  const overlay = document.getElementById('quiz-overlay');
  if (overlay) overlay.classList.remove('active');
  scrollToTop();

  if (quizState.app) {
    quizState.app.refreshAllViews();
  }
}
