import { StorageManager } from '../services/storage.js';
import { State, isCardDue, FSRS, Rating } from '../core/fsrs.js';
import { StatsManager, globalStudyTimer } from '../core/stats.js';
import { getLocalDateKey, escapeHTML } from '../utils.js';
import { showToast, openGoalPlannerModal } from './components.js';
import { speak, speakVi, stopAudio } from '../services/audio.js';

let _cachedApp = null;
let _lazyAudioState = {
  active: false,
  words: [],
  currentIndex: 0,
  isPlaying: false,
  speed: 1.0,
  isLoop: true,
  timerId: null
};

let _inlineStudyState = {
  queue: [],
  currentIndex: 0,
  currentCard: null,
  isFlipped: false,
  fsrs: null,
  startTime: 0,
  isTimerListening: false,
  isInitialized: false
};

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-col-left') || !container.querySelector('#review-goals-card') || !container.querySelector('#review-inline-study-card')) {
    container.innerHTML = `
      <div class="review-bento-container">

        <!-- LEFT COLUMN (Command Center & Inline Quick Flashcard) -->
        <div class="review-col review-col-left">

          <!-- 1. Hero Card: Nhiệm Vụ Hôm Nay (Unified Bento Design) -->
          <div class="review-hero-card">
            <!-- Top Row Header -->
            <div class="review-card-header">
              <div class="review-card-header-left">
                <div class="review-hero-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <div class="review-hero-titles">
                  <div class="review-hero-pill-tag">NHIỆM VỤ HÔM NAY</div>
                  <h2 class="review-hero-main-title" id="home-today-status">Kế hoạch ôn tập & nạp từ vựng</h2>
                </div>
              </div>

              <div class="review-header-badges-wrap">
                <span class="pill-review-streak" id="home-header-streak">🔥 0 ngày</span>
                <span class="pill-review-goal" id="home-goal-pct">0%</span>
              </div>
            </div>

            <!-- Goal Progress Track -->
            <div class="review-goal-track">
              <div class="review-goal-fill" id="home-goal-progress-fill" style="width: 0%;"></div>
            </div>

            <!-- 4 Bento Metrics Grid (2x2) -->
            <div class="hero-quad-grid">
              <!-- Card 1: Cần ôn ngay -->
              <div class="quad-tile tile-due" id="box-home-due">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">📥</span>
                  <span class="quad-label">CẦN ÔN TẬP</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-due-val">0</span>
                  <span class="quad-unit">từ</span>
                </div>
                <span class="quad-sub-hint" id="home-due-hint">Ưu tiên ôn trước</span>
              </div>

              <!-- Card 2: Đã học hôm nay -->
              <div class="quad-tile tile-new" id="box-home-new">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">✨</span>
                  <span class="quad-label">ĐÃ HỌC HÔM NAY</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-new-today-val">0/10</span>
                  <span class="quad-unit">từ</span>
                </div>
                <span class="quad-sub-hint" id="home-goal-hint">Chỉ tiêu: 10 từ</span>
              </div>

              <!-- Card 3: Thời gian học -->
              <div class="quad-tile tile-time" id="box-home-time">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">⏱️</span>
                  <span class="quad-label">THỜI GIAN HỌC</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-study-timer">0p</span>
                </div>
                <span class="quad-sub-hint">Tập trung hôm nay</span>
              </div>

              <!-- Card 4: Từ đã thuộc (Tầng 4 & 5 FSRS) -->
              <div class="quad-tile tile-retention" id="box-home-retention">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">💎</span>
                  <span class="quad-label">TỪ ĐÃ THUỘC</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-retention-rate">0</span>
                  <span class="quad-unit">từ</span>
                </div>
                <span class="quad-sub-hint" id="home-retention-hint">Ghi nhớ bền vững 🛡️</span>
              </div>
            </div>

            <!-- Dual Action Launchpad (Twin CTA Buttons) -->
            <div class="hero-action-container">
              <div class="hero-twin-cta-row" id="home-twin-cta-row">
                <button class="btn-hero-twin-study" id="btn-home-hero-cta" type="button" title="Học & Ôn bằng thẻ Flashcard 3D">
                  <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  <span id="home-hero-cta-text">Ôn thẻ Flashcard</span>
                </button>

                <button class="btn-hero-twin-quiz" id="btn-home-quiz-cta" type="button" title="Học & Ôn bằng trắc nghiệm phản xạ FSRS">
                  <span>⚡</span>
                  <span id="home-quiz-cta-text">Trắc nghiệm FSRS</span>
                </button>
              </div>

              <div class="hero-meta-hint">
                <span id="home-estimated-time">⏱️ Khoảng 0 phút</span>
                <span class="hint-sep">•</span>
                <span id="home-streak-hint">Học hôm nay để giữ chuỗi 🔥</span>
              </div>
            </div>
          </div>

          <!-- 2. Interactive Inline Quick Flashcard (Tối Giản 1 Lớp, Không Lồng Card, Không Cắt Chữ) -->
          <div class="review-inline-card" id="review-inline-study-card">
            <div class="inline-card-topbar">
              <div class="inline-topbar-left">
                <span class="inline-flash-badge">⚡ ÔN TẬP NHANH</span>
                <span class="inline-queue-pill" id="inline-queue-pill">...</span>
              </div>
              <button type="button" class="btn-inline-speaker" id="btn-inline-speaker" title="Phát âm từ vựng">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
            </div>

            <!-- Single Layer Content (No Inner Box Border) -->
            <div class="inline-card-viewport" id="inline-card-viewport">
              <!-- Front View -->
              <div class="inline-card-face inline-card-front" id="inline-face-front">
                <div class="inline-meta-badges">
                  <span class="inline-badge-cefr" id="inline-cefr">B1</span>
                  <span class="inline-badge-pos" id="inline-pos">noun</span>
                </div>
                <h2 class="inline-word-text" id="inline-word">Opportunity</h2>
                <div class="inline-ipa-text" id="inline-ipa">/ˌɑː.pɚˈtuː.nə.t̬i/</div>
                <div class="inline-front-hint">
                  <button type="button" class="btn-inline-flip" id="btn-inline-flip">
                    <span>Lật thẻ xem đáp án</span>
                  </button>
                </div>
              </div>

              <!-- Back View (Revealed) -->
              <div class="inline-card-face inline-card-back" id="inline-face-back" style="display: none;">
                <div class="inline-back-word-row">
                  <span class="inline-back-word" id="inline-back-word">Opportunity</span>
                  <span class="inline-back-ipa" id="inline-back-ipa">/ˌɑː.pɚˈtuː.nə.t̬i/</span>
                </div>
                <div class="inline-meaning-text" id="inline-meaning">Cơ hội, thời cơ thuận lợi</div>

                <div class="inline-example-box" id="inline-example-box">
                  <p class="inline-example-en" id="inline-example-en">"This is a great opportunity to improve your skills."</p>
                  <p class="inline-example-vi" id="inline-example-vi">"Đây là một cơ hội tuyệt vời để nâng cao kỹ năng của bạn."</p>
                </div>

                <!-- 4 FSRS Self-Rating Buttons -->
                <div class="inline-rating-grid">
                  <button type="button" class="btn-inline-rate rate-again" id="btn-rate-again" data-rating="1">
                    <span class="rate-name">Quên</span>
                    <span class="rate-interval" id="rate-int-again">&lt;10p</span>
                  </button>
                  <button type="button" class="btn-inline-rate rate-hard" id="btn-rate-hard" data-rating="2">
                    <span class="rate-name">Khó</span>
                    <span class="rate-interval" id="rate-int-hard">1 ngày</span>
                  </button>
                  <button type="button" class="btn-inline-rate rate-good" id="btn-rate-good" data-rating="3">
                    <span class="rate-name">Nhớ</span>
                    <span class="rate-interval" id="rate-int-good">3 ngày</span>
                  </button>
                  <button type="button" class="btn-inline-rate rate-easy" id="btn-rate-easy" data-rating="4">
                    <span class="rate-name">Dễ</span>
                    <span class="rate-interval" id="rate-int-easy">4 ngày</span>
                  </button>
                </div>
              </div>

              <!-- All Caught Up / Empty State -->
              <div class="inline-card-empty" id="inline-card-empty" style="display: none;">
                <div class="empty-icon">🎉</div>
                <h4 class="empty-title">Đã Hoàn Thành Ôn Tập!</h4>
                <p class="empty-desc">Toàn bộ từ vựng đến hạn hôm nay đã được ôn luyện sạch sẽ.</p>
                <button type="button" class="btn-inline-more" id="btn-inline-more">
                  <span>✨ Luyện thêm từ mới</span>
                </button>
              </div>
            </div>
          </div>

        </div> <!-- /review-col-left -->

        <!-- RIGHT COLUMN (Goal & Progress Tracker, Lazy Walk & Weak Cards Drill) -->
        <div class="review-col review-col-right">

          <!-- 3. Goal & Progress Tracker Bento Card (Mục Tiêu & Tiến Độ Đa Tầng) -->
          <div class="review-hero-card review-goals-card" id="review-goals-card">
            <!-- Top Row Header -->
            <div class="review-card-header">
              <div class="review-card-header-left">
                <div class="review-goals-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div class="review-hero-titles">
                  <div class="review-hero-pill-tag">MỤC TIÊU & TIẾN ĐỘ</div>
                  <h2 class="review-hero-main-title" id="goals-main-title">Lộ trình mục tiêu cá nhân</h2>
                </div>
              </div>

              <div class="review-header-badges-wrap">
                <span class="pill-goals-countdown" id="goals-countdown-badge">⏳ Đang tính...</span>
                <span class="pill-goals-milestone" id="goals-milestone-badge">0%</span>
              </div>
            </div>

            <!-- Goal Progress Track -->
            <div class="review-goal-track">
              <div class="review-goal-fill ring-fill-gradient" id="goals-total-track-fill" style="width: 0%;"></div>
            </div>

            <!-- 3 Radial Rings Grid (% Tròn Ngày, Tuần, Tháng) -->
            <div class="goals-rings-grid">
              <!-- Ring 1: Ngày -->
              <div class="goal-ring-card ring-day">
                <div class="goal-ring-svg-wrap">
                  <svg class="ring-svg" viewBox="0 0 48 48">
                    <circle class="ring-bg" cx="24" cy="24" r="20" />
                    <circle class="ring-fill ring-fill-day" id="ring-svg-day" cx="24" cy="24" r="20" />
                  </svg>
                  <span class="ring-center-val" id="ring-val-day">0%</span>
                </div>
                <div class="goal-ring-info">
                  <span class="goal-ring-title">Hôm nay</span>
                  <span class="goal-ring-detail" id="ring-detail-day">0 từ</span>
                </div>
              </div>

              <!-- Ring 2: Tuần -->
              <div class="goal-ring-card ring-week">
                <div class="goal-ring-svg-wrap">
                  <svg class="ring-svg" viewBox="0 0 48 48">
                    <circle class="ring-bg" cx="24" cy="24" r="20" />
                    <circle class="ring-fill ring-fill-week" id="ring-svg-week" cx="24" cy="24" r="20" />
                  </svg>
                  <span class="ring-center-val" id="ring-val-week">0%</span>
                </div>
                <div class="goal-ring-info">
                  <span class="goal-ring-title">7 ngày qua</span>
                  <span class="goal-ring-detail" id="ring-detail-week">0 từ</span>
                </div>
              </div>

              <!-- Ring 3: Tháng -->
              <div class="goal-ring-card ring-month">
                <div class="goal-ring-svg-wrap">
                  <svg class="ring-svg" viewBox="0 0 48 48">
                    <circle class="ring-bg" cx="24" cy="24" r="20" />
                    <circle class="ring-fill ring-fill-month" id="ring-svg-month" cx="24" cy="24" r="20" />
                  </svg>
                  <span class="ring-center-val" id="ring-val-month">0%</span>
                </div>
                <div class="goal-ring-info">
                  <span class="goal-ring-title">30 ngày qua</span>
                  <span class="goal-ring-detail" id="ring-detail-month">0 từ</span>
                </div>
              </div>
            </div>

            <!-- 2 Bento Sub-Goal & Master-Goal Dual Tiles -->
            <div class="goals-dual-status-grid">
              <!-- Tile 1: Mục tiêu Chặng (Sub-goal) -->
              <div class="goal-status-tile tile-sprint" id="tile-goal-sprint">
                <div class="status-tile-top">
                  <span class="status-tile-icon">🎯</span>
                  <span class="status-tile-label" id="goal-sprint-label">MỤC TIÊU CHẶNG</span>
                </div>
                <div class="status-tile-main">
                  <span class="status-tile-num" id="goal-sprint-num">--/--</span>
                  <span class="status-tile-unit">từ</span>
                </div>
                <span class="status-tile-sub" id="goal-sprint-sub">Đang tính tiến độ...</span>
              </div>

              <!-- Tile 2: Kho Tổng Thư Viện (Master-goal) -->
              <div class="goal-status-tile tile-master" id="tile-goal-master">
                <div class="status-tile-top">
                  <span class="status-tile-icon">📚</span>
                  <span class="status-tile-label">KHO TỔNG THƯ VIỆN</span>
                </div>
                <div class="status-tile-main">
                  <span class="status-tile-num" id="goal-master-num">--/--</span>
                  <span class="status-tile-unit">từ</span>
                </div>
                <span class="status-tile-sub" id="goal-master-sub">Đang đồng bộ dữ liệu...</span>
              </div>
            </div>

            <!-- Motivating Sprint Action Strip (Matching Twin CTA Row on Left Card) -->
            <div class="goals-motive-strip">
              <div class="goals-motive-left">
                <span class="goals-motive-icon">⚡</span>
                <span class="goals-motive-text" id="goals-motive-text">Đang phân tích lộ trình học tập...</span>
              </div>
              <button type="button" class="btn-goals-adjust" id="btn-goals-adjust" title="Căn chỉnh & lập kế hoạch mục tiêu FSRS">
                <span>Đổi mục tiêu 🎯</span>
              </button>
            </div>
          </div>

          <!-- 4. Lazy Hands-free Audio Walk Shortcut -->
          <div class="review-lazy-walk-card">
            <div class="lazy-walk-left">
              <div class="lazy-walk-icon">🎧</div>
              <div class="lazy-walk-text">
                <span class="lazy-walk-title">Học Lười Rảnh Tay</span>
                <span class="lazy-walk-desc">Tự động phát âm & dịch nghĩa khi đi bộ, lái xe, làm việc nhà</span>
              </div>
            </div>
            <button type="button" class="btn-lazy-walk-trigger" id="btn-trigger-lazy-walk" title="Bắt đầu nghe thụ động rảnh tay">
              <span>Bật Nghe</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
          </div>

          <!-- 5. Củng Cố Từ Vựng & Phòng Ngừa Hay Quên (Weak Words Drill / Mastery Health) -->
          <div id="review-weak-words-box" class="review-weak-card">
            <div class="weak-card-header">
              <div class="weak-header-left">
                <div class="weak-icon-badge" id="weak-icon-badge">🛡️</div>
                <div class="weak-title-wrap">
                  <span class="weak-tag" id="weak-tag-label">PHÒNG NGỪA QUÊN TỪ</span>
                  <h3 class="weak-main-title" id="weak-words-title">Phong độ xuất sắc • Chưa có từ nào hay quên</h3>
                </div>
              </div>
              <span class="weak-count-pill" id="weak-words-count-badge">Tốt ✓</span>
            </div>

            <div class="weak-actions-row" id="weak-actions-row" style="display: none;">
              <button type="button" class="btn-weak-action btn-weak-3d" id="btn-weak-drill-3d">
                <span>🎴 Củng cố Flashcard</span>
              </button>
              <button type="button" class="btn-weak-action btn-weak-quiz" id="btn-weak-drill-quiz">
                <span>⚡ Trắc nghiệm Củng Cố</span>
              </button>
            </div>
          </div>

        </div> <!-- /review-col-right -->

      </div>

      <!-- Lazy Audio Walk Floating Player Modal -->
      <div id="lazy-audio-modal" class="lazy-audio-modal" style="display: none;">
        <div class="lazy-audio-card">
          <div class="lazy-modal-header">
            <div class="lazy-modal-tag">
              <span class="lazy-pulse-dot"></span>
              <span>🎧 ĐANG PHÁT RẢNH TAY</span>
            </div>
            <button type="button" class="btn-lazy-close" id="btn-lazy-close" title="Đóng trình phát">✕</button>
          </div>

          <div class="lazy-word-display">
            <div class="lazy-word-counter" id="lazy-word-counter">Từ 1 / 10</div>
            <h2 class="lazy-word-text" id="lazy-word-text">Vocabulary</h2>
            <div class="lazy-word-phonetic" id="lazy-word-phonetic">/vəˈkæbjələri/</div>
            <div class="lazy-word-meaning" id="lazy-word-meaning">Từ vựng</div>
            <div class="lazy-word-badges">
              <span class="lazy-badge-cefr" id="lazy-badge-cefr">A1</span>
              <span class="lazy-badge-cat" id="lazy-badge-cat">Giao tiếp</span>
            </div>
          </div>

          <div class="lazy-controls-row">
            <button type="button" class="btn-lazy-ctrl" id="btn-lazy-prev" title="Từ trước">⏮️</button>
            <button type="button" class="btn-lazy-ctrl btn-lazy-play" id="btn-lazy-play-toggle" title="Tạm dừng / Tiếp tục">⏸️</button>
            <button type="button" class="btn-lazy-ctrl" id="btn-lazy-next" title="Từ tiếp theo">⏭️</button>
            <button type="button" class="btn-lazy-ctrl btn-lazy-speed" id="btn-lazy-speed" title="Tốc độ đọc">1.0x</button>
            <button type="button" class="btn-lazy-ctrl btn-lazy-loop active" id="btn-lazy-loop" title="Lặp lại danh sách">🔁</button>
          </div>
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
    if (!_inlineStudyState.isTimerListening) {
      _inlineStudyState.isTimerListening = true;
      globalStudyTimer.subscribe(() => {
        const elTimer = document.getElementById('home-study-timer');
        if (elTimer) {
          const todaySecs = StorageManager.getTodayStudySeconds();
          const liveSecs = todaySecs + Math.floor(globalStudyTimer.unflushedSeconds || 0);
          if (liveSecs < 60) {
            elTimer.textContent = liveSecs > 0 ? `${liveSecs}s` : `0p`;
          } else {
            elTimer.textContent = `${Math.round(liveSecs / 60)}p`;
          }
        }
      });
    }

    // 1. Cập nhật số liệu tổng quan & các chỉ số Home Bento
    updateHomeStatsRealtime(app);

    // 2. Khởi tạo Trình Ôn Tập Flashcard Nhanh Trực Tiếp Tại Trang Chủ
    initInlineStudy(app);

    // 3. Lazy Audio Walk Trigger & Controller
    const btnTriggerLazy = document.getElementById('btn-trigger-lazy-walk');
    if (btnTriggerLazy) {
      btnTriggerLazy.onclick = () => {
        const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
        const allCards = app.deckManager.getAllCards();
        let walkCards = [];
        if (studyQueue.dueCards && studyQueue.dueCards.length > 0) {
          walkCards = studyQueue.dueCards;
        } else if (studyQueue.newCards && studyQueue.newCards.length > 0) {
          walkCards = studyQueue.newCards;
        } else {
          walkCards = allCards.slice(0, 20);
        }

        if (!walkCards || walkCards.length === 0) {
          showToast('Chưa có từ vựng khả dụng để nghe', 'info');
          return;
        }

        startLazyAudioWalk(walkCards, app);
      };
    }

  } catch (err) {
    console.error('Lỗi khi render Review Tab:', err);
  }
}

/**
 * Ghi nhận người dùng đang chủ động học để bật bộ đếm thời gian thực
 */
function notifyStudyActivity() {
  if (!globalStudyTimer.isActiveSession) {
    globalStudyTimer.startSession();
  }
  globalStudyTimer.recordActivity();
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

  // Timer & Retention
  const elTimer = document.getElementById('home-study-timer');
  if (elTimer) {
    const todaySecs = StorageManager.getTodayStudySeconds();
    const liveSecs = todaySecs + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
    if (liveSecs < 60) {
      elTimer.textContent = liveSecs > 0 ? `${liveSecs}s` : `0p`;
    } else {
      elTimer.textContent = `${Math.round(liveSecs / 60)}p`;
    }
  }

  const elRetention = document.getElementById('home-retention-rate');
  if (elRetention) {
    elRetention.textContent = masteredCount;
  }

  const elRetentionHint = document.getElementById('home-retention-hint');
  if (elRetentionHint) {
    elRetentionHint.textContent = masteredCount > 0 ? 'Ghi nhớ bền vững 🛡️' : 'Độ bền ≥ 14 ngày';
  }

  // Daily Goals & Logs
  const dailyGoal = Number(app.settings?.dailyNewLimit) || 10;
  const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
  const queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : dueCount;
  const queueNew = studyQueue.totalNew !== undefined ? studyQueue.totalNew : 0;

  const allLogs = StorageManager.getStudyLogs();
  const todayLogs = allLogs.filter(l => 
    l.timestamp && getLocalDateKey(l.timestamp) === getLocalDateKey()
  );
  const todayNewLearned = todayLogs.filter(l => 
    l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
  ).length;
  const remainingGoal = Math.max(0, dailyGoal - todayNewLearned);
  const goalPct = Math.min(100, Math.round((todayNewLearned / dailyGoal) * 100));

  // Today Status
  const elTodayStatus = document.getElementById('home-today-status');
  if (elTodayStatus) {
    if (queueDue > 0) {
      elTodayStatus.textContent = `Có ${queueDue} từ cần ôn tập hôm nay`;
    } else if (todayNewLearned >= dailyGoal) {
      elTodayStatus.textContent = 'Đã hoàn thành xuất sắc chỉ tiêu hôm nay ✓';
    } else {
      elTodayStatus.textContent = `Còn ${remainingGoal} từ mới để đạt chỉ tiêu hôm nay`;
    }
  }

  // Streak & Goals
  const streak = StatsManager.calculateStreak(allLogs);
  const primeHour = StatsManager.getPrimeStudyHour(allLogs);

  const elHeaderStreak = document.getElementById('home-header-streak');
  if (elHeaderStreak) elHeaderStreak.textContent = `🔥 ${streak} ngày`;

  const elGoalPct = document.getElementById('home-goal-pct');
  if (elGoalPct) elGoalPct.textContent = `${goalPct}%`;

  const elGoalFill = document.getElementById('home-goal-progress-fill');
  if (elGoalFill) elGoalFill.style.width = `${goalPct}%`;

  const elStreakHint = document.getElementById('home-streak-hint');
  if (elStreakHint) {
    if (primeHour && primeHour.text) {
      elStreakHint.textContent = `⏱️ Giờ vàng: ${primeHour.text}`;
    } else if (todayLogs.length > 0) {
      elStreakHint.textContent = `Đã giữ chuỗi ${streak} ngày hôm nay! 🌟`;
    } else {
      elStreakHint.textContent = `Học hôm nay để giữ chuỗi ${streak} ngày 🔥`;
    }
  }

  // Due & New boxes
  const elDueVal = document.getElementById('home-due-val');
  if (elDueVal) elDueVal.textContent = queueDue;

  const elDueHint = document.getElementById('home-due-hint');
  if (elDueHint) {
    elDueHint.textContent = queueDue > 0 ? 'Ưu tiên ôn trước' : 'Đã sạch hàng đợi ✓';
  }

  const elNewVal = document.getElementById('home-new-today-val');
  if (elNewVal) elNewVal.textContent = `${todayNewLearned}/${dailyGoal}`;

  const elGoalHint = document.getElementById('home-goal-hint');
  if (elGoalHint) {
    elGoalHint.textContent = todayNewLearned >= dailyGoal ? `Đạt chỉ tiêu ngày ✓` : `Còn ${remainingGoal} từ nữa`;
  }

  // Goal & Progress Rings
  const dayPct = Math.min(100, Math.round((todayNewLearned / dailyGoal) * 100));

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekLogs = allLogs.filter(l => l.timestamp && new Date(l.timestamp) >= weekStart);
  const weekNewLearned = weekLogs.filter(l => 
    l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
  ).length;
  const weekGoal = dailyGoal * 7;
  const weekPct = Math.min(100, Math.round((weekNewLearned / weekGoal) * 100));

  const month30Start = new Date(now);
  month30Start.setDate(month30Start.getDate() - 29);
  month30Start.setHours(0, 0, 0, 0);
  const month30Logs = allLogs.filter(l => l.timestamp && new Date(l.timestamp) >= month30Start);
  const month30NewLearned = month30Logs.filter(l => 
    l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
  ).length;
  const month30Goal = dailyGoal * 30;
  const month30Pct = Math.min(100, Math.round((month30NewLearned / month30Goal) * 100));

  const roadmap = StatsManager.getMilestoneRoadmap(learnedCount, dailyGoal);
  const activeStage = roadmap.activeStage;
  const stageTargetWords = activeStage.targetWords;
  const stageLearnedWords = Math.min(stageTargetWords, learnedCount);
  const stageWordsLeft = Math.max(0, stageTargetWords - stageLearnedWords);
  const stageDaysEstimate = Math.max(1, Math.ceil(stageWordsLeft / dailyGoal));

  const totalLibraryWords = (allCards && allCards.length) ? allCards.length : 3523;
  const libraryMasteredPct = Math.min(100, Math.round((masteredCount / totalLibraryWords) * 100));

  const elGoalsTitle = document.getElementById('goals-main-title');
  if (elGoalsTitle) elGoalsTitle.textContent = `${activeStage.title} (${activeStage.targetWords} từ)`;

  const elGoalsCountdown = document.getElementById('goals-countdown-badge');
  if (elGoalsCountdown) {
    elGoalsCountdown.textContent = stageWordsLeft > 0 ? `⏳ Còn ${stageDaysEstimate} ngày` : '🏆 Hoàn thành';
  }

  const elGoalsMilestone = document.getElementById('goals-milestone-badge');
  if (elGoalsMilestone) elGoalsMilestone.textContent = `${activeStage.progressPct}%`;

  const elGoalsTotalTrack = document.getElementById('goals-total-track-fill');
  if (elGoalsTotalTrack) elGoalsTotalTrack.style.width = `${activeStage.progressPct}%`;

  const setRadialRing = (svgId, valId, detailId, pct, count, target) => {
    const elSvg = document.getElementById(svgId);
    const elVal = document.getElementById(valId);
    const elDetail = document.getElementById(detailId);
    if (elSvg) {
      const offset = 125.66 * (1 - Math.min(100, Math.max(0, pct)) / 100);
      elSvg.style.strokeDashoffset = offset;
    }
    if (elVal) elVal.textContent = `${pct}%`;
    if (elDetail) elDetail.textContent = `${count}/${target} từ`;
  };

  setRadialRing('ring-svg-day', 'ring-val-day', 'ring-detail-day', dayPct, todayNewLearned, dailyGoal);
  setRadialRing('ring-svg-week', 'ring-val-week', 'ring-detail-week', weekPct, weekNewLearned, weekGoal);
  setRadialRing('ring-svg-month', 'ring-val-month', 'ring-detail-month', month30Pct, month30NewLearned, month30Goal);

  const elSprintNum = document.getElementById('goal-sprint-num');
  if (elSprintNum) elSprintNum.textContent = `${stageLearnedWords}/${stageTargetWords}`;

  const elSprintSub = document.getElementById('goal-sprint-sub');
  if (elSprintSub) {
    elSprintSub.textContent = stageWordsLeft > 0 ? `Chặng ${activeStage.id} • Còn ${stageWordsLeft} từ` : `Chặng ${activeStage.id} • Đã hoàn thành 🏆`;
  }

  const elMasterNum = document.getElementById('goal-master-num');
  if (elMasterNum) elMasterNum.textContent = `${learnedCount}/${totalLibraryWords}`;

  const elMasterSub = document.getElementById('goal-master-sub');
  if (elMasterSub) elMasterSub.textContent = `Đã thuộc ${masteredCount} từ (${libraryMasteredPct}%) 🛡️`;

  const elMotiveText = document.getElementById('goals-motive-text');
  if (elMotiveText) {
    if (stageWordsLeft > 0) {
      elMotiveText.textContent = `🔥 Duy trì ${dailyGoal} từ/ngày để hoàn tất ${activeStage.title} sau ${stageDaysEstimate} ngày nữa!`;
    } else {
      elMotiveText.textContent = `🎉 Tuyệt vời! Đã chinh phục ${activeStage.title}. Sẵn sàng cho chặng tiếp theo!`;
    }
  }

  const btnGoalsAdjust = document.getElementById('btn-goals-adjust');
  if (btnGoalsAdjust) {
    btnGoalsAdjust.onclick = (e) => {
      e.stopPropagation();
      openGoalPlannerModal(app, () => {
        updateHomeStatsRealtime(app);
      });
    };
  }

  // Twin Hero Buttons
  const btnHeroCta = document.getElementById('btn-home-hero-cta');
  const elCtaText = document.getElementById('home-hero-cta-text');
  const btnQuizCta = document.getElementById('btn-home-quiz-cta');
  const elQuizText = document.getElementById('home-quiz-cta-text');
  const elEstTime = document.getElementById('home-estimated-time');

  if (btnHeroCta && btnQuizCta) {
    if (queueDue > 0) {
      if (elCtaText) elCtaText.textContent = `Ôn ${queueDue} từ (Thẻ 3D)`;
      if (elQuizText) elQuizText.textContent = `Trắc nghiệm (${queueDue} từ)`;
      const estMin = Math.max(1, Math.ceil(queueDue * 0.5));
      if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút ôn tập`;

      btnHeroCta.onclick = () => {
        try {
          app.startStudySession(null, null, null, { mode: 'due_only' });
        } catch (err) {
          showToast('Lỗi: ' + err.message, 'error');
        }
      };

      btnQuizCta.onclick = () => {
        try {
          app.startQuizSession(studyQueue.dueCards, { mode: 'due_only' });
        } catch (err) {
          showToast('Lỗi: ' + err.message, 'error');
        }
      };
    } else if (todayNewLearned < dailyGoal) {
      const newBatchCount = Math.min(remainingGoal, queueNew > 0 ? queueNew : remainingGoal);
      if (elCtaText) elCtaText.textContent = `Học ${newBatchCount} từ mới (Thẻ 3D)`;
      if (elQuizText) elQuizText.textContent = `Trắc nghiệm (${newBatchCount} từ mới)`;
      const estMin = Math.max(1, Math.ceil(newBatchCount * 0.6));
      if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút nạp từ mới`;

      btnHeroCta.onclick = () => {
        try {
          app.startStudySession(null, null, null, { mode: 'new_only' });
        } catch (err) {
          showToast('Lỗi: ' + err.message, 'error');
        }
      };

      btnQuizCta.onclick = () => {
        try {
          app.startQuizSession(studyQueue.newCards, { mode: 'new_only' });
        } catch (err) {
          showToast('Lỗi: ' + err.message, 'error');
        }
      };
    } else {
      if (elCtaText) elCtaText.textContent = `Luyện tập thêm (Thẻ 3D)`;
      if (elQuizText) elQuizText.textContent = `Trắc nghiệm phản xạ`;
      if (elEstTime) elEstTime.textContent = `🎉 Đã hoàn thành chỉ tiêu ngày! Sẵn sàng luyện thêm`;

      btnHeroCta.onclick = () => {
        try {
          app.startStudySession();
        } catch (err) {
          showToast('Lỗi: ' + err.message, 'error');
        }
      };

      btnQuizCta.onclick = () => {
        try {
          app.startQuizSession();
        } catch (err) {
          showToast('Lỗi: ' + err.message, 'error');
        }
      };
    }
  }

  // Weak Words Box
  const weakWords = typeof app.deckManager.getWeakWords === 'function' ? app.deckManager.getWeakWords(10) : [];
  const boxWeak = document.getElementById('review-weak-words-box');
  const elWeakIcon = document.getElementById('weak-icon-badge');
  const elWeakTag = document.getElementById('weak-tag-label');
  const elWeakTitle = document.getElementById('weak-words-title');
  const elWeakCount = document.getElementById('weak-words-count-badge');
  const weakActionsRow = document.getElementById('weak-actions-row');
  const btnWeak3D = document.getElementById('btn-weak-drill-3d');
  const btnWeakQuiz = document.getElementById('btn-weak-drill-quiz');

  if (boxWeak) {
    if (weakWords.length > 0) {
      if (elWeakIcon) elWeakIcon.textContent = '💡';
      if (elWeakTag) {
        elWeakTag.textContent = 'TỪ VỰNG CẦN CỦNG CỐ';
        elWeakTag.style.color = '#ef4444';
      }
      if (elWeakTitle) elWeakTitle.textContent = `Có ${weakWords.length} từ bạn hay quên cần ôn luyện lại`;
      if (elWeakCount) {
        elWeakCount.textContent = `${weakWords.length} từ`;
        elWeakCount.style.color = '#ef4444';
        elWeakCount.style.background = 'rgba(239, 68, 68, 0.12)';
      }
      if (weakActionsRow) weakActionsRow.style.display = 'grid';

      if (btnWeak3D) {
        btnWeak3D.onclick = () => {
          try {
            app.startStudySession(null, null, weakWords);
          } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      }

      if (btnWeakQuiz) {
        btnWeakQuiz.onclick = () => {
          try {
            app.startQuizSession(weakWords);
          } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      }
    } else {
      if (elWeakIcon) elWeakIcon.textContent = '🛡️';
      if (elWeakTag) {
        elWeakTag.textContent = 'PHÒNG NGỪA QUÊN TỪ';
        elWeakTag.style.color = '#10b981';
      }
      if (elWeakTitle) elWeakTitle.textContent = 'Phong độ xuất sắc • Chưa có từ nào bị quên nhiều lần';
      if (elWeakCount) {
        elWeakCount.textContent = 'Tốt ✓';
        elWeakCount.style.color = '#10b981';
        elWeakCount.style.background = 'rgba(16, 185, 129, 0.12)';
      }
      if (weakActionsRow) weakActionsRow.style.display = 'none';
    }
  }
}

/**
 * Khởi tạo Trình Ôn Tập Nhanh Trực Tiếp Tại Trang Chủ (Inline Quick Flashcard)
 */
function initInlineStudy(app) {
  if (!app || !app.deckManager) return;

  _inlineStudyState.fsrs = new FSRS({
    requestRetention: Number(app.settings?.requestRetention) || 0.90,
    enableFuzz: app.settings?.enableFuzz !== false
  });

  const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
  const dueCards = Array.isArray(studyQueue.dueCards) ? [...studyQueue.dueCards] : [];
  const newCards = Array.isArray(studyQueue.newCards) ? [...studyQueue.newCards] : [];
  const allCards = app.deckManager.getAllCards() || [];

  // Ưu tiên 1: Toàn bộ từ tới hạn (Due Cards)
  // Ưu tiên 2: Từ mới (New Cards)
  // Ưu tiên 3: Toàn bộ từ vựng
  let targetQueue = [];
  if (dueCards.length > 0) {
    targetQueue = dueCards;
  } else if (newCards.length > 0) {
    targetQueue = newCards;
  } else {
    targetQueue = allCards.slice(0, 30);
  }

  _inlineStudyState.queue = targetQueue;
  _inlineStudyState.currentIndex = 0;

  setupInlineStudyEvents(app);
  showNextInlineCard();
}

/**
 * Gán sự kiện cho các nút điều khiển của Inline Quick Flashcard
 */
function setupInlineStudyEvents(app) {
  const btnFlip = document.getElementById('btn-inline-flip');
  const frontFace = document.getElementById('inline-face-front');
  const btnSpeaker = document.getElementById('btn-inline-speaker');
  const btnMore = document.getElementById('btn-inline-more');

  if (btnFlip) {
    btnFlip.onclick = (e) => {
      e.stopPropagation();
      flipInlineCard();
    };
  }

  if (frontFace) {
    frontFace.onclick = () => {
      flipInlineCard();
    };
  }

  if (btnSpeaker) {
    btnSpeaker.onclick = (e) => {
      e.stopPropagation();
      speakInlineCard();
    };
  }

  if (btnMore) {
    btnMore.onclick = () => {
      notifyStudyActivity();
      initInlineStudy(app);
    };
  }

  // 4 Nút Tự Chấm FSRS
  const rateBtns = [
    { id: 'btn-rate-again', rating: Rating.Again },
    { id: 'btn-rate-hard', rating: Rating.Hard },
    { id: 'btn-rate-good', rating: Rating.Good },
    { id: 'btn-rate-easy', rating: Rating.Easy }
  ];

  rateBtns.forEach(({ id, rating }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        rateInlineCard(rating);
      };
    }
  });

  // Gán phím tắt nhanh kích thích học liền mạch (Space, 1, 2, 3, 4, R)
  if (!_inlineStudyState.isKeyboardListening) {
    _inlineStudyState.isKeyboardListening = true;
    window.addEventListener('keydown', (e) => {
      const tabReview = document.getElementById('tab-review');
      if (!tabReview || !tabReview.classList.contains('active')) return;
      if (document.querySelector('.modal-overlay[style*="display: flex"], .modal-overlay[style*="display: block"], .modal-container.active, .modal.active')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (!_inlineStudyState.currentCard) return;

      if (!_inlineStudyState.isFlipped) {
        if (e.code === 'Space' || e.code === 'Enter' || e.key === 'ArrowDown') {
          e.preventDefault();
          flipInlineCard();
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          speakInlineCard();
        }
      } else {
        if (e.key === '1') {
          e.preventDefault();
          rateInlineCard(Rating.Again);
        } else if (e.key === '2') {
          e.preventDefault();
          rateInlineCard(Rating.Hard);
        } else if (e.key === '3' || e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          rateInlineCard(Rating.Good);
        } else if (e.key === '4') {
          e.preventDefault();
          rateInlineCard(Rating.Easy);
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          speakInlineCard();
        }
      }
    });
  }
}

/**
 * Hiển thị thẻ từ vựng kế tiếp trong luồng học liên tục (Không giới hạn phiên)
 */
function showNextInlineCard() {
  const frontFace = document.getElementById('inline-face-front');
  const backFace = document.getElementById('inline-face-back');
  const emptyState = document.getElementById('inline-card-empty');
  const queuePill = document.getElementById('inline-queue-pill');

  if (_inlineStudyState.currentIndex >= _inlineStudyState.queue.length) {
    // Tự động kiểm tra nạp tiếp từ mới hoặc từ cần củng cố (Endless Flow)
    const studyQueue = _cachedApp?.deckManager?.getStudyQueue(null, _cachedApp?.settings);
    const moreDue = Array.isArray(studyQueue?.dueCards) ? studyQueue.dueCards : [];
    const moreNew = Array.isArray(studyQueue?.newCards) ? studyQueue.newCards : [];

    if (moreDue.length > 0 && _inlineStudyState.queue !== moreDue) {
      _inlineStudyState.queue = moreDue;
      _inlineStudyState.currentIndex = 0;
      showNextInlineCard();
      return;
    } else if (moreNew.length > 0 && _inlineStudyState.queue !== moreNew) {
      _inlineStudyState.queue = moreNew;
      _inlineStudyState.currentIndex = 0;
      showNextInlineCard();
      return;
    }

    // Đã dọn sạch toàn bộ từ
    _inlineStudyState.currentCard = null;
    if (frontFace) frontFace.style.display = 'none';
    if (backFace) backFace.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    if (queuePill) queuePill.textContent = '🏆 Đã ôn sạch!';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (frontFace) frontFace.style.display = 'flex';
  if (backFace) backFace.style.display = 'none';

  _inlineStudyState.isFlipped = false;
  _inlineStudyState.startTime = Date.now();

  const card = _inlineStudyState.queue[_inlineStudyState.currentIndex];
  _inlineStudyState.currentCard = card;

  const remaining = _inlineStudyState.queue.length - _inlineStudyState.currentIndex;
  if (queuePill) {
    const state = StorageManager.getCardState(card.id);
    const isDue = state && isCardDue(state, new Date());
    if (isDue) {
      queuePill.textContent = `${remaining} từ đến hạn`;
    } else if (!state || state.state === State.New || state.state === 0) {
      queuePill.textContent = `Từ mới: ${remaining}`;
    } else {
      queuePill.textContent = `Luyện tập: ${remaining}`;
    }
  }

  // Populate Front Data
  const elWord = document.getElementById('inline-word');
  const elIpa = document.getElementById('inline-ipa');
  const elCefr = document.getElementById('inline-cefr');
  const elPos = document.getElementById('inline-pos');

  if (elWord) elWord.textContent = card.word || '';
  if (elIpa) elIpa.textContent = card.phonetic || card.ipa || '';
  if (elCefr) elCefr.textContent = (card.level || card.cefr || 'B1').toUpperCase();
  if (elPos) elPos.textContent = (card.pos || 'word').toLowerCase();

  // Populate Back Data
  const elBackWord = document.getElementById('inline-back-word');
  const elBackIpa = document.getElementById('inline-back-ipa');
  const elMeaning = document.getElementById('inline-meaning');
  const elEn = document.getElementById('inline-example-en');
  const elVi = document.getElementById('inline-example-vi');

  if (elBackWord) elBackWord.textContent = card.word || '';
  if (elBackIpa) elBackIpa.textContent = card.phonetic || card.ipa || '';
  if (elMeaning) elMeaning.textContent = card.meaning || '';

  const exampleEn = card.example || (Array.isArray(card.examples) && card.examples[0]?.en) || `Practice using "${card.word}" every day.`;
  const exampleVi = card.example_trans || card.example_vi || (Array.isArray(card.examples) && card.examples[0]?.vi) || '';

  if (elEn) elEn.textContent = `"${exampleEn}"`;
  if (elVi) {
    if (exampleVi) {
      elVi.textContent = `"${exampleVi}"`;
      elVi.style.display = 'block';
    } else {
      elVi.textContent = '';
      elVi.style.display = 'none';
    }
  }

  // Tính toán dynamic preview intervals cho 4 nút FSRS (Định dạng tiếng Việt rõ ràng)
  if (_inlineStudyState.fsrs) {
    let cardState = StorageManager.getCardState(card.id);
    if (!cardState) cardState = FSRS.createEmptyCard(card.id);
    const previews = _inlineStudyState.fsrs.preview(cardState, new Date());

    const intAgain = document.getElementById('rate-int-again');
    const intHard = document.getElementById('rate-int-hard');
    const intGood = document.getElementById('rate-int-good');
    const intEasy = document.getElementById('rate-int-easy');

    if (intAgain) intAgain.textContent = formatViIntervalText(previews[Rating.Again]?.intervalText) || '< 10p';
    if (intHard) intHard.textContent = formatViIntervalText(previews[Rating.Hard]?.intervalText) || '1 ngày';
    if (intGood) intGood.textContent = formatViIntervalText(previews[Rating.Good]?.intervalText) || '3 ngày';
    if (intEasy) intEasy.textContent = formatViIntervalText(previews[Rating.Easy]?.intervalText) || '4 ngày';
  }
}

/**
 * Định dạng khoảng thời gian FSRS sang tiếng Việt thân thiện
 */
function formatViIntervalText(rawText) {
  if (!rawText) return '';
  const s = String(rawText).trim();
  if (s.endsWith('mo')) {
    return `${s.replace('mo', '')} tháng`;
  }
  if (s.endsWith('d')) {
    return `${s.replace('d', '')} ngày`;
  }
  if (s.endsWith('m')) {
    return `${s.replace('m', '')} phút`;
  }
  if (s.endsWith('y')) {
    return `${s.replace('y', '')} năm`;
  }
  return s;
}

/**
 * Lật thẻ xem đáp án & mở 4 nút tự chấm
 */
function flipInlineCard() {
  notifyStudyActivity();
  if (!_inlineStudyState.currentCard) return;

  const frontFace = document.getElementById('inline-face-front');
  const backFace = document.getElementById('inline-face-back');

  if (frontFace && backFace) {
    frontFace.style.display = 'none';
    backFace.style.display = 'flex';
    _inlineStudyState.isFlipped = true;
  }
}

/**
 * Tự chấm thẻ theo thuật toán FSRS-6 và chuyển ngay sang từ kế tiếp
 */
function rateInlineCard(rating) {
  notifyStudyActivity();
  if (!_inlineStudyState.currentCard || !_inlineStudyState.fsrs) return;

  const card = _inlineStudyState.currentCard;
  const now = new Date();
  let oldState = StorageManager.getCardState(card.id);
  if (!oldState) oldState = FSRS.createEmptyCard(card.id);

  const nextState = _inlineStudyState.fsrs.calculateNextState(oldState, rating, now, {
    enableFuzz: _cachedApp?.settings?.enableFuzz !== false,
    leechThreshold: _cachedApp?.settings?.leechThreshold || 6,
    leechAction: _cachedApp?.settings?.leechAction || 'tag'
  });

  const latencySec = (Date.now() - _inlineStudyState.startTime) / 1000;

  // Lưu trạng thái FSRS & ghi nhật ký
  StorageManager.saveCardState(nextState);
  StorageManager.logReview({
    cardId: card.id,
    word: card.word,
    rating: rating,
    oldState: oldState.state,
    newState: nextState.state,
    scheduledDays: nextState.scheduled_days,
    stability: nextState.stability,
    difficulty: nextState.difficulty,
    latencySec: latencySec
  });

  // Kích hoạt vi hiệu ứng Dopamine Pulse lên tile tiến độ
  const boxNew = document.getElementById('box-home-new');
  if (boxNew) {
    boxNew.classList.remove('pulse-dopamine');
    void boxNew.offsetWidth;
    boxNew.classList.add('pulse-dopamine');
  }

  // Hiệu ứng chuyển thẻ mượt mà 120ms
  const viewport = document.getElementById('inline-card-viewport');
  if (viewport) {
    viewport.classList.add('card-fade-out');
    setTimeout(() => {
      viewport.classList.remove('card-fade-out');
      _inlineStudyState.currentIndex++;
      showNextInlineCard();
      updateHomeStatsRealtime(_cachedApp);
    }, 120);
  } else {
    _inlineStudyState.currentIndex++;
    showNextInlineCard();
    updateHomeStatsRealtime(_cachedApp);
  }
}

/**
 * Phát âm từ vựng của thẻ đang hiển thị
 */
function speakInlineCard() {
  notifyStudyActivity();
  if (_inlineStudyState.currentCard && _inlineStudyState.currentCard.word) {
    speak(_inlineStudyState.currentCard.word, { cardObj: _inlineStudyState.currentCard });
  }
}

/**
 * Lazy Hands-free Audio Walk Implementation
 */
function startLazyAudioWalk(cards = [], app = null) {
  _lazyAudioState.words = cards;
  _lazyAudioState.currentIndex = 0;
  _lazyAudioState.active = true;
  _lazyAudioState.isPlaying = true;
  _lazyAudioState.speed = Number(app?.settings?.speechRate) || 1.0;

  const modal = document.getElementById('lazy-audio-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  setupLazyModalEvents(app);
  playLazyWordStep();
}

function setupLazyModalEvents(app) {
  const btnClose = document.getElementById('btn-lazy-close');
  if (btnClose) {
    btnClose.onclick = () => stopLazyAudioWalk();
  }

  const btnPlay = document.getElementById('btn-lazy-play-toggle');
  if (btnPlay) {
    btnPlay.onclick = () => {
      if (_lazyAudioState.isPlaying) {
        _lazyAudioState.isPlaying = false;
        btnPlay.textContent = '▶️';
        if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
        stopAudio();
      } else {
        _lazyAudioState.isPlaying = true;
        btnPlay.textContent = '⏸️';
        playLazyWordStep();
      }
    };
  }

  const btnNext = document.getElementById('btn-lazy-next');
  if (btnNext) {
    btnNext.onclick = () => {
      if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
      stopAudio();
      _lazyAudioState.currentIndex = (_lazyAudioState.currentIndex + 1) % _lazyAudioState.words.length;
      playLazyWordStep();
    };
  }

  const btnPrev = document.getElementById('btn-lazy-prev');
  if (btnPrev) {
    btnPrev.onclick = () => {
      if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
      stopAudio();
      _lazyAudioState.currentIndex = (_lazyAudioState.currentIndex - 1 + _lazyAudioState.words.length) % _lazyAudioState.words.length;
      playLazyWordStep();
    };
  }

  const btnSpeed = document.getElementById('btn-lazy-speed');
  if (btnSpeed) {
    btnSpeed.onclick = () => {
      if (_lazyAudioState.speed === 1.0) _lazyAudioState.speed = 0.8;
      else if (_lazyAudioState.speed === 0.8) _lazyAudioState.speed = 1.2;
      else _lazyAudioState.speed = 1.0;
      btnSpeed.textContent = `${_lazyAudioState.speed}x`;
    };
  }

  const btnLoop = document.getElementById('btn-lazy-loop');
  if (btnLoop) {
    btnLoop.onclick = () => {
      _lazyAudioState.isLoop = !_lazyAudioState.isLoop;
      if (_lazyAudioState.isLoop) {
        btnLoop.classList.add('active');
      } else {
        btnLoop.classList.remove('active');
      }
    };
  }
}

function playLazyWordStep() {
  if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;

  const wordObj = _lazyAudioState.words[_lazyAudioState.currentIndex];
  if (!wordObj) {
    stopLazyAudioWalk();
    return;
  }

  const elCounter = document.getElementById('lazy-word-counter');
  if (elCounter) elCounter.textContent = `Từ ${_lazyAudioState.currentIndex + 1} / ${_lazyAudioState.words.length}`;

  const elWord = document.getElementById('lazy-word-text');
  if (elWord) elWord.textContent = wordObj.word || '';

  const elPhonetic = document.getElementById('lazy-word-phonetic');
  if (elPhonetic) elPhonetic.textContent = wordObj.phonetic || '';

  const elMeaning = document.getElementById('lazy-word-meaning');
  if (elMeaning) elMeaning.textContent = wordObj.meaning || '';

  const elCefr = document.getElementById('lazy-badge-cefr');
  if (elCefr) elCefr.textContent = (wordObj.level || 'A1').toUpperCase();

  const elCat = document.getElementById('lazy-badge-cat');
  if (elCat) elCat.textContent = wordObj.category || 'Từ vựng';

  const btnPlay = document.getElementById('btn-lazy-play-toggle');
  if (btnPlay) btnPlay.textContent = '⏸️';

  speak(wordObj.word, {
    speechRate: _lazyAudioState.speed,
    cardObj: wordObj,
    onEnd: () => {
      if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
      _lazyAudioState.timerId = setTimeout(() => {
        if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
        speakVi(wordObj.meaning, () => {
          if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
          _lazyAudioState.timerId = setTimeout(() => {
            if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
            if (_lazyAudioState.currentIndex + 1 < _lazyAudioState.words.length) {
              _lazyAudioState.currentIndex++;
              playLazyWordStep();
            } else if (_lazyAudioState.isLoop) {
              _lazyAudioState.currentIndex = 0;
              playLazyWordStep();
            } else {
              showToast('Đã nghe hết danh sách từ vựng 🎉', 'success');
              stopLazyAudioWalk();
            }
          }, 1200);
        });
      }, 700);
    }
  });
}

function stopLazyAudioWalk() {
  _lazyAudioState.active = false;
  _lazyAudioState.isPlaying = false;
  if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
  stopAudio();

  const modal = document.getElementById('lazy-audio-modal');
  if (modal) modal.style.display = 'none';
}

