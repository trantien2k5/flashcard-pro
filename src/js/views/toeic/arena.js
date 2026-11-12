/**
 * TOEIC CBT Exam Arena Stage, Timer, Question Pallet & Keyboard Navigation
 */

import { escapeHTML } from '../../utils.js';
import { showConfirm } from '../components.js';
import { toeicState, getToeicOverlay, stopArenaTimer } from './state.js';

export function togglePalletDrawer(forceState) {
  const drawer = document.getElementById('arena-pallet-drawer');
  const backdrop = document.getElementById('arena-pallet-backdrop');
  if (!drawer || !backdrop) return;

  const isOpen = forceState !== undefined ? forceState : !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  backdrop.classList.toggle('active', isOpen);
}

export function updatePalletMatrix() {
  const pallet = document.getElementById('arena-pallet-grid');
  if (!pallet) return;

  const total = toeicState.currentQuestions.length;
  const answeredCount = Object.keys(toeicState.userAnswers).length;

  const elSub = document.getElementById('pallet-answered-count');
  if (elSub) elSub.textContent = `${answeredCount} / ${total} đã làm`;

  pallet.innerHTML = '';
  toeicState.currentQuestions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isCurrent = idx === toeicState.currentQuestionIndex;
    const isAnswered = toeicState.userAnswers[idx] !== undefined;
    const isFlagged = toeicState.flaggedQuestions.has(idx);

    btn.className = `pallet-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}`;
    btn.textContent = idx + 1;
    btn.title = `Câu ${idx + 1}${isAnswered ? ' (Đã làm)' : ''}${isFlagged ? ' (Có cờ)' : ''}`;

    btn.onclick = () => {
      loadArenaQuestion(idx);
      togglePalletDrawer(false);
    };

    pallet.appendChild(btn);
  });
}

export function loadArenaQuestion(index) {
  if (index < 0 || index >= toeicState.currentQuestions.length) return;
  toeicState.currentQuestionIndex = index;

  const q = toeicState.currentQuestions[index];
  const total = toeicState.currentQuestions.length;
  const isPracticeMode = toeicState.activeConfig?.mode === 'practice';
  const currentSelected = toeicState.userAnswers[index];
  const isAnswered = currentSelected !== undefined;

  const elIndicator = document.getElementById('arena-progress-indicator');
  const btnPrev = document.getElementById('btn-arena-prev');
  const btnNext = document.getElementById('btn-arena-next');

  if (elIndicator) elIndicator.textContent = `Câu ${index + 1} / ${total}`;
  if (btnPrev) btnPrev.disabled = index === 0;
  if (btnNext) btnNext.disabled = isPracticeMode ? (index === total - 1) : false;

  const isFlagged = toeicState.flaggedQuestions.has(index);
  const btnFlag = document.getElementById('btn-flag-question');
  const flagText = document.getElementById('flag-btn-text');
  if (btnFlag) {
    btnFlag.classList.toggle('flagged', isFlagged);
    if (flagText) flagText.textContent = isFlagged ? 'Đã cờ' : 'Đánh dấu';
  }

  const elPrompt = document.getElementById('arena-question-text');
  if (elPrompt) {
    const rawQuestion = q.question || '';
    const blankHtml = (isAnswered && q.options && q.options[currentSelected])
      ? `<span class="question-blank-slot has-value" title="Từ đã chọn: ${escapeHTML(q.options[currentSelected])}">${escapeHTML(q.options[currentSelected])}</span>`
      : `<span class="question-blank-slot is-empty" aria-label="Chỗ trống điền từ"></span>`;
    elPrompt.innerHTML = rawQuestion.replace(/_{3,}/g, blankHtml);
  }

  const optionsGrid = document.getElementById('arena-options-grid');
  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    (q.options || []).forEach((opt, optIdx) => {
      const tile = document.createElement('div');
      let statusClass = '';

      if (isPracticeMode && isAnswered) {
        if (optIdx === q.correctIndex) statusClass = 'practice-correct';
        else if (optIdx === currentSelected) statusClass = 'practice-wrong';
      } else if (currentSelected === optIdx) {
        statusClass = 'selected';
      }

      tile.className = `arena-option-tile ${statusClass}`;
      tile.innerHTML = `
        <span class="arena-option-letter">${letters[optIdx]}</span>
        <span class="arena-option-text">${escapeHTML(opt)}</span>
      `;

      tile.onclick = () => {
        toeicState.userAnswers[index] = optIdx;
        loadArenaQuestion(index);
        updatePalletMatrix();
      };

      optionsGrid.appendChild(tile);
    });
  }

  const explanationBox = document.getElementById('practice-explanation-box');
  if (explanationBox) {
    if (isPracticeMode && isAnswered) {
      const isCorrect = currentSelected === q.correctIndex;
      explanationBox.style.display = 'block';
      explanationBox.className = `practice-explanation-box ${isCorrect ? 'is-correct' : 'is-wrong'}`;
      explanationBox.innerHTML = `
        <div class="exp-header">
          <span class="exp-badge">${isCorrect ? '✅ Chính xác' : '❌ Chưa chính xác'}</span>
          <span class="exp-correct-info">Đáp án đúng: <strong>(${['A', 'B', 'C', 'D'][q.correctIndex]}) ${escapeHTML(q.options[q.correctIndex])}</strong></span>
        </div>
        ${q.questionVi ? `<div class="exp-translation"><strong>Dịch câu:</strong> ${escapeHTML(q.questionVi)}</div>` : ''}
        ${q.explanation ? `<div class="exp-content"><strong>Giải thích:</strong> ${escapeHTML(q.explanation)}</div>` : ''}
        <div class="exp-quick-nav-row">
          <button type="button" class="btn-exp-quick-action" id="btn-exp-quick-next">
            <span>${index < total - 1 ? 'Sang câu tiếp theo' : 'Xem lại bảng câu hỏi'}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      `;

      const btnExpQuickNext = document.getElementById('btn-exp-quick-next');
      if (btnExpQuickNext) {
        btnExpQuickNext.onclick = () => {
          if (index < total - 1) loadArenaQuestion(index + 1);
          else togglePalletDrawer(true);
        };
      }
    } else {
      explanationBox.style.display = 'none';
    }
  }

  updatePalletMatrix();
}

