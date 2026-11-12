/**
 * Study FSRS Rating Actions, Keyboard Shortcuts, Session Exit & Mode Switching
 */

import { Rating } from '../../core/fsrs.js';
import { StorageManager } from '../../services/storage.js';
import { showConfirm } from '../components.js';
import { globalStudyTimer, BehavioralOptimizer } from '../../core/stats.js';
import { scrollToTop } from '../../utils.js';
import { getStudyPrefs } from './prefs.js';
import { getStudyOverlay } from './shell.js';
import { stopPomodoroTracker, recordPomodoroCardReviewed } from './pomodoro.js';
import { showSummaryModal } from './summary-modal.js';
import { stopAutoPlay } from './autoplay.js';
import { studyRuntime, clearStudyTimerSubscription } from './state.js';

/**
 * Chuyển đổi trực tiếp từ phiên Flashcard sang Chế độ Trắc nghiệm (Quiz)
 */
export function switchToQuizMode(app, closeDrawer) {
  try {
    if (!app.studySession || !app.studySession.isActive) return;
    const currentIndex = app.studySession.currentIndex || 0;
    const remainingQueue = (app.studySession.queue || []).slice(currentIndex);

    if (!remainingQueue || remainingQueue.length === 0) {
      app.showToast?.('Không có thẻ nào còn lại trong hàng đợi.', 'info');
      return;
    }

    stopAutoPlay();
    clearStudyTimerSubscription();
    stopPomodoroTracker();
    app.studySession?.stopAudio();
    StorageManager.flushPendingSync();

    getStudyOverlay()?.classList.remove('active');
    closeDrawer?.();
    app.studySession.isActive = false;

    app.startQuizSession(remainingQueue);
    app.showToast?.('🎯 Đã chuyển sang chế độ Trắc nghiệm', 'info', 2000);
  } catch (err) {
    console.error('Lỗi chuyển sang chế độ Trắc nghiệm:', err);
  }
}

/**
 * Tạo hàm chấm điểm FSRS an toàn (hỗ trợ Back Lock chống bấm nhầm theo từng mức độ)
 */
export function createRateHandler(app) {
  return (rating) => {
    if (!app.studySession || !app.studySession.isActive) return;
    if (!app.studySession.isFlipped) return;

    const prefs = getStudyPrefs();
    const backViewMs = studyRuntime.backShowTime > 0 ? (performance.now() - studyRuntime.backShowTime) : 0;

    if (prefs.enableBackLock) {
      const lockMap = {
        [Rating.Again]: 1500,
        [Rating.Hard]: 1000,
        [Rating.Good]: 500,
        [Rating.Easy]: 0
      };
      const minLockMs = lockMap[rating] ?? 0;

      if (backViewMs < minLockMs) {
        const ratingClassMap = {
          [Rating.Again]: '.btn-fsrs-rating.again',
          [Rating.Hard]: '.btn-fsrs-rating.hard',
          [Rating.Good]: '.btn-fsrs-rating.good',
          [Rating.Easy]: '.btn-fsrs-rating.easy'
        };
        const targetBtn = document.querySelector(ratingClassMap[rating]);
        if (targetBtn) {
          targetBtn.classList.remove('shake-cue');
          void targetBtn.offsetWidth;
          targetBtn.classList.add('shake-cue');
        }
        return;
      }
    }

    if (studyRuntime.isRatingInProgress) return;
    studyRuntime.isRatingInProgress = true;

    try {
      globalStudyTimer.recordActivity();
      const latencySec = studyRuntime.lastFlipLatencyMs > 0
        ? Number((studyRuntime.lastFlipLatencyMs / 1000).toFixed(2))
        : null;
      const backViewSec = Number((backViewMs / 1000).toFixed(2));

      app.studySession.rateCard(rating, { latencySec, backViewSec, backViewMs: Math.round(backViewMs) });
      recordPomodoroCardReviewed();
    } catch (err) {
      console.error('Lỗi rating thẻ:', err);
    } finally {
      studyRuntime.isRatingInProgress = false;
    }
  };
}

