/**
 * Flashcard English Pro - Màn hình Trang Chủ (Home / Review View)
 * Hiển thị 3 chỉ số cốt lõi: Từ tới hạn, Thời gian đã học, Từ đã thuộc
 * Hỗ trợ xem nhanh Popup chi tiết khi bấm vào từng chỉ số
 * Kèm nút CTA lớn để bắt đầu phiên học Flashcard FSRS-6 toàn màn hình
 */

import { StorageManager } from '../services/storage.js';
import { State, Rating, isCardDue } from '../core/fsrs.js';
import { globalStudyTimer, StatsManager } from '../core/stats.js';
import { escapeHTML, getLocalDateKey } from '../utils.js';
import { MASTERY_STABILITY_THRESHOLD } from '../config.js';
import { showStreakHubModal, openCustomStudyModal } from './components.js';
import { speak } from '../services/audio.js';
import { showGoalCustomizerModal, showForecastDetailModal } from './modals/goal-modal.js';
import {
  setStatModalsApp,
  showAttentionCardsModal,
  showDueWordsModal,
  showReviewedTodayModal,
  showStudyTimeModal,
  showMasteredTiersModal
} from './review/stat-modals.js';

export { showGoalCustomizerModal, showForecastDetailModal };

let _cachedApp = null;
let _isTimerListening = false;

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-minimal-container')) {
    container.innerHTML = `
      <div class="review-minimal-container">
        <!-- 1. Cảnh báo khôi phục chuỗi ngày học bị đứt (Streak Recovery Banner) -->
        <div id="home-streak-alert-container"></div>

        <!-- 2. Thẻ 4 chỉ số: Từ tới hạn, Đã ôn hôm nay, Thời gian đã học, Từ đã thuộc -->
        <div class="home-metrics-card inset-grouped-card">
          <!-- Cột 1: Từ tới hạn -->
          <div class="home-metric-item" id="metric-card-due" role="button" tabindex="0" title="Nhấn để xem danh sách từ tới hạn">
            <div class="metric-icon-badge badge-due">⚡</div>
            <div class="metric-info">
              <span class="metric-label">TỚI HẠN</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-due-count">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Danh sách ❯</span>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 2: Đã ôn hôm nay -->
          <div class="home-metric-item" id="metric-card-reviewed" role="button" tabindex="0" title="Nhấn để xem các thẻ đã ôn hôm nay">
            <div class="metric-icon-badge badge-reviewed">✅</div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ ÔN H.NAY</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-reviewed-count">0</strong>
                <span class="metric-unit">thẻ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Chi tiết ❯</span>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 3: Thời gian đã học -->
          <div class="home-metric-item" id="metric-card-time" role="button" tabindex="0" title="Nhấn để xem tổng quan thời gian đã học hôm nay">
            <div class="metric-icon-badge badge-time">⏱️</div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ HỌC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-study-timer">0</strong>
                <span class="metric-unit">phút</span>
              </div>
            </div>
            <span class="metric-tap-hint">Tổng quan ❯</span>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 4: Từ đã thuộc -->
          <div class="home-metric-item" id="metric-card-mastered" role="button" tabindex="0" title="Nhấn để xem 5 cấp độ trí nhớ FSRS">
            <div class="metric-icon-badge badge-mastered">💎</div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ THUỘC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-retention-rate">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">5 cấp độ ❯</span>
          </div>
        </div>

        <!-- 2b. THẺ THỐNG KÊ: TỪ KHÓ (QUÊN ≥ 8 LẦN) -->
        <div class="home-attention-card inset-grouped-card" id="home-attention-card" role="button" tabindex="0" title="Nhấn để xem danh sách từ khó">
          <div class="attention-card-left">
            <div class="attention-icon-badge">🎯</div>
            <div class="attention-info">
              <div class="attention-title-row">
                <span class="attention-title">Từ Khó</span>
                <span class="attention-total-badge" id="attention-total-badge">0 từ</span>
              </div>
              <div class="attention-sub-tags">
                <span class="attention-tag tag-leech" id="attention-leech-tag">Quên ≥ 8 lần</span>
              </div>
            </div>
          </div>
          <div class="attention-card-right">
            <span class="attention-action-btn">Chi tiết & Ôn ❯</span>
          </div>
        </div>

        <!-- 3. NÚT CTA HỌC NGAY DUY NHẤT -->
        <div class="home-cta-section home-cta-single">
          <button type="button" class="btn-hero-flashcard-cta btn-cta-primary-due btn-cta-study-now" id="btn-home-start-flashcard" title="Học ngay">
            <div class="btn-cta-glare"></div>
            <div class="btn-cta-body">
              <span class="btn-cta-main-text">Học ngay</span>
            </div>
          </button>
        </div>

        <!-- 3c. NÚT ÔN TẬP TÙY CHỌN (CUSTOM FILTERED STUDY) -->
        <div class="home-custom-study-row">
          <button type="button" class="btn-custom-study-bar" id="btn-home-custom-study" title="Ôn tập tùy chọn theo chủ đề, cấp độ & trạng thái FSRS">
            <div class="custom-study-bar-left">
              <div class="custom-study-bar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
                </svg>
              </div>
              <div class="custom-study-bar-text">
                <div class="custom-study-bar-title-wrap">
                  <span class="custom-study-bar-title">Ôn tập Tùy chọn</span>
                  <span class="custom-study-bar-badge">Bộ lọc riêng</span>
                </div>
              </div>
            </div>
            <div class="custom-study-bar-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        </div>

        <!-- 4. BỘ CHẾ ĐỘ HỌC CÓ CHỦ ĐÍCH (Targeted Systematic Study Modes) -->
        <div class="home-study-modes-section">
          <div class="modes-section-header">
            <span class="modes-header-title">CHẾ ĐỘ HỌC CÓ CHỦ ĐÍCH</span>
          </div>
          <div class="home-modes-grid">
            <!-- Mode 1: Diệt từ khó (Leech Hunter) -->
            <button type="button" class="home-mode-card mode-weak" id="btn-mode-weak-hunter" title="Học chuyên sâu các từ khó nhớ và có độ bền trí nhớ thấp">
              <div class="mode-icon-wrap">🔥</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Diệt từ khó</span>
                  <span class="mode-badge" id="badge-weak-count">0 từ</span>
                </div>
              </div>
            </button>

            <!-- Mode 2: Luyện phản xạ Nghe (Audio Blind) -->
            <button type="button" class="home-mode-card mode-audio" id="btn-mode-audio-blind" title="Mặt trước ẩn chữ, chỉ nghe phát âm để nhận diện từ vựng">
              <div class="mode-icon-wrap">🎧</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Phản xạ Nghe</span>
                  <span class="mode-badge badge-audio">Mù chữ</span>
                </div>
              </div>
            </button>

            <!-- Mode 3: Tốc chiến 3 phút (Sprint 10) -->
            <button type="button" class="home-mode-card mode-sprint" id="btn-mode-sprint-10" title="Phiên học nhanh 10 từ cấp bách nhất">
              <div class="mode-icon-wrap">⚡</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Tốc chiến 3p</span>
                  <span class="mode-badge badge-sprint">10 từ</span>
                </div>
              </div>
            </button>

            <!-- Mode 4: Ôn tập tùy chọn linh hoạt -->
            <button type="button" class="home-mode-card mode-custom" id="btn-mode-custom-filter" title="Tự chọn bộ từ, trạng thái FSRS và cấp độ CEFR">
              <div class="mode-icon-wrap">🎛️</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Ôn tùy chọn</span>
                  <span class="mode-badge badge-custom">Tự chọn</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

export function renderReviewTab(app) {
  try {
    _cachedApp = app;
    setStatModalsApp(app);
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
          const mins = liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);
          elTimer.textContent = mins;
        }
      });
    }

    // Nhấn vào Thẻ Trình độ & Lộ trình CEFR để mở Modal Phân tích & Tùy chỉnh nhịp độ
    const cardGoal = document.getElementById('home-goal-card');
    if (cardGoal && !cardGoal._bound) {
      cardGoal._bound = true;
      cardGoal.onclick = () => showGoalCustomizerModal(app);
      cardGoal.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showGoalCustomizerModal(app); } };
    }

    // Gán sự kiện bấm vào Badge Dự Báo ETA để mở Popup chi tiết FSRS Forecast
    const badgeEta = document.getElementById('home-goal-eta');
    if (badgeEta && !badgeEta._bound) {
      badgeEta._bound = true;
      badgeEta.onclick = (e) => {
        e.stopPropagation();
        showForecastDetailModal(app);
      };
      badgeEta.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          showForecastDetailModal(app);
        }
      };
    }

    // Gán sự kiện cho Nút CTA 1: Tự động nạp [Từ tới hạn] + [Đủ số lượng mục tiêu từ mới hôm nay]
    const btnFlashcard = document.getElementById('btn-home-start-flashcard');
    if (btnFlashcard && !btnFlashcard._bound) {
      btnFlashcard._bound = true;
      btnFlashcard.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'due_first' });
      };
    }

    // Gán sự kiện cho Nút CTA 2: Chỉ bốc từ mới chưa học theo số lượng mục tiêu (Ưu tiên từ thông dụng)
    const btnStartNew = document.getElementById('btn-home-start-new');
    if (btnStartNew && !btnStartNew._bound) {
      btnStartNew._bound = true;
      btnStartNew.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'new_only' });
      };
    }

    // Gán sự kiện cho Banner Lướt Từ Vựng (Reels Mode)
    const btnStartReels = document.getElementById('btn-home-start-reels');
    if (btnStartReels && !btnStartReels._bound) {
      btnStartReels._bound = true;
      btnStartReels.onclick = () => {
        navigator.vibrate?.(10);
        if (typeof app.startReelsSession === 'function') {
          app.startReelsSession(null, { mode: 'mixed' });
        }
      };
    }

    // Gán sự kiện cho Nút Học Trắc Nghiệm (Smart Quiz Mode)
    const btnStartQuiz = document.getElementById('btn-home-start-quiz');
    if (btnStartQuiz && !btnStartQuiz._bound) {
      btnStartQuiz._bound = true;
      btnStartQuiz.onclick = () => {
        navigator.vibrate?.(10);
        if (typeof app.startQuizSession === 'function') {
          app.startQuizSession(null, { mode: 'due_first' });
        }
      };
    }

    // Gán sự kiện cho các Chế Độ Học Có Chủ Đích (Targeted Modes)
    const btnWeakHunter = document.getElementById('btn-mode-weak-hunter');
    if (btnWeakHunter && !btnWeakHunter._bound) {
      btnWeakHunter._bound = true;
      btnWeakHunter.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'weak_hunter' });
      };
    }

    const btnAudioBlind = document.getElementById('btn-mode-audio-blind');
    if (btnAudioBlind && !btnAudioBlind._bound) {
      btnAudioBlind._bound = true;
      btnAudioBlind.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'audio_blind', audioBlind: true });
      };
    }

    const btnSprint10 = document.getElementById('btn-mode-sprint-10');
    if (btnSprint10 && !btnSprint10._bound) {
      btnSprint10._bound = true;
      btnSprint10.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'sprint_10' });
      };
    }

    // Gán sự kiện cho Nút Ôn tập Tùy chọn (Custom Filtered Study)
    const btnCustomStudy = document.getElementById('btn-home-custom-study');
    if (btnCustomStudy && !btnCustomStudy._bound) {
      btnCustomStudy._bound = true;
      btnCustomStudy.onclick = () => {
        navigator.vibrate?.(8);
        openCustomStudyModal(app);
      };
    }

    const btnModeCustom = document.getElementById('btn-mode-custom-filter');
    if (btnModeCustom && !btnModeCustom._bound) {
      btnModeCustom._bound = true;
      btnModeCustom.onclick = () => {
        navigator.vibrate?.(8);
        openCustomStudyModal(app);
      };
    }

    // Gán sự kiện bấm vào 4 thẻ chỉ số để mở Popup xem nhanh
    const cardDue = document.getElementById('metric-card-due');
    if (cardDue && !cardDue._bound) {
      cardDue._bound = true;
      cardDue.onclick = () => showDueWordsModal(app);
      cardDue.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDueWordsModal(app); } };
    }

    const cardReviewed = document.getElementById('metric-card-reviewed');
    if (cardReviewed && !cardReviewed._bound) {
      cardReviewed._bound = true;
      cardReviewed.onclick = () => showReviewedTodayModal(app);
      cardReviewed.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showReviewedTodayModal(app); } };
    }

    const cardTime = document.getElementById('metric-card-time');
    if (cardTime && !cardTime._bound) {
      cardTime._bound = true;
      cardTime.onclick = () => showStudyTimeModal(app);
      cardTime.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showStudyTimeModal(app); } };
    }

    const cardMastered = document.getElementById('metric-card-mastered');
    if (cardMastered && !cardMastered._bound) {
      cardMastered._bound = true;
      cardMastered.onclick = () => showMasteredTiersModal(app);
      cardMastered.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showMasteredTiersModal(app); } };
    }

    const cardAttention = document.getElementById('home-attention-card');
    if (cardAttention && !cardAttention._bound) {
      cardAttention._bound = true;
      cardAttention.onclick = () => showAttentionCardsModal(app);
      cardAttention.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showAttentionCardsModal(app); } };
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
      // Khớp chính xác Mức 5: Ghi nhớ sâu (Độ bền S >= 30 ngày)
      if (s >= MASTERY_STABILITY_THRESHOLD) {
        masteredCount++;
      }
    }
  }

  // 1. Số từ tới hạn
  const elDue = document.getElementById('home-due-count');
  if (elDue) {
    elDue.textContent = dueCount;
  }

  // Cập nhật huy hiệu trên Nút CTA Ôn tập ngay
  const elDueTag = document.getElementById('badge-home-due-tag');
  if (elDueTag) {
    if (dueCount > 0) {
      elDueTag.textContent = `${dueCount} từ`;
      elDueTag.className = 'btn-cta-tag tag-due';
    } else {
      elDueTag.textContent = 'Đã xong';
      elDueTag.className = 'btn-cta-tag tag-done';
    }
  }

  // 2. Số thẻ đã ôn hôm nay
  const logs = StorageManager.getStudyLogs() || [];
  const todayKey = getLocalDateKey();
  let todayCount = 0;
  const todayNewCardIds = new Set();
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    if (getLocalDateKey(log.timestamp) === todayKey) {
      todayCount++;
      if (log.oldState === State.New || log.oldState === 0 || (log.oldState === undefined && (log.state === State.New || log.state === 0 || log.isNew))) {
        if (log.cardId) todayNewCardIds.add(log.cardId);
      }
    }
  }
  const todayNewCount = todayNewCardIds.size;

  const elReviewed = document.getElementById('home-reviewed-count');
  if (elReviewed) {
    elReviewed.textContent = todayCount;
  }

  // 3. Thời gian đã học
  const elTimer = document.getElementById('home-study-timer');
  if (elTimer) {
    const todaySecs = StorageManager.getTodayStudySeconds();
    const liveSecs = todaySecs + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
    const mins = liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);
    elTimer.textContent = mins;
  }

  // 4. Từ đã thuộc
  const elRetention = document.getElementById('home-retention-rate');
  if (elRetention) {
    elRetention.textContent = masteredCount;
  }

  // 4.5. Cập nhật số đếm từ yếu cho huy hiệu Diệt từ khó
  if (app.deckManager?.getStudyModeCounts) {
    try {
      const modeCounts = app.deckManager.getStudyModeCounts(null, app.settings);
      const elWeakBadge = document.getElementById('badge-weak-count');
      if (elWeakBadge) elWeakBadge.textContent = `${modeCounts.weakCount} từ`;
    } catch (e) {}
  }

  // 4.6. Cập nhật Thẻ Thống Kê Từ Khó (Attention Cards - Quên >= 8 lần)
  if (app.deckManager?.getAttentionCards) {
    try {
      const attentionData = app.deckManager.getAttentionCards();
      const elAttentionCard = document.getElementById('home-attention-card');
      const elTotalBadge = document.getElementById('attention-total-badge');
      const elLeechTag = document.getElementById('attention-leech-tag');

      if (elTotalBadge) elTotalBadge.textContent = `${attentionData.totalCount} từ`;
      if (elLeechTag) elLeechTag.textContent = `Quên ≥ 8 lần`;

      if (elAttentionCard) {
        if (attentionData.totalCount === 0) {
          elAttentionCard.classList.add('is-empty');
        } else {
          elAttentionCard.classList.remove('is-empty');
        }
      }
    } catch (e) {
      console.warn('Lỗi khi cập nhật Attention Cards:', e);
    }
  }

  // 5. PHÂN TÍCH LỘ TRÌNH CEFR & THUẬT TOÁN DỰ BÁO NHỊP ĐỘ HỌC TẬP (FSRS Dynamic Engine)
  const cefrData = StatsManager.getCefrRoadmapAndForecast(allCards, app.settings || {});
  const { levels, currentLevel, goal, forecast } = cefrData;
  const dailyNewTarget = Number(app.settings?.activeGoal?.dailyNew) || Number(app.settings?.dailyNewLimit) || 10;
  const remainingNewToday = Math.max(0, dailyNewTarget - todayNewCount);

  // Icon & Tiêu đề Trình độ hiện tại
  const elGoalIcon = document.getElementById('home-goal-icon');
  if (elGoalIcon) elGoalIcon.textContent = goal.icon || '🎯';

  const elGoalTitle = document.getElementById('home-goal-title');
  if (elGoalTitle) {
    elGoalTitle.textContent = currentLevel.fullTitle || `Trình Độ ${currentLevel.id} (${currentLevel.name})`;
  }

  const elTargetTag = document.getElementById('home-target-tag');
  if (elTargetTag) {
    elTargetTag.textContent = `Mục tiêu: ${goal.shortTitle || goal.title} ❯`;
  }

  const elCurBadge = document.getElementById('home-current-level-badge');
  if (elCurBadge) {
    elCurBadge.textContent = `${currentLevel.id} (${currentLevel.progressPct}%)`;
    elCurBadge.style.borderColor = `${currentLevel.color}40`;
    elCurBadge.style.color = currentLevel.color;
    elCurBadge.style.background = `${currentLevel.color}15`;
  }

  // Cập nhật 5 nấc CEFR Track (A1 -> A2 -> B1 -> B2 -> C1)
  const cefrTiers = ['A1', 'A2', 'B1', 'B2', 'C1'];
  cefrTiers.forEach((tierId) => {
    const dot = document.getElementById(`dot-${tierId}`);
    if (dot) {
      const tier = levels[tierId];
      const tierPct = tier && tier.total > 0 ? (tier.learned / tier.total) : 0;
      dot.className = 'cefr-step-dot';
      if (tierPct >= 0.9) {
        dot.classList.add('completed');
        dot.innerHTML = '✓';
      } else if (tierId === currentLevel.id) {
        dot.classList.add('active');
        dot.innerHTML = tierId;
      } else if (tierPct > 0) {
        dot.classList.add('in-progress');
        dot.innerHTML = tierId;
      } else {
        dot.innerHTML = tierId;
      }
    }
  });

  // Cập nhật thanh fill nối giữa các chặng
  const updateLineFill = (lineId, fromTierId) => {
    const elLine = document.getElementById(lineId);
    if (elLine) {
      const fromTier = levels[fromTierId];
      const fromPct = fromTier && fromTier.total > 0 ? (fromTier.learned / fromTier.total) : 0;
      const fillPct = Math.min(100, Math.round(fromPct * 100));
      elLine.style.width = `${fillPct}%`;
    }
  };

  updateLineFill('fill-A1-A2', 'A1');
  updateLineFill('fill-A2-B1', 'A2');
  updateLineFill('fill-B1-B2', 'B1');
  updateLineFill('fill-B2-C1', 'B2');

  // Cập nhật Tiến độ Mục tiêu tổng thể
  const elGoalWords = document.getElementById('home-goal-progress-words');
  if (elGoalWords) {
    elGoalWords.textContent = `${goal.learnedWords} / ${goal.targetWords} từ`;
  }

  const elGoalPct = document.getElementById('home-goal-percent');
  if (elGoalPct) {
    elGoalPct.textContent = `${goal.completionPct}%`;
  }

  const elGoalFill = document.getElementById('home-goal-progress-fill');
  if (elGoalFill) {
    elGoalFill.style.width = `${goal.completionPct}%`;
  }

  // Hôm nay nạp mới
  const elTodayNew = document.getElementById('home-goal-today-new');
  const elTodayWrapper = document.getElementById('home-goal-today-wrapper');
  // Cập nhật huy hiệu & tiến độ trên Nút CTA Học từ mới
  const elNewTag = document.getElementById('badge-home-new-tag');
  const elNewSubtext = document.getElementById('subtext-home-new-progress');
  if (elNewTag) {
    if (todayNewCount >= dailyNewTarget) {
      elNewTag.textContent = `✓ ${todayNewCount}/${dailyNewTarget} từ`;
      elNewTag.className = 'btn-cta-tag tag-done';
    } else {
      elNewTag.textContent = `${todayNewCount}/${dailyNewTarget} từ`;
      elNewTag.className = 'btn-cta-tag tag-new';
    }
  }
  if (elNewSubtext) {
    if (todayNewCount >= dailyNewTarget) {
      elNewSubtext.textContent = 'Đã đạt chỉ tiêu • Học thêm';
    } else {
      elNewSubtext.textContent = `Còn thiếu ${remainingNewToday} từ • Phổ biến nhất`;
    }
  }

  // Dự kiến hoàn thành (Adaptive realtime dựa trên Mức 5 FSRS S >= 30 ngày)
  const elGoalEta = document.getElementById('home-goal-eta-text');
  const elGoalEtaWrapper = document.getElementById('home-goal-eta-wrapper');
  if (elGoalEta) {
    if (goal.unmasteredWords === 0) {
      elGoalEta.textContent = `✓ Thuộc ${forecast.shortGoalTitle}`;
      if (elGoalEtaWrapper) {
        elGoalEtaWrapper.innerHTML = `<strong style="color: #10b981;">✓ Thuộc ${forecast.shortGoalTitle} (100%)</strong>`;
      }
    } else {
      elGoalEta.textContent = `~${forecast.etaDays} ngày`;
      if (elGoalEtaWrapper) {
        elGoalEtaWrapper.innerHTML = `<span>Đạt <strong>${forecast.shortGoalTitle}</strong>: <strong>~${forecast.etaDays} ngày</strong></span>`;
      }
    }
  }

  const elEtaIcon = document.getElementById('home-goal-eta-icon');
  if (elEtaIcon) {
    elEtaIcon.textContent = forecast.isUsingRealBehavior ? '⚡' : '🏁';
  }

  // 7. Cảnh báo khôi phục Streak nếu vừa bị đứt hôm qua
  const alertContainer = document.getElementById('home-streak-alert-container');
  if (alertContainer) {
    const brokenInfo = StatsManager.detectBrokenStreak(logs);
    if (brokenInfo && brokenInfo.isBroken && brokenInfo.canRecover) {
      alertContainer.innerHTML = `
        <div class="streak-recovery-alert-card" id="btn-open-streak-hub-banner" role="button" tabindex="0" title="Nhấn để mở Trung tâm bảo vệ & cứu chuỗi ngày học">
          <div class="alert-pulse-dot"></div>
          <div class="recovery-icon-badge">⚠️</div>
          <div class="recovery-text-group">
            <div class="recovery-title-row">
              <strong class="recovery-main-title">Chuỗi ${brokenInfo.pastStreakBeforeMiss} ngày vừa bị gián đoạn!</strong>
              <span class="recovery-badge-pill">Có thể cứu</span>
            </div>
            <span class="recovery-sub-text">Dùng Khiên Đóng Băng hoặc làm Thử Thách Chuộc Lỗi để nối lại chuỗi ngay.</span>
          </div>
          <button type="button" class="btn-recovery-cta">Cứu Streak ❯</button>
        </div>
      `;
      const bannerBtn = alertContainer.querySelector('#btn-open-streak-hub-banner');
      if (bannerBtn) {
        bannerBtn.onclick = () => showStreakHubModal(app);
        bannerBtn.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showStreakHubModal(app);
          }
        };
      }
    } else {
      alertContainer.innerHTML = '';
    }
  }
}


if (typeof window !== 'undefined') {
  window.updateHomeStatsRealtime = updateHomeStatsRealtime;
}

// Re-export các modal thống kê chi tiết để tương thích 100% với các module ngoài
export {
  showAttentionCardsModal,
  showDueWordsModal,
  showReviewedTodayModal,
  showStudyTimeModal,
  showMasteredTiersModal
};