export function toggleFlagCurrentQuestion() {
  if (toeicState.flaggedQuestions.has(toeicState.currentQuestionIndex)) {
    toeicState.flaggedQuestions.delete(toeicState.currentQuestionIndex);
  } else {
    toeicState.flaggedQuestions.add(toeicState.currentQuestionIndex);
  }
  loadArenaQuestion(toeicState.currentQuestionIndex);
}

export function updateTimerDigitsUI() {
  const elDigits = document.getElementById('arena-timer-digits');
  const elPill = document.getElementById('arena-timer-pill');
  if (!elDigits) return;

  const mins = Math.floor(Math.max(0, toeicState.remainingSeconds) / 60);
  const secs = Math.max(0, toeicState.remainingSeconds) % 60;
  elDigits.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  if (elPill) {
    if (toeicState.remainingSeconds <= 60) elPill.className = 'arena-timer-pill is-critical';
    else if (toeicState.remainingSeconds <= 180) elPill.className = 'arena-timer-pill is-warning';
    else elPill.className = 'arena-timer-pill';
  }
}

export function startArenaTimer(onTimeUp) {
  stopArenaTimer();
  updateTimerDigitsUI();
  toeicState.timerInterval = setInterval(() => {
    toeicState.remainingSeconds--;
    updateTimerDigitsUI();

    if (toeicState.remainingSeconds <= 0) {
      stopArenaTimer();
      onTimeUp?.();
    }
  }, 1000);
}

/**
 * Render bố cục phòng thi ETS CBT & gắn sự kiện điều hướng
 */