/**
 * Gắn nút chấm điểm 4 nút FSRS, nút Đóng phiên, Summary Home & Phím tắt (Space, 1-4, R, Esc)
 */
export function bindStudyRatingAndShortcuts(app, { overlay, triggerFlip, safeRateCard, closeDrawer }) {
  const btnClose = document.getElementById('btn-study-close');
  const drawer = document.getElementById('study-prefs-drawer');

  if (btnClose) {
    btnClose.addEventListener('click', async () => {
      try {
        stopAutoPlay();
        const stats = app.studySession.sessionStats;
        const reviewed = stats.reviewedCount || 0;
        const confirmed = await showConfirm({
          title: 'Thoát phiên học?',
          message: reviewed > 0
            ? `Bạn đã hoàn thành ${reviewed} thẻ trong phiên học này. Bạn có chắc chắn muốn thoát không?`
            : 'Bạn có chắc chắn muốn thoát phiên học này không?',
          confirmText: 'Xác nhận',
          type: 'danger',
          icon: '🚪'
        });

        if (confirmed) {
          clearStudyTimerSubscription();
          stopPomodoroTracker();
          app.studySession?.stopAudio();
          globalStudyTimer.endSession();
          try {
            BehavioralOptimizer.autoCalibrateBackground(app);
          } catch (e) {}
          StorageManager.flushPendingSync();
          overlay.classList.remove('active');
          scrollToTop();
          if (reviewed > 0) {
            showSummaryModal(app, stats, true);
          } else {
            app.refreshAllViews();
          }
        }
      } catch (err) {
        console.error('Lỗi khi đóng phiên học:', err);
      }
    });
  }

  document.querySelectorAll('.btn-fsrs-rating').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rating = parseInt(btn.getAttribute('data-rating'), 10);
      safeRateCard(rating);
    });
  });

  window.addEventListener('keydown', (e) => {
    try {
      if (!overlay.classList.contains('active')) return;
      if (drawer?.classList.contains('active')) {
        if (e.key === 'Escape') closeDrawer?.();
        return;
      }

      globalStudyTimer.recordActivity();

      if (e.code === 'Space') {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        e.preventDefault();
        if (!app.studySession.isFlipped) triggerFlip();
        else safeRateCard(Rating.Good);
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (app.studySession.currentCard) {
          app.studySession.speak(app.studySession.currentCard.word);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (btnClose) btnClose.click();
        return;
      }

      if (app.studySession.isFlipped) {
        const p = getStudyPrefs();
        const is2Buttons = p.ratingButtonsMode === '2_buttons';
        let rating = null;

        if (is2Buttons) {
          if (e.key === '1' || e.key === 'ArrowLeft') rating = Rating.Again;
          else if (e.key === '2' || e.key === '3' || e.key === 'ArrowRight' || e.key === 'Enter') rating = Rating.Good;
        } else {
          const fourBtnMap = { '1': Rating.Again, '2': Rating.Hard, '3': Rating.Good, '4': Rating.Easy };
          rating = fourBtnMap[e.key] || null;
        }

        if (rating) {
          e.preventDefault();
          safeRateCard(rating);
        }
      }
    } catch (err) {
      console.error('Lỗi phím tắt học:', err);
    }
  });

  const btnSummaryHome = document.getElementById('btn-summary-home');
  if (btnSummaryHome) {
    btnSummaryHome.addEventListener('click', () => {
      try {
        document.getElementById('study-summary-modal')?.classList.remove('active');
        getStudyOverlay()?.classList.remove('active');
        scrollToTop();
        app.refreshAllViews();
        if (app._pendingUpdateReload) {
          app._pendingUpdateReload = false;
          app.showToast('🚀 Đang áp dụng phiên bản mới nhất...', 'success', 2000);
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (err) {
        console.error('Lỗi đóng summary modal:', err);
      }
    });
  }
}

