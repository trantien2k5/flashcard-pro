/**
 * TOEIC Test Submission, Scoring & Detailed ETS Result Review Modal
 */

import { calculateToeicScore } from '../../../data/toeic-tests.js';
import { StorageManager } from '../../services/storage.js';
import { escapeHTML, scrollToTop } from '../../utils.js';
import { showConfirm } from '../components.js';
import { toeicState, getToeicOverlay, stopArenaTimer } from './state.js';

export function closeArenaSession() {
  stopArenaTimer();
  const overlay = getToeicOverlay();
  if (overlay) overlay.classList.remove('active');
  scrollToTop();
}

/**
 * Hiển thị Modal Báo Cáo Kết Quả & Lời Giải Thích Chi Tiết Từng Câu
 */
export function showToeicResultModal(scoreData, timeSpentSeconds, questions, userAnswers, flaggedSet, onRetry) {
  let modal = document.getElementById('toeic-result-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'toeic-result-overlay';
    modal.className = 'toeic-result-overlay active';
    document.body.appendChild(modal);
  } else {
    modal.className = 'toeic-result-overlay active';
  }

  const mins = Math.floor(timeSpentSeconds / 60);
  const secs = timeSpentSeconds % 60;
  const timeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  const avgSecPerQuestion = questions.length > 0 ? (timeSpentSeconds / questions.length).toFixed(1) : 0;

  modal.innerHTML = `
    <div class="toeic-result-card">
      <div class="result-card-header">
        <div>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 850; color: var(--text-primary);">
            🎉 Kết Quả Thi Thử TOEIC Part 5
          </h3>
          <span style="font-size: 0.76rem; color: var(--text-muted);">ETS Computer-Based Testing Assessment</span>
        </div>
        <button type="button" class="btn-exit-arena" id="btn-close-result-modal" style="padding: 6px 12px;">Đóng ✕</button>
      </div>

      <div class="result-card-body">
        <div class="result-score-hero">
          <div>
            <div class="result-score-digits">${scoreData.score}<span class="result-score-denom"> / 495</span></div>
            <div class="result-band-tag" style="color: ${scoreData.color};">${escapeHTML(scoreData.band)}</div>
          </div>
          <div class="result-feedback-text">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">
              Đạt ${scoreData.correctCount}/${scoreData.totalCount} câu đúng (${scoreData.accuracyPct}%)
            </p>
            <p style="margin: 0; line-height: 1.4;">${escapeHTML(scoreData.levelLabel)}</p>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: right;">
            <div>⏱️ Thời gian: <strong>${timeFormatted}</strong></div>
            <div style="margin-top: 4px;">⚡ Tốc độ: <strong>${avgSecPerQuestion}s / câu</strong></div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">
            📝 Đáp Án & Giải Thích Chi Tiết
          </h4>
          <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">Xem lại toàn bộ câu hỏi</span>
        </div>

        <div class="review-questions-list">
          ${questions.map((q, idx) => {
            const userChoice = userAnswers[idx];
            const isCorrect = userChoice === q.correctIndex;
            const letters = ['A', 'B', 'C', 'D'];
            const isFlagged = flaggedSet.has(idx);

            return `
              <div class="review-item-card ${isCorrect ? 'is-correct' : 'is-wrong'}">
                <div class="review-item-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 850; font-size: 0.88rem; color: var(--primary);">Câu ${idx + 1}</span>
                    <span class="question-cat-tag">${escapeHTML(q.category || 'Part 5')}</span>
                    ${isFlagged ? '<span style="font-size: 0.72rem;">🚩 Có đánh dấu</span>' : ''}
                  </div>
                  <span class="review-result-badge ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? '✓ Đúng (+1)' : '✗ Chưa chính xác'}
                  </span>
                </div>

                <p class="review-prompt">
                  ${escapeHTML(q.question).replace(/______/g, `<strong style="color: var(--primary); text-decoration: underline;">${escapeHTML(q.options[q.correctIndex])}</strong>`)}
                </p>

                ${q.questionVi ? `<p class="review-translation">🇻🇳 Dịch: ${escapeHTML(q.questionVi)}</p>` : ''}

                <div class="review-options-pills">
                  ${q.options.map((opt, optIdx) => {
                    const isTheCorrectAnswer = optIdx === q.correctIndex;
                    const isTheUserWrongChoice = !isCorrect && userChoice === optIdx;
                    let extraClass = '';
                    let statusLabel = '';

                    if (isTheCorrectAnswer) {
                      extraClass = 'correct-answer';
                      statusLabel = ' ✓ Đáp án đúng';
                    } else if (isTheUserWrongChoice) {
                      extraClass = 'user-wrong-choice';
                      statusLabel = ' ✗ Bạn chọn sai';
                    }

                    return `
                      <div class="review-opt-pill ${extraClass}">
                        <strong>(${letters[optIdx]})</strong> ${escapeHTML(opt)}${statusLabel}
                      </div>
                    `;
                  }).join('')}
                </div>

                <div class="review-explanation-box">
                  <strong>💡 Lời giải thích:</strong> ${escapeHTML(q.explanation || 'Không có giải thích chi tiết.')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="result-card-footer">
        <button type="button" class="btn-confirm-secondary" id="btn-result-retry" style="padding: 10px 18px; border-radius: 12px; font-weight: 750;">
          ⚡ Thi Bài Khác
        </button>
        <button type="button" class="btn-confirm-primary" id="btn-result-close" style="padding: 10px 22px; border-radius: 12px; font-weight: 750;">
          Về Danh Sách Đề
        </button>
      </div>
    </div>
  `;

  const btnCloseX = modal.querySelector('#btn-close-result-modal');
  const btnClose = modal.querySelector('#btn-result-close');
  const btnRetry = modal.querySelector('#btn-result-retry');

  const closeModal = () => {
    modal.className = 'toeic-result-overlay';
    setTimeout(() => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 200);
  };

  if (btnCloseX) btnCloseX.onclick = closeModal;
  if (btnClose) btnClose.onclick = closeModal;
  if (btnRetry) {
    btnRetry.onclick = () => {
      closeModal();
      onRetry?.();
    };
  }
}

/**
 * Tính toán kết quả bài thi, lưu vào Storage và hiển thị Modal giải thích
 */
export function finishToeicTest({ onRefreshHub, onRetry }) {
  stopArenaTimer();

  const timeSpentSeconds = Math.max(1, Math.round((Date.now() - toeicState.testStartTime) / 1000));
  const total = toeicState.currentQuestions.length;
  let correctCount = 0;

  toeicState.currentQuestions.forEach((q, idx) => {
    if (toeicState.userAnswers[idx] === q.correctIndex) correctCount++;
  });

  const scoreData = calculateToeicScore(correctCount, total);

  StorageManager.saveToeicTestResult({
    totalCount: total,
    correctCount,
    accuracyPct: scoreData.accuracyPct,
    score: scoreData.score,
    band: scoreData.band,
    color: scoreData.color,
    timeSpentSeconds,
    durationMinutes: toeicState.activeConfig ? toeicState.activeConfig.durationMinutes : 5,
    mode: toeicState.activeConfig ? toeicState.activeConfig.mode : 'all',
    testTitle: toeicState.activeConfig ? toeicState.activeConfig.testTitle : `Mini Test ${total} câu`
  });

  closeArenaSession();
  showToeicResultModal(
    scoreData,
    timeSpentSeconds,
    toeicState.currentQuestions,
    toeicState.userAnswers,
    toeicState.flaggedQuestions,
    onRetry
  );

  onRefreshHub?.();
}

/**
 * Xác nhận & Nộp bài thi
 */
export async function confirmAndSubmitTest(isTimeUp = false, callbacks = {}) {
  if (isTimeUp) {
    finishToeicTest(callbacks);
    return;
  }

  const total = toeicState.currentQuestions.length;
  const answeredCount = Object.keys(toeicState.userAnswers).length;
  const unAnsweredCount = total - answeredCount;

  const msg = unAnsweredCount > 0
    ? `Bạn đã hoàn thành ${answeredCount}/${total} câu hỏi. Bạn vẫn còn ${unAnsweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài sớm không?`
    : `Bạn đã hoàn thành ${answeredCount}/${total} câu hỏi. Bạn có chắc chắn muốn nộp bài và xem điểm không?`;

  const confirmed = await showConfirm({
    title: 'Xác nhận Nộp Bài Thi?',
    message: msg,
    confirmText: 'Nộp bài ngay',
    type: unAnsweredCount > 0 ? 'warning' : 'primary',
    icon: '📝'
  });

  if (confirmed) {
    finishToeicTest(callbacks);
  }
}

