/**
 * Flashcard English Pro - Màn hình Trang Chủ (Home / Review View)
 * Hiển thị 3 chỉ số cốt lõi: Từ tới hạn, Thời gian đã học, Từ đã thuộc
 * Hỗ trợ xem nhanh Popup chi tiết khi bấm vào từng chỉ số
 * Kèm nút CTA lớn để bắt đầu phiên học Flashcard FSRS-6 toàn màn hình
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { globalStudyTimer, StatsManager } from '../core/stats.js';
import { escapeHTML } from '../utils.js';

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
          <div class="home-metric-item" id="metric-card-due" role="button" tabindex="0" title="Nhấn để xem danh sách từ tới hạn">
            <div class="metric-icon-badge badge-due">⚡</div>
            <div class="metric-info">
              <span class="metric-label">TỪ TỚI HẠN</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-due-count">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Xem danh sách ❯</span>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 2: Thời gian đã học -->
          <div class="home-metric-item" id="metric-card-time" role="button" tabindex="0" title="Nhấn để xem tổng quan thời gian học">
            <div class="metric-icon-badge badge-time">⏱️</div>
            <div class="metric-info">
              <span class="metric-label">THỜI GIAN ĐÃ HỌC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-study-timer">0</strong>
                <span class="metric-unit">phút</span>
              </div>
            </div>
            <span class="metric-tap-hint">Tổng quan ❯</span>
          </div>

          <div class="metric-divider"></div>

          <!-- Cột 3: Từ đã thuộc -->
          <div class="home-metric-item" id="metric-card-mastered" role="button" tabindex="0" title="Nhấn để xem 5 cấp độ trí nhớ FSRS">
            <div class="metric-icon-badge badge-mastered">💎</div>
            <div class="metric-info">
              <span class="metric-label">TỪ ĐÃ THUỘC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-retention-rate">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">5 cấp độ ❯</span>
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
          const mins = liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);
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

    // Gán sự kiện bấm vào 3 thẻ chỉ số để mở Popup xem nhanh
    const cardDue = document.getElementById('metric-card-due');
    if (cardDue && !cardDue._bound) {
      cardDue._bound = true;
      cardDue.onclick = () => showDueWordsModal(app);
      cardDue.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDueWordsModal(app); } };
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
    const mins = liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);
    elTimer.textContent = mins;
  }

  // 3. Từ đã thuộc
  const elRetention = document.getElementById('home-retention-rate');
  if (elRetention) {
    elRetention.textContent = masteredCount;
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
