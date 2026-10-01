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
import { speak } from '../services/audio.js';
import { MASTERY_STABILITY_THRESHOLD, LEARNING_GOALS, getLearningGoal } from '../config.js';

let _cachedApp = null;
let _isTimerListening = false;

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-minimal-container')) {
    container.innerHTML = `
      <div class="review-minimal-container">
        <!-- 1. Thanh Tiến Độ Trình Độ CEFR & Nhịp Độ Cá Nhân Hóa (CEFR Level & Roadmap Header Bar) -->
        <div class="home-goal-bar-card" id="home-goal-card" role="button" tabindex="0" title="Nhấn để xem phân tích lộ trình CEFR & nhịp độ cá nhân hóa">
          <div class="goal-bar-header">
            <div class="goal-badge-wrap">
              <span class="goal-icon-badge" id="home-goal-icon">🎯</span>
              <div class="goal-titles">
                <div class="goal-eyebrow-row">
                  <span class="goal-eyebrow">TRÌNH ĐỘ HIỆN TẠI</span>
                  <span class="goal-target-tag" id="home-target-tag">Mục tiêu: B1 ❯</span>
                </div>
                <h2 class="goal-main-title" id="home-goal-title">Trình Độ A1 (Căn Bản Khởi Đầu)</h2>
              </div>
            </div>
            <div class="goal-header-right">
              <span class="goal-level-badge" id="home-current-level-badge">Cấp A1</span>
            </div>
          </div>

          <!-- Multi-Segment CEFR Roadmap Track (A1 -> A2 -> B1 -> B2 -> C1) -->
          <div class="cefr-milestone-track" id="home-cefr-track">
            <div class="cefr-step-item" data-step="A1">
              <div class="cefr-step-dot" id="dot-A1">A1</div>
              <span class="cefr-step-label">Căn bản</span>
            </div>
            <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-A1-A2" style="width: 0%;"></div></div>
            <div class="cefr-step-item" data-step="A2">
              <div class="cefr-step-dot" id="dot-A2">A2</div>
              <span class="cefr-step-label">Sơ cấp</span>
            </div>
            <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-A2-B1" style="width: 0%;"></div></div>
            <div class="cefr-step-item" data-step="B1">
              <div class="cefr-step-dot" id="dot-B1">B1</div>
              <span class="cefr-step-label">Trung cấp</span>
            </div>
            <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-B1-B2" style="width: 0%;"></div></div>
            <div class="cefr-step-item" data-step="B2">
              <div class="cefr-step-dot" id="dot-B2">B2</div>
              <span class="cefr-step-label">Trung cao</span>
            </div>
            <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-B2-C1" style="width: 0%;"></div></div>
            <div class="cefr-step-item" data-step="C1">
              <div class="cefr-step-dot" id="dot-C1">C1</div>
              <span class="cefr-step-label">Cao cấp</span>
            </div>
          </div>

          <div class="goal-progress-section">
            <div class="goal-progress-meta">
              <span class="goal-progress-label">Đã tích lũy mục tiêu: <strong id="home-goal-progress-words">0 / 3027 từ</strong></span>
              <span class="goal-percent-badge" id="home-goal-percent">0%</span>
            </div>
            <div class="goal-progress-track">
              <div class="goal-progress-fill" id="home-goal-progress-fill" style="width: 0%;"></div>
            </div>
          </div>

          <div class="goal-daily-status-row">
            <div class="goal-daily-badge">
              <span class="goal-stat-icon">🌱</span>
              <span>Hôm nay: <strong id="home-goal-today-new">0 / 10 từ mới</strong></span>
            </div>
            <div class="goal-eta-badge" id="home-goal-eta">
              <span class="goal-stat-icon" id="home-goal-eta-icon">⚡</span>
              <span>Dự kiến: <strong id="home-goal-eta-text">-- ngày</strong></span>
            </div>
          </div>
        </div>

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
          <div class="home-metric-item" id="metric-card-time" role="button" tabindex="0" title="Nhấn để xem tổng quan thời gian học">
            <div class="metric-icon-badge badge-time">⏱️</div>
            <div class="metric-info">
              <span class="metric-label">THỜI GIAN</span>
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

        <!-- 3. NÚT CTA HỌC TẬP TINH GIẢN & HIỆN ĐẠI -->
        <div class="home-cta-section">
          <button type="button" class="btn-hero-flashcard-cta" id="btn-home-start-flashcard">
            <div class="btn-cta-glare"></div>
            <div class="btn-cta-body">
              <div class="btn-cta-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div class="btn-cta-texts">
                <span class="btn-cta-main-text">BẮT ĐẦU HỌC</span>
                <span class="btn-cta-sub-text" id="home-cta-subtext">⚡ Nhấn để bắt đầu phiên ôn tập</span>
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

    // Gán sự kiện cho Nút CTA To: Tự động nạp [Từ tới hạn] + [Đủ số lượng mục tiêu từ mới hôm nay]
    const btnFlashcard = document.getElementById('btn-home-start-flashcard');
    if (btnFlashcard && !btnFlashcard._bound) {
      btnFlashcard._bound = true;
      btnFlashcard.onclick = () => {
        app.startStudySession(null, null, null, { mode: 'due_first' });
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

  // 2. Số thẻ đã ôn hôm nay
  const logs = StorageManager.getStudyLogs() || [];
  const todayKey = getLocalDateKey();
  let todayCount = 0;
  let todayNewCount = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    if (getLocalDateKey(log.timestamp) === todayKey) {
      todayCount++;
      if (log.oldState === State.New || log.oldState === 0 || (log.oldState === undefined && (log.state === State.New || log.state === 0 || log.isNew))) {
        todayNewCount++;
      }
    }
  }

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
    elCurBadge.textContent = `Cấp ${currentLevel.id} (${currentLevel.progressPct}%)`;
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
  if (elTodayNew) {
    if (todayNewCount >= dailyNewTarget) {
      elTodayNew.textContent = `✓ Đạt ${todayNewCount}/${dailyNewTarget} từ`;
      elTodayNew.style.color = '#10b981';
    } else {
      elTodayNew.textContent = `${todayNewCount} / ${dailyNewTarget} từ`;
      elTodayNew.style.color = '';
    }
  }

  // Dự kiến hoàn thành (Adaptive realtime)
  const elGoalEta = document.getElementById('home-goal-eta-text');
  if (elGoalEta) {
    if (goal.remainingWords === 0) {
      elGoalEta.textContent = '✓ Đạt mục tiêu';
    } else {
      elGoalEta.textContent = forecast.isUsingRealBehavior 
        ? `~${forecast.etaDays} ngày (${forecast.actualDailyVelocity} từ/ng)` 
        : `~${forecast.etaDays} ngày`;
    }
  }

  const elEtaIcon = document.getElementById('home-goal-eta-icon');
  if (elEtaIcon) {
    elEtaIcon.textContent = forecast.isUsingRealBehavior ? '⚡' : '🏁';
  }

  // Cập nhật text phụ của nút CTA (tinh giản, súc tích)
  const elCtaSub = document.getElementById('home-cta-subtext');
  if (elCtaSub) {
    if (dueCount > 0 && remainingNewToday > 0) {
      elCtaSub.textContent = `⚡ ${dueCount} ôn tập + 🌱 ${remainingNewToday} từ mới`;
    } else if (dueCount > 0) {
      elCtaSub.textContent = `⚡ ${dueCount} từ cần ôn tập`;
    } else if (remainingNewToday > 0) {
      elCtaSub.textContent = `🌱 ${remainingNewToday} từ mới hôm nay`;
    } else {
      elCtaSub.textContent = `🎉 Đã hoàn thành chỉ tiêu hôm nay`;
    }
  }
}

/* ==========================================================================
   POPUP 1: DANH SÁCH TỪ TỚI HẠN (DUE WORDS LIST MODAL)
   ========================================================================== */
export function showDueWordsModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const now = new Date();
  const dueCards = [];

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (state && state.state !== State.New && state.state !== 0 && !state.suspended) {
      if (isCardDue(state, now)) {
        dueCards.push(card);
      }
    }
  }

  let modal = document.getElementById('modal-quick-due-words');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-due-words';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const wordListHTML = dueCards.length > 0 
    ? dueCards.map(c => `
        <div class="due-word-row">
          <div class="due-word-left">
            <span class="due-word-text">${escapeHTML(c.word)}</span>
            ${c.phonetic ? `<span class="due-word-ipa">${escapeHTML(c.phonetic)}</span>` : ''}
          </div>
          <div class="due-word-right">
            <span class="due-word-pos">${escapeHTML((c.pos || 'word').toUpperCase())}</span>
          </div>
        </div>
      `).join('')
    : `
      <div class="quick-modal-empty">
        <span class="empty-emoji">🎉</span>
        <h4 class="empty-title">Không có từ tới hạn!</h4>
        <p class="empty-desc">Toàn bộ từ vựng đều đang trong chu kỳ ghi nhớ tốt. Hãy luyện từ mới hoặc thư giãn nhé!</p>
      </div>
    `;

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-due">⚡</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Từ Tới Hạn Cần Ôn</h3>
            <span class="quick-modal-sub">${dueCards.length} từ đến hạn cần củng cố</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <div class="due-word-list">
          ${wordListHTML}
        </div>
      </div>
      <div class="quick-modal-footer">
        ${dueCards.length > 0 ? `
          <button type="button" class="btn-quick-action-primary" id="btn-quick-start-due">
            <span>⚡ Ôn ${dueCards.length} từ này ngay</span>
          </button>
        ` : ''}
        <button type="button" class="btn-quick-action-secondary btn-quick-close">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };

  const btnStartDue = modal.querySelector('#btn-quick-start-due');
  if (btnStartDue) {
    btnStartDue.onclick = () => {
      modal.classList.remove('active');
      app.startStudySession(null, null, null, { mode: 'due_only' });
    };
  }
}

/* ==========================================================================
   POPUP: DANH SÁCH THẺ ĐÃ ÔN HÔM NAY (REVIEWED TODAY MODAL)
   ========================================================================== */
export function showReviewedTodayModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const logs = StorageManager.getStudyLogs() || [];
  const todayKey = getLocalDateKey();
  const allCardsMap = new Map();
  app.deckManager.getAllCards().forEach(c => allCardsMap.set(c.id, c));

  const todayLogs = [];
  const ratingCounts = { [Rating.Easy]: 0, [Rating.Good]: 0, [Rating.Hard]: 0, [Rating.Again]: 0 };

  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    if (getLocalDateKey(log.timestamp) === todayKey) {
      todayLogs.push(log);
      if (ratingCounts[log.rating] !== undefined) {
        ratingCounts[log.rating]++;
      }
    }
  }

  let modal = document.getElementById('modal-quick-reviewed-today');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-reviewed-today';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const ratingLabelMap = {
    [Rating.Easy]: { text: 'DỄ', icon: '⚡', color: '#10b981' },
    [Rating.Good]: { text: 'TỐT', icon: '✨', color: '#6366f1' },
    [Rating.Hard]: { text: 'KHÓ', icon: '⏳', color: '#f59e0b' },
    [Rating.Again]: { text: 'QUÊN', icon: '❌', color: '#ef4444' }
  };

  const wordListHTML = todayLogs.length > 0
    ? todayLogs.map(log => {
        const card = allCardsMap.get(log.cardId) || { word: log.word || log.cardId, phonetic: '', pos: 'word', meaning: '' };
        const ratingInfo = ratingLabelMap[log.rating] || { text: 'ÔN', icon: '📝', color: '#6366f1' };
        const timeStr = new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        return `
          <div class="due-word-row reviewed-word-row">
            <div class="due-word-left">
              <span class="due-word-text">${escapeHTML(card.word)}</span>
              ${card.phonetic ? `<span class="due-word-ipa">${escapeHTML(card.phonetic)}</span>` : ''}
              ${card.meaning ? `<span class="reviewed-word-meaning">${escapeHTML(card.meaning)}</span>` : ''}
            </div>
            <div class="due-word-right" style="display: flex; align-items: center; gap: 8px;">
              <span class="reviewed-rating-tag" style="background: ${ratingInfo.color}18; color: ${ratingInfo.color}; border: 1px solid ${ratingInfo.color}40; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
                ${ratingInfo.icon} ${ratingInfo.text}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${timeStr}</span>
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="quick-modal-empty">
        <span class="empty-emoji">📝</span>
        <h4 class="empty-title">Chưa có lượt ôn nào hôm nay</h4>
        <p class="empty-desc">Nhấn "Bắt đầu ôn Flashcard" để củng cố từ vựng và ghi nhận thành tích ngay nhé!</p>
      </div>
    `;

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-reviewed">✅</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Thẻ Đã Ôn Hôm Nay</h3>
            <span class="quick-modal-sub">${todayLogs.length} lượt ôn tập đã hoàn thành</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        ${todayLogs.length > 0 ? `
          <div style="display: flex; gap: 6px; margin-bottom: 12px; justify-content: space-between;">
            <span style="flex: 1; text-align: center; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">⚡ Dễ: ${ratingCounts[Rating.Easy]}</span>
            <span style="flex: 1; text-align: center; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">✨ Tốt: ${ratingCounts[Rating.Good]}</span>
            <span style="flex: 1; text-align: center; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">⏳ Khó: ${ratingCounts[Rating.Hard]}</span>
            <span style="flex: 1; text-align: center; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">❌ Quên: ${ratingCounts[Rating.Again]}</span>
          </div>
        ` : ''}
        <div class="due-word-list">
          ${wordListHTML}
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

/* ==========================================================================
   POPUP 2: TỔNG QUAN THỜI GIAN ĐÃ HỌC (STUDY TIME OVERVIEW MODAL)
   ========================================================================== */
export function showStudyTimeModal(app = _cachedApp) {
  const todaySecs = (StorageManager.getTodayStudySeconds?.() || 0) + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const todayMins = todaySecs > 0 && todaySecs < 60 ? 1 : Math.round(todaySecs / 60);
  const totalStored = typeof StorageManager.getTotalStudySeconds === 'function'
    ? StorageManager.getTotalStudySeconds()
    : Object.values(StorageManager.getStudyTimeMap?.() || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  const totalSecs = totalStored + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const totalHours = Math.floor(totalSecs / 3600);
  const totalRemainingMins = Math.round((totalSecs % 3600) / 60);

  const logs = StorageManager.getStudyLogs() || [];
  const streak = StatsManager.calculateStreak(logs);
  const totalReviews = logs.length;

  let modal = document.getElementById('modal-quick-study-time');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-study-time';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-time">⏱️</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Thời Gian Đã Học</h3>
            <span class="quick-modal-sub">Tổng quan thời gian học chủ động FSRS</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <div class="quick-stats-grid">
          <div class="quick-stat-tile">
            <div class="tile-icon">⏱️</div>
            <div class="tile-info">
              <span class="tile-label">Hôm nay</span>
              <strong class="tile-val text-primary">${todayMins} <span class="tile-unit">phút</span></strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">🔥</div>
            <div class="tile-info">
              <span class="tile-label">Chuỗi ngày (Streak)</span>
              <strong class="tile-val text-warning">${streak} <span class="tile-unit">ngày</span></strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">⏳</div>
            <div class="tile-info">
              <span class="tile-label">Tổng tích lũy</span>
              <strong class="tile-val text-info">${totalHours}h ${totalRemainingMins}m</strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">📝</div>
            <div class="tile-info">
              <span class="tile-label">Lượt ôn tập</span>
              <strong class="tile-val text-success">${totalReviews} <span class="tile-unit">lượt</span></strong>
            </div>
          </div>
        </div>
        <div class="quick-tip-box">
          <span class="tip-icon">💡</span>
          <p class="tip-text">Học đều đặn mỗi ngày từ 5 - 15 phút giúp não bộ củng cố đường mòn trí nhớ FSRS tốt nhất!</p>
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đã hiểu</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

/* ==========================================================================
   POPUP 3: 5 MỨC ĐỘ GHI NHỚ FSRS (MASTERED STABILITY TIERS MODAL)
   ========================================================================== */
export function showMasteredTiersModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const intel = StatsManager.getMemoryIntelligence(allCards);
  const tiers = intel.tiers || {
    tier1: { count: 0 },
    tier2: { count: 0 },
    tier3: { count: 0 },
    tier4: { count: 0 },
    tier5: { count: 0 }
  };
  const totalLearned = intel.totalLearned || 0;
  const retrievability = intel.currentRetrievability || 0;

  let modal = document.getElementById('modal-quick-mastered-tiers');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-mastered-tiers';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-mastered">💎</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Cấp Độ Ghi Nhớ FSRS</h3>
            <span class="quick-modal-sub">Phân bổ ${totalLearned} từ theo độ bền trí nhớ</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <!-- Visual distribution bar -->
        <div class="tier-distribution-track">
          <div class="tier-seg seg-5" style="flex: ${tiers.tier5.count || 0.001};" title="Ghi nhớ sâu: ${tiers.tier5.count}"></div>
          <div class="tier-seg seg-4" style="flex: ${tiers.tier4.count || 0.001};" title="Bền vững: ${tiers.tier4.count}"></div>
          <div class="tier-seg seg-3" style="flex: ${tiers.tier3.count || 0.001};" title="Trung hạn: ${tiers.tier3.count}"></div>
          <div class="tier-seg seg-2" style="flex: ${tiers.tier2.count || 0.001};" title="Ngắn hạn: ${tiers.tier2.count}"></div>
          <div class="tier-seg seg-1" style="flex: ${tiers.tier1.count || 0.001};" title="Mới học: ${tiers.tier1.count}"></div>
        </div>

        <div class="quick-tier-list">
          <div class="tier-row-item tier-5">
            <div class="tier-row-left">
              <span class="tier-dot dot-5"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 5: Ghi nhớ sâu</span>
                <span class="tier-desc">Độ bền S ≥ 30 ngày (Ôn > 1 tháng)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier5.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-4">
            <div class="tier-row-left">
              <span class="tier-dot dot-4"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 4: Bền vững</span>
                <span class="tier-desc">Độ bền 14 - 29 ngày (Ôn 2 - 4 tuần)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier4.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-3">
            <div class="tier-row-left">
              <span class="tier-dot dot-3"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 3: Trung hạn</span>
                <span class="tier-desc">Độ bền 7 - 13 ngày (Ôn 1 - 2 tuần)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier3.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-2">
            <div class="tier-row-left">
              <span class="tier-dot dot-2"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 2: Ngắn hạn</span>
                <span class="tier-desc">Độ bền 3 - 6 ngày (Ôn 3 - 7 ngày)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier2.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-1">
            <div class="tier-row-left">
              <span class="tier-dot dot-1"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 1: Mới học</span>
                <span class="tier-desc">Độ bền < 3 ngày (Ôn 1 - 2 ngày)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier1.count} <span class="tier-unit">từ</span></strong>
          </div>
        </div>

        <div class="quick-intel-summary">
          <div class="intel-summary-item">
            <span class="intel-label">Xác suất nhớ thực tế R(t)</span>
            <strong class="intel-val" style="color: #10b981;">${retrievability}%</strong>
          </div>
          <div class="intel-summary-item">
            <span class="intel-label">Danh hiệu Trí nhớ</span>
            <strong class="intel-val" style="color: ${intel.rank?.color || '#6366f1'};">${intel.rank?.title || 'Khởi động'}</strong>
          </div>
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

/* ==========================================================================
   POPUP 4: LỘ TRÌNH CEFR, PHÂN LOẠI TỪ VỰNG & DỰ BÁO NHỊP ĐỘ CÁ NHÂN HÓA
   ========================================================================== */
export function showGoalCustomizerModal(app = _cachedApp) {
  if (!app) return;
  const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
  let currentGoalId = app.settings?.activeGoal?.id || 'cefr-b1';
  let selectedGoalId = currentGoalId;
  let selectedDailyNew = Number(app.settings?.activeGoal?.dailyNew) || Number(app.settings?.dailyNewLimit) || 10;
  let selectedTargetWords = Number(app.settings?.activeGoal?.targetWords) || 3027;

  let modal = document.getElementById('modal-quick-goal-customizer');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-goal-customizer';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const renderModalContent = () => {
    // 1. Phân tích dữ liệu CEFR Roadmap & Dynamic Forecast từ StatsManager
    const tempSettings = {
      ...app.settings,
      activeGoal: {
        id: selectedGoalId,
        dailyNew: selectedDailyNew,
        targetWords: selectedTargetWords
      }
    };
    const cefrData = StatsManager.getCefrRoadmapAndForecast(allCards, tempSettings);
    const { levels, currentLevel, goal, forecast } = cefrData;

    // Phân tích từ còn thiếu cho cấp độ kế tiếp (Next Level Requirements)
    const targetNextId = currentLevel.nextLevelId !== 'Master' ? currentLevel.nextLevelId : 'C1';
    const nextLevelObj = levels[targetNextId] || levels.A1;
    const wordsRemainingToNext = Math.max(0, nextLevelObj.total - nextLevelObj.learned);
    const nextPosRemaining = nextLevelObj.remainingByPos || { noun: 0, verb: 0, adj: 0, other: 0 };

    const estDailyMins = Math.round(selectedDailyNew * 1.2 + 5);

    modal.innerHTML = `
      <div class="modal-dialog quick-preview-dialog goal-customizer-dialog cefr-roadmap-modal">
        <div class="quick-modal-header">
          <div class="quick-modal-title-wrap">
            <div class="quick-modal-icon badge-due">🗺️</div>
            <div class="quick-modal-headings">
              <h3 class="quick-modal-title">Lộ Trình CEFR & Nhịp Độ Cá Nhân Hóa</h3>
              <span class="quick-modal-sub">Đo lường năng lực thực tế, phân loại từ vựng & dự báo thích ứng</span>
            </div>
          </div>
          <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
        </div>

        <div class="quick-modal-body">
          <!-- KHUNG 1: ĐÁNH GIÁ TRÌNH ĐỘ & NHU CẦU TỪ VỰNG CỤ THỂ (POS Breakdown) -->
          <div class="cefr-analyzer-section">
            <div class="cefr-cur-level-card" style="border-left: 4px solid ${currentLevel.color};">
              <div class="cefr-cur-level-header">
                <div>
                  <span class="cefr-card-eyebrow">ĐÁNH GIÁ NĂNG LỰC HIỆN TẠI</span>
                  <h4 class="cefr-cur-title">${escapeHTML(currentLevel.fullTitle)}</h4>
                </div>
                <span class="cefr-cur-badge" style="background: ${currentLevel.color}18; color: ${currentLevel.color}; border: 1px solid ${currentLevel.color}40;">
                  Cấp ${currentLevel.id} (${currentLevel.progressPct}%)
                </span>
              </div>

              <p class="cefr-cur-desc">
                Bạn đã tích lũy <strong>${currentLevel.learned} / ${currentLevel.total} từ</strong> thuộc chuẩn CEFR ${currentLevel.id}.
                ${wordsRemainingToNext > 0 
                  ? `Để thăng cấp lên <strong>${nextLevelObj.fullTitle}</strong>, bạn cần tích lũy thêm <strong>${wordsRemainingToNext} từ</strong> nữa:` 
                  : `🎉 Chúc mừng bạn đã hoàn thành trọn vẹn bậc ${currentLevel.id}!`}
              </p>

              ${wordsRemainingToNext > 0 ? `
                <div class="pos-breakdown-grid">
                  <div class="pos-chip pos-noun">
                    <span class="pos-chip-icon">📘</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Danh từ (Nouns)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.noun} từ</strong>
                    </div>
                  </div>
                  <div class="pos-chip pos-verb">
                    <span class="pos-chip-icon">⚡</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Động từ (Verbs)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.verb} từ</strong>
                    </div>
                  </div>
                  <div class="pos-chip pos-adj">
                    <span class="pos-chip-icon">🎨</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Tính từ (Adj)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.adj} từ</strong>
                    </div>
                  </div>
                  <div class="pos-chip pos-other">
                    <span class="pos-chip-icon">🧩</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Khác (Phrases/Adv)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.other} từ</strong>
                    </div>
                  </div>
                </div>
                <div class="cefr-priority-hint">
                  <span class="hint-icon">💡</span>
                  <span><strong>Thứ tự ưu tiên nạp từ:</strong> Thuật toán tự động ưu tiên nạp Động từ cốt lõi ➔ Danh từ thông dụng nhất ➔ Tính từ mô tả ➔ Cụm từ thành ngữ theo chuẩn Oxford Core.</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- KHUNG 2: BẢN ĐỒ TOÀN DIỆN 5 BẬC CEFR (A1 -> A2 -> B1 -> B2 -> C1) -->
          <div class="cefr-analyzer-section">
            <span class="goal-sec-label">Tiến độ phân bổ theo 5 Bậc CEFR:</span>
            <div class="cefr-5levels-grid">
              ${['A1', 'A2', 'B1', 'B2', 'C1'].map(lvlId => {
                const lvl = levels[lvlId];
                const pct = lvl.total > 0 ? Math.round((lvl.learned / lvl.total) * 100) : 0;
                const isCur = lvlId === currentLevel.id;
                return `
                  <div class="cefr-level-row-item ${isCur ? 'is-current' : ''}">
                    <div class="cefr-level-row-left">
                      <span class="cefr-lvl-tag" style="background: ${lvl.color}15; color: ${lvl.color}; border: 1px solid ${lvl.color}35;">${lvlId}</span>
                      <div class="cefr-lvl-meta">
                        <div class="cefr-lvl-title-row">
                          <strong class="cefr-lvl-name">${lvl.fullTitle}</strong>
                          ${isCur ? `<span class="cefr-current-indicator">Đang học</span>` : ''}
                        </div>
                        <div class="cefr-lvl-sub-row">
                          <span>${lvl.learned} / ${lvl.total} từ</span>
                          <span>•</span>
                          <span style="color: #10b981;">💎 Thuộc: ${lvl.mastered} từ</span>
                        </div>
                      </div>
                    </div>
                    <div class="cefr-level-row-right">
                      <span class="cefr-lvl-pct-text">${pct}%</span>
                      <div class="cefr-lvl-bar-mini">
                        <div class="cefr-lvl-fill-mini" style="width: ${pct}%; background: ${lvl.color};"></div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- KHUNG 3: DỰ BÁO TIẾN ĐỘ THÍCH ỨNG THEO HÀNH VI USER (Dynamic Adaptive ETA Engine) -->
          <div class="cefr-analyzer-section">
            <div class="cefr-forecast-header-row">
              <span class="goal-sec-label">Dự báo nhịp độ & thời gian hoàn thành:</span>
              <span class="pace-status-badge" style="background: ${forecast.paceBadgeColor}18; color: ${forecast.paceBadgeColor}; border: 1px solid ${forecast.paceBadgeColor}40;">
                ${forecast.paceStatus}
              </span>
            </div>
            
            <div class="goal-live-calc-card">
              <div class="goal-calc-box">
                <span class="goal-calc-label">Vốn từ cần nạp thêm</span>
                <span class="goal-calc-val" style="color: var(--primary);">${goal.remainingWords} <small style="font-size: 0.72rem; color: var(--text-secondary);">/ ${goal.targetWords} từ</small></span>
                <span class="goal-calc-sub">Đã nạp: ${goal.learnedWords} từ (${goal.completionPct}%)</span>
              </div>
              <div class="goal-calc-box">
                <span class="goal-calc-label">Thời gian về đích</span>
                <span class="goal-calc-val" style="color: #10b981;">~${forecast.etaDays} ngày</span>
                <span class="goal-calc-sub">Dự kiến: ${forecast.targetDateFormatted}</span>
              </div>
              <div class="goal-calc-box">
                <span class="goal-calc-label">Tốc độ thích ứng (Live)</span>
                <span class="goal-calc-val" style="color: #f59e0b;">${forecast.effectiveVelocity} từ/ngày</span>
                <span class="goal-calc-sub">${forecast.isUsingRealBehavior ? 'Dựa trên nhật ký học thực tế' : 'Mặc định benchmark chuẩn'}</span>
              </div>
              <div class="goal-calc-box">
                <span class="goal-calc-label">Thời gian ôn mỗi ngày</span>
                <span class="goal-calc-val" style="color: #6366f1;">~${estDailyMins} phút</span>
                <span class="goal-calc-sub">${selectedDailyNew} mới + từ tới hạn FSRS</span>
              </div>
            </div>
          </div>

          <!-- KHUNG 4: CHỌN MỤC TIÊU & NHỊP ĐỘ HỌC HÀNG NGÀY -->
          <div class="cefr-analyzer-section">
            <span class="goal-sec-label">Tùy chỉnh Mục tiêu mong muốn:</span>
            <div class="goal-presets-list">
              ${LEARNING_GOALS.map(g => `
                <div class="goal-preset-item ${g.id === selectedGoalId ? 'active' : ''}" data-goal-id="${g.id}">
                  <div class="goal-preset-left">
                    <span class="goal-preset-icon">${g.icon}</span>
                    <div class="goal-preset-meta">
                      <span class="goal-preset-title">${escapeHTML(g.title)}</span>
                      <span class="goal-preset-desc">${escapeHTML(g.desc)} (~${g.defaultTargetWords} từ)</span>
                    </div>
                  </div>
                  <div class="goal-preset-check">${g.id === selectedGoalId ? '✓' : ''}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KHUNG 5: CHỌN NHỊP ĐỘ TỪ MỚI MỖI NGÀY -->
          <div class="cefr-analyzer-section">
            <span class="goal-sec-label">Nhịp độ nạp từ mới mỗi ngày:</span>
            <div class="pace-selector-group">
              ${[5, 10, 15, 20, 30].map(p => `
                <button type="button" class="pace-pill-btn ${p === selectedDailyNew ? 'active' : ''}" data-pace="${p}">
                  <strong>${p}</strong>
                  <span>từ/ngày</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="quick-modal-footer" style="display: flex; gap: 8px;">
          <button type="button" class="btn-quick-action-secondary btn-quick-close" style="flex: 1;">
            <span>Đóng</span>
          </button>
          <button type="button" class="btn-confirm-primary" id="btn-save-goal-settings" style="flex: 2; min-height: 44px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; background: var(--primary); color: #fff; border: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
            <span>Lưu & Áp Dụng Lộ Trình</span>
          </button>
        </div>
      </div>
    `;

    // Gán sự kiện chọn Lộ trình
    const presetItems = modal.querySelectorAll('.goal-preset-item');
    presetItems.forEach(item => {
      item.onclick = () => {
        selectedGoalId = item.getAttribute('data-goal-id');
        renderModalContent();
      };
    });

    // Gán sự kiện chọn Pace
    const paceBtns = modal.querySelectorAll('.pace-pill-btn');
    paceBtns.forEach(btn => {
      btn.onclick = () => {
        selectedDailyNew = Number(btn.getAttribute('data-pace')) || 10;
        renderModalContent();
      };
    });

    // Gán sự kiện Lưu
    const btnSave = modal.querySelector('#btn-save-goal-settings');
    if (btnSave) {
      btnSave.onclick = () => {
        const goalObj = getLearningGoal(selectedGoalId);
        if (!app.settings) app.settings = {};
        app.settings.dailyNewLimit = selectedDailyNew;
        app.settings.activeGoal = {
          id: selectedGoalId,
          dailyNew: selectedDailyNew,
          targetWords: selectedGoalId === 'custom' ? selectedTargetWords : (goalObj.defaultTargetWords || 3027),
          customTitle: ''
        };

        StorageManager.saveSettings(app.settings);
        modal.classList.remove('active');
        updateHomeStatsRealtime(app);
        if (app.deckManager) app.deckManager.invalidateStatsCache();
        app.showToast(`🎯 Đã áp dụng lộ trình: ${goalObj.shortTitle} (${selectedDailyNew} từ/ngày)`, 'success', 3000);
      };
    }

    // Gán sự kiện đóng modal
    const closeBtns = modal.querySelectorAll('.btn-quick-close');
    closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
  };

  renderModalContent();
  modal.classList.add('active');
}

