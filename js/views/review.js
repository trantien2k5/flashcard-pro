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
  isInitialized: false,
  isKeyboardListening: false,
  audioMode: 'auto', // 'auto' | 'continuous' | 'mute'
  isSlowSpeed: false, // true = 0.5x, false = 1.0x
  loopTimerId: null,
  isFlipLocked: false,
  flipLockTimer: null,
  backFlippedTime: 0
};

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('#review-hero-card') || !container.querySelector('#review-goals-card') || !container.querySelector('#review-inline-study-card')) {
    container.innerHTML = `
      <div class="review-bento-container">

        <!-- ==========================================
             BLOCK 1 (Top-Left): ÔN TẬP NHANH (Flashcard Học Nhanh Trực Quan)
             ========================================== -->
        <div class="review-hero-card review-inline-card" id="review-inline-study-card">
          <div class="inline-card-topbar">
            <div class="inline-topbar-left">
              <span class="inline-flash-badge">⚡ ÔN TẬP NHANH</span>
            </div>
            <div class="inline-topbar-actions">
              <button type="button" class="btn-inline-speaker mode-auto" id="btn-inline-speaker" title="Âm thanh tự động (Click: Đổi chế độ / Giữ: 0.5x)">
                <span class="speaker-icon" id="inline-speaker-icon">🔊</span>
              </button>
              <button type="button" class="btn-inline-gear" id="btn-inline-prefs" title="Cài đặt hiển thị các trường dữ liệu">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Glassmorphic Prefs Dropdown Popover -->
          <div class="inline-prefs-popover" id="inline-prefs-popover" style="display: none;">
            <div class="prefs-popover-header">
              <span class="prefs-popover-title">⚙️ Hiển thị trường dữ liệu</span>
              <button type="button" class="btn-popover-close" id="btn-inline-prefs-close" title="Đóng">✕</button>
            </div>
            <div class="prefs-popover-list">
              <label class="prefs-popover-item">
                <span class="prefs-popover-label">🔊 Phiên âm IPA</span>
                <input type="checkbox" id="toggle-inline-ipa" class="toggle-checkbox" checked>
              </label>
              <label class="prefs-popover-item">
                <span class="prefs-popover-label">🏷️ Cấp độ CEFR (A1-C2)</span>
                <input type="checkbox" id="toggle-inline-cefr" class="toggle-checkbox" checked>
              </label>
              <label class="prefs-popover-item">
                <span class="prefs-popover-label">📝 Loại từ (POS)</span>
                <input type="checkbox" id="toggle-inline-pos" class="toggle-checkbox" checked>
              </label>
              <label class="prefs-popover-item">
                <span class="prefs-popover-label">💬 Câu ví dụ tiếng Anh</span>
                <input type="checkbox" id="toggle-inline-example-en" class="toggle-checkbox" checked>
              </label>
              <label class="prefs-popover-item">
                <span class="prefs-popover-label"><svg class="flag-icon-vn" width="18" height="12" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><polygon points="15,4 16.545,8.755 21.548,8.755 17.501,11.695 19.046,16.45 15,13.51 10.954,16.45 12.499,11.695 8.452,8.755 13.455,8.755" fill="#FFFF00"/></svg> Dịch câu ví dụ</span>
                <input type="checkbox" id="toggle-inline-example-vi" class="toggle-checkbox" checked>
              </label>
            </div>
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

        <!-- ==========================================
             BLOCK 2 (Top-Right): NHIỆM VỤ HÔM NAY (Thống Kê Nhiệm Vụ)
             ========================================== -->
        <div class="review-hero-card" id="review-hero-card">
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

            <!-- Card 2: Đã học hôm nay (Học từ mới + Ôn tập) -->
            <div class="quad-tile tile-new" id="box-home-new">
              <div class="quad-tile-top">
                <span class="quad-icon-badge">✨</span>
                <span class="quad-label">ĐÃ HỌC HÔM NAY</span>
              </div>
              <div class="quad-num-wrap">
                <span class="quad-number" id="home-new-today-val">0</span>
                <span class="quad-unit">từ</span>
              </div>
              <span class="quad-sub-hint" id="home-goal-hint">Chỉ tiêu: 10 từ mới</span>
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

          <!-- Roadmaps Mini Metric Row (Tiến độ 7 ngày & 30 ngày) -->
          <div class="hero-mini-roadmap-strip" id="home-mini-roadmap-strip">
            <div class="mini-roadmap-pill">
              <span class="mini-roadmap-icon">🌱</span>
              <span class="mini-roadmap-label">7 ngày:</span>
              <strong class="mini-roadmap-val" id="home-mini-week-val">0/70 từ</strong>
              <span class="mini-roadmap-pct" id="home-mini-week-pct">0%</span>
            </div>
            <div class="mini-roadmap-pill">
              <span class="mini-roadmap-icon">🎯</span>
              <span class="mini-roadmap-label">30 ngày:</span>
              <strong class="mini-roadmap-val" id="home-mini-month-val">0/300 từ</strong>
              <span class="mini-roadmap-pct" id="home-mini-month-pct">0%</span>
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

        <!-- ==========================================
             BLOCK 3 (Bottom-Left): MỤC TIÊU & TIẾN ĐỘ
             ========================================== -->
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
                <span class="goal-ring-title">Từ mới hôm nay</span>
                <span class="goal-ring-detail" id="ring-detail-day">0/10 từ</span>
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
                <span class="goal-ring-title">Từ mới 7 ngày</span>
                <span class="goal-ring-detail" id="ring-detail-week">0/70 từ</span>
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
                <span class="goal-ring-title">Từ mới 30 ngày</span>
                <span class="goal-ring-detail" id="ring-detail-month">0/300 từ</span>
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

        <!-- ==========================================
             BLOCK 4 (Bottom-Right): THÁP 5 CẤP ĐỘ TRÍ NHỚ FSRS-6
             ========================================== -->
        <div class="review-hero-card review-pyramid-home-card" id="review-assist-card">
          <!-- Top Row Header -->
          <div class="review-card-header">
            <div class="review-card-header-left">
              <div class="review-pyramid-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 22h20L12 2z"/>
                  <path d="M12 9l5 10H7l5-10z"/>
                </svg>
              </div>
              <div class="review-hero-titles">
                <div class="review-hero-pill-tag">5 CẤP ĐỘ TRÍ NHỚ</div>
                <h2 class="review-hero-main-title" id="home-pyramid-main-title">Độ bền lưu giữ từ vựng</h2>
              </div>
            </div>

            <div class="review-header-badges-wrap">
              <span class="pill-goals-countdown" id="home-pyramid-accuracy-badge">🧠 Nhớ thật: 0%</span>
              <span class="pill-goals-milestone" id="home-pyramid-total-badge">0 từ</span>
            </div>
          </div>

          <!-- Multi-segment visual progress bar -->
          <div class="home-pyramid-segment-bar" id="home-pyramid-segment-bar">
            <div class="home-seg-fill home-seg-tier5" id="home-seg-tier5" style="width: 0%;" title="Nhớ sâu (≥ 30d)"></div>
            <div class="home-seg-fill home-seg-tier4" id="home-seg-tier4" style="width: 0%;" title="Bền vững (14-30d)"></div>
            <div class="home-seg-fill home-seg-tier3" id="home-seg-tier3" style="width: 0%;" title="Trung hạn (7-14d)"></div>
            <div class="home-seg-fill home-seg-tier2" id="home-seg-tier2" style="width: 0%;" title="Ngắn hạn (3-7d)"></div>
            <div class="home-seg-fill home-seg-tier1" id="home-seg-tier1" style="width: 0%;" title="Mới nạp (< 3d)"></div>
          </div>

          <!-- 5 Tiers Mini List -->
          <div class="home-pyramid-tiers-list">
            <!-- Tier 5 -->
            <div class="home-tier-row tier-5">
              <div class="home-tier-left">
                <span class="home-tier-icon">💎</span>
                <div class="home-tier-meta">
                  <strong class="home-tier-name">Mức 5: Nhớ sâu vĩnh viễn</strong>
                  <span class="home-tier-desc">Độ bền ≥ 30 ngày • Ôn 1 - 6 tháng</span>
                </div>
              </div>
              <div class="home-tier-right">
                <strong class="home-tier-count" id="home-tier-cnt-5">0 từ</strong>
                <span class="home-tier-pct" id="home-tier-pct-5">0%</span>
              </div>
            </div>

            <!-- Tier 4 -->
            <div class="home-tier-row tier-4">
              <div class="home-tier-left">
                <span class="home-tier-icon">🛡️</span>
                <div class="home-tier-meta">
                  <strong class="home-tier-name">Mức 4: Ghi nhớ bền vững</strong>
                  <span class="home-tier-desc">Độ bền 14 - 30 ngày • Ôn 2 - 4 tuần</span>
                </div>
              </div>
              <div class="home-tier-right">
                <strong class="home-tier-count" id="home-tier-cnt-4">0 từ</strong>
                <span class="home-tier-pct" id="home-tier-pct-4">0%</span>
              </div>
            </div>

            <!-- Tier 3 -->
            <div class="home-tier-row tier-3">
              <div class="home-tier-left">
                <span class="home-tier-icon">🌳</span>
                <div class="home-tier-meta">
                  <strong class="home-tier-name">Mức 3: Ghi nhớ trung hạn</strong>
                  <span class="home-tier-desc">Độ bền 7 - 14 ngày • Ôn 1 - 2 tuần</span>
                </div>
              </div>
              <div class="home-tier-right">
                <strong class="home-tier-count" id="home-tier-cnt-3">0 từ</strong>
                <span class="home-tier-pct" id="home-tier-pct-3">0%</span>
              </div>
            </div>

            <!-- Tier 2 -->
            <div class="home-tier-row tier-2">
              <div class="home-tier-left">
                <span class="home-tier-icon">🌿</span>
                <div class="home-tier-meta">
                  <strong class="home-tier-name">Mức 2: Trí nhớ ngắn hạn</strong>
                  <span class="home-tier-desc">Độ bền 3 - 7 ngày • Ôn 3 - 7 ngày</span>
                </div>
              </div>
              <div class="home-tier-right">
                <strong class="home-tier-count" id="home-tier-cnt-2">0 từ</strong>
                <span class="home-tier-pct" id="home-tier-pct-2">0%</span>
              </div>
            </div>

            <!-- Tier 1 -->
            <div class="home-tier-row tier-1">
              <div class="home-tier-left">
                <span class="home-tier-icon">🌱</span>
                <div class="home-tier-meta">
                  <strong class="home-tier-name">Mức 1: Mới nạp vào não</strong>
                  <span class="home-tier-desc">Độ bền < 3 ngày • Cần củng cố</span>
                </div>
              </div>
              <div class="home-tier-right">
                <strong class="home-tier-count" id="home-tier-cnt-1">0 từ</strong>
                <span class="home-tier-pct" id="home-tier-pct-1">0%</span>
              </div>
            </div>
          </div>

          <!-- Bottom Motive / Stats CTA Strip -->
          <div class="goals-motive-strip home-pyramid-motive-strip">
            <div class="goals-motive-left">
              <span class="goals-motive-icon">✨</span>
              <span class="goals-motive-text" id="home-pyramid-motive-text">0% từ vựng đang ở vùng trí nhớ bền vững</span>
            </div>
            <button type="button" class="btn-goals-adjust" id="btn-home-view-stats" title="Xem phân tích năng lực trí nhớ FSRS chuyên sâu">
              <span>Xem báo cáo 📊</span>
            </button>
          </div>
        </div>

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
 * Ghi nhận người dùng đang chủ động học để duy trì bộ đếm thời gian thực
 */
function notifyStudyActivity() {
  if (globalStudyTimer.isActiveSession) {
    globalStudyTimer.recordActivity();
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

  // Daily Goals, New Words & Active Reviews
  const dailyGoal = Number(app.settings?.dailyNewLimit) || 10;
  const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
  const queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : dueCount;
  const queueNew = studyQueue.totalNew !== undefined ? studyQueue.totalNew : 0;

  const allLogs = StorageManager.getStudyLogs() || [];
  const cardStates = StorageManager.getAllCardStates() || {};
  const todayKey = getLocalDateKey(now);

  // Xây dựng bản đồ thời điểm học đầu tiên của từng từ
  const firstStudyMap = new Map();
  allLogs.forEach(l => {
    const cid = l.cardId || l.word;
    if (!cid || !l.timestamp) return;
    const t = new Date(l.timestamp).getTime();
    if (!firstStudyMap.has(cid) || t < firstStudyMap.get(cid)) {
      firstStudyMap.set(cid, t);
    }
  });

  // Bổ sung cho các thẻ đã học trong cardStates
  for (const [cid, s] of Object.entries(cardStates)) {
    if (s && s.state !== State.New && s.state !== 0 && s.last_review) {
      const t = new Date(s.last_review).getTime();
      if (!firstStudyMap.has(cid)) {
        firstStudyMap.set(cid, t);
      }
    }
  }

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const month30Start = new Date(now);
  month30Start.setDate(month30Start.getDate() - 29);
  month30Start.setHours(0, 0, 0, 0);

  let todayNewLearned = 0;
  let weekNewLearned = 0;
  let month30NewLearned = 0;

  for (const [cid, firstT] of firstStudyMap.entries()) {
    const d = new Date(firstT);
    if (getLocalDateKey(d) === todayKey) {
      todayNewLearned++;
    }
    if (firstT >= weekStart.getTime()) {
      weekNewLearned++;
    }
    if (firstT >= month30Start.getTime()) {
      month30NewLearned++;
    }
  }

  // Hoạt động hôm nay (cả từ mới và từ ôn tập)
  const todayLogs = allLogs.filter(l => l.timestamp && getLocalDateKey(l.timestamp) === todayKey);
  const todayUniqueCardIds = new Set(todayLogs.map(l => l.cardId || l.word).filter(Boolean));
  const todayTotalUnique = todayUniqueCardIds.size;
  const todayReviews = Math.max(0, todayTotalUnique - todayNewLearned);

  const remainingGoal = Math.max(0, dailyGoal - todayNewLearned);
  const goalPct = Math.min(100, Math.round((todayNewLearned / dailyGoal) * 100));

  // Today Status Header Text
  const elTodayStatus = document.getElementById('home-today-status');
  if (elTodayStatus) {
    if (queueDue > 0) {
      elTodayStatus.textContent = `Có ${queueDue} từ cần ôn tập hôm nay`;
    } else if (todayNewLearned >= dailyGoal) {
      elTodayStatus.textContent = `Đã nạp đủ ${todayNewLearned}/${dailyGoal} từ mới & hoàn thành xuất sắc hôm nay ✓`;
    } else {
      elTodayStatus.textContent = `Đã sạch hàng đợi ôn tập • Còn ${remainingGoal} từ mới để đạt chỉ tiêu hôm nay`;
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
  if (elNewVal) {
    elNewVal.textContent = todayTotalUnique;
  }

  const elGoalHint = document.getElementById('home-goal-hint');
  if (elGoalHint) {
    if (todayTotalUnique === 0) {
      elGoalHint.textContent = `Chỉ tiêu: ${dailyGoal} từ mới`;
    } else if (todayNewLearned >= dailyGoal) {
      elGoalHint.textContent = `🌱 Đạt ${todayNewLearned}/${dailyGoal} từ mới • 🔄 Ôn ${todayReviews} từ`;
    } else {
      elGoalHint.textContent = `🌱 Nạp ${todayNewLearned}/${dailyGoal} từ mới • 🔄 Ôn ${todayReviews} từ`;
    }
  }

  // 3 Radial Rings (% Tròn Ngày, Tuần, Tháng)
  const dayPct = Math.min(100, Math.round((todayNewLearned / dailyGoal) * 100));

  const weekGoal = dailyGoal * 7;
  const weekPct = Math.min(100, Math.round((weekNewLearned / weekGoal) * 100));

  const month30Goal = dailyGoal * 30;
  const month30Pct = Math.min(100, Math.round((month30NewLearned / month30Goal) * 100));

  // Cập nhật Mini Roadmap Strip (Hiện hữu trên cả Mobile & Desktop)
  const elMiniWeekVal = document.getElementById('home-mini-week-val');
  if (elMiniWeekVal) elMiniWeekVal.textContent = `${weekNewLearned}/${weekGoal} từ`;
  const elMiniWeekPct = document.getElementById('home-mini-week-pct');
  if (elMiniWeekPct) elMiniWeekPct.textContent = `${weekPct}%`;

  const elMiniMonthVal = document.getElementById('home-mini-month-val');
  if (elMiniMonthVal) elMiniMonthVal.textContent = `${month30NewLearned}/${month30Goal} từ`;
  const elMiniMonthPct = document.getElementById('home-mini-month-pct');
  if (elMiniMonthPct) elMiniMonthPct.textContent = `${month30Pct}%`;

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

  // 5 Cấp Độ Trí Nhớ (FSRS Stability Tiers)
  const memIntel = StatsManager.getMemoryIntelligence(allCards);
  const tiers = memIntel.tiers || {};
  const totalLearned = memIntel.totalLearned || 0;

  const elPyrAcc = document.getElementById('home-pyramid-accuracy-badge');
  if (elPyrAcc) elPyrAcc.textContent = `🧠 Nhớ thật: ${memIntel.currentRetrievability || 0}%`;

  const elPyrTot = document.getElementById('home-pyramid-total-badge');
  if (elPyrTot) elPyrTot.textContent = `${totalLearned} từ`;

  const t5 = tiers.tier5?.count || 0;
  const t4 = tiers.tier4?.count || 0;
  const t3 = tiers.tier3?.count || 0;
  const t2 = tiers.tier2?.count || 0;
  const t1 = tiers.tier1?.count || 0;

  const pct = (cnt) => totalLearned > 0 ? Math.round((cnt / totalLearned) * 100) : 0;
  const p5 = pct(t5), p4 = pct(t4), p3 = pct(t3), p2 = pct(t2), p1 = pct(t1);

  const setTier = (tierNum, cnt, p) => {
    const elCnt = document.getElementById(`home-tier-cnt-${tierNum}`);
    const elPct = document.getElementById(`home-tier-pct-${tierNum}`);
    if (elCnt) elCnt.textContent = `${cnt} từ`;
    if (elPct) elPct.textContent = `${p}%`;
  };
  setTier(5, t5, p5);
  setTier(4, t4, p4);
  setTier(3, t3, p3);
  setTier(2, t2, p2);
  setTier(1, t1, p1);

  const seg5 = document.getElementById('home-seg-tier5');
  const seg4 = document.getElementById('home-seg-tier4');
  const seg3 = document.getElementById('home-seg-tier3');
  const seg2 = document.getElementById('home-seg-tier2');
  const seg1 = document.getElementById('home-seg-tier1');
  if (seg5) seg5.style.width = `${p5}%`;
  if (seg4) seg4.style.width = `${p4}%`;
  if (seg3) seg3.style.width = `${p3}%`;
  if (seg2) seg2.style.width = `${p2}%`;
  if (seg1) seg1.style.width = `${p1}%`;

  const solidCount = t5 + t4;
  const solidPct = totalLearned > 0 ? Math.round((solidCount / totalLearned) * 100) : 0;
  const elPyrMotive = document.getElementById('home-pyramid-motive-text');
  if (elPyrMotive) {
    if (totalLearned === 0) {
      elPyrMotive.textContent = 'Bắt đầu học để xây dựng 5 cấp độ trí nhớ FSRS bền vững!';
    } else {
      elPyrMotive.textContent = `${solidPct}% từ vựng (${solidCount}/${totalLearned}) đang ở vùng trí nhớ bền vững (≥ 14 ngày)!`;
    }
  }

  const btnViewStats = document.getElementById('btn-home-view-stats');
  if (btnViewStats && !btnViewStats._bound) {
    btnViewStats._bound = true;
    btnViewStats.onclick = (e) => {
      e.stopPropagation();
      if (app && typeof app.switchTab === 'function') {
        app.switchTab('stats');
      }
    };
  }
}

/**
 * Nạp đệm 5 từ vựng tinh gọn (Ưu tiên từ đến hạn -> từ mới -> từ ngẫu nhiên)
 */
function fetchInlineBatch(app) {
  if (!app || !app.deckManager) return [];
  const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
  const dueCards = Array.isArray(studyQueue?.dueCards) ? [...studyQueue.dueCards] : [];
  const newCards = Array.isArray(studyQueue?.newCards) ? [...studyQueue.newCards] : [];
  const allCards = app.deckManager.getAllCards() || [];

  if (dueCards.length > 0) {
    return dueCards.slice(0, 5);
  }
  if (newCards.length > 0) {
    return newCards.slice(0, 5);
  }
  const shuffled = [...allCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

/**
 * Quản lý cấu hình hiển thị trường dữ liệu trên thẻ Inline Flashcard
 */
const DEFAULT_INLINE_DISPLAY_PREFS = {
  showIpa: true,
  showCefr: true,
  showPos: true,
  showExampleEn: true,
  showExampleVi: true
};

function getInlineDisplayPrefs() {
  try {
    const raw = localStorage.getItem('inline_flashcard_display_prefs');
    if (raw) {
      return { ...DEFAULT_INLINE_DISPLAY_PREFS, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...DEFAULT_INLINE_DISPLAY_PREFS };
}

function saveInlineDisplayPrefs(prefs) {
  try {
    localStorage.setItem('inline_flashcard_display_prefs', JSON.stringify(prefs));
  } catch (e) {}
}

function applyInlineDisplayPrefs() {
  const prefs = getInlineDisplayPrefs();

  // 1. IPA
  const elIpa = document.getElementById('inline-ipa');
  const elBackIpa = document.getElementById('inline-back-ipa');
  if (elIpa) elIpa.style.display = prefs.showIpa ? 'block' : 'none';
  if (elBackIpa) elBackIpa.style.display = prefs.showIpa ? 'inline' : 'none';

  // 2. Badges (CEFR & POS)
  const elCefr = document.getElementById('inline-cefr');
  const elPos = document.getElementById('inline-pos');
  const metaBadges = document.querySelector('.inline-meta-badges');
  if (elCefr) elCefr.style.display = prefs.showCefr ? 'inline-block' : 'none';
  if (elPos) elPos.style.display = prefs.showPos ? 'inline-block' : 'none';
  if (metaBadges) {
    metaBadges.style.display = (!prefs.showCefr && !prefs.showPos) ? 'none' : 'flex';
  }

  // 3. Examples
  const elEn = document.getElementById('inline-example-en');
  const elVi = document.getElementById('inline-example-vi');
  const exampleBox = document.getElementById('inline-example-box');
  if (elEn) elEn.style.display = prefs.showExampleEn ? 'block' : 'none';
  if (elVi) {
    const hasVi = elVi.textContent.trim().length > 0;
    elVi.style.display = (prefs.showExampleVi && hasVi) ? 'block' : 'none';
  }
  if (exampleBox) {
    exampleBox.style.display = (!prefs.showExampleEn && !prefs.showExampleVi) ? 'none' : 'block';
  }

  // Cập nhật trạng thái checkbox trong Popover
  const chkIpa = document.getElementById('toggle-inline-ipa');
  const chkCefr = document.getElementById('toggle-inline-cefr');
  const chkPos = document.getElementById('toggle-inline-pos');
  const chkEn = document.getElementById('toggle-inline-example-en');
  const chkVi = document.getElementById('toggle-inline-example-vi');
  if (chkIpa) chkIpa.checked = !!prefs.showIpa;
  if (chkCefr) chkCefr.checked = !!prefs.showCefr;
  if (chkPos) chkPos.checked = !!prefs.showPos;
  if (chkEn) chkEn.checked = !!prefs.showExampleEn;
  if (chkVi) chkVi.checked = !!prefs.showExampleVi;
}

function setupInlinePrefsEvents() {
  const btnPrefs = document.getElementById('btn-inline-prefs');
  const popover = document.getElementById('inline-prefs-popover');
  const btnClose = document.getElementById('btn-inline-prefs-close');

  if (btnPrefs && popover) {
    btnPrefs.onclick = (e) => {
      e.stopPropagation();
      const isVisible = popover.style.display !== 'none';
      popover.style.display = isVisible ? 'none' : 'flex';
      btnPrefs.classList.toggle('active', !isVisible);
    };
  }

  if (btnClose && popover) {
    btnClose.onclick = (e) => {
      e.stopPropagation();
      popover.style.display = 'none';
      btnPrefs?.classList.remove('active');
    };
  }

  document.addEventListener('click', (e) => {
    if (popover && popover.style.display !== 'none') {
      if (!popover.contains(e.target) && e.target !== btnPrefs && !btnPrefs?.contains(e.target)) {
        popover.style.display = 'none';
        btnPrefs?.classList.remove('active');
      }
    }
  });

  const toggles = [
    { id: 'toggle-inline-ipa', key: 'showIpa' },
    { id: 'toggle-inline-cefr', key: 'showCefr' },
    { id: 'toggle-inline-pos', key: 'showPos' },
    { id: 'toggle-inline-example-en', key: 'showExampleEn' },
    { id: 'toggle-inline-example-vi', key: 'showExampleVi' }
  ];

  toggles.forEach(({ id, key }) => {
    const chk = document.getElementById(id);
    if (chk) {
      chk.onchange = () => {
        const prefs = getInlineDisplayPrefs();
        prefs[key] = chk.checked;
        saveInlineDisplayPrefs(prefs);
        applyInlineDisplayPrefs();
      };
    }
  });
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

  _inlineStudyState.queue = fetchInlineBatch(app);
  _inlineStudyState.currentIndex = 0;

  setupInlineStudyEvents(app);
  updateSpeakerUI();
  applyInlineDisplayPrefs();
  showNextInlineCard();
}

/**
 * Cập nhật giao diện nút Loa phát âm đa chế độ
 */
function updateSpeakerUI() {
  const btn = document.getElementById('btn-inline-speaker');
  const icon = document.getElementById('inline-speaker-icon');
  if (!btn || !icon) return;

  if (_inlineStudyState.audioMode === 'auto') {
    icon.textContent = _inlineStudyState.isSlowSpeed ? '🐢' : '🔊';
    btn.className = 'btn-inline-speaker mode-auto';
    btn.title = `Âm thanh: Tự động phát (${_inlineStudyState.isSlowSpeed ? '0.5x' : '1.0x'}) • Click: Đổi chế độ • Nhấn giữ: Đổi tốc độ`;
  } else if (_inlineStudyState.audioMode === 'continuous') {
    icon.textContent = '🔁';
    btn.className = 'btn-inline-speaker mode-continuous';
    btn.title = `Âm thanh: Phát lặp liên tục (${_inlineStudyState.isSlowSpeed ? '0.5x' : '1.0x'}) • Click: Đổi chế độ • Nhấn giữ: Đổi tốc độ`;
  } else {
    icon.textContent = '🔇';
    btn.className = 'btn-inline-speaker mode-mute';
    btn.title = 'Âm thanh: Đã tắt • Click: Bật lại âm thanh';
  }
}

/**
 * Chuyển đổi chu kỳ 3 chế độ âm thanh: Tự động -> Phát liên tục -> Tắt
 */
function cycleSpeakerMode() {
  notifyStudyActivity();
  if (_inlineStudyState.loopTimerId) {
    clearTimeout(_inlineStudyState.loopTimerId);
    _inlineStudyState.loopTimerId = null;
  }
  stopAudio();

  if (_inlineStudyState.audioMode === 'auto') {
    _inlineStudyState.audioMode = 'continuous';
    showToast('🔁 Chế độ: Phát lặp liên tục', 'info');
    speakInlineCard();
  } else if (_inlineStudyState.audioMode === 'continuous') {
    _inlineStudyState.audioMode = 'mute';
    showToast('🔇 Đã tắt phát âm', 'info');
  } else {
    _inlineStudyState.audioMode = 'auto';
    showToast(`🔊 Chế độ: Tự động phát khi sang từ (${_inlineStudyState.isSlowSpeed ? '0.5x' : '1.0x'})`, 'success');
    speakInlineCard({ force: true });
  }
  updateSpeakerUI();
}

/**
 * Nhấn giữ để chuyển đổi tốc độ phát âm chậm 0.5x / chuẩn 1.0x
 */
function toggleSlowSpeed() {
  notifyStudyActivity();
  _inlineStudyState.isSlowSpeed = !_inlineStudyState.isSlowSpeed;
  const speedText = _inlineStudyState.isSlowSpeed ? 'Chậm 0.5x 🐢' : 'Chuẩn 1.0x ⚡';
  showToast(`Tốc độ phát âm: ${speedText}`, 'info');
  updateSpeakerUI();
  speakInlineCard({ force: true });
}

/**
 * Gán sự kiện cho các nút điều khiển của Inline Quick Flashcard
 */
function setupInlineStudyEvents(app) {
  setupInlinePrefsEvents();
  const btnFlip = document.getElementById('btn-inline-flip');
  const frontFace = document.getElementById('inline-face-front');
  const backFace = document.getElementById('inline-face-back');
  const btnSpeaker = document.getElementById('btn-inline-speaker');
  const btnMore = document.getElementById('btn-inline-more');

  if (btnFlip) {
    btnFlip.onpointerdown = (e) => e.preventDefault(); // Ngăn focus bằng chuột
    btnFlip.onclick = (e) => {
      e.stopPropagation();
      btnFlip.blur();
      document.activeElement?.blur();
      flipInlineCard();
    };
  }

  // Cho phép click vào mặt thẻ để lật qua lật lại 2 mặt
  if (frontFace) {
    frontFace.onclick = (e) => {
      if (e.target.closest('button')) return;
      document.activeElement?.blur();
      flipInlineCard();
    };
  }

  if (backFace) {
    backFace.onclick = (e) => {
      if (e.target.closest('.inline-rating-grid') || e.target.closest('button')) return;
      document.activeElement?.blur();
      flipInlineCard();
    };
  }

  // Xử lý nút Loa: Click ngắn chuyển Mode / Nhấn giữ >450ms chuyển 0.5x
  if (btnSpeaker) {
    let pressTimer = null;
    let isLongPress = false;

    btnSpeaker.onpointerdown = () => {
      isLongPress = false;
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        isLongPress = true;
        toggleSlowSpeed();
      }, 480);
    };

    btnSpeaker.onpointerup = (e) => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      if (!isLongPress) {
        e.stopPropagation();
        btnSpeaker.blur();
        cycleSpeakerMode();
      }
    };

    btnSpeaker.onpointerleave = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    btnSpeaker.oncontextmenu = (e) => {
      e.preventDefault();
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
      btn.onpointerdown = (e) => e.preventDefault(); // Ngăn trình duyệt giữ focus lên nút chấm
      btn.onclick = (e) => {
        e.stopPropagation();
        btn.blur();
        document.activeElement?.blur();
        rateInlineCard(rating);
      };
    }
  });

  // Gán phím tắt nhanh: Space/Enter/Mũi tên LẬT QUA LẠI giữa 2 mặt; 1, 2, 3, 4 để TỰ CHẤM
  if (!_inlineStudyState.isKeyboardListening) {
    _inlineStudyState.isKeyboardListening = true;

    window.addEventListener('keydown', (e) => {
      const tabReview = document.getElementById('tab-review');
      if (!tabReview || !tabReview.classList.contains('active')) return;
      if (document.querySelector('.modal-overlay[style*="display: flex"], .modal-overlay[style*="display: block"], .modal-container.active, .modal.active')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (!_inlineStudyState.currentCard) return;

      // Phím Space, Enter, Mũi tên: Lật qua lật lại giữa Mặt trước và Mặt sau
      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopImmediatePropagation();
        document.activeElement?.blur();
        flipInlineCard();
        return;
      }

      // Phím R: Phát âm lại từ
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        speakInlineCard({ force: true });
        return;
      }

      // Khi đang xem mặt sau (đáp án): Phím 1, 2, 3, 4 để tự chấm (Quên - Khó - Nhớ - Dễ)
      if (_inlineStudyState.isFlipped) {
        if (e.key === '1' || e.code === 'Numpad1') {
          e.preventDefault();
          document.activeElement?.blur();
          rateInlineCard(Rating.Again); // 1 = Quên
        } else if (e.key === '2' || e.code === 'Numpad2') {
          e.preventDefault();
          document.activeElement?.blur();
          rateInlineCard(Rating.Hard);  // 2 = Khó
        } else if (e.key === '3' || e.code === 'Numpad3') {
          e.preventDefault();
          document.activeElement?.blur();
          rateInlineCard(Rating.Good);  // 3 = Nhớ
        } else if (e.key === '4' || e.code === 'Numpad4') {
          e.preventDefault();
          document.activeElement?.blur();
          rateInlineCard(Rating.Easy);  // 4 = Dễ
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        const tabReview = document.getElementById('tab-review');
        if (tabReview && tabReview.classList.contains('active')) {
          e.preventDefault();
          document.activeElement?.blur();
        }
      }
    });
  }
}

/**
 * Hiển thị thẻ từ vựng kế tiếp trong luồng học liên tục (Tự nạp đệm 5 từ)
 */
function showNextInlineCard() {
  const frontFace = document.getElementById('inline-face-front');
  const backFace = document.getElementById('inline-face-back');
  const emptyState = document.getElementById('inline-card-empty');

  if (_inlineStudyState.currentIndex >= _inlineStudyState.queue.length) {
    // Tự động nạp đệm 5 từ kế tiếp không ngắt mạch học
    const nextBatch = fetchInlineBatch(_cachedApp);
    if (nextBatch.length > 0) {
      _inlineStudyState.queue = nextBatch;
      _inlineStudyState.currentIndex = 0;
      showNextInlineCard();
      return;
    }

    // Đã dọn sạch toàn bộ từ
    _inlineStudyState.currentCard = null;
    if (frontFace) frontFace.style.display = 'none';
    if (backFace) backFace.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (frontFace) frontFace.style.display = 'flex';
  if (backFace) backFace.style.display = 'none';

  _inlineStudyState.isFlipped = false;
  _inlineStudyState.startTime = Date.now();

  const card = _inlineStudyState.queue[_inlineStudyState.currentIndex];
  _inlineStudyState.currentCard = card;

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

    if (intAgain) intAgain.textContent = formatViIntervalText(previews[Rating.Again]?.intervalText) || '< 10 phút';
    if (intHard) intHard.textContent = formatViIntervalText(previews[Rating.Hard]?.intervalText) || '1 ngày';
    if (intGood) intGood.textContent = formatViIntervalText(previews[Rating.Good]?.intervalText) || '3 ngày';
    if (intEasy) intEasy.textContent = formatViIntervalText(previews[Rating.Easy]?.intervalText) || '4 ngày';
  }

  // Dọn dẹp thời gian mặt sau khi sang từ mới
  _inlineStudyState.backFlippedTime = 0;

  // Áp dụng cấu hình bật/tắt các trường dữ liệu
  applyInlineDisplayPrefs();

  // Kích hoạt khóa chống spam 2.5s trước khi cho lật
  startFlipLockTimer();

  // Tự động phát âm nếu đang ở chế độ auto hoặc continuous
  if (_inlineStudyState.audioMode !== 'mute') {
    speakInlineCard();
  }
}

/**
 * Khởi động bộ đếm khóa lật thẻ 2.5s chống bấm spam vô thức
 */
function startFlipLockTimer() {
  if (_inlineStudyState.flipLockTimer) {
    clearInterval(_inlineStudyState.flipLockTimer);
    _inlineStudyState.flipLockTimer = null;
  }

  _inlineStudyState.isFlipLocked = true;
  const btnFlip = document.getElementById('btn-inline-flip');
  if (btnFlip) {
    btnFlip.classList.add('is-locked');
    btnFlip.innerHTML = `<span>Lật thẻ (2s)</span>`;
  }

  const startTime = Date.now();
  const lockDurationMs = 2500;

  _inlineStudyState.flipLockTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remainingSec = Math.max(0, Math.ceil((lockDurationMs - elapsed) / 1000));

    if (elapsed >= lockDurationMs || remainingSec <= 0) {
      clearInterval(_inlineStudyState.flipLockTimer);
      _inlineStudyState.flipLockTimer = null;
      _inlineStudyState.isFlipLocked = false;
      if (btnFlip) {
        btnFlip.classList.remove('is-locked');
        btnFlip.innerHTML = `<span>Lật thẻ xem đáp án</span>`;
      }
    } else {
      if (btnFlip) {
        btnFlip.innerHTML = `<span>Lật thẻ (${remainingSec}s)</span>`;
      }
    }
  }, 200);
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
 * Lật qua lại giữa Mặt trước và Mặt sau của thẻ
 */
function flipInlineCard() {
  notifyStudyActivity();
  if (!_inlineStudyState.currentCard) return;

  // Khóa chống bấm spam 2.5s khi ở mặt trước
  if (!_inlineStudyState.isFlipped && _inlineStudyState.isFlipLocked) {
    const btnFlip = document.getElementById('btn-inline-flip');
    if (btnFlip) {
      btnFlip.classList.remove('shake-locked');
      void btnFlip.offsetWidth;
      btnFlip.classList.add('shake-locked');
      setTimeout(() => btnFlip.classList.remove('shake-locked'), 400);
    }
    return;
  }

  const frontFace = document.getElementById('inline-face-front');
  const backFace = document.getElementById('inline-face-back');

  if (frontFace && backFace) {
    if (!_inlineStudyState.isFlipped) {
      frontFace.style.display = 'none';
      backFace.style.display = 'flex';
      _inlineStudyState.isFlipped = true;
      _inlineStudyState.backFlippedTime = Date.now();
    } else {
      frontFace.style.display = 'flex';
      backFace.style.display = 'none';
      _inlineStudyState.isFlipped = false;
    }
  }
}

/**
 * Tự chấm thẻ theo thuật toán FSRS-6 và chuyển ngay sang từ kế tiếp
 */
function rateInlineCard(rating) {
  notifyStudyActivity();
  if (!_inlineStudyState.currentCard || !_inlineStudyState.fsrs) return;

  // Khóa ngầm chống bấm sớm ở mặt sau (giảm dần): Quên 2.0s, Khó 1.5s, Nhớ 1.0s, Dễ 0s (không hiện đếm ngược)
  const elapsed = Date.now() - (_inlineStudyState.backFlippedTime || 0);
  let lockDuration = 0;
  if (rating === Rating.Again) lockDuration = 2000;
  else if (rating === Rating.Hard) lockDuration = 1500;
  else if (rating === Rating.Good) lockDuration = 1000;
  else if (rating === Rating.Easy) lockDuration = 0;

  if (elapsed < lockDuration) {
    const btnMap = {
      [Rating.Again]: 'btn-rate-again',
      [Rating.Hard]: 'btn-rate-hard',
      [Rating.Good]: 'btn-rate-good',
      [Rating.Easy]: 'btn-rate-easy'
    };
    const btn = document.getElementById(btnMap[rating]);
    if (btn) {
      btn.classList.remove('shake-locked');
      void btn.offsetWidth;
      btn.classList.add('shake-locked');
      setTimeout(() => btn.classList.remove('shake-locked'), 400);
    }
    return;
  }

  const card = _inlineStudyState.currentCard;
  const now = new Date();
  let oldState = StorageManager.getCardState(card.id);
  if (!oldState) oldState = FSRS.createEmptyCard(card.id);

  const nextState = _inlineStudyState.fsrs.calculateNextState(oldState, rating, now, {
    enableFuzz: _cachedApp?.settings?.enableFuzz !== false,
    leechThreshold: _cachedApp?.settings?.leechThreshold || 6,
    leechAction: _cachedApp?.settings?.leechAction || 'tag'
  });

  const latencySec = (Date.now() - (_inlineStudyState.startTime || Date.now())) / 1000;
  const activeStudySecs = Math.min(20, Math.max(1, Math.round(latencySec)));
  if (typeof StorageManager.addStudySeconds === 'function') {
    StorageManager.addStudySeconds(activeStudySecs);
  }

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

  // Dừng phát lặp từ cũ trước khi chuyển từ mới
  if (_inlineStudyState.loopTimerId) {
    clearTimeout(_inlineStudyState.loopTimerId);
    _inlineStudyState.loopTimerId = null;
  }
  stopAudio();

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
 * Phát âm từ vựng với tốc độ linh hoạt (chuẩn 1.0x hoặc chậm 0.5x) và hỗ trợ chế độ phát lặp
 */
function speakInlineCard(options = {}) {
  notifyStudyActivity();
  if (!_inlineStudyState.currentCard || !_inlineStudyState.currentCard.word) return;
  if (_inlineStudyState.audioMode === 'mute' && !options.force) return;

  if (_inlineStudyState.loopTimerId) {
    clearTimeout(_inlineStudyState.loopTimerId);
    _inlineStudyState.loopTimerId = null;
  }

  const rate = _inlineStudyState.isSlowSpeed ? 0.5 : 1.0;
  speak(_inlineStudyState.currentCard.word, {
    speechRate: rate,
    cardObj: _inlineStudyState.currentCard,
    onEnd: () => {
      if (_inlineStudyState.audioMode === 'continuous') {
        _inlineStudyState.loopTimerId = setTimeout(() => {
          if (_inlineStudyState.audioMode === 'continuous') {
            speakInlineCard();
          }
        }, 1200);
      }
    }
  });
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

