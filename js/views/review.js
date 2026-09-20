/**
 * Review View - Clean, High-Value Daily Review Center & Calendar Heatmap
 * 1. Nhiệm vụ hôm nay (4 chỉ số cốt lõi + Nút hành động chính)
 * 2. Dự báo lịch ôn 7 ngày (Gọn gàng, thanh lịch, tinh tế)
 * 3. Lịch học tập theo ngày (Bảng ô vuông Heatmap trực quan, không rườm rà)
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { StatsManager } from '../core/stats.js';
import { getLocalDateKey, escapeHTML } from '../utils.js';
import { showToast } from './components.js';
import { speak } from '../services/audio.js';

let _currentYear = new Date().getFullYear();
let _currentMonth = new Date().getMonth() + 1; // 1 - 12
let _viewMode = 'month'; // 'month' | 'year'
let _cachedApp = null;

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-bento-container')) {
    container.innerHTML = `
      <div class="review-bento-container">
        
        <!-- 1. Top Unboxed Hero Header -->
        <div class="review-hero-banner">
          <div class="review-hero-left">
            <div class="review-hero-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div class="review-hero-text">
              <h2 class="review-hero-title">Trung Tâm Ôn Tập Hàng Ngày</h2>
              <p class="review-hero-subtitle" id="home-today-status">Kế hoạch ôn tập & tích lũy từ vựng</p>
            </div>
          </div>
          <div class="review-hero-badges">
            <span class="pill-today-streak" id="home-header-streak">🔥 0 ngày liên tục</span>
            <span class="pill-today-pct" id="home-goal-pct">0%</span>
          </div>
        </div>

        <!-- 2. Khối 1: Nhiệm Vụ Hôm Nay -->
        <div class="bento-section-group bento-group-hero">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
              NHIỆM VỤ HÔM NAY
            </span>
            <span class="hero-goal-ratio-pill" id="home-goal-ratio">0/10 từ</span>
          </div>

          <div class="bento-card bento-hero-card">
            <!-- 4 Khối chỉ số 2 Cột (2x2 Grid) -->
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

              <!-- Card 4: Tỉ lệ nhớ tốt -->
              <div class="quad-tile tile-retention" id="box-home-retention">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">🧠</span>
                  <span class="quad-label">TỈ LỆ NHỚ TỐT</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-retention-rate">100%</span>
                </div>
                <span class="quad-sub-hint" id="home-retention-hint">Trí nhớ xuất sắc 🌟</span>
              </div>
            </div>

            <!-- Nút Hành Động Chính (Hero CTA) -->
            <button class="btn-hero-action" id="btn-home-hero-cta">
              <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span id="home-hero-cta-text">Ôn 0 từ ngay</span>
            </button>

            <!-- Dòng thông tin ước tính & chuỗi -->
            <div class="hero-meta-hint">
              <span id="home-estimated-time">⏱️ Khoảng 0 phút</span>
              <span class="hint-sep">•</span>
              <span id="home-streak-hint">Học hôm nay để giữ chuỗi 🔥</span>
            </div>
          </div>
        </div>

        <!-- 3. Khối 2: Dự Báo Lịch Ôn 7 Ngày (Minimalist & Crisp) -->
        <div class="bento-section-group bento-group-forecast">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              DỰ BÁO LỊCH ÔN 7 NGÀY
            </span>
            <div class="section-header-actions">
              <span class="bento-badge-forecast" id="home-forecast-total">0 từ / 7 ngày</span>
              <button type="button" class="btn-open-calendar-modal" id="btn-open-calendar-modal" title="Xem lịch chi tiết">
                <span>Lịch tháng ↗</span>
              </button>
            </div>
          </div>

          <div class="bento-card bento-forecast-card">
            <div class="forecast-capsules-grid" id="home-review-forecast"></div>
          </div>
        </div>

        <!-- 4. Khối 3: Lịch Học Tập Theo Ngày (Trực Tiếp Heatmap, Bỏ Khối Thừa) -->
        <div class="bento-section-group" id="journal-main-container">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              LỊCH HỌC TẬP THEO NGÀY
            </span>
            
            <div class="section-header-actions">
              <div class="journal-view-toggle">
                <button type="button" class="btn-toggle-mode active" data-mode="month" id="btn-mode-month">Tháng</button>
                <button type="button" class="btn-toggle-mode" data-mode="year" id="btn-mode-year">Năm</button>
              </div>
              <div class="journal-legend">
                <span>Ít</span>
                <span class="legend-cell heat-0"></span>
                <span class="legend-cell heat-1"></span>
                <span class="legend-cell heat-2"></span>
                <span class="legend-cell heat-3"></span>
                <span class="legend-cell heat-4"></span>
                <span>Nhiều</span>
              </div>
            </div>
          </div>

          <!-- Calendar Wrapper (Compact Card) -->
          <div class="bento-card journal-calendar-card" id="journal-month-section">
            <!-- Navigation Header -->
            <div class="journal-month-nav-row">
              <button type="button" class="btn-journal-nav" id="btn-journal-prev" title="Tháng trước">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              
              <div class="journal-period-info">
                <span class="period-title" id="journal-period-title">Tháng ${_currentMonth}, ${_currentYear}</span>
                <button type="button" class="btn-journal-today" id="btn-journal-today">Hôm nay</button>
              </div>

              <button type="button" class="btn-journal-nav" id="btn-journal-next" title="Tháng sau">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

            <!-- 7-Day Header -->
            <div class="calendar-weekdays-row">
              <span class="weekday-cell">T2</span>
              <span class="weekday-cell">T3</span>
              <span class="weekday-cell">T4</span>
              <span class="weekday-cell">T5</span>
              <span class="weekday-cell">T6</span>
              <span class="weekday-cell">T7</span>
              <span class="weekday-cell sun">CN</span>
            </div>

            <!-- Calendar Grid Cells -->
            <div class="calendar-grid-cells" id="journal-calendar-grid"></div>

            <!-- Submeta summary bar -->
            <div class="journal-cal-summary-strip" id="journal-cal-summary">
              <span id="journal-cal-summary-text">Tháng này: <strong>+0</strong> từ • <strong>0</strong> ngày học</span>
            </div>
          </div>

          <!-- Year Matrix Grid (Hidden in Month Mode) -->
          <div class="bento-card" id="journal-year-section" style="display: none;">
            <div class="year-matrix-grid" id="journal-year-grid"></div>
          </div>
        </div>

      </div>

      <!-- Floating Day Popover Tooltip Container -->
      <div id="day-popover-tooltip" class="day-popover-tooltip" style="display: none;"></div>
    `;

    setupJournalEvents(container);
  }
}

function setupJournalEvents(container) {
  const btnPrev = container.querySelector('#btn-journal-prev');
  const btnNext = container.querySelector('#btn-journal-next');
  const btnToday = container.querySelector('#btn-journal-today');
  const btnMonth = container.querySelector('#btn-mode-month');
  const btnYear = container.querySelector('#btn-mode-year');

  if (btnPrev) {
    btnPrev.onclick = () => {
      hideDayPopover();
      if (_viewMode === 'month') {
        _currentMonth--;
        if (_currentMonth < 1) {
          _currentMonth = 12;
          _currentYear--;
        }
      } else {
        _currentYear--;
      }
      if (_cachedApp) renderReviewTab(_cachedApp);
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      hideDayPopover();
      if (_viewMode === 'month') {
        _currentMonth++;
        if (_currentMonth > 12) {
          _currentMonth = 1;
          _currentYear++;
        }
      } else {
        _currentYear++;
      }
      if (_cachedApp) renderReviewTab(_cachedApp);
    };
  }

  if (btnToday) {
    btnToday.onclick = () => {
      hideDayPopover();
      const now = new Date();
      _currentYear = now.getFullYear();
      _currentMonth = now.getMonth() + 1;
      if (_cachedApp) renderReviewTab(_cachedApp);
    };
  }

  if (btnMonth && btnYear) {
    btnMonth.onclick = () => {
      hideDayPopover();
      _viewMode = 'month';
      btnMonth.classList.add('active');
      btnYear.classList.remove('active');
      const secMonth = container.querySelector('#journal-month-section');
      const secYear = container.querySelector('#journal-year-section');
      if (secMonth) secMonth.style.display = 'flex';
      if (secYear) secYear.style.display = 'none';
      if (_cachedApp) renderReviewTab(_cachedApp);
    };

    btnYear.onclick = () => {
      hideDayPopover();
      _viewMode = 'year';
      btnYear.classList.add('active');
      btnMonth.classList.remove('active');
      const secMonth = container.querySelector('#journal-month-section');
      const secYear = container.querySelector('#journal-year-section');
      if (secMonth) secMonth.style.display = 'none';
      if (secYear) secYear.style.display = 'flex';
      if (_cachedApp) renderReviewTab(_cachedApp);
    };
  }

  // Dismiss popover on global click/touch outside
  if (!container._popoverBound) {
    container._popoverBound = true;
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.calendar-day-cell') && !e.target.closest('.day-popover-tooltip')) {
        hideDayPopover();
      }
    });
    window.addEventListener('scroll', () => hideDayPopover(), { passive: true });
  }
}

function showDayPopover(cell, dayObj) {
  const tooltip = document.getElementById('day-popover-tooltip');
  if (!tooltip || !cell || !dayObj) return;

  const parts = dayObj.dateKey.split('-');
  const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
  const dateTitle = dayObj.isToday ? `Hôm nay (${formatted})` : `Ngày ${formatted}`;

  tooltip.innerHTML = `
    <div class="popover-header">
      <span class="popover-date">📅 ${dateTitle}</span>
      <span class="popover-badge-total">${dayObj.count > 0 ? '+' + dayObj.count + ' từ' : '0 từ'}</span>
    </div>
    <div class="popover-body">
      <div class="popover-item">
        <span>📚 Từ mới học:</span>
        <strong>+${dayObj.newCount} từ</strong>
      </div>
      <div class="popover-item">
        <span>🔄 Ôn tập lại:</span>
        <strong>${dayObj.reviewCount} từ</strong>
      </div>
      <div class="popover-item">
        <span>🎯 Độ ghi nhớ:</span>
        <strong>${dayObj.retention}%</strong>
      </div>
      <div class="popover-item">
        <span>⏱️ Thời gian:</span>
        <strong>${dayObj.minutes} phút</strong>
      </div>
    </div>
  `;

  tooltip.style.display = 'flex';

  const rect = cell.getBoundingClientRect();
  const popWidth = tooltip.offsetWidth || 230;
  const popHeight = tooltip.offsetHeight || 120;

  let left = rect.left + (rect.width / 2) - (popWidth / 2);
  if (left < 10) left = 10;
  if (left + popWidth > window.innerWidth - 10) left = window.innerWidth - popWidth - 10;

  let top = rect.top - popHeight - 8;
  if (top < 10) {
    top = rect.bottom + 8;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  requestAnimationFrame(() => {
    tooltip.classList.add('active');
  });
}

function hideDayPopover() {
  const tooltip = document.getElementById('day-popover-tooltip');
  if (tooltip) {
    tooltip.classList.remove('active');
    setTimeout(() => {
      if (!tooltip.classList.contains('active')) {
        tooltip.style.display = 'none';
      }
    }, 180);
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
    let goodMemoryCount = 0;
    let dueCount = 0;

    for (const card of allCards) {
      const state = StorageManager.getCardState(card.id);
      if (state && state.state !== State.New && state.state !== 0) {
        learnedCount++;
        if (isCardDue(state, now)) {
          dueCount++;
        }
        const s = state.stability || 0;
        if (s >= 3) {
          goodMemoryCount++;
        }
      }
    }

    const retentionRate = learnedCount > 0 ? Math.round((goodMemoryCount / learnedCount) * 100) : 100;

    // Cập nhật Timer & Retention Rate trong 4 Card
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
      elRetention.textContent = `${retentionRate}%`;
    }

    const elRetentionHint = document.getElementById('home-retention-hint');
    if (elRetentionHint) {
      if (retentionRate >= 90) {
        elRetentionHint.textContent = 'Trí nhớ xuất sắc 🌟';
      } else if (retentionRate >= 75) {
        elRetentionHint.textContent = 'Độ nhớ rất tốt 👍';
      } else {
        elRetentionHint.textContent = 'Cần ôn thêm 📖';
      }
    }

    // 2. Mục tiêu hôm nay & Nhật ký học
    const dailyGoal = Number(app.settings?.dailyNewLimit) || 10;
    const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
    const queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : dueCount;

    const todayLogs = StorageManager.getStudyLogs().filter(l => 
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
        elTodayStatus.textContent = 'Đã hoàn thành chỉ tiêu hôm nay ✓';
      } else {
        elTodayStatus.textContent = `Còn ${remainingGoal} từ để đạt chỉ tiêu hôm nay`;
      }
    }

    // B. Chuỗi ngày học
    const streak = StatsManager.calculateStreak(StorageManager.getStudyLogs());
    const elHeaderStreak = document.getElementById('home-header-streak');
    if (elHeaderStreak) {
      elHeaderStreak.textContent = `🔥 ${streak} ngày liên tục`;
    }

    const elStreakHint = document.getElementById('home-streak-hint');
    if (elStreakHint) {
      if (todayLogs.length > 0) {
        elStreakHint.textContent = `Đã giữ chuỗi ${streak} ngày hôm nay! 🌟`;
      } else {
        elStreakHint.textContent = `Học hôm nay để giữ chuỗi ${streak} ngày 🔥`;
      }
    }

    // C. Tiến độ mục tiêu ngày
    const elGoalRatio = document.getElementById('home-goal-ratio');
    if (elGoalRatio) elGoalRatio.textContent = `${todayNewLearned} / ${dailyGoal}`;

    const elGoalPct = document.getElementById('home-goal-pct');
    if (elGoalPct) elGoalPct.textContent = `${goalPct}%`;

    // D. Từ cần ôn ngay & Đã học hôm nay
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

    // E. CTA Nổi Bật
    const btnHeroCta = document.getElementById('btn-home-hero-cta');
    const elCtaText = document.getElementById('home-hero-cta-text');
    const elEstTime = document.getElementById('home-estimated-time');

    if (btnHeroCta) {
      if (queueDue > 0) {
        if (elCtaText) elCtaText.textContent = `Ôn ${queueDue} từ ngay`;
        const estMin = Math.max(1, Math.ceil(queueDue * 0.5));
        if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút`;
        btnHeroCta.className = 'btn-hero-action cta-priority-due';

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession(null, null, null, { mode: 'due_only' });
          } catch (err) {
            console.error('Lỗi phiên ôn tập:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      } else if (todayNewLearned < dailyGoal) {
        if (elCtaText) elCtaText.textContent = `📚 Chọn chủ đề học từ mới`;
        if (elEstTime) elEstTime.textContent = `💡 Đã hết từ cần ôn • Còn ${remainingGoal} từ chỉ tiêu`;
        btnHeroCta.className = 'btn-hero-action cta-priority-learn';

        btnHeroCta.onclick = () => {
          try {
            app.switchTab('tab-decks');
          } catch (err) {
            console.error('Lỗi chuyển tab chủ đề:', err);
          }
        };
      } else {
        if (elCtaText) elCtaText.textContent = `✨ Khám phá thêm chủ đề mới`;
        if (elEstTime) elEstTime.textContent = `🎉 Đã hoàn thành chỉ tiêu ngày!`;
        btnHeroCta.className = 'btn-hero-action cta-priority-extra';

        btnHeroCta.onclick = () => {
          try {
            app.switchTab('tab-decks');
          } catch (err) {
            console.error('Lỗi chuyển tab chủ đề:', err);
          }
        };
      }
    }

    // 3. DỰ BÁO LỊCH ÔN 7 NGÀY TỚI (Minimalist & Crisp)
    const forecastContainer = document.getElementById('home-review-forecast');
    const forecastTotalBadge = document.getElementById('home-forecast-total');

    if (forecastContainer) {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfTodayMs = today.getTime();
      const oneDayMs = 86400000;
      const sevenDaysMs = 7 * oneDayMs;

      const forecastCounts = [queueDue, 0, 0, 0, 0, 0, 0];

      for (const card of allCards) {
        const state = StorageManager.getCardState(card.id);
        if (state && state.due && state.state !== State.New && state.state !== 0) {
          const dueMs = new Date(state.due).getTime();
          const diffMs = dueMs - startOfTodayMs;
          if (diffMs >= oneDayMs && diffMs < sevenDaysMs) {
            const dayIndex = Math.floor(diffMs / oneDayMs);
            if (dayIndex >= 1 && dayIndex < 7) {
              forecastCounts[dayIndex]++;
            }
          }
        }
      }

      let totalWeekDue = 0;
      const maxForecast = Math.max(...forecastCounts, 1);
      forecastContainer.innerHTML = '';

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const count = forecastCounts[i];
        totalWeekDue += count;

        const dayName = dayNames[d.getDay()];
        const label = i === 0 ? 'H.nay' : (i === 1 ? 'Mai' : dayName);
        const barWidthPct = count > 0 ? Math.min(100, Math.max(15, Math.round((count / maxForecast) * 100))) : 0;

        let loadClass = 'load-zero';
        if (count > 25) {
          loadClass = 'load-high';
        } else if (count > 10) {
          loadClass = 'load-med';
        } else if (count > 0) {
          loadClass = 'load-low';
        }

        const itemEl = document.createElement('div');
        itemEl.className = `forecast-smart-card ${i === 0 ? 'is-today' : ''} ${count > 0 ? 'has-due' : 'is-zero'}`;
        itemEl.title = `${label} (${d.getDate()}/${d.getMonth() + 1}): ${count} từ cần ôn. Chạm để xem chi tiết!`;

        itemEl.innerHTML = `
          <div class="fc-card-header">
            <span class="fc-card-day">${label}</span>
            <span class="fc-card-date">${d.getDate()}/${d.getMonth() + 1}</span>
          </div>
          <div class="fc-card-count ${count > 0 ? 'count-active ' + loadClass : ''}">${count}</div>
          <div class="fc-card-bar">
            <div class="fc-bar-fill ${count > 0 ? 'fill-active ' + loadClass : ''}" style="width: ${barWidthPct}%;"></div>
          </div>
        `;

        itemEl.onclick = () => {
          openCalendarForecastModal(app, d);
        };

        forecastContainer.appendChild(itemEl);
      }

      if (forecastTotalBadge) {
        forecastTotalBadge.textContent = `${totalWeekDue} từ / 7 ngày`;
      }

      const btnOpenCal = document.getElementById('btn-open-calendar-modal');
      if (btnOpenCal) {
        btnOpenCal.onclick = () => {
          openCalendarForecastModal(app, new Date());
        };
      }
    }

    // 4. LỊCH HỌC TẬP THEO NGÀY (Render Bảng Ô Vuông Heatmap & Summary Strip)
    const periodTitle = container.querySelector('#journal-period-title');
    if (periodTitle) {
      if (_viewMode === 'month') {
        periodTitle.textContent = `Tháng ${_currentMonth}, ${_currentYear}`;
      } else {
        periodTitle.textContent = `Năm ${_currentYear}`;
      }
    }

    const monthData = StatsManager.getMonthJournalData(_currentYear, _currentMonth);

    // Summary Strip
    const calSummaryText = container.querySelector('#journal-cal-summary-text');
    if (calSummaryText) {
      calSummaryText.innerHTML = `Tháng này: <strong>+${monthData.monthTotalWords}</strong> từ • <strong>${monthData.activeDaysCount}/${monthData.elapsedDays}</strong> ngày học • <strong>${monthData.winRate}%</strong> nhớ tốt`;
    }

    // Render Bảng Lịch Ô Vuông 7 Cột
    const grid = container.querySelector('#journal-calendar-grid');
    if (grid) {
      grid.innerHTML = '';
      const frag = document.createDocumentFragment();

      for (let i = 0; i < monthData.firstDayOfWeek; i++) {
        const padCell = document.createElement('div');
        padCell.className = 'calendar-day-cell cell-empty-padding';
        frag.appendChild(padCell);
      }

      monthData.days.forEach(dayObj => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `calendar-day-cell heat-${dayObj.heatLevel} ${dayObj.isToday ? 'is-today' : ''} ${dayObj.isFuture ? 'is-future' : ''}`;
        cell.dataset.dateKey = dayObj.dateKey;

        const countText = dayObj.count > 0 ? `+${dayObj.count}` : (dayObj.isFuture ? '' : '0');

        cell.innerHTML = `
          <div class="day-cell-top">
            <span class="day-number">${dayObj.day}</span>
            ${dayObj.isToday ? '<span class="today-dot"></span>' : ''}
          </div>
          <div class="day-cell-bottom">
            <span class="day-pnl-text">${countText}</span>
          </div>
        `;

        if (!dayObj.isFuture) {
          cell.addEventListener('mouseenter', () => showDayPopover(cell, dayObj));
          cell.addEventListener('mouseleave', () => hideDayPopover());
          cell.addEventListener('click', (e) => {
            e.stopPropagation();
            showDayPopover(cell, dayObj);
          });
        }

        frag.appendChild(cell);
      });

      grid.appendChild(frag);
    }

    // Render Ma Trận 12 Tháng Năm
    const yearGrid = container.querySelector('#journal-year-grid');
    if (yearGrid) {
      yearGrid.innerHTML = '';
      const yearData = StatsManager.getYearJournalData(_currentYear);
      const fragYear = document.createDocumentFragment();

      yearData.months.forEach(mObj => {
        const mCard = document.createElement('div');
        mCard.className = `year-month-card ${mObj.isCurrentMonth ? 'is-current' : ''}`;
        mCard.innerHTML = `
          <div class="year-month-header">
            <span class="year-month-name">${mObj.monthName}</span>
            <span class="year-month-words">${mObj.wordsCount > 0 ? '+' + mObj.wordsCount : '0'}</span>
          </div>
          <div class="year-month-bar">
            <div class="year-month-bar-fill" style="width: ${mObj.wordsCount > 0 ? Math.min(100, Math.max(8, Math.round((mObj.wordsCount / (yearData.maxMonthWords || 1)) * 100))) : 0}%;"></div>
          </div>
          <div class="year-month-footer">
            <span>${mObj.activeDays} ngày học</span>
            <span>${mObj.minutes}p</span>
          </div>
        `;

        mCard.onclick = () => {
          _currentMonth = mObj.month;
          _viewMode = 'month';
          const btnMonth = container.querySelector('#btn-mode-month');
          const btnYear = container.querySelector('#btn-mode-year');
          if (btnMonth) btnMonth.classList.add('active');
          if (btnYear) btnYear.classList.remove('active');
          const secMonth = container.querySelector('#journal-month-section');
          const secYear = container.querySelector('#journal-year-section');
          if (secMonth) secMonth.style.display = 'flex';
          if (secYear) secYear.style.display = 'none';
          renderReviewTab(app);
        };

        fragYear.appendChild(mCard);
      });

      yearGrid.appendChild(fragYear);
    }

  } catch (err) {
    console.error('Lỗi khi render Review Tab:', err);
  }
}

/**
 * Mở Modal Lịch Tháng Dự Báo Chi Tiết
 */
