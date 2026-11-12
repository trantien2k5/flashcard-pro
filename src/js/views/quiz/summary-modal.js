/**
 * Quiz Session Summary & Streak Redemption Modal
 */

import { Rating } from '../../core/fsrs.js';
import { StorageManager } from '../../services/storage.js';
import { escapeHTML } from '../../utils.js';
import { quizState } from './state.js';

/**
 * Modal Báo Cáo Tổng Kết Sau Khi Hoàn Thành Bài Trắc Nghiệm
 */
export function showQuizSummaryModal(stats, handlers = {}) {
  let modal = document.getElementById('quiz-summary-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quiz-summary-modal';
    modal.className = 'confirm-dialog-overlay active';
    document.body.appendChild(modal);
  } else {
    modal.className = 'confirm-dialog-overlay active';
  }

  const reviewedList = quizState.reviewedCards || [];
  const total = reviewedList.length > 0 ? reviewedList.length : (stats.total || 1);
  const correct = reviewedList.length > 0 ? reviewedList.filter(c => c.isCorrect).length : (stats.correct || 0);
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgLatencySec = total > 0 ? ((stats.totalLatencyMs / total) / 1000).toFixed(1) : '0.0';

  const isRedemptionMode = quizState.options && quizState.options.mode === 'redemption';
  const isRedemptionSuccess = isRedemptionMode && accuracyPct >= 80;

  if (isRedemptionSuccess && quizState.options.targetDateKey) {
    try {
      StorageManager.redeemStreak(quizState.options.targetDateKey);
      if (quizState.app && typeof quizState.app.updateHeaderBadges === 'function') {
        quizState.app.updateHeaderBadges();
      }
    } catch (e) {
      console.warn('Lỗi ghi nhận chuộc lỗi streak:', e);
    }
  }

  let headerIcon = '🎯';
  let headerTitle = reviewedList.length >= quizState.queue.length ? 'Hoàn Thành Bài Trắc Nghiệm!' : 'Tổng Kết Phiên Học Trắc Nghiệm';
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
      handlers.onRetryRedemption?.();
    };
  }

  const btnDone = modal.querySelector('#btn-quiz-summary-done');
  if (btnDone) {
    btnDone.onclick = () => {
      modal.className = 'confirm-dialog-overlay';
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 200);
      if (quizState.app) quizState.app.switchTab('tab-review');
    };
  }
}

