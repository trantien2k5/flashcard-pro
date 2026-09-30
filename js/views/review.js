/**
 * Flashcard English Pro - Màn hình Trang Chủ (Home / Review View)
 * Hiển thị 3 chỉ số cốt lõi: Từ tới hạn, Thời gian đã học, Từ đã thuộc
 * Kèm nút CTA lớn để bắt đầu phiên học Flashcard FSRS-6 toàn màn hình
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { globalStudyTimer } from '../core/stats.js';

let _cachedApp = null;
let _isTimerListening = false;

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-minimal-container')) {
    container.innerHTML = `
      <div class="review-minimal-container">
        <!-- 1. Hero Greeting Banner -->
        <div class="review-hero-greeting">
          <h1 class="greeting-title" id="home-greeting-title">Hôm nay sẵn sàng ôn tập!</h1>
        </div>

        <!-- 2. Thẻ 3 chỉ số: Từ tới hạn, Thời gian đã học, Từ đã thuộc -->
        <div class="home-metrics-card inset-grouped-card">
          <!-- Cột 1: Từ tới hạn -->
          <div class="home-metric-item">
            <div class="metric-icon-badge badge-due">⚡</div>
            <div class="metric-info">
              <span class="metric-label">TỪ TỚI HẠN</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-due-count">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 2: Thời gian đã học -->
          <div class="home-metric-item">
            <div class="metric-icon-badge badge-time">⏱️</div>
            <div class="metric-info">
              <span class="metric-label">THỜI GIAN ĐÃ HỌC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-study-timer">0</strong>
                <span class="metric-unit">phút</span>
              </div>
            </div>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 3: Từ đã thuộc -->
          <div class="home-metric-item">
            <div class="metric-icon-badge badge-mastered">💎</div>
            <div class="metric-info">
              <span class="metric-label">TỪ ĐÃ THUỘC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-retention-rate">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. NÚT CTA TO BỰ: BẮT ĐẦU ÔN FLASHCARD -->
        <div class="home-cta-section">
          <button type="button" class="btn-hero-flashcard-cta" id="btn-home-start-flashcard">
            <div class="btn-cta-glare"></div>
            <div class="btn-cta-body">
              <div class="btn-cta-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div class="btn-cta-texts">
                <span class="btn-cta-main-text">BẮT ĐẦU ÔN FLASHCARD</span>
                <span class="btn-cta-sub-text" id="home-cta-subtext">Nhấn để vào phiên ôn tập FSRS-6</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    `;
  }
}

export function renderReviewTab(app) {
  try {
    _cachedApp = app;
    const container = document.getElementById('tab-review') || document.getElementById('tab-home');
    if (!container) return;
    renderReviewShell(container);

    // Bắt đầu lắng nghe nhịp tick của Active Study Timer để cập nhật live
    if (!_isTimerListening) {
      _isTimerListening = true;
      globalStudyTimer.subscribe(() => {
        const elTimer = document.getElementById('home-study-timer');
        if (elTimer) {
          const todaySecs = StorageManager.getTodayStudySeconds();
          const liveSecs = todaySecs + Math.floor(globalStudyTimer.unflushedSeconds || 0);
          const mins = Math.max(0, Math.floor(liveSecs / 60));
          elTimer.textContent = mins;
        }
      });
    }

    // Gán sự kiện cho Nút CTA To
    const btnFlashcard = document.getElementById('btn-home-start-flashcard');
    if (btnFlashcard && !btnFlashcard._bound) {
      btnFlashcard._bound = true;
      btnFlashcard.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'due_first' });
      };
    }

    // Cập nhật số liệu thống kê realtime
    updateHomeStatsRealtime(app);

  } catch (err) {
    console.error('Lỗi khi render Review Tab:', err);
  }
}

/**
 * Cập nhật toàn bộ các chỉ số thống kê trên Home Dashboard theo thời gian thực (Real-time)
 */
export function updateHomeStatsRealtime(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const now = new Date();

  let learnedCount = 0;
  let masteredCount = 0;
  let dueCount = 0;

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (state && state.state !== State.New && state.state !== 0 && !state.suspended) {
      learnedCount++;
      const isDue = isCardDue(state, now);
      if (isDue) {
        dueCount++;
      }
      const s = Number(state.stability) || 0;
      if (s >= 14 && !isDue) {
        masteredCount++;
      }
    }
  }

  // 1. Số từ tới hạn
  const elDue = document.getElementById('home-due-count');
  if (elDue) {
    elDue.textContent = dueCount;
  }

  // Cập nhật text phụ của nút CTA
  const elCtaSub = document.getElementById('home-cta-subtext');
  if (elCtaSub) {
    if (dueCount > 0) {
      elCtaSub.textContent = `⚡ ${dueCount} từ đến hạn cần ôn ngay • FSRS-6`;
    } else {
      elCtaSub.textContent = `🎉 Đã hoàn thành ôn tập • Nhấn để luyện từ mới`;
    }
  }

  // 2. Thời gian đã học
  const elTimer = document.getElementById('home-study-timer');
  if (elTimer) {
    const todaySecs = StorageManager.getTodayStudySeconds();
    const liveSecs = todaySecs + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
    const mins = Math.max(0, Math.floor(liveSecs / 60));
    elTimer.textContent = mins;
  }

  // 3. Từ đã thuộc
  const elRetention = document.getElementById('home-retention-rate');
  if (elRetention) {
    elRetention.textContent = masteredCount;
  }
}