export function renderArenaLayout({ onExit, onSubmit }) {
  const overlay = getToeicOverlay();
  if (!overlay) return;

  const total = toeicState.currentQuestions.length;
  const isPractice = toeicState.activeConfig?.mode === 'practice';
  const testCode = toeicState.activeConfig?.testCode || 'TEST 01';

  overlay.innerHTML = `
    <header class="arena-top-header">
      <div class="arena-header-left">
        <button type="button" class="btn-exit-arena" id="btn-exit-toeic-arena" title="Thoát phòng">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="arena-title-wrap">
          <div class="arena-exam-name-row">
            <span class="arena-exam-name">${escapeHTML(testCode)}</span>
            <span class="arena-mode-pill ${isPractice ? 'is-practice' : 'is-exam'}">
              ${isPractice ? 'Luyện tập' : 'Thi thật'}
            </span>
          </div>
        </div>
      </div>

      <div class="arena-header-center">
        <div class="arena-top-nav-cluster">
          <button type="button" class="btn-arena-step-compact" id="btn-arena-prev" title="Câu trước (←)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <button type="button" class="btn-pallet-trigger-compact" id="btn-toggle-pallet" title="Bấm xem danh sách câu hỏi / Tiến độ (Phím M)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
            </svg>
            <span id="arena-progress-indicator">Câu 1 / ${total}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <button type="button" class="btn-arena-step-compact" id="btn-arena-next" title="Câu tiếp theo (→)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="arena-header-right">
        <button type="button" class="btn-flag-question" id="btn-flag-question" title="Đánh dấu câu hỏi để xem lại (Phím F)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
          <span id="flag-btn-text">Đánh dấu</span>
        </button>

        ${!isPractice ? `
          ${toeicState.activeConfig?.durationMinutes > 0 ? `
            <div class="arena-timer-pill" id="arena-timer-pill" title="Thời gian còn lại">
              <span style="font-size: 0.95rem;">⏱️</span>
              <span id="arena-timer-digits">00:00</span>
            </div>
          ` : ''}

          <button type="button" class="btn-submit-arena" id="btn-submit-toeic-arena">
            <span>Nộp bài</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        ` : ''}
      </div>
    </header>

    <div class="arena-split-body">
      <main class="arena-question-stage">
        <div class="question-stage-content">
          <div class="question-prompt-card">
            <p class="question-prompt-text" id="arena-question-text">Loading...</p>
          </div>
          <div class="arena-options-grid" id="arena-options-grid"></div>
          <div class="practice-explanation-box" id="practice-explanation-box" style="display: none;"></div>
        </div>
      </main>

      <div class="arena-pallet-backdrop" id="arena-pallet-backdrop"></div>
      <aside class="arena-pallet-drawer" id="arena-pallet-drawer">
        <div class="pallet-drawer-header">
          <div class="pallet-title-group">
            <span class="pallet-drawer-title">Bảng Câu Hỏi</span>
            <span class="pallet-drawer-sub" id="pallet-answered-count">0 / ${total} đã làm</span>
          </div>
          <button type="button" class="btn-close-pallet" id="btn-close-pallet" title="Đóng bảng câu hỏi">✕</button>
        </div>
        <div class="pallet-matrix-grid" id="arena-pallet-grid"></div>
        <div class="pallet-legend-row">
          <div class="legend-item"><span class="legend-dot answered"></span> Đã trả lời</div>
          <div class="legend-item"><span class="legend-dot unanswered"></span> Chưa trả lời</div>
          <div class="legend-item"><span class="legend-dot flagged"></span> Đã đánh dấu (🚩)</div>
        </div>
      </aside>
    </div>
  `;

  const btnExit = document.getElementById('btn-exit-toeic-arena');
  if (btnExit) {
    btnExit.onclick = async () => {
      const answeredCount = Object.keys(toeicState.userAnswers).length;
      const confirmed = await showConfirm({
        title: 'Thoát bài thi TOEIC?',
        message: answeredCount > 0
          ? `Bạn đã làm ${answeredCount}/${total} câu hỏi. Nếu thoát ngay bây giờ, kết quả bài thi này sẽ không được tính.`
          : 'Bạn có chắc chắn muốn rời khỏi phòng thi không?',
        confirmText: 'Rời phòng thi',
        type: 'danger',
        icon: '🚪'
      });
      if (confirmed) onExit?.();
    };
  }

  const btnSubmit = document.getElementById('btn-submit-toeic-arena');
  if (btnSubmit) btnSubmit.onclick = () => onSubmit?.(false);

  const btnPrev = document.getElementById('btn-arena-prev');
  if (btnPrev) {
    btnPrev.onclick = () => {
      if (toeicState.currentQuestionIndex > 0) {
        toeicState.currentQuestionIndex--;
        loadArenaQuestion(toeicState.currentQuestionIndex);
      }
    };
  }

  const btnNext = document.getElementById('btn-arena-next');
  if (btnNext) {
    btnNext.onclick = () => {
      if (toeicState.currentQuestionIndex + 1 < toeicState.currentQuestions.length) {
        toeicState.currentQuestionIndex++;
        loadArenaQuestion(toeicState.currentQuestionIndex);
      } else if (!isPractice) {
        onSubmit?.(false);
      } else {
        togglePalletDrawer(true);
      }
    };
  }

  const btnFlag = document.getElementById('btn-flag-question');
  if (btnFlag) btnFlag.onclick = () => toggleFlagCurrentQuestion();

  const btnTogglePallet = document.getElementById('btn-toggle-pallet');
  if (btnTogglePallet) btnTogglePallet.onclick = () => togglePalletDrawer();

  const btnClosePallet = document.getElementById('btn-close-pallet');
  if (btnClosePallet) btnClosePallet.onclick = () => togglePalletDrawer(false);

  const backdrop = document.getElementById('arena-pallet-backdrop');
  if (backdrop) backdrop.onclick = () => togglePalletDrawer(false);
}

/**
 * Lắng nghe phím tắt bàn phím trong phòng thi (đăng ký duy nhất 1 lần)
 */
export function setupArenaKeyShortcuts() {
  if (toeicState.keysBound) return;
  toeicState.keysBound = true;

  window.addEventListener('keydown', (e) => {
    const overlay = getToeicOverlay();
    if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      const drawer = document.getElementById('arena-pallet-drawer');
      if (drawer && drawer.classList.contains('open')) {
        togglePalletDrawer(false);
        return;
      }
      document.getElementById('btn-exit-toeic-arena')?.click();
      return;
    }

    if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'p') {
      e.preventDefault();
      togglePalletDrawer();
      return;
    }

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFlagCurrentQuestion();
      return;
    }

    if (e.key === 'ArrowLeft') {
      const btnPrev = document.getElementById('btn-arena-prev');
      if (btnPrev && !btnPrev.disabled) btnPrev.click();
      return;
    }

    if (e.key === 'ArrowRight') {
      document.getElementById('btn-arena-next')?.click();
      return;
    }

    const keyOptMap = { '1': 0, 'a': 0, '2': 1, 'b': 1, '3': 2, 'c': 2, '4': 3, 'd': 3 };
    const optionIdx = keyOptMap[e.key.toLowerCase()];
    if (optionIdx !== undefined) {
      e.preventDefault();
      toeicState.userAnswers[toeicState.currentQuestionIndex] = optionIdx;
      loadArenaQuestion(toeicState.currentQuestionIndex);
    }
  });
}