let _calViewingYear = new Date().getFullYear();
let _calViewingMonth = new Date().getMonth(); // 0-indexed
let _calSelectedDate = new Date();

export function openCalendarForecastModal(app, initialDate = new Date()) {
  let modal = document.getElementById('calendar-forecast-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'calendar-forecast-modal-overlay';
    modal.className = 'calendar-forecast-modal-overlay';
    document.body.appendChild(modal);
  }

  _calSelectedDate = new Date(initialDate);
  _calViewingYear = _calSelectedDate.getFullYear();
  _calViewingMonth = _calSelectedDate.getMonth();

  const renderModalContent = () => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const selectedDateKey = `${_calSelectedDate.getFullYear()}-${String(_calSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(_calSelectedDate.getDate()).padStart(2, '0')}`;

    const allCards = app.deckManager?.getAllCards() || [];
    const monthDueMap = new Map();

    const startOfMonth = new Date(_calViewingYear, _calViewingMonth, 1);
    const endOfMonth = new Date(_calViewingYear, _calViewingMonth + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      monthDueMap.set(dateKey, []);
    }

    allCards.forEach(card => {
      const state = StorageManager.getCardState(card.id);
      if (state && state.due && state.state !== State.New && state.state !== 0) {
        const dueDate = new Date(state.due);
        if (dueDate.getFullYear() === _calViewingYear && dueDate.getMonth() === _calViewingMonth) {
          const day = dueDate.getDate();
          const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (monthDueMap.has(dateKey)) {
            monthDueMap.get(dateKey).push({ card, state });
          }
        }
      }
    });

    let totalMonthDue = 0;
    let maxDueInSingleDay = 0;
    let daysWithReviews = 0;

    monthDueMap.forEach(cardsList => {
      const count = cardsList.length;
      totalMonthDue += count;
      if (count > 0) {
        daysWithReviews++;
        if (count > maxDueInSingleDay) maxDueInSingleDay = count;
      }
    });

    const firstDayIndex = startOfMonth.getDay();
    const startDayOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const prevMonthEnd = new Date(_calViewingYear, _calViewingMonth, 0);
    const prevMonthDays = prevMonthEnd.getDate();

    modal.innerHTML = `
      <div class="calendar-forecast-dialog">
        <!-- 1. Header Dialog & Close -->
        <div class="cal-modal-header">
          <div class="cal-modal-title-wrap">
            <span class="cal-modal-icon">📅</span>
            <div class="cal-modal-titles">
              <h3 class="cal-modal-title">Lịch Dự Báo Ôn Tập</h3>
              <p class="cal-modal-sub">Dự báo theo thuật toán FSRS-6</p>
            </div>
          </div>
          <button class="btn-cal-modal-close" id="btn-close-cal-modal" title="Đóng (Esc)" aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 2. Navigation Tháng & Năm -->
        <div class="cal-nav-bar">
          <button class="btn-cal-nav" id="btn-cal-prev-month" title="Tháng trước">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div class="cal-nav-center">
            <span class="cal-nav-month">${monthNames[_calViewingMonth]} ${_calViewingYear}</span>
            <button class="btn-cal-today-jump" id="btn-cal-today-jump">Hôm nay</button>
          </div>

          <button class="btn-cal-nav" id="btn-cal-next-month" title="Tháng sau">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <!-- 3. Mini Summary Pills -->
        <div class="cal-summary-pills">
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Tổng ôn tháng:</span>
            <strong class="cal-sum-val">${totalMonthDue} từ</strong>
          </div>
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Ngày có bài:</span>
            <strong class="cal-sum-val">${daysWithReviews} / ${daysInMonth} ngày</strong>
          </div>
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Cao điểm nhất:</span>
            <strong class="cal-sum-val">${maxDueInSingleDay} từ/ngày</strong>
          </div>
        </div>

        <!-- 4. Calendar Month Grid Table -->
        <div class="cal-grid-container">
          <div class="cal-weekdays-header">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>

          <div class="cal-days-grid" id="cal-days-grid">
            <!-- Grid cells generated dynamically -->
          </div>
        </div>

        <!-- 5. Selected Day Detail Drawer / Inspector -->
        <div class="cal-day-inspector" id="cal-day-inspector">
          <!-- Inspector content generated dynamically -->
        </div>
      </div>
    `;

    // Render các ô ngày vào Grid
    const daysGrid = modal.querySelector('#cal-days-grid');
    if (daysGrid) {
      const frag = document.createDocumentFragment();

      // A. Ngày mờ của tháng trước
      for (let i = startDayOffset - 1; i >= 0; i--) {
        const prevDayNum = prevMonthDays - i;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell is-other-month';
        cell.innerHTML = `<span class="cal-day-num">${prevDayNum}</span>`;
        frag.appendChild(cell);
      }

      // B. Toàn bộ 28 - 31 ngày của tháng hiện tại
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDateKey;
        const dayCards = monthDueMap.get(dateKey) || [];
        const count = dayCards.length;

        let loadClass = 'load-zero';
        if (count > 0 && count <= 3) loadClass = 'load-low';
        else if (count > 3 && count <= 8) loadClass = 'load-medium';
        else if (count > 8) loadClass = 'load-high';

        const cell = document.createElement('div');
        cell.className = `cal-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${loadClass}`;
        cell.setAttribute('data-date-key', dateKey);
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');

        cell.innerHTML = `
          <div class="cal-day-cell-top">
            <span class="cal-day-num">${day}</span>
            ${isToday ? '<span class="cal-today-badge" title="Hôm nay">Nay</span>' : ''}
          </div>
          <div class="cal-day-cell-bottom">
            ${count > 0 ? `<span class="cal-count-badge">${count}</span>` : '<span class="cal-empty-dot">·</span>'}
          </div>
        `;

        cell.onclick = () => {
          _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, day);
          renderModalContent();
        };

        frag.appendChild(cell);
      }

      // C. Ngày mờ của tháng sau để hoàn thành hàng lưới 35 hoặc 42 ô
      const totalRendered = startDayOffset + daysInMonth;
      const targetTotal = totalRendered <= 35 ? 35 : 42;
      const remainingCells = targetTotal - totalRendered;
      for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell is-other-month';
        cell.innerHTML = `<span class="cal-day-num">${nextDay}</span>`;
        frag.appendChild(cell);
      }

      daysGrid.appendChild(frag);
    }

    // Render Khung Chi Tiết Ngày Đang Chọn
    const inspector = modal.querySelector('#cal-day-inspector');
    if (inspector) {
      const selDay = _calSelectedDate.getDate();
      const selMonth = _calSelectedDate.getMonth() + 1;
      const selYear = _calSelectedDate.getFullYear();
      const selDateFormatted = `${String(selDay).padStart(2, '0')}/${String(selMonth).padStart(2, '0')}/${selYear}`;
      const dayCards = monthDueMap.get(selectedDateKey) || [];
      const isSelectedToday = selectedDateKey === todayKey;

      let inspectorHtml = `
        <div class="inspector-header">
          <div class="inspector-header-left">
            <div class="inspector-date-title">Ngày ${selDateFormatted}</div>
            <div class="inspector-tags-row">
              ${isSelectedToday ? '<span class="inspector-today-tag">Hôm nay</span>' : ''}
              <span class="inspector-count-tag">${dayCards.length} từ đến hạn ôn</span>
            </div>
          </div>
          ${dayCards.length > 0 ? `
            <button class="btn-inspector-study" id="btn-inspector-study-day">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Ôn ${dayCards.length} từ này</span>
            </button>
          ` : ''}
        </div>
      `;

      if (dayCards.length === 0) {
        inspectorHtml += `
          <div class="inspector-empty">
            <span class="inspector-empty-icon">✨</span>
            <p class="inspector-empty-text">Không có từ vựng nào đến hạn ôn trong ngày này.</p>
          </div>
        `;
      } else {
        inspectorHtml += `<div class="inspector-words-list">`;
        dayCards.forEach(({ card, state }) => {
          const cefr = (card.cefr || card.level || 'A1').toLowerCase();
          const s = state?.stability ? Number(state.stability).toFixed(1) : '0';
          const phonetic = card.phonetic || card.ipa || '';

          inspectorHtml += `
            <div class="inspector-word-item" data-word="${escapeHTML(card.word || '')}">
              <button class="btn-inspector-sound" data-word="${escapeHTML(card.word || '')}" title="Phát âm" aria-label="Phát âm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
              <div class="inspector-word-info">
                <div class="inspector-word-top">
                  <strong class="inspector-word-text">${escapeHTML(card.word || '')}</strong>
                  ${phonetic ? `<span class="inspector-word-ipa">${escapeHTML(phonetic)}</span>` : ''}
                  <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
                </div>
                <div class="inspector-word-meaning">${escapeHTML(card.meaning || '')}</div>
              </div>
              <div class="inspector-word-stability" title="Độ bền trí nhớ FSRS (Stability)">
                <span>S: ${s}d</span>
              </div>
            </div>
          `;
        });
        inspectorHtml += `</div>`;
      }

      inspector.innerHTML = inspectorHtml;

      // Event: Phát âm từ vựng trong inspector
      inspector.querySelectorAll('.btn-inspector-sound').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const w = btn.getAttribute('data-word');
          if (w) {
            btn.classList.add('playing');
            speak(w);
            setTimeout(() => btn.classList.remove('playing'), 1200);
          }
        };
      });

      // Event: Ôn tập danh sách từ của ngày này
      const btnStudyDay = inspector.querySelector('#btn-inspector-study-day');
      if (btnStudyDay && dayCards.length > 0) {
        btnStudyDay.onclick = () => {
          closeModal();
          app.startStudySession(null, null, dayCards.map(d => d.card));
        };
      }
    }

    // Điều hướng Tháng trước / Tháng sau / Hôm nay
    const btnPrev = modal.querySelector('#btn-cal-prev-month');
    const btnNext = modal.querySelector('#btn-cal-next-month');
    const btnToday = modal.querySelector('#btn-cal-today-jump');

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (_calViewingMonth === 0) {
          _calViewingMonth = 11;
          _calViewingYear--;
        } else {
          _calViewingMonth--;
        }
        _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, 1);
        renderModalContent();
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        if (_calViewingMonth === 11) {
          _calViewingMonth = 0;
          _calViewingYear++;
        } else {
          _calViewingMonth++;
        }
        _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, 1);
        renderModalContent();
      };
    }

    if (btnToday) {
      btnToday.onclick = () => {
        const now = new Date();
        _calSelectedDate = now;
        _calViewingYear = now.getFullYear();
        _calViewingMonth = now.getMonth();
        renderModalContent();
      };
    }

    const btnClose = modal.querySelector('#btn-close-cal-modal');
    if (btnClose) btnClose.onclick = closeModal;
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  renderModalContent();
}
