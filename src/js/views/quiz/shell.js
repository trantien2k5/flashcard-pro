/**
 * Quiz Overlay Shell, Keyboard Shortcuts & Live Timer UI
 */

import { speak } from '../../services/audio.js';
import { showConfirm } from '../components.js';
import { quizState } from './state.js';

let _shellHandlers = {};

/**
 * Render Khung Shell của Quiz Overlay
 */
export function renderQuizOverlayShell(handlers = {}) {
  if (handlers && typeof handlers === 'object') {
    _shellHandlers = { ..._shellHandlers, ...handlers };
  }

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
      const reviewed = quizState.stats.correct + quizState.stats.wrong;
      if (reviewed === 0) {
        _shellHandlers.onClose?.(true);
        return;
      }

      const confirmed = await showConfirm({
        title: 'Dừng phiên trắc nghiệm?',
        message: `Bạn đã làm xong ${reviewed}/${quizState.queue.length} câu. Bạn có muốn xem bảng tổng kết tiến độ các từ vừa ôn không?`,
        confirmText: 'Xem Kết Quả & Dừng',
        cancelText: 'Làm Tiếp',
        type: 'primary',
        icon: '📊'
      });

      if (confirmed) {
        _shellHandlers.onClose?.(false);
        _shellHandlers.onShowSummary?.(quizState.stats);
      }
    };
  }

  const btnNext = document.getElementById('btn-quiz-next');
  if (btnNext) {
    btnNext.onclick = () => {
      _shellHandlers.onAdvance?.();
    };
  }

  const btnModeSwitch = document.getElementById('btn-quiz-mode-switch');
  if (btnModeSwitch) {
    btnModeSwitch.onclick = () => {
      try {
        const startIndex = quizState.isAnswerLocked ? quizState.index + 1 : quizState.index;
        const remainingQueue = (quizState.queue || []).slice(startIndex);
        if (!remainingQueue || remainingQueue.length === 0) {
          quizState.app?.showToast('🎉 Bạn đã hoàn thành toàn bộ thẻ trong hàng đợi!', 'success');
          _shellHandlers.onFinish?.();
          return;
        }

        _shellHandlers.onClose?.(false);
        quizState.app?.startStudySession(null, null, remainingQueue);
        quizState.app?.showToast('🎴 Đã chuyển sang chế độ Flashcard 3D', 'info', 2000);
      } catch (err) {
        console.error('Lỗi chuyển sang Flashcard:', err);
      }
    };
  }

  // Phím tắt bàn phím 1, 2, 3, 4 hoặc A, B, C, D; Space / Enter để tiếp tục; R để nghe lại (bind 1 lần duy nhất)
  if (!quizState.keysBound) {
    quizState.keysBound = true;
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
        const currentCard = quizState.queue[quizState.index];
        if (currentCard?.word) speak(currentCard.word);
        return;
      }

      // Khi đã trả lời xong, bấm Space hoặc Enter để sang câu tiếp theo
      if (quizState.isAnswerLocked) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          _shellHandlers.onAdvance?.();
        }
        return;
      }

      let targetIdx = -1;
      const lower = e.key.toLowerCase();
      if (e.key === '1' || lower === 'a') targetIdx = 0;
      else if (e.key === '2' || lower === 'b') targetIdx = 1;
      else if (e.key === '3' || lower === 'c') targetIdx = 2;
      else if (e.key === '4' || lower === 'd') targetIdx = 3;

      if (targetIdx >= 0) {
        e.preventDefault();
        const tiles = document.querySelectorAll('.quiz-option-tile');
        if (tiles[targetIdx]) {
          tiles[targetIdx].click();
        }
      }
    });
  }
}

/**
 * Cập nhật đồng hồ Live Timer trên UI phiên Quiz
 */
export function updateQuizLiveTimerUI(state) {
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

