import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { StatsManager } from '../core/stats.js';
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

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-col-left') || !container.querySelector('#review-goals-card')) {
    container.innerHTML = `
      <div class="review-bento-container">

        <!-- LEFT COLUMN (Command Center & Spotlight Word) -->
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

          <!-- 2. Daily Spotlight Word Capsule (Từ Vựng Vàng Tiêu Điểm Trong Ngày) -->
          <div class="review-spotlight-card" id="review-spotlight-card">
            <div class="spotlight-card-header">
              <div class="spotlight-header-left">
                <div class="spotlight-icon-badge">🌟</div>
                <div class="spotlight-title-wrap">
                  <span class="spotlight-tag">TỪ VỰNG TIÊU ĐIỂM HÔM NAY</span>
                  <h3 class="spotlight-main-title">Mỗi ngày 1 từ tinh hoa</h3>
                </div>
              </div>
              <div class="spotlight-badges-wrap">
                <span class="spotlight-badge-cefr" id="spotlight-cefr">B1</span>
                <span class="spotlight-badge-cat" id="spotlight-category">Giao tiếp</span>
              </div>
            </div>

            <div class="spotlight-body">
              <div class="spotlight-word-row">
                <div class="spotlight-word-left">
                  <h4 class="spotlight-word-text" id="spotlight-word">Opportunity</h4>
                  <div class="spotlight-ipa-row">
                    <span class="spotlight-pos" id="spotlight-pos">noun</span>
                    <span class="spotlight-ipa" id="spotlight-ipa">/ˌɑː.pɚˈtuː.nə.t̬i/</span>
                  </div>
                </div>
                <button type="button" class="btn-spotlight-speaker" id="btn-spotlight-speaker" title="Phát âm từ vựng">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
              </div>

              <p class="spotlight-meaning" id="spotlight-meaning">Cơ hội, thời cơ thuận lợi</p>

              <div class="spotlight-example-box" id="spotlight-example-box">
                <p class="spotlight-example-en" id="spotlight-example-en">"This is a great opportunity to improve your skills."</p>
                <p class="spotlight-example-vi" id="spotlight-example-vi">"Đây là một cơ hội tuyệt vời để nâng cao kỹ năng của bạn."</p>
              </div>

              <div class="spotlight-actions-row">
                <button type="button" class="btn-spotlight-action btn-spotlight-study" id="btn-spotlight-study">
                  <span>🎴 Học thẻ này</span>
                </button>
                <button type="button" class="btn-spotlight-action btn-spotlight-quiz" id="btn-spotlight-quiz">
                  <span>⚡ Thử thách Quiz</span>
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

    const allCards = app.deckManager.getAllCards();
    const now = new Date();

    // 1. Phân loại từ vựng & Cấp độ thành tựu FSRS
    let learnedCount = 0;
    let masteredCount = 0; // Tầng 4 & 5 (Stability >= 14 ngày) VÀ CHƯA ĐẾN HẠN ÔN (!isDue)
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

    // Cập nhật Timer & Từ Đã Thuộc
    const elTimer = document.getElementById('home-study-timer');
    if (elTimer) {
      const todaySecs = StorageManager.getTodayStudySeconds();
      if (todaySecs < 60) {
        elTimer.textContent = todaySecs > 0 ? `${todaySecs}s` : `0p`;
      } else {
        elTimer.textContent = `${Math.round(todaySecs / 60)}p`;
      }
    }

    const elRetention = document.getElementById('home-retention-rate');
    if (elRetention) {
      elRetention.textContent = masteredCount;
    }

    const elRetentionHint = document.getElementById('home-retention-hint');
    if (elRetentionHint) {
      if (masteredCount > 0) {
        elRetentionHint.textContent = 'Ghi nhớ bền vững 🛡️';
      } else {
        elRetentionHint.textContent = 'Độ bền ≥ 14 ngày';
      }
    }

    // 2. Mục tiêu hôm nay & Nhật ký học
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

    // A. Trạng thái hôm nay
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

    // B. Chuỗi ngày học & Khung giờ vàng nhận thức
    const streak = StatsManager.calculateStreak(allLogs);
    const primeHour = StatsManager.getPrimeStudyHour(allLogs);

    const elHeaderStreak = document.getElementById('home-header-streak');
    if (elHeaderStreak) {
      elHeaderStreak.textContent = `🔥 ${streak} ngày`;
    }

    const elGoalPct = document.getElementById('home-goal-pct');
    if (elGoalPct) {
      elGoalPct.textContent = `${goalPct}%`;
    }

    const elGoalFill = document.getElementById('home-goal-progress-fill');
    if (elGoalFill) {
      elGoalFill.style.width = `${goalPct}%`;
    }

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

    // C. Từ cần ôn ngay & Đã học hôm nay
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
      if (todayNewLearned >= dailyGoal) {
        elGoalHint.textContent = `Đạt chỉ tiêu ngày ✓`;
      } else {
        elGoalHint.textContent = `Còn ${remainingGoal} từ nữa`;
      }
    }

    // D. Render Goal & Progress Tracker (Radial Rings & Multi-Tier Goals)
    // 1. Ngày (Hôm nay)
    const dayPct = Math.min(100, Math.round((todayNewLearned / dailyGoal) * 100));

    // 2. Tuần (7 ngày gần nhất)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekLogs = allLogs.filter(l => l.timestamp && new Date(l.timestamp) >= weekStart);
    const weekNewLearned = weekLogs.filter(l => 
      l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
    ).length;
    const weekGoal = dailyGoal * 7;
    const weekPct = Math.min(100, Math.round((weekNewLearned / weekGoal) * 100));

    // 3. Chu kỳ 30 ngày (Rolling 30 days)
    const month30Start = new Date(now);
    month30Start.setDate(month30Start.getDate() - 29);
    month30Start.setHours(0, 0, 0, 0);
    const month30Logs = allLogs.filter(l => l.timestamp && new Date(l.timestamp) >= month30Start);
    const month30NewLearned = month30Logs.filter(l => 
      l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
    ).length;
    const month30Goal = dailyGoal * 30;
    const month30Pct = Math.min(100, Math.round((month30NewLearned / month30Goal) * 100));

    // 4. Mục tiêu Chặng (Sub-goal) & Kho Tổng (Master-goal)
    const roadmap = StatsManager.getMilestoneRoadmap(learnedCount, dailyGoal);
    const activeStage = roadmap.activeStage;
    const stageTargetWords = activeStage.targetWords;
    const stageLearnedWords = Math.min(stageTargetWords, learnedCount);
    const stageWordsLeft = Math.max(0, stageTargetWords - stageLearnedWords);
    const stageDaysEstimate = Math.max(1, Math.ceil(stageWordsLeft / dailyGoal));

    const totalLibraryWords = (allCards && allCards.length) ? allCards.length : (app.deckManager?.getAllCards?.().length || 3523);
    const libraryMasteredPct = Math.min(100, Math.round((masteredCount / totalLibraryWords) * 100));

    // Update Header
    const elGoalsTitle = document.getElementById('goals-main-title');
    if (elGoalsTitle) {
      elGoalsTitle.textContent = `${activeStage.title} (${activeStage.targetWords} từ)`;
    }

    const elGoalsCountdown = document.getElementById('goals-countdown-badge');
    if (elGoalsCountdown) {
      elGoalsCountdown.textContent = stageWordsLeft > 0 ? `⏳ Còn ${stageDaysEstimate} ngày` : '🏆 Hoàn thành';
    }

    const elGoalsMilestone = document.getElementById('goals-milestone-badge');
    if (elGoalsMilestone) {
      elGoalsMilestone.textContent = `${activeStage.progressPct}%`;
    }

    const elGoalsTotalTrack = document.getElementById('goals-total-track-fill');
    if (elGoalsTotalTrack) {
      elGoalsTotalTrack.style.width = `${activeStage.progressPct}%`;
    }

    // Update SVG Rings
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

    // Update Sub-goal & Master-goal Tiles
    const elSprintNum = document.getElementById('goal-sprint-num');
    if (elSprintNum) elSprintNum.textContent = `${stageLearnedWords}/${stageTargetWords}`;

    const elSprintSub = document.getElementById('goal-sprint-sub');
    if (elSprintSub) {
      elSprintSub.textContent = stageWordsLeft > 0 ? `Chặng ${activeStage.id} • Còn ${stageWordsLeft} từ` : `Chặng ${activeStage.id} • Đã hoàn thành 🏆`;
    }

    const elMasterNum = document.getElementById('goal-master-num');
    if (elMasterNum) elMasterNum.textContent = `${learnedCount}/${totalLibraryWords}`;

    const elMasterSub = document.getElementById('goal-master-sub');
    if (elMasterSub) {
      elMasterSub.textContent = `Đã thuộc ${masteredCount} từ (${libraryMasteredPct}%) 🛡️`;
    }

    // Update Motivation Action Strip
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
          renderReviewTab(app);
        });
      };
    }

    // E. Render Từ Vựng Vàng Tiêu Điểm Hôm Nay (Daily Spotlight Word)
    const spotlightCard = getDailySpotlightCard(allCards);
    if (spotlightCard) {
      const elSpotWord = document.getElementById('spotlight-word');
      const elSpotIpa = document.getElementById('spotlight-ipa');
      const elSpotPos = document.getElementById('spotlight-pos');
      const elSpotCefr = document.getElementById('spotlight-cefr');
      const elSpotCat = document.getElementById('spotlight-category');
      const elSpotMeaning = document.getElementById('spotlight-meaning');
      const elSpotEn = document.getElementById('spotlight-example-en');
      const elSpotVi = document.getElementById('spotlight-example-vi');
      const btnSpotSpeaker = document.getElementById('btn-spotlight-speaker');
      const btnSpotStudy = document.getElementById('btn-spotlight-study');
      const btnSpotQuiz = document.getElementById('btn-spotlight-quiz');

      if (elSpotWord) elSpotWord.textContent = spotlightCard.word || '';
      if (elSpotIpa) elSpotIpa.textContent = spotlightCard.phonetic || spotlightCard.ipa || '';
      if (elSpotPos) elSpotPos.textContent = (spotlightCard.pos || 'word').toLowerCase();
      if (elSpotCefr) elSpotCefr.textContent = (spotlightCard.level || spotlightCard.cefr || 'B1').toUpperCase();
      if (elSpotCat) elSpotCat.textContent = spotlightCard.category || 'Giao tiếp';
      if (elSpotMeaning) elSpotMeaning.textContent = spotlightCard.meaning || '';

      const exampleEn = spotlightCard.example || (spotlightCard.examples && spotlightCard.examples[0]?.en) || `Practice using "${spotlightCard.word}" daily.`;
      const exampleVi = spotlightCard.example_trans || (spotlightCard.examples && spotlightCard.examples[0]?.vi) || `Thực hành sử dụng từ vựng mỗi ngày.`;

      if (elSpotEn) elSpotEn.textContent = `"${exampleEn}"`;
      if (elSpotVi) elSpotVi.textContent = `"${exampleVi}"`;

      if (btnSpotSpeaker) {
        btnSpotSpeaker.onclick = (e) => {
          e.stopPropagation();
          speak(spotlightCard.word, { cardObj: spotlightCard });
        };
      }

      if (btnSpotStudy) {
        btnSpotStudy.onclick = () => {
          try {
            app.startStudySession(null, null, [spotlightCard]);
          } catch (err) {
            console.error('Lỗi học thẻ tiêu điểm:', err);
          }
        };
      }

      if (btnSpotQuiz) {
        btnSpotQuiz.onclick = () => {
          try {
            app.startQuizSession([spotlightCard]);
          } catch (err) {
            console.error('Lỗi trắc nghiệm thẻ tiêu điểm:', err);
          }
        };
      }
    }

    // F. Bệnh Án Từ Vựng & Hệ Miễn Dịch (Weak Word Drill / Immunity Status)
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
              console.error('Lỗi phiên củng cố thẻ Flashcard:', err);
              showToast('Lỗi: ' + err.message, 'error');
            }
          };
        }

        if (btnWeakQuiz) {
          btnWeakQuiz.onclick = () => {
            try {
              app.startQuizSession(weakWords);
            } catch (err) {
              console.error('Lỗi phiên củng cố trắc nghiệm:', err);
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

    // G. CTA Nổi Bật: Twin Buttons (Luôn hiển thị đầy đủ cả 2 chế độ 3D & Trắc nghiệm)
    const btnHeroCta = document.getElementById('btn-home-hero-cta');
    const elCtaText = document.getElementById('home-hero-cta-text');
    const btnQuizCta = document.getElementById('btn-home-quiz-cta');
    const elQuizText = document.getElementById('home-quiz-cta-text');
    const elEstTime = document.getElementById('home-estimated-time');

    if (btnHeroCta && btnQuizCta) {
      if (queueDue > 0) {
        // TRƯỜNG HỢP 1: Có từ cần ôn tập đến hạn
        if (elCtaText) elCtaText.textContent = `Ôn ${queueDue} từ (Thẻ 3D)`;
        if (elQuizText) elQuizText.textContent = `Trắc nghiệm (${queueDue} từ)`;

        const estMin = Math.max(1, Math.ceil(queueDue * 0.5));
        if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút ôn tập`;

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession(null, null, null, { mode: 'due_only' });
          } catch (err) {
            console.error('Lỗi phiên ôn tập thẻ 3D:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };

        btnQuizCta.onclick = () => {
          try {
            app.startQuizSession(studyQueue.dueCards, { mode: 'due_only' });
          } catch (err) {
            console.error('Lỗi phiên trắc nghiệm:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      } else if (todayNewLearned < dailyGoal) {
        // TRƯỜNG HỢP 2: Đã sạch từ ôn, nạp từ mới để đạt chỉ tiêu
        const newBatchCount = Math.min(remainingGoal, queueNew > 0 ? queueNew : remainingGoal);
        if (elCtaText) elCtaText.textContent = `Học ${newBatchCount} từ mới (Thẻ 3D)`;
        if (elQuizText) elQuizText.textContent = `Trắc nghiệm (${newBatchCount} từ mới)`;

        const estMin = Math.max(1, Math.ceil(newBatchCount * 0.6));
        if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút nạp từ mới`;

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession(null, null, null, { mode: 'new_only' });
          } catch (err) {
            console.error('Lỗi phiên học từ mới thẻ 3D:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };

        btnQuizCta.onclick = () => {
          try {
            app.startQuizSession(studyQueue.newCards, { mode: 'new_only' });
          } catch (err) {
            console.error('Lỗi phiên trắc nghiệm từ mới:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      } else {
        // TRƯỜNG HỢP 3: Đã đạt chỉ tiêu ngày, luyện tập thêm
        if (elCtaText) elCtaText.textContent = `Luyện tập thêm (Thẻ 3D)`;
        if (elQuizText) elQuizText.textContent = `Trắc nghiệm phản xạ`;

        if (elEstTime) elEstTime.textContent = `🎉 Đã hoàn thành chỉ tiêu ngày! Sẵn sàng luyện thêm`;

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession();
          } catch (err) {
            console.error('Lỗi phiên học thẻ 3D:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };

        btnQuizCta.onclick = () => {
          try {
            app.startQuizSession();
          } catch (err) {
            console.error('Lỗi phiên trắc nghiệm:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      }
    }

    // H. Lazy Audio Walk Trigger & Controller
    const btnTriggerLazy = document.getElementById('btn-trigger-lazy-walk');
    if (btnTriggerLazy) {
      btnTriggerLazy.onclick = () => {
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

  // Update UI
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

  // Step 1: Speak English
  speak(wordObj.word, {
    speechRate: _lazyAudioState.speed,
    cardObj: wordObj,
    onEnd: () => {
      if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
      // Delay 700ms then speak Vietnamese translation
      _lazyAudioState.timerId = setTimeout(() => {
        if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
        speakVi(wordObj.meaning, () => {
          if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
          // Delay 1200ms then advance to next word
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

/**
 * Chọn 1 từ vựng tiêu điểm theo ngày (Daily Spotlight Word)
 */
function getDailySpotlightCard(allCards = []) {
  if (!allCards || allCards.length === 0) return null;
  const todayKey = getLocalDateKey();
  
  // Tính hash đơn giản từ date string (vd '2026-09-25') để giữ nguyên từ trong suốt cả ngày
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = ((hash << 5) - hash) + todayKey.charCodeAt(i);
    hash |= 0;
  }
  const positiveIndex = Math.abs(hash) % allCards.length;
  return allCards[positiveIndex] || allCards[0];
}
